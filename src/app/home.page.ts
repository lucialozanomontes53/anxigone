import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FeatureLink {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly emphasis?: boolean;
}

const FEATURE_LINKS: readonly FeatureLink[] = [
  {
    path: '/emergencia',
    title: 'Botón de emergencia',
    description: 'Si te sientes desbordada ahora mismo, empieza aquí.',
    emphasis: true,
  },
  {
    path: '/herramientas',
    title: 'Caja de herramientas emocionales',
    description: 'Respiración y grounding, sin necesidad de estar en crisis.',
  },
  {
    path: '/diario',
    title: 'Diario emocional',
    description: 'Separa hechos, interpretaciones, miedos y alternativas.',
  },
  {
    path: '/organizador',
    title: 'Organizador mental',
    description: 'Vacía la cabeza y clasifica: acción, espera, no depende de mí, soltar.',
  },
];

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly featureLinks = FEATURE_LINKS;
}
