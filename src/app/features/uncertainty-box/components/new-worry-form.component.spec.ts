import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { NewWorryFormComponent, NewWorrySubmitted } from './new-worry-form.component';

async function setup() {
  const user = userEvent.setup();
  const onSubmitted = vi.fn<(value: NewWorrySubmitted) => void>();
  await render(NewWorryFormComponent, {
    bindings: [outputBinding('submitted', onSubmitted)],
  });
  return { user, onSubmitted };
}

describe('NewWorryFormComponent', () => {
  it('el botón de sellar está deshabilitado sin texto ni fecha elegida', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Sellar preocupación' })).toBeDisabled();
  });

  it('se habilita al escribir la preocupación y elegir "Mañana"', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('¿Qué preocupación quieres guardar?'), '¿Por qué no me ha respondido?');
    await user.click(screen.getByRole('button', { name: 'Mañana' }));

    expect(screen.getByRole('button', { name: 'Sellar preocupación' })).toBeEnabled();
  });

  it('con fecha personalizada, exige elegir una fecha antes de habilitar el envío', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('¿Qué preocupación quieres guardar?'), 'preocupación');
    await user.click(screen.getByRole('button', { name: 'Elegir fecha' }));

    expect(screen.getByRole('button', { name: 'Sellar preocupación' })).toBeDisabled();

    await user.type(screen.getByLabelText('Fecha de revisión'), '2026-12-01');

    expect(screen.getByRole('button', { name: 'Sellar preocupación' })).toBeEnabled();
  });

  it('emite submitted con el texto y la fecha calculada, y limpia el formulario', async () => {
    const { user, onSubmitted } = await setup();

    await user.type(screen.getByLabelText('¿Qué preocupación quieres guardar?'), '¿Por qué no me ha respondido?');
    await user.click(screen.getByRole('button', { name: 'Dentro de 3 días' }));
    await user.click(screen.getByRole('button', { name: 'Sellar preocupación' }));

    expect(onSubmitted).toHaveBeenCalledTimes(1);
    const emitted = onSubmitted.mock.calls[0]?.[0];
    expect(emitted?.worryText).toBe('¿Por qué no me ha respondido?');
    expect(Number.isNaN(new Date(emitted?.revisitAt ?? '').getTime())).toBe(false);

    expect(screen.getByLabelText('¿Qué preocupación quieres guardar?')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Sellar preocupación' })).toBeDisabled();
  });
});
