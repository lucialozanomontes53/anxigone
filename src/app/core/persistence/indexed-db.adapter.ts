import { inject, Injectable, InjectionToken } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';

import { DbConfig, DEFAULT_DB_CONFIG } from './db-schema';

export const APP_DB_CONFIG = new InjectionToken<DbConfig>('APP_DB_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_DB_CONFIG,
});

/**
 * Único punto de contacto con IndexedDB (vía `idb`, un wrapper promise-based
 * sobre la API nativa). Ninguna otra capa de la app importa `idb` directamente:
 * las features consumen `IndexedDbRepository<T>`, que a su vez depende de este
 * adapter por inyección. La configuración (nombre/versión/stores) se inyecta a
 * través de `APP_DB_CONFIG` para poder sustituirla en tests.
 */
@Injectable({ providedIn: 'root' })
export class IndexedDbAdapter {
  private readonly config = inject(APP_DB_CONFIG);
  private connection: Promise<IDBPDatabase> | undefined;

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.open();
    return db.getAll(storeName);
  }

  async getById<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await this.open();
    return db.get(storeName, id);
  }

  async put<T>(storeName: string, value: T): Promise<void> {
    const db = await this.open();
    await db.put(storeName, value);
  }

  async remove(storeName: string, id: string): Promise<void> {
    const db = await this.open();
    await db.delete(storeName, id);
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.open();
    await db.clear(storeName);
  }

  private open(): Promise<IDBPDatabase> {
    this.connection ??= openDB(this.config.name, this.config.version, {
      upgrade: (db) => this.ensureStores(db),
    });
    return this.connection;
  }

  private ensureStores(db: IDBPDatabase): void {
    for (const store of this.config.stores) {
      if (db.objectStoreNames.contains(store.name)) {
        continue;
      }
      const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
      for (const index of store.indexes ?? []) {
        objectStore.createIndex(index.name, index.keyPath, { unique: index.unique ?? false });
      }
    }
  }
}
