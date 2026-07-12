import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { VictoryRepository } from './victory.repository';

export const VICTORIES_STORE = 'victories';

@Injectable()
export class VictoryIndexedDbRepository extends VictoryRepository {
  constructor() {
    super(inject(IndexedDbAdapter), VICTORIES_STORE);
  }
}
