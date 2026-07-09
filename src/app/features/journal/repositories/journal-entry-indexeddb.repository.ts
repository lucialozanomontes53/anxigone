import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { JournalEntryRepository } from './journal-entry.repository';

export const JOURNAL_ENTRIES_STORE = 'journalEntries';

@Injectable()
export class JournalEntryIndexedDbRepository extends JournalEntryRepository {
  constructor() {
    super(inject(IndexedDbAdapter), JOURNAL_ENTRIES_STORE);
  }
}
