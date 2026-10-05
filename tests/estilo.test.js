import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { dibujo, armarParte, CONTORNO } from '../src/dibujo/estilo.js';
import { materialCara, dibujarCara } from '../src/dibujo/caras.js';
import { CARAS } from '../src/logica/gestos.js';

describe('sombras planas', () => {
  it('un material de 3 tonos por color, que se reutiliza', () => {
    const m = dibujo(0xd62828);
    expect(m).toBeInstanceOf(THREE.MeshToonMaterial);
    expect(m.gradientMap.image.width).toBe(3);
    expect(m.color.getHex()).toBe(0xd62828);
    expect(dibujo(0xd62828)).toBe(m);
  });

  it('el contorno se pinta por dentro de la forma inflada', () => {
    expect(CONTORNO.side).toBe(THREE.BackSide);
  });
});

describe('armar una parte', () => {
  it('junta las piezas en una malla por color y un contorno, con su posición y tamaño', () => {
    const parte = armarParte([
      { geo: new THREE.BoxGeometry(1, 1, 1), color: 0xff0000, pos: [0, 2, 0] },
      { geo: new THREE.SphereGeometry(1, 8, 6), color: 0xff0000, pos: [3, 0, 0], esc: [0.5, 1, 1] },
      { geo: new THREE.SphereGeometry(0.2, 6, 4), color: 0x00ff00, pos: [0, 0, 0], contorno: false },
    ]);
    expect(parte.children).toHaveLength(3);
    const rojo = parte.porColor.get(0xff0000);
    expect(rojo.material).toBe(dibujo(0xff0000));
    const caja = new THREE.Box3().setFromObject(rojo);
    expect(caja.max.y).toBeCloseTo(2.5, 5);
    expect(caja.max.x).toBeCloseTo(3.5, 5);
    const contorno = parte.children.find((m) => m.material === CONTORNO);
    expect(contorno.geometry.attributes.position.count).toBe(rojo.geometry.attributes.position.count);
  });
});

describe('caras', () => {
  it('un material por cara y por ojos cerrados, reutilizado; sin navegador queda invisible', () => {
    for (const cara of CARAS) {
      const m = materialCara(cara);
      expect(materialCara(cara, false)).toBe(m);
      expect(m.transparent).toBe(true);
    }
    expect(materialCara('normal', true)).not.toBe(materialCara('normal', false));
    expect(materialCara('feliz').opacity).toBe(0);
  });

  it('cada cara se dibuja distinta, y los ojos cerrados también', () => {
    const ordenes = (cara, cerrados = false) => {
      const lista = [];
      const g = new Proxy({}, {
        get: (_, nombre) => (...args) => lista.push(`${String(nombre)}(${args.length})`),
        set: () => true,
      });
      dibujarCara(g, cara, cerrados);
      return lista.join(' ');
    };
    expect(new Set(CARAS.map((c) => ordenes(c))).size).toBe(CARAS.length);
    expect(ordenes('normal', true)).not.toBe(ordenes('normal', false));
  });
});
