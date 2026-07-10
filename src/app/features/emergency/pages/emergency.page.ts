import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { BlockingConfirmComponent } from '../components/blocking-confirm.component';
import { BlockingLockComponent } from '../components/blocking-lock.component';
import { BlockingSetupComponent, BlockingSetupResult } from '../components/blocking-setup.component';
import { EmergencyIntakeFormComponent } from '../components/emergency-intake-form.component';
import { EmergencyToolboxComponent } from '../components/emergency-toolbox.component';
import { BlockingReflection } from '../models/blocking-session.model';
import { BlockingSessionStore } from '../stores/blocking-session.store';
import { EmergencyStore, StartEventInput } from '../stores/emergency.store';

type EmergencyView =
  | 'intake'
  | 'toolbox'
  | 'blocking-setup'
  | 'blocking-confirm'
  | 'blocking-lock'
  | 'resolved';

@Component({
  selector: 'app-emergency-page',
  imports: [
    EmergencyIntakeFormComponent,
    EmergencyToolboxComponent,
    BlockingSetupComponent,
    BlockingConfirmComponent,
    BlockingLockComponent,
  ],
  templateUrl: './emergency.page.html',
  styleUrl: './emergency.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmergencyPage {
  protected readonly store = inject(EmergencyStore);
  protected readonly blockingStore = inject(BlockingSessionStore);

  private readonly justResolved = signal(false);
  private readonly isSettingUpBlocking = signal(false);
  private readonly pendingSetup = signal<BlockingSetupResult | null>(null);

  protected readonly view = computed<EmergencyView>(() => {
    if (this.blockingStore.activeSession()) {
      return 'blocking-lock';
    }
    if (this.justResolved()) {
      return 'resolved';
    }
    if (!this.store.activeEvent()) {
      return 'intake';
    }
    if (this.pendingSetup()) {
      return 'blocking-confirm';
    }
    return this.isSettingUpBlocking() ? 'blocking-setup' : 'toolbox';
  });

  protected async onIntakeSubmitted(input: StartEventInput): Promise<void> {
    await this.store.startEvent(input);
  }

  protected async onToolUsed(toolId: string): Promise<void> {
    await this.store.recordToolUsed(toolId);
  }

  protected onWaitingModeRequested(): void {
    this.isSettingUpBlocking.set(true);
  }

  protected async onBlockingSetupSubmitted(result: BlockingSetupResult): Promise<void> {
    if (result.mode === 'shielded') {
      this.pendingSetup.set(result);
      return;
    }
    await this.startBlocking(result);
  }

  protected onBlockingConfirmCancelled(): void {
    this.pendingSetup.set(null);
    this.isSettingUpBlocking.set(false);
  }

  protected async onBlockingConfirmConfirmed(): Promise<void> {
    const pending = this.pendingSetup();
    if (!pending) {
      return;
    }
    await this.startBlocking(pending);
    this.pendingSetup.set(null);
  }

  protected async onBlockingCancelRequested(): Promise<void> {
    await this.blockingStore.cancelSession();
    this.isSettingUpBlocking.set(false);
  }

  protected async onBlockingCompleted(reflection: BlockingReflection): Promise<void> {
    await this.blockingStore.completeSession(reflection);
  }

  protected async onResolved(): Promise<void> {
    await this.store.resolveActiveEvent();
    this.justResolved.set(true);
  }

  protected startNewEvent(): void {
    this.justResolved.set(false);
    this.isSettingUpBlocking.set(false);
    this.store.clearActiveEvent();
  }

  private async startBlocking(result: BlockingSetupResult): Promise<void> {
    await this.blockingStore.startSession({
      mode: result.mode,
      reason: result.reason,
      blockedApps: result.blockedApps,
      durationMin: result.durationMin,
      emergencyEventId: this.store.activeEvent()?.id ?? null,
    });
    await this.store.markWaitingModeActivated();
    this.isSettingUpBlocking.set(false);
  }
}
