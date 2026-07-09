declare const intensityBrand: unique symbol;

/** Escala 1-10 usada en emergencia, diario y seguimiento emocional. */
export type Intensity = number & { readonly [intensityBrand]: true };

export const MIN_INTENSITY = 1;
export const MAX_INTENSITY = 10;

export function createIntensity(value: number): Intensity {
  if (!Number.isInteger(value) || value < MIN_INTENSITY || value > MAX_INTENSITY) {
    throw new RangeError(
      `Intensity debe ser un entero entre ${MIN_INTENSITY} y ${MAX_INTENSITY}, se recibió ${value}`,
    );
  }
  return value as Intensity;
}

export function isValidIntensity(value: number): value is Intensity {
  return Number.isInteger(value) && value >= MIN_INTENSITY && value <= MAX_INTENSITY;
}
