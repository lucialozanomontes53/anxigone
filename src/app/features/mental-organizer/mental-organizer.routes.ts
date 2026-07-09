import { Routes } from '@angular/router';

import { BrainDumpItemIndexedDbRepository } from './repositories/brain-dump-item-indexeddb.repository';
import { BrainDumpItemRepository } from './repositories/brain-dump-item.repository';
import { MentalOrganizerStore } from './stores/mental-organizer.store';

export const MENTAL_ORGANIZER_ROUTES: Routes = [
  {
    path: '',
    providers: [
      MentalOrganizerStore,
      { provide: BrainDumpItemRepository, useClass: BrainDumpItemIndexedDbRepository },
    ],
    loadComponent: () => import('./pages/mental-organizer.page').then((m) => m.MentalOrganizerPage),
  },
];
