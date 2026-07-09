import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

export interface WaitingSetupInput {
  readonly goal: string;
  readonly timerDurationMin: number;
}

export const WAITING_DURATION_OPTIONS_MIN: readonly number[] = [5, 10, 15, 30];

@Component({
  selector: 'app-emergency-waiting-setup',
  templateUrl: './emergency-waiting-setup.component.html',
  styleUrl: './emergency-waiting-setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmergencyWaitingSetupComponent {
  readonly submitted = output<WaitingSetupInput>();

  protected readonly durationOptions = WAITING_DURATION_OPTIONS_MIN;
  protected readonly goal = signal('');
  protected readonly timerDurationMin = signal(10);
  protected readonly canSubmit = computed(() => this.goal().trim().length > 0);

  protected onGoalInput(event: Event): void {
    this.goal.set((event.target as HTMLInputElement).value);
  }

  protected selectDuration(minutes: number): void {
    this.timerDurationMin.set(minutes);
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.submitted.emit({ goal: this.goal().trim(), timerDurationMin: this.timerDurationMin() });
  }
}
