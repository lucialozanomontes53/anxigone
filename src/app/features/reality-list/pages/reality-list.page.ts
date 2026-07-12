import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AddRealityPhraseFormComponent } from '../components/add-reality-phrase-form.component';
import { RandomPhraseCardComponent } from '../components/random-phrase-card.component';
import { RealityPhraseListComponent } from '../components/reality-phrase-list.component';
import { RealityListStore } from '../stores/reality-list.store';

@Component({
  selector: 'app-reality-list-page',
  imports: [AddRealityPhraseFormComponent, RandomPhraseCardComponent, RealityPhraseListComponent],
  templateUrl: './reality-list.page.html',
  styleUrl: './reality-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RealityListPage {
  protected readonly store = inject(RealityListStore);

  constructor() {
    void this.store.loadPhrases();
  }

  protected async onAdded(text: string): Promise<void> {
    await this.store.addPhrase(text);
  }

  protected async onFavoriteToggled(id: string): Promise<void> {
    await this.store.toggleFavorite(id);
  }

  protected async onPriorityToggled(id: string): Promise<void> {
    await this.store.togglePriority(id);
  }

  protected async onDeleted(id: string): Promise<void> {
    await this.store.deletePhrase(id);
  }
}
