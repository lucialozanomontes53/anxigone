import { Routes } from '@angular/router';

export const ANTI_RUMINATION_MODE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/anti-rumination.page').then((m) => m.AntiRuminationPage),
  },
];
