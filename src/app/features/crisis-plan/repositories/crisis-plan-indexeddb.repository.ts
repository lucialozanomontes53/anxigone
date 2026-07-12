import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { CrisisPlanRepository } from './crisis-plan.repository';

export const CRISIS_PLANS_STORE = 'crisisPlans';

@Injectable()
export class CrisisPlanIndexedDbRepository extends CrisisPlanRepository {
  constructor() {
    super(inject(IndexedDbAdapter), CRISIS_PLANS_STORE);
  }
}
