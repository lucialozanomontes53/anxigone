export const EMOTION_TYPES = [
  'tristeza',
  'ansiedad',
  'miedo',
  'ira',
  'verguenza',
  'culpa',
  'alegria',
  'calma',
  'sorpresa',
  'asco',
] as const;

export type EmotionType = (typeof EMOTION_TYPES)[number];

export function isEmotionType(value: string): value is EmotionType {
  return (EMOTION_TYPES as readonly string[]).includes(value);
}
