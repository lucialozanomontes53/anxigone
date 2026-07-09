import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { EmergencyEventRepository } from './emergency-event.repository';

export const EMERGENCY_EVENTS_STORE = 'emergencyEvents';

@Injectable()
export class EmergencyEventIndexedDbRepository extends EmergencyEventRepository {
  constructor() {
    super(inject(IndexedDbAdapter), EMERGENCY_EVENTS_STORE);
  }
}
