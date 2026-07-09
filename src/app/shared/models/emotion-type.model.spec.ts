import { EMOTION_TYPES, isEmotionType } from './emotion-type.model';

describe('isEmotionType', () => {
  it.each(EMOTION_TYPES)('reconoce "%s" como un EmotionType válido', (emotion) => {
    expect(isEmotionType(emotion)).toBe(true);
  });

  it('rechaza un valor que no está en el catálogo cerrado', () => {
    expect(isEmotionType('euforia')).toBe(false);
  });
});
