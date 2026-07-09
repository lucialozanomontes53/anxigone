import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { CountdownTimerComponent } from '../../../shared/ui/countdown-timer/countdown-timer.component';
import { ImpulseWaitingRecord } from '../models/impulse-waiting-record.model';

export interface WaitingModeOutcome {
  readonly reflectionNotes: string;
  readonly impulseResisted: boolean;
}

const REFLECTION_PROMPTS: readonly string[] = [
  '¿Qué pasaría si esperases 10 minutos más antes de actuar?',
  '¿Qué necesitas realmente ahora mismo, más allá del impulso?',
  '¿Qué le dirías a una amiga que estuviera a punto de hacer esto?',
];

@Component({
  selector: 'app-emergency-waiting-mode',
  imports: [CountdownTimerComponent],
  templateUrl: './emergency-waiting-mode.component.html',
  styleUrl: './emergency-waiting-mode.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmergencyWaitingModeComponent {
  readonly waitingRecord = input.required<ImpulseWaitingRecord>();
  readonly outcome = output<WaitingModeOutcome>();

  protected readonly reflectionPrompts = REFLECTION_PROMPTS;
  protected readonly reflectionNotes = signal('');
  protected readonly timerFinished = signal(false);

  protected onReflectionInput(event: Event): void {
    this.reflectionNotes.set((event.target as HTMLTextAreaElement).value);
  }

  protected onTimerFinished(): void {
    this.timerFinished.set(true);
  }

  protected finish(impulseResisted: boolean): void {
    this.outcome.emit({
      reflectionNotes: this.reflectionNotes().trim(),
      impulseResisted,
    });
  }
}
