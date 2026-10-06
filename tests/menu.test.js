import { describe, it, expect } from 'vitest';
import { crearMenu, pulsarMenu, avanzarMenu, cuadroMenu } from '../src/logica/menu.js';
import { RULETA, RESULTADO } from '../src/logica/eleccion.js';

// Lleva el menú hasta el paso de pista con A del control indicado.
function hastaPista(m, id = 'mando-0') {
  pulsarMenu(m, id, { confirma: true });
  pulsarMenu(m, id, { confirma: true });
  return m;
}

describe('menú de inicio', () => {
  it('parte eligiendo jugadores en 👤, con la última velocidad usada y el marco de pista en la última corrida', () => {
    const m = crearMenu(2, { pistas: 3, pista: 1, ultima: 1 });
    expect(m).toMatchObject({ paso: 'jugadores', jugadores: 0, velocidad: 2, primera: undefined, listo: false });
    expect(m.eleccion).toMatchObject({ cantidad: 3, marco: 1, ultima: 1 });
    expect(crearMenu().velocidad).toBe(0);
    expect(crearMenu().eleccion).toMatchObject({ cantidad: 1, marco: 0, ultima: null });
  });

  it('la cruceta elige entre 👤 y 👥 sin pasarse de los bordes', () => {
    const m = crearMenu();
    pulsarMenu(m, 'mando-0', { derecha: true });
    pulsarMenu(m, 'mando-0', { derecha: true });
    expect(m.jugadores).toBe(1);
    pulsarMenu(m, 'mando-0', { izquierda: true });
    pulsarMenu(m, 'mando-0', { izquierda: true });
    expect(m.jugadores).toBe(0);
  });

  it('A pasa a elegir la velocidad y recuerda qué control eligió', () => {
    const m = crearMenu();
    pulsarMenu(m, 'mando-1', { derecha: true });
    pulsarMenu(m, 'mando-1', { confirma: true });
    expect(m).toMatchObject({ paso: 'velocidad', jugadores: 1, primera: 'mando-1', listo: false });
  });

  it('en la velocidad, la cruceta elige entre 🐢 🐇 🚀 y A pasa a elegir la pista', () => {
    const m = crearMenu();
    pulsarMenu(m, 'teclado', { confirma: true });
    pulsarMenu(m, 'teclado', { derecha: true });
    pulsarMenu(m, 'teclado', { derecha: true });
    pulsarMenu(m, 'teclado', { derecha: true });
    expect(m.velocidad).toBe(2);
    pulsarMenu(m, 'teclado', { confirma: true });
    expect(m).toMatchObject({ paso: 'pista', listo: false });
  });

  it('B en la velocidad vuelve a elegir jugadores; en jugadores no hace nada', () => {
    const m = crearMenu();
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m.paso).toBe('jugadores');
    pulsarMenu(m, 'mando-0', { confirma: true });
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m).toMatchObject({ paso: 'jugadores', listo: false });
  });

  it('en la pista, la cruceta mueve el marco, A elige y el menú queda listo', () => {
    const m = hastaPista(crearMenu(0, { pistas: 3 }));
    pulsarMenu(m, 'mando-0', { derecha: true });
    pulsarMenu(m, 'mando-0', { confirma: true });
    expect(m.listo).toBe(true);
    expect(m.eleccion.elegida).toBe(1);
  });

  it('B en la pista vuelve a la velocidad', () => {
    const m = hastaPista(crearMenu(0, { pistas: 3 }));
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m).toMatchObject({ paso: 'velocidad', listo: false });
  });

  it('🎲: durante la ruleta nada responde y al terminar queda lista una pista distinta de la última', () => {
    const m = hastaPista(crearMenu(0, { pistas: 3, pista: 0, ultima: 0 }));
    pulsarMenu(m, 'mando-0', { opcion: 3 }, () => 0.99);
    expect(m.listo).toBe(false);
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m.paso).toBe('pista');
    avanzarMenu(m, RULETA / 2);
    expect(m.listo).toBe(false);
    avanzarMenu(m, RULETA);
    // La pista que salió se ve un momento antes de seguir.
    expect(m.listo).toBe(false);
    expect(m.eleccion.marco).toBe(2);
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m.paso).toBe('pista');
    avanzarMenu(m, RESULTADO);
    expect(m.listo).toBe(true);
    expect(m.eleccion.elegida).toBe(2);
  });

  it('con el mouse, tocar un ícono lo elige y avanza', () => {
    const m = crearMenu(0, { pistas: 3 });
    pulsarMenu(m, null, { opcion: 1 });
    expect(m).toMatchObject({ paso: 'velocidad', jugadores: 1, primera: null });
    pulsarMenu(m, null, { opcion: 2 });
    expect(m).toMatchObject({ paso: 'pista', velocidad: 2, primera: null });
    pulsarMenu(m, null, { opcion: 2 });
    expect(m).toMatchObject({ listo: true, primera: null });
    expect(m.eleccion.elegida).toBe(2);
  });

  it('si los jugadores se eligieron con el mouse, el control que confirma la velocidad es el jugador 1', () => {
    const m = crearMenu();
    pulsarMenu(m, null, { opcion: 0 });
    pulsarMenu(m, 'mando-2', { confirma: true });
    expect(m).toMatchObject({ paso: 'pista', primera: 'mando-2' });
  });

  it('si jugadores y velocidad se eligieron con el mouse, el control que elige la pista es el jugador 1', () => {
    const m = crearMenu(0, { pistas: 3 });
    pulsarMenu(m, null, { opcion: 0 });
    pulsarMenu(m, null, { opcion: 0 });
    pulsarMenu(m, 'mando-1', { derecha: true });
    expect(m.primera).toBe(null);
    pulsarMenu(m, 'mando-1', { confirma: true });
    expect(m).toMatchObject({ listo: true, primera: 'mando-1' });
  });

  it('dos A en el mismo cuadro en la velocidad llevan al paso de pista sin elegir: los niños ven las tarjetas', () => {
    const m = crearMenu(0, { pistas: 3 });
    pulsarMenu(m, 'mando-0', { confirma: true });
    cuadroMenu(m, [{ id: 'mando-0', recien: { confirma: true } }, { id: 'mando-1', recien: { confirma: true } }]);
    expect(m).toMatchObject({ paso: 'pista', listo: false });
    expect(m.eleccion.elegida).toBe(null);
  });

  it('en un cuadro, cuentan las pulsaciones de todos los controles hasta que una cambia de paso', () => {
    const m = crearMenu(0, { pistas: 3 });
    cuadroMenu(m, [{ id: 'mando-0', recien: { derecha: true } }, { id: 'mando-1', recien: { confirma: true } }]);
    expect(m).toMatchObject({ paso: 'velocidad', jugadores: 1, primera: 'mando-1' });
  });
});
