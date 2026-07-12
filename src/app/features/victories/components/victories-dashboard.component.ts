import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-victories-dashboard',
  templateUrl: './victories-dashboard.component.html',
  styleUrl: './victories-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VictoriesDashboardComponent {
  readonly totalCount = input.required<number>();
  readonly weekCount = input.required<number>();
  readonly monthCount = input.required<number>();
  readonly currentStreak = input.required<number>();
}
