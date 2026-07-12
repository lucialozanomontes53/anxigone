import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { RealityPhrase } from '../models/reality-phrase.model';
import { RealityPhraseListComponent } from './reality-phrase-list.component';

function phrase(overrides: Partial<RealityPhrase> = {}): RealityPhrase {
  return {
    id: 'phrase-1',
    text: 'La ansiedad no es evidencia',
    isFavorite: false,
    isPriority: false,
    createdAt: toISODateString(new Date('2026-01-01T10:00:00Z')),
    ...overrides,
  };
}

async function setup(phrases: readonly RealityPhrase[]) {
  const user = userEvent.setup();
  const onFavoriteToggled = vi.fn<(id: string) => void>();
  const onPriorityToggled = vi.fn<(id: string) => void>();
  const onDeleted = vi.fn<(id: string) => void>();
  await render(RealityPhraseListComponent, {
    bindings: [
      inputBinding('phrases', () => phrases),
      outputBinding('favoriteToggled', onFavoriteToggled),
      outputBinding('priorityToggled', onPriorityToggled),
      outputBinding('deleted', onDeleted),
    ],
  });
  return { user, onFavoriteToggled, onPriorityToggled, onDeleted };
}

describe('RealityPhraseListComponent', () => {
  it('muestra un mensaje cuando no hay frases', async () => {
    await setup([]);

    expect(screen.getByText('Todavía no has guardado ninguna frase.')).toBeInTheDocument();
  });

  it('muestra la frase y permite marcarla como favorita', async () => {
    const { user, onFavoriteToggled } = await setup([phrase()]);

    expect(screen.getByText('La ansiedad no es evidencia')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Favorita/ }));

    expect(onFavoriteToggled).toHaveBeenCalledWith('phrase-1');
  });

  it('permite marcarla como prioritaria', async () => {
    const { user, onPriorityToggled } = await setup([phrase()]);

    await user.click(screen.getByRole('button', { name: /Prioritaria/ }));

    expect(onPriorityToggled).toHaveBeenCalledWith('phrase-1');
  });

  it('permite eliminarla', async () => {
    const { user, onDeleted } = await setup([phrase()]);

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(onDeleted).toHaveBeenCalledWith('phrase-1');
  });

  it('refleja el estado activo de favorita y prioritaria', async () => {
    await setup([phrase({ isFavorite: true, isPriority: true })]);

    expect(screen.getByRole('button', { name: '★ Favorita' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '📌 Prioritaria' })).toHaveAttribute('aria-pressed', 'true');
  });
});
