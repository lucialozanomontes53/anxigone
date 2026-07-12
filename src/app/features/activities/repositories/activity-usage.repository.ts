import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { ActivityUsage } from '../models/activity-usage.model';

export abstract class ActivityUsageRepository extends IndexedDbRepository<ActivityUsage> {}
