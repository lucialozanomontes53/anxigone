import { TestBed } from '@angular/core/testing';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { BlockingSessionIndexedDbRepository } from '../repositories/blocking-session-indexeddb.repository';
import { BlockingSessionRepository } from '../repositories/blocking-session.repository';
import { BlockingSessionStore, StartBlockingSessionInput } from './blocking-session.store';

function createStore(): BlockingSessionStore {
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'blockingSessions', keyPath: 'id' }],
  };

  TestBed.configureTestingModule({
    providers: [
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: BlockingSessionRepository, useClass: BlockingSessionIndexedDbRepository },
    ],
  });

  return TestBed.inject(BlockingSessionStore);
}

const normalInput: StartBlockingSessionInput = {
  mode: 'normal',
  reason: 'No enviar el mensaje',
  blockedApps: ['WhatsApp'],
  durationMin: 10,
};

const shieldedInput: StartBlockingSessionInput = {
  mode: 'shielded',
  reason: 'No abrir Instagram',
  blockedApps: ['Instagram'],
  durationMin: 15,
};

describe('BlockingSessionStore', () => {
  it('empieza sin sesión activa', () => {
    const store = createStore();

    expect(store.activeSession()).toBeNull();
    expect(store.isShieldedActive()).toBe(false);
  });

  it('recordAttempt/cancelSession/completeSession no hacen nada sin sesión activa', async () => {
    const store = createStore();

    await store.recordAttempt();
    await store.cancelSession();
    await store.completeSession({
      feelingNow: '',
      urgencyDecreased: false,
      stillWantsToOpen: false,
      pauseHelped: false,
    });

    expect(store.activeSession()).toBeNull();
    expect(store.history()).toEqual([]);
  });

  it('startSession crea y persiste una sesión activa', async () => {
    const store = createStore();

    await store.startSession(normalInput);

    const active = store.activeSession();
    expect(active).not.toBeNull();
    expect(active?.reason).toBe('No enviar el mensaje');
    expect(active?.status).toBe('active');
    expect(active?.attemptCount).toBe(0);
  });

  it('no permite iniciar una segunda sesión mientras hay una activa', async () => {
    const store = createStore();
    await store.startSession(normalInput);
    const firstId = store.activeSession()?.id;

    await store.startSession(shieldedInput);

    expect(store.activeSession()?.id).toBe(firstId);
  });

  it('recordAttempt incrementa el contador de la sesión activa', async () => {
    const store = createStore();
    await store.startSession(normalInput);

    await store.recordAttempt();
    await store.recordAttempt();

    expect(store.activeSession()?.attemptCount).toBe(2);
  });

  it('cancelSession funciona en modo normal', async () => {
    const store = createStore();
    await store.startSession(normalInput);

    await store.cancelSession();

    expect(store.activeSession()).toBeNull();
  });

  it('cancelSession no hace nada en modo blindado', async () => {
    const store = createStore();
    await store.startSession(shieldedInput);

    await store.cancelSession();

    expect(store.activeSession()).not.toBeNull();
    expect(store.activeSession()?.status).toBe('active');
  });

  it('completeSession guarda la reflexión y mueve la sesión al historial', async () => {
    const store = createStore();
    await store.startSession(normalInput);

    await store.completeSession({
      feelingNow: 'más tranquila',
      urgencyDecreased: true,
      stillWantsToOpen: false,
      pauseHelped: true,
    });

    expect(store.activeSession()).toBeNull();
    expect(store.history()).toHaveLength(1);
    expect(store.history()[0]?.reflection?.pauseHelped).toBe(true);
  });

  it('loadActiveSession restaura una sesión activa persistida (reapertura de la app)', async () => {
    const config: DbConfig = {
      name: `test-db-${crypto.randomUUID()}`,
      version: 1,
      stores: [{ name: 'blockingSessions', keyPath: 'id' }],
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_DB_CONFIG, useValue: config },
        { provide: BlockingSessionRepository, useClass: BlockingSessionIndexedDbRepository },
      ],
    });
    const firstInstance = TestBed.inject(BlockingSessionStore);
    await firstInstance.startSession(normalInput);

    // Simula reabrir la app: nueva instancia del store sobre la misma BD.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_DB_CONFIG, useValue: config },
        { provide: BlockingSessionRepository, useClass: BlockingSessionIndexedDbRepository },
      ],
    });
    const secondInstance = TestBed.inject(BlockingSessionStore);
    await secondInstance.loadActiveSession();

    expect(secondInstance.activeSession()?.reason).toBe('No enviar el mensaje');
  });

  it('calcula totalAttempts y topBlockedApps a partir del historial', async () => {
    const store = createStore();
    await store.startSession(normalInput);
    await store.recordAttempt();
    await store.recordAttempt();
    await store.completeSession({
      feelingNow: 'bien',
      urgencyDecreased: true,
      stillWantsToOpen: false,
      pauseHelped: true,
    });

    expect(store.totalAttempts()).toBe(2);
    expect(store.topBlockedApps()).toEqual([{ app: 'WhatsApp', count: 1 }]);
  });

  it('registra un intento cuando la pestaña pierde visibilidad durante una sesión activa', async () => {
    const store = createStore();
    await store.startSession(normalInput);

    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    // fake-indexeddb agenda su propio setTimeout para completar el guardado;
    // hace falta un macrotask real, no basta con microtasks (Promise.resolve()).
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(store.activeSession()?.attemptCount).toBeGreaterThanOrEqual(1);

    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
  });

  it('avisa antes de cerrar la pestaña en modo blindado', async () => {
    const store = createStore();
    await store.startSession(shieldedInput);

    const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent;
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
