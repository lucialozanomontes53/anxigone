import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

/** Pausa de autocompasión de 3 pasos (Kristin Neff): mindfulness, humanidad común, amabilidad. */
const STATEMENTS: readonly string[] = [
  'Esto es un momento de sufrimiento.',
  'El sufrimiento es parte de estar viva. No estoy sola en esto.',
  'Que pueda ser amable conmigo misma en este momento.',
];

@Component({
  selector: 'app-self-compassion-break',
  templateUrl: './self-compassion-break.component.html',
  styleUrl: './self-compassion-break.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelfCompassionBreakComponent {
  readonly completed = output<void>();

  protected readonly statements = STATEMENTS;
  protected readonly stepIndex = signal(0);
  protected readonly currentStatement = computed(() => this.statements[this.stepIndex()]);
  protected readonly isLastStep = computed(() => this.stepIndex() === this.statements.length - 1);

  protected next(): void {
    if (this.isLastStep()) {
      this.completed.emit();
      return;
    }
    this.stepIndex.update((index) => index + 1);
  }
}
