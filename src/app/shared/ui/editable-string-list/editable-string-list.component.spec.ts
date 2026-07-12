import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { EditableStringListComponent } from './editable-string-list.component';

async function setup(items: readonly string[] = []) {
  const user = userEvent.setup();
  const onItemsChanged = vi.fn<(value: readonly string[]) => void>();
  await render(EditableStringListComponent, {
    bindings: [
      inputBinding('items', () => items),
      inputBinding('label', () => 'Señales de alerta'),
      outputBinding('itemsChanged', onItemsChanged),
    ],
  });
  return { user, onItemsChanged };
}

describe('EditableStringListComponent', () => {
  it('muestra la etiqueta y los items existentes', async () => {
    await setup(['Reviso el móvil constantemente']);

    expect(screen.getByText('Señales de alerta')).toBeInTheDocument();
    expect(screen.getByText('Reviso el móvil constantemente')).toBeInTheDocument();
  });

  it('añade un item nuevo y limpia el campo', async () => {
    const { user, onItemsChanged } = await setup(['primero']);

    await user.type(screen.getByLabelText('Añadir a Señales de alerta'), 'segundo');
    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    expect(onItemsChanged).toHaveBeenCalledWith(['primero', 'segundo']);
    expect(screen.getByLabelText('Añadir a Señales de alerta')).toHaveValue('');
  });

  it('añade un item al pulsar Enter', async () => {
    const { user, onItemsChanged } = await setup([]);

    await user.type(screen.getByLabelText('Añadir a Señales de alerta'), 'nuevo{Enter}');

    expect(onItemsChanged).toHaveBeenCalledWith(['nuevo']);
  });

  it('no añade un item vacío', async () => {
    const { user, onItemsChanged } = await setup([]);

    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    expect(onItemsChanged).not.toHaveBeenCalled();
  });

  it('elimina un item existente', async () => {
    const { user, onItemsChanged } = await setup(['primero', 'segundo']);

    await user.click(screen.getByRole('button', { name: 'Eliminar primero' }));

    expect(onItemsChanged).toHaveBeenCalledWith(['segundo']);
  });
});
