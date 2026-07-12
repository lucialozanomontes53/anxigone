import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NewWorryFormComponent, NewWorrySubmitted } from '../components/new-worry-form.component';
import { ReviewedWorriesStatsComponent } from '../components/reviewed-worries-stats.component';
import { SealedWorriesListComponent } from '../components/sealed-worries-list.component';
import { WorryReviewFormComponent } from '../components/worry-review-form.component';
import { UncertaintyReview } from '../models/uncertainty-entry.model';
import { UncertaintyBoxStore } from '../stores/uncertainty-box.store';

@Component({
  selector: 'app-uncertainty-box-page',
  imports: [
    NewWorryFormComponent,
    SealedWorriesListComponent,
    WorryReviewFormComponent,
    ReviewedWorriesStatsComponent,
  ],
  templateUrl: './uncertainty-box.page.html',
  styleUrl: './uncertainty-box.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UncertaintyBoxPage {
  protected readonly store = inject(UncertaintyBoxStore);

  constructor() {
    void this.store.loadEntries();
  }

  protected async onSubmitted(value: NewWorrySubmitted): Promise<void> {
    await this.store.addEntry(value.worryText, value.revisitAt);
  }

  protected async onReviewed(id: string, review: UncertaintyReview): Promise<void> {
    await this.store.reviewEntry(id, review);
  }
}
