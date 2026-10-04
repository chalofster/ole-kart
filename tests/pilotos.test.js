import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE, MEDIO_ANCHO, proyectar } from '../src/logica/pista.js';
import { crearKart, pasoKart, KART } from '../src/logica/kart.js';
import { actualizarVueltas } from '../src/logica/carrera.js';
import { azarConSemilla } from '../src/logica/azar.js';
import {
  crearPiloto, conducir, ayudar, velocidadPrudente, simularCarrera, QUIETO,
} from '../src/logica/pilotos.js';

const pista = crearPista(NOCHE);
const dt = 1 / 60;

// Da una vuelta con la función de manejo indicada y mide qué tan lejos del centro llegó.
function unaVuelta(manejar, segundos = 80) {
  const k = crearKart(pista, 5);
  Object.assign(k, { vuelta: 0, cp: 1 });
  let maxLateral = 0;
  for (let i = 0; i < 60 * segundos && k.vuelta < 1; i++) {
    const antes = k.s;
    pasoKart(k, manejar(k), pista, dt);
    actualizarVueltas(k, antes, pista);
    maxLateral = Math.max(maxLateral, Math.abs(k.lateral));
  }
  return { k, maxLateral };
}

describe('velocidadPrudente', () => {
  it('en la recta va a fondo y antes de la horquilla baja', () => {
    expect(velocidadPrudente(pista, 30)).toBe(1);
    const horquilla = proyectar(pista, 92, 61).s;
    expect(velocidadPrudente(pista, horquilla - 15)).toBeLessThan(0.75);
  });
});

describe('rival del computador', () => {
  it('da una vuelta completa sin salirse del camino', () => {
    const piloto = crearPiloto(azarConSemilla(1));
    const { k, maxLateral } = unaVuelta((kart) => conducir(piloto, kart, pista, dt));
    expect(k.vuelta).toBe(1);
    expect(maxLateral).toBeLessThan(MEDIO_ANCHO);
  });

  it('si queda atascado de frente a una valla, se suelta y sigue', () => {
    const k = crearKart(pista, 40, 9);
    k.rumbo += Math.PI / 2;
    const piloto = crearPiloto(azarConSemilla(2));
    for (let i = 0; i < 60 * 8; i++) pasoKart(k, conducir(piloto, k, pista, dt), pista, dt);
    expect(k.s).toBeGreaterThan(60);
  });
});

describe('modo ayuda', () => {
  it('sin tocar nada, el kart acelera solo y da la vuelta sin salirse del camino', () => {
    const { k, maxLateral } = unaVuelta((kart) => ayudar(QUIETO, kart, pista));
    expect(k.vuelta).toBe(1);
    expect(maxLateral).toBeLessThan(MEDIO_ANCHO);
  });

  it('aunque el niño gire siempre hacia un lado, no se sale del camino', () => {
    for (const giro of [1, -1]) {
      const { maxLateral } = unaVuelta((kart) => ayudar({ ...QUIETO, giro }, kart, pista));
      expect(maxLateral).toBeLessThan(MEDIO_ANCHO);
    }
  });

  it('respeta el freno del niño', () => {
    const k = crearKart(pista, 5);
    k.vel = 10;
    expect(ayudar({ ...QUIETO, frena: true }, k, pista)).toMatchObject({ frena: true, acelera: false });
  });
});

describe('impulso para quien va atrás', () => {
  it('el modo ayuda y los rivales también aprovechan el impulso', () => {
    const piloto = crearPiloto(azarConSemilla(3));
    const manejos = [(k) => ayudar(QUIETO, k, pista), (k) => conducir(piloto, k, pista, dt)];
    for (const manejar of manejos) {
      const k = crearKart(pista, 5);
      Object.assign(k, { vel: KART.velMax, factor: 1.12 });
      for (let i = 0; i < 60; i++) pasoKart(k, manejar(k), pista, dt, k.factor);
      expect(k.vel).toBeGreaterThan(KART.velMax * 1.1);
    }
  });
});

describe('carrera completa simulada', () => {
  it('los 8 karts del computador terminan las 3 vueltas en un tiempo razonable', () => {
    const c = simularCarrera(pista, { azar: azarConSemilla(42) });
    expect(c.estado).toBe('fin');
    expect(c.karts.every((k) => k.termino)).toBe(true);
    expect(c.tiempo).toBeGreaterThan(3 * 35);
    expect(c.tiempo).toBeLessThan(3 * 70);
  });
});
