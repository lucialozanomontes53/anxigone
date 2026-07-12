import { Routes } from '@angular/router';

import { UncertaintyEntryIndexedDbRepository } from './repositories/uncertainty-entry-indexeddb.repository';
import { UncertaintyEntryRepository } from './repositories/uncertainty-entry.repository';
import { UncertaintyBoxStore } from './stores/uncertainty-box.store';

export const UNCERTAINTY_BOX_ROUTES: Routes = [
  {
    path: '',
    providers: [
      UncertaintyBoxStore,
      { provide: UncertaintyEntryRepository, useClass: UncertaintyEntryIndexedDbRepository },
    ],
    loadComponent: () => import('./pages/uncertainty-box.page').then((m) => m.UncertaintyBoxPage),
  },
];
