import { Injectable, inject } from '@angular/core';

import { ClockService } from '../../../core/services/clock.service';
import { IdGeneratorService } from '../../../core/services/id-generator.service';
import { SignalStore } from '../../../core/state/signal-store';
import {
  CrisisPlan,
  CrisisPlanListField,
  DEFAULT_CRISIS_PLAN_ID,
  createEmptyCrisisPlan,
} from '../models/crisis-plan.model';
import { SupportContact } from '../models/support-contact.model';
import { CrisisPlanRepository } from '../repositories/crisis-plan.repository';

export interface NewSupportContactInput {
  readonly name: string;
  readonly phone: string;
  readonly note: string;
}

interface CrisisPlanState {
  readonly plan: CrisisPlan;
  readonly isLoading: boolean;
}

@Injectable()
export class CrisisPlanStore extends SignalStore<CrisisPlanState> {
  private readonly repository = inject(CrisisPlanRepository);
  private readonly clock = inject(ClockService);
  private readonly idGenerator = inject(IdGeneratorService);

  readonly plan = this.select((state) => state.plan);
  readonly isLoading = this.select((state) => state.isLoading);

  constructor() {
    super({ plan: createEmptyCrisisPlan(inject(ClockService).now()), isLoading: false });
  }

  /** Si no existe todavía en IndexedDB, se queda con el plan vacío en memoria (sin escribir). */
  async loadPlan(): Promise<void> {
    this.patch({ isLoading: true });
    const existing = await this.repository.findById(DEFAULT_CRISIS_PLAN_ID);
    this.patch({ plan: existing ?? this.snapshot.plan, isLoading: false });
  }

  async updateList(field: CrisisPlanListField, items: readonly string[]): Promise<void> {
    await this.persist({ ...this.snapshot.plan, [field]: items });
  }

  async addContact(input: NewSupportContactInput): Promise<void> {
    const contact: SupportContact = { id: this.idGenerator.generate(), ...input };
    await this.persist({
      ...this.snapshot.plan,
      supportContacts: [...this.snapshot.plan.supportContacts, contact],
    });
  }

  async removeContact(id: string): Promise<void> {
    await this.persist({
      ...this.snapshot.plan,
      supportContacts: this.snapshot.plan.supportContacts.filter((contact) => contact.id !== id),
    });
  }

  private async persist(plan: CrisisPlan): Promise<void> {
    const updated: CrisisPlan = { ...plan, updatedAt: this.clock.now() };
    await this.repository.save(updated);
    this.patch({ plan: updated });
  }
}
