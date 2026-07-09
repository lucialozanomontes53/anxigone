import { ClockService } from './clock.service';
import { isValidISODateString } from '../../shared/models/iso-date-string.model';

describe('ClockService', () => {
  it('devuelve la hora actual como ISODateString válido', () => {
    const service = new ClockService();

    expect(isValidISODateString(service.now())).toBe(true);
  });
});
