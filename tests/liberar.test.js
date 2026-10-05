import { describe, it, expect } from 'vitest';
import { crearKart3D, GEOMETRIAS_KART } from '../src/dibujo/kart3d.js';
import { crearMundo } from '../src/dibujo/escena.js';
import { crearVitrina } from '../src/dibujo/vitrina.js';
import { crearPodio3D } from '../src/dibujo/podio3d.js';
import { crearPista, NOCHE } from '../src/logica/pista.js';
import { PERSONAJES } from '../src/logica/personajes.js';

// Figuras de las mallas de un objeto, separadas en propias y compartidas, y las que se liberan después.
function vigilar(objeto) {
  const propias = new Set();
  const compartidas = new Set();
  objeto.traverse((o) => {
    if (o.isMesh) (GEOMETRIAS_KART.has(o.geometry) ? compartidas : propias).add(o.geometry);
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
    const mundo = crearMundo(crearPista(NOCHE));
    mundo.ponerKarts(PERSONAJES);
    const v = vigilar(mundo.escena);
    mundo.ponerKarts(PERSONAJES);
    const enEscena = new Set();
    mundo.escena.traverse((o) => {
      if (o.isMesh) enEscena.add(o.geometry);
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
});
