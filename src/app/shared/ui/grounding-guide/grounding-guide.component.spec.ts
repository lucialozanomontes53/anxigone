import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { GroundingStep } from '../../models/grounding-step.model';
import { GroundingGuideComponent } from './grounding-guide.component';

const testSteps: readonly GroundingStep[] = [
  { count: 2, sense: 'vista', prompt: 'Nombra 2 cosas que veas.' },
  { count: 1, sense: 'oído', prompt: 'Nombra 1 cosa que oigas.' },
];

async function setup() {
  const user = userEvent.setup();
  const onCompleted = vi.fn();
  await render(GroundingGuideComponent, {
    bindings: [inputBinding('steps', () => testSteps), outputBinding('completed', onCompleted)],
  });
  return { user, onCompleted };
}

describe('GroundingGuideComponent', () => {
  it('muestra el primer paso con "Anterior" deshabilitado', async () => {
    await setup();

    expect(screen.getByText('Nombra 2 cosas que veas.')).toBeInTheDocument();
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  });

  it('avanza al siguiente paso y cambia la etiqueta del botón en el último', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));

    expect(screen.getByText('Nombra 1 cosa que oigas.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terminar' })).toBeInTheDocument();
  });

  it('emite completed al pulsar Terminar en el último paso', async () => {
    const { user, onCompleted } = await setup();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Terminar' }));

    expect(onCompleted).toHaveBeenCalledTimes(1);
  });

  it('retrocede al paso anterior', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Anterior' }));

    expect(screen.getByText('Nombra 2 cosas que veas.')).toBeInTheDocument();
  });

  it('reinicia al primer paso con "Empezar de nuevo"', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Empezar de nuevo' }));

    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument();
  });
});
