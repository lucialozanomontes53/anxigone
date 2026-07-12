import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import { EnergyLevel } from '../../../shared/models/energy-level.model';
import { HelpfulnessRating, ActivityUsage, computeEffectivenessRanking } from '../models/activity-usage.model';
import { Activity, PRESET_ACTIVITIES } from '../models/activity.model';
import { ActivityUsageRepository } from '../repositories/activity-usage.repository';
import { ActivityRepository } from '../repositories/activity.repository';

export interface NewCustomActivityInput {
  readonly title: string;
  readonly description: string;
  readonly energyLevel: EnergyLevel;
}

interface ActivitiesState {
  readonly customActivities: readonly Activity[];
  readonly usages: readonly ActivityUsage[];
  readonly isLoading: boolean;
}

const INITIAL_STATE: ActivitiesState = { customActivities: [], usages: [], isLoading: false };

@Injectable()
export class ActivitiesStore extends SignalStore<ActivitiesState> {
  private readonly activityRepository = inject(ActivityRepository);
  private readonly usageRepository = inject(ActivityUsageRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  readonly allActivities = this.select((state) => [...PRESET_ACTIVITIES, ...state.customActivities]);
  readonly isLoading = this.select((state) => state.isLoading);
  readonly effectivenessRanking = this.select((state) => computeEffectivenessRanking(state.usages));

  constructor() {
    super(INITIAL_STATE);
  }

  async loadAll(): Promise<void> {
    this.patch({ isLoading: true });
    const [customActivities, usages] = await Promise.all([
      this.activityRepository.findAll(),
      this.usageRepository.findAll(),
    ]);
    this.patch({ customActivities, usages, isLoading: false });
  }

  async addCustomActivity(input: NewCustomActivityInput): Promise<void> {
    const activity: Activity = {
      id: this.idGenerator.generate(),
      title: input.title,
      description: input.description,
      energyLevel: input.energyLevel,
      isCustom: true,
      createdAt: this.clock.now(),
    };
    await this.activityRepository.save(activity);
    this.patch({ customActivities: [...this.snapshot.customActivities, activity] });
  }

  async logUsage(activityId: string, helpfulness: HelpfulnessRating): Promise<void> {
    const usage: ActivityUsage = {
      id: this.idGenerator.generate(),
      activityId,
      helpfulness,
      completedAt: this.clock.now(),
    };
    await this.usageRepository.save(usage);
    this.patch({ usages: [...this.snapshot.usages, usage] });
  }
}
