import { Identifiable } from '../../../core/persistence/repository.base';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export const BLOCKING_MODES = ['normal', 'shielded'] as const;
export type BlockingMode = (typeof BLOCKING_MODES)[number];

export type BlockingSessionStatus = 'active' | 'completed' | 'cancelled';

export interface BlockingReflection {
  readonly feelingNow: string;
  readonly urgencyDecreased: boolean;
  readonly stillWantsToOpen: boolean;
  readonly pauseHelped: boolean;
}

export interface BlockingSession extends Identifiable {
  readonly emergencyEventId: string | null;
  readonly mode: BlockingMode;
  /** Lo que la persona quiere posponer o evitar ("motivo registrado"). */
  readonly reason: string;
  /** Apps/impulsos declarados, de forma simbólica: no se bloquean de verdad (ver ADR-14). */
  readonly blockedApps: readonly string[];
  readonly durationMin: number;
  readonly startedAt: ISODateString;
  readonly endsAt: ISODateString;
  readonly status: BlockingSessionStatus;
  /** Contador best-effort de cambios de pestaña/foco durante la sesión activa. */
  readonly attemptCount: number;
  readonly reflection: BlockingReflection | null;
}
