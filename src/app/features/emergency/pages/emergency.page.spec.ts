import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { DbConfig } from '../../../core/persistence/db-schema';
import { APP_DB_CONFIG } from '../../../core/persistence/indexed-db.adapter';
import { EmergencyEventIndexedDbRepository } from '../repositories/emergency-event-indexeddb.repository';
import { EmergencyEventRepository } from '../repositories/emergency-event.repository';
import { ImpulseWaitingRecordIndexedDbRepository } from '../repositories/impulse-waiting-record-indexeddb.repository';
import { ImpulseWaitingRecordRepository } from '../repositories/impulse-waiting-record.repository';
import { EmergencyStore } from '../stores/emergency.store';
import { EmergencyPage } from './emergency.page';

async function setup() {
  const user = userEvent.setup();
  const config: DbConfig = {
    name: `test-db-${crypto.randomUUID()}`,
    version: 1,
    stores: [
      { name: 'emergencyEvents', keyPath: 'id' },
      { name: 'impulseWaitingRecords', keyPath: 'id' },
    ],
  };

  await render(EmergencyPage, {
    providers: [
      EmergencyStore,
      { provide: APP_DB_CONFIG, useValue: config },
      { provide: EmergencyEventRepository, useClass: EmergencyEventIndexedDbRepository },
      { provide: ImpulseWaitingRecordRepository, useClass: ImpulseWaitingRecordIndexedDbRepository },
    ],
  });

  return { user };
}

async function completeIntake(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText('¿Qué ha pasado?'), 'Discusión con mi pareja');
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.click(screen.getByRole('button', { name: 'Ansiedad' }));
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.click(screen.getByRole('button', { name: 'Siguiente' }));
  await user.type(screen.getByLabelText('¿Qué necesitas ahora mismo?'), 'tranquilidad');
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
}

describe('EmergencyPage', () => {
  it('empieza mostrando el formulario de intake', async () => {
    await setup();

    expect(screen.getByText('¿Qué ha pasado?')).toBeInTheDocument();
  });

  it('completa el intake, resuelve el evento y vuelve al inicio', async () => {
    const { user } = await setup();

    await completeIntake(user);
    expect(await screen.findByRole('button', { name: /Respiración guiada/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ya estoy mejor' }));
    expect(await screen.findByText('Me alegro de que estés mejor')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Volver al inicio' }));
    expect(screen.getByText('¿Qué ha pasado?')).toBeInTheDocument();
  });

  it('entra en modo espera, completa la reflexión y vuelve a las herramientas', async () => {
    const { user } = await setup();

    await completeIntake(user);
    await user.click(await screen.findByRole('button', { name: 'Espera antes de actuar' }));

    await user.type(screen.getByLabelText('¿Qué impulso quieres posponer?'), 'No enviar el mensaje');
    await user.click(screen.getByRole('button', { name: 'Empezar la espera' }));

    expect(await screen.findByText('No enviar el mensaje')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Resistí el impulso' }));

    expect(await screen.findByRole('button', { name: /Respiración guiada/ })).toBeInTheDocument();
  });
});
