import * as THREE from 'three';
import { mate, malla } from './comun.js';
import { materialCara } from './caras.js';
import * as personas from './personajes/personas.js';

// Personajes con el estilo de dibujo animado; los demás usan todavía el dibujo simple de más abajo.
const NUEVOS = { flamenca: personas.flamenca, bailarin: personas.bailarin, pianista: personas.pianista };

export function ponerCara(p, cara, ojosCerrados = false) {
  p.careta.material = materialCara(cara, ojosCerrados);
}

// Brazo que cuelga del hombro, girado según la postura. lado: +1 o -1 según el costado.
function posarBrazo(b, pose, t) {
  const lado = b.position.z >= 0 ? 1 : -1;
  if (pose === 'arriba') b.rotation.set(lado * 0.35, 0, Math.PI);
  else if (pose === 'aletear') b.rotation.set(-lado * (0.9 + Math.sin(t * 25) * 0.5), 0, 0);
  else if (pose === 'aplauso') b.rotation.set(0, lado * (0.5 + Math.sin(t * 14) * 0.35), 1.4);
  else if (pose === 'baile') b.rotation.set(lado * 0.3, 0, Math.PI * 0.85 + Math.sin(t * 6 + lado) * 0.35);
  else b.rotation.set(0, lado * 0.15, 1.3);
}

function moverExtras(p, t) {
  const { cola, nota } = p.extras;
  if (cola) cola.rotation.x = Math.sin(t * 4) * 0.4;
  if (nota) {
    nota.position.y = nota.baseY + Math.sin(t * 3) * 0.05;
    nota.rotation.y = t * 1.5;
  }
}

// Manejando: manos al volante y cabeza que se inclina en las curvas; en el aire, brazos arriba;
// feliz, rebota (y el pájaro aletea); decidida, se inclina hacia la curva; mareada, la cabeza se bambolea.
export function animarPiloto(p, gesto, t) {
  if (!p.careta) return;
  const { cara, inclinacion } = gesto;
  ponerCara(p, cara, gesto.ojosCerrados);
  const pose = cara === 'sorpresa' ? 'arriba' : p.alas && cara === 'feliz' ? 'aletear' : 'volante';
  p.brazos.forEach((b) => posarBrazo(b, pose, t));
  if (cara === 'mareo') p.cabeza.rotation.set(Math.sin(t * 14) * 0.3, 0, Math.cos(t * 11) * 0.15);
  else p.cabeza.rotation.set(-inclinacion, 0, 0);
  p.rebote.rotation.x = cara === 'decidida' ? -inclinacion * 0.8 : 0;
  p.rebote.position.y = (cara === 'feliz' ? Math.abs(Math.sin(t * 12)) * 0.06 : 0) + (p.flota ? Math.sin(t * 2.5) * 0.05 : 0);
  moverExtras(p, t);
}

// En el podio, todos felices: el primero (puesto 0) baila con los brazos arriba y los otros aplauden.
export function animarPodio(p, puesto, t) {
  if (!p.careta) return;
  ponerCara(p, 'feliz', false);
  p.brazos.forEach((b) => posarBrazo(b, puesto === 0 ? 'baile' : 'aplauso', t));
  p.cabeza.rotation.set(puesto === 0 ? Math.sin(t * 6) * 0.2 : 0, 0, 0);
  moverExtras(p, t);
}

// Todos los personajes miran hacia +x local (el frente del kart).
const esfera = (r) => new THREE.SphereGeometry(r, 14, 10);

function ojos(g, alto, adelante, separacion, radio = 0.06) {
  for (const s of [-1, 1]) g.add(malla(esfera(radio), mate(0x111111), adelante, alto, s * separacion));
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

const TIPOS = { gato, pajaro, toro, calabaza, fantasma };

export function crearPersonaje(cuerpo) {
  return (NUEVOS[cuerpo.tipo] ?? TIPOS[cuerpo.tipo])(cuerpo);
}
