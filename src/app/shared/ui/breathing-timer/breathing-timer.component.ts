import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { BreathingPattern } from '../../models/breathing-pattern.model';
import { BREATHING_PHASE_LABELS, buildBreathingPhases } from './breathing-phase';

@Component({
  selector: 'app-breathing-timer',
  templateUrl: './breathing-timer.component.html',
  styleUrl: './breathing-timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreathingTimerComponent {
  readonly pattern = input.required<BreathingPattern>();
  readonly cycles = input(4);
  readonly completed = output<void>();

  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly phases = computed(() => buildBreathingPhases(this.pattern()));
  private intervalId: ReturnType<typeof setInterval> | undefined;

  protected readonly isRunning = signal(false);
  protected readonly phaseIndex = signal(0);
  protected readonly secondsLeft = signal(0);
  protected readonly cyclesCompleted = signal(0);

  protected readonly currentPhase = computed(() => this.phases()[this.phaseIndex()]?.phase);
  protected readonly phaseLabel = computed(() => {
    const phase = this.currentPhase();
    return phase ? BREATHING_PHASE_LABELS[phase] : '';
  });
  protected readonly currentPhaseDuration = computed(
    () => this.phases()[this.phaseIndex()]?.durationSec ?? 0,
  );
  protected readonly isExpandedPhase = computed(() => {
    const phase = this.currentPhase();
    return phase === 'inhale' || phase === 'hold';
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  protected start(): void {
    if (this.isRunning()) {
      return;
    }
    const firstPhase = this.phases()[0];
    if (!firstPhase) {
      return;
    }
    this.isRunning.set(true);
    this.phaseIndex.set(0);
    this.cyclesCompleted.set(0);
    this.secondsLeft.set(firstPhase.durationSec);
    this.announceCurrentPhase();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  protected stop(): void {
    this.clearTimer();
    this.isRunning.set(false);
  }

  private tick(): void {
    const remaining = this.secondsLeft() - 1;
    if (remaining > 0) {
      this.secondsLeft.set(remaining);
      return;
    }
    this.advancePhase();
  }

  private advancePhase(): void {
    const phases = this.phases();
    const nextIndex = this.phaseIndex() + 1;
    const nextPhase = phases[nextIndex];

    if (nextPhase) {
      this.phaseIndex.set(nextIndex);
      this.secondsLeft.set(nextPhase.durationSec);
      this.announceCurrentPhase();
      return;
    }

    const completedCycles = this.cyclesCompleted() + 1;
    this.cyclesCompleted.set(completedCycles);

    const firstPhase = phases[0];
    if (completedCycles >= this.cycles() || !firstPhase) {
      this.stop();
      this.completed.emit();
      return;
    }

    this.phaseIndex.set(0);
    this.secondsLeft.set(firstPhase.durationSec);
    this.announceCurrentPhase();
  }

  private announceCurrentPhase(): void {
    const phase = this.currentPhase();
    if (phase) {
      void this.liveAnnouncer.announce(BREATHING_PHASE_LABELS[phase]);
    }
  }

  private clearTimer(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
