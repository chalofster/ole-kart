import { describe, it, expect } from 'vitest';
import { leerMando, leerTeclado, detectorDeFlancos, crearEntradas } from '../src/entrada/mandos.js';

const botones = (pulsados = {}) =>
  Array.from({ length: 17 }, (_, i) => ({ pressed: (pulsados[i] ?? 0) >= 1, value: pulsados[i] ?? 0 }));

describe('leerMando', () => {
  it('la palanca a la izquierda gira a la izquierda (giro positivo)', () => {
    expect(leerMando(botones(), [-1, 0]).giro).toBe(1);
    expect(leerMando(botones(), [0.8, 0]).giro).toBe(-0.8);
  });

  it('ignora los movimientos pequeños de la palanca', () => {
    expect(leerMando(botones(), [0.15, 0]).giro).toBe(0);
  });

  it('la cruceta también gira y mueve en los menús', () => {
    expect(leerMando(botones({ 14: 1 }), [0, 0])).toMatchObject({ giro: 1, izquierda: true });
    expect(leerMando(botones({ 15: 1 }), [0, 0])).toMatchObject({ giro: -1, derecha: true });
    expect(leerMando(botones({ 12: 1 }), [0, 0]).arriba).toBe(true);
    expect(leerMando(botones(), [0, 0.9]).abajo).toBe(true);
  });

  it('A acelera y confirma, B frena y vuelve, Start pausa, Y cambia la ayuda', () => {
    expect(leerMando(botones({ 0: 1 }), [0, 0])).toMatchObject({ acelera: true, confirma: true });
    expect(leerMando(botones({ 1: 1 }), [0, 0])).toMatchObject({ frena: true, vuelve: true });
    expect(leerMando(botones({ 9: 1 }), [0, 0]).pausa).toBe(true);
    expect(leerMando(botones({ 3: 1 }), [0, 0]).ayuda).toBe(true);
  });

  it('el gatillo derecho, aunque esté a medio apretar, derrapa', () => {
    expect(leerMando(botones({ 7: 0.5 }), [0, 0]).derrapa).toBe(true);
    expect(leerMando(botones({ 5: 1 }), [0, 0]).derrapa).toBe(true);
  });
});

describe('leerTeclado', () => {
  it('usa flechas, barra espaciadora, Enter, Esc, Retroceso e Y', () => {
    const t = leerTeclado(new Set(['ArrowLeft', 'ArrowUp', 'Space']));
    expect(t).toMatchObject({ giro: 1, acelera: true, derrapa: true, izquierda: true, arriba: true });
    expect(leerTeclado(new Set(['ArrowRight'])).giro).toBe(-1);
    expect(leerTeclado(new Set(['Enter'])).confirma).toBe(true);
    expect(leerTeclado(new Set(['Escape'])).pausa).toBe(true);
    expect(leerTeclado(new Set(['Backspace'])).vuelve).toBe(true);
    expect(leerTeclado(new Set(['KeyY'])).ayuda).toBe(true);
  });
});

describe('detectorDeFlancos', () => {
  it('avisa solo en el momento en que se aprieta un botón', () => {
    const detectar = detectorDeFlancos();
    expect(detectar({ confirma: true, giro: 1 }).confirma).toBe(true);
    expect(detectar({ confirma: true, giro: 1 }).confirma).toBe(false);
    expect(detectar({ confirma: false }).confirma).toBe(false);
    expect(detectar({ confirma: true }).confirma).toBe(true);
  });
});

describe('crearEntradas', () => {
  it('lee el teclado y los controles conectados, con sus flancos', () => {
    const oyentes = {};
    const mandos = [
      { index: 0, connected: true, buttons: botones({ 0: 1 }), axes: [0, 0] },
      null,
      { index: 2, connected: false, buttons: botones(), axes: [0, 0] },
    ];
    const ventana = {
      addEventListener: (tipo, f) => { oyentes[tipo] = f; },
      navigator: { getGamepads: () => mandos },
    };
    const entradas = crearEntradas(ventana);
    oyentes.keydown({ code: 'ArrowUp', preventDefault() {} });
    const fuentes = entradas.leer();
    expect(fuentes.map((f) => f.id)).toEqual(['teclado', 'mando-0']);
    expect(fuentes[0].acelera).toBe(true);
    expect(fuentes[0].recien.acelera).toBe(true);
    expect(fuentes[1].confirma).toBe(true);
    expect(entradas.leer()[0].recien.acelera).toBe(false);
    oyentes.keyup({ code: 'ArrowUp' });
    expect(entradas.leer()[0].acelera).toBe(false);
    oyentes.keydown({ code: 'ArrowUp', preventDefault() {} });
    oyentes.blur();
    expect(entradas.leer()[0].acelera).toBe(false);
  });
});
