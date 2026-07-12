import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export type UncertaintyEntryStatus = 'sealed' | 'unlockable' | 'reviewed';

export interface UncertaintyReview {
  readonly stillImportant: boolean;
  readonly resolvedItself: boolean;
  readonly asSeriousAsExpected: boolean;
}

export interface UncertaintyEntry extends Identifiable {
  readonly worryText: string;
  readonly createdAt: ISODateString;
  readonly revisitAt: ISODateString;
  readonly review: UncertaintyReview | null;
  readonly reviewedAt: ISODateString | null;
}

/**
 * Pura y sin Angular: el estado de una entrada nunca se persiste, se deriva en cada
 * lectura comparando `revisitAt` con la hora de referencia (ver ADR-17).
 */
export function deriveUncertaintyStatus(
  entry: UncertaintyEntry,
  referenceNow: ISODateString,
): UncertaintyEntryStatus {
  if (entry.reviewedAt) {
    return 'reviewed';
  }
  return new Date(entry.revisitAt).getTime() <= new Date(referenceNow).getTime()
    ? 'unlockable'
    : 'sealed';
}

export const REVISIT_PRESETS = ['tomorrow', 'three-days', 'one-week', 'custom'] as const;
export type RevisitPreset = (typeof REVISIT_PRESETS)[number];

export const REVISIT_PRESET_LABELS: Record<RevisitPreset, string> = {
  tomorrow: 'Mañana',
  'three-days': 'Dentro de 3 días',
  'one-week': 'Dentro de una semana',
  custom: 'Elegir fecha',
};
