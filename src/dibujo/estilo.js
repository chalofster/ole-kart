import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Tres tonos planos, como en los dibujos animados: sombra, medio y luz.
export const TONOS = new THREE.DataTexture(new Uint8Array([80, 170, 255]), 3, 1, THREE.RedFormat);
TONOS.minFilter = THREE.NearestFilter;
TONOS.magFilter = THREE.NearestFilter;
TONOS.needsUpdate = true;

const materiales = new Map();

export function dibujo(color) {
  if (!materiales.has(color)) materiales.set(color, new THREE.MeshToonMaterial({ color, gradientMap: TONOS }));
  return materiales.get(color);
}

// Contorno: la misma forma inflada un poco hacia afuera y pintada solo por dentro, en café casi negro.
const GROSOR_CONTORNO = 0.035;
export const CONTORNO = new THREE.MeshBasicMaterial({ color: 0x2b1a12, side: THREE.BackSide });
CONTORNO.onBeforeCompile = (shader) => {
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `vec3 transformed = vec3( position ) + normal * ${GROSOR_CONTORNO.toFixed(3)};`,
  );
};

// Une las piezas de una parte del cuerpo: una malla por color y un solo contorno para todas.
// Pieza: { geo, color, pos: [x, y, z], rot: [x, y, z], esc: número o [x, y, z], contorno: false para detalles chicos }.
export function armarParte(piezas) {
  const grupo = new THREE.Group();
  const porColor = new Map();
  const conContorno = [];
  const matriz = new THREE.Matrix4();
  for (const p of piezas) {
    const esc = typeof p.esc === 'number' ? [p.esc, p.esc, p.esc] : p.esc ?? [1, 1, 1];
    matriz.compose(
      new THREE.Vector3(...p.pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rot ?? [0, 0, 0]))),
      new THREE.Vector3(...esc),
    );
    const geo = p.geo.clone().applyMatrix4(matriz);
    if (!porColor.has(p.color)) porColor.set(p.color, []);
    porColor.get(p.color).push(geo);
    if (p.contorno !== false) conContorno.push(geo);
  }
  grupo.porColor = new Map();
  for (const [color, geos] of porColor) {
    const malla = new THREE.Mesh(mergeGeometries(geos), dibujo(color));
    grupo.add(malla);
    grupo.porColor.set(color, malla);
  }
  if (conContorno.length) grupo.add(new THREE.Mesh(mergeGeometries(conContorno), CONTORNO));
  return grupo;
}
