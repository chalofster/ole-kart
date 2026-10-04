import { describe, it, expect } from 'vitest';
import { crearSeleccion, procesarSeleccion, todosListos } from '../src/logica/seleccion.js';

const NADA = { confirma: false, vuelve: false, izquierda: false, derecha: false, arriba: false, abajo: false, ayuda: false };
const pulsa = (id, cambios) => ({ id, recien: { ...NADA, ...cambios } });

describe('selección de personaje', () => {
  it('el control que eligió en el inicio ya es el jugador 1, sobre la bailarina', () => {
    const s = crearSeleccion(1, 'mando-0');
    expect(s.jugadores).toEqual([{ fuente: 'mando-0', cursor: 0, listo: false, ayuda: false }]);
  });

  it('si se eligió con el mouse, el primer control que pulsa A es el jugador 1', () => {
    const s = crearSeleccion(1, null);
    procesarSeleccion(s, pulsa('mando-3', { confirma: true }));
    expect(s.jugadores[0].fuente).toBe('mando-3');
    expect(s.jugadores[0].listo).toBe(false);
  });

  it('en 2 jugadores, otro control que pulsa A se une como jugador 2, sobre el bailarín', () => {
    const s = crearSeleccion(2, 'mando-0');
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    expect(s.jugadores[1]).toMatchObject({ fuente: 'mando-1', cursor: 1, listo: false });
  });

  it('un mismo control no se une dos veces', () => {
    const s = crearSeleccion(2, 'mando-0');
    procesarSeleccion(s, pulsa('mando-0', { confirma: true }));
    expect(s.jugadores[0].listo).toBe(true);
    expect(s.jugadores[1].fuente).toBeNull();
  });

  it('mueve el cursor y da la vuelta en los bordes', () => {
    const s = crearSeleccion(1, 'teclado');
    procesarSeleccion(s, pulsa('teclado', { izquierda: true }));
    expect(s.jugadores[0].cursor).toBe(7);
    procesarSeleccion(s, pulsa('teclado', { arriba: true }));
    expect(s.jugadores[0].cursor).toBe(3);
    procesarSeleccion(s, pulsa('teclado', { derecha: true }));
    expect(s.jugadores[0].cursor).toBe(4);
  });

  it('Y activa y desactiva el modo ayuda', () => {
    const s = crearSeleccion(1, 'mando-0');
    procesarSeleccion(s, pulsa('mando-0', { ayuda: true }));
    expect(s.jugadores[0].ayuda).toBe(true);
    procesarSeleccion(s, pulsa('mando-0', { ayuda: true }));
    expect(s.jugadores[0].ayuda).toBe(false);
  });

  it('no se puede confirmar un personaje que otro ya eligió', () => {
    const s = crearSeleccion(2, 'mando-0');
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    procesarSeleccion(s, pulsa('mando-0', { confirma: true }));
    procesarSeleccion(s, pulsa('mando-1', { izquierda: true }));
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    expect(s.jugadores[1].cursor).toBe(0);
    expect(s.jugadores[1].listo).toBe(false);
  });

  it('B quita la confirmación y, sin confirmación, pide volver al inicio', () => {
    const s = crearSeleccion(1, 'mando-0');
    procesarSeleccion(s, pulsa('mando-0', { confirma: true }));
    procesarSeleccion(s, pulsa('mando-0', { vuelve: true }));
    expect(s.jugadores[0].listo).toBe(false);
    expect(s.volver).toBe(false);
    procesarSeleccion(s, pulsa('mando-0', { vuelve: true }));
    expect(s.volver).toBe(true);
  });

  it('todosListos solo cuando todos confirmaron', () => {
    const s = crearSeleccion(2, 'mando-0');
    procesarSeleccion(s, pulsa('mando-0', { confirma: true }));
    expect(todosListos(s)).toBe(false);
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    expect(todosListos(s)).toBe(true);
  });
});
