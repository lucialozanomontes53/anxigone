import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { WellbeingGoal } from '../models/wellbeing-goal.model';

export abstract class WellbeingGoalRepository extends IndexedDbRepository<WellbeingGoal> {}
