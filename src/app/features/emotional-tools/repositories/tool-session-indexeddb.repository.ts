import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { ToolSessionRepository } from './tool-session.repository';

export const TOOL_SESSIONS_STORE = 'toolSessions';

@Injectable()
export class ToolSessionIndexedDbRepository extends ToolSessionRepository {
  constructor() {
    super(inject(IndexedDbAdapter), TOOL_SESSIONS_STORE);
  }
}
