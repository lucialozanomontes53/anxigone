import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import { ISODateString } from '../../../shared/models/iso-date-string.model';
import {
  UncertaintyEntry,
  UncertaintyReview,
  deriveUncertaintyStatus,
} from '../models/uncertainty-entry.model';
import { UncertaintyEntryRepository } from '../repositories/uncertainty-entry.repository';

interface UncertaintyBoxState {
  readonly entries: readonly UncertaintyEntry[];
  readonly referenceNow: ISODateString;
  readonly isLoading: boolean;
}

export interface ReviewStats {
  readonly total: number;
  readonly resolvedItselfPct: number;
  readonly stillImportantPct: number;
  readonly asSeriousAsExpectedPct: number;
}

function byRevisitAtAscending(a: UncertaintyEntry, b: UncertaintyEntry): number {
  return a.revisitAt.localeCompare(b.revisitAt);
}

function byReviewedAtDescending(a: UncertaintyEntry, b: UncertaintyEntry): number {
  return (b.reviewedAt ?? '').localeCompare(a.reviewedAt ?? '');
}

function percentage(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

@Injectable()
export class UncertaintyBoxStore extends SignalStore<UncertaintyBoxState> {
  private readonly repository = inject(UncertaintyEntryRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  private readonly statusOf = (entry: UncertaintyEntry) =>
    deriveUncertaintyStatus(entry, this.snapshot.referenceNow);

  readonly isLoading = this.select((state) => state.isLoading);

  readonly sealedEntries = this.select((state) =>
    state.entries
      .filter((entry) => deriveUncertaintyStatus(entry, state.referenceNow) === 'sealed')
      .sort(byRevisitAtAscending),
  );

  readonly unlockedPendingEntries = this.select((state) =>
    state.entries
      .filter((entry) => deriveUncertaintyStatus(entry, state.referenceNow) === 'unlockable')
      .sort(byRevisitAtAscending),
  );

  readonly reviewedEntries = this.select((state) =>
    state.entries
      .filter((entry) => deriveUncertaintyStatus(entry, state.referenceNow) === 'reviewed')
      .sort(byReviewedAtDescending),
  );

  readonly reviewStats = this.select((state): ReviewStats => {
    const reviewed = state.entries.filter(
      (entry) => deriveUncertaintyStatus(entry, state.referenceNow) === 'reviewed' && entry.review,
    );
    const total = reviewed.length;
    const resolvedItself = reviewed.filter((entry) => entry.review?.resolvedItself).length;
    const stillImportant = reviewed.filter((entry) => entry.review?.stillImportant).length;
    const asSeriousAsExpected = reviewed.filter((entry) => entry.review?.asSeriousAsExpected).length;
    return {
      total,
      resolvedItselfPct: percentage(resolvedItself, total),
      stillImportantPct: percentage(stillImportant, total),
      asSeriousAsExpectedPct: percentage(asSeriousAsExpected, total),
    };
  });

  constructor() {
    super({ entries: [], referenceNow: inject(ClockService).now(), isLoading: false });
  }

  async loadEntries(): Promise<void> {
    this.patch({ isLoading: true, referenceNow: this.clock.now() });
    const entries = await this.repository.findAll();
    this.patch({ entries, isLoading: false });
  }

  async addEntry(worryText: string, revisitAt: ISODateString): Promise<void> {
    const entry: UncertaintyEntry = {
      id: this.idGenerator.generate(),
      worryText,
      createdAt: this.clock.now(),
      revisitAt,
      review: null,
      reviewedAt: null,
    };
    await this.repository.save(entry);
    this.patch({ entries: [...this.snapshot.entries, entry] });
  }

  /** No hace nada si la entrada todavía está sellada: el sellado se impone aquí, no solo en la plantilla (ver ADR-18). */
  async reviewEntry(id: string, review: UncertaintyReview): Promise<void> {
    const entry = this.snapshot.entries.find((candidate) => candidate.id === id);
    if (!entry || this.statusOf(entry) !== 'unlockable') {
      return;
    }
    const reviewed: UncertaintyEntry = { ...entry, review, reviewedAt: this.clock.now() };
    await this.repository.save(reviewed);
    this.patch({
      entries: this.snapshot.entries.map((candidate) => (candidate.id === id ? reviewed : candidate)),
    });
  }
}
