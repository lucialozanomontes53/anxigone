import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { createIntensity } from '../../../shared/models/intensity.model';
import { JournalEntry } from '../models/journal-entry.model';
import { JournalEntryListComponent } from './journal-entry-list.component';

const testEntry: JournalEntry = {
  id: '1',
  date: '2026-07-09T10:00:00.000Z' as JournalEntry['date'],
  emotion: 'ansiedad',
  intensity: createIntensity(7),
  situation: 'No me contestó al mensaje',
  facts: 'Han pasado 3 horas',
  interpretations: 'Está enfadado',
  fears: 'Que deje de quererme',
  alternatives: 'Puede estar ocupado',
  needs: 'Tranquilidad',
};

describe('JournalEntryListComponent', () => {
  it('muestra un mensaje cuando no hay entradas', async () => {
    await render(JournalEntryListComponent, {
      bindings: [inputBinding('entries', () => [])],
    });

    expect(screen.getByText(/Todavía no hay entradas/)).toBeInTheDocument();
  });

  it('lista una entrada con su emoción y permite expandir el detalle', async () => {
    const user = userEvent.setup();
    await render(JournalEntryListComponent, {
      bindings: [inputBinding('entries', () => [testEntry])],
    });

    expect(screen.getByText(/Ansiedad · 7\/10/)).toBeInTheDocument();

    await user.click(screen.getByText(/Ansiedad · 7\/10/));
    expect(screen.getByText(/No me contestó al mensaje/)).toBeInTheDocument();
  });

  it('emite deleted con el id al pulsar eliminar', async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    await render(JournalEntryListComponent, {
      bindings: [inputBinding('entries', () => [testEntry]), outputBinding('deleted', onDeleted)],
    });

    await user.click(screen.getByText(/Ansiedad · 7\/10/));
    await user.click(screen.getByRole('button', { name: 'Eliminar entrada' }));

    expect(onDeleted).toHaveBeenCalledWith('1');
  });
});
