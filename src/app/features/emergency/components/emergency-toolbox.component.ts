import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';

import { BREATHING_PATTERNS } from '../../../shared/models/breathing-pattern.model';
import { GROUNDING_5_4_3_2_1_STEPS } from '../../../shared/models/grounding-step.model';
import { BreathingTimerComponent } from '../../../shared/ui/breathing-timer/breathing-timer.component';
import { CountdownTimerComponent } from '../../../shared/ui/countdown-timer/countdown-timer.component';
import { GroundingGuideComponent } from '../../../shared/ui/grounding-guide/grounding-guide.component';
import { SelfCompassionBreakComponent } from './self-compassion-break.component';

type ToolId = 'breathing' | 'grounding' | 'calm-countdown' | 'self-compassion';

@Component({
  selector: 'app-emergency-toolbox',
  imports: [
    BreathingTimerComponent,
    GroundingGuideComponent,
    CountdownTimerComponent,
    SelfCompassionBreakComponent,
  ],
  templateUrl: './emergency-toolbox.component.html',
  styleUrl: './emergency-toolbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmergencyToolboxComponent {
  readonly toolUsed = output<string>();
  readonly waitingModeRequested = output<void>();
  readonly resolved = output<void>();

  protected readonly boxBreathingPattern = BREATHING_PATTERNS['box'];
  protected readonly groundingSteps = GROUNDING_5_4_3_2_1_STEPS;
  protected readonly activeTool = signal<ToolId | null>(null);

  protected openTool(tool: ToolId): void {
    this.activeTool.set(tool);
  }

  protected closeTool(): void {
    this.activeTool.set(null);
  }

  protected onBreathingCompleted(): void {
    this.toolUsed.emit('breathing:box');
  }

  protected onGroundingCompleted(): void {
    this.toolUsed.emit('grounding:5-4-3-2-1');
  }

  protected onCountdownFinished(): void {
    this.toolUsed.emit('calm-countdown');
  }

  protected onSelfCompassionCompleted(): void {
    this.toolUsed.emit('self-compassion');
  }
}
