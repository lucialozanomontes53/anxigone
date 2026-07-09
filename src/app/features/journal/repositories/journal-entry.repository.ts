import { IndexedDbRepository } from '../../../core/persistence/repository.base';
import { JournalEntry } from '../models/journal-entry.model';

export abstract class JournalEntryRepository extends IndexedDbRepository<JournalEntry> {}
