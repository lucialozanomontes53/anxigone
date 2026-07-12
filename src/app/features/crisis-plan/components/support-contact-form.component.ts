import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { SupportContact } from '../models/support-contact.model';
import { NewSupportContactInput } from '../stores/crisis-plan.store';

@Component({
  selector: 'app-support-contact-form',
  templateUrl: './support-contact-form.component.html',
  styleUrl: './support-contact-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportContactFormComponent {
  readonly contacts = input.required<readonly SupportContact[]>();
  readonly added = output<NewSupportContactInput>();
  readonly removed = output<string>();

  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly note = signal('');

  protected readonly canSubmit = computed(
    () => this.name().trim().length > 0 && this.phone().trim().length > 0,
  );

  protected onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  protected onPhoneInput(event: Event): void {
    this.phone.set((event.target as HTMLInputElement).value);
  }

  protected onNoteInput(event: Event): void {
    this.note.set((event.target as HTMLInputElement).value);
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.added.emit({ name: this.name().trim(), phone: this.phone().trim(), note: this.note().trim() });
    this.reset();
  }

  private reset(): void {
    this.name.set('');
    this.phone.set('');
    this.note.set('');
  }
}
