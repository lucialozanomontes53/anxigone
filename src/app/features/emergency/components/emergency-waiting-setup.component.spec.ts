import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { EmergencyWaitingSetupComponent, WaitingSetupInput } from './emergency-waiting-setup.component';

describe('EmergencyWaitingSetupComponent', () => {
  it('el botón está deshabilitado hasta escribir el objetivo, y usa 10 min por defecto', async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn<(value: WaitingSetupInput) => void>();
    await render(EmergencyWaitingSetupComponent, {
      bindings: [outputBinding('submitted', onSubmitted)],
    });

    expect(screen.getByRole('button', { name: 'Empezar la espera' })).toBeDisabled();

    await user.type(screen.getByLabelText('¿Qué impulso quieres posponer?'), 'No enviar el mensaje');
    await user.click(screen.getByRole('button', { name: 'Empezar la espera' }));

    expect(onSubmitted).toHaveBeenCalledWith({ goal: 'No enviar el mensaje', timerDurationMin: 10 });
  });

  it('permite elegir otra duración', async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn<(value: WaitingSetupInput) => void>();
    await render(EmergencyWaitingSetupComponent, {
      bindings: [outputBinding('submitted', onSubmitted)],
    });

    await user.type(screen.getByLabelText('¿Qué impulso quieres posponer?'), 'No llamar');
    await user.click(screen.getByRole('button', { name: '30 min' }));
    await user.click(screen.getByRole('button', { name: 'Empezar la espera' }));

    expect(onSubmitted).toHaveBeenCalledWith({ goal: 'No llamar', timerDurationMin: 30 });
  });
});
