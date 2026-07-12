import { Routes } from '@angular/router';

import { VictoryIndexedDbRepository } from './repositories/victory-indexeddb.repository';
import { VictoryRepository } from './repositories/victory.repository';
import { VictoriesStore } from './stores/victories.store';

export const VICTORIES_ROUTES: Routes = [
  {
    path: '',
    providers: [
      VictoriesStore,
      { provide: VictoryRepository, useClass: VictoryIndexedDbRepository },
    ],
    loadComponent: () => import('./pages/victories.page').then((m) => m.VictoriesPage),
  },
];
