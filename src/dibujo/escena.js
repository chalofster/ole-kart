import * as THREE from 'three';
import { crearPista3D } from './pista3d.js';
import { crearDecorado } from './decorado3d.js';
import { crearKart3D } from './kart3d.js';

export function crearMundo(pista) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x0b1026);
  escena.fog = new THREE.Fog(0x0b1026, 70, 230);
  escena.add(new THREE.HemisphereLight(0x8fa3ff, 0x1d3b2a, 1.1));
  const luna = new THREE.DirectionalLight(0xdfe7ff, 1.2);
  luna.position.set(-250, 160, -380);
  escena.add(luna);
  escena.add(crearPista3D(pista), crearDecorado(pista));
  let karts = [];
  return {
    escena,
    // Arma los karts de una carrera, en el orden de sus participantes.
    ponerKarts(fichas) {
      karts.forEach((k) => escena.remove(k));
      karts = fichas.map(crearKart3D);
      karts.forEach((k) => escena.add(k));
    },
    actualizar(carrera, t) {
      carrera.karts.forEach((k, i) => karts[i].sincronizar(k, t));
    },
  };
}
