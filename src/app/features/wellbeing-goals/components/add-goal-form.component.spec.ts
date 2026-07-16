import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { AddGoalFormComponent, NewGoalSubmitted } from './add-goal-form.component';

async function setup() {
  const user = userEvent.setup();
  const onAdded = vi.fn<(value: NewGoalSubmitted) => void>();
  await render(AddGoalFormComponent, {
    bindings: [outputBinding('added', onAdded)],
  });
  return { user, onAdded };
}

describe('AddGoalFormComponent', () => {
  it('muestra los objetivos preestablecidos', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Dormir mejor' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Practicar autocompasión' })).toBeInTheDocument();
  });

  it('emite added al pulsar un objetivo preestablecido, sin fecha objetivo', async () => {
    const { user, onAdded } = await setup();

    await user.click(screen.getByRole('button', { name: 'Dormir mejor' }));

    expect(onAdded).toHaveBeenCalledWith({ text: 'Dormir mejor', targetDate: null });
  });

  it('el botón de guardar texto libre está deshabilitado sin texto', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('emite added con el texto libre y limpia el campo', async () => {
    const { user, onAdded } = await setup();

    await user.type(screen.getByLabelText('Otro objetivo'), 'Leer antes de dormir');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onAdded).toHaveBeenCalledWith({ text: 'Leer antes de dormir', targetDate: null });
    expect(screen.getByLabelText('Otro objetivo')).toHaveValue('');
  });

  it('incluye la fecha objetivo cuando se elige una', async () => {
    const { user, onAdded } = await setup();

    await user.type(screen.getByLabelText('Fecha objetivo (opcional)'), '2026-12-01');
    await user.click(screen.getByRole('button', { name: 'Dormir mejor' }));

    const emitted = onAdded.mock.calls[0]?.[0];
    expect(emitted?.text).toBe('Dormir mejor');
    expect(Number.isNaN(new Date(emitted?.targetDate ?? '').getTime())).toBe(false);
  });
});
