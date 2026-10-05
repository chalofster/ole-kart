import { describe, it, expect } from 'vitest';
import { PERSONAJES } from '../src/logica/personajes.js';

const TIPOS = ['flamenca', 'persona', 'gato', 'pajaro', 'toro', 'calabaza', 'fantasma'];

describe('personajes', () => {
  it('son 8, con identificador e ícono únicos', () => {
    expect(PERSONAJES).toHaveLength(8);
    expect(new Set(PERSONAJES.map((p) => p.id)).size).toBe(8);
    expect(new Set(PERSONAJES.map((p) => p.icono)).size).toBe(8);
  });

  it('los dos primeros son la bailarina y el bailarín de la noche', () => {
    expect(PERSONAJES.slice(0, 2).map((p) => p.id)).toEqual(['bailarina', 'bailarin']);
  });

  it('cada uno tiene color de kart y un cuerpo que el dibujo sabe armar', () => {
    for (const p of PERSONAJES) {
      expect(Number.isInteger(p.kart)).toBe(true);
      expect(TIPOS).toContain(p.cuerpo.tipo);
    }
  });

  it('la bailarina lleva vestido rojo de lunares, mantón y peineta; el bailarín, chaqueta roja con franjas negras', () => {
    const [bailarina, bailarin] = PERSONAJES;
    expect(bailarina.cuerpo).toMatchObject({ tipo: 'flamenca', vestido: 0xd62828, lunares: 0xffffff, manton: 0xfff1d0, peineta: 0x8b4a2b });
    expect(bailarin.cuerpo.chaqueta).toEqual({ color: 0xc1121f, franjas: 0x111111 });
  });
});
