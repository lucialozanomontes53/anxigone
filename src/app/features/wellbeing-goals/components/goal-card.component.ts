import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { ISODateString } from '../../../shared/models/iso-date-string.model';
import { computeCheckInProgress, WellbeingGoal } from '../models/wellbeing-goal.model';

export interface GoalCheckedIn {
  readonly metGoal: boolean;
  readonly reflection: string;
}

@Component({
  selector: 'app-goal-card',
  templateUrl: './goal-card.component.html',
  styleUrl: './goal-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalCardComponent {
  readonly goal = input.required<WellbeingGoal>();
  readonly referenceNow = input.required<ISODateString>();
  readonly checkedIn = output<GoalCheckedIn>();
  readonly deleted = output<void>();

  protected readonly showCheckInForm = signal(false);
  protected readonly metGoal = signal<boolean | null>(null);
  protected readonly reflection = signal('');

  protected readonly weeklyProgress = computed(() =>
    computeCheckInProgress(this.goal().checkIns, this.referenceNow(), 7),
  );
  protected readonly monthlyProgress = computed(() =>
    computeCheckInProgress(this.goal().checkIns, this.referenceNow(), 30),
  );

  protected openCheckIn(): void {
    this.showCheckInForm.set(true);
  }

  protected cancelCheckIn(): void {
    this.showCheckInForm.set(false);
    this.metGoal.set(null);
    this.reflection.set('');
  }

  protected onReflectionInput(event: Event): void {
    this.reflection.set((event.target as HTMLInputElement).value);
  }

  protected submitCheckIn(): void {
    const met = this.metGoal();
    if (met === null) {
      return;
    }
    this.checkedIn.emit({ metGoal: met, reflection: this.reflection().trim() });
    this.cancelCheckIn();
  }

  protected formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('es-ES', { dateStyle: 'medium' });
  }
}
