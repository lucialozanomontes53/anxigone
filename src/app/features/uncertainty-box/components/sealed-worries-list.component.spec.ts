import { inputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';

import { toISODateString } from '../../../shared/models/iso-date-string.model';
import { UncertaintyEntry } from '../models/uncertainty-entry.model';
import { SealedWorriesListComponent } from './sealed-worries-list.component';

function entry(overrides: Partial<UncertaintyEntry> = {}): UncertaintyEntry {
  return {
    id: 'entry-1',
    worryText: '¿Por qué no me ha respondido?',
    createdAt: toISODateString(new Date('2026-01-01T10:00:00Z')),
    revisitAt: toISODateString(new Date('2026-01-02T10:00:00Z')),
    review: null,
    reviewedAt: null,
    ...overrides,
  };
}

describe('SealedWorriesListComponent', () => {
  it('muestra un mensaje cuando no hay preocupaciones selladas', async () => {
    await render(SealedWorriesListComponent, {
      bindings: [inputBinding('entries', () => [])],
    });

    expect(screen.getByText('No tienes preocupaciones selladas ahora mismo.')).toBeInTheDocument();
  });

  it('lista las preocupaciones selladas con su fecha de desbloqueo', async () => {
    await render(SealedWorriesListComponent, {
      bindings: [inputBinding('entries', () => [entry()])],
    });

    expect(screen.getByText('¿Por qué no me ha respondido?')).toBeInTheDocument();
    expect(screen.getByText('Selladas (1)')).toBeInTheDocument();
  });
});
