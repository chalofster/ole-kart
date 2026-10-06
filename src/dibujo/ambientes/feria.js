import * as THREE from 'three';
import { lugaresLibres, limites } from '../../logica/decorado.js';
import { VALLA, puntoEn } from '../../logica/pista.js';
import { juntar, juntarBrillo, colocar, astro, lejosDeLaMeta, separados } from './comun.js';

// Feria flamenca de día: casetas a rayas, farolillos de colores, naranjos y una noria a lo lejos.
const BLANCO = 0xfdf6e3;
const ROJO = 0xd62828;
const VERDE = 0x2d9c5a;
const AMARILLO = 0xffd166;
const COLORES_CASETA = [ROJO, VERDE, ROJO, 0x1e6fd9];
const FAROLILLOS = [ROJO, AMARILLO, VERDE, 0xffffff, 0x1e88e5];

// Portada de la feria sobre la meta: dos torres blancas, una viga con franjas, un remate y ampolletas.
function meta(pista) {
  const p = puntoEn(pista, 1);
  const g = new THREE.Group();
  g.position.set(p.x, 0, -p.y);
  g.rotation.y = p.rumbo;
  const ancho = 2 * VALLA + 4;
  const franja = new THREE.BoxGeometry(1.7, 0.5, ancho + 0.1);
  g.add(juntar([
    ...[VALLA + 1, -(VALLA + 1)].map((z) => ({ geo: new THREE.BoxGeometry(2.4, 10, 2.4), color: BLANCO, pos: [0, 5, z] })),
    { geo: new THREE.BoxGeometry(1.6, 2.6, ancho), color: BLANCO, pos: [0, 10, 0] },
    { geo: franja, color: ROJO, pos: [0, 9.2, 0] },
    { geo: franja, color: AMARILLO, pos: [0, 10.8, 0] },
    // Medio disco de pie sobre la viga, de cara a quien llega.
    { geo: new THREE.CylinderGeometry(4, 4, 1.2, 20, 1, false, 0, Math.PI), color: ROJO, pos: [0, 11.3, 0], rot: [0, 0, Math.PI / 2] },
  ]));
  const ampolleta = new THREE.SphereGeometry(0.3, 6, 5);
  const ampolletas = [];
  for (let z = -VALLA; z <= VALLA; z += 1.5) ampolletas.push({ geo: ampolleta, color: AMARILLO, pos: [-0.9, 10, z] });
  g.add(juntarBrillo(ampolletas));
  return g;
}

// Casetas a la derecha del camino; el frente con rayas mira a la pista (z local negativo). Separadas por más
// que su diagonal (10,3), para que no se encimen adentro de las curvas.
function casetas(pista) {
  const cuerpo = new THREE.BoxGeometry(8, 4.5, 6);
  const raya = new THREE.BoxGeometry(0.8, 4.5, 0.12);
  // Techo a dos aguas: una caja girada 45° sobre el eje de la pista.
  const techo = new THREE.BoxGeometry(8.4, 4.4, 4.4);
  return lugaresLibres(pista, { cada: 14, distancia: 21, holgura: 16, lado: -1 }).filter(separados(10.5)).flatMap((l, i) => {
    const color = COLORES_CASETA[i % COLORES_CASETA.length];
    return colocar(l, [
      { geo: cuerpo, color: BLANCO, pos: [0, 2.25, 0] },
      ...[-3, -1, 1, 3].map((x) => ({ geo: raya, color, pos: [x, 2.25, -3.06] })),
      { geo: techo, color, pos: [0, 4.5, 0], rot: [Math.PI / 4, 0, 0] },
    ]);
  });
}

// Postes a ambos lados con una barra de farolillos de colores.
function farolillos(pista) {
  const poste = new THREE.CylinderGeometry(0.12, 0.15, 5, 6);
  const barra = new THREE.CylinderGeometry(0.06, 0.06, 7, 5);
  const farol = new THREE.SphereGeometry(0.42, 8, 6);
  return [1, -1].flatMap((lado) => lugaresLibres(pista, { cada: 16, distancia: 12.5, holgura: 12, lado })
    .filter(lejosDeLaMeta(pista))
    .flatMap((l, i) => colocar(l, [
      { geo: poste, color: 0x5c4033, pos: [0, 2.5, 0] },
      { geo: barra, color: 0x5c4033, pos: [0, 5, 0], rot: [0, 0, Math.PI / 2] },
      ...[-3, -1.5, 0, 1.5, 3].map((x, j) => ({
        geo: farol, color: FAROLILLOS[(i + j) % FAROLILLOS.length], pos: [x, 4.4, 0], esc: [1, 1.3, 1],
      })),
    ])));
}

