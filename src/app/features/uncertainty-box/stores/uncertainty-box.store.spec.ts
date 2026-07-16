import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { deriveUncertaintyStatus, UncertaintyEntry } from '../models/uncertainty-entry.model';
import { UncertaintyEntryIndexedDbRepository } from '../repositories/uncertainty-entry-indexeddb.repository';
import { UncertaintyEntryRepository } from '../repositories/uncertainty-entry.repository';
import { UncertaintyBoxStore } from './uncertainty-box.store';

function createStore(): UncertaintyBoxStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'uncertaintyEntries', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      UncertaintyBoxStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: UncertaintyEntryRepository, useClass: UncertaintyEntryIndexedDbRepository },
    ],
  });

  return TestBed.inject(UncertaintyBoxStore);
}

function baseEntry(overrides: Partial<UncertaintyEntry> = {}): UncertaintyEntry {
  return {
    id: 'entry-1',
    worryText: '¿Por qué no me ha respondido?',
    createdAt: toISODateString(new Date('2026-01-01T10:00:00Z')),
    revisitAt: toISODateString(new Date('2026-01-02T10:00:00Z')),
    review: null,
    reviewedAt: null,
    ...overrides,
  };
}

describe('deriveUncertaintyStatus', () => {
  const revisitAt = toISODateString(new Date('2026-01-02T10:00:00Z'));

  it('está sellada si la fecha de revisión aún no ha llegado', () => {
    const entry = baseEntry({ revisitAt });
    const before = toISODateString(new Date('2026-01-02T09:59:59Z'));

    expect(deriveUncertaintyStatus(entry, before)).toBe('sealed');
  });

  it('es desbloqueable justo en el instante exacto de revisitAt', () => {
    const entry = baseEntry({ revisitAt });

    expect(deriveUncertaintyStatus(entry, revisitAt)).toBe('unlockable');
  });

  it('es desbloqueable después de la fecha de revisión', () => {
    const entry = baseEntry({ revisitAt });
    const after = toISODateString(new Date('2026-01-03T00:00:00Z'));

    expect(deriveUncertaintyStatus(entry, after)).toBe('unlockable');
  });

  it('está revisada si tiene reviewedAt, sin importar la fecha', () => {
    const entry = baseEntry({ revisitAt, reviewedAt: toISODateString(new Date('2026-01-02T11:00:00Z')) });
    const before = toISODateString(new Date('2026-01-02T09:00:00Z'));

    expect(deriveUncertaintyStatus(entry, before)).toBe('reviewed');
  });
});

describe('UncertaintyBoxStore', () => {
  it('empieza sin entradas', () => {
    const store = createStore();

    expect(store.sealedEntries()).toEqual([]);
    expect(store.unlockedPendingEntries()).toEqual([]);
    expect(store.reviewedEntries()).toEqual([]);
  });

  it('addEntry crea y persiste una preocupación sellada', async () => {
    const store = createStore();
    const revisitAt = toISODateString(new Date(Date.now() + 24 * 60 * 60 * 1000));

    await store.addEntry('¿Por qué no me ha respondido?', revisitAt);

    expect(store.sealedEntries()).toHaveLength(1);
    expect(store.sealedEntries()[0]?.worryText).toBe('¿Por qué no me ha respondido?');
  });

  it('ordena las selladas por fecha de revisión ascendente', async () => {
    const store = createStore();
    await store.addEntry('la más lejana', toISODateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)));
    await store.addEntry('la más cercana', toISODateString(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)));

    const [first, second] = store.sealedEntries();
    expect(first?.worryText).toBe('la más cercana');
    expect(second?.worryText).toBe('la más lejana');
  });

  it('ordena las revisadas por fecha de revisión descendente (la más reciente primero)', async () => {
    const store = createStore();
    await store.addEntry('primera revisada', toISODateString(new Date(Date.now() - 2 * 60 * 60 * 1000)));
    await store.addEntry('segunda revisada', toISODateString(new Date(Date.now() - 60 * 60 * 1000)));
    const review = { stillImportant: false, resolvedItself: true, asSeriousAsExpected: false };

    const firstId = store.unlockedPendingEntries().find((entry) => entry.worryText === 'primera revisada')?.id ?? '';
    await store.reviewEntry(firstId, review);
    // Pequeña espera real para garantizar que reviewedAt (basado en el reloj real) avanza
    // entre ambas revisiones: en una ejecución rápida, dos `clock.now()` seguidos pueden
    // caer en el mismo milisegundo y empatar en el ordenamiento.
    await new Promise((resolve) => setTimeout(resolve, 5));
    const secondId = store.unlockedPendingEntries().find((entry) => entry.worryText === 'segunda revisada')?.id ?? '';
    await store.reviewEntry(secondId, review);

    const [mostRecent] = store.reviewedEntries();
    expect(mostRecent?.worryText).toBe('segunda revisada');
  });

  it('reviewEntry no hace nada si la entrada sigue sellada', async () => {
    const store = createStore();
    const farRevisitAt = toISODateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    await store.addEntry('preocupación futura', farRevisitAt);
    const id = store.sealedEntries()[0]?.id ?? '';

    await store.reviewEntry(id, { stillImportant: true, resolvedItself: false, asSeriousAsExpected: true });

    expect(store.reviewedEntries()).toEqual([]);
    expect(store.sealedEntries()).toHaveLength(1);
  });

  it('reviewEntry guarda la revisión de una entrada desbloqueada y calcula estadísticas', async () => {
    const store = createStore();
    const pastRevisitAt = toISODateString(new Date(Date.now() - 60 * 60 * 1000));
    await store.addEntry('preocupación ya vencida', pastRevisitAt);
    const id = store.unlockedPendingEntries()[0]?.id ?? '';

    await store.reviewEntry(id, { stillImportant: false, resolvedItself: true, asSeriousAsExpected: false });

    expect(store.unlockedPendingEntries()).toEqual([]);
    expect(store.reviewedEntries()).toHaveLength(1);
    expect(store.reviewStats()).toEqual({
      total: 1,
      resolvedItselfPct: 100,
      stillImportantPct: 0,
      asSeriousAsExpectedPct: 0,
    });
  });
});
