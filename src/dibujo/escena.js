import * as THREE from 'three';
import { crearPista3D } from './pista3d.js';
import { crearKart3D, GEOMETRIAS_KART } from './kart3d.js';
import { crearObjetos3D, GEOMETRIAS_OBJETOS } from './objetos3d.js';
import { soltar } from './comun.js';

const COMPARTIDAS = new Set([...GEOMETRIAS_KART, ...GEOMETRIAS_OBJETOS]);

// El mundo de una pista: cielo, luz y neblina del ambiente, la pista, su decorado, los karts y los objetos.
export function crearMundo(pista, ambiente) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(ambiente.cielo);
  const { niebla, luz } = ambiente;
  escena.fog = new THREE.Fog(niebla.color, niebla.cerca, niebla.lejos);
  escena.add(new THREE.HemisphereLight(luz.cielo, luz.suelo, luz.intensidad));
  const sol = new THREE.DirectionalLight(luz.sol, luz.solIntensidad);
  sol.position.set(...luz.solPos);
  escena.add(sol);
  const decorado = ambiente.decorado(pista);
  escena.add(crearPista3D(pista, ambiente), decorado);
  let karts = [];
  let objetos = null;
  return {
    escena,
    // Arma los karts de una carrera, en el orden de sus participantes.
    ponerKarts(fichas) {
      karts.forEach((k) => {
        escena.remove(k);
        k.soltar();
      });
      karts = fichas.map(crearKart3D);
      karts.forEach((k) => escena.add(k));
    },
    // Cajas, calabazas y cáscaras de una carrera.
    ponerObjetos(estado) {
      if (objetos) escena.remove(objetos.grupo);
      objetos = crearObjetos3D(estado);
      escena.add(objetos.grupo);
    },
    // t y dt: tiempo del dibujo (dt vale 0 en pausa). eventos[i]: lo que le pasó al kart i en este cuadro.
    actualizar(carrera, t, dt = 0, eventos = null) {
      carrera.karts.forEach((k, i) => karts[i].sincronizar(k, t, dt, eventos?.[i] ?? []));
      objetos?.actualizar(carrera.objetos, t);
      decorado.actualizar?.(t);
    },
    // Libera todo lo que armó este mundo, salvo las figuras que comparten todos los karts y objetos.
    soltar() {
      soltar(escena, COMPARTIDAS);
    },
  };
}
