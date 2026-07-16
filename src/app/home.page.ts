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
  {
    path: '/caja-de-incertidumbre',
    title: 'Caja de Incertidumbre',
    description: 'Guarda una preocupación y déjala descansar hasta que llegue el momento de revisarla.',
  },
  {
    path: '/plan-de-crisis',
    title: 'Mi Plan de Crisis',
    description: 'Prepara ahora lo que quieras tener a mano en un momento difícil.',
  },
  {
    path: '/lista-de-realidad',
    title: 'Mi Lista de Realidad',
    description: 'Frases guardadas para volver a los hechos cuando un pensamiento se hace grande.',
  },
  {
    path: '/logros',
    title: 'Mis Logros Emocionales',
    description: 'Registra tus pequeños avances: rachas, semana, mes y estadísticas.',
  },
  {
    path: '/actividades',
    title: 'Lo Que Me Funciona',
    description: 'Actividades por nivel de energía, propias o predefinidas, valoradas tras usarlas.',
  },
  {
    path: '/objetivos',
    title: 'Objetivos de Bienestar',
    description: 'Pequeños compromisos contigo misma, no orientados a productividad.',
  },
  {
    path: '/ya-he-pensado-suficiente',
    title: 'Ya He Pensado Suficiente',
    description: 'Interrumpe la rumiación con un rato dedicado solo a calmarte.',
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
