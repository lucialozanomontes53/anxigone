import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ReviewStats } from '../stores/uncertainty-box.store';

@Component({
  selector: 'app-reviewed-worries-stats',
  templateUrl: './reviewed-worries-stats.component.html',
  styleUrl: './reviewed-worries-stats.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewedWorriesStatsComponent {
  readonly stats = input.required<ReviewStats>();
}
