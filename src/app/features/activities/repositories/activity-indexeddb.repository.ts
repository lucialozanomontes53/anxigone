import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { ActivityRepository } from './activity.repository';

export const ACTIVITIES_STORE = 'activities';

@Injectable()
export class ActivityIndexedDbRepository extends ActivityRepository {
  constructor() {
    super(inject(IndexedDbAdapter), ACTIVITIES_STORE);
  }
}
