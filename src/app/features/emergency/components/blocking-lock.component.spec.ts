import { inputBinding, outputBinding } from '@angular/core';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { BlockingReflection, BlockingSession } from '../models/blocking-session.model';
import { BlockingLockComponent } from './blocking-lock.component';

function makeSession(overrides: Partial<BlockingSession> = {}): BlockingSession {
  const now = Date.now();
  return {
    id: '1',
    emergencyEventId: 'evt-1',
    mode: 'normal',
    reason: 'No enviar el mensaje',
    blockedApps: ['WhatsApp'],
    durationMin: 1,
    startedAt: new Date(now).toISOString() as BlockingSession['startedAt'],
    endsAt: new Date(now + 60_000).toISOString() as BlockingSession['endsAt'],
    status: 'active',
    attemptCount: 0,
    reflection: null,
    ...overrides,
  };
}

async function setup(session: BlockingSession, options: { fakeTimers?: boolean } = {}) {
  const user = options.fakeTimers
    ? userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    : userEvent.setup();
  const onCancelRequested = vi.fn();
  const onCompleted = vi.fn<(value: BlockingReflection) => void>();
  const { fixture } = await render(BlockingLockComponent, {
    bindings: [
      inputBinding('session', () => session),
      outputBinding('cancelRequested', onCancelRequested),
      outputBinding('completed', onCompleted),
    ],
    providers: [provideRouter([])],
  });

  async function advance(ms: number): Promise<void> {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
  }

  return { user, onCancelRequested, onCompleted, advance };
}

describe('BlockingLockComponent', () => {
  it('muestra el motivo, las apps y las opciones disponibles', async () => {
    await setup(makeSession());

    expect(screen.getByText('Respira un momento')).toBeInTheDocument();
    expect(screen.getByText(/No enviar el mensaje/)).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Respirar 1 minuto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ejercicio de grounding' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Escribir en el diario emocional' })).toHaveAttribute(
      'href',
      '/diario',
    );
    expect(screen.getByRole('link', { name: 'Organizar pensamientos' })).toHaveAttribute(
      'href',
      '/organizador',
    );
  });

  it('muestra el botón de cancelar solo en modo normal', async () => {
    await setup(makeSession({ mode: 'normal' }));

    expect(screen.getByRole('button', { name: 'Cancelar bloqueo' })).toBeInTheDocument();
  });

  it('no muestra el botón de cancelar en modo blindado', async () => {
    await setup(makeSession({ mode: 'shielded' }));

    expect(screen.queryByRole('button', { name: 'Cancelar bloqueo' })).not.toBeInTheDocument();
  });

  it('emite cancelRequested al pulsar Cancelar bloqueo', async () => {
    const { user, onCancelRequested } = await setup(makeSession({ mode: 'normal' }));

    await user.click(screen.getByRole('button', { name: 'Cancelar bloqueo' }));

    expect(onCancelRequested).toHaveBeenCalledTimes(1);
  });

  it('alterna la respiración inline al pulsar la opción', async () => {
    const { user } = await setup(makeSession());

    await user.click(screen.getByRole('button', { name: 'Respirar 1 minuto' }));
    expect(screen.getByText('Respiración diafragmática')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Respirar 1 minuto' }));
    expect(screen.queryByText('Respiración diafragmática')).not.toBeInTheDocument();
  });

  it('si la sesión ya expiró al montar, muestra la reflexión directamente', async () => {
    const expiredSession = makeSession({ endsAt: new Date(Date.now() - 1000).toISOString() as BlockingSession['endsAt'] });
    await setup(expiredSession);

    expect(screen.getByText('¿Cómo estás ahora?')).toBeInTheDocument();
  });

  it('al agotarse el tiempo pide la reflexión y la guarda al completar las 3 preguntas', async () => {
    vi.useFakeTimers();
    const session = makeSession({ durationMin: 1 });
    const { user, onCompleted, advance } = await setup(session, { fakeTimers: true });

    await advance(60_000);

    expect(await screen.findByText('¿Cómo estás ahora?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar y terminar' })).toBeDisabled();

    await user.type(screen.getByLabelText('¿Cómo te sientes ahora?'), 'mejor');
    const yesButtons = screen.getAllByRole('button', { name: 'Sí' });
    for (const button of yesButtons) {
      await user.click(button);
    }
    expect(screen.getByRole('button', { name: 'Guardar y terminar' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Guardar y terminar' }));

    expect(onCompleted).toHaveBeenCalledWith({
      feelingNow: 'mejor',
      urgencyDecreased: true,
      stillWantsToOpen: true,
      pauseHelped: true,
    });

    vi.useRealTimers();
  });
});
