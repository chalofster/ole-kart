import * as THREE from 'three';
import { crearPista3D } from './pista3d.js';
import { crearDecorado } from './decorado3d.js';
import { crearKart3D } from './kart3d.js';
import { crearObjetos3D } from './objetos3d.js';

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
  let objetos = null;
  return {
    escena,
    // Arma los karts de una carrera, en el orden de sus participantes.
    ponerKarts(fichas) {
      karts.forEach((k) => escena.remove(k));
      karts = fichas.map(crearKart3D);
      karts.forEach((k) => escena.add(k));
    },
    // Cajas, calabazas y cáscaras de una carrera.
    ponerObjetos(estado) {
      if (objetos) escena.remove(objetos.grupo);
      objetos = crearObjetos3D(estado);
      escena.add(objetos.grupo);
    },
    // dt: tiempo del dibujo (0 en pausa). eventos[i]: lo que le pasó al kart i en este cuadro.
    actualizar(carrera, t, dt = 0, eventos = null) {
      carrera.karts.forEach((k, i) => karts[i].sincronizar(k, t, dt, eventos?.[i] ?? []));
      objetos?.actualizar(carrera.objetos, t);
    },
  };
}
