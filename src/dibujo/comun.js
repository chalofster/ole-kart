import * as THREE from 'three';

const materiales = new Map();

export function mate(color) {
  if (!materiales.has(color)) materiales.set(color, new THREE.MeshLambertMaterial({ color }));
  return materiales.get(color);
}

// Material que no recibe luz: brilla igual de noche (faroles, ventanas, flechas de turbo).
export function brillo(color) {
  const clave = `brillo-${color}`;
  if (!materiales.has(clave)) materiales.set(clave, new THREE.MeshBasicMaterial({ color }));
  return materiales.get(clave);
}

// Libera en la tarjeta gráfica las figuras de algo que ya no se dibuja, salvo las compartidas.
// Los materiales no se liberan: son compartidos por todos.
export function soltar(objeto, compartidas = new Set()) {
  objeto.traverse((o) => {
    if ((o.isMesh || o.isPoints) && !compartidas.has(o.geometry)) o.geometry.dispose();
  });
}

export function malla(geometria, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometria, material);
  m.position.set(x, y, z);
  return m;
}
