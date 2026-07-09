import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { JournalEntryFormComponent } from '../components/journal-entry-form.component';
import { JournalEntryListComponent } from '../components/journal-entry-list.component';
import { CreateJournalEntryInput, JournalStore } from '../stores/journal.store';

@Component({
  selector: 'app-journal-page',
  imports: [JournalEntryFormComponent, JournalEntryListComponent],
  templateUrl: './journal.page.html',
  styleUrl: './journal.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalPage {
  protected readonly store = inject(JournalStore);

  constructor() {
    void this.store.loadEntries();
  }

  protected async onSubmitted(input: CreateJournalEntryInput): Promise<void> {
    await this.store.addEntry(input);
  }

  protected async onDeleted(id: string): Promise<void> {
    await this.store.deleteEntry(id);
  }
}
