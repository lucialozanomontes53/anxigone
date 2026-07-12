import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { NewCustomActivityInput } from '../stores/activities.store';
import { AddCustomActivityFormComponent } from './add-custom-activity-form.component';

async function setup() {
  const user = userEvent.setup();
  const onAdded = vi.fn<(value: NewCustomActivityInput) => void>();
  await render(AddCustomActivityFormComponent, {
    bindings: [outputBinding('added', onAdded)],
  });
  return { user, onAdded };
}

describe('AddCustomActivityFormComponent', () => {
  it('el botón de añadir está deshabilitado sin título ni nivel de energía', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Añadir actividad' })).toBeDisabled();
  });

  it('se habilita al escribir el título y elegir un nivel de energía', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('Título'), 'Ver una serie');
    await user.click(screen.getByRole('button', { name: 'Energía baja' }));

    expect(screen.getByRole('button', { name: 'Añadir actividad' })).toBeEnabled();
  });

  it('emite added con los datos y limpia el formulario', async () => {
    const { user, onAdded } = await setup();

    await user.type(screen.getByLabelText('Título'), 'Ver una serie');
    await user.type(screen.getByLabelText('Descripción (opcional)'), 'Mi serie favorita');
    await user.click(screen.getByRole('button', { name: 'Energía baja' }));
    await user.click(screen.getByRole('button', { name: 'Añadir actividad' }));

    expect(onAdded).toHaveBeenCalledWith({
      title: 'Ver una serie',
      description: 'Mi serie favorita',
      energyLevel: 'low',
    });
    expect(screen.getByLabelText('Título')).toHaveValue('');
  });
});
