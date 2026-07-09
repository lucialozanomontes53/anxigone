import { createIntensity, isValidIntensity } from './intensity.model';

describe('createIntensity', () => {
  it('acepta valores enteros entre 1 y 10', () => {
    expect(createIntensity(1)).toBe(1);
    expect(createIntensity(10)).toBe(10);
    expect(createIntensity(5)).toBe(5);
  });

  it('rechaza valores fuera de rango', () => {
    expect(() => createIntensity(0)).toThrow(RangeError);
    expect(() => createIntensity(11)).toThrow(RangeError);
  });

  it('rechaza valores no enteros', () => {
    expect(() => createIntensity(4.5)).toThrow(RangeError);
  });
});

describe('isValidIntensity', () => {
  it('devuelve true solo para enteros 1-10', () => {
    expect(isValidIntensity(7)).toBe(true);
    expect(isValidIntensity(0)).toBe(false);
    expect(isValidIntensity(11)).toBe(false);
    expect(isValidIntensity(3.2)).toBe(false);
  });
});
