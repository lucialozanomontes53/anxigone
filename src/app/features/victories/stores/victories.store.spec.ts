import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { VictoryIndexedDbRepository } from '../repositories/victory-indexeddb.repository';
import { VictoryRepository } from '../repositories/victory.repository';
import { VictoriesStore } from './victories.store';

function createStore(): VictoriesStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'victories', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      VictoriesStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: VictoryRepository, useClass: VictoryIndexedDbRepository },
    ],
  });

  return TestBed.inject(VictoriesStore);
}

describe('VictoriesStore', () => {
  it('empieza sin victorias', () => {
    const store = createStore();

    expect(store.victories()).toEqual([]);
    expect(store.totalCount()).toBe(0);
    expect(store.weekCount()).toBe(0);
    expect(store.monthCount()).toBe(0);
    expect(store.currentStreak()).toBe(0);
  });

  it('addVictory crea y persiste una victoria', async () => {
    const store = createStore();

    await store.addVictory('Esperé antes de actuar');

    expect(store.totalCount()).toBe(1);
    expect(store.weekCount()).toBe(1);
    expect(store.currentStreak()).toBe(1);
    expect(store.victories()[0]?.text).toBe('Esperé antes de actuar');

    await store.loadVictories();
    expect(store.totalCount()).toBe(1);
  });

  it('ordena las victorias de más reciente a más antigua', async () => {
    const store = createStore();

    await store.addVictory('primera');
    await store.addVictory('segunda');

    const [first, second] = store.victories();
    expect(first?.occurredAt.localeCompare(second?.occurredAt ?? '')).toBeGreaterThanOrEqual(0);
  });

  it('deleteVictory elimina una victoria', async () => {
    const store = createStore();
    await store.addVictory('No revisé mensajes');
    const id = store.victories()[0]?.id ?? '';

    await store.deleteVictory(id);

    expect(store.totalCount()).toBe(0);
  });
});
