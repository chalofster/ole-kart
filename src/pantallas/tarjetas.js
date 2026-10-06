import { PISTAS } from '../logica/pistas.js';
import { crearPista } from '../logica/pista.js';
import { AMBIENTES } from '../dibujo/ambientes/index.js';
import { el } from './dom.js';

const hex = (color) => `#${color.toString(16).padStart(6, '0')}`;

// Trazo SVG del recorrido visto desde arriba, a escala y centrado dentro de ancho × alto, con el norte arriba.
// cada: se usa una de cada tantas muestras. meta: dónde queda la meta en el dibujo.
export function trazoDelRecorrido(muestras, ancho, alto, margen, cada = 4) {
  const xs = muestras.map((m) => m.x);
  const ys = muestras.map((m) => m.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const escala = Math.min((ancho - 2 * margen) / (x1 - x0), (alto - 2 * margen) / (y1 - y0));
  const dx = (ancho - (x1 - x0) * escala) / 2;
  const dy = (alto - (y1 - y0) * escala) / 2;
  const punto = (m) => [+(dx + (m.x - x0) * escala).toFixed(1), +(dy + (y1 - m.y) * escala).toFixed(1)];
  const pasos = muestras.filter((_, i) => i % cada === 0).map(punto);
  return { d: `M${pasos.map(([x, y]) => `${x} ${y}`).join('L')}Z`, meta: punto(muestras[0]) };
}

// El dibujo de cada pista se arma una vez: crearPista toma unos milisegundos.
const dibujos = new Map();
function dibujoDe(p) {
  if (!dibujos.has(p.id)) {
    const a = AMBIENTES[p.id];
    const { d, meta } = trazoDelRecorrido(crearPista(p.recorrido).muestras, 160, 100, 12);
    dibujos.set(p.id, `<svg viewBox="0 0 160 100">
      <rect width="160" height="100" rx="10" fill="${hex(a.suelo)}"/>
      <path d="${d}" fill="none" stroke="${hex(a.bordes[0])}" stroke-width="9" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="${hex(a.camino)}" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="${meta[0]}" cy="${meta[1]}" r="5" fill="#fff" stroke="#111" stroke-width="2"/></svg>`);
  }
  return dibujos.get(p.id);
}

// Una tarjeta por pista (su recorrido con los colores de su ambiente, ícono y nombre) y al final 🎲.
export function crearTarjetas() {
  const grupo = el('div', 'opciones pista');
  for (const p of PISTAS) {
    const tarjeta = el('div', 'opcion tarjeta', `${dibujoDe(p)}<div class="icono">${p.icono}</div><div class="nombre">${p.nombre}</div>`);
    tarjeta.style.background = hex(AMBIENTES[p.id].cielo);
    grupo.append(tarjeta);
  }
  grupo.append(el('div', 'opcion tarjeta', '<div class="dado">🎲</div>'));
  return grupo;
}
