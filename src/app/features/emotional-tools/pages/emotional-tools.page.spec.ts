import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { ToolSessionIndexedDbRepository } from '../repositories/tool-session-indexeddb.repository';
import { ToolSessionRepository } from '../repositories/tool-session.repository';
import { EmotionalToolsStore } from '../stores/emotional-tools.store';
import { EmotionalToolsPage } from './emotional-tools.page';

async function setup(options: { fakeTimers?: boolean } = {}) {
  const user = options.fakeTimers
    ? userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    : userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'toolSessions', keyPath: 'id' }],
  };

  const { fixture } = await render(EmotionalToolsPage, {
    providers: [
      EmotionalToolsStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: ToolSessionRepository, useClass: ToolSessionIndexedDbRepository },
    ],
  });

  async function advance(ms: number): Promise<void> {
    await vi.advanceTimersByTimeAsync(ms);
    fixture.detectChanges();
  }

  return { user, advance };
}

describe('EmotionalToolsPage', () => {
  it('muestra el menú con las 3 respiraciones y el grounding', async () => {
    await setup();

    expect(screen.getByRole('button', { name: /Respiración cuadrada/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4-7-8/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /diafragmática/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Grounding 5-4-3-2-1' })).toBeInTheDocument();
  });

  it('completa una respiración, registra la sesión y vuelve al menú', async () => {
    vi.useFakeTimers();
    const { user, advance } = await setup({ fakeTimers: true });

    await user.click(screen.getByRole('button', { name: /Respiración cuadrada/ }));
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await advance(64_000);
    // fake-indexeddb agenda su propio setTimeout para completar la transacción;
    // drenamos esos "hops" adicionales antes de volver a timers reales.
    for (let i = 0; i < 10; i++) {
      await advance(50);
    }
    vi.useRealTimers();

    expect(await screen.findByText('Sesiones completadas: 1')).toBeInTheDocument();
  });

  it('completa el grounding y registra la sesión', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Grounding 5-4-3-2-1' }));
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    }
    await user.click(screen.getByRole('button', { name: 'Terminar' }));

    expect(await screen.findByText('Sesiones completadas: 1')).toBeInTheDocument();
  });

  it('permite volver al menú sin completar la técnica', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Grounding 5-4-3-2-1' }));
    await user.click(screen.getByRole('button', { name: 'Volver a las técnicas' }));

    expect(screen.getByRole('button', { name: 'Grounding 5-4-3-2-1' })).toBeInTheDocument();
  });
});
