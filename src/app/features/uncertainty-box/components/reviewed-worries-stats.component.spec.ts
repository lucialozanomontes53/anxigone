import { inputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';

import { ReviewedWorriesStatsComponent } from './reviewed-worries-stats.component';

describe('ReviewedWorriesStatsComponent', () => {
  it('muestra un mensaje cuando no hay revisiones', async () => {
    await render(ReviewedWorriesStatsComponent, {
      bindings: [
        inputBinding('stats', () => ({
          total: 0,
          resolvedItselfPct: 0,
          stillImportantPct: 0,
          asSeriousAsExpectedPct: 0,
        })),
      ],
    });

    expect(screen.getByText('Todavía no has revisado ninguna preocupación.')).toBeInTheDocument();
  });

  it('muestra los porcentajes cuando hay revisiones', async () => {
    await render(ReviewedWorriesStatsComponent, {
      bindings: [
        inputBinding('stats', () => ({
          total: 4,
          resolvedItselfPct: 75,
          stillImportantPct: 25,
          asSeriousAsExpectedPct: 50,
        })),
      ],
    });

    expect(screen.getByText('Revisadas (4)')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
