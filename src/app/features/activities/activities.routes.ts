import { Routes } from '@angular/router';

import { ActivityUsageIndexedDbRepository } from './repositories/activity-usage-indexeddb.repository';
import { ActivityUsageRepository } from './repositories/activity-usage.repository';
import { ActivityIndexedDbRepository } from './repositories/activity-indexeddb.repository';
import { ActivityRepository } from './repositories/activity.repository';
import { ActivitiesStore } from './stores/activities.store';

export const ACTIVITIES_ROUTES: Routes = [
  {
    path: '',
    providers: [
      ActivitiesStore,
      { provide: ActivityRepository, useClass: ActivityIndexedDbRepository },
      { provide: ActivityUsageRepository, useClass: ActivityUsageIndexedDbRepository },
    ],
    loadComponent: () => import('./pages/activities.page').then((m) => m.ActivitiesPage),
  },
];
