import * as THREE from 'three';
import { crearPersonaje } from './personajes3d.js';
import { mate, brillo, malla } from './comun.js';

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
  cuerpo.add(malla(new THREE.BoxGeometry(2.4, 0.45, 1.5), mate(ficha.kart), 0, 0.5, 0));
  cuerpo.add(malla(new THREE.BoxGeometry(0.5, 0.35, 1.7), mate(ficha.detalle ?? ficha.kart), 1.15, 0.45, 0));
  cuerpo.add(malla(new THREE.BoxGeometry(0.7, 0.5, 0.9), mate(0x222222), -0.45, 0.9, 0));
  const volante = malla(new THREE.TorusGeometry(0.22, 0.05, 6, 14), mate(0x222222), 0.45, 1.05, 0);
  volante.rotation.y = Math.PI / 2;
  cuerpo.add(volante);
  const ruedas = [[0.85, 0.85], [0.85, -0.85], [-0.85, 0.85], [-0.85, -0.85]].map(([x, z]) => {
    const r = malla(rueda, mate(0x111111), x, 0.38, z);
    r.rotation.x = Math.PI / 2;
    cuerpo.add(r);
    return r;
  });
  const piloto = crearPersonaje(ficha.cuerpo);
  piloto.position.set(-0.45, 0.95, 0);
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

  raiz.sincronizar = (k, t) => {
    raiz.position.set(k.x, 0, -k.y);
    raiz.rotation.y = k.rumbo;
    cuerpo.position.y = k.h;
    cuerpo.rotation.y = k.derrape ? k.derrape.dir * 0.35 : 0;
    ruedas.forEach((r) => {
      r.rotation.y += k.vel * 0.05;
    });
    chispas.forEach((c) => {
      c.visible = k.chispas > 0;
      c.material = brillo(k.chispas === 2 ? 0xff9f1c : 0x4cc9f0);
      c.scale.setScalar(0.7 + 0.5 * Math.abs(Math.sin(t * 30)));
    });
    fuego.visible = k.turbo > 0;
    fuego.scale.setScalar(0.8 + 0.3 * Math.abs(Math.sin(t * 25)));
  };
  return raiz;
}
