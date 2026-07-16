import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { GoalCheckIn, WellbeingGoal } from '../models/wellbeing-goal.model';
import { GoalCardComponent, GoalCheckedIn } from './goal-card.component';

const now = toISODateString(new Date('2026-01-10T12:00:00Z'));

function goal(overrides: Partial<WellbeingGoal> = {}): WellbeingGoal {
  return {
    id: 'goal-1',
    text: 'Dormir mejor',
    targetDate: null,
    checkIns: [],
    createdAt: now,
    ...overrides,
  };
}

async function setup(theGoal: WellbeingGoal = goal()) {
  const user = userEvent.setup();
  const onCheckedIn = vi.fn<(value: GoalCheckedIn) => void>();
  const onDeleted = vi.fn<() => void>();
  await render(GoalCardComponent, {
    bindings: [
      inputBinding('goal', () => theGoal),
      inputBinding('referenceNow', () => now),
      outputBinding('checkedIn', onCheckedIn),
      outputBinding('deleted', onDeleted),
    ],
  });
  return { user, onCheckedIn, onDeleted };
}

describe('GoalCardComponent', () => {
  it('muestra el texto del objetivo y el progreso en 0', async () => {
    await setup();

    expect(screen.getByText('Dormir mejor')).toBeInTheDocument();
    expect(screen.getByText('Esta semana: 0% (0)')).toBeInTheDocument();
  });

  it('abre el formulario de check-in y lo cancela', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Registrar check-in' }));
    expect(screen.getByText('¿Has cumplido este objetivo?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('¿Has cumplido este objetivo?')).not.toBeInTheDocument();
  });

  it('emite checkedIn con la respuesta y la reflexión', async () => {
    const { user, onCheckedIn } = await setup();

    await user.click(screen.getByRole('button', { name: 'Registrar check-in' }));
    await user.click(screen.getByRole('button', { name: 'Sí' }));
    await user.type(screen.getByLabelText('Reflexión (opcional)'), 'Buen día');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onCheckedIn).toHaveBeenCalledWith({ metGoal: true, reflection: 'Buen día' });
  });

  it('muestra el historial de reflexiones cuando existen', async () => {
    const checkIn: GoalCheckIn = {
      id: 'check-1',
      date: toISODateString(new Date('2026-01-09T09:00:00Z')),
      metGoal: true,
      reflection: 'Fue bien',
    };
    await setup(goal({ checkIns: [checkIn] }));

    expect(screen.getByText(/Reflexiones anteriores/)).toBeInTheDocument();
    expect(screen.getByText('Fue bien')).toBeInTheDocument();
  });

  it('emite deleted al eliminar el objetivo', async () => {
    const { user, onDeleted } = await setup();

    await user.click(screen.getByRole('button', { name: 'Eliminar objetivo' }));

    expect(onDeleted).toHaveBeenCalled();
  });
});
