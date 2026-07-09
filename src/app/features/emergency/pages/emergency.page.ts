import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { EmergencyIntakeFormComponent } from '../components/emergency-intake-form.component';
import { EmergencyToolboxComponent } from '../components/emergency-toolbox.component';
import { EmergencyWaitingModeComponent, WaitingModeOutcome } from '../components/emergency-waiting-mode.component';
import {
  EmergencyWaitingSetupComponent,
  WaitingSetupInput,
} from '../components/emergency-waiting-setup.component';
import { EmergencyStore, StartEventInput } from '../stores/emergency.store';

type EmergencyView = 'intake' | 'toolbox' | 'waiting-setup' | 'waiting-mode' | 'resolved';

@Component({
  selector: 'app-emergency-page',
  imports: [
    EmergencyIntakeFormComponent,
    EmergencyToolboxComponent,
    EmergencyWaitingSetupComponent,
    EmergencyWaitingModeComponent,
  ],
  templateUrl: './emergency.page.html',
  styleUrl: './emergency.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmergencyPage {
  protected readonly store = inject(EmergencyStore);

  private readonly justResolved = signal(false);

  protected readonly view = computed<EmergencyView>(() => {
    if (this.justResolved()) {
      return 'resolved';
    }
    const waitingRecord = this.store.activeWaitingRecord();
    if (waitingRecord && waitingRecord.completedAt === null) {
      return 'waiting-mode';
    }
    if (!this.store.activeEvent()) {
      return 'intake';
    }
    return this.isSettingUpWaiting() ? 'waiting-setup' : 'toolbox';
  });

  private readonly isSettingUpWaiting = signal(false);

  protected async onIntakeSubmitted(input: StartEventInput): Promise<void> {
    await this.store.startEvent(input);
  }

  protected async onToolUsed(toolId: string): Promise<void> {
    await this.store.recordToolUsed(toolId);
  }

  protected onWaitingModeRequested(): void {
    this.isSettingUpWaiting.set(true);
  }

  protected async onWaitingSetupSubmitted(input: WaitingSetupInput): Promise<void> {
    await this.store.startWaitingMode(input.goal, input.timerDurationMin);
    this.isSettingUpWaiting.set(false);
  }

  protected async onWaitingOutcome(outcome: WaitingModeOutcome): Promise<void> {
    await this.store.completeWaitingRecord(outcome.reflectionNotes, outcome.impulseResisted);
  }

  protected async onResolved(): Promise<void> {
    await this.store.resolveActiveEvent();
    this.justResolved.set(true);
  }

  protected startNewEvent(): void {
    this.justResolved.set(false);
    this.isSettingUpWaiting.set(false);
    this.store.clearActiveEvent();
  }
}
