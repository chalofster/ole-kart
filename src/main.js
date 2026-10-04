import * as THREE from 'three';
import './estilo.css';
import { crearEntradas } from './entrada/mandos.js';
import { crearSonido } from './sonido/sonido.js';
import { crearJuego } from './juego.js';

const lienzo = document.getElementById('lienzo');
const capa = document.getElementById('capa');

let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true });
} catch {
  capa.innerHTML = '<div class="aviso">⚠️🖥️</div>';
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setScissorTest(true);
  const ajustar = () => renderer.setSize(window.innerWidth, window.innerHeight, false);
  ajustar();
  window.addEventListener('resize', ajustar);

  // El navegador solo deja sonar el audio después de un clic o una tecla.
  const sonido = crearSonido();
  window.addEventListener('pointerdown', () => sonido.reanudar());
  window.addEventListener('keydown', () => sonido.reanudar());

  const juego = crearJuego({ renderer, capa, entradas: crearEntradas(window), sonido });
  window.addEventListener('blur', () => juego.pausar());
  let antes = performance.now();
  renderer.setAnimationLoop((ahora) => {
    const dt = Math.min(0.1, (ahora - antes) / 1000);
    antes = ahora;
    juego.cuadro(dt);
  });
  if (import.meta.env.DEV) window.__ole = { juego };
}
