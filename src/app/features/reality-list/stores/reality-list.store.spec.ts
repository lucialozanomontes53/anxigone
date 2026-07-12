import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { RealityPhraseIndexedDbRepository } from '../repositories/reality-phrase-indexeddb.repository';
import { RealityPhraseRepository } from '../repositories/reality-phrase.repository';
import { RealityListStore } from './reality-list.store';

function createStore(): RealityListStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'realityPhrases', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      RealityListStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: RealityPhraseRepository, useClass: RealityPhraseIndexedDbRepository },
    ],
  });

  return TestBed.inject(RealityListStore);
}

describe('RealityListStore', () => {
  it('empieza sin frases', () => {
    const store = createStore();

    expect(store.phrases()).toEqual([]);
    expect(store.favoritePhrases()).toEqual([]);
    expect(store.priorityPhrases()).toEqual([]);
  });

  it('addPhrase crea y persiste una frase', async () => {
    const store = createStore();

    await store.addPhrase('La ansiedad no es evidencia');

    expect(store.phrases()).toHaveLength(1);
    expect(store.phrases()[0]?.text).toBe('La ansiedad no es evidencia');
    expect(store.phrases()[0]?.isFavorite).toBe(false);
    expect(store.phrases()[0]?.isPriority).toBe(false);

    await store.loadPhrases();
    expect(store.phrases()).toHaveLength(1);
  });

  it('ordena las frases de más reciente a más antigua', async () => {
    const store = createStore();

    await store.addPhrase('primera');
    await store.addPhrase('segunda');

    const [first, second] = store.phrases();
    expect(first?.createdAt.localeCompare(second?.createdAt ?? '')).toBeGreaterThanOrEqual(0);
  });

  it('toggleFavorite marca y desmarca una frase como favorita', async () => {
    const store = createStore();
    await store.addPhrase('No conozco toda la información');
    const id = store.phrases()[0]?.id ?? '';

    await store.toggleFavorite(id);
    expect(store.favoritePhrases()).toHaveLength(1);

    await store.toggleFavorite(id);
    expect(store.favoritePhrases()).toEqual([]);
  });

  it('togglePriority marca y desmarca una frase como prioritaria', async () => {
    const store = createStore();
    await store.addPhrase('Mi mente está intentando protegerme');
    const id = store.phrases()[0]?.id ?? '';

    await store.togglePriority(id);
    expect(store.priorityPhrases()).toHaveLength(1);

    await store.togglePriority(id);
    expect(store.priorityPhrases()).toEqual([]);
  });

  it('toggleFavorite/togglePriority no hacen nada si la frase no existe', async () => {
    const store = createStore();

    await store.toggleFavorite('no-existe');
    await store.togglePriority('no-existe');

    expect(store.phrases()).toEqual([]);
  });

  it('deletePhrase elimina una frase', async () => {
    const store = createStore();
    await store.addPhrase('No necesito resolver todo ahora');
    const id = store.phrases()[0]?.id ?? '';

    await store.deletePhrase(id);

    expect(store.phrases()).toEqual([]);
  });
});
