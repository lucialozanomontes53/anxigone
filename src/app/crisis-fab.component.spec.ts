import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';

import { CrisisFabComponent } from './crisis-fab.component';

describe('CrisisFabComponent', () => {
  it('muestra el botón "No estoy bien" enlazando a la activación del plan de crisis', async () => {
    await render(CrisisFabComponent, { providers: [provideRouter([])] });

    const link = screen.getByRole('link', { name: 'No estoy bien' });
    expect(link).toHaveAttribute('href', '/plan-de-crisis/activar');
  });
});
