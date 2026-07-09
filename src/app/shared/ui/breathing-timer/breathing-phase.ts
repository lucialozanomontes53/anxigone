import { BreathingPattern } from '../../models/breathing-pattern.model';

export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'holdAfterExhale';

export interface BreathingPhaseStep {
  readonly phase: BreathingPhase;
  readonly durationSec: number;
}

export const BREATHING_PHASE_LABELS: Record<BreathingPhase, string> = {
  inhale: 'Inhala',
  hold: 'Mantén el aire',
  exhale: 'Exhala',
  holdAfterExhale: 'Mantén los pulmones vacíos',
};

/** Descarta las fases con duración 0 (p. ej. el 4-7-8 no tiene holdAfterExhale). */
export function buildBreathingPhases(pattern: BreathingPattern): BreathingPhaseStep[] {
  const candidates: BreathingPhaseStep[] = [
    { phase: 'inhale', durationSec: pattern.inhaleSec },
    { phase: 'hold', durationSec: pattern.holdSec },
    { phase: 'exhale', durationSec: pattern.exhaleSec },
    { phase: 'holdAfterExhale', durationSec: pattern.holdAfterExhaleSec },
  ];
  return candidates.filter((step) => step.durationSec > 0);
}
