import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE, diferencia, RAMPA } from '../src/logica/pista.js';
import { crearKart, KART, TURBO_PISO } from '../src/logica/kart.js';
import { azarConSemilla } from '../src/logica/azar.js';
import {
  sortearObjeto, crearObjetos, prepararKart, golpear, usarObjeto, pasoObjetos, OBJ, FILAS, LATERALES, TIPOS,
} from '../src/logica/objetos.js';

const pista = crearPista(NOCHE);
const dt = 1 / 60;
const azar = azarConSemilla(1);

function kartEn(s, lateral = 0, cambios = {}) {
  const k = crearKart(pista, s, lateral);
  prepararKart(k);
  return Object.assign(k, { puesto: 4, termino: false }, cambios);
}
// Avanza los objetos los segundos indicados y devuelve los eventos de cada kart.
function avanzar(estado, karts, segundos) {
  const eventos = karts.map(() => []);
  for (let i = 0; i < Math.round(segundos / dt); i++) pasoObjetos(estado, karts, pista, dt, azar, eventos);
  return eventos;
}

describe('sorteo según la posición', () => {
  const contar = (puesto) => {
    const a = azarConSemilla(puesto);
    const n = Object.fromEntries(TIPOS.map((t) => [t, 0]));
    for (let i = 0; i < 2000; i++) n[sortearObjeto(puesto, a)] += 1;
    return n;
  };

  it('el primero nunca recibe la bola disco', () => {
    expect(contar(1).disco).toBe(0);
  });

  it('los últimos reciben sobre todo ajíes y bolas disco', () => {
    const n = contar(8);
    expect((n.aji + n.disco) / 2000).toBeGreaterThan(0.6);
  });

  it('en el medio salen los cuatro', () => {
    for (const cantidad of Object.values(contar(3))) expect(cantidad).toBeGreaterThan(150);
  });
});

describe('cajas', () => {
  it('hay cuatro filas de cuatro, lejos de las flechas de turbo y de la rampa', () => {
    const { cajas } = crearObjetos(pista);
    expect(cajas).toHaveLength(FILAS.length * LATERALES.length);
    for (const s of FILAS) {
      for (const t of pista.turbos) {
        expect(Math.abs(diferencia(t, s, pista.largo))).toBeGreaterThan(20);
        expect(Math.abs(diferencia(t + TURBO_PISO.largo, s, pista.largo))).toBeGreaterThan(20);
      }
      expect(Math.abs(diferencia(pista.rampa, s, pista.largo))).toBeGreaterThan(20);
      expect(Math.abs(diferencia(pista.rampa + RAMPA.largo, s, pista.largo))).toBeGreaterThan(20);
    }
  });

  it('da un objeto con ruleta a quien no tiene, se rompe y vuelve a los 2 s', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(FILAS[0], LATERALES[0]);
    const eventos = avanzar(estado, [k], dt);
    expect(eventos[0]).toContain('caja');
    expect(TIPOS).toContain(k.objeto);
    expect(k.ruleta).toBeGreaterThan(0.9);
    expect(estado.cajas[0].vuelve).toBeGreaterThan(1.9);
    avanzar(estado, [], OBJ.vuelveCaja + dt);
    expect(estado.cajas[0].vuelve).toBe(0);
  });

  it('si dos karts la tocan en el mismo paso, solo uno recibe objeto', () => {
    const estado = crearObjetos(pista);
    const a = kartEn(FILAS[1], LATERALES[2]);
    const b = kartEn(FILAS[1], LATERALES[2]);
    avanzar(estado, [a, b], dt);
    expect([a.objeto, b.objeto].filter(Boolean)).toHaveLength(1);
  });

  it('a quien ya tiene un objeto se le rompe la caja sin darle otro', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(FILAS[0], LATERALES[1], { objeto: 'aji' });
    avanzar(estado, [k], dt);
    expect(k.objeto).toBe('aji');
    expect(estado.cajas[1].vuelve).toBeGreaterThan(0);
  });

  it('un kart en el aire no toca las cajas', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(FILAS[0], LATERALES[0], { enAire: true, h: 2 });
    avanzar(estado, [k], dt);
    expect(k.objeto).toBeNull();
    expect(estado.cajas[0].vuelve).toBe(0);
  });
});

