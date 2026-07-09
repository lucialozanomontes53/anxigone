export type BreathingPatternId = 'box' | '4-7-8' | 'diaphragmatic';

export interface BreathingPattern {
  readonly id: BreathingPatternId;
  readonly label: string;
  readonly inhaleSec: number;
  readonly holdSec: number;
  readonly exhaleSec: number;
  readonly holdAfterExhaleSec: number;
}

/** Presets clínicos de respiración, compartidos entre `emergency` y `emotional-tools`. */
export const BREATHING_PATTERNS: Record<BreathingPatternId, BreathingPattern> = {
  box: {
    id: 'box',
    label: 'Respiración cuadrada (Box Breathing)',
    inhaleSec: 4,
    holdSec: 4,
    exhaleSec: 4,
    holdAfterExhaleSec: 4,
  },
  '4-7-8': {
    id: '4-7-8',
    label: 'Respiración 4-7-8',
    inhaleSec: 4,
    holdSec: 7,
    exhaleSec: 8,
    holdAfterExhaleSec: 0,
  },
  diaphragmatic: {
    id: 'diaphragmatic',
    label: 'Respiración diafragmática',
    inhaleSec: 4,
    holdSec: 0,
    exhaleSec: 6,
    holdAfterExhaleSec: 0,
  },
};
