import * as THREE from 'three';
import { MEDIO_ANCHO, VALLA, RAMPA, puntoEn } from '../logica/pista.js';
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

export function crearPista3D(pista) {
  const grupo = new THREE.Group();

  const pasto = malla(new THREE.PlaneGeometry(1400, 1400), mate(0x1d3b2a), 95, 0, -75);
  pasto.rotation.x = -Math.PI / 2;
  grupo.add(pasto);

  grupo.add(cinta(pista, (m) => [lado(m, -MEDIO_ANCHO, 0.03), lado(m, MEDIO_ANCHO, 0.03)], () => 0x55586a));
  const solera = (i) => (Math.floor(i / 3) % 2 === 0 ? 0xd62828 : 0xf1f1f1);
  grupo.add(cinta(pista, (m) => [lado(m, MEDIO_ANCHO, 0.04), lado(m, MEDIO_ANCHO + 0.9, 0.04)], solera));
  grupo.add(cinta(pista, (m) => [lado(m, -MEDIO_ANCHO - 0.9, 0.04), lado(m, -MEDIO_ANCHO, 0.04)], solera));
  const valla = (i) => (Math.floor(i / 4) % 2 === 0 ? 0xff9f1c : 0xfaf3dd);
  for (const s of [1, -1]) grupo.add(cinta(pista, (m) => [lado(m, s * VALLA, 0), lado(m, s * VALLA, 0.9)], valla));

  // Meta: cuadros blancos y negros y un arco con luces.
  const cuadro = new THREE.PlaneGeometry(1, 1);
  for (let fila = 0; fila < 2; fila++) {
    for (let col = 0; col < 2 * MEDIO_ANCHO; col++) {
      const p = puntoEn(pista, fila + 0.5, -MEDIO_ANCHO + col + 0.5);
      const m = malla(cuadro, mate((fila + col) % 2 ? 0x111111 : 0xffffff), p.x, 0.05, -p.y);
      m.rotation.x = -Math.PI / 2;
      grupo.add(m);
    }
  }
  const arco = new THREE.Group();
  const pm = puntoEn(pista, 1);
  arco.position.set(pm.x, 0, -pm.y);
  arco.rotation.y = pm.rumbo;
  // Dentro del arco, el eje z local apunta a la derecha: lateral izquierdo = z negativo.
  for (const z of [VALLA - 0.5, -(VALLA - 0.5)]) arco.add(malla(new THREE.CylinderGeometry(0.35, 0.35, 6.5), mate(0x333344), 0, 3.25, z));
  arco.add(malla(new THREE.BoxGeometry(0.8, 0.8, 2 * VALLA), mate(0x333344), 0, 6.5, 0));
  const foco = new THREE.SphereGeometry(0.25, 8, 6);
  for (let z = -VALLA + 1; z <= VALLA - 1; z += 1.5) {
    arco.add(malla(foco, brillo(Math.round(z) % 2 ? 0xffd166 : 0xff4d6d), 0.45, 6.5, z));
  }
  grupo.add(arco);

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

  // Rampa: cuña amarilla que sube de 0 a RAMPA.alto.
  const a = puntoEn(pista, pista.rampa);
  const b = puntoEn(pista, pista.rampa + RAMPA.largo);
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
  grupo.add(new THREE.Mesh(cuna, new THREE.MeshLambertMaterial({ color: 0xffd166, side: THREE.DoubleSide })));

  return grupo;
}
