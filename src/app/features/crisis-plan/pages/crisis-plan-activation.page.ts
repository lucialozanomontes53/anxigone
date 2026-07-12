import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BREATHING_PATTERNS } from '../../../shared/models/breathing-pattern.model';
import { GROUNDING_5_4_3_2_1_STEPS } from '../../../shared/models/grounding-step.model';
import { BreathingTimerComponent } from '../../../shared/ui/breathing-timer/breathing-timer.component';
import { GroundingGuideComponent } from '../../../shared/ui/grounding-guide/grounding-guide.component';
import { CrisisPlanStore } from '../stores/crisis-plan.store';

type InlineTool = 'none' | 'breathing' | 'grounding';

@Component({
  selector: 'app-crisis-plan-activation-page',
  imports: [RouterLink, BreathingTimerComponent, GroundingGuideComponent],
  templateUrl: './crisis-plan-activation.page.html',
  styleUrl: './crisis-plan-activation.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrisisPlanActivationPage {
  protected readonly store = inject(CrisisPlanStore);

  protected readonly diaphragmaticPattern = BREATHING_PATTERNS.diaphragmatic;
  protected readonly groundingSteps = GROUNDING_5_4_3_2_1_STEPS;
  protected readonly activeTool = signal<InlineTool>('none');

  constructor() {
    void this.store.loadPlan();
  }

  protected toggleTool(tool: InlineTool): void {
    this.activeTool.set(this.activeTool() === tool ? 'none' : tool);
  }
}
