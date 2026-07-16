import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { WellbeingGoalRepository } from './wellbeing-goal.repository';

export const WELLBEING_GOALS_STORE = 'wellbeingGoals';

@Injectable()
export class WellbeingGoalIndexedDbRepository extends WellbeingGoalRepository {
  constructor() {
    super(inject(IndexedDbAdapter), WELLBEING_GOALS_STORE);
  }
}
