import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BlockingSessionStore } from './features/emergency/stores/blocking-session.store';

/**
 * Indicador persistente visible en cualquier página mientras hay un bloqueo
 * activo, para no perderlo de vista al usar otras secciones de la app (p. ej.
 * el diario o el organizador, ofrecidos como herramientas dentro del propio
 * bloqueo). Vive en el shell (no en `emergency`) porque debe verse en toda la
 * app; inyecta la store root-scoped directamente (ver ADR-14 en CLAUDE.md).
 */
@Component({
  selector: 'app-active-blocking-banner',
  imports: [RouterLink],
  templateUrl: './active-blocking-banner.component.html',
  styleUrl: './active-blocking-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveBlockingBannerComponent {
  protected readonly store = inject(BlockingSessionStore);

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
