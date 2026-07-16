import { Routes } from '@angular/router';

import { WellbeingGoalIndexedDbRepository } from './repositories/wellbeing-goal-indexeddb.repository';
import { WellbeingGoalRepository } from './repositories/wellbeing-goal.repository';
import { WellbeingGoalsStore } from './stores/wellbeing-goals.store';

export const WELLBEING_GOALS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      WellbeingGoalsStore,
      { provide: WellbeingGoalRepository, useClass: WellbeingGoalIndexedDbRepository },
    ],
    loadComponent: () => import('./pages/wellbeing-goals.page').then((m) => m.WellbeingGoalsPage),
  },
];
