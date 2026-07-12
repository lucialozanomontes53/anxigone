import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { CrisisPlan } from '../models/crisis-plan.model';

export abstract class CrisisPlanRepository extends IndexedDbRepository<CrisisPlan> {}
