import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { GoalCheckIn, computeCheckInProgress } from './wellbeing-goal.model';

function checkIn(date: string, metGoal: boolean): GoalCheckIn {
  return { id: crypto.randomUUID(), date: toISODateString(new Date(date)), metGoal, reflection: '' };
}

describe('computeCheckInProgress', () => {
  const now = toISODateString(new Date('2026-01-10T12:00:00Z'));

  it('devuelve 0 sin check-ins', () => {
    expect(computeCheckInProgress([], now, 7)).toEqual({ total: 0, metCount: 0, metPct: 0 });
  });

  it('cuenta solo los check-ins dentro de la ventana de días', () => {
    const checkIns = [
      checkIn('2026-01-10T08:00:00Z', true),
      checkIn('2026-01-04T12:00:00Z', true),
      checkIn('2026-01-01T00:00:00Z', false),
    ];

    expect(computeCheckInProgress(checkIns, now, 7)).toEqual({ total: 2, metCount: 2, metPct: 100 });
    expect(computeCheckInProgress(checkIns, now, 30)).toEqual({ total: 3, metCount: 2, metPct: 67 });
  });

  it('calcula el porcentaje cuando no todos se cumplieron', () => {
    const checkIns = [checkIn('2026-01-09T10:00:00Z', true), checkIn('2026-01-08T10:00:00Z', false)];

    expect(computeCheckInProgress(checkIns, now, 7)).toEqual({ total: 2, metCount: 1, metPct: 50 });
  });
});
