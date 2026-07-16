import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AddGoalFormComponent, NewGoalSubmitted } from '../components/add-goal-form.component';
import { GoalCardComponent, GoalCheckedIn } from '../components/goal-card.component';
import { WellbeingGoalsStore } from '../stores/wellbeing-goals.store';

@Component({
  selector: 'app-wellbeing-goals-page',
  imports: [AddGoalFormComponent, GoalCardComponent],
  templateUrl: './wellbeing-goals.page.html',
  styleUrl: './wellbeing-goals.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WellbeingGoalsPage {
  protected readonly store = inject(WellbeingGoalsStore);

  constructor() {
    void this.store.loadGoals();
  }

  protected async onAdded(input: NewGoalSubmitted): Promise<void> {
    await this.store.addGoal(input.text, input.targetDate);
  }

  protected async onCheckedIn(goalId: string, event: GoalCheckedIn): Promise<void> {
    await this.store.addCheckIn(goalId, event.metGoal, event.reflection);
  }

  protected async onDeleted(goalId: string): Promise<void> {
    await this.store.deleteGoal(goalId);
  }
}
