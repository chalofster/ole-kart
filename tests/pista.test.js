import { describe, it, expect } from 'vitest';
import {
  crearPista, NOCHE, proyectar, puntoEn, alturaDelPiso, diferencia, diferenciaAngular,
  MEDIO_ANCHO, VALLA, RAMPA,
} from '../src/logica/pista.js';

const pista = crearPista(NOCHE);
const { muestras } = pista;
const n = muestras.length;

describe('crearPista', () => {
  it('mide cerca de 993 unidades, con una muestra por unidad', () => {
    expect(pista.largo).toBeGreaterThan(980);
    expect(pista.largo).toBeLessThan(1005);
    let menor = Infinity;
    let mayor = 0;
    muestras.forEach((m, i) => {
      const sig = muestras[(i + 1) % n];
      const d = Math.hypot(sig.x - m.x, sig.y - m.y);
      menor = Math.min(menor, d);
      mayor = Math.max(mayor, d);
    });
    expect(menor).toBeGreaterThan(0.9);
    expect(mayor).toBeLessThan(1.1);
  });

  it('la tangente es unitaria y la normal apunta a la izquierda', () => {
    for (const m of muestras) {
      expect(Math.hypot(m.tx, m.ty)).toBeCloseTo(1, 6);
      expect(m.nx).toBeCloseTo(-m.ty, 9);
      expect(m.ny).toBeCloseTo(m.tx, 9);
    }
  });

  it('la meta está en el primer punto y apunta hacia +x', () => {
    const p = puntoEn(pista, 0);
    expect(p.x).toBeCloseTo(40, 1);
    expect(p.y).toBeCloseTo(0, 1);
    expect(Math.abs(p.rumbo)).toBeLessThan(0.05);
  });

  it('ubica los turbos y la rampa donde se definieron', () => {
    [70, 381, 827].forEach((s, i) => expect(Math.abs(pista.turbos[i] - s)).toBeLessThan(4));
    expect(Math.abs(pista.rampa - 440)).toBeLessThan(4);
  });

  it('reparte 16 puntos de control desde la meta', () => {
    expect(pista.controles).toHaveLength(16);
    expect(pista.controles[0]).toBe(0);
    expect(pista.controles[8]).toBeCloseTo(pista.largo / 2, 6);
  });

  it('las vallas no se pliegan en ninguna curva', () => {
    let peor = Infinity;
    for (const lado of [1, -1]) {
      muestras.forEach((m, i) => {
        const sig = muestras[(i + 1) % n];
        const dx = sig.x + sig.nx * VALLA * lado - (m.x + m.nx * VALLA * lado);
        const dy = sig.y + sig.ny * VALLA * lado - (m.y + m.ny * VALLA * lado);
        peor = Math.min(peor, dx * m.tx + dy * m.ty);
      });
    }
    expect(peor).toBeGreaterThan(0);
  });

  it('las partes de la pista que no son vecinas quedan separadas por más que dos vallas', () => {
    let menor = Infinity;
    for (let i = 0; i < n; i += 3) {
      for (let j = i + 3; j < n; j += 3) {
        if (Math.abs(diferencia(muestras[i].s, muestras[j].s, pista.largo)) < 70) continue;
        menor = Math.min(menor, Math.hypot(muestras[i].x - muestras[j].x, muestras[i].y - muestras[j].y));
      }
    }
    expect(menor).toBeGreaterThan(2 * VALLA + 10);
  });
});

describe('proyectar', () => {
  it('una muestra se proyecta sobre sí misma', () => {
    for (const i of [0, 100, 500, 900]) {
      const m = muestras[i];
      const p = proyectar(pista, m.x, m.y);
      expect(p.indice).toBe(i);
      expect(p.lateral).toBeCloseTo(0, 6);
      expect(p.s).toBeCloseTo(m.s, 6);
    }
  });

  it('mide el desplazamiento lateral con signo: positivo a la izquierda', () => {
    const m = muestras[300];
    expect(proyectar(pista, m.x + m.nx * 3, m.y + m.ny * 3).lateral).toBeCloseTo(3, 1);
    expect(proyectar(pista, m.x - m.nx * 5, m.y - m.ny * 5).lateral).toBeCloseTo(-5, 1);
  });

  it('la búsqueda cercana da lo mismo que la completa, también cruzando la meta', () => {
    const m = muestras[640];
    const x = m.x + m.nx * 2 + m.tx * 0.4;
    const y = m.y + m.ny * 2 + m.ty * 0.4;
    expect(proyectar(pista, x, y, 630)).toEqual(proyectar(pista, x, y));
    const cerca = muestras[1];
    expect(proyectar(pista, cerca.x, cerca.y, n - 3).indice).toBe(1);
  });

  it('puntoEn y proyectar son inversos', () => {
    const p = puntoEn(pista, 300.5, 2);
    const q = proyectar(pista, p.x, p.y);
    expect(q.s).toBeCloseTo(300.5, 1);
    expect(q.lateral).toBeCloseTo(2, 1);
  });
});

describe('alturaDelPiso', () => {
  it('la rampa sube de 0 a su altura y fuera de ella el piso es plano', () => {
    const r = pista.rampa;
    expect(alturaDelPiso(pista, r - 1, 0)).toBe(0);
    expect(alturaDelPiso(pista, r + RAMPA.largo / 2, 0)).toBeCloseTo(RAMPA.alto / 2, 6);
    expect(alturaDelPiso(pista, r + RAMPA.largo, 0)).toBeCloseTo(RAMPA.alto, 6);
    expect(alturaDelPiso(pista, r + RAMPA.largo + 0.5, 0)).toBe(0);
    expect(alturaDelPiso(pista, r + 3, MEDIO_ANCHO + 0.5)).toBe(0);
  });
});

describe('diferencia', () => {
  it('mide la distancia más corta por la pista, con signo', () => {
    expect(diferencia(990, 5, 1000)).toBe(15);
    expect(diferencia(5, 990, 1000)).toBe(-15);
    expect(diferencia(100, 400, 1000)).toBe(300);
    expect(diferenciaAngular(3, -3)).toBeCloseTo(2 * Math.PI - 6, 9);
  });
});
