export interface GroundingStep {
  readonly count: number;
  readonly sense: string;
  readonly prompt: string;
}

/** Técnica de grounding 5-4-3-2-1, contenido de referencia compartido. */
export const GROUNDING_5_4_3_2_1_STEPS: readonly GroundingStep[] = [
  { count: 5, sense: 'vista', prompt: 'Nombra 5 cosas que puedas ver a tu alrededor.' },
  { count: 4, sense: 'tacto', prompt: 'Nombra 4 cosas que puedas tocar.' },
  { count: 3, sense: 'oído', prompt: 'Nombra 3 cosas que puedas oír.' },
  { count: 2, sense: 'olfato', prompt: 'Nombra 2 cosas que puedas oler.' },
  { count: 1, sense: 'gusto', prompt: 'Nombra 1 cosa que puedas saborear.' },
];
