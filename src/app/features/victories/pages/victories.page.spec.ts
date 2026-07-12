import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { VictoryIndexedDbRepository } from '../repositories/victory-indexeddb.repository';
import { VictoryRepository } from '../repositories/victory.repository';
import { VictoriesStore } from '../stores/victories.store';
import { VictoriesPage } from './victories.page';

async function setup() {
  const user = userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'victories', keyPath: 'id' }],
  };

  await render(VictoriesPage, {
    providers: [
      VictoriesStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: VictoryRepository, useClass: VictoryIndexedDbRepository },
    ],
  });

  return { user };
}

describe('VictoriesPage', () => {
  it('muestra el dashboard en 0 y la lista vacía', async () => {
    await setup();

    expect(screen.getByText('Esta semana')).toBeInTheDocument();
    expect(screen.getByText('Todavía no has registrado ninguna victoria.')).toBeInTheDocument();
  });

  it('registra una victoria preestablecida y actualiza el dashboard', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Esperé antes de actuar' }));

    expect(await screen.findByText('Esperé antes de actuar', { selector: '.victory-list__text' })).toBeInTheDocument();
    const weekStat = screen.getByText('Esta semana').previousElementSibling;
    expect(weekStat).toHaveTextContent('1');
  });

  it('registra una victoria de texto libre y permite eliminarla', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('Otro avance'), 'Salí a caminar en vez de rumiar');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByText('Salí a caminar en vez de rumiar', { selector: '.victory-list__text' });

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('Todavía no has registrado ninguna victoria.')).toBeInTheDocument();
  });
});
