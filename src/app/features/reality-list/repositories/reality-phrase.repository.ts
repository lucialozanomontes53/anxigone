import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { RealityPhrase } from '../models/reality-phrase.model';

export abstract class RealityPhraseRepository extends IndexedDbRepository<RealityPhrase> {}
