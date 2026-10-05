import { describe, it, expect } from 'vitest';
import { crearGestos, pasoGestos, caraDelKart, alegrar, GESTO, CARAS } from '../src/logica/gestos.js';

const dt = 1 / 60;
const kart = (cambios = {}) => ({ trompo: 0, enAire: false, turbo: 0, disco: 0, derrape: null, rumbo: 0, ...cambios });
const DERRAPE = { dir: 1, carga: 0 };
// Avanza los segundos indicados (los eventos llegan en el primer paso) y devuelve el último gesto.
function avanzar(g, k, segundos, eventos = []) {
  let gesto = null;
  for (let i = 0; i < Math.round(segundos / dt); i++) gesto = pasoGestos(g, k, i === 0 ? eventos : [], dt);
  return gesto;
}

describe('cara según lo que le pasa al kart', () => {
  const g = crearGestos(() => 0.5);

  it('hay cinco caras', () => {
    expect(CARAS).toEqual(['normal', 'decidida', 'feliz', 'sorpresa', 'mareo']);
  });

  it('cada situación tiene su cara', () => {
    expect(caraDelKart(kart(), g)).toBe('normal');
    expect(caraDelKart(kart({ derrape: DERRAPE }), g)).toBe('decidida');
    expect(caraDelKart(kart({ turbo: 0.5 }), g)).toBe('feliz');
    expect(caraDelKart(kart({ disco: 3 }), g)).toBe('feliz');
    expect(caraDelKart(kart({ enAire: true }), g)).toBe('sorpresa');
    expect(caraDelKart(kart({ trompo: 0.5 }), g)).toBe('mareo');
  });

  it('si pasan varias cosas a la vez, gana la más importante', () => {
    expect(caraDelKart(kart({ trompo: 0.5, enAire: true, turbo: 1 }), g)).toBe('mareo');
    expect(caraDelKart(kart({ enAire: true, turbo: 1, derrape: DERRAPE }), g)).toBe('sorpresa');
    expect(caraDelKart(kart({ turbo: 1, derrape: DERRAPE }), g)).toBe('feliz');
  });
});

describe('cara feliz', () => {
  it('al romper una caja dura 1 s y después vuelve la cara de antes', () => {
    const g = crearGestos(() => 1);
    const derrapando = kart({ derrape: DERRAPE });
    expect(avanzar(g, derrapando, 0.9, ['caja']).cara).toBe('feliz');
    expect(avanzar(g, derrapando, 0.15).cara).toBe('decidida');
  });

  it('alegrar la pone por el tiempo pedido', () => {
    const g = crearGestos(() => 1);
    alegrar(g, 0.5);
    expect(avanzar(g, kart(), 0.4).cara).toBe('feliz');
    expect(avanzar(g, kart(), 0.15).cara).toBe('normal');
  });
});

describe('parpadeo', () => {
  it('cierra los ojos 0,12 s; el primero a los 2 s si el azar da 0', () => {
    const g = crearGestos(() => 0);
    expect(avanzar(g, kart(), 1.9).ojosCerrados).toBe(false);
    expect(avanzar(g, kart(), 0.15).ojosCerrados).toBe(true);
    expect(avanzar(g, kart(), 0.15).ojosCerrados).toBe(false);
  });

  it('a lo más cada 5 s', () => {
    const g = crearGestos(() => 1);
    expect(avanzar(g, kart(), 4.9).ojosCerrados).toBe(false);
    expect(avanzar(g, kart(), 0.15).ojosCerrados).toBe(true);
  });

  it('solo se ve con la cara normal', () => {
    const g = crearGestos(() => 0);
    expect(avanzar(g, kart({ turbo: 1 }), 2.05).ojosCerrados).toBe(false);
  });
});

describe('pausa', () => {
  it('sin avance del reloj, la cara, el parpadeo y la inclinación no cambian', () => {
    const g = crearGestos(() => 0);
    avanzar(g, kart(), 2.05);
    const antes = { ...g };
    for (let i = 0; i < 100; i++) {
      expect(pasoGestos(g, kart({ rumbo: 1 }), ['caja'], 0)).toEqual({ cara: 'normal', ojosCerrados: true, inclinacion: antes.inclinacion });
    }
    expect(g).toEqual(antes);
  });
});

describe('inclinación de la cabeza', () => {
  it('se inclina hacia el lado de la curva, como máximo 15°', () => {
    expect(GESTO.inclinacionMax).toBeCloseTo((15 * Math.PI) / 180, 9);
    for (const lado of [1, -1]) {
      const g = crearGestos(() => 0.5);
      const k = kart();
      for (let i = 0; i < 120; i++) {
        k.rumbo += lado * 0.03;
        pasoGestos(g, k, [], dt);
      }
      expect(Math.sign(g.inclinacion)).toBe(lado);
      expect(Math.abs(g.inclinacion)).toBeLessThanOrEqual(GESTO.inclinacionMax);
    }
  });

  it('en una recta vuelve al centro', () => {
    const g = crearGestos(() => 0.5);
    const k = kart();
    for (let i = 0; i < 60; i++) {
      k.rumbo += 0.03;
      pasoGestos(g, k, [], dt);
    }
    avanzar(g, k, 1);
    expect(Math.abs(g.inclinacion)).toBeLessThan(0.01);
  });
});
