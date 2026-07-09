import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { BrainDumpItem } from '../models/brain-dump-item.model';

@Component({
  selector: 'app-brain-dump-column',
  templateUrl: './brain-dump-column.component.html',
  styleUrl: './brain-dump-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrainDumpColumnComponent {
  readonly title = input.required<string>();
  readonly items = input.required<readonly BrainDumpItem[]>();
  readonly resolved = output<string>();
  readonly deleted = output<string>();
}
