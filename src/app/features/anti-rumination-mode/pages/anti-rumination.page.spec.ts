import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { RuminationStopStore } from '../stores/rumination-stop.store';
import { AntiRuminationPage } from './anti-rumination.page';

async function setup() {
  const user = userEvent.setup();
  const rendered = await render(AntiRuminationPage, {
    providers: [provideRouter([])],
  });
  const store = rendered.fixture.debugElement.injector.get(RuminationStopStore);
  return { user, store };
}

describe('AntiRuminationPage', () => {
  it('muestra las duraciones disponibles cuando no hay sesión activa', async () => {
    await setup();

    expect(screen.getByText('Ya He Pensado Suficiente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10 min' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '60 min' })).toBeInTheDocument();
  });

  it('al elegir una duración muestra la pantalla de sesión activa sin controles de pausa', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: '10 min' }));

    expect(screen.getByText('Ya has pensado bastante por ahora')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Empezar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Detener' })).not.toBeInTheDocument();
  });

  it('permite abrir la respiración y el grounding, y enlaza a actividades', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: '10 min' }));

    await user.click(screen.getByRole('button', { name: 'Respirar' }));
    expect(screen.getByText('Respiración diafragmática')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Ver actividades' })).toHaveAttribute('href', '/actividades');
  });

  it('termina la sesión y vuelve a la pantalla de selección de duración', async () => {
    const { user } = await setup();
    await user.click(screen.getByRole('button', { name: '10 min' }));

    await user.click(screen.getByRole('button', { name: 'Ya estoy mejor, terminar' }));

    expect(screen.getByText('Ya He Pensado Suficiente')).toBeInTheDocument();
  });
});
