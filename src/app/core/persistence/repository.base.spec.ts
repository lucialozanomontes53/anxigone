import { TestBed } from '@angular/core/testing';

import { DbConfig } from './db-schema';
import { APP_DB_CONFIG, IndexedDbAdapter } from './indexed-db.adapter';
import { Identifiable, IndexedDbRepository } from './repository.base';

interface TestEntity extends Identifiable {
  readonly value: string;
}

class TestEntityRepository extends IndexedDbRepository<TestEntity> {
  constructor(adapter: IndexedDbAdapter) {
    super(adapter, 'entities');
  }
}

function createRepository(): TestEntityRepository {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'entities', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [{ provide: APP_DB_CONFIG, useValue: config }],
  });

  return new TestEntityRepository(TestBed.inject(IndexedDbAdapter));
}

describe('IndexedDbRepository', () => {
  it('empieza vacío', async () => {
    const repository = createRepository();

    expect(await repository.findAll()).toEqual([]);
  });

  it('guarda y encuentra una entidad por id', async () => {
    const repository = createRepository();
    const entity: TestEntity = { id: '1', value: 'a' };

    await repository.save(entity);

    expect(await repository.findById('1')).toEqual(entity);
    expect(await repository.findAll()).toEqual([entity]);
  });

  it('elimina una entidad por id', async () => {
    const repository = createRepository();
    await repository.save({ id: '1', value: 'a' });

    await repository.deleteById('1');

    expect(await repository.findById('1')).toBeUndefined();
  });

  it('limpia todas las entidades', async () => {
    const repository = createRepository();
    await repository.save({ id: '1', value: 'a' });
    await repository.save({ id: '2', value: 'b' });

    await repository.clear();

    expect(await repository.findAll()).toEqual([]);
  });
});
