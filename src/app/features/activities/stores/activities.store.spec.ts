import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { PRESET_ACTIVITIES } from '../models/activity.model';
import { ActivityUsageIndexedDbRepository } from '../repositories/activity-usage-indexeddb.repository';
import { ActivityUsageRepository } from '../repositories/activity-usage.repository';
import { ActivityIndexedDbRepository } from '../repositories/activity-indexeddb.repository';
import { ActivityRepository } from '../repositories/activity.repository';
import { ActivitiesStore } from './activities.store';

function createStore(): ActivitiesStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [
      { name: 'activities', keyPath: 'id' },
      { name: 'activityUsages', keyPath: 'id' },
    ],
  };

  TestBed.configureTestingModule({
    providers: [
      ActivitiesStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: ActivityRepository, useClass: ActivityIndexedDbRepository },
      { provide: ActivityUsageRepository, useClass: ActivityUsageIndexedDbRepository },
    ],
  });

  return TestBed.inject(ActivitiesStore);
}

describe('ActivitiesStore', () => {
  it('empieza con solo las actividades predefinidas', () => {
    const store = createStore();

    expect(store.allActivities()).toEqual(PRESET_ACTIVITIES);
    expect(store.effectivenessRanking()).toEqual([]);
  });

  it('addCustomActivity crea y persiste una actividad personalizada', async () => {
    const store = createStore();

    await store.addCustomActivity({
      title: 'Leer mi libro favorito',
      description: 'El que estoy releyendo ahora',
      energyLevel: 'low',
    });

    expect(store.allActivities()).toHaveLength(PRESET_ACTIVITIES.length + 1);
    const custom = store.allActivities().find((activity) => activity.isCustom);
    expect(custom?.title).toBe('Leer mi libro favorito');

    await store.loadAll();
    expect(store.allActivities()).toHaveLength(PRESET_ACTIVITIES.length + 1);
  });

  it('logUsage registra una valoración y actualiza el ranking de efectividad', async () => {
    const store = createStore();

    await store.logUsage('preset-walk', 'mucho');
    await store.logUsage('preset-walk', 'bastante');
    await store.logUsage('preset-music', 'poco');

    const ranking = store.effectivenessRanking();
    expect(ranking[0]?.activityId).toBe('preset-walk');
    expect(ranking[0]?.usageCount).toBe(2);
    expect(ranking[1]?.activityId).toBe('preset-music');
  });
});
