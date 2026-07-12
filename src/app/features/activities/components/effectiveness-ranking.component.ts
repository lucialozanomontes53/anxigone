import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ActivityEffectiveness } from '../models/activity-usage.model';
import { Activity } from '../models/activity.model';

@Component({
  selector: 'app-effectiveness-ranking',
  templateUrl: './effectiveness-ranking.component.html',
  styleUrl: './effectiveness-ranking.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffectivenessRankingComponent {
  readonly ranking = input.required<readonly ActivityEffectiveness[]>();
  readonly activities = input.required<readonly Activity[]>();

  protected titleFor(activityId: string): string {
    return this.activities().find((activity) => activity.id === activityId)?.title ?? activityId;
  }

  protected formatScore(score: number): string {
    return score.toFixed(1);
  }
}
