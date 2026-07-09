import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { EMOTION_LABELS } from '../../../shared/models/emotion-type.model';
import { JournalEntry } from '../models/journal-entry.model';

@Component({
  selector: 'app-journal-entry-list',
  templateUrl: './journal-entry-list.component.html',
  styleUrl: './journal-entry-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntryListComponent {
  readonly entries = input.required<readonly JournalEntry[]>();
  readonly deleted = output<string>();

  protected readonly emotionLabels = EMOTION_LABELS;

  protected formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
