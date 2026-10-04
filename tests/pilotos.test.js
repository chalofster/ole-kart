import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE, MEDIO_ANCHO, proyectar } from '../src/logica/pista.js';
import { crearKart, pasoKart, KART } from '../src/logica/kart.js';
import { actualizarVueltas, crearCarrera, pasoCarrera, recorrido } from '../src/logica/carrera.js';
import { azarConSemilla } from '../src/logica/azar.js';
import {
  crearPiloto, conducir, ayudar, velocidadPrudente, simularCarrera, QUIETO, decidirObjeto,
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

  it('deja pasar el uso del objeto que pidió el niño', () => {
    const k = crearKart(pista, 5);
    expect(ayudar({ ...QUIETO, usa: true }, k, pista).usa).toBe(true);
    expect(ayudar(QUIETO, k, pista).usa).toBe(false);
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

describe('equilibrio del modo ayuda', () => {
  it('con ayuda, acelerando y usando su objeto apenas lo tienen, los niños a veces quedan entre los primeros', () => {
    const puestos = [];
    for (let semilla = 1; semilla <= 10; semilla++) {
      const azar = azarConSemilla(semilla);
      const c = crearCarrera(pista, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [6, 7], azar);
      const pilotos = c.karts.map(() => crearPiloto(azar));
      while (c.estado !== 'fin' && c.tiempo < 400) {
        const intenciones = c.karts.map((k, i) => {
          if (c.estado !== 'carrera') return QUIETO;
          if (!k.humano || k.termino) return conducir(pilotos[i], k, pista, dt, c);
          return ayudar({ ...QUIETO, acelera: true, usa: !!k.objeto && k.ruleta === 0 }, k, pista);
        });
        pasoCarrera(c, intenciones, dt);
      }
      puestos.push(...c.karts.filter((k) => k.humano).map((k) => k.puesto));
    }
    expect(puestos.reduce((a, b) => a + b, 0) / puestos.length).toBeLessThanOrEqual(6.2);
    expect(Math.min(...puestos)).toBeLessThanOrEqual(4);
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

describe('rivales con objetos', () => {
  // Carrera con un niño (índice 7); todos lejos salvo los que cada prueba ubica.
  function preparar() {
    const c = crearCarrera(pista, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [7], azarConSemilla(20));
    c.estado = 'carrera';
    c.karts.forEach((k, i) => Object.assign(k, crearKart(pista, 600 + i * 30, 0)));
    return c;
  }
  const ubicar = (k, s, lateral = 0) => Object.assign(k, crearKart(pista, s, lateral));
  const decide = (c, k, azar = () => 0) => decidirObjeto(crearPiloto(azarConSemilla(3)), k, c, dt, azar);

  it('la bola disco la usa de inmediato; sin objeto o con la ruleta girando, nada', () => {
    const c = preparar();
    const k = c.karts[0];
    expect(decide(c, k)).toBe(false);
    k.objeto = 'disco';
    k.ruleta = 0.5;
    expect(decide(c, k)).toBe(false);
    k.ruleta = 0;
    expect(decide(c, k)).toBe(true);
  });

  it('el ají lo usa en las rectas y no antes de una curva cerrada', () => {
    const c = preparar();
    const k = ubicar(c.karts[0], 30);
    k.objeto = 'aji';
    expect(decide(c, k)).toBe(true);
    ubicar(k, proyectar(pista, 92, 61).s - 15);
    expect(decide(c, k)).toBe(false);
  });

  it('la calabaza la lanza si tiene un kart adelante en su línea; a un niño, solo 1 de cada 3 veces', () => {
    const c = preparar();
    const k = ubicar(c.karts[0], 100);
    k.objeto = 'calabaza';
    expect(decide(c, k)).toBe(false);
    ubicar(c.karts[1], 120);
    expect(decide(c, k)).toBe(true);
    ubicar(c.karts[1], 600);
    ubicar(c.karts[7], 120);
    expect(decide(c, k, () => 0.5)).toBe(false);
    expect(decide(c, k, () => 0.2)).toBe(true);
  });

  it('el blanco es el kart más cercano: si es un niño, cuenta la calma aunque haya un rival más lejos', () => {
    const c = preparar();
    const k = ubicar(c.karts[0], 100);
    k.objeto = 'calabaza';
    ubicar(c.karts[7], 110);
    ubicar(c.karts[1], 130);
    expect(decide(c, k, () => 0.5)).toBe(false);
    expect(decide(c, k, () => 0.2)).toBe(true);
    k.objeto = 'cascara';
    ubicar(c.karts[7], 96);
    ubicar(c.karts[1], 90);
    expect(decide(c, k, () => 0.5)).toBe(false);
    expect(decide(c, k, () => 0.2)).toBe(true);
  });

  it('la cáscara la deja si alguien lo sigue de cerca en su línea', () => {
    const c = preparar();
    const k = ubicar(c.karts[0], 200);
    k.objeto = 'cascara';
    expect(decide(c, k)).toBe(false);
    ubicar(c.karts[2], 192, 1);
    expect(decide(c, k)).toBe(true);
  });

  it('revisa una vez por segundo y, si lo guarda más de 8 s, lo usa igual', () => {
    const c = preparar();
    const k = ubicar(c.karts[0], 100);
    k.objeto = 'calabaza';
    const piloto = crearPiloto(azarConSemilla(4));
    let usos = 0;
    let pasos = 0;
    while (!usos && pasos < 60 * 12) {
      if (decidirObjeto(piloto, k, c, dt, () => 0)) usos += 1;
      pasos += 1;
    }
    expect(pasos * dt).toBeGreaterThan(8);
    expect(pasos * dt).toBeLessThan(10);
  });

  it('conducir lleva la decisión en usa, y sin carrera nunca usa', () => {
    const c = preparar();
    const k = c.karts[0];
    k.objeto = 'disco';
    expect(conducir(crearPiloto(azarConSemilla(5)), k, pista, dt, c).usa).toBe(true);
    k.objeto = 'disco';
    expect(conducir(crearPiloto(azarConSemilla(5)), k, pista, dt).usa).toBe(false);
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
