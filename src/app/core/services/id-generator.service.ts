import { Injectable } from '@angular/core';

/** Abstrae `crypto.randomUUID()` para que las stores sean testeables con ids deterministas. */
@Injectable({ providedIn: 'root' })
export class IdGeneratorService {
  generate(): string {
    return crypto.randomUUID();
  }
}
