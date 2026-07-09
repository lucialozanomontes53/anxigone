import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { StartEventInput } from '../stores/emergency.store';
import { EmergencyIntakeFormComponent } from './emergency-intake-form.component';

async function setup() {
  const user = userEvent.setup();
  const onSubmitted = vi.fn<(value: StartEventInput) => void>();
  await render(EmergencyIntakeFormComponent, {
    bindings: [outputBinding('submitted', onSubmitted)],
  });
  return { user, onSubmitted };
}

describe('EmergencyIntakeFormComponent', () => {
  it('el botón Siguiente está deshabilitado hasta escribir la situación', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
  });

  it('completa las 4 preguntas y emite submitted con los datos', async () => {
    const { user, onSubmitted } = await setup();

    await user.type(screen.getByLabelText('¿Qué ha pasado?'), 'Discusión con mi pareja');
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await user.click(screen.getByRole('button', { name: 'Ansiedad' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    await user.type(screen.getByLabelText('¿Qué necesitas ahora mismo?'), 'tranquilidad');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onSubmitted).toHaveBeenCalledWith({
      situation: 'Discusión con mi pareja',
      emotion: 'ansiedad',
      intensity: 5,
      need: 'tranquilidad',
    });
  });

  it('permite volver atrás con el botón Atrás', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('¿Qué ha pasado?'), 'algo pasó');
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('Paso 2 de 4')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Atrás' }));
    expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument();
    expect(screen.getByLabelText('¿Qué ha pasado?')).toHaveValue('algo pasó');
  });
});
