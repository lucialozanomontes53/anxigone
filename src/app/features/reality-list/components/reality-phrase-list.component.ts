import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { RealityPhrase } from '../models/reality-phrase.model';

@Component({
  selector: 'app-reality-phrase-list',
  templateUrl: './reality-phrase-list.component.html',
  styleUrl: './reality-phrase-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RealityPhraseListComponent {
  readonly phrases = input.required<readonly RealityPhrase[]>();
  readonly favoriteToggled = output<string>();
  readonly priorityToggled = output<string>();
  readonly deleted = output<string>();
}
