import { Routes } from '@angular/router';

import { JournalEntryIndexedDbRepository } from './repositories/journal-entry-indexeddb.repository';
import { JournalEntryRepository } from './repositories/journal-entry.repository';
import { JournalStore } from './stores/journal.store';

export const JOURNAL_ROUTES: Routes = [
  {
    path: '',
    providers: [
      JournalStore,
      { provide: JournalEntryRepository, useClass: JournalEntryIndexedDbRepository },
    ],
    loadComponent: () => import('./pages/journal.page').then((m) => m.JournalPage),
  },
];
