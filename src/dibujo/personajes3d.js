import * as THREE from 'three';
import { mate, malla } from './comun.js';

// Todos los personajes miran hacia +x local (el frente del kart).
const esfera = (r) => new THREE.SphereGeometry(r, 14, 10);

function ojos(g, alto, adelante, separacion, radio = 0.06) {
  for (const s of [-1, 1]) g.add(malla(esfera(radio), mate(0x111111), adelante, alto, s * separacion));
}

function persona(c) {
  const g = new THREE.Group();
  const torso = c.chaqueta?.color ?? c.ropa;
  g.add(malla(new THREE.CylinderGeometry(0.32, 0.4, 0.8, 12), mate(torso), 0, 0.4, 0));
  if (c.chaqueta) {
    // Franjas negras en V sobre el pecho.
    for (const s of [-1, 1]) {
      const franja = malla(new THREE.BoxGeometry(0.05, 0.55, 0.07), mate(c.chaqueta.franjas), 0.36, 0.45, s * 0.12);
      franja.rotation.x = s * 0.45;
      g.add(franja);
    }
  }
  if (c.falda) {
    g.add(malla(new THREE.ConeGeometry(0.75, 0.7, 14), mate(c.falda.color), 0, 0.05, 0));
    if (c.falda.lunares) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.add(malla(esfera(0.07), mate(c.falda.lunares), Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46));
      }
    }
  }
  for (const s of [-1, 1]) {
    const brazo = malla(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8), mate(torso), 0.35, 0.55, s * 0.32);
    brazo.rotation.z = -1.1;
    g.add(brazo);
  }
  const cabeza = new THREE.Group();
  cabeza.position.y = 1.1;
  g.add(cabeza);
  cabeza.add(malla(esfera(0.36), mate(c.piel)));
  ojos(cabeza, 0.05, 0.32, 0.13);
  for (const s of [-1, 1]) cabeza.add(malla(esfera(0.06), mate(0xf4978e), 0.3, -0.09, s * 0.2));
  const pelo = malla(new THREE.SphereGeometry(0.39, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mate(c.pelo), -0.04, 0.03, 0);
  pelo.rotation.z = 0.35;
  cabeza.add(pelo);
  if (c.peinado === 'mono') cabeza.add(malla(esfera(0.2), mate(c.pelo), -0.3, 0.25, 0));
  if (c.peinado === 'largo') cabeza.add(malla(new THREE.BoxGeometry(0.2, 0.6, 0.66), mate(c.pelo), -0.28, -0.25, 0));
  if (c.adorno === 'flor') cabeza.add(malla(esfera(0.11), mate(0xff4d6d), -0.2, 0.32, 0.22));
  if (c.adorno === 'nota') {
    cabeza.add(malla(esfera(0.08), mate(0x111111), -0.1, 0.38, 0.25));
    cabeza.add(malla(new THREE.CylinderGeometry(0.02, 0.02, 0.25), mate(0x111111), -0.03, 0.5, 0.25));
  }
  return g;
}

function gato(c) {
  const g = new THREE.Group();
  g.add(malla(esfera(0.42), mate(c.color), 0, 0.35, 0));
  const cabeza = new THREE.Group();
  cabeza.position.y = 1;
  g.add(cabeza);
  cabeza.add(malla(esfera(0.4), mate(c.color)));
  for (const s of [-1, 1]) {
    const oreja = malla(new THREE.ConeGeometry(0.13, 0.3, 4), mate(c.color), 0, 0.38, s * 0.22);
    oreja.rotation.x = s * 0.3;
    cabeza.add(oreja);
  }
  ojos(cabeza, 0.06, 0.35, 0.14);
  cabeza.add(malla(esfera(0.06), mate(0xff8fab), 0.39, -0.05, 0));
  const cola = malla(new THREE.CylinderGeometry(0.06, 0.06, 0.8), mate(c.color), -0.45, 0.6, 0);
  cola.rotation.z = 0.6;
  g.add(cola);
  return g;
}

