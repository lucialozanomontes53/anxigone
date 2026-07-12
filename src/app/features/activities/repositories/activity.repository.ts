import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { Activity } from '../models/activity.model';

export abstract class ActivityRepository extends IndexedDbRepository<Activity> {}
