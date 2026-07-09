import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

/**
 * `self-compassion` y `uncertainty` se añadirán cuando esas técnicas se implementen
 * (roadmap Fase 2/3); por ahora solo existen sesiones de respiración y grounding.
 */
export type ToolType = 'breathing' | 'grounding';

export interface ToolSession extends Identifiable {
  readonly toolType: ToolType;
  readonly techniqueId: string;
  readonly durationSec: number;
  readonly completedAt: ISODateString;
}
