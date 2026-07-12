import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { PRESET_ACTIVITIES } from '../models/activity.model';
import { ActivityUsageIndexedDbRepository } from '../repositories/activity-usage-indexeddb.repository';
import { ActivityUsageRepository } from '../repositories/activity-usage.repository';
import { ActivityIndexedDbRepository } from '../repositories/activity-indexeddb.repository';
import { ActivityRepository } from '../repositories/activity.repository';
import { ActivitiesStore } from '../stores/activities.store';
import { ActivitiesPage } from './activities.page';

async function setup() {
  const user = userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [
      { name: 'activities', keyPath: 'id' },
      { name: 'activityUsages', keyPath: 'id' },
    ],
  };

  await render(ActivitiesPage, {
    providers: [
      ActivitiesStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: ActivityRepository, useClass: ActivityIndexedDbRepository },
      { provide: ActivityUsageRepository, useClass: ActivityUsageIndexedDbRepository },
    ],
  });

  return { user };
}

describe('ActivitiesPage', () => {
  it('muestra las actividades predefinidas y el mensaje de ranking vacío', async () => {
    await setup();

    expect(screen.getByText('Salir a caminar')).toBeInTheDocument();
    expect(
      screen.getByText('Marca alguna actividad como hecha para ver cuáles te ayudan más.'),
    ).toBeInTheDocument();
  });

  it('registra una valoración y actualiza el ranking de efectividad', async () => {
    const { user } = await setup();
    const walkIndex = PRESET_ACTIVITIES.findIndex((activity) => activity.id === 'preset-walk');

    await user.click(screen.getAllByRole('button', { name: 'Ya la hice' })[walkIndex]!);
    await user.click(screen.getByRole('button', { name: 'Mucho' }));

    expect(await screen.findByText('4.0/4 · 1x')).toBeInTheDocument();
  });

  it('añade una actividad personalizada y aparece en el navegador', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('Título'), 'Ver una serie');
    await user.click(screen.getByRole('button', { name: 'Energía baja' }));
    await user.click(screen.getByRole('button', { name: 'Añadir actividad' }));

    expect(await screen.findByText('Ver una serie')).toBeInTheDocument();
  });
});
