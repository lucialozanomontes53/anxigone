import { isValidISODateString, toISODateString } from './iso-date-string.model';

describe('toISODateString', () => {
  it('serializa una Date a formato ISO 8601', () => {
    const date = new Date('2026-07-09T10:00:00.000Z');
    expect(toISODateString(date)).toBe('2026-07-09T10:00:00.000Z');
  });
});

describe('isValidISODateString', () => {
  it('acepta cadenas de fecha parseables', () => {
    expect(isValidISODateString('2026-07-09T10:00:00.000Z')).toBe(true);
  });

  it('rechaza cadenas no parseables como fecha', () => {
    expect(isValidISODateString('no-es-una-fecha')).toBe(false);
  });
});
