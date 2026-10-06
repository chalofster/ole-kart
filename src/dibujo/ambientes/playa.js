import * as THREE from 'three';
import { lugaresLibres, limites } from '../../logica/decorado.js';
import { VALLA, puntoEn } from '../../logica/pista.js';
import { dibujo } from '../estilo.js';
import { juntar, juntarBrillo, colocar, apuntando, astro } from './comun.js';

// Playa de día: mar turquesa al sur con espuma que va y viene, palmeras, quitasoles, castillos de arena y un faro.
const ARENA_OSCURA = 0xd9b77e;
const COLORES_QUITASOL = [0xef476f, 0xffd166, 0x118ab2, 0x06d6a0];
const COLORES_TABLA = [0x00b4d8, 0xffd166, 0xff6b6b, 0xffffff, 0x06d6a0];

// Arco de tablas de surf sobre la meta: dos tablas de pie y tres acostadas encima.
function meta(pista) {
  const p = puntoEn(pista, 1);
  const g = new THREE.Group();
  g.position.set(p.x, 0, -p.y);
  g.rotation.y = p.rumbo;
  const tabla = new THREE.CapsuleGeometry(0.9, 7, 4, 12);
  // Aplanadas en x: la cara ancha mira a quien llega.
  const plana = [0.25, 1, 1];
  g.add(juntar([
    { geo: tabla, color: COLORES_TABLA[0], pos: [0, 4.4, VALLA + 0.8], esc: plana },
    { geo: tabla, color: COLORES_TABLA[1], pos: [0, 4.4, -(VALLA + 0.8)], esc: plana },
    ...[-7, 0, 7].map((z, i) => ({ geo: tabla, color: COLORES_TABLA[2 + i], pos: [0, 9.6, z], rot: [Math.PI / 2, 0, 0], esc: plana })),
  ]));
  return g;
}

// Mar al sur del recorrido, desde la orilla (28 unidades más allá del punto más al sur) hasta el horizonte.
function mar(pista) {
  const b = limites(pista);
  const orilla = b.minY - 28;
  const cx = (b.minX + b.maxX) / 2;
  const g = new THREE.Group();
  const agua = new THREE.Mesh(new THREE.PlaneGeometry(1600, 800), dibujo(0x2ec4d6));
  agua.rotation.x = -Math.PI / 2;
  agua.position.set(cx, 0.15, -(orilla - 400));
  const espuma = new THREE.Mesh(new THREE.PlaneGeometry(1600, 2.5), dibujo(0xffffff));
  espuma.rotation.x = -Math.PI / 2;
  espuma.position.set(cx, 0.2, -orilla);
  g.add(agua, espuma);
  g.orilla = orilla;
  // La espuma sube y baja por la arena con el reloj del dibujo.
  g.actualizar = (t) => {
    espuma.position.z = -orilla - 1.5 + Math.sin(t * 0.9) * 1.5;
  };
  return g;
}

function palmeras(lugares) {
  const tramo = new THREE.CylinderGeometry(0.3, 0.38, 1.6, 6);
  const hoja = new THREE.ConeGeometry(0.7, 4.2, 4);
  const coco = new THREE.SphereGeometry(0.35, 6, 5);
  const cima = [0.9, 7.8, 0];
  return lugares.flatMap((l) => {
    const piezas = [0, 1, 2, 3, 4].map((i) => ({
      geo: tramo, color: i % 2 ? 0x8d5a2b : 0xa0693a, pos: [i * 0.2, 0.8 + i * 1.5, 0], rot: [0, 0, -0.06 * i],
    }));
    // Seis hojas hacia afuera y un poco caídas.
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const dir = [Math.cos(a) * 0.94, -0.34, Math.sin(a) * 0.94];
      piezas.push({
        geo: hoja, color: 0x2e9e4f, rot: apuntando(dir), esc: [1, 1, 0.35],
        pos: [cima[0] + dir[0] * 2.1, cima[1] + dir[1] * 2.1, cima[2] + dir[2] * 2.1],
      });
    }
    for (const [x, z] of [[0.4, 0.3], [-0.3, 0.3], [0, -0.4]]) piezas.push({ geo: coco, color: 0x6b4226, pos: [cima[0] + x, cima[1] - 0.5, z] });
    return colocar(l, piezas);
  });
}

