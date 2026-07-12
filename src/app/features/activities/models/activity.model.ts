import { Identifiable } from '../../../core/persistence/repository.base';
import { EnergyLevel } from '../../../shared/models/energy-level.model';
import { ISODateString } from '../../../shared/models/iso-date-string.model';

export interface Activity extends Identifiable {
  readonly title: string;
  readonly description: string;
  readonly energyLevel: EnergyLevel;
  readonly isCustom: boolean;
  readonly createdAt: ISODateString | null;
}

/**
 * Actividades predefinidas: constantes, no se persisten en IndexedDB. Solo las
 * actividades personalizadas del usuario viven en el repositorio (ver ADR asociado).
 */
export const PRESET_ACTIVITIES: readonly Activity[] = [
  {
    id: 'preset-music',
    title: 'Escuchar una playlist relajante',
    description: 'Música que ya sabes que te calma, sin buscar nada nuevo.',
    energyLevel: 'low',
    isCustom: false,
    createdAt: null,
  },
  {
    id: 'preset-journal',
    title: 'Escribir en el diario emocional',
    description: 'Aunque sean dos frases.',
    energyLevel: 'low',
    isCustom: false,
    createdAt: null,
  },
  {
    id: 'preset-walk',
    title: 'Salir a caminar',
    description: 'Aunque sea alrededor de la manzana.',
    energyLevel: 'medium',
    isCustom: false,
    createdAt: null,
  },
  {
    id: 'preset-call',
    title: 'Llamar a alguien de confianza',
    description: 'No hace falta hablar de lo que te preocupa si no quieres.',
    energyLevel: 'medium',
    isCustom: false,
    createdAt: null,
  },
  {
    id: 'preset-exercise',
    title: 'Hacer ejercicio',
    description: 'El que te apetezca, no tiene que ser intenso.',
    energyLevel: 'high',
    isCustom: false,
    createdAt: null,
  },
  {
    id: 'preset-clean',
    title: 'Ordenar o limpiar un espacio',
    description: 'Canalizar la energía en algo con resultado visible.',
    energyLevel: 'high',
    isCustom: false,
    createdAt: null,
  },
];
