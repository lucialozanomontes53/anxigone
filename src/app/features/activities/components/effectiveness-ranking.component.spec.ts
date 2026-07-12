import { inputBinding } from '@angular/core';
import { render, screen } from '@testing-library/angular/zoneless';

import { PRESET_ACTIVITIES } from '../models/activity.model';
import { EffectivenessRankingComponent } from './effectiveness-ranking.component';

describe('EffectivenessRankingComponent', () => {
  it('muestra un mensaje cuando no hay valoraciones', async () => {
    await render(EffectivenessRankingComponent, {
      bindings: [inputBinding('ranking', () => []), inputBinding('activities', () => PRESET_ACTIVITIES)],
    });

    expect(
      screen.getByText('Marca alguna actividad como hecha para ver cuáles te ayudan más.'),
    ).toBeInTheDocument();
  });

  it('muestra el título de la actividad y su puntuación media', async () => {
    await render(EffectivenessRankingComponent, {
      bindings: [
        inputBinding('ranking', () => [{ activityId: 'preset-walk', averageScore: 3.5, usageCount: 2 }]),
        inputBinding('activities', () => PRESET_ACTIVITIES),
      ],
    });

    expect(screen.getByText('Salir a caminar')).toBeInTheDocument();
    expect(screen.getByText('3.5/4 · 2x')).toBeInTheDocument();
  });
});
