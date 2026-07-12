import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

@Component({
  selector: 'app-add-reality-phrase-form',
  templateUrl: './add-reality-phrase-form.component.html',
  styleUrl: './add-reality-phrase-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRealityPhraseFormComponent {
  readonly added = output<string>();

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
