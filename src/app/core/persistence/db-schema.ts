export const DB_NAME = 'espacio-seguro-db';
export const DB_VERSION = 1;

export interface IndexDefinition {
  readonly name: string;
  readonly keyPath: string | string[];
  readonly unique?: boolean;
}

export interface StoreDefinition {
  readonly name: string;
  readonly keyPath: string;
  readonly indexes?: readonly IndexDefinition[];
}

export interface DbConfig {
  readonly name: string;
  readonly version: number;
  readonly stores: readonly StoreDefinition[];
}

/**
 * Registro único de todos los object stores de la app. Cada feature añade su
 * definición aquí al implementarse (ver core/persistence/indexed-db.adapter.ts),
 * de modo que este archivo es la única fuente de verdad del esquema IndexedDB.
 */
export const APP_DB_STORES: readonly StoreDefinition[] = [];

export const DEFAULT_DB_CONFIG: DbConfig = {
  name: DB_NAME,
  version: DB_VERSION,
  stores: APP_DB_STORES,
};
