import { Injectable, inject } from '@angular/core';

import { SignalStore } from '../../../core/state/signal-store';
import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { EmotionType } from '../../../shared/models/emotion-type.model';
import { Intensity } from '../../../shared/models/intensity.model';
import { EmergencyEvent } from '../models/emergency-event.model';
import { EmergencyEventRepository } from '../repositories/emergency-event.repository';

export interface StartEventInput {
  readonly situation: string;
  readonly emotion: EmotionType;
  readonly intensity: Intensity;
  readonly need: string;
}

interface EmergencyState {
  readonly activeEvent: EmergencyEvent | null;
  readonly history: readonly EmergencyEvent[];
  readonly isLoading: boolean;
}

const INITIAL_STATE: EmergencyState = {
  activeEvent: null,
  history: [],
  isLoading: false,
};

@Injectable()
export class EmergencyStore extends SignalStore<EmergencyState> {
  private readonly eventRepository = inject(EmergencyEventRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  readonly activeEvent = this.select((state) => state.activeEvent);
  readonly history = this.select((state) => state.history);
  readonly isLoading = this.select((state) => state.isLoading);

  constructor() {
    super(INITIAL_STATE);
  }

  async loadHistory(): Promise<void> {
    this.patch({ isLoading: true });
    const history = await this.eventRepository.findAll();
    this.patch({ history, isLoading: false });
  }

  async startEvent(input: StartEventInput): Promise<void> {
    const event: EmergencyEvent = {
      id: this.idGenerator.generate(),
      createdAt: this.clock.now(),
      situation: input.situation,
      emotion: input.emotion,
      intensity: input.intensity,
      need: input.need,
      techniquesUsed: [],
      waitingModeActivated: false,
      resolvedAt: null,
    };
    await this.eventRepository.save(event);
    this.patch({ activeEvent: event });
  }

  async recordToolUsed(toolId: string): Promise<void> {
    const current = this.snapshot.activeEvent;
    if (!current || current.techniquesUsed.includes(toolId)) {
      return;
    }
    const updated: EmergencyEvent = {
      ...current,
      techniquesUsed: [...current.techniquesUsed, toolId],
    };
    await this.eventRepository.save(updated);
    this.patch({ activeEvent: updated });
  }

  /** Marca que se activó un bloqueo para este evento (ver BlockingSessionStore). */
  async markWaitingModeActivated(): Promise<void> {
    const current = this.snapshot.activeEvent;
    if (!current) {
      return;
    }
    const updated: EmergencyEvent = { ...current, waitingModeActivated: true };
    await this.eventRepository.save(updated);
    this.patch({ activeEvent: updated });
  }

  async resolveActiveEvent(): Promise<void> {
    const current = this.snapshot.activeEvent;
    if (!current) {
      return;
    }
    const resolved: EmergencyEvent = { ...current, resolvedAt: this.clock.now() };
    await this.eventRepository.save(resolved);
    this.patch({ activeEvent: null });
  }

  clearActiveEvent(): void {
    this.patch({ activeEvent: null });
  }
}
