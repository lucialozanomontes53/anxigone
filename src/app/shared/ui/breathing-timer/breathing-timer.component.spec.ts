import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { BreathingPattern } from '../../models/breathing-pattern.model';
import { BreathingTimerComponent } from './breathing-timer.component';

const testPattern: BreathingPattern = {
  id: 'box',
  label: 'Patrón de prueba',
  inhaleSec: 2,
  holdSec: 1,
  exhaleSec: 2,
  holdAfterExhaleSec: 0,
};

async function setup(cycles = 2) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const onCompleted = vi.fn();
  const { fixture } = await render(BreathingTimerComponent, {
    bindings: [
      inputBinding('pattern', () => testPattern),
      inputBinding('cycles', () => cycles),
      outputBinding('completed', onCompleted),
    ],
  });

  async function advance(ms: number): Promise<void> {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
  }

  return { user, onCompleted, advance };
}

describe('BreathingTimerComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('muestra el patrón y arranca con "Detener" deshabilitado', async () => {
    await setup();

    expect(screen.getByText('Patrón de prueba')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Detener' })).toBeDisabled();
  });

  it('al pulsar Empezar entra en fase de inhalar y cuenta atrás', async () => {
    const { user, advance } = await setup();

    await user.click(screen.getByRole('button', { name: 'Empezar' }));

    expect(screen.getByText('Inhala')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    await advance(1000);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('avanza de fase cuando se agota el tiempo', async () => {
    const { user, advance } = await setup();

    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await advance(2000);

    expect(screen.getByText('Mantén el aire')).toBeInTheDocument();
  });

  it('detener a mitad de un ciclo deja de avanzar', async () => {
    const { user, advance } = await setup();

    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await user.click(screen.getByRole('button', { name: 'Detener' }));
    await advance(5000);

    expect(screen.getByText('Pulsa "Empezar" cuando estés lista')).toBeInTheDocument();
  });

  it('emite completed tras terminar todos los ciclos configurados', async () => {
    const { user, onCompleted, advance } = await setup(1);

    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    // inhale(2) + hold(1) + exhale(2) = 5s para completar 1 ciclo
    await advance(5000);

    expect(onCompleted).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Empezar' })).toBeEnabled();
  });
});
