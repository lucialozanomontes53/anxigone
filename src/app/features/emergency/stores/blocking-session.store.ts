import { DestroyRef, Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import { toISODateString } from '../../../shared/models/iso-date-string.model';
import {
  BlockingMode,
  BlockingReflection,
  BlockingSession,
} from '../models/blocking-session.model';
import { BlockingSessionRepository } from '../repositories/blocking-session.repository';

export interface StartBlockingSessionInput {
  readonly mode: BlockingMode;
  readonly reason: string;
  readonly blockedApps: readonly string[];
  readonly durationMin: number;
  readonly emergencyEventId?: string | null;
}

interface BlockingSessionState {
  readonly activeSession: BlockingSession | null;
  readonly history: readonly BlockingSession[];
  readonly isLoading: boolean;
}

const INITIAL_STATE: BlockingSessionState = {
  activeSession: null,
  history: [],
  isLoading: false,
};

/**
 * Root-scoped a propósito (ver ADR-14 en CLAUDE.md): una sesión activa debe
 * sobrevivir a la navegación entre features, así que no puede depender del
 * injector de una ruta concreta como el resto de stores de `emergency`.
 */
@Injectable({ providedIn: 'root' })
export class BlockingSessionStore extends SignalStore<BlockingSessionState> {
  private readonly repository = inject(BlockingSessionRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  readonly activeSession = this.select((state) => state.activeSession);
  readonly isShieldedActive = this.select((state) => state.activeSession?.mode === 'shielded');
  readonly history = this.select((state) => state.history);

  readonly totalAttempts = this.select((state) =>
    state.history.reduce((sum, session) => sum + session.attemptCount, 0),
  );

  readonly topBlockedApps = this.select((state) => {
    const counts = new Map<string, number>();
    for (const session of state.history) {
      for (const app of session.blockedApps) {
        counts.set(app, (counts.get(app) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([app, count]) => ({ app, count }));
  });

  readonly mostImpulsiveHour = this.select((state) => {
    const countsByHour = new Map<number, number>();
    for (const session of state.history) {
      const hour = new Date(session.startedAt).getHours();
      countsByHour.set(hour, (countsByHour.get(hour) ?? 0) + session.attemptCount);
    }
    let bestHour: number | null = null;
    let bestCount = 0;
    for (const [hour, count] of countsByHour) {
      if (count > bestCount) {
        bestHour = hour;
        bestCount = count;
      }
    }
    return bestHour;
  });

  /**
   * Los listeners de "intento de fuga" solo se enganchan mientras hay una
   * sesión activa (ver `attachLeaveDeterrents`/`detachLeaveDeterrents`), no
   * durante toda la vida de la app: evita coste global innecesario y, en
   * tests, evita que instancias de sesiones anteriores sigan reaccionando a
   * eventos del `document`/`window` compartido tras terminar.
   */
  private readonly onLeaveAttempt = (): void => {
    if (this.snapshot.activeSession) {
      void this.recordAttempt();
    }
  };
  private readonly onBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (this.snapshot.activeSession?.mode === 'shielded') {
      event.preventDefault();
      event.returnValue = '';
    }
  };
  private deterrentsAttached = false;

  constructor() {
    super(INITIAL_STATE);
    inject(DestroyRef).onDestroy(() => this.detachLeaveDeterrents());
  }

  async loadActiveSession(): Promise<void> {
    this.patch({ isLoading: true });
    const all = await this.repository.findAll();
    const active = all.find((session) => session.status === 'active') ?? null;
    const history = all.filter((session) => session.status !== 'active');
    this.patch({ activeSession: active, history, isLoading: false });
    if (active) {
      this.attachLeaveDeterrents();
    }
  }

  async startSession(input: StartBlockingSessionInput): Promise<void> {
    if (this.snapshot.activeSession) {
      return;
    }
    const startedAt = this.clock.now();
    const endsAt = toISODateString(
      new Date(new Date(startedAt).getTime() + input.durationMin * 60_000),
    );
    const session: BlockingSession = {
      id: this.idGenerator.generate(),
      emergencyEventId: input.emergencyEventId ?? null,
      mode: input.mode,
      reason: input.reason,
      blockedApps: input.blockedApps,
      durationMin: input.durationMin,
      startedAt,
      endsAt,
      status: 'active',
      attemptCount: 0,
      reflection: null,
    };
    await this.repository.save(session);
    this.patch({ activeSession: session });
    this.attachLeaveDeterrents();
  }

  async recordAttempt(): Promise<void> {
    const current = this.snapshot.activeSession;
    if (!current) {
      return;
    }
    const updated: BlockingSession = { ...current, attemptCount: current.attemptCount + 1 };
    await this.repository.save(updated);
    this.patch({ activeSession: updated });
  }

  /** No hace nada si el modo es "shielded": el compromiso no se puede romper desde el store. */
  async cancelSession(): Promise<void> {
    const current = this.snapshot.activeSession;
    if (!current || current.mode === 'shielded') {
      return;
    }
    const cancelled: BlockingSession = { ...current, status: 'cancelled' };
    await this.repository.save(cancelled);
    this.patch({ activeSession: null, history: [...this.snapshot.history, cancelled] });
    this.detachLeaveDeterrents();
  }

  async completeSession(reflection: BlockingReflection): Promise<void> {
    const current = this.snapshot.activeSession;
    if (!current) {
      return;
    }
    const completed: BlockingSession = { ...current, status: 'completed', reflection };
    await this.repository.save(completed);
    this.patch({ activeSession: null, history: [...this.snapshot.history, completed] });
    this.detachLeaveDeterrents();
  }

  private attachLeaveDeterrents(): void {
    if (this.deterrentsAttached) {
      return;
    }
    this.deterrentsAttached = true;
    document.addEventListener('visibilitychange', this.onLeaveAttempt);
    window.addEventListener('blur', this.onLeaveAttempt);
    window.addEventListener('beforeunload', this.onBeforeUnload);
  }

  private detachLeaveDeterrents(): void {
    if (!this.deterrentsAttached) {
      return;
    }
    this.deterrentsAttached = false;
    document.removeEventListener('visibilitychange', this.onLeaveAttempt);
    window.removeEventListener('blur', this.onLeaveAttempt);
    window.removeEventListener('beforeunload', this.onBeforeUnload);
  }
}
