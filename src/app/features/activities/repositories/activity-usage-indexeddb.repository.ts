import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { ActivityUsageRepository } from './activity-usage.repository';

export const ACTIVITY_USAGES_STORE = 'activityUsages';

@Injectable()
export class ActivityUsageIndexedDbRepository extends ActivityUsageRepository {
  constructor() {
    super(inject(IndexedDbAdapter), ACTIVITY_USAGES_STORE);
  }
}
