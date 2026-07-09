import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { EmergencyEvent } from '../models/emergency-event.model';

/** Puerto: la store depende de esta abstracción, nunca de IndexedDB directamente. */
export abstract class EmergencyEventRepository extends IndexedDbRepository<EmergencyEvent> {}
