import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { EmergencyToolboxComponent } from './emergency-toolbox.component';

async function setup() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const onToolUsed = vi.fn();
  const onWaitingModeRequested = vi.fn();
  const onResolved = vi.fn();
  await render(EmergencyToolboxComponent, {
    bindings: [
      outputBinding('toolUsed', onToolUsed),
      outputBinding('waitingModeRequested', onWaitingModeRequested),
      outputBinding('resolved', onResolved),
    ],
  });
  return { user, onToolUsed, onWaitingModeRequested, onResolved };
}

describe('EmergencyToolboxComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra las 4 tarjetas de herramientas por defecto', async () => {
    await setup();

    expect(screen.getByRole('button', { name: /Respiración guiada/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Grounding 5-4-3-2-1/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cuenta atrás de calma/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pausa de autocompasión/ })).toBeInTheDocument();
  });

  it('abre el grounding, lo completa y emite toolUsed, y vuelve al menú', async () => {
    const { user, onToolUsed } = await setup();

    await user.click(screen.getByRole('button', { name: /Grounding 5-4-3-2-1/ }));
    expect(screen.getByText('Nombra 5 cosas que puedas ver a tu alrededor.')).toBeInTheDocument();

    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    }
    await user.click(screen.getByRole('button', { name: 'Terminar' }));

    expect(onToolUsed).toHaveBeenCalledWith('grounding:5-4-3-2-1');

    await user.click(screen.getByRole('button', { name: 'Volver a las herramientas' }));
    expect(screen.getByRole('button', { name: /Grounding 5-4-3-2-1/ })).toBeInTheDocument();
  });

  it('emite waitingModeRequested y resolved desde el pie', async () => {
    const { user, onWaitingModeRequested, onResolved } = await setup();

    await user.click(screen.getByRole('button', { name: 'Espera antes de actuar' }));
    expect(onWaitingModeRequested).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Ya estoy mejor' }));
    expect(onResolved).toHaveBeenCalledTimes(1);
  });

  it('completa la pausa de autocompasión y emite toolUsed', async () => {
    const { user, onToolUsed } = await setup();

    await user.click(screen.getByRole('button', { name: /Pausa de autocompasión/ }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'He terminado' }));

    expect(onToolUsed).toHaveBeenCalledWith('self-compassion');
  });

  it('completa la cuenta atrás de calma y emite toolUsed', async () => {
    const { user, onToolUsed } = await setup();

    await user.click(screen.getByRole('button', { name: /Cuenta atrás de calma/ }));
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await vi.advanceTimersByTimeAsync(60_000);

    expect(onToolUsed).toHaveBeenCalledWith('calm-countdown');
  });

  it('completa la respiración guiada y emite toolUsed', async () => {
    const { user, onToolUsed } = await setup();

    await user.click(screen.getByRole('button', { name: /Respiración guiada/ }));
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    // box breathing: 4 fases x 4s x 4 ciclos = 64s
    await vi.advanceTimersByTimeAsync(64_000);

    expect(onToolUsed).toHaveBeenCalledWith('breathing:box');
  });
});
