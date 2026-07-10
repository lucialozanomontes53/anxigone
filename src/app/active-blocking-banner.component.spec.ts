import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';

import { DbConfig } from './core/persistence/db-schema';
import { APP_DB_CONFIG } from './core/persistence/indexed-db.adapter';
import { BlockingSessionIndexedDbRepository } from './features/emergency/repositories/blocking-session-indexeddb.repository';
import { BlockingSessionRepository } from './features/emergency/repositories/blocking-session.repository';
import { BlockingSessionStore } from './features/emergency/stores/blocking-session.store';
import { ActiveBlockingBannerComponent } from './active-blocking-banner.component';

async function setup() {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'blockingSessions', keyPath: 'id' }],
  };

  const { fixture } = await render(ActiveBlockingBannerComponent, {
    providers: [
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: BlockingSessionRepository, useClass: BlockingSessionIndexedDbRepository },
      provideRouter([]),
    ],
  });

  const store = fixture.debugElement.injector.get(BlockingSessionStore);
  return { fixture, store };
}

describe('ActiveBlockingBannerComponent', () => {
  it('no muestra nada sin sesión activa', async () => {
    await setup();

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('muestra el motivo y el tiempo restante cuando hay una sesión activa', async () => {
    const { fixture, store } = await setup();

    await store.startSession({
      mode: 'normal',
      reason: 'No enviar el mensaje',
      blockedApps: [],
      durationMin: 10,
    });
    fixture.detectChanges();

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('No enviar el mensaje');
    expect(banner).toHaveAttribute('href', '/emergencia');
  });
});
