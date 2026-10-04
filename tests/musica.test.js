import { describe, it, expect } from 'vitest';
import { notasDelPaso, PASOS, SEMICORCHEA, ACORDES } from '../src/sonido/musica.js';

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const clase = (frec) => ((Math.round(12 * Math.log2(frec / 440)) + 69) % 12 + 12) % 12;
const tipos = (paso) => notasDelPaso(paso).map((n) => n.tipo);
const RE_MENOR = [2, 4, 5, 7, 9, 10, 0]; // re mi fa sol la si♭ do

describe('música de las carreras', () => {
  it('es un bucle de 4 compases de 16 semicorcheas, a 116 pulsos por minuto', () => {
    expect(PASOS).toBe(64);
    expect(SEMICORCHEA).toBeCloseTo(60 / 116 / 4, 9);
    for (let p = 0; p < PASOS; p++) expect(notasDelPaso(p + PASOS)).toEqual(notasDelPaso(p));
  });

  it('bombo en cada tiempo, palmas en el 2 y el 4, platillo a contratiempo', () => {
    for (let p = 0; p < PASOS; p++) {
      expect(tipos(p).includes('bombo')).toBe(p % 4 === 0);
      expect(tipos(p).includes('palmas')).toBe(p % 16 === 4 || p % 16 === 12);
      expect(tipos(p).includes('platillo')).toBe(p % 4 === 2);
    }
  });

  it('cada compás empieza con el bajo en la nota base de su acorde: re, si♭, do, la', () => {
    expect([0, 16, 32, 48].map((p) => clase(notasDelPaso(p).find((n) => n.tipo === 'bajo').frec))).toEqual([2, 10, 0, 9]);
  });

  it('el bajo y los acordes usan solo notas de su acorde', () => {
    for (let p = 0; p < PASOS; p++) {
      const acorde = ACORDES[Math.floor(p / 16)].map((m) => clase(hz(m)));
      for (const n of notasDelPaso(p)) {
        if (n.tipo === 'bajo') expect(acorde).toContain(clase(n.frec));
        if (n.tipo === 'acorde') n.frecs.forEach((f) => expect(acorde).toContain(clase(f)));
      }
    }
  });

  it('la melodía usa la escala de re menor y suena en todos los compases', () => {
    const porCompas = [0, 0, 0, 0];
    for (let p = 0; p < PASOS; p++) {
      for (const n of notasDelPaso(p)) {
        if (n.tipo !== 'melodia') continue;
        expect(RE_MENOR).toContain(clase(n.frec));
        porCompas[Math.floor(p / 16)] += 1;
      }
    }
    porCompas.forEach((cantidad) => expect(cantidad).toBeGreaterThanOrEqual(4));
  });
});
