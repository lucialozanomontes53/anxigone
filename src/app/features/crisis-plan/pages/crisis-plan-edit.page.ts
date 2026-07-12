import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EditableStringListComponent } from '../../../shared/ui/editable-string-list/editable-string-list.component';
import { SupportContactFormComponent } from '../components/support-contact-form.component';
import { CrisisPlanListField } from '../models/crisis-plan.model';
import { CrisisPlanStore, NewSupportContactInput } from '../stores/crisis-plan.store';

@Component({
  selector: 'app-crisis-plan-edit-page',
  imports: [RouterLink, EditableStringListComponent, SupportContactFormComponent],
  templateUrl: './crisis-plan-edit.page.html',
  styleUrl: './crisis-plan-edit.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrisisPlanEditPage {
  protected readonly store = inject(CrisisPlanStore);

  constructor() {
    void this.store.loadPlan();
  }

  protected onListChanged(field: CrisisPlanListField, items: readonly string[]): void {
    void this.store.updateList(field, items);
  }

  protected onContactAdded(input: NewSupportContactInput): void {
    void this.store.addContact(input);
  }

  protected onContactRemoved(id: string): void {
    void this.store.removeContact(id);
  }
}
