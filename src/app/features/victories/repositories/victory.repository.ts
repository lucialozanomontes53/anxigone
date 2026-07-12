import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { Victory } from '../models/victory.model';

export abstract class VictoryRepository extends IndexedDbRepository<Victory> {}
