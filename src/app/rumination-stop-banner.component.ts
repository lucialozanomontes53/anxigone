import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RuminationStopStore } from './features/anti-rumination-mode/stores/rumination-stop.store';

/**
 * Aviso persistente visible en cualquier página mientras "Ya He Pensado Suficiente"
 * está activo, para recordar que la sesión sigue en marcha si se navega a otra
 * sección (p. ej. a "Actividades", enlazada desde la propia pantalla dedicada).
 * Igual que `ActiveBlockingBannerComponent` (ver ADR-14), pero con un tono cálido,
 * no de alerta: este modo no es un compromiso irreversible, solo una invitación.
 */
@Component({
  selector: 'app-rumination-stop-banner',
  imports: [RouterLink],
  templateUrl: './rumination-stop-banner.component.html',
  styleUrl: './rumination-stop-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuminationStopBannerComponent {
  protected readonly store = inject(RuminationStopStore);

  private readonly now = signal(Date.now());
  private readonly intervalId = setInterval(() => this.now.set(Date.now()), 1000);

  protected readonly formattedRemaining = computed(() => {
    const session = this.store.activeSession();
    if (!session) {
      return '';
    }
    const totalSec = Math.max(0, Math.round((new Date(session.endsAt).getTime() - this.now()) / 1000));
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.intervalId));
  }
}
