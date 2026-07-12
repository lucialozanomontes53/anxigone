import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { ActivityUsage, computeEffectivenessRanking } from './activity-usage.model';

function usage(activityId: string, helpfulness: ActivityUsage['helpfulness']): ActivityUsage {
  return {
    id: crypto.randomUUID(),
    activityId,
    helpfulness,
    completedAt: toISODateString(new Date()),
  };
}

describe('computeEffectivenessRanking', () => {
  it('devuelve una lista vacía sin usos', () => {
    expect(computeEffectivenessRanking([])).toEqual([]);
  });

  it('calcula la puntuación media por actividad', () => {
    const usages = [usage('walk', 'mucho'), usage('walk', 'bastante')];

    const ranking = computeEffectivenessRanking(usages);

    expect(ranking).toEqual([{ activityId: 'walk', averageScore: 3.5, usageCount: 2 }]);
  });

  it('ordena de mayor a menor puntuación media', () => {
    const usages = [usage('music', 'poco'), usage('walk', 'mucho')];

    const ranking = computeEffectivenessRanking(usages);

    expect(ranking.map((entry) => entry.activityId)).toEqual(['walk', 'music']);
  });
});
