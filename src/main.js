import * as THREE from 'three';
import './estilo.css';
import { crearEntradas } from './entrada/mandos.js';
import { crearSonido } from './sonido/sonido.js';
import { leerCancion } from './sonido/cancion.js';
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

  // El navegador solo deja sonar el audio después de un clic o una tecla; los botones de los
  // controles no cuentan. Mientras siga bloqueado, un 🔇 en todas las pantallas invita a tocarlo.
  const sonido = crearSonido();
  const mudo = document.getElementById('mudo');
  window.addEventListener('pointerdown', () => sonido.reanudar());
  window.addEventListener('keydown', () => sonido.reanudar());

  const juego = crearJuego({ renderer, capa, entradas: crearEntradas(window), sonido });
  // La canción propia elegida en otra ocasión, guardada en este computador.
  leerCancion().then((archivo) => {
    if (archivo) sonido.ponerCancion(archivo);
  });
  window.addEventListener('blur', () => juego.pausar());
  let antes = performance.now();
  renderer.setAnimationLoop((ahora) => {
    const dt = Math.min(0.1, (ahora - antes) / 1000);
    antes = ahora;
    juego.cuadro(dt);
    mudo.classList.toggle('oculto', sonido.activo());
  });
  if (import.meta.env.DEV) window.__ole = { juego };
}
