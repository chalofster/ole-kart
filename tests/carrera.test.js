import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE } from '../src/logica/pista.js';
import { azarConSemilla } from '../src/logica/azar.js';
import { KART } from '../src/logica/kart.js';
import {
  crearCarrera, pasoCarrera, actualizarVueltas, recorrido, factorVelocidad, separarKarts,
  ordenarPuestos, actualizarContrario, VUELTAS, CUENTA,
} from '../src/logica/carrera.js';

const pista = crearPista(NOCHE);
const L = pista.largo;
const N = pista.controles.length;
const IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const dt = 1 / 60;
const ACELERAN = IDS.map(() => ({ giro: 0, acelera: true, frena: false, derrapa: false }));

describe('crearCarrera', () => {
  it('pone 8 karts en la parrilla detrás de la meta, de a dos', () => {
    const c = crearCarrera(pista, IDS, [7], azarConSemilla(1));
    expect(c.karts).toHaveLength(8);
    c.karts.forEach((k, i) => {
      expect(k.id).toBe(IDS[i]);
      expect(k.s).toBeCloseTo(L - 8 - Math.floor(i / 2) * 6, 0);
      expect(k.lateral).toBeCloseTo(i % 2 === 0 ? 3 : -3, 1);
      expect(k.vuelta).toBe(0);
      expect(k.cp).toBe(0);
    });
    expect(c.estado).toBe('cuenta');
  });

  it('los niños tienen ritmo 1 y los rivales, entre 0,92 y 1', () => {
    const c = crearCarrera(pista, IDS, [6, 7], azarConSemilla(2));
    expect(c.karts.filter((k) => k.humano).map((k) => k.id)).toEqual(['g', 'h']);
    for (const k of c.karts) {
      if (k.humano) expect(k.ritmo).toBe(1);
      else {
        expect(k.ritmo).toBeGreaterThanOrEqual(0.92);
        expect(k.ritmo).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('cuenta regresiva', () => {
  it('nadie se mueve durante la cuenta, aunque acelere', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(3));
    const x = c.karts[0].x;
    for (let i = 0; i < Math.round((CUENTA - 0.1) / dt); i++) pasoCarrera(c, ACELERAN, dt);
    expect(c.karts[0].x).toBe(x);
    expect(c.estado).toBe('cuenta');
    for (let i = 0; i < 12; i++) pasoCarrera(c, ACELERAN, dt);
    expect(c.estado).toBe('carrera');
    for (let i = 0; i < 30; i++) pasoCarrera(c, ACELERAN, dt);
    expect(c.karts[0].x).toBeGreaterThan(x);
  });
});

describe('vueltas', () => {
  const kart = (s, cp, vuelta = 0) => ({ s, cp, vuelta });
  const mover = (k, hasta) => {
    const antes = k.s;
    k.s = ((hasta % L) + L) % L;
    return actualizarVueltas(k, antes, pista);
  };
  // Avanza o retrocede por la pista en pasos de 5 unidades.
  function recorrer(k, distancia) {
    const eventos = [];
    let hecho = 0;
    while (Math.abs(hecho) < Math.abs(distancia)) {
      const d = Math.sign(distancia) * Math.min(5, Math.abs(distancia) - Math.abs(hecho));
      hecho += d;
      eventos.push(...mover(k, k.s + d));
    }
    return eventos;
  }

  it('cruzar la meta desde la parrilla empieza la vuelta 1 sin contarla', () => {
    const k = kart(L - 2, 0);
    recorrer(k, 3);
    expect(k.cp).toBe(1);
    expect(k.vuelta).toBe(0);
  });

  it('una vuelta completa suma 1 y avisa', () => {
    const k = kart(1, 1);
    const eventos = recorrer(k, L);
    expect(k.vuelta).toBe(1);
    expect(k.cp).toBe(1);
    expect(eventos).toContain('vuelta');
  });

  it('la última vuelta avisa la meta', () => {
    const k = kart(1, 1, VUELTAS - 1);
    expect(recorrer(k, L)).toContain('meta');
    expect(k.vuelta).toBe(VUELTAS);
  });

  it('retroceder deshace el último control y no suma nada', () => {
    const k = kart(1, 1);
    recorrer(k, pista.controles[3] + 1);
    expect(k.cp).toBe(4);
    recorrer(k, -5);
    expect(k.cp).toBe(3);
    recorrer(k, 5);
    expect(k.cp).toBe(4);
    const j = kart(2, 1);
    recorrer(j, -4);
    expect(j.cp).toBe(0);
    recorrer(j, 4);
    expect(j.cp).toBe(1);
    expect(j.vuelta).toBe(0);
  });

  it('un salto grande de la proyección no cuenta', () => {
    const k = kart(pista.controles[2] - 1, 2);
    mover(k, pista.controles[2] + 30);
    expect(k.cp).toBe(2);
  });

  it('si se salta un control, cruzar la meta no suma la vuelta', () => {
    const k = kart(1, 1);
    recorrer(k, pista.controles[8] - 3);
    mover(k, pista.controles[9] + 1);
    recorrer(k, L - k.s + 3);
    expect(k.vuelta).toBe(0);
  });
});

describe('recorrido', () => {
  it('es negativo detrás de la meta y crece al avanzar', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(4));
    const k = c.karts[0];
    expect(recorrido(k, pista)).toBeCloseTo(-8, 0);
    k.cp = 1;
    k.s = 10;
    expect(recorrido(k, pista)).toBeCloseTo(10, 6);
    k.vuelta = 2;
    k.cp = 5;
    k.s = pista.controles[4] + 3;
    expect(recorrido(k, pista)).toBeCloseTo(2 * L + pista.controles[4] + 3, 6);
  });

  it('un atajo no adelanta más allá del siguiente control', () => {
    expect(recorrido({ vuelta: 0, cp: 3, s: pista.controles[6] }, pista)).toBe(pista.controles[3]);
  });
});

describe('puestos', () => {
  it('ordena por recorrido y pone primero a quienes terminaron, por tiempo', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(5));
    c.karts.forEach((k, i) => {
      k.cp = 1;
      k.s = 10 + i;
    });
    Object.assign(c.karts[2], { termino: true, tiempoFinal: 90 });
    Object.assign(c.karts[5], { termino: true, tiempoFinal: 80 });
    ordenarPuestos(c);
    expect(c.puestos.slice(0, 3)).toEqual([5, 2, 7]);
    expect(c.karts[5].puesto).toBe(1);
    expect(c.karts[0].puesto).toBe(8);
  });
});

