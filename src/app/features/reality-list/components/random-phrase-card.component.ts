import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { RealityPhrase } from '../models/reality-phrase.model';

@Component({
  selector: 'app-random-phrase-card',
  templateUrl: './random-phrase-card.component.html',
  styleUrl: './random-phrase-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RandomPhraseCardComponent {
  readonly phrases = input.required<readonly RealityPhrase[]>();

  protected readonly currentPhrase = signal<RealityPhrase | null>(null);

  protected shuffle(): void {
    const pool = this.pool();
    const index = Math.floor(Math.random() * pool.length);
    this.currentPhrase.set(pool[index] ?? null);
  }

  /** Prioriza las frases marcadas como prioritarias; si no hay ninguna, elige entre todas. */
  private pool(): readonly RealityPhrase[] {
    const priority = this.phrases().filter((phrase) => phrase.isPriority);
    return priority.length > 0 ? priority : this.phrases();
  }
}
