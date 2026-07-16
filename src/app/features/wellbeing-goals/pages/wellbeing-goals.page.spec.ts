import { render, screen, within } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { WellbeingGoalIndexedDbRepository } from '../repositories/wellbeing-goal-indexeddb.repository';
import { WellbeingGoalRepository } from '../repositories/wellbeing-goal.repository';
import { WellbeingGoalsStore } from '../stores/wellbeing-goals.store';
import { WellbeingGoalsPage } from './wellbeing-goals.page';

async function setup() {
  const user = userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'wellbeingGoals', keyPath: 'id' }],
  };

  await render(WellbeingGoalsPage, {
    providers: [
      WellbeingGoalsStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: WellbeingGoalRepository, useClass: WellbeingGoalIndexedDbRepository },
    ],
  });

  return { user };
}

describe('WellbeingGoalsPage', () => {
  it('muestra el formulario y el mensaje de lista vacía', async () => {
    await setup();

    expect(screen.getByText('Añade un objetivo de bienestar')).toBeInTheDocument();
    expect(screen.getByText('Todavía no has añadido ningún objetivo.')).toBeInTheDocument();
  });

  it('añade un objetivo preestablecido y aparece en la lista', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Dormir mejor' }));

    expect(await screen.findByText('Dormir mejor', { selector: '.goal-card__text' })).toBeInTheDocument();
  });

  it('registra un check-in y actualiza el progreso semanal', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Esperar antes de actuar' }));
    const goalText = await screen.findByText('Esperar antes de actuar', { selector: '.goal-card__text' });
    const card = goalText.closest('.goal-card') as HTMLElement;

    await user.click(within(card).getByRole('button', { name: 'Registrar check-in' }));
    await user.click(within(card).getByRole('button', { name: 'Sí' }));
    await user.click(within(card).getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Esta semana: 100% (1)')).toBeInTheDocument();
  });

  it('elimina un objetivo', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Reducir comprobaciones' }));
    await screen.findByText('Reducir comprobaciones', { selector: '.goal-card__text' });

    await user.click(screen.getByRole('button', { name: 'Eliminar objetivo' }));

    expect(await screen.findByText('Todavía no has añadido ningún objetivo.')).toBeInTheDocument();
  });
});
