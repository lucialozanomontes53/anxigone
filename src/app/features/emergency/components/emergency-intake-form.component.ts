import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

import { createIntensity } from '../../../shared/models/intensity.model';
import { EMOTION_LABELS, EMOTION_TYPES, EmotionType } from '../../../shared/models/emotion-type.model';
import { StartEventInput } from '../stores/emergency.store';

@Component({
  selector: 'app-emergency-intake-form',
  templateUrl: './emergency-intake-form.component.html',
  styleUrl: './emergency-intake-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmergencyIntakeFormComponent {
  readonly submitted = output<StartEventInput>();

  protected readonly emotionOptions = EMOTION_TYPES;
  protected readonly emotionLabels = EMOTION_LABELS;

  protected readonly stepIndex = signal(0);
  protected readonly situation = signal('');
  protected readonly emotion = signal<EmotionType | null>(null);
  protected readonly intensity = signal(5);
  protected readonly need = signal('');

  protected readonly isLastStep = computed(() => this.stepIndex() === 3);

  protected readonly canAdvance = computed(() => {
    switch (this.stepIndex()) {
      case 0:
        return this.situation().trim().length > 0;
      case 1:
        return this.emotion() !== null;
      case 2:
        return true;
      case 3:
        return this.need().trim().length > 0;
      default:
        return false;
    }
  });

  protected onSituationInput(event: Event): void {
    this.situation.set((event.target as HTMLTextAreaElement).value);
  }

  protected onNeedInput(event: Event): void {
    this.need.set((event.target as HTMLInputElement).value);
  }

  protected onIntensityInput(event: Event): void {
    this.intensity.set(Number((event.target as HTMLInputElement).value));
  }

  protected selectEmotion(emotion: EmotionType): void {
    this.emotion.set(emotion);
  }

  protected next(): void {
    if (!this.canAdvance()) {
      return;
    }
    if (this.isLastStep()) {
      this.submit();
      return;
    }
    this.stepIndex.update((index) => index + 1);
  }

  protected back(): void {
    this.stepIndex.update((index) => Math.max(0, index - 1));
  }

  private submit(): void {
    const emotion = this.emotion();
    if (!emotion) {
      return;
    }
    this.submitted.emit({
      situation: this.situation().trim(),
      emotion,
      intensity: createIntensity(this.intensity()),
      need: this.need().trim(),
    });
  }
}
