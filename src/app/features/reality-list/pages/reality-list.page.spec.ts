import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { RealityPhraseIndexedDbRepository } from '../repositories/reality-phrase-indexeddb.repository';
import { RealityPhraseRepository } from '../repositories/reality-phrase.repository';
import { RealityListStore } from '../stores/reality-list.store';
import { RealityListPage } from './reality-list.page';

async function setup() {
  const user = userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [{ name: 'realityPhrases', keyPath: 'id' }],
  };

  await render(RealityListPage, {
    providers: [
      RealityListStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: RealityPhraseRepository, useClass: RealityPhraseIndexedDbRepository },
    ],
  });

  return { user };
}

describe('RealityListPage', () => {
  it('muestra el formulario y el mensaje de lista vacía', async () => {
    await setup();

    expect(screen.getByText(/Guarda una frase/)).toBeInTheDocument();
    expect(screen.getByText('Todavía no has guardado ninguna frase.')).toBeInTheDocument();
  });

  it('guarda una frase nueva y aparece en la lista', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText(/Guarda una frase/), 'La ansiedad no es evidencia');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('La ansiedad no es evidencia', { selector: '.reality-phrase-list__text' })).toBeInTheDocument();
  });

  it('marca una frase como favorita y prioritaria, y luego la elimina', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText(/Guarda una frase/), 'No conozco toda la información');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByText('No conozco toda la información', { selector: '.reality-phrase-list__text' });

    await user.click(screen.getByRole('button', { name: /Favorita/ }));
    expect(await screen.findByRole('button', { name: '★ Favorita' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Prioritaria/ }));
    expect(await screen.findByRole('button', { name: '📌 Prioritaria' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('Todavía no has guardado ninguna frase.')).toBeInTheDocument();
  });

  it('muestra una frase aleatoria de las guardadas al pulsar el botón', async () => {
    const { user } = await setup();

    await user.type(screen.getByLabelText(/Guarda una frase/), 'Mi mente está intentando protegerme');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByText('Mi mente está intentando protegerme', { selector: '.reality-phrase-list__text' });

    await user.click(screen.getByRole('button', { name: 'Mostrar otra frase' }));

    expect(screen.getByText('Mi mente está intentando protegerme', { selector: '.random-phrase-card__text' })).toBeInTheDocument();
  });
});
