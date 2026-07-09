import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import { EmotionType } from '../../../shared/models/emotion-type.model';
import { Intensity } from '../../../shared/models/intensity.model';
import { JournalEntry } from '../models/journal-entry.model';
import { JournalEntryRepository } from '../repositories/journal-entry.repository';

export interface CreateJournalEntryInput {
  readonly emotion: EmotionType;
  readonly intensity: Intensity;
  readonly situation: string;
  readonly facts: string;
  readonly interpretations: string;
  readonly fears: string;
  readonly alternatives: string;
  readonly needs: string;
}

interface JournalState {
  readonly entries: readonly JournalEntry[];
  readonly isLoading: boolean;
}

const INITIAL_STATE: JournalState = {
  entries: [],
  isLoading: false,
};

function byMostRecentFirst(a: JournalEntry, b: JournalEntry): number {
  return b.date.localeCompare(a.date);
}

@Injectable()
export class JournalStore extends SignalStore<JournalState> {
  private readonly repository = inject(JournalEntryRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  readonly entries = this.select((state) => [...state.entries].sort(byMostRecentFirst));
  readonly isLoading = this.select((state) => state.isLoading);
  readonly entryCount = this.select((state) => state.entries.length);

  constructor() {
    super(INITIAL_STATE);
  }

  async loadEntries(): Promise<void> {
    this.patch({ isLoading: true });
    const entries = await this.repository.findAll();
    this.patch({ entries, isLoading: false });
  }

  async addEntry(input: CreateJournalEntryInput): Promise<void> {
    const entry: JournalEntry = {
      id: this.idGenerator.generate(),
      date: this.clock.now(),
      ...input,
    };
    await this.repository.save(entry);
    this.patch({ entries: [...this.snapshot.entries, entry] });
  }

  async deleteEntry(id: string): Promise<void> {
    await this.repository.deleteById(id);
    this.patch({ entries: this.snapshot.entries.filter((entry) => entry.id !== id) });
  }
}
