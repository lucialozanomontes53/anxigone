import { outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { CreateJournalEntryInput } from '../stores/journal.store';
import { JournalEntryFormComponent } from './journal-entry-form.component';

async function setup() {
  const user = userEvent.setup();
  const onSubmitted = vi.fn<(value: CreateJournalEntryInput) => void>();
  await render(JournalEntryFormComponent, {
    bindings: [outputBinding('submitted', onSubmitted)],
  });
  return { user, onSubmitted };
}

describe('JournalEntryFormComponent', () => {
  it('el botón de guardar está deshabilitado sin situación ni emoción', async () => {
    await setup();

    expect(screen.getByRole('button', { name: 'Guardar en el diario' })).toBeDisabled();
  });

  it('se habilita al escribir la situación y elegir una emoción', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText('¿Qué ha pasado?'), 'No me contestó');
    await user.click(screen.getByRole('button', { name: 'Ansiedad' }));

    expect(screen.getByRole('button', { name: 'Guardar en el diario' })).toBeEnabled();
  });

  it('emite submitted con todos los campos y limpia el formulario', async () => {
    const { user, onSubmitted } = await setup();

    await user.type(screen.getByLabelText('¿Qué ha pasado?'), 'No me contestó al mensaje');
    await user.click(screen.getByRole('button', { name: 'Ansiedad' }));
    await user.type(screen.getByLabelText(/Hechos/), 'Han pasado 3 horas');
    await user.type(screen.getByLabelText(/Interpretaciones/), 'Está enfadado');
    await user.type(screen.getByLabelText(/Miedos/), 'Que deje de quererme');
    await user.type(screen.getByLabelText(/Alternativas/), 'Puede estar ocupado');
    await user.type(screen.getByLabelText('¿Qué necesitas?'), 'Tranquilidad');
    await user.click(screen.getByRole('button', { name: 'Guardar en el diario' }));

    expect(onSubmitted).toHaveBeenCalledWith({
      emotion: 'ansiedad',
      intensity: 5,
      situation: 'No me contestó al mensaje',
      facts: 'Han pasado 3 horas',
      interpretations: 'Está enfadado',
      fears: 'Que deje de quererme',
      alternatives: 'Puede estar ocupado',
      needs: 'Tranquilidad',
    });

    expect(screen.getByLabelText('¿Qué ha pasado?')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Guardar en el diario' })).toBeDisabled();
  });
});
