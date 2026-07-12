import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { UncertaintyEntryRepository } from './uncertainty-entry.repository';

export const UNCERTAINTY_ENTRIES_STORE = 'uncertaintyEntries';

@Injectable()
export class UncertaintyEntryIndexedDbRepository extends UncertaintyEntryRepository {
  constructor() {
    super(inject(IndexedDbAdapter), UNCERTAINTY_ENTRIES_STORE);
  }
}
