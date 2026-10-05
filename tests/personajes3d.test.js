import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { PERSONAJES } from '../src/logica/personajes.js';
import { crearPersonaje, animarPiloto, animarPodio } from '../src/dibujo/personajes3d.js';
import { materialCara } from '../src/dibujo/caras.js';
import { CARAS } from '../src/logica/gestos.js';

// Personajes que ya tienen el estilo nuevo.
const NUEVOS = ['bailarina', 'bailarin', 'teclita'];
const alto = (o) => new THREE.Box3().setFromObject(o).max.y;
const centro = (o) => {
  o.updateWorldMatrix(true, true);
  return new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
};
const gesto = (cara, ojosCerrados = false) => ({ cara, ojosCerrados, inclinacion: 0 });

describe('personajes en 3D', () => {
  it('los 8 se arman desde su ficha y ninguno mide más de 1,9 sobre su punto de apoyo', () => {
    for (const f of PERSONAJES) expect(alto(crearPersonaje(f.cuerpo))).toBeLessThanOrEqual(1.9);
  });

  it('los que todavía tienen el dibujo simple no fallan al animarse', () => {
    const antiguo = crearPersonaje(PERSONAJES.find((p) => !NUEVOS.includes(p.id)).cuerpo);
    expect(() => {
      animarPiloto(antiguo, gesto('mareo'), 1);
      animarPodio(antiguo, 0, 1);
    }).not.toThrow();
  });

  for (const id of NUEVOS) {
    const ficha = PERSONAJES.find((p) => p.id === id);

    it(`${id}: cara dibujada, dos brazos y cabeza grande`, () => {
      const p = crearPersonaje(ficha.cuerpo);
      expect(p.careta.material).toBe(materialCara('normal', false));
      expect(p.brazos).toHaveLength(2);
      const cabeza = new THREE.Box3().setFromObject(p.cabeza);
      expect((cabeza.max.y - cabeza.min.y) / alto(p)).toBeGreaterThan(0.4);
    });

    it(`${id}: pone cada cara y cierra los ojos`, () => {
      const p = crearPersonaje(ficha.cuerpo);
      for (const cara of CARAS) {
        animarPiloto(p, gesto(cara), 0.5);
        expect(p.careta.material).toBe(materialCara(cara, false));
      }
      animarPiloto(p, gesto('normal', true), 0.5);
      expect(p.careta.material).toBe(materialCara('normal', true));
    });

    it(`${id}: maneja con las manos adelante y en el aire sube los brazos`, () => {
      const p = crearPersonaje(ficha.cuerpo);
      const hombro = p.brazos[0].position.clone();
      animarPiloto(p, gesto('normal'), 0);
      expect(centro(p.brazos[0]).x).toBeGreaterThan(hombro.x + 0.1);
      animarPiloto(p, gesto('sorpresa'), 0);
      expect(centro(p.brazos[0]).y).toBeGreaterThan(hombro.y + 0.1);
    });
  }
});
