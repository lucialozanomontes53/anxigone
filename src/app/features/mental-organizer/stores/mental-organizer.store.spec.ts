import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { BrainDumpItemIndexedDbRepository } from '../repositories/brain-dump-item-indexeddb.repository';
import { BrainDumpItemRepository } from '../repositories/brain-dump-item.repository';
import { MentalOrganizerStore } from './mental-organizer.store';

function createStore(): MentalOrganizerStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'brainDumpItems', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      MentalOrganizerStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: BrainDumpItemRepository, useClass: BrainDumpItemIndexedDbRepository },
    ],
  });

  return TestBed.inject(MentalOrganizerStore);
}

describe('MentalOrganizerStore', () => {
  it('empieza sin elementos', () => {
    const store = createStore();

    expect(store.unclassifiedItems()).toEqual([]);
  });

  it('addItem crea un elemento sin clasificar', async () => {
    const store = createStore();

    await store.addItem('Llamar al dentista');

    expect(store.unclassifiedItems()).toHaveLength(1);
    expect(store.unclassifiedItems()[0]?.content).toBe('Llamar al dentista');
  });

  it('classify mueve el elemento de sin-clasificar a su categoría', async () => {
    const store = createStore();
    await store.addItem('Llamar al dentista');
    const id = store.unclassifiedItems()[0]?.id ?? '';

    await store.classify(id, 'action');

    expect(store.unclassifiedItems()).toHaveLength(0);
    expect(store.actionItems()).toHaveLength(1);
  });

  it('clasifica en las 4 categorías de forma independiente', async () => {
    const store = createStore();
    await store.addItem('a');
    await store.addItem('b');
    await store.addItem('c');
    await store.addItem('d');
    const [a, b, c, d] = store.unclassifiedItems();

    await store.classify(a?.id ?? '', 'action');
    await store.classify(b?.id ?? '', 'waiting');
    await store.classify(c?.id ?? '', 'not-my-control');
    await store.classify(d?.id ?? '', 'release');

    expect(store.actionItems()).toHaveLength(1);
    expect(store.waitingItems()).toHaveLength(1);
    expect(store.notMyControlItems()).toHaveLength(1);
    expect(store.releaseItems()).toHaveLength(1);
  });

  it('resolveItem quita el elemento de las listas activas', async () => {
    const store = createStore();
    await store.addItem('tarea');
    const id = store.unclassifiedItems()[0]?.id ?? '';
    await store.classify(id, 'action');

    await store.resolveItem(id);

    expect(store.actionItems()).toHaveLength(0);
  });

  it('deleteItem elimina el elemento permanentemente', async () => {
    const store = createStore();
    await store.addItem('tarea');
    const id = store.unclassifiedItems()[0]?.id ?? '';

    await store.deleteItem(id);

    expect(store.unclassifiedItems()).toHaveLength(0);
  });
});
