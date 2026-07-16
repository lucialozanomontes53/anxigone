import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { WellbeingGoalIndexedDbRepository } from '../repositories/wellbeing-goal-indexeddb.repository';
import { WellbeingGoalRepository } from '../repositories/wellbeing-goal.repository';
import { WellbeingGoalsStore } from './wellbeing-goals.store';

function createStore(): WellbeingGoalsStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'wellbeingGoals', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      WellbeingGoalsStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: WellbeingGoalRepository, useClass: WellbeingGoalIndexedDbRepository },
    ],
  });

  return TestBed.inject(WellbeingGoalsStore);
}

describe('WellbeingGoalsStore', () => {
  it('empieza sin objetivos', () => {
    const store = createStore();

    expect(store.goals()).toEqual([]);
  });

  it('addGoal crea y persiste un objetivo sin check-ins', async () => {
    const store = createStore();

    await store.addGoal('Dormir mejor', null);

    expect(store.goals()).toHaveLength(1);
    expect(store.goals()[0]?.text).toBe('Dormir mejor');
    expect(store.goals()[0]?.checkIns).toEqual([]);

    await store.loadGoals();
    expect(store.goals()).toHaveLength(1);
  });

  it('addCheckIn añade una reflexión y actualiza el cumplimiento', async () => {
    const store = createStore();
    await store.addGoal('Esperar antes de actuar', null);
    const id = store.goals()[0]?.id ?? '';

    await store.addCheckIn(id, true, 'Hoy lo conseguí');

    expect(store.goals()[0]?.checkIns).toHaveLength(1);
    expect(store.goals()[0]?.checkIns[0]?.metGoal).toBe(true);
    expect(store.goals()[0]?.checkIns[0]?.reflection).toBe('Hoy lo conseguí');
  });

  it('addCheckIn no hace nada si el objetivo no existe', async () => {
    const store = createStore();

    await store.addCheckIn('no-existe', true, '');

    expect(store.goals()).toEqual([]);
  });

  it('deleteGoal elimina un objetivo', async () => {
    const store = createStore();
    await store.addGoal('Practicar autocompasión', null);
    const id = store.goals()[0]?.id ?? '';

    await store.deleteGoal(id);

    expect(store.goals()).toEqual([]);
  });
});
