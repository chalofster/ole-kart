import { describe, it, expect } from 'vitest';
import { trazoDelRecorrido } from '../src/pantallas/tarjetas.js';
import { PISTAS } from '../src/logica/pistas.js';
import { crearPista } from '../src/logica/pista.js';

const puntos = (d) => d.slice(1, -1).split('L').map((p) => p.split(' ').map(Number));
const rango = (valores) => Math.max(...valores) - Math.min(...valores);

describe('dibujo del recorrido en las tarjetas', () => {
  it.each(PISTAS.map((p) => [p.nombre, p.recorrido]))('%s cabe en la tarjeta, centrado y sin deformarse', (_, recorrido) => {
    const { muestras } = crearPista(recorrido);
    const { d, meta } = trazoDelRecorrido(muestras, 160, 100, 12);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    const ps = puntos(d);
    const xs = ps.map(([x]) => x);
    const ys = ps.map(([, y]) => y);
    for (const x of xs) expect(x >= 11.9 && x <= 148.1).toBe(true);
    for (const y of ys) expect(y >= 11.9 && y <= 88.1).toBe(true);
    // Misma escala en x e y: la proporción del dibujo es la del recorrido.
    expect(Math.abs(rango(xs) / rango(ys) - rango(muestras.map((m) => m.x)) / rango(muestras.map((m) => m.y)))).toBeLessThan(0.05);
    // Centrado: márgenes opuestos iguales.
    expect(Math.abs(Math.min(...xs) + Math.max(...xs) - 160)).toBeLessThan(2);
    expect(Math.abs(Math.min(...ys) + Math.max(...ys) - 100)).toBeLessThan(2);
    expect(meta).toEqual(ps[0]);
  });

  it('el norte queda arriba: un punto más al norte se dibuja más arriba en la tarjeta', () => {
    const muestras = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    const ps = puntos(trazoDelRecorrido(muestras, 160, 100, 12, 1).d);
    expect(ps[2][1]).toBeLessThan(ps[1][1]);
    expect(ps[1][0]).toBeGreaterThan(ps[0][0]);
  });
});
