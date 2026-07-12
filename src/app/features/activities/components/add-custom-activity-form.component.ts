import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';

import { ENERGY_LEVELS, ENERGY_LEVEL_LABELS, EnergyLevel } from '../../../shared/models/energy-level.model';
import { NewCustomActivityInput } from '../stores/activities.store';

@Component({
  selector: 'app-add-custom-activity-form',
  templateUrl: './add-custom-activity-form.component.html',
  styleUrl: './add-custom-activity-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddCustomActivityFormComponent {
  readonly added = output<NewCustomActivityInput>();

  protected readonly energyLevels = ENERGY_LEVELS;
  protected readonly energyLevelLabels = ENERGY_LEVEL_LABELS;

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly energyLevel = signal<EnergyLevel | null>(null);

  protected readonly canSubmit = computed(
    () => this.title().trim().length > 0 && this.energyLevel() !== null,
  );

  protected onTitleInput(event: Event): void {
    this.title.set((event.target as HTMLInputElement).value);
  }

  protected onDescriptionInput(event: Event): void {
    this.description.set((event.target as HTMLInputElement).value);
  }

  protected selectEnergyLevel(level: EnergyLevel): void {
    this.energyLevel.set(level);
  }

  protected submit(): void {
    const level = this.energyLevel();
    if (!this.canSubmit() || !level) {
      return;
    }
    this.added.emit({
      title: this.title().trim(),
      description: this.description().trim(),
      energyLevel: level,
    });
    this.reset();
  }

  private reset(): void {
    this.title.set('');
    this.description.set('');
    this.energyLevel.set(null);
  }
}
