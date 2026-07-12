import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { CrisisPlanIndexedDbRepository } from '../repositories/crisis-plan-indexeddb.repository';
import { CrisisPlanRepository } from '../repositories/crisis-plan.repository';
import { CrisisPlanStore } from '../stores/crisis-plan.store';
import { CrisisPlanActivationPage } from './crisis-plan-activation.page';

function dbProviders(config: DbConfig) {
  return [
    CrisisPlanStore,
    { provide: APP_DB_CONFIG, useValue: config },
    { provide: CrisisPlanRepository, useClass: CrisisPlanIndexedDbRepository },
  ];
}

/**
 * Escribe datos directamente en IndexedDB con una instancia de store aparte, ANTES de
 * renderizar la página. Evita competir con el propio `loadPlan()` que la página dispara
 * en su constructor (si se llamara a métodos del store ya renderizado, esa carga inicial
 * podría resolverse más tarde y pisar los datos recién escritos).
 */
async function seedPlan(config: DbConfig, seed: (store: CrisisPlanStore) => Promise<void>): Promise<void> {
  TestBed.configureTestingModule({ providers: dbProviders(config) });
  const store = TestBed.inject(CrisisPlanStore);
  await seed(store);
  TestBed.resetTestingModule();
}

async function setup(config: DbConfig = { name: `test-db-${crypto.randomUUID()}`, version: 1, stores: [{ name: 'crisisPlans', keyPath: 'id' }] }) {
  const user = userEvent.setup();
  await render(CrisisPlanActivationPage, {
    providers: [...dbProviders(config), provideRouter([])],
  });
  return { user };
}

describe('CrisisPlanActivationPage', () => {
  it('muestra un mensaje calmado y el acceso a herramientas incluso con el plan vacío', async () => {
    await setup();

    expect(screen.getByText('Estoy aquí contigo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Respirar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver el resto de herramientas' })).toHaveAttribute(
      'href',
      '/herramientas',
    );
  });

  it('muestra las señales de alerta y recordatorios ya guardados', async () => {
    const config: DbConfig = {
      name: `test-db-${crypto.randomUUID()}`,
      version: 1,
      stores: [{ name: 'crisisPlans', keyPath: 'id' }],
    };
    await seedPlan(config, async (store) => {
      await store.updateList('warningSigns', ['Reviso el móvil constantemente']);
      await store.updateList('reminders', ['La ansiedad no es evidencia']);
    });

    await setup(config);

    expect(await screen.findByText('Reviso el móvil constantemente')).toBeInTheDocument();
    expect(screen.getByText('La ansiedad no es evidencia')).toBeInTheDocument();
  });

  it('permite abrir la respiración y el grounding embebidos', async () => {
    const { user } = await setup();

    await user.click(screen.getByRole('button', { name: 'Respirar' }));
    expect(screen.getByText('Respiración diafragmática')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ejercicio de grounding' }));
    expect(screen.queryByText('Respiración diafragmática')).not.toBeInTheDocument();
  });

  it('muestra los contactos de apoyo con enlace tel:', async () => {
    const config: DbConfig = {
      name: `test-db-${crypto.randomUUID()}`,
      version: 1,
      stores: [{ name: 'crisisPlans', keyPath: 'id' }],
    };
    await seedPlan(config, async (store) => {
      await store.addContact({ name: 'Ana', phone: '600111222', note: '' });
    });

    await setup(config);

    const link = await screen.findByRole('link', { name: '600111222' });
    expect(link).toHaveAttribute('href', 'tel:600111222');
  });
});
