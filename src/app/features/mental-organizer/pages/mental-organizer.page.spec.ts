import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { BrainDumpItemIndexedDbRepository } from '../repositories/brain-dump-item-indexeddb.repository';
import { BrainDumpItemRepository } from '../repositories/brain-dump-item.repository';
import { MentalOrganizerStore } from '../stores/mental-organizer.store';
import { MentalOrganizerPage } from './mental-organizer.page';

async function setup() {
  const user = userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'brainDumpItems', keyPath: 'id' }],
  };

  await render(MentalOrganizerPage, {
    providers: [
      MentalOrganizerStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: BrainDumpItemRepository, useClass: BrainDumpItemIndexedDbRepository },
    ],
  });

  return { user };
}

describe('MentalOrganizerPage', () => {
  it('muestra las 4 columnas vacías al principio', async () => {
    await setup();

    expect(screen.getByText('Acción (0)')).toBeInTheDocument();
    expect(screen.getByText('Espera (0)')).toBeInTheDocument();
    expect(screen.getByText('No depende de mí (0)')).toBeInTheDocument();
    expect(screen.getByText('Soltar (0)')).toBeInTheDocument();
  });

  it('vuelca un pensamiento y lo clasifica en Acción', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText(/Suéltalo aquí/), 'Llamar al dentista{Enter}');
    expect(await screen.findByText('Llamar al dentista')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Acción' }));

    expect(await screen.findByText('Acción (1)')).toBeInTheDocument();
    // ya no está en la bandeja de sin-clasificar, que muestra los botones de categoría
    expect(screen.queryByRole('group', { name: /Clasificar/ })).not.toBeInTheDocument();
  });

  it('resuelve un item clasificado y desaparece de la columna', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText(/Suéltalo aquí/), 'Tarea pendiente{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Soltar' }));
    await screen.findByText('Soltar (1)');

    await user.click(screen.getByRole('button', { name: 'Resuelto' }));

    expect(await screen.findByText('Soltar (0)')).toBeInTheDocument();
  });
});
