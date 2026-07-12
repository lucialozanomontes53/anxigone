import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { QuickAddVictoryFormComponent } from '../components/quick-add-victory-form.component';
import { VictoriesDashboardComponent } from '../components/victories-dashboard.component';
import { VictoryListComponent } from '../components/victory-list.component';
import { VictoriesStore } from '../stores/victories.store';

@Component({
  selector: 'app-victories-page',
  imports: [QuickAddVictoryFormComponent, VictoriesDashboardComponent, VictoryListComponent],
  templateUrl: './victories.page.html',
  styleUrl: './victories.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VictoriesPage {
  protected readonly store = inject(VictoriesStore);

  constructor() {
    void this.store.loadVictories();
  }

  protected async onAdded(text: string): Promise<void> {
    await this.store.addVictory(text);
  }

  protected async onDeleted(id: string): Promise<void> {
    await this.store.deleteVictory(id);
  }
}
