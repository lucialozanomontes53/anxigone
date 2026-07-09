import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { BrainDumpItem } from '../models/brain-dump-item.model';
import { BrainDumpInboxComponent } from './brain-dump-inbox.component';

const testItem: BrainDumpItem = {
  id: '1',
  content: 'Llamar al dentista',
  category: null,
  createdAt: '2026-07-09T10:00:00.000Z' as BrainDumpItem['createdAt'],
  resolvedAt: null,
};

async function setup(items: readonly BrainDumpItem[] = []) {
  const user = userEvent.setup();
  const onAdded = vi.fn();
  const onClassified = vi.fn();
  await render(BrainDumpInboxComponent, {
    bindings: [
      inputBinding('items', () => items),
      outputBinding('added', onAdded),
      outputBinding('classified', onClassified),
    ],
  });
  return { user, onAdded, onClassified };
}

describe('BrainDumpInboxComponent', () => {
  it('el botón Añadir está deshabilitado sin texto', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Añadir' })).toBeDisabled();
  });

  it('emite added y limpia el campo al añadir', async () => {
    const { user, onAdded } = await setup();

    await user.type(
      screen.getByLabelText(/Suéltalo aquí/),
      'Terminar el informe{Enter}',
    );

    expect(onAdded).toHaveBeenCalledWith('Terminar el informe');
    expect(screen.getByLabelText(/Suéltalo aquí/)).toHaveValue('');
  });

  it('muestra los items sin clasificar con sus botones de categoría', async () => {
    await setup([testItem]);

    expect(screen.getByText('Llamar al dentista')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Espera' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No depende de mí' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Soltar' })).toBeInTheDocument();
  });

  it('emite classified con el id y la categoría elegida', async () => {
    const { user, onClassified } = await setup([testItem]);

    await user.click(screen.getByRole('button', { name: 'Acción' }));

    expect(onClassified).toHaveBeenCalledWith({ id: '1', category: 'action' });
  });
});
