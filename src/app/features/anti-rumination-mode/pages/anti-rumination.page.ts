import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BREATHING_PATTERNS } from '../../../shared/models/breathing-pattern.model';
import { GROUNDING_5_4_3_2_1_STEPS } from '../../../shared/models/grounding-step.model';
import { BreathingTimerComponent } from '../../../shared/ui/breathing-timer/breathing-timer.component';
import { CountdownTimerComponent } from '../../../shared/ui/countdown-timer/countdown-timer.component';
import { GroundingGuideComponent } from '../../../shared/ui/grounding-guide/grounding-guide.component';
import { RUMINATION_STOP_DURATIONS_MIN } from '../models/rumination-stop-session.model';
import { RuminationStopStore } from '../stores/rumination-stop.store';

type InlineTool = 'none' | 'breathing' | 'grounding';

@Component({
  selector: 'app-anti-rumination-page',
  imports: [RouterLink, BreathingTimerComponent, GroundingGuideComponent, CountdownTimerComponent],
  templateUrl: './anti-rumination.page.html',
  styleUrl: './anti-rumination.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AntiRuminationPage {
  protected readonly store = inject(RuminationStopStore);
  protected readonly durations = RUMINATION_STOP_DURATIONS_MIN;

  protected readonly diaphragmaticPattern = BREATHING_PATTERNS.diaphragmatic;
  protected readonly groundingSteps = GROUNDING_5_4_3_2_1_STEPS;
  protected readonly activeTool = signal<InlineTool>('none');

  /** Igual que en `BlockingLockComponent`: se calcula una vez a partir de `endsAt`, cubriendo tanto el arranque como reabrir la app a mitad de la sesión. */
  protected readonly initialRemainingSec = computed(() => {
    const session = this.store.activeSession();
    if (!session) {
      return 0;
    }
    const endsAtMs = new Date(session.endsAt).getTime();
    return Math.max(0, Math.round((endsAtMs - Date.now()) / 1000));
  });

  protected start(durationMin: number): void {
    this.store.start(durationMin);
  }

  protected finish(): void {
    this.store.end();
  }

  protected toggleTool(tool: InlineTool): void {
    this.activeTool.set(this.activeTool() === tool ? 'none' : tool);
  }
}
