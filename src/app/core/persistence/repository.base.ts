import { IndexedDbAdapter } from './indexed-db.adapter';

export interface Identifiable {
  readonly id: string;
}

/**
 * CRUD genérico sobre un object store de IndexedDB. Cada feature define su propia
 * interfaz de repositorio (puerto) en su capa de dominio y una clase concreta que
 * extiende esta base (adaptador), inyectada vía un `InjectionToken` — así el store
 * de la feature nunca depende de `IndexedDbAdapter` ni de `idb` directamente.
 */
export abstract class IndexedDbRepository<T extends Identifiable> {
  protected constructor(
    private readonly adapter: IndexedDbAdapter,
    private readonly storeName: string,
  ) {}

  findAll(): Promise<T[]> {
    return this.adapter.getAll<T>(this.storeName);
  }

  findById(id: string): Promise<T | undefined> {
    return this.adapter.getById<T>(this.storeName, id);
  }

  save(entity: T): Promise<void> {
    return this.adapter.put<T>(this.storeName, entity);
  }

  deleteById(id: string): Promise<void> {
    return this.adapter.remove(this.storeName, id);
  }

  clear(): Promise<void> {
    return this.adapter.clear(this.storeName);
  }
}