describe('ruleta', () => {
  it('mientras gira no se puede usar; al terminar avisa que está listo', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(300, 0, { objeto: 'aji', ruleta: OBJ.ruleta });
    usarObjeto(estado, k, pista, 1);
    expect(k.objeto).toBe('aji');
    expect(k.turbo).toBe(0);
    const eventos = avanzar(estado, [k], OBJ.ruleta + dt);
    expect(eventos[0]).toContain('listo');
    usarObjeto(estado, k, pista, 1);
    expect(k.objeto).toBeNull();
  });
});

describe('golpe', () => {
  it('trompo de 1 s a media velocidad, sin derrape ni turbo, y después 1,5 s de protección', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(300, 0, { vel: 20, turbo: 0.5, derrape: { dir: 1, carga: 1 }, chispas: 1 });
    const eventos = [];
    expect(golpear(k, eventos)).toBe(true);
    expect(eventos).toContain('golpe');
    expect(k).toMatchObject({ vel: 10, trompo: OBJ.trompo, turbo: 0, derrape: null, chispas: 0 });
    expect(golpear(k, [])).toBe(false);
    avanzar(estado, [k], OBJ.trompo + dt);
    expect(k.trompo).toBe(0);
    expect(k.proteccion).toBeGreaterThan(OBJ.proteccion - 0.05);
    expect(golpear(k, [])).toBe(false);
    avanzar(estado, [k], OBJ.proteccion + dt);
    expect(golpear(k, [])).toBe(true);
  });

  it('un kart golpeado mientras gira su ruleta conserva la ruleta y su objeto', () => {
    const k = kartEn(300, 0, { objeto: 'calabaza', ruleta: 0.5 });
    golpear(k, []);
    expect(k).toMatchObject({ objeto: 'calabaza', ruleta: 0.5 });
  });
});

describe('ají y bola disco', () => {
  it('el ají da un turbo de 1,5 s', () => {
    const k = kartEn(300, 0, { objeto: 'aji' });
    const eventos = usarObjeto(crearObjetos(pista), k, pista, 1);
    expect(eventos).toContain('turbo');
    expect(k.turbo).toBe(OBJ.aji);
    expect(k.objeto).toBeNull();
  });

  it('la bola disco dura 6 s, protege de golpes y hace girar a quien toca', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(300, 0, { objeto: 'disco' });
    expect(usarObjeto(estado, k, pista, 1)).toContain('disco');
    expect(golpear(k, [])).toBe(false);
    const otro = kartEn(300, 0);
    Object.assign(otro, { x: k.x + KART.radio * 2 - 0.1, y: k.y });
    const eventos = avanzar(estado, [k, otro], dt);
    expect(eventos[1]).toContain('golpe');
    expect(otro.trompo).toBeGreaterThan(0);
    avanzar(estado, [k], OBJ.disco + dt);
    expect(k.disco).toBe(0);
  });
});

