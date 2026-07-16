import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';

import { HomePage } from './home.page';

describe('HomePage', () => {
  it('enlaza al botón de emergencia', async () => {
    await render(HomePage, { providers: [provideRouter([])] });

    const link = screen.getByRole('link', { name: /Botón de emergencia/ });
    expect(link).toHaveAttribute('href', '/emergencia');
  });

  it('enlaza a la Caja de Incertidumbre y a Mi Plan de Crisis', async () => {
    await render(HomePage, { providers: [provideRouter([])] });

    expect(screen.getByRole('link', { name: /Caja de Incertidumbre/ })).toHaveAttribute(
      'href',
      '/caja-de-incertidumbre',
    );
    expect(screen.getByRole('link', { name: /Mi Plan de Crisis/ })).toHaveAttribute(
      'href',
      '/plan-de-crisis',
    );
  });

  it('enlaza a Mi Lista de Realidad', async () => {
    await render(HomePage, { providers: [provideRouter([])] });

    expect(screen.getByRole('link', { name: /Mi Lista de Realidad/ })).toHaveAttribute(
      'href',
      '/lista-de-realidad',
    );
  });

  it('enlaza a Mis Logros Emocionales', async () => {
    await render(HomePage, { providers: [provideRouter([])] });

    expect(screen.getByRole('link', { name: /Mis Logros Emocionales/ })).toHaveAttribute(
      'href',
      '/logros',
    );
  });

  it('enlaza a Lo Que Me Funciona', async () => {
    await render(HomePage, { providers: [provideRouter([])] });

    expect(screen.getByRole('link', { name: /Lo Que Me Funciona/ })).toHaveAttribute(
      'href',
      '/actividades',
    );
  });

  it('enlaza a Objetivos de Bienestar', async () => {
    await render(HomePage, { providers: [provideRouter([])] });

    expect(screen.getByRole('link', { name: /Objetivos de Bienestar/ })).toHaveAttribute(
      'href',
      '/objetivos',
    );
  });

  it('enlaza a Ya He Pensado Suficiente', async () => {
    await render(HomePage, { providers: [provideRouter([])] });

    expect(screen.getByRole('link', { name: /Ya He Pensado Suficiente/ })).toHaveAttribute(
      'href',
      '/ya-he-pensado-suficiente',
    );
  });
});
