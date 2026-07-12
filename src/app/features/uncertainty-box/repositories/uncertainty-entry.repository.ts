import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { UncertaintyEntry } from '../models/uncertainty-entry.model';

export abstract class UncertaintyEntryRepository extends IndexedDbRepository<UncertaintyEntry> {}
