import { inputBinding, outputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';
import userEvent from '@testing-library/user-event';

import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { UncertaintyEntry, UncertaintyReview } from '../models/uncertainty-entry.model';
import { WorryReviewFormComponent } from './worry-review-form.component';

const entry: UncertaintyEntry = {
  id: 'entry-1',
  worryText: '¿Por qué no me ha respondido?',
  createdAt: toISODateString(new Date('2026-01-01T10:00:00Z')),
  revisitAt: toISODateString(new Date('2026-01-02T10:00:00Z')),
  review: null,
  reviewedAt: null,
};

async function setup() {
  const user = userEvent.setup();
  const onReviewed = vi.fn<(value: UncertaintyReview) => void>();
  await render(WorryReviewFormComponent, {
    bindings: [inputBinding('entry', () => entry), outputBinding('reviewed', onReviewed)],
  });
  return { user, onReviewed };
}

describe('WorryReviewFormComponent', () => {
  it('el botón de guardar está deshabilitado hasta responder las 3 preguntas', async () => {
    const { user } = await setup();

    expect(screen.getByRole('button', { name: 'Guardar revisión' })).toBeDisabled();

    const siButtons = screen.getAllByRole('button', { name: 'Sí' });
    for (const button of siButtons) {
      await user.click(button);
    }

    expect(screen.getByRole('button', { name: 'Guardar revisión' })).toBeEnabled();
  });

  it('emite reviewed con las respuestas elegidas', async () => {
    const { user, onReviewed } = await setup();

    const [stillImportantYes] = screen.getAllByRole('button', { name: 'Sí' });
    const noButtons = screen.getAllByRole('button', { name: 'No' });
    await user.click(stillImportantYes!);
    await user.click(noButtons[1]!);
    await user.click(noButtons[2]!);
    await user.click(screen.getByRole('button', { name: 'Guardar revisión' }));

    expect(onReviewed).toHaveBeenCalledWith({
      stillImportant: true,
      resolvedItself: false,
      asSeriousAsExpected: false,
    });
  });
});
