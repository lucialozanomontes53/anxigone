import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

import { BlockingMode } from '../models/blocking-session.model';

export interface BlockingSetupResult {
  readonly mode: BlockingMode;
  readonly reason: string;
  readonly blockedApps: readonly string[];
  readonly durationMin: number;
}

export const BLOCKING_DURATION_OPTIONS_MIN: readonly number[] = [5, 10, 15, 30];

@Component({
  selector: 'app-blocking-setup',
  templateUrl: './blocking-setup.component.html',
  styleUrl: './blocking-setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockingSetupComponent {
  readonly submitted = output<BlockingSetupResult>();

  protected readonly durationOptions = BLOCKING_DURATION_OPTIONS_MIN;

  protected readonly mode = signal<BlockingMode>('normal');
  protected readonly reason = signal('');
  protected readonly blockedApps = signal<readonly string[]>([]);
  protected readonly appDraft = signal('');
  protected readonly durationMin = signal(10);

  protected readonly canSubmit = computed(() => this.reason().trim().length > 0);

  protected selectMode(mode: BlockingMode): void {
    this.mode.set(mode);
  }

  protected onReasonInput(event: Event): void {
    this.reason.set((event.target as HTMLInputElement).value);
  }

  protected onAppDraftInput(event: Event): void {
    this.appDraft.set((event.target as HTMLInputElement).value);
  }

  protected addApp(): void {
    const value = this.appDraft().trim();
    if (!value || this.blockedApps().includes(value)) {
      this.appDraft.set('');
      return;
    }
    this.blockedApps.update((apps) => [...apps, value]);
    this.appDraft.set('');
  }

  protected removeApp(app: string): void {
    this.blockedApps.update((apps) => apps.filter((current) => current !== app));
  }

  protected selectDuration(minutes: number): void {
    this.durationMin.set(minutes);
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.submitted.emit({
      mode: this.mode(),
      reason: this.reason().trim(),
      blockedApps: this.blockedApps(),
      durationMin: this.durationMin(),
    });
  }
}
