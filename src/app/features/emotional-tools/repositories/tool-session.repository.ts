import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { ToolSession } from '../models/tool-session.model';

export abstract class ToolSessionRepository extends IndexedDbRepository<ToolSession> {}
