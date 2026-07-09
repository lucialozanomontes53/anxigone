import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { BrainDumpCategory } from '../models/brain-dump-item.model';
import { BrainDumpColumnComponent } from '../components/brain-dump-column.component';
import { BrainDumpInboxComponent } from '../components/brain-dump-inbox.component';
import { MentalOrganizerStore } from '../stores/mental-organizer.store';

@Component({
  selector: 'app-mental-organizer-page',
  imports: [BrainDumpInboxComponent, BrainDumpColumnComponent],
  templateUrl: './mental-organizer.page.html',
  styleUrl: './mental-organizer.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentalOrganizerPage {
  protected readonly store = inject(MentalOrganizerStore);

  constructor() {
    void this.store.loadItems();
  }

  protected async onAdded(content: string): Promise<void> {
    await this.store.addItem(content);
  }

  protected async onClassified(event: { id: string; category: BrainDumpCategory }): Promise<void> {
    await this.store.classify(event.id, event.category);
  }

  protected async onResolved(id: string): Promise<void> {
    await this.store.resolveItem(id);
  }

  protected async onDeleted(id: string): Promise<void> {
    await this.store.deleteItem(id);
  }
}
