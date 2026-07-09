import { BREATHING_PATTERNS } from './breathing-pattern.model';

describe('BREATHING_PATTERNS', () => {
  it.each(Object.entries(BREATHING_PATTERNS))(
    'define un patrón "%s" con duraciones no negativas',
    (_id, pattern) => {
      expect(pattern.inhaleSec).toBeGreaterThan(0);
      expect(pattern.holdSec).toBeGreaterThanOrEqual(0);
      expect(pattern.exhaleSec).toBeGreaterThan(0);
      expect(pattern.holdAfterExhaleSec).toBeGreaterThanOrEqual(0);
    },
  );
});
