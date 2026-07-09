import { Signal } from '@angular/core';
import { SignalStore } from './signal-store';

interface CounterState {
  readonly count: number;
  readonly label: string;
}

class CounterStore extends SignalStore<CounterState> {
  constructor() {
    super({ count: 0, label: 'inicial' });
  }

  readonly count: Signal<number> = this.select((state) => state.count);
  readonly doubled: Signal<number> = this.select((state) => state.count * 2);

  increment(): void {
    this.updateState((current) => ({ ...current, count: current.count + 1 }));
  }

  rename(label: string): void {
    this.patch({ label });
  }

  reset(): void {
    this.setState({ count: 0, label: 'inicial' });
  }

  get currentLabel(): string {
    return this.snapshot.label;
  }
}

describe('SignalStore', () => {
  let store: CounterStore;

  beforeEach(() => {
    store = new CounterStore();
  });

  it('expone el estado inicial a través de selectores', () => {
    expect(store.count()).toBe(0);
    expect(store.currentLabel).toBe('inicial');
  });

  it('actualiza el estado con updateState y refleja el cambio en los selectores computed', () => {
    store.increment();
    store.increment();

    expect(store.count()).toBe(2);
    expect(store.doubled()).toBe(4);
  });

  it('aplica cambios parciales con patch sin afectar el resto del estado', () => {
    store.increment();
    store.rename('actualizado');

    expect(store.count()).toBe(1);
    expect(store.currentLabel).toBe('actualizado');
  });

  it('reemplaza el estado completo con setState', () => {
    store.increment();
    store.rename('otro');

    store.reset();

    expect(store.count()).toBe(0);
    expect(store.currentLabel).toBe('inicial');
  });
});
