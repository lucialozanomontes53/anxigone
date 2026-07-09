import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import {
  BRAIN_DUMP_CATEGORIES,
  BRAIN_DUMP_CATEGORY_LABELS,
  BrainDumpCategory,
  BrainDumpItem,
} from '../models/brain-dump-item.model';

@Component({
  selector: 'app-brain-dump-inbox',
  templateUrl: './brain-dump-inbox.component.html',
  styleUrl: './brain-dump-inbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrainDumpInboxComponent {
  readonly items = input.required<readonly BrainDumpItem[]>();
  readonly added = output<string>();
  readonly classified = output<{ id: string; category: BrainDumpCategory }>();

  protected readonly categories = BRAIN_DUMP_CATEGORIES;
  protected readonly categoryLabels = BRAIN_DUMP_CATEGORY_LABELS;

  protected readonly draft = signal('');
  protected readonly canAdd = computed(() => this.draft().trim().length > 0);

  protected onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected add(): void {
    if (!this.canAdd()) {
      return;
    }
    this.added.emit(this.draft().trim());
    this.draft.set('');
  }
}
