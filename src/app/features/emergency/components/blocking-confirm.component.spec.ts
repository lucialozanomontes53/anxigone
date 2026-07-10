import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { BlockingConfirmComponent } from './blocking-confirm.component';

describe('BlockingConfirmComponent', () => {
  it('muestra el aviso exacto y las dos acciones', async () => {
    await render(BlockingConfirmComponent);

    expect(screen.getByText('Estás activando el Modo Blindado')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Durante el tiempo seleccionado no podrás acceder a las aplicaciones bloqueadas ni cancelar el bloqueo.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('¿Deseas continuar?')).toBeInTheDocument();
  });

  it('emite cancelled al pulsar Cancelar', async () => {
    const user = userEvent.setup();
    const onCancelled = vi.fn();
    await render(BlockingConfirmComponent, {
      bindings: [outputBinding('cancelled', onCancelled)],
    });

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancelled).toHaveBeenCalledTimes(1);
  });

  it('emite confirmed al pulsar Activar Modo Blindado', async () => {
    const user = userEvent.setup();
    const onConfirmed = vi.fn();
    await render(BlockingConfirmComponent, {
      bindings: [outputBinding('confirmed', onConfirmed)],
    });

    await user.click(screen.getByRole('button', { name: 'Activar Modo Blindado' }));

    expect(onConfirmed).toHaveBeenCalledTimes(1);
  });
});
