import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { SignalStore } from '../../../core/state/signal-store';
import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { RuminationStopSession } from '../models/rumination-stop-session.model';

interface RuminationStopState {
  readonly session: RuminationStopSession | null;
}

/**
 * Root-scoped y sin repositorio: la sesión es efímera (nunca se persiste), pero debe
 * sobrevivir a la navegación para que el aviso global (`RuminationStopBannerComponent`)
 * y la pantalla dedicada compartan el mismo estado, igual que `BlockingSessionStore`
 * (ADR-15) aunque sin necesidad de IndexedDB.
 */
@Injectable({ providedIn: 'root' })
export class RuminationStopStore extends SignalStore<RuminationStopState> {
  private readonly clock = inject(ClockService);

  readonly activeSession = this.select((state) => state.session);

  constructor() {
    super({ session: null });
  }

  start(durationMin: number): void {
    const startedAt = this.clock.now();
    const endsAt = toISODateString(new Date(new Date(startedAt).getTime() + durationMin * 60_000));
    this.patch({ session: { startedAt, durationMin, endsAt } });
  }

  end(): void {
    this.patch({ session: null });
  }
}
