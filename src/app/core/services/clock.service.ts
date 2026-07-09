import { Injectable } from '@angular/core';

import { ISODateString, toISODateString } from '../../shared/models/iso-date-string.model';

/** Abstrae `new Date()` para que las stores sean testeables con una hora determinista. */
@Injectable({ providedIn: 'root' })
export class ClockService {
  now(): ISODateString {
    return toISODateString(new Date());
  }
}
