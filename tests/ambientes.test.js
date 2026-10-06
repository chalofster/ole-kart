import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { PISTAS } from '../src/logica/pistas.js';
import { crearPista, puntoEn } from '../src/logica/pista.js';
import { AMBIENTES } from '../src/dibujo/ambientes/index.js';
import { juntar, colocar } from '../src/dibujo/ambientes/comun.js';
import { PARTITURAS } from '../src/sonido/partituras.js';
import { crearMundo } from '../src/dibujo/escena.js';

// Razón de contraste entre dos colores, con la fórmula de las pautas de accesibilidad web.
function luminancia(color) {
  const [r, g, b] = [16, 8, 0]
    .map((s) => ((color >> s) & 255) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contraste(a, b) {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}
function mallas(objeto) {
  let n = 0;
  objeto.traverse((o) => {
    if (o.isMesh || o.isPoints) n += 1;
  });
  return n;
}

describe('catálogo', () => {
  it('cada pista tiene su ambiente y su música, y no sobra ninguno', () => {
    const ids = PISTAS.map((p) => p.id).sort();
    expect(Object.keys(AMBIENTES).sort()).toEqual(ids);
    expect(Object.keys(PARTITURAS).sort()).toEqual(ids);
  });
});

describe('piezas del decorado', () => {
  it('colocar lleva una pieza al costado de la pista según el rumbo del lugar', () => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const [adelante, derecha] = colocar({ x: 10, y: 5, rumbo: Math.PI / 2 }, [
      { geo, color: 1, pos: [2, 0, 0] },
      { geo, color: 1, pos: [0, 1, 3] },
    ]);
    // Rumbo norte: adelante es +y lógico (z negativo en Three.js) y la derecha es +x.
    expect(adelante.pos[0]).toBeCloseTo(10, 6);
    expect(adelante.pos[2]).toBeCloseTo(-7, 6);
    expect(derecha.pos[0]).toBeCloseTo(13, 6);
    expect(derecha.pos[1]).toBeCloseTo(1, 6);
    expect(derecha.pos[2]).toBeCloseTo(-5, 6);
    expect(adelante.rot[1]).toBeCloseTo(Math.PI / 2, 6);
  });

  it('juntar deja una sola malla por color', () => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const g = juntar([
      { geo, color: 0xff0000, pos: [0, 0, 0] },
      { geo, color: 0xff0000, pos: [3, 0, 0] },
      { geo, color: 0x00ff00, pos: [6, 0, 0] },
    ]);
    expect(g.children).toHaveLength(2);
  });
});

describe.each(PISTAS)('ambiente de $nombre', ({ id, recorrido }) => {
  const ambiente = AMBIENTES[id];
  const pista = crearPista(recorrido);

  it('el camino se distingue del suelo: contraste de al menos 1,5', () => {
    expect(contraste(ambiente.camino, ambiente.suelo)).toBeGreaterThanOrEqual(1.5);
  });

  it('la meta queda sobre la línea de llegada, mirando hacia adelante', () => {
    const meta = ambiente.meta(pista);
    const p = puntoEn(pista, 1);
    expect(meta.position.x).toBeCloseTo(p.x, 6);
    expect(meta.position.z).toBeCloseTo(-p.y, 6);
    expect(meta.rotation.y).toBeCloseTo(p.rumbo, 6);
  });

  it('lo que se mueve del decorado depende solo del reloj del dibujo: en pausa queda quieto', () => {
    const d = ambiente.decorado(pista);
    const foto = () => {
      d.updateMatrixWorld(true);
      const valores = [];
      d.traverse((o) => valores.push(...o.matrixWorld.elements));
      return valores;
    };
    d.actualizar?.(3);
    const antes = foto();
    d.actualizar?.(7.5);
    d.actualizar?.(3);
    expect(foto()).toEqual(antes);
  });

  it('el mundo se arma con el cielo y la neblina del ambiente', () => {
    const mundo = crearMundo(pista, ambiente);
    expect(mundo.escena.background.equals(new THREE.Color(ambiente.cielo))).toBe(true);
    expect(mundo.escena.fog.color.equals(new THREE.Color(ambiente.niebla.color))).toBe(true);
    mundo.soltar();
  });
});

// Noche queda como está; los decorados nuevos juntan sus piezas por color para dibujar rápido.
for (const { id, nombre, recorrido } of PISTAS.filter((p) => p.id !== 'noche')) {
  describe(`decorado de ${nombre}`, () => {
    it('se dibuja con pocas mallas (40 como máximo)', () => {
      expect(mallas(AMBIENTES[id].decorado(crearPista(recorrido)))).toBeLessThanOrEqual(40);
    });
  });
}
