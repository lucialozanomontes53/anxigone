import { Routes } from '@angular/router';

import { ToolSessionIndexedDbRepository } from './repositories/tool-session-indexeddb.repository';
import { ToolSessionRepository } from './repositories/tool-session.repository';
import { EmotionalToolsStore } from './stores/emotional-tools.store';

export const EMOTIONAL_TOOLS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      EmotionalToolsStore,
      { provide: ToolSessionRepository, useClass: ToolSessionIndexedDbRepository },
    ],
    loadComponent: () => import('./pages/emotional-tools.page').then((m) => m.EmotionalToolsPage),
  },
];
