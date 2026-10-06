import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { dibujo } from '../estilo.js';
import { brillo } from '../comun.js';

const ARRIBA = new THREE.Vector3(0, 1, 0);
const matriz = new THREE.Matrix4();

// Junta piezas en una malla por color: así el decorado se dibuja con pocas llamadas.
// Pieza: { geo, color, pos: [x, y, z], rot: [x, y, z], esc: número o [x, y, z] }.
function porColores(piezas, material) {
  const grupo = new THREE.Group();
  const porColor = new Map();
  for (const p of piezas) {
    const esc = typeof p.esc === 'number' ? [p.esc, p.esc, p.esc] : p.esc ?? [1, 1, 1];
    matriz.compose(
      new THREE.Vector3(...p.pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rot ?? [0, 0, 0]))),
      new THREE.Vector3(...esc),
    );
    if (!porColor.has(p.color)) porColor.set(p.color, []);
    porColor.get(p.color).push(p.geo.clone().applyMatrix4(matriz));
  }
  for (const [color, geos] of porColor) grupo.add(new THREE.Mesh(mergeGeometries(geos), material(color)));
  return grupo;
}

// Con las sombras planas de los dibujos animados, sin contorno.
export const juntar = (piezas) => porColores(piezas, dibujo);
// Con colores que brillan sin luz (ampolletas, faroles encendidos).
export const juntarBrillo = (piezas) => porColores(piezas, brillo);

// Lleva piezas armadas alrededor del origen a un lugar junto a la pista ({ x, y, rumbo }, como los de
// lugaresLibres o puntoEn): x local apunta hacia adelante en la pista y z local hacia la derecha.
export function colocar(lugar, piezas) {
  const giro = new THREE.Quaternion().setFromAxisAngle(ARRIBA, lugar.rumbo);
  return piezas.map((p) => {
    const pos = new THREE.Vector3(...p.pos).applyQuaternion(giro).add(new THREE.Vector3(lugar.x, 0, -lugar.y));
    const propio = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rot ?? [0, 0, 0])));
    const rot = new THREE.Euler().setFromQuaternion(giro.clone().multiply(propio));
    return { ...p, pos: [pos.x, pos.y, pos.z], rot: [rot.x, rot.y, rot.z] };
  });
}

// Giro que deja apuntando hacia dir una figura que por defecto apunta hacia arriba (conos, cilindros).
export function apuntando(dir) {
  const q = new THREE.Quaternion().setFromUnitVectors(ARRIBA, new THREE.Vector3(...dir).normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
}

// Sol o luna: una esfera en el cielo que no recibe luz ni neblina.
export function astro(pos, color, radio = 30) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(radio, 24, 16), new THREE.MeshBasicMaterial({ color, fog: false }));
  m.position.set(...pos);
  return m;
}

// Para los lugares de lugaresLibres: deja fuera los que chocarían con el arco de meta.
export const lejosDeLaMeta = (pista) => (l) => l.s > 10 && l.s < pista.largo - 10;

// Para los lugares de lugaresLibres: deja fuera los que quedan a menos de minimo de otro ya elegido. Adentro
// de una curva los lugares se juntan, y las piezas grandes (casetas, casas) quedarían una encima de otra.
export function separados(minimo) {
  const elegidos = [];
  return (l) => {
    if (elegidos.some((e) => Math.hypot(e.x - l.x, e.y - l.y) < minimo)) return false;
    elegidos.push(l);
    return true;
  };
}
