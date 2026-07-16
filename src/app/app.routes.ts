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
  {
    path: 'caja-de-incertidumbre',
    loadChildren: () =>
      import('./features/uncertainty-box/uncertainty-box.routes').then((m) => m.UNCERTAINTY_BOX_ROUTES),
  },
  {
    path: 'plan-de-crisis',
    loadChildren: () => import('./features/crisis-plan/crisis-plan.routes').then((m) => m.CRISIS_PLAN_ROUTES),
  },
  {
    path: 'lista-de-realidad',
    loadChildren: () => import('./features/reality-list/reality-list.routes').then((m) => m.REALITY_LIST_ROUTES),
  },
  {
    path: 'logros',
    loadChildren: () => import('./features/victories/victories.routes').then((m) => m.VICTORIES_ROUTES),
  },
  {
    path: 'actividades',
    loadChildren: () => import('./features/activities/activities.routes').then((m) => m.ACTIVITIES_ROUTES),
  },
  {
    path: 'objetivos',
    loadChildren: () =>
      import('./features/wellbeing-goals/wellbeing-goals.routes').then((m) => m.WELLBEING_GOALS_ROUTES),
  },
];
