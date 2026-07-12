import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { ISODateString, toISODateString } from '../../../shared/models/iso-date-string.model';
import {
  REVISIT_PRESET_LABELS,
  REVISIT_PRESETS,
  RevisitPreset,
} from '../models/uncertainty-entry.model';

export interface NewWorrySubmitted {
  readonly worryText: string;
  readonly revisitAt: ISODateString;
}

const PRESET_DAYS: Record<Exclude<RevisitPreset, 'custom'>, number> = {
  tomorrow: 1,
  'three-days': 3,
  'one-week': 7,
};

@Component({
  selector: 'app-new-worry-form',
  templateUrl: './new-worry-form.component.html',
  styleUrl: './new-worry-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewWorryFormComponent {
  private readonly clock = inject(ClockService);

  readonly submitted = output<NewWorrySubmitted>();

  protected readonly presetOptions = REVISIT_PRESETS;
  protected readonly presetLabels = REVISIT_PRESET_LABELS;

  protected readonly worryText = signal('');
  protected readonly selectedPreset = signal<RevisitPreset | null>(null);
  protected readonly customDate = signal('');

  protected readonly canSubmit = computed(() => {
    const preset = this.selectedPreset();
    if (this.worryText().trim().length === 0 || !preset) {
      return false;
    }
    return preset === 'custom' ? this.customDate().length > 0 : true;
  });

  protected onWorryTextInput(event: Event): void {
    this.worryText.set((event.target as HTMLTextAreaElement).value);
  }

  protected selectPreset(preset: RevisitPreset): void {
    this.selectedPreset.set(preset);
  }

  protected onCustomDateInput(event: Event): void {
    this.customDate.set((event.target as HTMLInputElement).value);
  }

  protected submit(): void {
    const preset = this.selectedPreset();
    if (!this.canSubmit() || !preset) {
      return;
    }
    this.submitted.emit({
      worryText: this.worryText().trim(),
      revisitAt: this.computeRevisitAt(preset),
    });
    this.reset();
  }

  private computeRevisitAt(preset: RevisitPreset): ISODateString {
    if (preset === 'custom') {
      return toISODateString(new Date(this.customDate()));
    }
    const revisitDate = new Date(this.clock.now());
    revisitDate.setDate(revisitDate.getDate() + PRESET_DAYS[preset]);
    return toISODateString(revisitDate);
  }

  private reset(): void {
    this.worryText.set('');
    this.selectedPreset.set(null);
    this.customDate.set('');
  }
}
