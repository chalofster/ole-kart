import { describe, it, expect } from 'vitest';
import { PISTAS, indicePista } from '../src/logica/pistas.js';
import {
  crearPista, puntoEn, diferencia, diferenciaAngular, alturaDelPiso, MEDIO_ANCHO, VALLA, RAMPA, PUNTOS_DE_CONTROL,
} from '../src/logica/pista.js';
import { crearKart, pasoKart, TURBO_PISO } from '../src/logica/kart.js';
import { actualizarVueltas } from '../src/logica/carrera.js';
import { crearObjetos, LATERALES } from '../src/logica/objetos.js';
import { simularCarrera, ayudar, QUIETO } from '../src/logica/pilotos.js';
import { azarConSemilla } from '../src/logica/azar.js';

const dt = 1 / 60;

// Cuánto se aparta el rumbo del camino, entre dos distancias, del rumbo que tenía en la primera.
function giroEntre(pista, desde, hasta) {
  const inicial = puntoEn(pista, desde).rumbo;
  let peor = 0;
  for (let s = desde; s <= hasta; s += 1) peor = Math.max(peor, Math.abs(diferenciaAngular(inicial, puntoEn(pista, s).rumbo)));
  return peor;
}

describe('catálogo de pistas', () => {
  it('Noche es la primera y cada pista tiene id, ícono y nombre propios', () => {
    expect(PISTAS[0].id).toBe('noche');
    for (const clave of ['id', 'icono', 'nombre']) expect(new Set(PISTAS.map((p) => p[clave])).size).toBe(PISTAS.length);
    expect(indicePista('noche')).toBe(0);
    expect(indicePista('no-existe')).toBe(-1);
  });
});

describe.each(PISTAS)('recorrido de $nombre', ({ recorrido }) => {
  const pista = crearPista(recorrido);
  const { muestras, largo } = pista;
  const n = muestras.length;

  it('mide entre 850 y 1.250 unidades y tiene 16 puntos de control', () => {
    expect(largo).toBeGreaterThanOrEqual(850);
    expect(largo).toBeLessThanOrEqual(1250);
    expect(pista.controles).toHaveLength(PUNTOS_DE_CONTROL);
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

  it('las partes que no son vecinas quedan separadas por más que dos vallas', () => {
    let menor = Infinity;
    for (let i = 0; i < n; i += 3) {
      for (let j = i + 3; j < n; j += 3) {
        if (Math.abs(diferencia(muestras[i].s, muestras[j].s, largo)) < 70) continue;
        menor = Math.min(menor, Math.hypot(muestras[i].x - muestras[j].x, muestras[i].y - muestras[j].y));
      }
    }
    expect(menor).toBeGreaterThan(2 * VALLA + 10);
  });

  it('la meta y la parrilla de salida están en una recta', () => {
    expect(giroEntre(pista, largo - 30, largo + 10)).toBeLessThan(0.05);
  });

  it('tiene de 1 a 3 turbos y 1 o 2 rampas, cada rampa en una recta para aterrizar en el camino', () => {
    expect(pista.turbos.length).toBeGreaterThanOrEqual(1);
    expect(pista.turbos.length).toBeLessThanOrEqual(3);
    expect(pista.rampas.length).toBeGreaterThanOrEqual(1);
    expect(pista.rampas.length).toBeLessThanOrEqual(2);
    for (const r of pista.rampas) expect(giroEntre(pista, r - 10, r + RAMPA.largo + 50)).toBeLessThan(0.1);
  });

  it('tiene de 3 a 5 filas de 4 cajas, lejos de los turbos y de las rampas', () => {
    expect(pista.filas.length).toBeGreaterThanOrEqual(3);
    expect(pista.filas.length).toBeLessThanOrEqual(5);
    expect(crearObjetos(pista).cajas).toHaveLength(pista.filas.length * LATERALES.length);
    const lejos = (a, s) => Math.abs(diferencia(a, s, largo)) > 20;
    for (const s of pista.filas) {
      for (const t of pista.turbos) expect(lejos(t, s) && lejos(t + TURBO_PISO.largo, s)).toBe(true);
      for (const r of pista.rampas) expect(lejos(r, s) && lejos(r + RAMPA.largo, s)).toBe(true);
    }
  });

  it('cada rampa sube de 0 a su altura y fuera de ellas el piso es plano', () => {
    for (const r of pista.rampas) {
      expect(alturaDelPiso(pista, r - 1, 0)).toBe(0);
      expect(alturaDelPiso(pista, r + RAMPA.largo / 2, 0)).toBeCloseTo(RAMPA.alto / 2, 6);
      expect(alturaDelPiso(pista, r + RAMPA.largo + 0.5, 0)).toBe(0);
      expect(alturaDelPiso(pista, r + 3, MEDIO_ANCHO + 0.5)).toBe(0);
    }
  });
});

describe.each(PISTAS)('carrera en $nombre', ({ recorrido }) => {
  const pista = crearPista(recorrido);
  const normal = simularCarrera(pista, { azar: azarConSemilla(42) });

  it('a velocidad normal los 8 rivales terminan y el ganador tarda entre 100 y 170 s', () => {
    expect(normal.estado).toBe('fin');
    expect(normal.karts.every((k) => k.termino)).toBe(true);
    const ganador = Math.min(...normal.karts.map((k) => k.tiempoFinal));
    expect(ganador).toBeGreaterThan(100);
    expect(ganador).toBeLessThan(170);
  });

  it.each([1.25, 1.5])('a %s× también terminan todos, más rápido', (clase) => {
    const c = simularCarrera(pista, { azar: azarConSemilla(42), clase });
    expect(c.estado).toBe('fin');
    expect(c.karts.every((k) => k.termino)).toBe(true);
    expect(c.tiempo).toBeLessThan((normal.tiempo / clase) * 1.1);
  }, 30000);

  it.each([1, 1.25, 1.5])('a %s× el modo ayuda da la vuelta sin salirse del camino, aunque el niño gire siempre', (clase) => {
    for (const giro of [0, 1, -1]) {
      const k = crearKart(pista, 5);
      Object.assign(k, { vuelta: 0, cp: 1, factor: clase });
      let peor = 0;
      for (let i = 0; i < 60 * 100 && k.vuelta < 1; i++) {
        const antes = k.s;
        pasoKart(k, ayudar({ ...QUIETO, giro }, k, pista), pista, dt, clase);
        actualizarVueltas(k, antes, pista);
        peor = Math.max(peor, Math.abs(k.lateral));
      }
      expect(k.vuelta).toBe(1);
      expect(peor).toBeLessThan(MEDIO_ANCHO);
    }
  }, 30000);
});
