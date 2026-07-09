import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { CountdownTimerComponent } from './countdown-timer.component';

async function setup(durationSec = 3, label = 'Cuenta atrás de calma') {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const onFinished = vi.fn();
  const { fixture } = await render(CountdownTimerComponent, {
    bindings: [
      inputBinding('durationSec', () => durationSec),
      inputBinding('label', () => label),
      outputBinding('finished', onFinished),
    ],
  });

  async function advance(ms: number): Promise<void> {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
  }

  return { user, onFinished, advance };
}

describe('CountdownTimerComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra la etiqueta y el tiempo formateado inicial en 0:00', async () => {
    await setup();

    expect(screen.getByText('Cuenta atrás de calma')).toBeInTheDocument();
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('cuenta hacia atrás segundo a segundo tras pulsar Empezar', async () => {
    const { user, advance } = await setup(3);

    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(screen.getByText('0:03')).toBeInTheDocument();

    await advance(1000);
    expect(screen.getByText('0:02')).toBeInTheDocument();
  });

  it('emite finished al llegar a 0', async () => {
    const { user, onFinished, advance } = await setup(2);

    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await advance(2000);

    expect(onFinished).toHaveBeenCalledTimes(1);
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('detener antes de tiempo no emite finished', async () => {
    const { user, onFinished, advance } = await setup(5);

    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await advance(1000);
    await user.click(screen.getByRole('button', { name: 'Detener' }));
    await advance(5000);

    expect(onFinished).not.toHaveBeenCalled();
  });
});
