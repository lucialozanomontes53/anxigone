import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { AddRealityPhraseFormComponent } from './add-reality-phrase-form.component';

async function setup() {
  const user = userEvent.setup();
  const onAdded = vi.fn<(value: string) => void>();
  await render(AddRealityPhraseFormComponent, {
    bindings: [outputBinding('added', onAdded)],
  });
  return { user, onAdded };
}

describe('AddRealityPhraseFormComponent', () => {
  it('el botón de guardar está deshabilitado sin texto', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('emite added y limpia el campo', async () => {
    const { user, onAdded } = await setup();

    await user.type(screen.getByLabelText(/Guarda una frase/), 'La ansiedad no es evidencia');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(onAdded).toHaveBeenCalledWith('La ansiedad no es evidencia');
    expect(screen.getByLabelText(/Guarda una frase/)).toHaveValue('');
  });

  it('añade la frase al pulsar Enter', async () => {
    const { user, onAdded } = await setup();

    await user.type(screen.getByLabelText(/Guarda una frase/), 'No necesito resolver todo ahora{Enter}');

    expect(onAdded).toHaveBeenCalledWith('No necesito resolver todo ahora');
  });
});
