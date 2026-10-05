import * as THREE from 'three';
import { TONOS } from './estilo.js';

// Caras al estilo de la bailarina del Tablao: ojos ovalados con brillo, cejas, mejillas rosadas y boca.
// Se dibujan en un lienzo transparente de 256 × 256 que cubre el frente de la cabeza.
const TAM = 256;
const OSCURO = '#2b1a12';
const BOCA = '#8d1b1b';
const LENGUA = '#f08080';
const MEJILLA = 'rgba(240, 128, 128, 0.55)';
const OJOS_X = [88, 168];
const OJOS_Y = 112;

function circulo(g, x, y, r, color) {
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function ovalo(g, x, y, rx, ry, color) {
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function trazo(g, color, ancho, dibujar) {
  g.strokeStyle = color;
  g.lineWidth = ancho;
  g.lineCap = 'round';
  g.beginPath();
  dibujar();
  g.stroke();
}

export function dibujarCara(g, cara, cerrados) {
  g.clearRect(0, 0, TAM, TAM);
  for (const x of [64, 192]) circulo(g, x, 150, 16, MEJILLA);
  // Cejas: la sorpresa las sube; la decidida baja la punta de adentro.
  const subir = cara === 'sorpresa' ? -14 : 0;
  const fruncir = cara === 'decidida' ? 10 : 0;
  for (const x of OJOS_X) {
    const centro = Math.sign(128 - x);
    trazo(g, OSCURO, 6, () => {
      g.moveTo(x - centro * 18, 78 + subir);
      g.lineTo(x + centro * 18, 78 + subir + fruncir);
    });
  }
  for (const x of OJOS_X) {
    if (cara === 'mareo') {
      trazo(g, OSCURO, 4, () => {
        for (let a = 0; a <= Math.PI * 4; a += 0.2) g.lineTo(x + Math.cos(a) * (2 + a * 1.3), OJOS_Y + Math.sin(a) * (2 + a * 1.3));
      });
    } else if (cerrados) {
      trazo(g, OSCURO, 5, () => g.arc(x, OJOS_Y - 6, 14, 0.15 * Math.PI, 0.85 * Math.PI));
    } else {
      const grande = cara === 'sorpresa' ? 1.3 : 1;
      const alto = cara === 'decidida' ? 0.75 : 1;
      ovalo(g, x, OJOS_Y, 13 * grande, 19 * grande * alto, OSCURO);
      circulo(g, x - 4 * grande, OJOS_Y - 7 * grande * alto, 5 * grande, '#ffffff');
    }
  }
  if (cara === 'feliz') {
    g.fillStyle = BOCA;
    g.beginPath();
    g.arc(128, 150, 26, 0, Math.PI);
    g.closePath();
    g.fill();
    g.fillStyle = LENGUA;
    g.beginPath();
    g.arc(128, 164, 11, 0, Math.PI);
    g.fill();
  } else if (cara === 'sorpresa') {
    ovalo(g, 128, 164, 12, 16, BOCA);
  } else if (cara === 'mareo') {
    trazo(g, BOCA, 6, () => {
      for (let x = 100; x <= 156; x += 2) g.lineTo(x, 162 + Math.sin((x - 100) / 6) * 5);
    });
  } else if (cara === 'decidida') {
    trazo(g, BOCA, 7, () => {
      g.moveTo(110, 160);
      g.lineTo(146, 156);
    });
    circulo(g, 144, 165, 7, LENGUA);
  } else {
    trazo(g, BOCA, 7, () => g.arc(128, 146, 22, 0.2 * Math.PI, 0.8 * Math.PI));
  }
}

const materiales = new Map();

// Sin navegador (pruebas en Node) no hay lienzo: el material existe pero queda invisible.
export function materialCara(cara, ojosCerrados = false) {
  const clave = `${cara}-${ojosCerrados}`;
  if (!materiales.has(clave)) {
    let mapa = null;
    if (typeof document !== 'undefined') {
      const lienzo = document.createElement('canvas');
      lienzo.width = TAM;
      lienzo.height = TAM;
      dibujarCara(lienzo.getContext('2d'), cara, ojosCerrados);
      mapa = new THREE.CanvasTexture(lienzo);
      mapa.colorSpace = THREE.SRGBColorSpace;
    }
    materiales.set(clave, new THREE.MeshToonMaterial({ map: mapa, transparent: true, opacity: mapa ? 1 : 0, gradientMap: TONOS }));
  }
  return materiales.get(clave);
}

// Parche del frente de la cabeza (mirando a +x): 60° a cada lado y 45° arriba y abajo.
export function geometriaCareta(radio) {
  return new THREE.SphereGeometry(radio * 1.012, 24, 16, Math.PI - Math.PI / 3, (2 * Math.PI) / 3, Math.PI / 4, Math.PI / 2);
}
