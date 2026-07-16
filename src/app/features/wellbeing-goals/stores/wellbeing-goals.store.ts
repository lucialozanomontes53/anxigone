import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import { ISODateString } from '../../../shared/models/iso-date-string.model';
import { GoalCheckIn, WellbeingGoal } from '../models/wellbeing-goal.model';
import { WellbeingGoalRepository } from '../repositories/wellbeing-goal.repository';

interface WellbeingGoalsState {
  readonly goals: readonly WellbeingGoal[];
  readonly referenceNow: ISODateString;
  readonly isLoading: boolean;
}

function byMostRecentFirst(a: WellbeingGoal, b: WellbeingGoal): number {
  return b.createdAt.localeCompare(a.createdAt);
}

@Injectable()
export class WellbeingGoalsStore extends SignalStore<WellbeingGoalsState> {
  private readonly repository = inject(WellbeingGoalRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  readonly goals = this.select((state) => [...state.goals].sort(byMostRecentFirst));
  readonly referenceNow = this.select((state) => state.referenceNow);
  readonly isLoading = this.select((state) => state.isLoading);

  constructor() {
    super({ goals: [], referenceNow: inject(ClockService).now(), isLoading: false });
  }

  async loadGoals(): Promise<void> {
    this.patch({ isLoading: true, referenceNow: this.clock.now() });
    const goals = await this.repository.findAll();
    this.patch({ goals, isLoading: false });
  }

  async addGoal(text: string, targetDate: ISODateString | null): Promise<void> {
    const goal: WellbeingGoal = {
      id: this.idGenerator.generate(),
      text,
      targetDate,
      checkIns: [],
      createdAt: this.clock.now(),
    };
    await this.repository.save(goal);
    this.patch({ goals: [...this.snapshot.goals, goal] });
  }

  async addCheckIn(goalId: string, metGoal: boolean, reflection: string): Promise<void> {
    const goal = this.snapshot.goals.find((candidate) => candidate.id === goalId);
    if (!goal) {
      return;
    }
    const checkIn: GoalCheckIn = {
      id: this.idGenerator.generate(),
      date: this.clock.now(),
      metGoal,
      reflection,
    };
    const updated: WellbeingGoal = { ...goal, checkIns: [...goal.checkIns, checkIn] };
    await this.repository.save(updated);
    this.patch({
      goals: this.snapshot.goals.map((candidate) => (candidate.id === goalId ? updated : candidate)),
    });
  }

  async deleteGoal(id: string): Promise<void> {
    await this.repository.deleteById(id);
    this.patch({ goals: this.snapshot.goals.filter((goal) => goal.id !== id) });
  }
}
