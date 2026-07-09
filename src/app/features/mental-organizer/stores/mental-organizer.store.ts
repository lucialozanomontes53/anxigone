import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import { BrainDumpCategory, BrainDumpItem } from '../models/brain-dump-item.model';
import { BrainDumpItemRepository } from '../repositories/brain-dump-item.repository';

interface MentalOrganizerState {
  readonly items: readonly BrainDumpItem[];
  readonly isLoading: boolean;
}

const INITIAL_STATE: MentalOrganizerState = {
  items: [],
  isLoading: false,
};

@Injectable()
export class MentalOrganizerStore extends SignalStore<MentalOrganizerState> {
  private readonly repository = inject(BrainDumpItemRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  private readonly activeItems = this.select((state) =>
    state.items.filter((item) => item.resolvedAt === null),
  );
  readonly isLoading = this.select((state) => state.isLoading);

  readonly unclassifiedItems = this.select(() =>
    this.activeItems().filter((item) => item.category === null),
  );
  readonly actionItems = this.byCategory('action');
  readonly waitingItems = this.byCategory('waiting');
  readonly notMyControlItems = this.byCategory('not-my-control');
  readonly releaseItems = this.byCategory('release');

  constructor() {
    super(INITIAL_STATE);
  }

  async loadItems(): Promise<void> {
    this.patch({ isLoading: true });
    const items = await this.repository.findAll();
    this.patch({ items, isLoading: false });
  }

  async addItem(content: string): Promise<void> {
    const item: BrainDumpItem = {
      id: this.idGenerator.generate(),
      content,
      category: null,
      createdAt: this.clock.now(),
      resolvedAt: null,
    };
    await this.repository.save(item);
    this.patch({ items: [...this.snapshot.items, item] });
  }

  async classify(id: string, category: BrainDumpCategory): Promise<void> {
    await this.updateItem(id, { category });
  }

  async resolveItem(id: string): Promise<void> {
    await this.updateItem(id, { resolvedAt: this.clock.now() });
  }

  async deleteItem(id: string): Promise<void> {
    await this.repository.deleteById(id);
    this.patch({ items: this.snapshot.items.filter((item) => item.id !== id) });
  }

  private async updateItem(id: string, changes: Partial<BrainDumpItem>): Promise<void> {
    const current = this.snapshot.items.find((item) => item.id === id);
    if (!current) {
      return;
    }
    const updated: BrainDumpItem = { ...current, ...changes };
    await this.repository.save(updated);
    this.patch({
      items: this.snapshot.items.map((item) => (item.id === id ? updated : item)),
    });
  }

  private byCategory(category: BrainDumpCategory) {
    return this.select(() => this.activeItems().filter((item) => item.category === category));
  }
}
