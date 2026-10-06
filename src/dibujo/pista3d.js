import * as THREE from 'three';
import { MEDIO_ANCHO, VALLA, RAMPA, puntoEn } from '../logica/pista.js';
import { limites } from '../logica/decorado.js';
import { mate, brillo, malla } from './comun.js';

// Cinta a lo largo de la pista: dos puntos por muestra, colores por vértice.
function cinta(pista, borde, colorDe) {
  const { muestras } = pista;
  const n = muestras.length;
  const pos = [];
  const col = [];
  const idx = [];
  const c = new THREE.Color();
  for (let i = 0; i <= n; i++) {
    for (const [x, h, y] of borde(muestras[i % n])) {
      pos.push(x, h, -y);
      c.set(colorDe(i));
      col.push(c.r, c.g, c.b);
    }
    if (i < n) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
}

const lado = (m, lateral, h) => [m.x + m.nx * lateral, h, m.y + m.ny * lateral];

// Rampa: cuña que sube de 0 a RAMPA.alto desde la distancia s.
function rampa3D(pista, s, color) {
  const a = puntoEn(pista, s);
  const b = puntoEn(pista, s + RAMPA.largo);
  const m0 = pista.muestras[a.indice];
  const v = (p, lateral, h) => [p.x + m0.nx * lateral, h, -(p.y + m0.ny * lateral)];
  const vertices = [
    ...v(a, -MEDIO_ANCHO, 0.03), ...v(a, MEDIO_ANCHO, 0.03),
    ...v(b, -MEDIO_ANCHO, RAMPA.alto), ...v(b, MEDIO_ANCHO, RAMPA.alto),
    ...v(b, -MEDIO_ANCHO, 0), ...v(b, MEDIO_ANCHO, 0),
  ];
  const cuna = new THREE.BufferGeometry();
  cuna.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  cuna.setIndex([0, 2, 1, 1, 2, 3, 2, 4, 3, 3, 4, 5, 0, 4, 2, 1, 3, 5]);
  cuna.computeVertexNormals();
  return new THREE.Mesh(cuna, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
}

// Suelo, camino, bordes, vallas, meta, flechas de turbo y rampas, con los colores del ambiente.
export function crearPista3D(pista, ambiente) {
  const grupo = new THREE.Group();

  const b = limites(pista);
  const suelo = malla(new THREE.PlaneGeometry(1400, 1400), mate(ambiente.suelo), (b.minX + b.maxX) / 2, 0, -(b.minY + b.maxY) / 2);
  suelo.rotation.x = -Math.PI / 2;
  grupo.add(suelo);

  grupo.add(cinta(pista, (m) => [lado(m, -MEDIO_ANCHO, 0.03), lado(m, MEDIO_ANCHO, 0.03)], () => ambiente.camino));
  const solera = (i) => ambiente.bordes[Math.floor(i / 3) % 2];
  grupo.add(cinta(pista, (m) => [lado(m, MEDIO_ANCHO, 0.04), lado(m, MEDIO_ANCHO + 0.9, 0.04)], solera));
  grupo.add(cinta(pista, (m) => [lado(m, -MEDIO_ANCHO - 0.9, 0.04), lado(m, -MEDIO_ANCHO, 0.04)], solera));
  const valla = (i) => ambiente.vallas[Math.floor(i / 4) % 2];
  for (const s of [1, -1]) grupo.add(cinta(pista, (m) => [lado(m, s * VALLA, 0), lado(m, s * VALLA, 0.9)], valla));

  // Meta: cuadros blancos y negros, y encima el arco propio del ambiente.
  const cuadro = new THREE.PlaneGeometry(1, 1);
  for (let fila = 0; fila < 2; fila++) {
    for (let col = 0; col < 2 * MEDIO_ANCHO; col++) {
      const p = puntoEn(pista, fila + 0.5, -MEDIO_ANCHO + col + 0.5);
      const m = malla(cuadro, mate((fila + col) % 2 ? 0x111111 : 0xffffff), p.x, 0.05, -p.y);
      m.rotation.x = -Math.PI / 2;
      grupo.add(m);
    }
  }
  grupo.add(ambiente.meta(pista));

  // Flechas de turbo, naranjas y brillantes, apuntando hacia adelante.
  const forma = new THREE.Shape();
  forma.moveTo(-0.8, 1.4);
  forma.lineTo(0.8, 0);
  forma.lineTo(-0.8, -1.4);
  forma.lineTo(-0.2, 0);
  forma.closePath();
  const flecha = new THREE.ShapeGeometry(forma);
  for (const t of pista.turbos) {
    for (const d of [0.8, 2, 3.2]) {
      for (const lat of [-1.8, 1.8]) {
        const p = puntoEn(pista, t + d, lat);
        const g = new THREE.Group();
        g.position.set(p.x, 0.06, -p.y);
        g.rotation.y = p.rumbo;
        const m = malla(flecha, brillo(0xff9f1c));
        m.rotation.x = -Math.PI / 2;
        g.add(m);
        grupo.add(g);
      }
    }
  }

  for (const s of pista.rampas) grupo.add(rampa3D(pista, s, ambiente.rampa));
  return grupo;
}
