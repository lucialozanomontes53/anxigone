import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export interface RealityPhrase extends Identifiable {
  readonly text: string;
  readonly isFavorite: boolean;
  readonly isPriority: boolean;
  readonly createdAt: ISODateString;
}
