import { describe, it, expect } from 'vitest';
import { crearSalida, actualizarSalida, ESPERA_SALIDA } from '../src/logica/pausa.js';

const dt = 1 / 60;
// Repite el mismo estado de B durante los segundos indicados; devuelve si pidió volver al inicio.
function mantener(salida, pausa, sujeto, segundos) {
  let volver = false;
  for (let i = 0; i < Math.round(segundos / dt); i++) volver = actualizarSalida(salida, pausa, false, sujeto, dt) || volver;
  return volver;
}

describe('volver al inicio desde la pausa', () => {
  it('un B suelto durante la pausa no termina la carrera', () => {
    const s = crearSalida();
    expect(actualizarSalida(s, true, true, true, dt)).toBe(false);
    expect(mantener(s, true, false, 3)).toBe(false);
  });

  it('apretar B y mantenerlo 1,5 s vuelve al inicio', () => {
    const s = crearSalida();
    actualizarSalida(s, true, true, true, dt);
    expect(mantener(s, true, true, ESPERA_SALIDA - 0.1)).toBe(false);
    expect(mantener(s, true, true, 0.2)).toBe(true);
  });

  it('un B que ya estaba apretado al pausar (frenando) no cuenta', () => {
    const s = crearSalida();
    expect(mantener(s, true, true, 3)).toBe(false);
  });

  it('soltar B antes de tiempo reinicia la espera', () => {
    const s = crearSalida();
    actualizarSalida(s, true, true, true, dt);
    mantener(s, true, true, 1);
    mantener(s, true, false, 0.1);
    actualizarSalida(s, true, true, true, dt);
    expect(mantener(s, true, true, 1)).toBe(false);
  });

  it('fuera de la pausa, B es solo el freno', () => {
    const s = crearSalida();
    actualizarSalida(s, false, true, true, dt);
    expect(mantener(s, false, true, 3)).toBe(false);
  });
});