describe('factorVelocidad', () => {
  const nino = { humano: true, ritmo: 1 };
  const rival = { humano: false, ritmo: 1 };

  it('el primero va normal y quien va media vuelta atrás, 12 % más rápido', () => {
    expect(factorVelocidad(nino, 500, 500, 500, L)).toBe(1);
    expect(factorVelocidad(nino, 500 - L / 2, 500, 500 - L / 2, L)).toBeCloseTo(1.12, 6);
    expect(factorVelocidad(nino, 500 - L / 4, 500, 500 - L / 4, L)).toBeCloseTo(1.06, 6);
  });

  it('un rival muy adelante de los niños baja hasta 15 %', () => {
    expect(factorVelocidad(rival, 1000, 1000, 1000 - L / 2, L)).toBeCloseTo(0.85, 6);
    expect(factorVelocidad(rival, 1000, 1000, 1000 - L / 4, L)).toBeCloseTo(1, 6);
  });

  it('un rival muy atrás de los niños se apura', () => {
    expect(factorVelocidad(rival, 0, L / 2, L / 2, L)).toBeCloseTo(1.12 * 1.1, 6);
  });

  it('sin niños en la carrera solo cuenta el ritmo propio', () => {
    expect(factorVelocidad({ humano: false, ritmo: 0.95 }, 100, 100, null, L)).toBeCloseTo(0.95, 6);
  });
});

describe('choques entre karts', () => {
  it('separa dos karts que se tocan y les quita un poco de velocidad', () => {
    const a = { x: 0, y: 0, h: 0, vel: 10 };
    const b = { x: 1, y: 0, h: 0, vel: 10 };
    separarKarts([a, b]);
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(KART.radio * 2, 6);
    expect(a.vel).toBeLessThan(10);
  });

  it('no separa un kart en el aire de uno en el suelo', () => {
    const a = { x: 0, y: 0, h: 0, vel: 10 };
    const b = { x: 1, y: 0, h: 2, vel: 10 };
    separarKarts([a, b]);
    expect(b.x).toBe(1);
  });
});

describe('sentido contrario', () => {
  it('se marca después de 1 s andando al revés y se borra al corregir', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(6));
    const k = c.karts[0];
    k.rumbo += Math.PI;
    k.vel = 5;
    for (let i = 0; i < 70; i++) actualizarContrario(k, pista, dt);
    expect(k.contrario).toBeGreaterThan(1);
    k.rumbo -= Math.PI;
    actualizarContrario(k, pista, dt);
    expect(k.contrario).toBe(0);
  });
});

describe('fin de carrera', () => {
  it('con niños, termina cuando los niños cruzan la meta final, aunque falten rivales', () => {
    const c = crearCarrera(pista, IDS, [0], azarConSemilla(7));
    c.estado = 'carrera';
    const k = c.karts[0];
    Object.assign(k, { vuelta: VUELTAS - 1, cp: N, vel: 20 });
    for (let i = 0; i < 40; i++) pasoCarrera(c, ACELERAN, dt);
    expect(k.termino).toBe(true);
    expect(k.tiempoFinal).toBeGreaterThan(0);
    expect(c.estado).toBe('fin');
    expect(c.karts.filter((x) => x.termino)).toHaveLength(1);
  });
});
