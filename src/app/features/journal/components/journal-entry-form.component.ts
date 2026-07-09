import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

import { EMOTION_LABELS, EMOTION_TYPES, EmotionType } from '../../../shared/models/emotion-type.model';
import { createIntensity } from '../../../shared/models/intensity.model';
import { CreateJournalEntryInput } from '../stores/journal.store';

@Component({
  selector: 'app-journal-entry-form',
  templateUrl: './journal-entry-form.component.html',
  styleUrl: './journal-entry-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntryFormComponent {
  readonly submitted = output<CreateJournalEntryInput>();

  protected readonly emotionOptions = EMOTION_TYPES;
  protected readonly emotionLabels = EMOTION_LABELS;

  protected readonly emotion = signal<EmotionType | null>(null);
  protected readonly intensity = signal(5);
  protected readonly situation = signal('');
  protected readonly facts = signal('');
  protected readonly interpretations = signal('');
  protected readonly fears = signal('');
  protected readonly alternatives = signal('');
  protected readonly needs = signal('');

  protected readonly canSubmit = computed(
    () => this.emotion() !== null && this.situation().trim().length > 0,
  );

  protected selectEmotion(emotion: EmotionType): void {
    this.emotion.set(emotion);
  }

  protected onIntensityInput(event: Event): void {
    this.intensity.set(Number((event.target as HTMLInputElement).value));
  }

  protected onSituationInput(event: Event): void {
    this.situation.set((event.target as HTMLTextAreaElement).value);
  }

  protected onFactsInput(event: Event): void {
    this.facts.set((event.target as HTMLTextAreaElement).value);
  }

  protected onInterpretationsInput(event: Event): void {
    this.interpretations.set((event.target as HTMLTextAreaElement).value);
  }

  protected onFearsInput(event: Event): void {
    this.fears.set((event.target as HTMLTextAreaElement).value);
  }

  protected onAlternativesInput(event: Event): void {
    this.alternatives.set((event.target as HTMLTextAreaElement).value);
  }

  protected onNeedsInput(event: Event): void {
    this.needs.set((event.target as HTMLInputElement).value);
  }

  protected submit(): void {
    const emotion = this.emotion();
    if (!this.canSubmit() || !emotion) {
      return;
    }
    this.submitted.emit({
      emotion,
      intensity: createIntensity(this.intensity()),
      situation: this.situation().trim(),
      facts: this.facts().trim(),
      interpretations: this.interpretations().trim(),
      fears: this.fears().trim(),
      alternatives: this.alternatives().trim(),
      needs: this.needs().trim(),
    });
    this.reset();
  }

  private reset(): void {
    this.emotion.set(null);
    this.intensity.set(5);
    this.situation.set('');
    this.facts.set('');
    this.interpretations.set('');
    this.fears.set('');
    this.alternatives.set('');
    this.needs.set('');
  }
}
