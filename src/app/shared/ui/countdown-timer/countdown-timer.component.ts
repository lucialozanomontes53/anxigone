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

@Component({
  selector: 'app-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownTimerComponent {
  readonly durationSec = input.required<number>();
  readonly label = input('');
  readonly finished = output<void>();

  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private intervalId: ReturnType<typeof setInterval> | undefined;

  protected readonly isRunning = signal(false);
  protected readonly secondsLeft = signal(0);
  protected readonly progressRatio = computed(() =>
    this.durationSec() > 0 ? 1 - this.secondsLeft() / this.durationSec() : 0,
  );

  protected readonly formattedTime = computed(() => {
    const total = this.secondsLeft();
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearTimer());
  }

  protected start(): void {
    if (this.isRunning() || this.durationSec() <= 0) {
      return;
    }
    this.isRunning.set(true);
    this.secondsLeft.set(this.durationSec());
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  protected stop(): void {
    this.clearTimer();
    this.isRunning.set(false);
  }

  private tick(): void {
    const remaining = this.secondsLeft() - 1;
    this.secondsLeft.set(Math.max(remaining, 0));
    if (remaining <= 0) {
      this.stop();
      void this.liveAnnouncer.announce('Tiempo terminado');
      this.finished.emit();
    }
  }

  private clearTimer(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
