import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { UncertaintyEntry } from '../models/uncertainty-entry.model';

@Component({
  selector: 'app-sealed-worries-list',
  templateUrl: './sealed-worries-list.component.html',
  styleUrl: './sealed-worries-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SealedWorriesListComponent {
  readonly entries = input.required<readonly UncertaintyEntry[]>();

  protected formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('es-ES', { dateStyle: 'long' });
  }
}
