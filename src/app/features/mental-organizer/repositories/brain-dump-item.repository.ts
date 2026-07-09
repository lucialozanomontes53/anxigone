import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { BrainDumpItem } from '../models/brain-dump-item.model';

export abstract class BrainDumpItemRepository extends IndexedDbRepository<BrainDumpItem> {}
