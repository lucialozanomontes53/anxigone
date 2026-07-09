import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export interface ImpulseWaitingRecord extends Identifiable {
  readonly emergencyEventId: string;
  readonly createdAt: ISODateString;
  /** El impulso o acción que la persona quiere posponer, y por qué merece la pena esperar. */
  readonly goal: string;
  readonly timerDurationMin: number;
  readonly reflectionNotes: string;
  /** null mientras la espera sigue en curso. */
  readonly impulseResisted: boolean | null;
  readonly completedAt: ISODateString | null;
}
