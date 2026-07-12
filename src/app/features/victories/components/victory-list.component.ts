import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Victory } from '../models/victory.model';

@Component({
  selector: 'app-victory-list',
  templateUrl: './victory-list.component.html',
  styleUrl: './victory-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VictoryListComponent {
  readonly victories = input.required<readonly Victory[]>();
  readonly deleted = output<string>();

  protected formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
  }
}
