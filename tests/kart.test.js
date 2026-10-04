import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE, MEDIO_ANCHO, VALLA, RAMPA, diferenciaAngular } from '../src/logica/pista.js';
import { crearKart, pasoKart, actualizarDerrape, KART, DERRAPE } from '../src/logica/kart.js';

const pista = crearPista(NOCHE);
const dt = 1 / 60;
const NADA = { giro: 0, acelera: false, frena: false, derrapa: false };
const ACELERA = { ...NADA, acelera: true };

function avanzar(k, intencion, segundos, factor = 1) {
  const eventos = [];
  for (let i = 0; i < Math.round(segundos / dt); i++) eventos.push(...pasoKart(k, intencion, pista, dt, factor));
  return eventos;
}

describe('crearKart', () => {
  it('parte quieto, en el suelo y mirando en el sentido de la pista', () => {
    const k = crearKart(pista, 10, 2);
    expect(k.vel).toBe(0);
    expect(k.h).toBe(0);
    expect(k.enAire).toBe(false);
    expect(k.s).toBeCloseTo(10, 0);
    expect(k.lateral).toBeCloseTo(2, 1);
    expect(Math.abs(k.rumbo)).toBeLessThan(0.05);
  });
});

describe('velocidad', () => {
  it('acelera hasta la velocidad máxima y avanza por la pista', () => {
    const k = crearKart(pista, 10);
    avanzar(k, ACELERA, 1);
    expect(k.vel).toBeCloseTo(KART.aceleracion, 0);
    avanzar(k, ACELERA, 1.5);
    expect(k.vel).toBe(KART.velMax);
    expect(k.s).toBeGreaterThan(40);
  });

  it('sin acelerar se detiene solo', () => {
    const k = crearKart(pista, 10);
    k.vel = 16;
    avanzar(k, NADA, 2.1);
    expect(k.vel).toBe(0);
  });

  it('B frena y luego retrocede despacio', () => {
    const k = crearKart(pista, 30);
    k.vel = 10;
    avanzar(k, { ...NADA, frena: true }, 1);
    expect(k.vel).toBe(-KART.retroMax);
  });

  it('quieto no gira aunque se mueva la palanca', () => {
    const k = crearKart(pista, 10);
    const rumbo = k.rumbo;
    avanzar(k, { ...NADA, giro: 1 }, 1);
    expect(k.rumbo).toBe(rumbo);
  });

  it('fuera del camino la velocidad máxima baja a 55 %', () => {
    const k = crearKart(pista, 10, 8.5);
    avanzar(k, ACELERA, 2);
    expect(Math.abs(k.lateral)).toBeGreaterThan(MEDIO_ANCHO);
    expect(k.vel).toBeCloseTo(KART.velMax * KART.fueraDePista, 5);
  });

  it('un factor mayor sube la velocidad máxima', () => {
    const k = crearKart(pista, 10);
    avanzar(k, ACELERA, 2.5, 1.1);
    expect(k.vel).toBeCloseTo(KART.velMax * 1.1, 5);
  });
});

describe('vallas', () => {
  it('al chocar rebota hacia la pista, pierde velocidad y avisa', () => {
    const k = crearKart(pista, 20, 4);
    k.vel = 20;
    k.rumbo += 0.6;
    let antes = 0;
    let eventos = [];
    for (let i = 0; i < 120 && !eventos.includes('choque'); i++) {
      antes = k.vel;
      eventos = pasoKart(k, NADA, pista, dt);
    }
    expect(eventos).toContain('choque');
    expect(k.vel).toBeLessThan(antes * 0.61);
    expect(k.lateral).toBeCloseTo(VALLA - KART.radio, 6);
    expect(diferenciaAngular(pista.muestras[k.indice].rumbo, k.rumbo)).toBeLessThan(0);
  });

  it('ni con turbo y girando contra ella atraviesa una valla', () => {
    const k = crearKart(pista, 20);
    k.vel = 32;
    k.turbo = 5;
    k.rumbo += 1.2;
    for (let i = 0; i < 180; i++) {
      pasoKart(k, { ...ACELERA, giro: 1 }, pista, dt);
      expect(Math.abs(k.lateral)).toBeLessThanOrEqual(VALLA - KART.radio + 1e-9);
    }
  });
});

