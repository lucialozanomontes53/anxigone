import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { BlockingSessionIndexedDbRepository } from '../repositories/blocking-session-indexeddb.repository';
import { BlockingSessionRepository } from '../repositories/blocking-session.repository';
import { EmergencyEventIndexedDbRepository } from '../repositories/emergency-event-indexeddb.repository';
import { EmergencyEventRepository } from '../repositories/emergency-event.repository';
import { EmergencyStore } from '../stores/emergency.store';
import { EmergencyPage } from './emergency.page';

async function setup(options: { fakeTimers?: boolean } = {}) {
  const user = options.fakeTimers
    ? userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    : userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [
      { name: 'emergencyEvents', keyPath: 'id' },
      { name: 'blockingSessions', keyPath: 'id' },
    ],
  };

  const { fixture } = await render(EmergencyPage, {
    providers: [
      EmergencyStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: EmergencyEventRepository, useClass: EmergencyEventIndexedDbRepository },
      { provide: BlockingSessionRepository, useClass: BlockingSessionIndexedDbRepository },
      provideRouter([]),
    ],
  });

  async function advance(ms: number): Promise<void> {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
  }

  return { user, advance, fixture };
}

async function completeIntake(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText('¿Qué ha pasado?'), 'Discusión con mi pareja');
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.click(screen.getByRole('button', { name: 'Ansiedad' }));
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.type(screen.getByLabelText('¿Qué necesitas ahora mismo?'), 'tranquilidad');
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
}

describe('EmergencyPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('empieza mostrando el formulario de intake', async () => {
    await setup();

    expect(screen.getByText('¿Qué ha pasado?')).toBeInTheDocument();
  });

  it('completa el intake, resuelve el evento y vuelve al inicio', async () => {
    const { user } = await setup();

    await completeIntake(user);
    expect(await screen.findByRole('button', { name: /Respiración guiada/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Grounding 5-4-3-2-1/ }));
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    }
    await user.click(screen.getByRole('button', { name: 'Terminar' }));
    await user.click(await screen.findByRole('button', { name: 'Volver a las herramientas' }));

    await user.click(screen.getByRole('button', { name: 'Ya estoy mejor' }));
    expect(await screen.findByText('Me alegro de que estés mejor')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Volver al inicio' }));
    expect(screen.getByText('¿Qué ha pasado?')).toBeInTheDocument();
  });

  it('modo normal: bloquea, permite cancelar y vuelve a las herramientas', async () => {
    const { user } = await setup();

    await completeIntake(user);
    await user.click(await screen.findByRole('button', { name: 'Espera antes de actuar' }));

    await user.type(screen.getByLabelText('¿Qué impulso quieres posponer?'), 'No enviar el mensaje');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('Respira un momento')).toBeInTheDocument();
    expect(screen.getByText(/No enviar el mensaje/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar bloqueo' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar bloqueo' }));

    expect(await screen.findByRole('button', { name: /Respiración guiada/ })).toBeInTheDocument();
  });

  it('modo normal: al agotarse el tiempo pide la reflexión y la guarda', async () => {
    // Timers reales para el intake y la navegación: findBy* necesita su propio
    // polling real. Solo se activan fake timers justo antes de montar la
    // cuenta atrás, para poder controlar su setInterval.
    const { user, fixture } = await setup();

    await completeIntake(user);
    await user.click(await screen.findByRole('button', { name: 'Espera antes de actuar' }));
    await user.type(screen.getByLabelText('¿Qué impulso quieres posponer?'), 'No llamar');
    await user.click(screen.getByRole('button', { name: '5 min' }));

    vi.useFakeTimers();
    const fakeUser = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    async function advance(ms: number): Promise<void> {
      await vi.advanceTimersByTimeAsync(ms);
      fixture.detectChanges();
    }

    await fakeUser.click(screen.getByRole('button', { name: 'Continuar' }));
    // startBlocking encadena dos guardados async en IndexedDB antes de que la
    // vista cambie a la pantalla de bloqueo; los drenamos antes de avanzar el reloj.
    for (let i = 0; i < 10; i++) {
      await advance(50);
    }
    expect(screen.getByText('Respira un momento')).toBeInTheDocument();

    await advance(5 * 60_000);
    // fake-indexeddb agenda sus propios setTimeout; drenamos antes de volver a timers reales.
    for (let i = 0; i < 10; i++) {
      await advance(50);
    }
    vi.useRealTimers();

    expect(await screen.findByText('¿Cómo estás ahora?')).toBeInTheDocument();

    await user.type(screen.getByLabelText('¿Cómo te sientes ahora?'), 'más tranquila');
    const yesButtons = screen.getAllByRole('button', { name: 'Sí' });
    for (const button of yesButtons) {
      await user.click(button);
    }
    await user.click(screen.getByRole('button', { name: 'Guardar y terminar' }));

    expect(await screen.findByRole('button', { name: /Respiración guiada/ })).toBeInTheDocument();
  });

  it('modo blindado: pide confirmación y no muestra botón de cancelar', async () => {
    const { user } = await setup();

    await completeIntake(user);
    await user.click(await screen.findByRole('button', { name: 'Espera antes de actuar' }));
    await user.type(screen.getByLabelText('¿Qué impulso quieres posponer?'), 'No abrir Instagram');
    await user.click(screen.getByRole('button', { name: /^Modo Blindado/ }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText('Estás activando el Modo Blindado')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Activar Modo Blindado' }));

    expect(await screen.findByText('Respira un momento')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar bloqueo' })).not.toBeInTheDocument();
  });

  it('modo blindado: cancelar en la confirmación vuelve a las herramientas sin activar nada', async () => {
    const { user } = await setup();

    await completeIntake(user);
    await user.click(await screen.findByRole('button', { name: 'Espera antes de actuar' }));
    await user.type(screen.getByLabelText('¿Qué impulso quieres posponer?'), 'No abrir Instagram');
    await user.click(screen.getByRole('button', { name: /^Modo Blindado/ }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await screen.findByText('Estás activando el Modo Blindado');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(await screen.findByRole('button', { name: /Respiración guiada/ })).toBeInTheDocument();
  });
});
