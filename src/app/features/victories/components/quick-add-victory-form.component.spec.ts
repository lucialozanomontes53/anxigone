import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { QuickAddVictoryFormComponent } from './quick-add-victory-form.component';

async function setup() {
  const user = userEvent.setup();
  const onAdded = vi.fn<(value: string) => void>();
  await render(QuickAddVictoryFormComponent, {
    bindings: [outputBinding('added', onAdded)],
  });
  return { user, onAdded };
}

describe('QuickAddVictoryFormComponent', () => {
  it('muestra los botones de victorias preestablecidas', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Esperé antes de actuar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No revisé mensajes' })).toBeInTheDocument();
  });

  it('emite added al pulsar una victoria preestablecida', async () => {
    const { user, onAdded } = await setup();

    await user.click(screen.getByRole('button', { name: 'Utilicé una técnica de grounding' }));

    expect(onAdded).toHaveBeenCalledWith('Utilicé una técnica de grounding');
  });

  it('el botón de guardar texto libre está deshabilitado sin texto', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('emite added con el texto libre y limpia el campo', async () => {
    const { user, onAdded } = await setup();

    await user.type(screen.getByLabelText('Otro avance'), 'Salí a caminar en vez de rumiar');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onAdded).toHaveBeenCalledWith('Salí a caminar en vez de rumiar');
    expect(screen.getByLabelText('Otro avance')).toHaveValue('');
  });
});
