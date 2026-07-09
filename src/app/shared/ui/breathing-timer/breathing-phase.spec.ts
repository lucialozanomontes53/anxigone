import { BreathingPattern } from '../../models/breathing-pattern.model';
import { buildBreathingPhases } from './breathing-phase';

describe('buildBreathingPhases', () => {
  it('incluye las 4 fases cuando todas tienen duración > 0', () => {
    const pattern: BreathingPattern = {
      id: 'box',
      label: 'test',
      inhaleSec: 4,
      holdSec: 4,
      exhaleSec: 4,
      holdAfterExhaleSec: 4,
    };

    expect(buildBreathingPhases(pattern).map((step) => step.phase)).toEqual([
      'inhale',
      'hold',
      'exhale',
      'holdAfterExhale',
    ]);
  });

  it('omite las fases con duración 0', () => {
    const pattern: BreathingPattern = {
      id: '4-7-8',
      label: 'test',
      inhaleSec: 4,
      holdSec: 7,
      exhaleSec: 8,
      holdAfterExhaleSec: 0,
    };

    expect(buildBreathingPhases(pattern).map((step) => step.phase)).toEqual([
      'inhale',
      'hold',
      'exhale',
    ]);
  });
});
