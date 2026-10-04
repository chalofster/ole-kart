import * as THREE from 'three';
import { lugaresLibres } from '../logica/decorado.js';
import { mate, brillo, malla } from './comun.js';

// Barrio de noche: casas con ventanas encendidas, faroles, calabazas sonrientes, luna y estrellas.
export function crearDecorado(pista, azar = Math.random) {
  const g = new THREE.Group();

  const colores = [0x6d597a, 0x355070, 0xb56576, 0x4a4e69, 0x7f5539];
  const cuerpo = new THREE.BoxGeometry(8, 6, 8);
  const techo = new THREE.ConeGeometry(6.5, 4, 4);
  const ventana = new THREE.BoxGeometry(1.4, 1.6, 0.2);
  lugaresLibres(pista, { cada: 32, distancia: 24, holgura: 18, lado: -1 }).forEach((l, i) => {
    const casa = new THREE.Group();
    casa.position.set(l.x, 0, -l.y);
    casa.rotation.y = l.rumbo;
    casa.add(malla(cuerpo, mate(colores[i % colores.length]), 0, 3, 0));
    const t = malla(techo, mate(0x2b2d42), 0, 8, 0);
    t.rotation.y = Math.PI / 4;
    casa.add(t);
    // La pista queda a la izquierda de la casa: z local negativo.
    for (const x of [-2, 2]) {
      for (const y of [2.2, 4.4]) casa.add(malla(ventana, brillo(azar() < 0.8 ? 0xffd166 : 0x22223b), x, y, -4.05));
    }
    g.add(casa);
  });

  const poste = new THREE.CylinderGeometry(0.15, 0.2, 4.5);
  const foco = new THREE.SphereGeometry(0.45, 10, 8);
  for (const lado of [1, -1]) {
    lugaresLibres(pista, { cada: 40, distancia: 12, holgura: 11.5, lado }).forEach((l) => {
      g.add(malla(poste, mate(0x2b2d42), l.x, 2.25, -l.y));
      g.add(malla(foco, brillo(0xffe8a3), l.x, 4.6, -l.y));
    });
  }

  const calabaza = new THREE.SphereGeometry(1, 12, 10);
  const ojo = new THREE.SphereGeometry(0.16, 6, 6);
  const tallo = new THREE.CylinderGeometry(0.1, 0.12, 0.5);
  lugaresLibres(pista, { cada: 50, distancia: 15, holgura: 13, lado: 1 }).forEach((l) => {
    const c = new THREE.Group();
    c.position.set(l.x, 0.8, -l.y);
    c.rotation.y = l.rumbo;
    const bola = malla(calabaza, mate(0xff8c1a));
    bola.scale.set(1.2, 0.85, 1.2);
    c.add(bola);
    c.add(malla(tallo, mate(0x2d6a4f), 0, 0.95, 0));
    // La pista queda a la derecha de la calabaza: z local positivo.
    for (const x of [-0.35, 0.35]) c.add(malla(ojo, brillo(0xffd166), x, 0.2, 1));
    g.add(c);
  });

  const luna = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false }));
  luna.position.set(-250, 160, -380);
  g.add(luna);
  const estrellas = [];
  for (let i = 0; i < 500; i++) {
    const a = azar() * Math.PI * 2;
    const e = 0.15 + azar() * 1.2;
    estrellas.push(95 + Math.cos(a) * Math.cos(e) * 600, Math.sin(e) * 600, -75 + Math.sin(a) * Math.cos(e) * 600);
  }
  const cielo = new THREE.BufferGeometry();
  cielo.setAttribute('position', new THREE.Float32BufferAttribute(estrellas, 3));
  g.add(new THREE.Points(cielo, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false })));
  return g;
}
