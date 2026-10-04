import * as THREE from 'three';
import { crearPersonaje } from './personajes3d.js';
import { mate, malla } from './comun.js';

// Los tres primeros bailan sobre el podio, mirando a la cámara.
export function crearPodio3D(fichas) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x0b1026);
  escena.add(new THREE.HemisphereLight(0xffffff, 0x334455, 2));
  const camara = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camara.position.set(0, 4.5, 12);
  camara.lookAt(0, 2, 0);
  const lugares = [
    { x: 0, alto: 2.4, color: 0xffd166 },
    { x: -3, alto: 1.6, color: 0xced4da },
    { x: 3, alto: 1.1, color: 0xcd7f32 },
  ];
  const figuras = fichas.map((f, i) => {
    const l = lugares[i];
    escena.add(malla(new THREE.BoxGeometry(2.6, l.alto, 2.6), mate(l.color), l.x, l.alto / 2, 0));
    const p = crearPersonaje(f.cuerpo);
    p.position.set(l.x, l.alto, 0);
    escena.add(p);
    return p;
  });
  return {
    escena,
    camara,
    actualizar(t) {
      figuras.forEach((p, i) => {
        p.position.y = lugares[i].alto + Math.abs(Math.sin(t * 4 + i)) * 0.4;
        p.rotation.y = -Math.PI / 2 + Math.sin(t * 2 + i) * 0.5;
      });
    },
  };
}
