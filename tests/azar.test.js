import { describe, it, expect } from 'vitest';
import { azarConSemilla } from '../src/logica/azar.js';

describe('azarConSemilla', () => {
  it('con la misma semilla repite la secuencia', () => {
    const a = azarConSemilla(7);
    const b = azarConSemilla(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('entrega números entre 0 y 1', () => {
    const a = azarConSemilla(1);
    for (let i = 0; i < 1000; i++) {
      const v = a();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
