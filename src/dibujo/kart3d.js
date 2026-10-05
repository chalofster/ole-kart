import * as THREE from 'three';
import { crearPersonaje, animarPiloto } from './personajes3d.js';
import { brillo, malla } from './comun.js';
import { dibujo, armarParte } from './estilo.js';
import { OBJ } from '../logica/objetos.js';
import { crearGestos, pasoGestos } from '../logica/gestos.js';

const COLORES_DISCO = [0xff4d6d, 0xffd166, 0x4cc9f0, 0x80ed99, 0xc77dff];
const bolaDisco = new THREE.SphereGeometry(0.4, 12, 10);
const aroDisco = new THREE.TorusGeometry(1.5, 0.1, 6, 24);
const rueda = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 14);
const chispa = new THREE.SphereGeometry(0.22, 8, 6);
const sombra = new THREE.CircleGeometry(1.4, 20);
const materialSombra = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });

// El kart mira hacia +x local. La sombra queda en el suelo aunque el kart salte.
export function crearKart3D(ficha) {
  const raiz = new THREE.Group();
  const s = new THREE.Mesh(sombra, materialSombra);
  s.rotation.x = -Math.PI / 2;
  s.position.y = 0.06;
  raiz.add(s);
  const cuerpo = new THREE.Group();
  raiz.add(cuerpo);
  // Carrocería con sombras planas y contorno. El volante queda cerca del piloto, al alcance de sus manos.
  const carroceria = armarParte([
    { geo: new THREE.BoxGeometry(2.4, 0.45, 1.5), color: ficha.kart, pos: [0, 0.5, 0] },
    { geo: new THREE.BoxGeometry(0.5, 0.35, 1.7), color: ficha.detalle ?? ficha.kart, pos: [1.15, 0.45, 0] },
    { geo: new THREE.BoxGeometry(0.7, 0.5, 0.9), color: 0x222222, pos: [-0.45, 0.9, 0] },
    { geo: new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), color: 0x222222, pos: [0.3, 0.95, 0], rot: [0, 0, 0.75] },
    { geo: new THREE.TorusGeometry(0.22, 0.05, 6, 14), color: 0x222222, pos: [0.08, 1.2, 0], rot: [0, Math.PI / 2, 0] },
  ]);
  cuerpo.add(carroceria);
  const chasis = carroceria.porColor.get(ficha.kart);
  const ruedas = [[0.85, 0.85], [0.85, -0.85], [-0.85, 0.85], [-0.85, -0.85]].map(([x, z]) => {
    const r = malla(rueda, dibujo(0x111111), x, 0.38, z);
    r.rotation.x = Math.PI / 2;
    cuerpo.add(r);
    return r;
  });
  const piloto = crearPersonaje(ficha.cuerpo);
  piloto.position.set(-0.45, piloto.asiento ?? 0.95, 0);
  cuerpo.add(piloto);
  const chispas = [-0.85, 0.85].map((z) => {
    const c = malla(chispa, brillo(0x4cc9f0), -1.25, 0.3, z);
    c.visible = false;
    cuerpo.add(c);
    return c;
  });
  const fuego = malla(new THREE.ConeGeometry(0.3, 1.2, 10), brillo(0xff9f1c), -1.6, 0.5, 0);
  fuego.rotation.z = Math.PI / 2;
  fuego.visible = false;
  cuerpo.add(fuego);
  const bola = malla(bolaDisco, brillo(COLORES_DISCO[0]), -0.45, 3, 0);
  bola.visible = false;
  cuerpo.add(bola);
  const aro = malla(aroDisco, brillo(COLORES_DISCO[1]), 0, 0.15, 0);
  aro.rotation.x = Math.PI / 2;
  aro.visible = false;
  raiz.add(aro);
  const gestos = crearGestos();
  Object.assign(raiz, { piloto, chasis });

  // dt es el tiempo del dibujo: vale 0 en pausa, y entonces nada se mueve.
  raiz.sincronizar = (k, t, dt = 0, eventos = []) => {
    raiz.position.set(k.x, 0, -k.y);
    raiz.rotation.y = k.rumbo;
    cuerpo.position.y = k.h;
    // Trompo: una vuelta completa en el dibujo; el rumbo del kart no cambia.
    if (k.trompo > 0) cuerpo.rotation.y = (1 - k.trompo / OBJ.trompo) * Math.PI * 2;
    else cuerpo.rotation.y = k.derrape ? k.derrape.dir * 0.35 : 0;
    raiz.visible = !(k.proteccion > 0 && Math.floor(t * 12) % 2 === 0);
    const disco = k.disco > 0;
    const n = Math.floor(t * 8);
    bola.visible = disco;
    aro.visible = disco;
    // Con la bola disco, también la carrocería cambia de colores.
    chasis.material = dibujo(disco ? COLORES_DISCO[(n + 4) % COLORES_DISCO.length] : ficha.kart);
    if (disco) {
      bola.material = brillo(COLORES_DISCO[n % COLORES_DISCO.length]);
      aro.material = brillo(COLORES_DISCO[(n + 2) % COLORES_DISCO.length]);
      bola.rotation.y = t * 4;
    }
    ruedas.forEach((r) => {
      r.rotation.y += k.vel * 3 * dt;
    });
    chispas.forEach((c) => {
      c.visible = k.chispas > 0;
      c.material = brillo(k.chispas === 2 ? 0xff9f1c : 0x4cc9f0);
      c.scale.setScalar(0.7 + 0.5 * Math.abs(Math.sin(t * 30)));
    });
    fuego.visible = k.turbo > 0;
    fuego.scale.setScalar(0.8 + 0.3 * Math.abs(Math.sin(t * 25)));
    animarPiloto(piloto, pasoGestos(gestos, k, eventos, dt), t);
  };
  return raiz;
}
