import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { UncertaintyEntryIndexedDbRepository } from '../repositories/uncertainty-entry-indexeddb.repository';
import { UncertaintyEntryRepository } from '../repositories/uncertainty-entry.repository';
import { UncertaintyBoxStore } from '../stores/uncertainty-box.store';
import { UncertaintyBoxPage } from './uncertainty-box.page';

async function setup() {
  const user = userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'uncertaintyEntries', keyPath: 'id' }],
  };

  await render(UncertaintyBoxPage, {
    providers: [
      UncertaintyBoxStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: UncertaintyEntryRepository, useClass: UncertaintyEntryIndexedDbRepository },
    ],
  });

  return { user };
}

describe('UncertaintyBoxPage', () => {
  it('muestra el formulario y los mensajes vacíos', async () => {
    await setup();

    expect(screen.getByText('¿Qué preocupación quieres guardar?')).toBeInTheDocument();
    expect(screen.getByText('No tienes preocupaciones selladas ahora mismo.')).toBeInTheDocument();
    expect(screen.getByText('Todavía no has revisado ninguna preocupación.')).toBeInTheDocument();
  });

  it('sella una preocupación nueva y aparece en la lista de selladas', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('¿Qué preocupación quieres guardar?'), '¿Por qué no me ha respondido?');
    await user.click(screen.getByRole('button', { name: 'Mañana' }));
    await user.click(screen.getByRole('button', { name: 'Sellar preocupación' }));

    expect(await screen.findByText('¿Por qué no me ha respondido?')).toBeInTheDocument();
    expect(screen.getByText('Selladas (1)')).toBeInTheDocument();
  });

  it('una preocupación con fecha ya pasada aparece lista para revisar, y al revisarla se actualizan las estadísticas', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('¿Qué preocupación quieres guardar?'), 'preocupación vencida');
    await user.click(screen.getByRole('button', { name: 'Elegir fecha' }));
    await user.type(screen.getByLabelText('Fecha de revisión'), '2020-01-01');
    await user.click(screen.getByRole('button', { name: 'Sellar preocupación' }));

    expect(await screen.findByText('Para revisar ahora')).toBeInTheDocument();
    expect(screen.getByText('preocupación vencida')).toBeInTheDocument();

    const siButtons = screen.getAllByRole('button', { name: 'Sí' });
    for (const button of siButtons) {
      await user.click(button);
    }
    await user.click(screen.getByRole('button', { name: 'Guardar revisión' }));

    expect(await screen.findByText('Revisadas (1)')).toBeInTheDocument();
    expect(screen.queryByText('Para revisar ahora')).not.toBeInTheDocument();
  });
});
