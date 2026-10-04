import * as THREE from 'three';
import { mate, brillo, malla } from './comun.js';

const COLORES_CAJA = [0xff4d6d, 0xffd166, 0x4cc9f0, 0x80ed99];
const cubo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
const bola = new THREE.SphereGeometry(0.7, 12, 10);
const tallo = new THREE.CylinderGeometry(0.08, 0.1, 0.35);
const ojo = new THREE.SphereGeometry(0.1, 6, 6);
const curva = new THREE.TorusGeometry(0.5, 0.18, 6, 12, Math.PI * 1.2);

function calabaza3D() {
  const g = new THREE.Group();
  const b = malla(bola, mate(0xff8c1a));
  b.scale.set(1.15, 0.9, 1.15);
  g.add(b);
  g.add(malla(tallo, mate(0x2d6a4f), 0, 0.75, 0));
  for (const z of [-0.25, 0.25]) g.add(malla(ojo, brillo(0xffd166), 0.75, 0.15, z));
  return g;
}

function cascara3D() {
  const m = malla(curva, mate(0xffe066));
  m.rotation.x = -Math.PI / 2;
  return m;
}

// Reutiliza las mallas: muestra tantas como objetos haya en la pista.
function coleccion(grupo, crear) {
  const mallas = [];
  return (cantidad) => {
    while (mallas.length < cantidad) {
      const m = crear();
      grupo.add(m);
      mallas.push(m);
    }
    mallas.forEach((m, i) => {
      m.visible = i < cantidad;
    });
    return mallas;
  };
}

// Cajas de colores que giran y flotan, calabazas que ruedan y cáscaras en el suelo.
export function crearObjetos3D(estado) {
  const grupo = new THREE.Group();
  const cajas = estado.cajas.map((c, i) => {
    const m = malla(cubo, brillo(COLORES_CAJA[i % COLORES_CAJA.length]), c.x, 1.3, -c.y);
    grupo.add(m);
    return m;
  });
  const calabazas = coleccion(grupo, calabaza3D);
  const cascaras = coleccion(grupo, cascara3D);
  return {
    grupo,
    actualizar(e, t) {
      e.cajas.forEach((c, i) => {
        const m = cajas[i];
        m.visible = c.vuelve <= 0;
        m.rotation.set(t * 0.9 + i, t * 1.5 + i, 0);
        m.position.y = 1.3 + Math.sin(t * 3 + i) * 0.2;
      });
      const mc = calabazas(e.calabazas.length);
      e.calabazas.forEach((c, i) => {
        mc[i].position.set(c.x, 0.65, -c.y);
        mc[i].rotation.y = t * 10;
      });
      const mk = cascaras(e.cascaras.length);
      e.cascaras.forEach((c, i) => {
        mk[i].position.set(c.x, 0.2, -c.y);
      });
    },
  };
}
