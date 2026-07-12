import { Identifiable } from '../../../core/persistence/repository.base';

export interface SupportContact extends Identifiable {
  readonly name: string;
  readonly phone: string;
  readonly note: string;
}
