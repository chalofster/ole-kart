import { puntoEn } from './pista.js';

// Lugares a un costado de la pista que quedan lejos de todas sus partes. lado: 1 izquierda, -1 derecha.
export function lugaresLibres(pista, { cada, distancia, holgura, lado }) {
  const lugares = [];
  for (let s = 0; s < pista.largo; s += cada) {
    const p = puntoEn(pista, s, distancia * lado);
    const libre = pista.muestras.every((m) => (m.x - p.x) ** 2 + (m.y - p.y) ** 2 >= holgura ** 2);
    if (libre) lugares.push({ x: p.x, y: p.y, rumbo: p.rumbo, s });
  }
  return lugares;
}

// Rectángulo que encierra el recorrido: para centrar el suelo y ubicar lo que va lejos (noria, mar, faro).
export function limites(pista) {
  const xs = pista.muestras.map((m) => m.x);
  const ys = pista.muestras.map((m) => m.y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}
