import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';

import { GroundingStep } from '../../models/grounding-step.model';

@Component({
  selector: 'app-grounding-guide',
  templateUrl: './grounding-guide.component.html',
  styleUrl: './grounding-guide.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroundingGuideComponent {
  readonly steps = input.required<readonly GroundingStep[]>();
  readonly completed = output<void>();

  private readonly liveAnnouncer = inject(LiveAnnouncer);

  protected readonly stepIndex = signal(0);
  protected readonly currentStep = computed(() => this.steps()[this.stepIndex()]);
  protected readonly isLastStep = computed(() => this.stepIndex() === this.steps().length - 1);
  protected readonly isFirstStep = computed(() => this.stepIndex() === 0);

  protected next(): void {
    if (this.isLastStep()) {
      this.completed.emit();
      return;
    }
    this.stepIndex.update((index) => index + 1);
    this.announceCurrentStep();
  }

  protected previous(): void {
    if (this.isFirstStep()) {
      return;
    }
    this.stepIndex.update((index) => index - 1);
    this.announceCurrentStep();
  }

  protected restart(): void {
    this.stepIndex.set(0);
    this.announceCurrentStep();
  }

  private announceCurrentStep(): void {
    const step = this.currentStep();
    if (step) {
      void this.liveAnnouncer.announce(step.prompt);
    }
  }
}
