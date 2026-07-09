import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { SelfCompassionBreakComponent } from './self-compassion-break.component';

describe('SelfCompassionBreakComponent', () => {
  it('muestra la primera afirmación y avanza hasta emitir completed', async () => {
    const user = userEvent.setup();
    const onCompleted = vi.fn();
    await render(SelfCompassionBreakComponent, {
      bindings: [outputBinding('completed', onCompleted)],
    });

    expect(screen.getByText('Esto es un momento de sufrimiento.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText(/no estoy sola en esto/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText(/amable conmigo misma/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'He terminado' }));
    expect(onCompleted).toHaveBeenCalledTimes(1);
  });
});
