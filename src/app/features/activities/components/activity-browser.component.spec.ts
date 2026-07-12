import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { PRESET_ACTIVITIES } from '../models/activity.model';
import { ActivityBrowserComponent, ActivityLogged } from './activity-browser.component';

async function setup() {
  const user = userEvent.setup();
  const onLogged = vi.fn<(value: ActivityLogged) => void>();
  await render(ActivityBrowserComponent, {
    bindings: [inputBinding('activities', () => PRESET_ACTIVITIES), outputBinding('logged', onLogged)],
  });
  return { user, onLogged };
}

describe('ActivityBrowserComponent', () => {
  it('agrupa las actividades por nivel de energía', async () => {
    await setup();

    expect(screen.getByText('Energía baja')).toBeInTheDocument();
    expect(screen.getByText('Energía media')).toBeInTheDocument();
    expect(screen.getByText('Energía alta')).toBeInTheDocument();
    expect(screen.getByText('Salir a caminar')).toBeInTheDocument();
  });

  it('muestra las opciones de valoración al marcar una actividad como hecha', async () => {
    const { user } = await setup();

    await user.click(screen.getAllByRole('button', { name: 'Ya la hice' })[0]!);

    expect(screen.getByText('¿Te ayudó?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mucho' })).toBeInTheDocument();
  });

  it('emite logged con la valoración elegida', async () => {
    const { user, onLogged } = await setup();
    const walkIndex = PRESET_ACTIVITIES.findIndex((activity) => activity.id === 'preset-walk');

    await user.click(screen.getAllByRole('button', { name: 'Ya la hice' })[walkIndex]!);
    await user.click(screen.getByRole('button', { name: 'Mucho' }));

    expect(onLogged).toHaveBeenCalledWith({ activityId: 'preset-walk', helpfulness: 'mucho' });
  });

  it('permite cancelar la valoración', async () => {
    const { user } = await setup();

    await user.click(screen.getAllByRole('button', { name: 'Ya la hice' })[0]!);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText('¿Te ayudó?')).not.toBeInTheDocument();
  });
});
