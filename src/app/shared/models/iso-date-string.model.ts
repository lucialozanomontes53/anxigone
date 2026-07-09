declare const isoDateBrand: unique symbol;

/** Fecha serializada en formato ISO 8601, tal y como se persiste en IndexedDB. */
export type ISODateString = string & { readonly [isoDateBrand]: true };

export function toISODateString(date: Date): ISODateString {
  return date.toISOString() as ISODateString;
}

export function isValidISODateString(value: string): value is ISODateString {
  return !Number.isNaN(Date.parse(value));
}
