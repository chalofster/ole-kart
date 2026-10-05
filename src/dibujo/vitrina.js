import * as THREE from 'three';
import { crearKart3D, GEOMETRIAS_KART } from './kart3d.js';
import { animarPiloto } from './personajes3d.js';
import { mate, brillo, malla, soltar } from './comun.js';
import { crearGestos, pasoGestos, alegrar } from '../logica/gestos.js';

// Kart detenido: en la vitrina los pilotos solo parpadean o se alegran.
const DETENIDO = { trompo: 0, enAire: false, turbo: 0, disco: 0, derrape: null, rumbo: 0 };

// Los 8 personajes en sus karts, girando sobre plataformas en dos filas de 4.
export function crearVitrina(fichas) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x0b1026);
  escena.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.3));
  // Luz con dirección: sin ella, las sombras planas no muestran sus tonos.
  const sol = new THREE.DirectionalLight(0xffffff, 1.6);
  sol.position.set(4, 10, 12);
  escena.add(sol);
  const camara = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camara.position.set(0, 7, 16);
  camara.lookAt(0, 1.2, 0);
  const posiciones = fichas.map((_, i) => ({ x: ((i % 4) - 1.5) * 4, z: Math.floor(i / 4) * 4.5 - 2.2 }));
  const karts = fichas.map((f, i) => {
    const { x, z } = posiciones[i];
    escena.add(malla(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 24), mate(0x3a3f58), x, 0, z));
    const kart = crearKart3D(f);
    kart.position.set(x, 0.15, z);
    escena.add(kart);
    return kart;
  });
  const gestos = fichas.map(() => crearGestos());
  const anillos = [0xd62828, 0x3a86ff].map((color, j) => {
    const a = malla(new THREE.TorusGeometry(1.8 + j * 0.3, 0.12, 8, 32), brillo(color));
    a.rotation.x = Math.PI / 2;
    a.visible = false;
    escena.add(a);
    return a;
  });
  return {
    escena,
    camara,
    karts,
    // Un anillo del color de cada jugador bajo su personaje; undefined lo oculta.
    marcar(cursores) {
      anillos.forEach((a, j) => {
        const c = cursores[j];
        a.visible = c !== undefined;
        if (c !== undefined) a.position.set(posiciones[c].x, 0.2, posiciones[c].z);
      });
    },
    // El personaje recién elegido salta feliz durante 1 s.
    celebrar(i) {
      alegrar(gestos[i]);
    },
    // Al salir de la selección se libera lo que se armó para ella.
    soltar: () => soltar(escena, GEOMETRIAS_KART),
    actualizar(t, dt = 0) {
      karts.forEach((k, i) => {
        k.rotation.y = t * 0.8 + i;
        const gesto = pasoGestos(gestos[i], DETENIDO, [], dt);
        k.position.y = 0.15 + Math.abs(Math.sin(gestos[i].feliz * Math.PI * 2)) * 0.6;
        animarPiloto(k.piloto, gesto, t);
      });
    },
  };
}