describe('derrape', () => {
  const kart = (vel = 20) => ({ vel, enAire: false, derrape: null, chispas: 0, turbo: 0 });
  const derrapando = { giro: 1, acelera: true, frena: false, derrapa: true };
  const soltar = { ...derrapando, derrapa: false };
  const cargar = (k, segundos) => {
    for (let i = 0; i < Math.round(segundos / dt); i++) actualizarDerrape(k, derrapando, dt);
  };

  it('no empieza sin girar, sin velocidad o en el aire', () => {
    const a = kart();
    actualizarDerrape(a, { ...derrapando, giro: 0.2 }, dt);
    expect(a.derrape).toBeNull();
    const b = kart(5);
    actualizarDerrape(b, derrapando, dt);
    expect(b.derrape).toBeNull();
    const c = kart();
    c.enAire = true;
    actualizarDerrape(c, derrapando, dt);
    expect(c.derrape).toBeNull();
  });

  it('con 2 s de carga da chispas naranjas y, al soltar, un turbo largo', () => {
    const k = kart();
    cargar(k, 2.05);
    expect(k.chispas).toBe(2);
    const eventos = actualizarDerrape(k, soltar, dt);
    expect(eventos).toContain('turbo');
    expect(k.turbo).toBe(DERRAPE.turboNaranja);
    expect(k.derrape).toBeNull();
  });

  it('con 1 s de carga da chispas azules y un turbo corto', () => {
    const k = kart();
    cargar(k, 1.2);
    expect(k.chispas).toBe(1);
    actualizarDerrape(k, soltar, dt);
    expect(k.turbo).toBe(DERRAPE.turboAzul);
  });

  it('soltar antes de 1 s no da turbo', () => {
    const k = kart();
    cargar(k, 0.5);
    actualizarDerrape(k, soltar, dt);
    expect(k.turbo).toBe(0);
  });

  it('si el kart se frena, el derrape se pierde sin turbo', () => {
    const k = kart();
    cargar(k, 1.5);
    k.vel = 5;
    actualizarDerrape(k, derrapando, dt);
    expect(k.derrape).toBeNull();
    expect(k.turbo).toBe(0);
  });

  it('derrapando gira más que sin derrapar', () => {
    const a = crearKart(pista, 20);
    const b = crearKart(pista, 20);
    a.vel = 20;
    b.vel = 20;
    pasoKart(a, { ...ACELERA, giro: 1 }, pista, dt);
    pasoKart(b, { ...ACELERA, giro: 1, derrapa: true }, pista, dt);
    expect(b.rumbo).toBeGreaterThan(a.rumbo);
  });
});

describe('turbos', () => {
  it('durante un turbo la velocidad pasa la máxima', () => {
    const k = crearKart(pista, 10);
    k.vel = KART.velMax;
    k.turbo = 1;
    avanzar(k, ACELERA, 0.5);
    expect(k.vel).toBeGreaterThan(KART.velMax * 1.3);
  });

  it('las flechas del piso dan turbo y avisan', () => {
    const k = crearKart(pista, pista.turbos[0] - 6);
    k.vel = 20;
    const eventos = avanzar(k, ACELERA, 0.5);
    expect(eventos).toContain('turbo');
    expect(k.vel).toBeGreaterThan(KART.velMax);
  });

  it('al terminar el turbo vuelve de a poco a la velocidad normal', () => {
    const k = crearKart(pista, 10);
    k.vel = 32;
    pasoKart(k, ACELERA, pista, dt);
    expect(k.vel).toBeGreaterThan(KART.velMax);
    avanzar(k, ACELERA, 1);
    expect(k.vel).toBe(KART.velMax);
  });
});

describe('rampa', () => {
  it('lanza el kart en un salto corto y lo deja otra vez sobre la pista', () => {
    const k = crearKart(pista, pista.rampa - 20);
    k.vel = KART.velMax;
    let alturaMaxima = 0;
    const eventos = [];
    for (let i = 0; i < 120; i++) {
      eventos.push(...pasoKart(k, ACELERA, pista, dt));
      alturaMaxima = Math.max(alturaMaxima, k.h);
    }
    expect(eventos).toContain('salto');
    expect(eventos).toContain('aterriza');
    expect(alturaMaxima).toBeGreaterThan(RAMPA.alto);
    expect(k.enAire).toBe(false);
    expect(k.h).toBe(0);
    expect(Math.abs(k.lateral)).toBeLessThan(MEDIO_ANCHO);
  });
});
