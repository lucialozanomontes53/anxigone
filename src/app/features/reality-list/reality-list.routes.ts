import { Routes } from '@angular/router';

import { RealityPhraseIndexedDbRepository } from './repositories/reality-phrase-indexeddb.repository';
import { RealityPhraseRepository } from './repositories/reality-phrase.repository';
import { RealityListStore } from './stores/reality-list.store';

export const REALITY_LIST_ROUTES: Routes = [
  {
    path: '',
    providers: [
      RealityListStore,
      { provide: RealityPhraseRepository, useClass: RealityPhraseIndexedDbRepository },
    ],
    loadComponent: () => import('./pages/reality-list.page').then((m) => m.RealityListPage),
  },
];
