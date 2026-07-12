import { inputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { RealityPhrase } from '../models/reality-phrase.model';
import { RandomPhraseCardComponent } from './random-phrase-card.component';

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

describe('RandomPhraseCardComponent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra un mensaje inicial y el botón deshabilitado sin frases', async () => {
    await render(RandomPhraseCardComponent, { bindings: [inputBinding('phrases', () => [])] });

    expect(screen.getByText('Pulsa el botón para ver una frase.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mostrar otra frase' })).toBeDisabled();
  });

  it('muestra una frase al pulsar el botón', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    await render(RandomPhraseCardComponent, {
      bindings: [inputBinding('phrases', () => [phrase()])],
    });

    await user.click(screen.getByRole('button', { name: 'Mostrar otra frase' }));

    expect(screen.getByText('La ansiedad no es evidencia')).toBeInTheDocument();
  });

  it('prioriza las frases marcadas como prioritarias', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const priorityPhrase = phrase({ id: 'phrase-2', text: 'Ya he superado situaciones similares', isPriority: true });
    await render(RandomPhraseCardComponent, {
      bindings: [inputBinding('phrases', () => [phrase(), priorityPhrase])],
    });

    await user.click(screen.getByRole('button', { name: 'Mostrar otra frase' }));

    expect(screen.getByText('Ya he superado situaciones similares')).toBeInTheDocument();
  });
});
