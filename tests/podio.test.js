import { describe, it, expect } from 'vitest';
import { crearOpcionesPodio, pulsarPodio, avanzarPodio, BOTONES } from '../src/logica/podio.js';
import { RULETA } from '../src/logica/eleccion.js';

describe('botones del podio', () => {
  it('el marco parte en 🔁: A repite la carrera en la misma pista', () => {
    const o = crearOpcionesPodio(3, 2);
    expect(BOTONES[o.marco]).toBe('otra');
    expect(pulsarPodio(o, { confirma: true })).toEqual({ ir: 'carrera', pista: 2 });
  });

  it('B lleva al inicio', () => {
    expect(pulsarPodio(crearOpcionesPodio(3, 0), { vuelve: true })).toEqual({ ir: 'inicio' });
  });

  it('🗺️ abre las pistas con el marco en la actual; elegir otra lleva a la carrera en esa pista', () => {
    const o = crearOpcionesPodio(3, 0);
    expect(pulsarPodio(o, { derecha: true })).toBe(null);
    expect(pulsarPodio(o, { confirma: true })).toBe(null);
    expect(o.eleccion).toMatchObject({ marco: 0, ultima: 0 });
    pulsarPodio(o, { derecha: true });
    expect(pulsarPodio(o, { confirma: true })).toEqual({ ir: 'carrera', pista: 1 });
  });

  it('B en las pistas vuelve a los botones, con el marco en 🗺️; otra B lleva al inicio', () => {
    const o = crearOpcionesPodio(3, 0);
    pulsarPodio(o, { derecha: true });
    pulsarPodio(o, { confirma: true });
    expect(pulsarPodio(o, { vuelve: true })).toBe(null);
    expect(o).toMatchObject({ eleccion: null, marco: 1 });
    expect(pulsarPodio(o, { vuelve: true })).toEqual({ ir: 'inicio' });
  });

  it('🎲 en las pistas: la ruleta gira 1 s, sin hacer caso a B, y lleva a una pista distinta de la actual', () => {
    const o = crearOpcionesPodio(3, 1);
    pulsarPodio(o, { opcion: 1 });
    expect(pulsarPodio(o, { opcion: 3 }, () => 0)).toBe(null);
    expect(avanzarPodio(o, RULETA / 2)).toBe(null);
    expect(pulsarPodio(o, { vuelve: true })).toBe(null);
    expect(o.eleccion).not.toBe(null);
    expect(avanzarPodio(o, RULETA)).toEqual({ ir: 'carrera', pista: 0 });
  });

  it('con el mouse, tocar 🔁 o 🏠 actúa de inmediato', () => {
    expect(pulsarPodio(crearOpcionesPodio(3, 2), { opcion: 0 })).toEqual({ ir: 'carrera', pista: 2 });
    expect(pulsarPodio(crearOpcionesPodio(3, 2), { opcion: 2 })).toEqual({ ir: 'inicio' });
  });

  it('una opción que no existe no hace nada', () => {
    const o = crearOpcionesPodio(3, 0);
    expect(pulsarPodio(o, { opcion: 5 })).toBe(null);
    expect(o).toMatchObject({ marco: 0, eleccion: null });
  });

  it('sin ruleta girando, avanzar no hace nada', () => {
    const o = crearOpcionesPodio(3, 0);
    expect(avanzarPodio(o, 1)).toBe(null);
  });
});
