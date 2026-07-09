import { Identifiable } from '../../../core/persistence/repository.base';
import { EmotionType } from '../../../shared/models/emotion-type.model';
import { Intensity } from '../../../shared/models/intensity.model';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export interface EmergencyEvent extends Identifiable {
  readonly createdAt: ISODateString;
  readonly situation: string;
  readonly emotion: EmotionType;
  readonly intensity: Intensity;
  readonly need: string;
  readonly techniquesUsed: readonly string[];
  readonly waitingModeActivated: boolean;
  readonly resolvedAt: ISODateString | null;
}
