import { TestBed } from '@angular/core/testing';

import { APP_DB_CONFIG, IndexedDbAdapter } from './indexed-db.adapter';
import { DbConfig } from './db-schema';

interface Note {
  readonly id: string;
  readonly text: string;
}

function createAdapter(): IndexedDbAdapter {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'notes', keyPath: 'id', indexes: [{ name: 'byText', keyPath: 'text' }] }],
  };

  TestBed.configureTestingModule({
    providers: [{ provide: APP_DB_CONFIG, useValue: config }],
  });

  return TestBed.inject(IndexedDbAdapter);
}

describe('IndexedDbAdapter', () => {
  it('guarda y recupera una entidad por id', async () => {
    const adapter = createAdapter();
    const note: Note = { id: '1', text: 'primera nota' };

    await adapter.put('notes', note);

    expect(await adapter.getById<Note>('notes', '1')).toEqual(note);
  });

  it('devuelve undefined al buscar un id inexistente', async () => {
    const adapter = createAdapter();

    expect(await adapter.getById('notes', 'no-existe')).toBeUndefined();
  });

  it('lista todas las entidades guardadas', async () => {
    const adapter = createAdapter();
    await adapter.put<Note>('notes', { id: '1', text: 'a' });
    await adapter.put<Note>('notes', { id: '2', text: 'b' });

    const all = await adapter.getAll<Note>('notes');

    expect(all).toHaveLength(2);
  });

  it('elimina una entidad por id', async () => {
    const adapter = createAdapter();
    await adapter.put<Note>('notes', { id: '1', text: 'a' });

    await adapter.remove('notes', '1');

    expect(await adapter.getById('notes', '1')).toBeUndefined();
  });

  it('limpia todos los registros del store', async () => {
    const adapter = createAdapter();
    await adapter.put<Note>('notes', { id: '1', text: 'a' });
    await adapter.put<Note>('notes', { id: '2', text: 'b' });

    await adapter.clear('notes');

    expect(await adapter.getAll('notes')).toHaveLength(0);
  });

  it('sobrescribe una entidad existente con el mismo id', async () => {
    const adapter = createAdapter();
    await adapter.put<Note>('notes', { id: '1', text: 'original' });
    await adapter.put<Note>('notes', { id: '1', text: 'actualizada' });

    const all = await adapter.getAll<Note>('notes');

    expect(all).toHaveLength(1);
    expect(all[0]?.text).toBe('actualizada');
  });
});
