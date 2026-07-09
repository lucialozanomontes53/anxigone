import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./home.page').then((m) => m.HomePage),
  },
  {
    path: 'emergencia',
    loadChildren: () => import('./features/emergency/emergency.routes').then((m) => m.EMERGENCY_ROUTES),
  },
];
