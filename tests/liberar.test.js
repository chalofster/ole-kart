import { describe, it, expect } from 'vitest';
import { crearKart3D, GEOMETRIAS_KART } from '../src/dibujo/kart3d.js';
import { crearMundo } from '../src/dibujo/escena.js';
import { crearVitrina } from '../src/dibujo/vitrina.js';
import { crearPodio3D } from '../src/dibujo/podio3d.js';
import { crearPista, NOCHE } from '../src/logica/pista.js';
import { PERSONAJES } from '../src/logica/personajes.js';
import { GEOMETRIAS_OBJETOS } from '../src/dibujo/objetos3d.js';
import { crearMundos } from '../src/dibujo/mundos.js';
import { AMBIENTES } from '../src/dibujo/ambientes/index.js';
import { PISTAS } from '../src/logica/pistas.js';
import { crearObjetos } from '../src/logica/objetos.js';

const COMPARTIDAS = new Set([...GEOMETRIAS_KART, ...GEOMETRIAS_OBJETOS]);

// Figuras de las mallas de un objeto, separadas en propias y compartidas, y las que se liberan después.
function vigilar(objeto) {
  const propias = new Set();
  const compartidas = new Set();
  objeto.traverse((o) => {
    if (o.isMesh || o.isPoints) (COMPARTIDAS.has(o.geometry) ? compartidas : propias).add(o.geometry);
  });
  const liberadas = new Set();
  for (const g of [...propias, ...compartidas]) g.addEventListener('dispose', () => liberadas.add(g));
  return { propias: [...propias], compartidas: [...compartidas], liberadas };
}

describe('memoria: lo que se arma de nuevo libera lo anterior', () => {
  it('al soltar un kart se liberan sus figuras propias, no las que comparten todos los karts', () => {
    const kart = crearKart3D(PERSONAJES[0]);
    const v = vigilar(kart);
    kart.soltar();
    expect(v.propias.length).toBeGreaterThan(10);
    expect(v.propias.every((g) => v.liberadas.has(g))).toBe(true);
    expect(v.compartidas.length).toBeGreaterThan(0);
    expect(v.compartidas.some((g) => v.liberadas.has(g))).toBe(false);
  });

  it('cada carrera nueva libera los karts de la anterior, y no la pista ni lo que sigue en uso', () => {
    const mundo = crearMundo(crearPista(NOCHE), AMBIENTES.noche);
    mundo.ponerKarts(PERSONAJES);
    const v = vigilar(mundo.escena);
    mundo.ponerKarts(PERSONAJES);
    const enEscena = new Set();
    mundo.escena.traverse((o) => {
      if (o.isMesh || o.isPoints) enEscena.add(o.geometry);
    });
    const viejas = v.propias.filter((g) => !enEscena.has(g));
    expect(viejas.length).toBeGreaterThan(8 * 10);
    expect(viejas.every((g) => v.liberadas.has(g))).toBe(true);
    expect([...enEscena].some((g) => v.liberadas.has(g))).toBe(false);
  });

  it('al salir de la selección y del podio se libera lo que armaron', () => {
    for (const escenario of [crearVitrina(PERSONAJES), crearPodio3D(PERSONAJES.slice(0, 3))]) {
      const v = vigilar(escenario.escena);
      escenario.soltar();
      expect(v.propias.every((g) => v.liberadas.has(g))).toBe(true);
      expect(v.compartidas.some((g) => v.liberadas.has(g))).toBe(false);
    }
  });

  it('al cambiar de pista se libera el mundo anterior entero, salvo lo que comparten karts y objetos', () => {
    const pistas = [...PISTAS, { id: 'otra', icono: '🧪', nombre: 'Otra', recorrido: PISTAS[0].recorrido }];
    const mundos = crearMundos(pistas, { ...AMBIENTES, otra: AMBIENTES.noche });
    const { pista, mundo } = mundos.usar('noche');
    mundo.ponerKarts(PERSONAJES);
    mundo.ponerObjetos(crearObjetos(pista));
    const v = vigilar(mundo.escena);
    const otro = mundos.usar('otra');
    expect(otro.mundo).not.toBe(mundo);
    expect(v.propias.length).toBeGreaterThan(50);
    expect(v.propias.every((g) => v.liberadas.has(g))).toBe(true);
    expect(v.compartidas.length).toBeGreaterThan(0);
    expect(v.compartidas.some((g) => v.liberadas.has(g))).toBe(false);
  });

  it('elegir la pista que ya está armada no la vuelve a armar', () => {
    const mundos = crearMundos();
    const actual = mundos.usar('noche');
    const v = vigilar(actual.mundo.escena);
    expect(mundos.usar('noche')).toBe(actual);
    expect(v.liberadas.size).toBe(0);
  });
});
