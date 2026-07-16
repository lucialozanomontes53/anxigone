import { TestBed } from '@angular/core/testing';

import { RuminationStopStore } from './rumination-stop.store';

describe('RuminationStopStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('empieza sin sesión activa', () => {
    const store = TestBed.inject(RuminationStopStore);

    expect(store.activeSession()).toBeNull();
  });

  it('start crea una sesión con la duración elegida', () => {
    const store = TestBed.inject(RuminationStopStore);

    store.start(20);

    const session = store.activeSession();
    expect(session).not.toBeNull();
    expect(session?.durationMin).toBe(20);
    const durationMs = new Date(session!.endsAt).getTime() - new Date(session!.startedAt).getTime();
    expect(durationMs).toBe(20 * 60_000);
  });

  it('end termina la sesión activa', () => {
    const store = TestBed.inject(RuminationStopStore);
    store.start(10);

    store.end();

    expect(store.activeSession()).toBeNull();
  });
});
