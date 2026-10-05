import * as THREE from 'three';
import { armarParte } from '../estilo.js';
import { materialCara, geometriaCareta } from '../caras.js';

// Figuras simples para armar personajes.
export const esfera = (r) => new THREE.SphereGeometry(r, 16, 12);
// Media esfera de arriba: pelo sobre la cabeza.
export const casquete = (r) => new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
export const cono = (r, alto, lados = 12) => new THREE.ConeGeometry(r, alto, lados);
export const cilindro = (arriba, abajo, alto, lados = 12) => new THREE.CylinderGeometry(arriba, abajo, alto, lados);
// Media caña que cubre solo la espalda (x negativo): pelo largo.
export const mitadCilindro = (arriba, abajo, alto) => new THREE.CylinderGeometry(arriba, abajo, alto, 16, 1, true, Math.PI, Math.PI);
// Medio disco (x positivo); girado [0, 0, π/2] queda parado, con la mitad de arriba: peineta.
export const mitadDisco = (r, grosor) => new THREE.CylinderGeometry(r, r, grosor, 16, 1, false, 0, Math.PI);
export const caja = (x, y, z) => new THREE.BoxGeometry(x, y, z);
export const aro = (radio, grosor, arco = Math.PI * 2) => new THREE.TorusGeometry(radio, grosor, 8, 24, arco);
export const pieza = (geo, color, pos, extra = {}) => ({ geo, color, pos, ...extra });

// Brazo que cuelga del hombro: manga abullonada, brazo y mano como bolita.
export function brazoSimple(manga, brazo, mano) {
  return [
    pieza(esfera(0.11), manga, [0, -0.04, 0]),
    pieza(cilindro(0.055, 0.055, 0.3), brazo, [0, -0.2, 0]),
    pieza(esfera(0.08), mano, [0, -0.38, 0]),
  ];
}

// Personaje mirando a +x, con su punto de apoyo en el origen: cuerpo, cabeza con cara,
// dos brazos y partes extra que se mueven. Todo cuelga de "rebote", que salta o se inclina.
export function armarPersonaje({ cuerpo, cabeza, brazos, extras = {}, asiento = 0.75, flota = false, alas = false }) {
  const p = new THREE.Group();
  const rebote = new THREE.Group();
  p.add(rebote);
  rebote.add(armarParte(cuerpo));
  const cab = new THREE.Group();
  cab.position.set(...cabeza.centro);
  cab.add(armarParte(cabeza.piezas));
  const careta = new THREE.Mesh(geometriaCareta(cabeza.radio), materialCara('normal'));
  if (cabeza.escala) careta.scale.set(...cabeza.escala);
  cab.add(careta);
  rebote.add(cab);
  const hombros = brazos.hombros.map((pos) => {
    const h = new THREE.Group();
    h.position.set(...pos);
    h.add(armarParte(brazos.piezas));
    rebote.add(h);
    return h;
  });
  const partes = {};
  for (const [nombre, extra] of Object.entries(extras)) {
    const g = new THREE.Group();
    g.position.set(...extra.pos);
    g.baseY = extra.pos[1];
    g.add(armarParte(extra.piezas));
    rebote.add(g);
    partes[nombre] = g;
  }
  return Object.assign(p, { rebote, cabeza: cab, careta, brazos: hombros, extras: partes, asiento, flota, alas });
}
