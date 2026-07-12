import { inputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';

import { VictoriesDashboardComponent } from './victories-dashboard.component';

describe('VictoriesDashboardComponent', () => {
  it('muestra las 4 estadísticas', async () => {
    await render(VictoriesDashboardComponent, {
      bindings: [
        inputBinding('totalCount', () => 12),
        inputBinding('weekCount', () => 3),
        inputBinding('monthCount', () => 9),
        inputBinding('currentStreak', () => 4),
      ],
    });

    expect(screen.getByText('Esta semana')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Este mes')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('Racha (días)')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
