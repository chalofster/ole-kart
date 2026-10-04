import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE } from '../src/logica/pista.js';
import { lugaresLibres } from '../src/logica/decorado.js';

const pista = crearPista(NOCHE);
const distanciaMinima = (p) => Math.min(...pista.muestras.map((m) => Math.hypot(m.x - p.x, m.y - p.y)));

describe('lugaresLibres', () => {
  it('encuentra lugares para casas por fuera, lejos de todas las partes de la pista', () => {
    const casas = lugaresLibres(pista, { cada: 32, distancia: 24, holgura: 18, lado: -1 });
    expect(casas.length).toBeGreaterThanOrEqual(10);
    for (const c of casas) expect(distanciaMinima(c)).toBeGreaterThanOrEqual(18);
  });

  it('descarta los lugares que pisan otra parte de la pista', () => {
    const adentro = lugaresLibres(pista, { cada: 32, distancia: 24, holgura: 18, lado: 1 });
    expect(adentro.length).toBeLessThan(Math.ceil(pista.largo / 32));
  });
});
