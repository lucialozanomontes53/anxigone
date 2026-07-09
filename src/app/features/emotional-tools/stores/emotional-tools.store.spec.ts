import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { ToolSessionIndexedDbRepository } from '../repositories/tool-session-indexeddb.repository';
import { ToolSessionRepository } from '../repositories/tool-session.repository';
import { EmotionalToolsStore } from './emotional-tools.store';

function createStore(): EmotionalToolsStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'toolSessions', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      EmotionalToolsStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: ToolSessionRepository, useClass: ToolSessionIndexedDbRepository },
    ],
  });

  return TestBed.inject(EmotionalToolsStore);
}

describe('EmotionalToolsStore', () => {
  it('empieza sin sesiones', () => {
    const store = createStore();

    expect(store.sessions()).toEqual([]);
    expect(store.sessionCount()).toBe(0);
  });

  it('recordSession persiste y añade la sesión al estado', async () => {
    const store = createStore();

    await store.recordSession('breathing', 'box', 64);

    expect(store.sessionCount()).toBe(1);
    expect(store.sessions()[0]?.toolType).toBe('breathing');
    expect(store.sessions()[0]?.techniqueId).toBe('box');

    await store.loadHistory();
    expect(store.sessionCount()).toBe(1);
  });

  it('redondea y evita duraciones negativas', async () => {
    const store = createStore();

    await store.recordSession('grounding', '5-4-3-2-1', -3.7);

    expect(store.sessions()[0]?.durationSec).toBe(0);
  });

  it('acumula varias sesiones', async () => {
    const store = createStore();

    await store.recordSession('breathing', 'box', 60);
    await store.recordSession('grounding', '5-4-3-2-1', 45);

    expect(store.sessionCount()).toBe(2);
  });
});
