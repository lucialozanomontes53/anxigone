import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { Victory, computeCurrentStreak, countWithinDays } from './victory.model';

function victory(occurredAt: string): Victory {
  return { id: crypto.randomUUID(), text: 'victoria', occurredAt: toISODateString(new Date(occurredAt)) };
}

describe('countWithinDays', () => {
  const now = toISODateString(new Date('2026-01-10T12:00:00Z'));

  it('cuenta solo las victorias dentro de la ventana de días', () => {
    const victories = [
      victory('2026-01-10T08:00:00Z'),
      victory('2026-01-04T12:00:00Z'),
      victory('2026-01-01T00:00:00Z'),
    ];

    expect(countWithinDays(victories, now, 7)).toBe(2);
    expect(countWithinDays(victories, now, 30)).toBe(3);
  });

  it('devuelve 0 sin victorias', () => {
    expect(countWithinDays([], now, 7)).toBe(0);
  });
});

describe('computeCurrentStreak', () => {
  const now = toISODateString(new Date('2026-01-10T12:00:00Z'));

  it('es 0 sin victorias', () => {
    expect(computeCurrentStreak([], now)).toBe(0);
  });

  it('es 0 si ni hoy ni ayer hay victorias', () => {
    const victories = [victory('2026-01-05T10:00:00Z')];

    expect(computeCurrentStreak(victories, now)).toBe(0);
  });

  it('cuenta los días consecutivos terminando hoy', () => {
    const victories = [
      victory('2026-01-10T09:00:00Z'),
      victory('2026-01-09T09:00:00Z'),
      victory('2026-01-08T09:00:00Z'),
      victory('2026-01-05T09:00:00Z'),
    ];

    expect(computeCurrentStreak(victories, now)).toBe(3);
  });

  it('sigue viva si hoy no tiene victoria todavía pero ayer sí', () => {
    const victories = [victory('2026-01-09T09:00:00Z'), victory('2026-01-08T09:00:00Z')];

    expect(computeCurrentStreak(victories, now)).toBe(2);
  });
});
