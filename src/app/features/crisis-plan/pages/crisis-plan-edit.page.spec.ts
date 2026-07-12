import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { CrisisPlanIndexedDbRepository } from '../repositories/crisis-plan-indexeddb.repository';
import { CrisisPlanRepository } from '../repositories/crisis-plan.repository';
import { CrisisPlanStore } from '../stores/crisis-plan.store';
import { CrisisPlanEditPage } from './crisis-plan-edit.page';

async function setup() {
  const user = userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'crisisPlans', keyPath: 'id' }],
  };

  await render(CrisisPlanEditPage, {
    providers: [
      CrisisPlanStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: CrisisPlanRepository, useClass: CrisisPlanIndexedDbRepository },
      provideRouter([]),
    ],
  });

  return { user };
}

describe('CrisisPlanEditPage', () => {
  it('muestra las 5 listas editables y el formulario de contactos', async () => {
    await setup();

    expect(screen.getByText('Señales de alerta')).toBeInTheDocument();
    expect(screen.getByText('Cosas que empeoran mi ansiedad')).toBeInTheDocument();
    expect(screen.getByText('Cosas que suelen ayudarme')).toBeInTheDocument();
    expect(screen.getByText('Recordatorios importantes')).toBeInTheDocument();
    expect(screen.getByText('Razones para no actuar impulsivamente')).toBeInTheDocument();
    expect(screen.getByText('Personas de apoyo')).toBeInTheDocument();
  });

  it('añade un elemento a la lista de señales de alerta y persiste el cambio', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('Añadir a Señales de alerta'), 'Reviso el móvil constantemente');
    await user.click(screen.getAllByRole('button', { name: 'Añadir' })[0]!);

    expect(await screen.findByText('Reviso el móvil constantemente')).toBeInTheDocument();
  });

  it('añade un contacto de apoyo', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.type(screen.getByLabelText('Teléfono'), '600111222');
    await user.click(screen.getByRole('button', { name: 'Añadir contacto' }));

    expect(await screen.findByRole('link', { name: '600111222' })).toBeInTheDocument();
  });

  it('elimina un contacto de apoyo', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.type(screen.getByLabelText('Teléfono'), '600111222');
    await user.click(screen.getByRole('button', { name: 'Añadir contacto' }));
    await screen.findByRole('link', { name: '600111222' });

    await user.click(screen.getByRole('button', { name: 'Eliminar contacto Ana' }));

    await vi.waitFor(() => {
      expect(screen.queryByRole('link', { name: '600111222' })).not.toBeInTheDocument();
    });
  });

  it('enlaza a la pantalla de activación "No estoy bien"', async () => {
    await setup();

    expect(screen.getByRole('link', { name: 'Ver la pantalla de "No estoy bien"' })).toHaveAttribute(
      'href',
      '/plan-de-crisis/activar',
    );
  });
});
