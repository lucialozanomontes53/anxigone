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

/** Etiquetas legibles (con tildes) para mostrar en la UI; los ids se mantienen en ASCII. */
export const EMOTION_LABELS: Record<EmotionType, string> = {
  tristeza: 'Tristeza',
  ansiedad: 'Ansiedad',
  miedo: 'Miedo',
  ira: 'Ira',
  verguenza: 'Vergüenza',
  culpa: 'Culpa',
  alegria: 'Alegría',
  calma: 'Calma',
  sorpresa: 'Sorpresa',
  asco: 'Asco',
};
