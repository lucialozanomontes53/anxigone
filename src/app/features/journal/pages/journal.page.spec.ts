import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { JournalEntryIndexedDbRepository } from '../repositories/journal-entry-indexeddb.repository';
import { JournalEntryRepository } from '../repositories/journal-entry.repository';
import { JournalStore } from '../stores/journal.store';
import { JournalPage } from './journal.page';

async function setup() {
  const user = userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'journalEntries', keyPath: 'id' }],
  };

  await render(JournalPage, {
    providers: [
      JournalStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: JournalEntryRepository, useClass: JournalEntryIndexedDbRepository },
    ],
  });

  return { user };
}

describe('JournalPage', () => {
  it('muestra el formulario y el mensaje de historial vacío', async () => {
    await setup();

    expect(screen.getByText('¿Qué ha pasado?')).toBeInTheDocument();
    expect(screen.getByText(/Todavía no hay entradas/)).toBeInTheDocument();
  });

  it('guarda una entrada nueva y aparece en el historial', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('¿Qué ha pasado?'), 'No me contestó al mensaje');
    await user.click(screen.getByRole('button', { name: 'Ansiedad' }));
    await user.click(screen.getByRole('button', { name: 'Guardar en el diario' }));

    expect(await screen.findByText(/Ansiedad · 5\/10/)).toBeInTheDocument();
  });

  it('elimina una entrada del historial', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('¿Qué ha pasado?'), 'algo pasó');
    await user.click(screen.getByRole('button', { name: 'Calma' }));
    await user.click(screen.getByRole('button', { name: 'Guardar en el diario' }));

    await user.click(await screen.findByText(/Calma · 5\/10/));
    await user.click(screen.getByRole('button', { name: 'Eliminar entrada' }));

    expect(await screen.findByText(/Todavía no hay entradas/)).toBeInTheDocument();
  });
});
