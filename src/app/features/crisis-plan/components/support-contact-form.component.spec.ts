import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { SupportContact } from '../models/support-contact.model';
import { NewSupportContactInput } from '../stores/crisis-plan.store';
import { SupportContactFormComponent } from './support-contact-form.component';

async function setup(contacts: readonly SupportContact[] = []) {
  const user = userEvent.setup();
  const onAdded = vi.fn<(value: NewSupportContactInput) => void>();
  const onRemoved = vi.fn<(id: string) => void>();
  await render(SupportContactFormComponent, {
    bindings: [
      inputBinding('contacts', () => contacts),
      outputBinding('added', onAdded),
      outputBinding('removed', onRemoved),
    ],
  });
  return { user, onAdded, onRemoved };
}

describe('SupportContactFormComponent', () => {
  it('el botón de añadir está deshabilitado sin nombre ni teléfono', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Añadir contacto' })).toBeDisabled();
  });

  it('añade un contacto con nombre, teléfono y nota', async () => {
    const { user, onAdded } = await setup();

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.type(screen.getByLabelText('Teléfono'), '600111222');
    await user.type(screen.getByLabelText('Nota (opcional)'), 'Mi hermana');
    await user.click(screen.getByRole('button', { name: 'Añadir contacto' }));

    expect(onAdded).toHaveBeenCalledWith({ name: 'Ana', phone: '600111222', note: 'Mi hermana' });
  });

  it('muestra los contactos existentes con enlace tel: y permite eliminarlos', async () => {
    const { user, onRemoved } = await setup([
      { id: 'contact-1', name: 'Ana', phone: '600111222', note: 'Mi hermana' },
    ]);

    const link = screen.getByRole('link', { name: '600111222' });
    expect(link).toHaveAttribute('href', 'tel:600111222');

    await user.click(screen.getByRole('button', { name: 'Eliminar contacto Ana' }));
    expect(onRemoved).toHaveBeenCalledWith('contact-1');
  });
});
