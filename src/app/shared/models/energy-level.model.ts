export const ENERGY_LEVELS = ['low', 'medium', 'high'] as const;

export type EnergyLevel = (typeof ENERGY_LEVELS)[number];

export function isEnergyLevel(value: string): value is EnergyLevel {
  return (ENERGY_LEVELS as readonly string[]).includes(value);
}
