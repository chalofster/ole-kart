import { describe, it, expect } from 'vitest';
import { crearEleccion, pulsarEleccion, avanzarEleccion, RULETA } from '../src/logica/eleccion.js';

describe('elegir pista', () => {
  it('parte donde se indica y la cruceta recorre las pistas y 🎲 sin pasarse de los bordes', () => {
    const e = crearEleccion(3, { marco: 1 });
    pulsarEleccion(e, { izquierda: true });
    pulsarEleccion(e, { izquierda: true });
    expect(e.marco).toBe(0);
    for (let i = 0; i < 5; i++) pulsarEleccion(e, { derecha: true });
    expect(e.marco).toBe(3);
    expect(e.elegida).toBe(null);
  });

  it('A sobre una pista la elige', () => {
    const e = crearEleccion(3);
    pulsarEleccion(e, { derecha: true });
    pulsarEleccion(e, { confirma: true });
    expect(e.elegida).toBe(1);
  });

  it('con el mouse, tocar una tarjeta la elige; una tarjeta que no existe no hace nada', () => {
    const e = crearEleccion(3);
    pulsarEleccion(e, { opcion: 7 });
    pulsarEleccion(e, { opcion: -1 });
    expect(e).toMatchObject({ marco: 0, elegida: null, ruleta: 0 });
    pulsarEleccion(e, { opcion: 2 });
    expect(e).toMatchObject({ marco: 2, elegida: 2 });
  });

  it('una vez elegida, otras pulsaciones (por ejemplo, del otro control en el mismo cuadro) no cambian nada', () => {
    const e = crearEleccion(3);
    pulsarEleccion(e, { confirma: true });
    pulsarEleccion(e, { derecha: true, confirma: true });
    pulsarEleccion(e, { opcion: 2 });
    expect(e).toMatchObject({ marco: 0, elegida: 0 });
  });

  it('🎲: la ruleta recorre las tarjetas durante 1 s, ignora pulsaciones y se detiene en una pista distinta de la última', () => {
    const e = crearEleccion(3, { marco: 3, ultima: 1 });
    pulsarEleccion(e, { confirma: true }, () => 0.6);
    expect(e.ruleta).toBe(RULETA);
    const vistos = new Set();
    for (let i = 0; i < 50; i++) {
      avanzarEleccion(e, 1 / 60);
      vistos.add(e.marco);
      pulsarEleccion(e, { izquierda: true, confirma: true });
    }
    expect(e.elegida).toBe(null);
    expect(vistos.size).toBeGreaterThan(1);
    avanzarEleccion(e, RULETA);
    expect(e).toMatchObject({ elegida: 2, marco: 2, ruleta: 0 });
  });

  it('🎲 nunca repite la última pista; con una sola alternativa sale esa', () => {
    for (const azar of [0, 0.5, 0.999]) {
      const e = crearEleccion(2, { marco: 2, ultima: 0 });
      pulsarEleccion(e, { confirma: true }, () => azar);
      avanzarEleccion(e, RULETA);
      expect(e.elegida).toBe(1);
    }
  });

  it('🎲 sin pista anterior puede dar cualquiera; con una sola pista da esa', () => {
    const salen = new Set();
    for (const azar of [0, 0.4, 0.8]) {
      const e = crearEleccion(3, { marco: 3 });
      pulsarEleccion(e, { confirma: true }, () => azar);
      avanzarEleccion(e, RULETA);
      salen.add(e.elegida);
    }
    expect(salen).toEqual(new Set([0, 1, 2]));
    const sola = crearEleccion(1, { marco: 1, ultima: 0 });
    pulsarEleccion(sola, { confirma: true }, () => 0.5);
    avanzarEleccion(sola, RULETA);
    expect(sola.elegida).toBe(0);
  });
});