function quitasoles(lugares) {
  const palo = new THREE.CylinderGeometry(0.08, 0.08, 3.4, 5);
  const tela = new THREE.ConeGeometry(2.4, 1, 10);
  const toalla = new THREE.BoxGeometry(1.4, 0.08, 2.8);
  return lugares.flatMap((l, i) => colocar(l, [
    { geo: palo, color: 0xffffff, pos: [0, 1.7, 0] },
    { geo: tela, color: COLORES_QUITASOL[i % COLORES_QUITASOL.length], pos: [0, 3.6, 0] },
    { geo: toalla, color: COLORES_QUITASOL[(i + 1) % COLORES_QUITASOL.length], pos: [1.8, 0.05, 0.6] },
  ]));
}

function castillos(lugares) {
  const base = new THREE.BoxGeometry(2.4, 1.2, 2.4);
  const torre = new THREE.CylinderGeometry(0.45, 0.5, 1.4, 6);
  const punta = new THREE.ConeGeometry(0.5, 0.7, 6);
  return lugares.flatMap((l) => colocar(l, [
    { geo: base, color: ARENA_OSCURA, pos: [0, 0.6, 0] },
    ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].flatMap(([x, z]) => [
      { geo: torre, color: ARENA_OSCURA, pos: [x, 1.3, z] },
      { geo: punta, color: 0xc99a5b, pos: [x, 2.35, z] },
    ]),
  ]));
}

// Faro a rayas sobre una roca en el mar, cerca del final de la recta de la orilla.
function faro(pista, orilla) {
  const b = limites(pista);
  const piezas = [{ geo: new THREE.SphereGeometry(6, 10, 8), color: 0x7d8597, pos: [0, -1, 0], esc: [1.3, 0.6, 1.3] }];
  for (let i = 0; i < 6; i++) {
    const radio = 2.2 - i * 0.14;
    piezas.push({ geo: new THREE.CylinderGeometry(radio - 0.14, radio, 2.5, 12), color: i % 2 ? 0xffffff : 0xd62828, pos: [0, 2.6 + i * 2.5, 0] });
  }
  piezas.push({ geo: new THREE.ConeGeometry(1.8, 2, 12), color: 0xd62828, pos: [0, 18.95, 0] });
  const g = juntar(piezas);
  g.add(juntarBrillo([{ geo: new THREE.CylinderGeometry(1.2, 1.2, 1.6, 12), color: 0xffe066, pos: [0, 17.15, 0] }]));
  g.position.set(b.maxX + 15, 0, -(orilla - 20));
  return g;
}

function decorado(pista) {
  const g = new THREE.Group();
  const agua = mar(pista);
  // Afuera (a la derecha) hay arena hasta la orilla: ahí van palmeras y quitasoles, nunca en el agua.
  const afuera = lugaresLibres(pista, { cada: 20, distancia: 18, holgura: 15, lado: -1 }).filter((l) => l.y > agua.orilla + 4);
  g.add(juntar([
    ...palmeras(afuera.filter((_, i) => i % 2 === 0)),
    ...quitasoles(afuera.filter((_, i) => i % 2 === 1)),
    ...castillos(lugaresLibres(pista, { cada: 40, distancia: 16, holgura: 14, lado: 1 })),
    ...palmeras(lugaresLibres(pista, { cada: 30, distancia: 24, holgura: 18, lado: 1 })),
  ]));
  g.add(agua, faro(pista, agua.orilla), astro(PLAYA.luz.solPos, 0xfff6c9, 26));
  g.actualizar = (t) => agua.actualizar(t);
  g.actualizar(0);
  return g;
}

export const PLAYA = {
  cielo: 0x4fc3f7,
  niebla: { color: 0xa8e6ff, cerca: 100, lejos: 360 },
  luz: { cielo: 0xffffff, suelo: 0xf2dfb0, intensidad: 1.2, sol: 0xffffff, solIntensidad: 1.7, solPos: [380, 230, 320] },
  // Arena; camino de asfalto (contraste 4,53). Las rampas se ven como dunas.
  suelo: 0xf2dfb0,
  camino: 0x5d6470,
  bordes: [0x1e88e5, 0xffffff],
  vallas: [0x1e88e5, 0xffffff],
  rampa: 0xd4a35a,
  meta,
  decorado,
};