function pajaro(c) {
  const g = new THREE.Group();
  const cuerpo = malla(esfera(0.45), mate(c.color), 0, 0.5, 0);
  cuerpo.scale.set(1, 1.2, 1);
  g.add(cuerpo);
  const cabeza = new THREE.Group();
  cabeza.position.y = 1.15;
  g.add(cabeza);
  cabeza.add(malla(esfera(0.33), mate(c.color)));
  ojos(cabeza, 0.06, 0.29, 0.12);
  const pico = malla(new THREE.ConeGeometry(0.1, 0.3, 8), mate(0xffb703), 0.42, -0.04, 0);
  pico.rotation.z = -Math.PI / 2;
  cabeza.add(pico);
  for (let i = -1; i <= 1; i++) {
    const pluma = malla(new THREE.ConeGeometry(0.05, 0.25, 6), mate(c.color), -0.05 + i * 0.08, 0.38, 0);
    pluma.rotation.z = i * 0.3;
    cabeza.add(pluma);
  }
  for (const s of [-1, 1]) {
    const ala = malla(esfera(0.25), mate(c.color), 0, 0.55, s * 0.45);
    ala.scale.set(1.2, 0.5, 0.3);
    g.add(ala);
  }
  return g;
}

function toro(c) {
  const g = new THREE.Group();
  g.add(malla(esfera(0.48), mate(c.color), 0, 0.4, 0));
  g.add(malla(new THREE.ConeGeometry(0.42, 0.35, 12), mate(c.panuelo), 0, 0.8, 0));
  const cabeza = new THREE.Group();
  cabeza.position.y = 1.15;
  g.add(cabeza);
  const craneo = malla(esfera(0.4), mate(c.color));
  craneo.scale.set(1, 0.9, 1);
  cabeza.add(craneo);
  cabeza.add(malla(esfera(0.22), mate(0xd4a373), 0.32, -0.12, 0));
  ojos(cabeza, 0.1, 0.33, 0.16);
  for (const s of [-1, 1]) {
    const cuerno = malla(new THREE.ConeGeometry(0.07, 0.35, 8), mate(0xf8f9fa), 0, 0.32, s * 0.36);
    cuerno.rotation.x = s * 0.9;
    cabeza.add(cuerno);
  }
  return g;
}

function calabaza(c) {
  const g = new THREE.Group();
  g.add(malla(new THREE.CylinderGeometry(0.3, 0.35, 0.6, 10), mate(0x2d6a4f), 0, 0.3, 0));
  const cabeza = new THREE.Group();
  cabeza.position.y = 1;
  g.add(cabeza);
  const bola = malla(esfera(0.5), mate(c.color));
  bola.scale.set(1.1, 0.85, 1.1);
  cabeza.add(bola);
  ojos(cabeza, 0.08, 0.5, 0.17, 0.07);
  cabeza.add(malla(new THREE.BoxGeometry(0.05, 0.06, 0.3), mate(0x111111), 0.52, -0.12, 0));
  cabeza.add(malla(new THREE.CylinderGeometry(0.05, 0.07, 0.25), mate(0x2d6a4f), 0, 0.5, 0));
  return g;
}

function fantasma(c) {
  const g = new THREE.Group();
  g.add(malla(new THREE.CylinderGeometry(0.42, 0.5, 0.8, 14), mate(c.color), 0, 0.4, 0));
  g.add(malla(esfera(0.43), mate(c.color), 0, 0.85, 0));
  ojos(g, 0.95, 0.38, 0.14, 0.08);
  for (const s of [-1, 1]) g.add(malla(esfera(0.13), mate(c.color), 0.15, 0.55, s * 0.47));
  return g;
}

const TIPOS = { persona, gato, pajaro, toro, calabaza, fantasma };

export function crearPersonaje(cuerpo) {
  return TIPOS[cuerpo.tipo](cuerpo);
}
