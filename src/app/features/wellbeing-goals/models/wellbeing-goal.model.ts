import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export interface GoalCheckIn {
  readonly id: string;
  readonly date: ISODateString;
  readonly metGoal: boolean;
  readonly reflection: string;
}

export interface WellbeingGoal extends Identifiable {
  readonly text: string;
  readonly targetDate: ISODateString | null;
  readonly checkIns: readonly GoalCheckIn[];
  readonly createdAt: ISODateString;
}

/** No orientados a productividad: ejemplos para inspirar, no una lista cerrada. */
export const WELLBEING_GOAL_PRESETS: readonly string[] = [
  'Esperar antes de actuar',
  'Reducir comprobaciones',
  'Dormir mejor',
  'Practicar autocompasión',
  'Usar herramientas saludables',
];

export interface CheckInProgress {
  readonly total: number;
  readonly metCount: number;
  readonly metPct: number;
}

/** Pura, sin Angular: % de check-ins cumplidos dentro de los últimos `days` días. */
export function computeCheckInProgress(
  checkIns: readonly GoalCheckIn[],
  referenceNow: ISODateString,
  days: number,
): CheckInProgress {
  const cutoff = new Date(referenceNow).getTime() - days * 24 * 60 * 60 * 1000;
  const withinWindow = checkIns.filter((checkIn) => new Date(checkIn.date).getTime() >= cutoff);
  const metCount = withinWindow.filter((checkIn) => checkIn.metGoal).length;
  const total = withinWindow.length;
  return { total, metCount, metPct: total === 0 ? 0 : Math.round((metCount / total) * 100) };
}
