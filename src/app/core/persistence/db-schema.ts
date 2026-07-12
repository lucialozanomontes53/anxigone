export const DB_NAME = 'espacio-seguro-db';
/**
 * IMPORTANTE: sube esta versión cada vez que añadas o cambies una entrada de
 * APP_DB_STORES. IndexedDB solo ejecuta el `upgrade` (que crea los stores
 * nuevos) cuando la versión pedida es mayor que la ya almacenada en el
 * navegador; si olvidas subirla, los navegadores que ya tenían la BD creada
 * con una versión anterior se quedan sin el store nuevo y las operaciones
 * sobre él fallan con "NotFoundError: object store was not found".
 */
export const DB_VERSION = 7;

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
export const APP_DB_STORES: readonly StoreDefinition[] = [
  { name: 'emergencyEvents', keyPath: 'id' },
  {
    name: 'blockingSessions',
    keyPath: 'id',
    indexes: [{ name: 'byStatus', keyPath: 'status' }],
  },
  { name: 'toolSessions', keyPath: 'id' },
  { name: 'journalEntries', keyPath: 'id' },
  { name: 'brainDumpItems', keyPath: 'id' },
  { name: 'uncertaintyEntries', keyPath: 'id' },
  { name: 'crisisPlans', keyPath: 'id' },
  { name: 'realityPhrases', keyPath: 'id' },
  { name: 'victories', keyPath: 'id' },
];

export const DEFAULT_DB_CONFIG: DbConfig = {
  name: DB_NAME,
  version: DB_VERSION,
  stores: APP_DB_STORES,
};
