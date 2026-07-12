import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-editable-string-list',
  templateUrl: './editable-string-list.component.html',
  styleUrl: './editable-string-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableStringListComponent {
  readonly items = input.required<readonly string[]>();
  readonly label = input.required<string>();
  readonly itemsChanged = output<readonly string[]>();

  protected readonly draft = signal('');

  protected onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected addItem(): void {
    const value = this.draft().trim();
    if (!value) {
      return;
    }
    this.itemsChanged.emit([...this.items(), value]);
    this.draft.set('');
  }

  protected removeItem(index: number): void {
    this.itemsChanged.emit(this.items().filter((_, i) => i !== index));
  }
}
