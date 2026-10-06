import { describe, it, expect } from 'vitest';
import { notasDelPaso, pasosDe, semicorchea } from '../src/sonido/musica.js';
import { PARTITURAS } from '../src/sonido/partituras.js';
import notasDeNoche from './fixtures/musica-noche.json';

const clase = (frec) => ((Math.round(12 * Math.log2(frec / 440)) + 69) % 12 + 12) % 12;
const claseMidi = (midi) => ((midi % 12) + 12) % 12;
const BATERIA = ['bombo', 'palmas', 'platillo', 'redoble'];
const ONDAS = ['sine', 'square', 'sawtooth', 'triangle'];

describe('música de Noche', () => {
  it('suena exactamente igual que antes de tener una música por pista', () => {
    const noche = PARTITURAS.noche;
    expect(pasosDe(noche)).toBe(notasDeNoche.length);
    notasDeNoche.forEach((notas, p) => expect(notasDelPaso(noche, p)).toEqual(notas));
    expect(semicorchea(noche)).toBeCloseTo(60 / 116 / 4, 9);
  });
});

describe.each(Object.entries(PARTITURAS))('partitura de %s', (id, partitura) => {
  const total = pasosDe(partitura);
  const todas = () => Array.from({ length: total }, (_, p) => ({ p, notas: notasDelPaso(partitura, p) }));

  it('es un bucle exacto de compases de 16 semicorcheas, a un tempo bailable', () => {
    expect(total).toBe(partitura.compases * 16);
    expect(partitura.compases).toBe(id === 'noche' ? 4 : 8);
    expect(partitura.tempo).toBeGreaterThanOrEqual(100);
    expect(partitura.tempo).toBeLessThanOrEqual(170);
    for (let p = 0; p < total; p++) expect(notasDelPaso(partitura, p + total)).toEqual(notasDelPaso(partitura, p));
  });

  it('el bajo y los acordes usan solo notas del acorde de su compás', () => {
    for (const { p, notas } of todas()) {
      const acorde = partitura.acordes[Math.floor(p / 16)].map(claseMidi);
      for (const n of notas) {
        if (n.tipo === 'bajo') expect(acorde).toContain(clase(n.frec));
        if (n.tipo === 'acorde') n.frecs.forEach((f) => expect(acorde).toContain(clase(f)));
      }
    }
  });

  it('la melodía usa su escala y suena al menos 4 veces en cada compás', () => {
    const porCompas = Array(partitura.compases).fill(0);
    for (const { p, notas } of todas()) {
      for (const n of notas) {
        if (n.tipo !== 'melodia') continue;
        expect(partitura.escala).toContain(clase(n.frec));
        porCompas[Math.floor(p / 16)] += 1;
      }
    }
    porCompas.forEach((cantidad) => expect(cantidad).toBeGreaterThanOrEqual(4));
  });

  it('cada nota tiene un instrumento conocido con su sonido y un volumen moderado', () => {
    for (const { notas } of todas()) {
      for (const n of notas) {
        if (BATERIA.includes(n.tipo)) continue;
        const s = partitura.sonidos[n.tipo];
        expect(ONDAS).toContain(s.onda);
        expect(s.dur).toBeGreaterThan(0);
        expect(s.vol).toBeGreaterThan(0);
        expect(s.vol).toBeLessThanOrEqual(0.25);
      }
    }
  });
});
