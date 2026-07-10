import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { createIntensity } from '../../../shared/models/intensity.model';
import { EmergencyEventIndexedDbRepository } from '../repositories/emergency-event-indexeddb.repository';
import { EmergencyEventRepository } from '../repositories/emergency-event.repository';
import { EmergencyStore } from './emergency.store';

function createStore(): EmergencyStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'emergencyEvents', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      EmergencyStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: EmergencyEventRepository, useClass: EmergencyEventIndexedDbRepository },
    ],
  });

  return TestBed.inject(EmergencyStore);
}

describe('EmergencyStore', () => {
  it('empieza sin evento activo ni historial', () => {
    const store = createStore();

    expect(store.activeEvent()).toBeNull();
    expect(store.history()).toEqual([]);
  });

  it('startEvent crea y persiste un EmergencyEvent activo', async () => {
    const store = createStore();

    await store.startEvent({
      situation: 'Discusión con mi pareja',
      emotion: 'ansiedad',
      intensity: createIntensity(8),
      need: 'tranquilidad',
    });

    const active = store.activeEvent();
    expect(active).not.toBeNull();
    expect(active?.situation).toBe('Discusión con mi pareja');
    expect(active?.resolvedAt).toBeNull();

    await store.loadHistory();
    expect(store.history()).toHaveLength(1);
  });

  it('recordToolUsed añade la técnica sin duplicarla', async () => {
    const store = createStore();
    await store.startEvent({
      situation: 's',
      emotion: 'miedo',
      intensity: createIntensity(5),
      need: 'calma',
    });

    await store.recordToolUsed('breathing:box');
    await store.recordToolUsed('breathing:box');
    await store.recordToolUsed('grounding');

    expect(store.activeEvent()?.techniquesUsed).toEqual(['breathing:box', 'grounding']);
  });

  it('markWaitingModeActivated marca el evento activo', async () => {
    const store = createStore();
    await store.startEvent({
      situation: 's',
      emotion: 'ansiedad',
      intensity: createIntensity(9),
      need: 'seguridad',
    });

    await store.markWaitingModeActivated();

    expect(store.activeEvent()?.waitingModeActivated).toBe(true);
  });

  it('resolveActiveEvent marca resolvedAt y limpia el evento activo', async () => {
    const store = createStore();
    await store.startEvent({
      situation: 's',
      emotion: 'calma',
      intensity: createIntensity(3),
      need: 'descanso',
    });

    await store.resolveActiveEvent();

    expect(store.activeEvent()).toBeNull();
    await store.loadHistory();
    expect(store.history()[0]?.resolvedAt).not.toBeNull();
  });

  it('clearActiveEvent limpia el estado local sin borrar lo persistido', async () => {
    const store = createStore();
    await store.startEvent({
      situation: 's',
      emotion: 'calma',
      intensity: createIntensity(2),
      need: 'descanso',
    });

    store.clearActiveEvent();
    expect(store.activeEvent()).toBeNull();

    await store.loadHistory();
    expect(store.history()).toHaveLength(1);
  });
});
