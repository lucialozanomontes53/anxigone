import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { BlockingSetupResult } from './blocking-setup.component';
import { BlockingSetupComponent } from './blocking-setup.component';

async function setup() {
  const user = userEvent.setup();
  const onSubmitted = vi.fn<(value: BlockingSetupResult) => void>();
  await render(BlockingSetupComponent, {
    bindings: [outputBinding('submitted', onSubmitted)],
  });
  return { user, onSubmitted };
}

describe('BlockingSetupComponent', () => {
  it('el botón Continuar está deshabilitado sin motivo', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('modo normal por defecto: emite submitted con mode "normal"', async () => {
    const { user, onSubmitted } = await setup();

    await user.type(
      screen.getByLabelText('¿Qué impulso quieres posponer?'),
      'No enviar el mensaje',
    );
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onSubmitted).toHaveBeenCalledWith({
      mode: 'normal',
      reason: 'No enviar el mensaje',
      blockedApps: [],
      durationMin: 10,
    });
  });

  it('permite seleccionar Modo Blindado y añadir apps', async () => {
    const { user, onSubmitted } = await setup();

    await user.type(screen.getByLabelText('¿Qué impulso quieres posponer?'), 'No abrir Instagram');
    await user.type(screen.getByLabelText('Añadir app o cuenta a evitar'), 'Instagram');
    await user.click(screen.getByRole('button', { name: 'Añadir' }));
    await user.click(screen.getByRole('button', { name: /Modo Blindado/ }));
    await user.click(screen.getByRole('button', { name: '30 min' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onSubmitted).toHaveBeenCalledWith({
      mode: 'shielded',
      reason: 'No abrir Instagram',
      blockedApps: ['Instagram'],
      durationMin: 30,
    });
  });

  it('permite quitar una app añadida', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('Añadir app o cuenta a evitar'), 'WhatsApp');
    await user.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Quitar WhatsApp' }));
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument();
  });
});
