import { Injectable, inject } from '@angular/core';

import { IndexedDbAdapter } from '../../../core/persistence/indexed-db.adapter';
import { ImpulseWaitingRecordRepository } from './impulse-waiting-record.repository';

export const IMPULSE_WAITING_RECORDS_STORE = 'impulseWaitingRecords';

@Injectable()
export class ImpulseWaitingRecordIndexedDbRepository extends ImpulseWaitingRecordRepository {
  constructor() {
    super(inject(IndexedDbAdapter), IMPULSE_WAITING_RECORDS_STORE);
  }
}
