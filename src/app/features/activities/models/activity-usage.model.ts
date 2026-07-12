import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export const HELPFULNESS_RATINGS = ['mucho', 'bastante', 'poco', 'nada'] as const;
export type HelpfulnessRating = (typeof HELPFULNESS_RATINGS)[number];

export const HELPFULNESS_LABELS: Record<HelpfulnessRating, string> = {
  mucho: 'Mucho',
  bastante: 'Bastante',
  poco: 'Poco',
  nada: 'Nada',
};

const HELPFULNESS_SCORES: Record<HelpfulnessRating, number> = {
  mucho: 4,
  bastante: 3,
  poco: 2,
  nada: 1,
};

export interface ActivityUsage extends Identifiable {
  readonly activityId: string;
  readonly helpfulness: HelpfulnessRating;
  readonly completedAt: ISODateString;
}

export interface ActivityEffectiveness {
  readonly activityId: string;
  readonly averageScore: number;
  readonly usageCount: number;
}

/** Pura, sin Angular: ordena las actividades usadas por valoración media (mucho=4..nada=1). */
export function computeEffectivenessRanking(
  usages: readonly ActivityUsage[],
): readonly ActivityEffectiveness[] {
  const scoresByActivity = new Map<string, number[]>();
  for (const usage of usages) {
    const scores = scoresByActivity.get(usage.activityId) ?? [];
    scores.push(HELPFULNESS_SCORES[usage.helpfulness]);
    scoresByActivity.set(usage.activityId, scores);
  }

  const ranking: ActivityEffectiveness[] = [];
  for (const [activityId, scores] of scoresByActivity) {
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    ranking.push({ activityId, averageScore, usageCount: scores.length });
  }
  return ranking.sort((a, b) => b.averageScore - a.averageScore);
}