// Naranjos a la izquierda del camino.
function naranjos(pista) {
  const tronco = new THREE.CylinderGeometry(0.35, 0.45, 2.4, 6);
  const copa = new THREE.SphereGeometry(2.2, 10, 8);
  const naranja = new THREE.SphereGeometry(0.32, 6, 5);
  const frutas = [[1.6, 3.9, 1], [-1.4, 3.3, 1.2], [0.4, 4.9, -1.5], [-0.8, 4.2, -1.6], [1.2, 3, -1.3]];
  return lugaresLibres(pista, { cada: 22, distancia: 18, holgura: 15, lado: 1 }).flatMap((l) => colocar(l, [
    { geo: tronco, color: 0x7a4a2a, pos: [0, 1.2, 0] },
    { geo: copa, color: 0x2f8f46, pos: [0, 3.6, 0], esc: [1, 0.9, 1] },
    ...frutas.map((pos) => ({ geo: naranja, color: 0xff8c1a, pos })),
  ]));
}

// Noria a lo lejos, de frente a la pista. La rueda gira (g.rueda).
function noria(pista) {
  const b = limites(pista);
  const g = new THREE.Group();
  g.position.set(b.maxX + 75, 0, -(b.minY + b.maxY) / 2);
  g.rotation.y = Math.PI / 2;
  // Patas en A a cada lado de la rueda, del suelo al eje (a 28 de altura).
  const pata = new THREE.BoxGeometry(1, 29.4, 1);
  g.add(juntar([-3, 3].flatMap((z) => [
    { geo: pata, color: BLANCO, pos: [-4.5, 14, z], rot: [0, 0, -0.31] },
    { geo: pata, color: BLANCO, pos: [4.5, 14, z], rot: [0, 0, 0.31] },
  ])));
  const rueda = juntar([
    { geo: new THREE.TorusGeometry(20, 0.6, 6, 40), color: ROJO, pos: [0, 0, 0] },
    ...[0, 1, 2, 3].map((k) => ({ geo: new THREE.BoxGeometry(0.4, 40, 0.4), color: BLANCO, pos: [0, 0, 0], rot: [0, 0, (k * Math.PI) / 4] })),
    ...Array.from({ length: 8 }, (_, k) => ({
      geo: new THREE.BoxGeometry(2.6, 2.6, 2.6),
      color: FAROLILLOS[k % FAROLILLOS.length],
      pos: [Math.cos((k * Math.PI) / 4) * 20, Math.sin((k * Math.PI) / 4) * 20, 0],
    })),
  ]);
  rueda.position.y = 28;
  g.add(rueda);
  g.rueda = rueda;
  return g;
}

function decorado(pista) {
  const g = new THREE.Group();
  g.add(juntar([...casetas(pista), ...farolillos(pista), ...naranjos(pista)]));
  const n = noria(pista);
  g.add(n, astro(FERIA.luz.solPos, 0xfff3b0, 26));
  // La noria gira despacio con el reloj del dibujo: en pausa queda quieta.
  g.actualizar = (t) => {
    n.rueda.rotation.z = t * 0.12;
  };
  return g;
}

export const FERIA = {
  cielo: 0x8fd3ff,
  niebla: { color: 0xc7ebff, cerca: 90, lejos: 320 },
  luz: { cielo: 0xffffff, suelo: 0xe2b259, intensidad: 1.2, sol: 0xfff1d6, solIntensidad: 1.6, solPos: [320, 220, -460] },
  // Albero: la tierra amarilla de la feria. Camino gris (contraste 2,57).
  suelo: 0xe2b259,
  camino: 0x6b6f7a,
  bordes: [ROJO, 0xffffff],
  vallas: [ROJO, 0xffffff],
  rampa: 0xf4a261,
  meta,
  decorado,
};
