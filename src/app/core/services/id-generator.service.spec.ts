import { IdGeneratorService } from './id-generator.service';

describe('IdGeneratorService', () => {
  it('genera identificadores únicos', () => {
    const service = new IdGeneratorService();

    const a = service.generate();
    const b = service.generate();

    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/i);
  });
});
