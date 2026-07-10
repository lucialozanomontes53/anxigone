import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-blocking-confirm',
  templateUrl: './blocking-confirm.component.html',
  styleUrl: './blocking-confirm.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockingConfirmComponent {
  readonly cancelled = output<void>();
  readonly confirmed = output<void>();
}
