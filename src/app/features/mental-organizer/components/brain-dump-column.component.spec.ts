import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { BrainDumpItem } from '../models/brain-dump-item.model';
import { BrainDumpColumnComponent } from './brain-dump-column.component';

const testItem: BrainDumpItem = {
  id: '1',
  content: 'Llamar al dentista',
  category: 'action',
  createdAt: '2026-07-09T10:00:00.000Z' as BrainDumpItem['createdAt'],
  resolvedAt: null,
};

describe('BrainDumpColumnComponent', () => {
  it('muestra un mensaje vacío cuando no hay items', async () => {
    await render(BrainDumpColumnComponent, {
      bindings: [inputBinding('title', () => 'Acción'), inputBinding('items', () => [])],
    });

    expect(screen.getByText('Acción (0)')).toBeInTheDocument();
    expect(screen.getByText('Nada por aquí todavía.')).toBeInTheDocument();
  });

  it('lista los items y emite resolved/deleted con el id', async () => {
    const user = userEvent.setup();
    const onResolved = vi.fn();
    const onDeleted = vi.fn();
    await render(BrainDumpColumnComponent, {
      bindings: [
        inputBinding('title', () => 'Acción'),
        inputBinding('items', () => [testItem]),
        outputBinding('resolved', onResolved),
        outputBinding('deleted', onDeleted),
      ],
    });

    expect(screen.getByText('Acción (1)')).toBeInTheDocument();
    expect(screen.getByText('Llamar al dentista')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resuelto' }));
    expect(onResolved).toHaveBeenCalledWith('1');

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onDeleted).toHaveBeenCalledWith('1');
  });
});
