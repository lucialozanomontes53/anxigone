import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';

import { BottomNavComponent } from './bottom-nav.component';

describe('BottomNavComponent', () => {
  it('muestra los 4 enlaces con su etiqueta y ruta', async () => {
    await render(BottomNavComponent, { providers: [provideRouter([])] });

    expect(screen.getByRole('link', { name: /Emergencia/ })).toHaveAttribute(
      'href',
      '/emergencia',
    );
    expect(screen.getByRole('link', { name: /Herramientas/ })).toHaveAttribute(
      'href',
      '/herramientas',
    );
    expect(screen.getByRole('link', { name: /Diario/ })).toHaveAttribute('href', '/diario');
    expect(screen.getByRole('link', { name: /Organizador/ })).toHaveAttribute(
      'href',
      '/organizador',
    );
  });

  it('marca el enlace de emergencia con su propia clase distintiva', async () => {
    await render(BottomNavComponent, { providers: [provideRouter([])] });

    expect(screen.getByRole('link', { name: /Emergencia/ })).toHaveClass(
      'bottom-nav__item--emergency',
    );
    expect(screen.getByRole('link', { name: /Diario/ })).not.toHaveClass(
      'bottom-nav__item--emergency',
    );
  });
});
