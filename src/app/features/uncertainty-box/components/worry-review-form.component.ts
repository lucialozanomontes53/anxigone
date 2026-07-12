import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { UncertaintyEntry, UncertaintyReview } from '../models/uncertainty-entry.model';

@Component({
  selector: 'app-worry-review-form',
  templateUrl: './worry-review-form.component.html',
  styleUrl: './worry-review-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorryReviewFormComponent {
  readonly entry = input.required<UncertaintyEntry>();
  readonly reviewed = output<UncertaintyReview>();

  protected readonly stillImportant = signal<boolean | null>(null);
  protected readonly resolvedItself = signal<boolean | null>(null);
  protected readonly asSeriousAsExpected = signal<boolean | null>(null);

  protected readonly canSubmit = computed(
    () =>
      this.stillImportant() !== null &&
      this.resolvedItself() !== null &&
      this.asSeriousAsExpected() !== null,
  );

  protected submit(): void {
    const stillImportant = this.stillImportant();
    const resolvedItself = this.resolvedItself();
    const asSeriousAsExpected = this.asSeriousAsExpected();
    if (stillImportant === null || resolvedItself === null || asSeriousAsExpected === null) {
      return;
    }
    this.reviewed.emit({ stillImportant, resolvedItself, asSeriousAsExpected });
  }
}
