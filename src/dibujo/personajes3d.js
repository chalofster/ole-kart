import { materialCara } from './caras.js';
import * as personas from './personajes/personas.js';
import * as animales from './personajes/animales.js';
import * as fantasia from './personajes/fantasia.js';

// Cada tipo de cuerpo de las fichas tiene su constructor.
const CONSTRUCTORES = { ...personas, ...animales, ...fantasia };

export function crearPersonaje(cuerpo) {
  return CONSTRUCTORES[cuerpo.tipo](cuerpo);
}

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
  ponerCara(p, 'feliz', false);
  p.brazos.forEach((b) => posarBrazo(b, puesto === 0 ? 'baile' : 'aplauso', t));
  p.cabeza.rotation.set(puesto === 0 ? Math.sin(t * 6) * 0.2 : 0, 0, 0);
  moverExtras(p, t);
}
