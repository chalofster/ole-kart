import { describe, it, expect } from 'vitest';
import { crearMenu, pulsarMenu } from '../src/logica/menu.js';

describe('menú de inicio', () => {
  it('parte eligiendo jugadores en 👤 y con la última velocidad usada', () => {
    expect(crearMenu(2)).toEqual({ paso: 'jugadores', jugadores: 0, velocidad: 2, primera: undefined, listo: false });
    expect(crearMenu().velocidad).toBe(0);
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

  it('en la velocidad, la cruceta elige entre 🐢 🐇 🚀 y A termina', () => {
    const m = crearMenu();
    pulsarMenu(m, 'teclado', { confirma: true });
    pulsarMenu(m, 'teclado', { derecha: true });
    pulsarMenu(m, 'teclado', { derecha: true });
    pulsarMenu(m, 'teclado', { derecha: true });
    expect(m.velocidad).toBe(2);
    pulsarMenu(m, 'teclado', { confirma: true });
    expect(m.listo).toBe(true);
  });

  it('B en la velocidad vuelve a elegir jugadores; en jugadores no hace nada', () => {
    const m = crearMenu();
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m.paso).toBe('jugadores');
    pulsarMenu(m, 'mando-0', { confirma: true });
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m).toMatchObject({ paso: 'jugadores', listo: false });
  });

  it('con el mouse, tocar un ícono lo elige y avanza', () => {
    const m = crearMenu();
    pulsarMenu(m, null, { opcion: 1 });
    expect(m).toMatchObject({ paso: 'velocidad', jugadores: 1, primera: null });
    pulsarMenu(m, null, { opcion: 2 });
    expect(m).toMatchObject({ velocidad: 2, listo: true, primera: null });
  });

  it('si los jugadores se eligieron con el mouse, el control que confirma la velocidad es el jugador 1', () => {
    const m = crearMenu();
    pulsarMenu(m, null, { opcion: 0 });
    pulsarMenu(m, 'mando-2', { confirma: true });
    expect(m).toMatchObject({ listo: true, primera: 'mando-2' });
  });
});
