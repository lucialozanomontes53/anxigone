import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import { ISODateString } from '../../../shared/models/iso-date-string.model';
import { Victory, computeCurrentStreak, countWithinDays } from '../models/victory.model';
import { VictoryRepository } from '../repositories/victory.repository';

interface VictoriesState {
  readonly victories: readonly Victory[];
  readonly referenceNow: ISODateString;
  readonly isLoading: boolean;
}

function byMostRecentFirst(a: Victory, b: Victory): number {
  return b.occurredAt.localeCompare(a.occurredAt);
}

@Injectable()
export class VictoriesStore extends SignalStore<VictoriesState> {
  private readonly repository = inject(VictoryRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  readonly victories = this.select((state) => [...state.victories].sort(byMostRecentFirst));
  readonly isLoading = this.select((state) => state.isLoading);
  readonly totalCount = this.select((state) => state.victories.length);
  readonly weekCount = this.select((state) => countWithinDays(state.victories, state.referenceNow, 7));
  readonly monthCount = this.select((state) => countWithinDays(state.victories, state.referenceNow, 30));
  readonly currentStreak = this.select((state) => computeCurrentStreak(state.victories, state.referenceNow));

  constructor() {
    super({ victories: [], referenceNow: inject(ClockService).now(), isLoading: false });
  }

  async loadVictories(): Promise<void> {
    this.patch({ isLoading: true, referenceNow: this.clock.now() });
    const victories = await this.repository.findAll();
    this.patch({ victories, isLoading: false });
  }

  async addVictory(text: string): Promise<void> {
    const victory: Victory = {
      id: this.idGenerator.generate(),
      text,
      occurredAt: this.clock.now(),
    };
    await this.repository.save(victory);
    this.patch({ victories: [...this.snapshot.victories, victory] });
  }

  async deleteVictory(id: string): Promise<void> {
    await this.repository.deleteById(id);
    this.patch({ victories: this.snapshot.victories.filter((victory) => victory.id !== id) });
  }
}
