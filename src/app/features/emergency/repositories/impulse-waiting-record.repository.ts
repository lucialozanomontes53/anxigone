import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { ImpulseWaitingRecord } from '../models/impulse-waiting-record.model';

/** Puerto: la store depende de esta abstracción, nunca de IndexedDB directamente. */
export abstract class ImpulseWaitingRecordRepository extends IndexedDbRepository<ImpulseWaitingRecord> {}
