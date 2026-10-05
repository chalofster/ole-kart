import * as THREE from 'three';
import { crearPersonaje, animarPodio } from './personajes3d.js';
import { mate, malla, soltar } from './comun.js';

// Los tres primeros sobre el podio, mirando a la cámara: el 1.º salta y baila, los otros aplauden.
export function crearPodio3D(fichas) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x0b1026);
  escena.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.3));
  const sol = new THREE.DirectionalLight(0xffffff, 1.6);
  sol.position.set(4, 10, 12);
  escena.add(sol);
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
    figuras,
    soltar: () => soltar(escena),
    actualizar(t) {
      figuras.forEach((p, i) => {
        p.position.y = lugares[i].alto + (i === 0 ? Math.abs(Math.sin(t * 4)) * 0.4 : 0);
        p.rotation.y = -Math.PI / 2 + Math.sin(t * 2 + i) * (i === 0 ? 0.5 : 0.15);
        animarPodio(p, i, t);
      });
    },
  };
}
