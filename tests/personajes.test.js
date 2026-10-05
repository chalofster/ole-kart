import { describe, it, expect } from 'vitest';
import { PERSONAJES } from '../src/logica/personajes.js';

const TIPOS = ['flamenca', 'bailarin', 'pianista', 'gato', 'pajaro', 'toro', 'calabaza', 'fantasma'];

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
    expect(bailarin.cuerpo).toMatchObject({ tipo: 'bailarin', chaqueta: 0xc1121f, franjas: 0x111111 });
  });

  it('los animales traen sus detalles: cascabel del gato, pico del pájaro, cuernos y pañuelo del torito', () => {
    const porId = Object.fromEntries(PERSONAJES.map((p) => [p.id, p.cuerpo]));
    expect(porId.zarpita).toMatchObject({ tipo: 'gato', color: 0xf4a261, cascabel: 0xffd166 });
    expect(porId.trino).toMatchObject({ tipo: 'pajaro', color: 0x2a9d8f, pico: 0xffb703 });
    expect(porId.torito).toMatchObject({ tipo: 'toro', color: 0x8b5a2b, cuernos: 0xf8f9fa, panuelo: 0xd62828 });
  });
});
