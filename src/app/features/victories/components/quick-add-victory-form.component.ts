import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

import { VICTORY_PRESETS } from '../models/victory.model';

@Component({
  selector: 'app-quick-add-victory-form',
  templateUrl: './quick-add-victory-form.component.html',
  styleUrl: './quick-add-victory-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAddVictoryFormComponent {
  readonly added = output<string>();

  protected readonly presets = VICTORY_PRESETS;
  protected readonly draft = signal('');
  protected readonly canAddDraft = computed(() => this.draft().trim().length > 0);

  protected onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected addDraft(): void {
    if (!this.canAddDraft()) {
      return;
    }
    this.added.emit(this.draft().trim());
    this.draft.set('');
  }
}
