import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { BlockingSession } from '../models/blocking-session.model';

/**
 * Puerto root-scoped (ver ADR-14): a diferencia del resto de repositorios de
 * `emergency`, este vive fuera del ciclo de vida de la ruta porque una sesión
 * activa debe sobrevivir a la navegación por cualquier parte de la app.
 */
export abstract class BlockingSessionRepository extends IndexedDbRepository<BlockingSession> {}
