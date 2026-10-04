import { describe, it, expect } from 'vitest';
import { crearSonido, frecuenciaMotor } from '../src/sonido/sonido.js';

describe('sonido', () => {
  it('el motor suena más agudo con más velocidad, también en reversa', () => {
    expect(frecuenciaMotor(0)).toBe(55);
    expect(frecuenciaMotor(24)).toBe(175);
    expect(frecuenciaMotor(-6)).toBe(frecuenciaMotor(6));
  });

  it('sin Web Audio, todo funciona en silencio y sin errores', () => {
    const s = crearSonido(null);
    expect(() => {
      s.reanudar();
      s.motores([10, null]);
      s.efecto('turbo');
      s.efecto('desconocido');
      s.musica(true);
      s.musica(false);
      s.ponerCancion(null);
    }).not.toThrow();
    expect(s.activo()).toBe(true);
    expect(s.hayCancion()).toBe(false);
    expect(s.cancionSonando()).toBe(false);
  });
});
