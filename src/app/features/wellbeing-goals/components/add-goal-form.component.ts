import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

import { ISODateString, toISODateString } from '../../../shared/models/iso-date-string.model';
import { WELLBEING_GOAL_PRESETS } from '../models/wellbeing-goal.model';

export interface NewGoalSubmitted {
  readonly text: string;
  readonly targetDate: ISODateString | null;
}

@Component({
  selector: 'app-add-goal-form',
  templateUrl: './add-goal-form.component.html',
  styleUrl: './add-goal-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddGoalFormComponent {
  readonly added = output<NewGoalSubmitted>();

  protected readonly presets = WELLBEING_GOAL_PRESETS;
  protected readonly draft = signal('');
  protected readonly targetDate = signal('');

  protected onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onTargetDateInput(event: Event): void {
    this.targetDate.set((event.target as HTMLInputElement).value);
  }

  protected addPreset(text: string): void {
    this.added.emit({ text, targetDate: this.resolveTargetDate() });
  }

  protected addDraft(): void {
    if (this.draft().trim().length === 0) {
      return;
    }
    this.added.emit({ text: this.draft().trim(), targetDate: this.resolveTargetDate() });
    this.draft.set('');
  }

  private resolveTargetDate(): ISODateString | null {
    return this.targetDate().length > 0 ? toISODateString(new Date(this.targetDate())) : null;
  }
}
