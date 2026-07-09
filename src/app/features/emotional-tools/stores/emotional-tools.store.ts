import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import { ToolSession, ToolType } from '../models/tool-session.model';
import { ToolSessionRepository } from '../repositories/tool-session.repository';

interface EmotionalToolsState {
  readonly sessions: readonly ToolSession[];
  readonly isLoading: boolean;
}

const INITIAL_STATE: EmotionalToolsState = {
  sessions: [],
  isLoading: false,
};

@Injectable()
export class EmotionalToolsStore extends SignalStore<EmotionalToolsState> {
  private readonly repository = inject(ToolSessionRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  readonly sessions = this.select((state) => state.sessions);
  readonly isLoading = this.select((state) => state.isLoading);
  readonly sessionCount = this.select((state) => state.sessions.length);

  constructor() {
    super(INITIAL_STATE);
  }

  async loadHistory(): Promise<void> {
    this.patch({ isLoading: true });
    const sessions = await this.repository.findAll();
    this.patch({ sessions, isLoading: false });
  }

  async recordSession(toolType: ToolType, techniqueId: string, durationSec: number): Promise<void> {
    const session: ToolSession = {
      id: this.idGenerator.generate(),
      toolType,
      techniqueId,
      durationSec: Math.max(0, Math.round(durationSec)),
      completedAt: this.clock.now(),
    };
    await this.repository.save(session);
    this.patch({ sessions: [...this.snapshot.sessions, session] });
  }
}
