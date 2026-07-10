import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { BlockingSessionRepository } from './blocking-session.repository';

export const BLOCKING_SESSIONS_STORE = 'blockingSessions';

@Injectable({ providedIn: 'root' })
export class BlockingSessionIndexedDbRepository extends BlockingSessionRepository {
  constructor() {
    super(inject(IndexedDbAdapter), BLOCKING_SESSIONS_STORE);
  }
}
