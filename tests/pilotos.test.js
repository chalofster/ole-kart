import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE, MEDIO_ANCHO, proyectar } from '../src/logica/pista.js';
import { crearKart, pasoKart, KART } from '../src/logica/kart.js';
import { actualizarVueltas, crearCarrera, pasoCarrera, recorrido } from '../src/logica/carrera.js';
import { azarConSemilla } from '../src/logica/azar.js';
import {
  crearPiloto, conducir, ayudar, velocidadPrudente, simularCarrera, QUIETO,
} from '../src/logica/pilotos.js';

const pista = crearPista(NOCHE);
const dt = 1 / 60;

// Da una vuelta con la función de manejo indicada y mide qué tan lejos del centro llegó.
function unaVuelta(manejar, segundos = 80, clase = 1) {
  const k = crearKart(pista, 5);
  Object.assign(k, { vuelta: 0, cp: 1, factor: clase });
  let maxLateral = 0;
  for (let i = 0; i < 60 * segundos && k.vuelta < 1; i++) {
    const antes = k.s;
    pasoKart(k, manejar(k), pista, dt, clase);
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

describe('adelantar', () => {
  it('un rival más rápido que alcanza a otro en su mismo carril lo pasa, sin quedar pegado', () => {
    const c = crearCarrera(pista, ['lento', 'rapido'], [], azarConSemilla(5));
    c.estado = 'carrera';
    Object.assign(c.karts[0], crearKart(pista, 40, 0), { ritmo: 0.85, cp: 1, vel: 15 });
    Object.assign(c.karts[1], crearKart(pista, 25, 0), { ritmo: 1, cp: 1, vel: 22 });
    const pilotos = c.karts.map(() => ({ ...crearPiloto(azarConSemilla(6)), carril: 0 }));
    let contacto = 0;
    for (let i = 0; i < 60 * 12; i++) {
      pasoCarrera(c, c.karts.map((k, j) => conducir(pilotos[j], k, pista, dt)), dt);
      const [a, b] = c.karts;
      if (Math.hypot(a.x - b.x, a.y - b.y) < KART.radio * 2 + 0.05) contacto += dt;
    }
    expect(recorrido(c.karts[1], pista)).toBeGreaterThan(recorrido(c.karts[0], pista));
    expect(contacto).toBeLessThan(2);
  });
});

describe('velocidades más rápidas', () => {
  const normal = simularCarrera(pista, { azar: azarConSemilla(42) });
  for (const clase of [1.25, 1.5]) {
    it(`a ${clase}× el modo ayuda da la vuelta sin salirse del camino, aunque el niño gire siempre`, () => {
      for (const giro of [0, 1, -1]) {
        const { k, maxLateral } = unaVuelta((kart) => ayudar({ ...QUIETO, giro }, kart, pista), 80, clase);
        expect(k.vuelta).toBe(1);
        expect(maxLateral).toBeLessThan(MEDIO_ANCHO);
      }
    });

    it(`a ${clase}× un rival da la vuelta sin salirse del camino`, () => {
      const piloto = crearPiloto(azarConSemilla(1));
      const { k, maxLateral } = unaVuelta((kart) => conducir(piloto, kart, pista, dt), 80, clase);
      expect(k.vuelta).toBe(1);
      expect(maxLateral).toBeLessThan(MEDIO_ANCHO);
    });

    it(`a ${clase}× los 8 rivales terminan la carrera simulada, más rápido que a velocidad normal`, () => {
      const c = simularCarrera(pista, { azar: azarConSemilla(42), clase });
      expect(c.estado).toBe('fin');
      expect(c.karts.every((k) => k.termino)).toBe(true);
      expect(c.tiempo).toBeLessThan((normal.tiempo / clase) * 1.1);
    });
  }
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
