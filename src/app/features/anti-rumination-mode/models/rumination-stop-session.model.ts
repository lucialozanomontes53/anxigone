import { ISODateString } from '../../../shared/models/iso-date-string.model';

/**
 * Sesión efímera: nunca se persiste en IndexedDB (ver ADR asociado en CLAUDE.md).
 * Solo vive en memoria mientras dura la pantalla dedicada o el aviso global.
 */
export interface RuminationStopSession {
  readonly startedAt: ISODateString;
  readonly durationMin: number;
  readonly endsAt: ISODateString;
}

export const RUMINATION_STOP_DURATIONS_MIN: readonly number[] = [10, 20, 30, 60];
