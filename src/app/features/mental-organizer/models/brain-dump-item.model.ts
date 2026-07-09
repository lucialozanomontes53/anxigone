import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export const BRAIN_DUMP_CATEGORIES = ['action', 'waiting', 'not-my-control', 'release'] as const;

export type BrainDumpCategory = (typeof BRAIN_DUMP_CATEGORIES)[number];

export const BRAIN_DUMP_CATEGORY_LABELS: Record<BrainDumpCategory, string> = {
  action: 'Acción',
  waiting: 'Espera',
  'not-my-control': 'No depende de mí',
  release: 'Soltar',
};

export interface BrainDumpItem extends Identifiable {
  readonly content: string;
  /** null mientras el pensamiento está recién volcado y sin clasificar. */
  readonly category: BrainDumpCategory | null;
  readonly createdAt: ISODateString;
  readonly resolvedAt: ISODateString | null;
}
