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
});
