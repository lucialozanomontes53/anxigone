import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { ENERGY_LEVELS, ENERGY_LEVEL_LABELS, EnergyLevel } from '../../../shared/models/energy-level.model';
import { HELPFULNESS_LABELS, HELPFULNESS_RATINGS, HelpfulnessRating } from '../models/activity-usage.model';
import { Activity } from '../models/activity.model';

export interface ActivityLogged {
  readonly activityId: string;
  readonly helpfulness: HelpfulnessRating;
}

@Component({
  selector: 'app-activity-browser',
  templateUrl: './activity-browser.component.html',
  styleUrl: './activity-browser.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityBrowserComponent {
  readonly activities = input.required<readonly Activity[]>();
  readonly logged = output<ActivityLogged>();

  protected readonly energyLevels = ENERGY_LEVELS;
  protected readonly energyLevelLabels = ENERGY_LEVEL_LABELS;
  protected readonly helpfulnessRatings = HELPFULNESS_RATINGS;
  protected readonly helpfulnessLabels = HELPFULNESS_LABELS;

  protected readonly ratingTarget = signal<string | null>(null);

  protected activitiesFor(level: EnergyLevel): readonly Activity[] {
    return this.activities().filter((activity) => activity.energyLevel === level);
  }

  protected markDone(activityId: string): void {
    this.ratingTarget.set(activityId);
  }

  protected rate(activityId: string, helpfulness: HelpfulnessRating): void {
    this.logged.emit({ activityId, helpfulness });
    this.ratingTarget.set(null);
  }

  protected cancelRating(): void {
    this.ratingTarget.set(null);
  }
}
