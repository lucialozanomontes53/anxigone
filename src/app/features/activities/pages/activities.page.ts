import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ActivityBrowserComponent, ActivityLogged } from '../components/activity-browser.component';
import { AddCustomActivityFormComponent } from '../components/add-custom-activity-form.component';
import { EffectivenessRankingComponent } from '../components/effectiveness-ranking.component';
import { NewCustomActivityInput, ActivitiesStore } from '../stores/activities.store';

@Component({
  selector: 'app-activities-page',
  imports: [ActivityBrowserComponent, AddCustomActivityFormComponent, EffectivenessRankingComponent],
  templateUrl: './activities.page.html',
  styleUrl: './activities.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivitiesPage {
  protected readonly store = inject(ActivitiesStore);

  constructor() {
    void this.store.loadAll();
  }

  protected async onLogged(event: ActivityLogged): Promise<void> {
    await this.store.logUsage(event.activityId, event.helpfulness);
  }

  protected async onAdded(input: NewCustomActivityInput): Promise<void> {
    await this.store.addCustomActivity(input);
  }
}
