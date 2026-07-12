import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export interface Victory extends Identifiable {
  readonly text: string;
  readonly occurredAt: ISODateString;
}

export const VICTORY_PRESETS: readonly string[] = [
  'Esperé antes de actuar',
  'No revisé mensajes',
  'Utilicé una técnica de grounding',
  'Toleré la incertidumbre',
  'Usé el modo anti-impulso',
];

/** Cuenta victorias ocurridas en los últimos `days` días, contando desde `referenceNow`. */
export function countWithinDays(
  victories: readonly Victory[],
  referenceNow: ISODateString,
  days: number,
): number {
  const cutoff = new Date(referenceNow).getTime() - days * 24 * 60 * 60 * 1000;
  return victories.filter((victory) => new Date(victory.occurredAt).getTime() >= cutoff).length;
}

function toDayString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Días consecutivos (terminando hoy) con al menos una victoria. Si hoy todavía no
 * tiene ninguna pero ayer sí, la racha sigue viva (el día no ha terminado); si ni
 * hoy ni ayer tienen victorias, la racha está rota (0).
 */
export function computeCurrentStreak(victories: readonly Victory[], referenceNow: ISODateString): number {
  const daysWithVictories = new Set(victories.map((victory) => victory.occurredAt.slice(0, 10)));

  const cursor = new Date(referenceNow);
  cursor.setUTCHours(0, 0, 0, 0);

  if (!daysWithVictories.has(toDayString(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!daysWithVictories.has(toDayString(cursor))) {
      return 0;
    }
  }

  let streak = 0;
  while (daysWithVictories.has(toDayString(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
