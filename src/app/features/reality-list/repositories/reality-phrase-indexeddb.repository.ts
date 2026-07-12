import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { RealityPhraseRepository } from './reality-phrase.repository';

export const REALITY_PHRASES_STORE = 'realityPhrases';

@Injectable()
export class RealityPhraseIndexedDbRepository extends RealityPhraseRepository {
  constructor() {
    super(inject(IndexedDbAdapter), REALITY_PHRASES_STORE);
  }
}
