import { ENERGY_LEVELS, isEnergyLevel } from './energy-level.model';

describe('isEnergyLevel', () => {
  it.each(ENERGY_LEVELS)('reconoce "%s" como un EnergyLevel válido', (level) => {
    expect(isEnergyLevel(level)).toBe(true);
  });

  it('rechaza un valor fuera del catálogo', () => {
    expect(isEnergyLevel('extreme')).toBe(false);
  });
});
