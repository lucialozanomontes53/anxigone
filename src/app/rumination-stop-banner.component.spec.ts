import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';

import { RuminationStopBannerComponent } from './rumination-stop-banner.component';
import { RuminationStopStore } from './features/anti-rumination-mode/stores/rumination-stop.store';

async function setup() {
  const { fixture } = await render(RuminationStopBannerComponent, {
    providers: [provideRouter([])],
  });

  const store = fixture.debugElement.injector.get(RuminationStopStore);
  return { fixture, store };
}

describe('RuminationStopBannerComponent', () => {
  it('no muestra nada sin sesión activa', async () => {
    await setup();

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('muestra el aviso y el tiempo restante cuando hay una sesión activa', async () => {
    const { fixture, store } = await setup();

    store.start(10);
    fixture.detectChanges();

    const banner = screen.getByRole('status');
    expect(banner).toHaveTextContent('Ya He Pensado Suficiente activo');
    expect(banner).toHaveAttribute('href', '/ya-he-pensado-suficiente');
  });
});
