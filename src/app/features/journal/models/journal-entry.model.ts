import { Identifiable } from '../../../core/persistence/repository.base';
import { EmotionType } from '../../../shared/models/emotion-type.model';
import { Intensity } from '../../../shared/models/intensity.model';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export interface JournalEntry extends Identifiable {
  readonly date: ISODateString;
  readonly emotion: EmotionType;
  readonly intensity: Intensity;
  readonly situation: string;
  /** Lo objetivamente observable, sin interpretar. */
  readonly facts: string;
  /** El significado que le estoy dando a los hechos. */
  readonly interpretations: string;
  /** El miedo concreto detrás de la interpretación. */
  readonly fears: string;
  /** Otras explicaciones igual de plausibles. */
  readonly alternatives: string;
  readonly needs: string;
}
