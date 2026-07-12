import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { Victory } from '../models/victory.model';
import { VictoryListComponent } from './victory-list.component';

async function setup(victories: readonly Victory[]) {
  const user = userEvent.setup();
  const onDeleted = vi.fn<(id: string) => void>();
  await render(VictoryListComponent, {
    bindings: [inputBinding('victories', () => victories), outputBinding('deleted', onDeleted)],
  });
  return { user, onDeleted };
}

describe('VictoryListComponent', () => {
  it('muestra un mensaje cuando no hay victorias', async () => {
    await setup([]);

    expect(screen.getByText('Todavía no has registrado ninguna victoria.')).toBeInTheDocument();
  });

  it('muestra la victoria y permite eliminarla', async () => {
    const { user, onDeleted } = await setup([
      { id: 'victory-1', text: 'Esperé antes de actuar', occurredAt: toISODateString(new Date()) },
    ]);

    expect(screen.getByText('Esperé antes de actuar')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(onDeleted).toHaveBeenCalledWith('victory-1');
  });
});
