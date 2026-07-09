import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';

import { HomePage } from './home.page';

describe('HomePage', () => {
  it('enlaza al botón de emergencia', async () => {
    await render(HomePage, { providers: [provideRouter([])] });

    const link = screen.getByRole('link', { name: /Botón de emergencia/ });
    expect(link).toHaveAttribute('href', '/emergencia');
  });
});
