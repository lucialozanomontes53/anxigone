import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { CrisisPlanIndexedDbRepository } from '../repositories/crisis-plan-indexeddb.repository';
import { CrisisPlanRepository } from '../repositories/crisis-plan.repository';
import { CrisisPlanStore } from './crisis-plan.store';

function createStore(): CrisisPlanStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'crisisPlans', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      CrisisPlanStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: CrisisPlanRepository, useClass: CrisisPlanIndexedDbRepository },
    ],
  });

  return TestBed.inject(CrisisPlanStore);
}

describe('CrisisPlanStore', () => {
  it('empieza con un plan vacío en memoria', () => {
    const store = createStore();

    expect(store.plan().warningSigns).toEqual([]);
    expect(store.plan().supportContacts).toEqual([]);
  });

  it('loadPlan mantiene el plan vacío si no hay nada persistido', async () => {
    const store = createStore();

    await store.loadPlan();

    expect(store.plan().warningSigns).toEqual([]);
  });

  it('updateList guarda y persiste una de las 5 listas', async () => {
    const store = createStore();

    await store.updateList('warningSigns', ['Reviso el móvil constantemente']);

    expect(store.plan().warningSigns).toEqual(['Reviso el móvil constantemente']);

    await store.loadPlan();
    expect(store.plan().warningSigns).toEqual(['Reviso el móvil constantemente']);
  });

  it('updateList funciona para cada una de las 5 claves', async () => {
    const store = createStore();
    const fields = [
      'warningSigns',
      'worseningTriggers',
      'helpfulActions',
      'reminders',
      'reasonsNotToAct',
    ] as const;

    for (const field of fields) {
      await store.updateList(field, [`valor de ${field}`]);
      expect(store.plan()[field]).toEqual([`valor de ${field}`]);
    }
  });

  it('addContact y removeContact gestionan la lista de contactos de apoyo', async () => {
    const store = createStore();

    await store.addContact({ name: 'Ana', phone: '600111222', note: 'Mi hermana' });
    expect(store.plan().supportContacts).toHaveLength(1);
    const contactId = store.plan().supportContacts[0]?.id ?? '';

    await store.removeContact(contactId);
    expect(store.plan().supportContacts).toEqual([]);
  });
});
