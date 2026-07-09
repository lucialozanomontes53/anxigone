import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { BrainDumpItemRepository } from './brain-dump-item.repository';

export const BRAIN_DUMP_ITEMS_STORE = 'brainDumpItems';

@Injectable()
export class BrainDumpItemIndexedDbRepository extends BrainDumpItemRepository {
  constructor() {
    super(inject(IndexedDbAdapter), BRAIN_DUMP_ITEMS_STORE);
  }
}
