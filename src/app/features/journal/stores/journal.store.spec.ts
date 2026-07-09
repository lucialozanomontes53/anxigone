import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { createIntensity } from '../../../shared/models/intensity.model';
import { JournalEntryIndexedDbRepository } from '../repositories/journal-entry-indexeddb.repository';
import { JournalEntryRepository } from '../repositories/journal-entry.repository';
import { CreateJournalEntryInput, JournalStore } from './journal.store';

function createStore(): JournalStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'journalEntries', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      JournalStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: JournalEntryRepository, useClass: JournalEntryIndexedDbRepository },
    ],
  });

  return TestBed.inject(JournalStore);
}

const baseInput: CreateJournalEntryInput = {
  emotion: 'ansiedad',
  intensity: createIntensity(6),
  situation: 'No me contestó al mensaje',
  facts: 'Han pasado 3 horas sin respuesta',
  interpretations: 'Está enfadado conmigo',
  fears: 'Que deje de quererme',
  alternatives: 'Puede estar ocupado o sin batería',
  needs: 'Tranquilidad',
};

describe('JournalStore', () => {
  it('empieza sin entradas', () => {
    const store = createStore();

    expect(store.entries()).toEqual([]);
    expect(store.entryCount()).toBe(0);
  });

  it('addEntry crea y persiste una entrada', async () => {
    const store = createStore();

    await store.addEntry(baseInput);

    expect(store.entryCount()).toBe(1);
    expect(store.entries()[0]?.situation).toBe(baseInput.situation);

    await store.loadEntries();
    expect(store.entryCount()).toBe(1);
  });

  it('ordena las entradas de más reciente a más antigua', async () => {
    const store = createStore();

    await store.addEntry(baseInput);
    await store.addEntry({ ...baseInput, situation: 'segunda entrada' });

    const [first, second] = store.entries();
    expect(first?.date.localeCompare(second?.date ?? '')).toBeGreaterThanOrEqual(0);
  });

  it('deleteEntry elimina una entrada', async () => {
    const store = createStore();
    await store.addEntry(baseInput);
    const id = store.entries()[0]?.id ?? '';

    await store.deleteEntry(id);

    expect(store.entryCount()).toBe(0);
  });
});
