import { computed, Signal, signal, WritableSignal } from '@angular/core';

/**
 * Base mínima para stores basadas en Signals. Las features extienden esta clase
 * y exponen selectores computed de solo lectura; nunca el signal de estado en bruto.
 * No conoce IndexedDB: la persistencia se orquesta desde los métodos de la store
 * concreta, inyectando el repository correspondiente (Dependency Inversion).
 */
export abstract class SignalStore<TState extends object> {
  private readonly state: WritableSignal<TState>;

  protected constructor(initialState: TState) {
    this.state = signal(initialState);
  }

  protected get snapshot(): TState {
    return this.state();
  }

  protected select<TResult>(selector: (state: TState) => TResult): Signal<TResult> {
    return computed(() => selector(this.state()));
  }

  protected patch(partial: Partial<TState>): void {
    this.state.update((current) => ({ ...current, ...partial }));
  }

  protected setState(next: TState): void {
    this.state.set(next);
  }

  protected updateState(updater: (current: TState) => TState): void {
    this.state.update(updater);
  }
}
