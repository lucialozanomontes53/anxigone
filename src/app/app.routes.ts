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
  {
    path: 'herramientas',
    loadChildren: () =>
      import('./features/emotional-tools/emotional-tools.routes').then((m) => m.EMOTIONAL_TOOLS_ROUTES),
  },
  {
    path: 'diario',
    loadChildren: () => import('./features/journal/journal.routes').then((m) => m.JOURNAL_ROUTES),
  },
  {
    path: 'organizador',
    loadChildren: () =>
      import('./features/mental-organizer/mental-organizer.routes').then(
        (m) => m.MENTAL_ORGANIZER_ROUTES,
      ),
  },
];
