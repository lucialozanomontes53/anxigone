import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { BREATHING_PATTERNS, BreathingPatternId } from '../../../shared/models/breathing-pattern.model';
import { GROUNDING_5_4_3_2_1_STEPS } from '../../../shared/models/grounding-step.model';
import { BreathingTimerComponent } from '../../../shared/ui/breathing-timer/breathing-timer.component';
import { GroundingGuideComponent } from '../../../shared/ui/grounding-guide/grounding-guide.component';
import { EmotionalToolsStore } from '../stores/emotional-tools.store';

type ToolView = 'menu' | BreathingPatternId | 'grounding';

const GROUNDING_TECHNIQUE_ID = '5-4-3-2-1';

@Component({
  selector: 'app-emotional-tools-page',
  imports: [BreathingTimerComponent, GroundingGuideComponent],
  templateUrl: './emotional-tools.page.html',
  styleUrl: './emotional-tools.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmotionalToolsPage {
  protected readonly store = inject(EmotionalToolsStore);

  protected readonly breathingPatterns = Object.values(BREATHING_PATTERNS);
  protected readonly boxPattern = BREATHING_PATTERNS.box;
  protected readonly pattern478 = BREATHING_PATTERNS['4-7-8'];
  protected readonly diaphragmaticPattern = BREATHING_PATTERNS.diaphragmatic;
  protected readonly groundingSteps = GROUNDING_5_4_3_2_1_STEPS;
  protected readonly view = signal<ToolView>('menu');

  private sessionStartedAtMs = 0;

  constructor() {
    void this.store.loadHistory();
  }

  protected open(view: ToolView): void {
    this.sessionStartedAtMs = Date.now();
    this.view.set(view);
  }

  protected backToMenu(): void {
    this.view.set('menu');
  }

  protected async onBreathingCompleted(patternId: BreathingPatternId): Promise<void> {
    await this.recordSession('breathing', patternId);
    this.view.set('menu');
  }

  protected async onGroundingCompleted(): Promise<void> {
    await this.recordSession('grounding', GROUNDING_TECHNIQUE_ID);
    this.view.set('menu');
  }

  private async recordSession(toolType: 'breathing' | 'grounding', techniqueId: string): Promise<void> {
    const elapsedSec = (Date.now() - this.sessionStartedAtMs) / 1000;
    await this.store.recordSession(toolType, techniqueId, elapsedSec);
  }
}
