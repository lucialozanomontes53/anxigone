import { GROUNDING_5_4_3_2_1_STEPS } from './grounding-step.model';

describe('GROUNDING_5_4_3_2_1_STEPS', () => {
  it('tiene los 5 pasos en orden descendente 5-4-3-2-1', () => {
    expect(GROUNDING_5_4_3_2_1_STEPS.map((step) => step.count)).toEqual([5, 4, 3, 2, 1]);
  });

  it('cada paso incluye un prompt no vacío', () => {
    for (const step of GROUNDING_5_4_3_2_1_STEPS) {
      expect(step.prompt.length).toBeGreaterThan(0);
    }
  });
});
