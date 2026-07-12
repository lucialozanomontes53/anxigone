import { Routes } from '@angular/router';

import { CrisisPlanIndexedDbRepository } from './repositories/crisis-plan-indexeddb.repository';
import { CrisisPlanRepository } from './repositories/crisis-plan.repository';
import { CrisisPlanStore } from './stores/crisis-plan.store';

export const CRISIS_PLAN_ROUTES: Routes = [
  {
    path: '',
    providers: [
      CrisisPlanStore,
      { provide: CrisisPlanRepository, useClass: CrisisPlanIndexedDbRepository },
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/crisis-plan-edit.page').then((m) => m.CrisisPlanEditPage),
      },
      {
        path: 'activar',
        loadComponent: () =>
          import('./pages/crisis-plan-activation.page').then((m) => m.CrisisPlanActivationPage),
      },
    ],
  },
];
