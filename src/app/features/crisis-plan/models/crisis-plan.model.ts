import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';
import { SupportContact } from './support-contact.model';

/** `CrisisPlan` es un documento singleton: siempre se persiste/lee con este id fijo (ver ADR-19). */
export const DEFAULT_CRISIS_PLAN_ID = 'default';

export type CrisisPlanListField =
  | 'warningSigns'
  | 'worseningTriggers'
  | 'helpfulActions'
  | 'reminders'
  | 'reasonsNotToAct';

export interface CrisisPlan extends Identifiable {
  readonly warningSigns: readonly string[];
  readonly worseningTriggers: readonly string[];
  readonly helpfulActions: readonly string[];
  readonly reminders: readonly string[];
  readonly reasonsNotToAct: readonly string[];
  readonly supportContacts: readonly SupportContact[];
  readonly updatedAt: ISODateString;
}

export function createEmptyCrisisPlan(now: ISODateString): CrisisPlan {
  return {
    id: DEFAULT_CRISIS_PLAN_ID,
    warningSigns: [],
    worseningTriggers: [],
    helpfulActions: [],
    reminders: [],
    reasonsNotToAct: [],
    supportContacts: [],
    updatedAt: now,
  };
}
