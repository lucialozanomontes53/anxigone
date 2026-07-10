import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BREATHING_PATTERNS } from '../../../shared/models/breathing-pattern.model';
import { GROUNDING_5_4_3_2_1_STEPS } from '../../../shared/models/grounding-step.model';
import { BreathingTimerComponent } from '../../../shared/ui/breathing-timer/breathing-timer.component';
import { CountdownTimerComponent } from '../../../shared/ui/countdown-timer/countdown-timer.component';
import { GroundingGuideComponent } from '../../../shared/ui/grounding-guide/grounding-guide.component';
import { BlockingReflection, BlockingSession } from '../models/blocking-session.model';

type InlineTool = 'none' | 'breathing' | 'grounding';

@Component({
  selector: 'app-blocking-lock',
  imports: [RouterLink, BreathingTimerComponent, GroundingGuideComponent, CountdownTimerComponent],
  templateUrl: './blocking-lock.component.html',
  styleUrl: './blocking-lock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockingLockComponent {
  readonly session = input.required<BlockingSession>();
  readonly cancelRequested = output<void>();
  readonly completed = output<BlockingReflection>();

  protected readonly diaphragmaticPattern = BREATHING_PATTERNS.diaphragmatic;
  protected readonly groundingSteps = GROUNDING_5_4_3_2_1_STEPS;
  protected readonly activeTool = signal<InlineTool>('none');

  /**
   * Segundos restantes calculados una vez a partir de `endsAt` (persistido) frente al
   * reloj actual. Cubre tanto el arranque normal como reabrir la app a mitad de un bloqueo:
   * el `CountdownTimerComponent` ya no necesita saber nada sobre fechas de inicio/fin.
   */
  protected readonly initialRemainingSec = computed(() => {
    const endsAtMs = new Date(this.session().endsAt).getTime();
    return Math.max(0, Math.round((endsAtMs - Date.now()) / 1000));
  });

  private readonly timerFinished = signal(false);
  protected readonly isExpired = computed(
    () => this.initialRemainingSec() <= 0 || this.timerFinished(),
  );
  protected readonly canCancel = computed(() => this.session().mode === 'normal');

  protected readonly feelingNow = signal('');
  protected readonly urgencyDecreased = signal<boolean | null>(null);
  protected readonly stillWantsToOpen = signal<boolean | null>(null);
  protected readonly pauseHelped = signal<boolean | null>(null);
  protected readonly canSubmitReflection = computed(
    () =>
      this.urgencyDecreased() !== null &&
      this.stillWantsToOpen() !== null &&
      this.pauseHelped() !== null,
  );

  protected toggleTool(tool: InlineTool): void {
    this.activeTool.set(this.activeTool() === tool ? 'none' : tool);
  }

  protected onCountdownFinished(): void {
    this.timerFinished.set(true);
  }

  protected onFeelingNowInput(event: Event): void {
    this.feelingNow.set((event.target as HTMLInputElement).value);
  }

  protected submitReflection(): void {
    if (!this.canSubmitReflection()) {
      return;
    }
    this.completed.emit({
      feelingNow: this.feelingNow().trim(),
      urgencyDecreased: this.urgencyDecreased() ?? false,
      stillWantsToOpen: this.stillWantsToOpen() ?? false,
      pauseHelped: this.pauseHelped() ?? false,
    });
  }
}
