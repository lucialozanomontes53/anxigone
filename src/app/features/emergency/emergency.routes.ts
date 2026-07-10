import { Routes } from '@angular/router';

import { EmergencyEventIndexedDbRepository } from './repositories/emergency-event-indexeddb.repository';
import { EmergencyEventRepository } from './repositories/emergency-event.repository';
import { EmergencyStore } from './stores/emergency.store';

export const EMERGENCY_ROUTES: Routes = [
  {
    path: '',
    providers: [
      EmergencyStore,
      { provide: EmergencyEventRepository, useClass: EmergencyEventIndexedDbRepository },
    ],
    loadComponent: () => import('./pages/emergency.page').then((m) => m.EmergencyPage),
  },
];