describe('calabaza rodante', () => {
  it('rueda por la pista y golpea al primer kart de su línea, no al de otra línea ni a su dueño', () => {
    const estado = crearObjetos(pista);
    const lanzador = kartEn(100, 0, { objeto: 'calabaza' });
    const blanco = kartEn(125, 0);
    const lejos = kartEn(115, 5);
    expect(usarObjeto(estado, lanzador, pista, 1)).toContain('calabaza');
    expect(estado.calabazas).toHaveLength(1);
    expect(estado.calabazas[0].vel).toBeCloseTo(OBJ.calabazaVel * KART.velMax, 9);
    avanzar(estado, [lanzador, blanco, lejos], 1.5);
    expect(blanco.trompo).toBeGreaterThan(0);
    expect(lejos.trompo).toBe(0);
    expect(lanzador.trompo).toBe(0);
    expect(estado.calabazas).toHaveLength(0);
  });

  it('va más rápido con la velocidad 🚀', () => {
    const estado = crearObjetos(pista);
    usarObjeto(estado, kartEn(100, 0, { objeto: 'calabaza' }), pista, 1.5);
    expect(estado.calabazas[0].vel).toBeCloseTo(OBJ.calabazaVel * KART.velMax * 1.5, 9);
  });

  it('lanzada justo antes de la meta, la cruza y golpea al otro lado', () => {
    const estado = crearObjetos(pista);
    const lanzador = kartEn(pista.largo - 6, 0, { objeto: 'calabaza' });
    const blanco = kartEn(12, 0);
    usarObjeto(estado, lanzador, pista, 1);
    const eventos = avanzar(estado, [lanzador, blanco], 1.5);
    expect(eventos[1]).toContain('golpe');
  });

  it('si no toca a nadie desaparece a los 6 s; un kart en el aire no la toca', () => {
    const estado = crearObjetos(pista);
    usarObjeto(estado, kartEn(100, 0, { objeto: 'calabaza' }), pista, 1);
    const enAire = kartEn(110, 0, { enAire: true, h: 2 });
    avanzar(estado, [enAire], 1);
    expect(enAire.trompo).toBe(0);
    expect(estado.calabazas).toHaveLength(1);
    avanzar(estado, [], OBJ.calabazaVida);
    expect(estado.calabazas).toHaveLength(0);
  });
});

describe('cáscara de plátano', () => {
  it('queda detrás del kart y hace girar a quien la pisa', () => {
    const estado = crearObjetos(pista);
    const dueno = kartEn(200, 0, { objeto: 'cascara' });
    expect(usarObjeto(estado, dueno, pista, 1)).toContain('cascara');
    const c = estado.cascaras[0];
    expect(Math.hypot(c.x - dueno.x, c.y - dueno.y)).toBeCloseTo(OBJ.cascaraAtras, 0);
    const otro = kartEn(200, 0);
    Object.assign(otro, { x: c.x, y: c.y });
    avanzar(estado, [otro], dt);
    expect(otro.trompo).toBeGreaterThan(0);
    expect(estado.cascaras).toHaveLength(0);
  });

  it('su dueño la puede pisar recién pasado 1 s', () => {
    const estado = crearObjetos(pista);
    const dueno = kartEn(200, 0, { objeto: 'cascara' });
    usarObjeto(estado, dueno, pista, 1);
    Object.assign(dueno, { x: estado.cascaras[0].x, y: estado.cascaras[0].y });
    avanzar(estado, [dueno], 0.5);
    expect(dueno.trompo).toBe(0);
    avanzar(estado, [dueno], 0.6);
    expect(dueno.trompo).toBeGreaterThan(0);
  });

  it('no golpea a un kart en el aire, que la deja en su lugar', () => {
    const estado = crearObjetos(pista);
    usarObjeto(estado, kartEn(200, 0, { objeto: 'cascara' }), pista, 1);
    const enAire = kartEn(200, 0, { enAire: true, h: 2 });
    Object.assign(enAire, { x: estado.cascaras[0].x, y: estado.cascaras[0].y });
    avanzar(estado, [enAire], dt);
    expect(enAire.trompo).toBe(0);
    expect(estado.cascaras).toHaveLength(1);
  });

  it('hay como máximo 10: al dejar otra, desaparece la más antigua', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(200, 0);
    for (let i = 0; i < 12; i++) {
      k.objeto = 'cascara';
      usarObjeto(estado, k, pista, 1);
    }
    expect(estado.cascaras).toHaveLength(OBJ.maxCascaras);
  });
});
