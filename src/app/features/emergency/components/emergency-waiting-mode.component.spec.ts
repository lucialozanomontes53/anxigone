import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { ImpulseWaitingRecord } from '../models/impulse-waiting-record.model';
import { EmergencyWaitingModeComponent, WaitingModeOutcome } from './emergency-waiting-mode.component';

const testRecord: ImpulseWaitingRecord = {
  id: '1',
  emergencyEventId: 'evt-1',
  createdAt: '2026-07-09T10:00:00.000Z' as ImpulseWaitingRecord['createdAt'],
  goal: 'No enviar el mensaje',
  timerDurationMin: 1,
  reflectionNotes: '',
  impulseResisted: null,
  completedAt: null,
};

async function setup() {
  const user = userEvent.setup();
  const onOutcome = vi.fn<(value: WaitingModeOutcome) => void>();
  await render(EmergencyWaitingModeComponent, {
    bindings: [inputBinding('waitingRecord', () => testRecord), outputBinding('outcome', onOutcome)],
  });
  return { user, onOutcome };
}

describe('EmergencyWaitingModeComponent', () => {
  it('muestra el recordatorio del objetivo y las preguntas de reflexión', async () => {
    await setup();

    expect(screen.getByText('No enviar el mensaje')).toBeInTheDocument();
    expect(
      screen.getByText('¿Qué necesitas realmente ahora mismo, más allá del impulso?'),
    ).toBeInTheDocument();
  });

  it('emite outcome con impulseResisted=true y las notas escritas', async () => {
    const { user, onOutcome } = await setup();

    await user.type(screen.getByLabelText('Tu reflexión mientras esperas'), 'Al final respiré hondo');
    await user.click(screen.getByRole('button', { name: 'Resistí el impulso' }));

    expect(onOutcome).toHaveBeenCalledWith({
      reflectionNotes: 'Al final respiré hondo',
      impulseResisted: true,
    });
  });

  it('emite outcome con impulseResisted=false', async () => {
    const { user, onOutcome } = await setup();

    await user.click(screen.getByRole('button', { name: 'No lo resistí' }));

    expect(onOutcome).toHaveBeenCalledWith({ reflectionNotes: '', impulseResisted: false });
  });
});
