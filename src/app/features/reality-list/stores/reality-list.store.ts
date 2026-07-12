import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import { RealityPhrase } from '../models/reality-phrase.model';
import { RealityPhraseRepository } from '../repositories/reality-phrase.repository';

interface RealityListState {
  readonly phrases: readonly RealityPhrase[];
  readonly isLoading: boolean;
}

const INITIAL_STATE: RealityListState = { phrases: [], isLoading: false };

function byMostRecentFirst(a: RealityPhrase, b: RealityPhrase): number {
  return b.createdAt.localeCompare(a.createdAt);
}

@Injectable()
export class RealityListStore extends SignalStore<RealityListState> {
  private readonly repository = inject(RealityPhraseRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  readonly phrases = this.select((state) => [...state.phrases].sort(byMostRecentFirst));
  readonly favoritePhrases = this.select((state) => state.phrases.filter((phrase) => phrase.isFavorite));
  readonly priorityPhrases = this.select((state) => state.phrases.filter((phrase) => phrase.isPriority));
  readonly isLoading = this.select((state) => state.isLoading);

  constructor() {
    super(INITIAL_STATE);
  }

  async loadPhrases(): Promise<void> {
    this.patch({ isLoading: true });
    const phrases = await this.repository.findAll();
    this.patch({ phrases, isLoading: false });
  }

  async addPhrase(text: string): Promise<void> {
    const phrase: RealityPhrase = {
      id: this.idGenerator.generate(),
      text,
      isFavorite: false,
      isPriority: false,
      createdAt: this.clock.now(),
    };
    await this.repository.save(phrase);
    this.patch({ phrases: [...this.snapshot.phrases, phrase] });
  }

  async toggleFavorite(id: string): Promise<void> {
    await this.updatePhrase(id, (phrase) => ({ ...phrase, isFavorite: !phrase.isFavorite }));
  }

  async togglePriority(id: string): Promise<void> {
    await this.updatePhrase(id, (phrase) => ({ ...phrase, isPriority: !phrase.isPriority }));
  }

  async deletePhrase(id: string): Promise<void> {
    await this.repository.deleteById(id);
    this.patch({ phrases: this.snapshot.phrases.filter((phrase) => phrase.id !== id) });
  }

  private async updatePhrase(
    id: string,
    updater: (phrase: RealityPhrase) => RealityPhrase,
  ): Promise<void> {
    const current = this.snapshot.phrases.find((phrase) => phrase.id === id);
    if (!current) {
      return;
    }
    const updated = updater(current);
    await this.repository.save(updated);
    this.patch({
      phrases: this.snapshot.phrases.map((phrase) => (phrase.id === id ? updated : phrase)),
    });
  }
}
