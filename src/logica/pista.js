// La pista es una curva central cerrada con ancho fijo, muestreada cada ~1 unidad.
// Coordenadas lógicas (x, y) sobre el piso; el dibujo las pasa a Three.js como (x, altura, -y).

export const MEDIO_ANCHO = 7;          // medio ancho del camino
export const VALLA = 10.5;             // distancia de cada valla a la curva central
export const RAMPA = { largo: 6, alto: 1.5 };
export const PUNTOS_DE_CONTROL = 16;

// "Noche de Thriller", en sentido antihorario. El primer punto es la meta.
// Forma revisada: radio mínimo ~12 (la horquilla), vallas sin pliegues, partes separadas por más de 37.
export const NOCHE = {
  puntos: [
    [40, 0], [90, 0], [140, 0], [192, 7], [226, 42], [230, 98], [200, 134], [150, 150],
    [95, 152], [40, 150], [-15, 146], [-38, 136], [-48, 114], [-38, 91], [-15, 81],
    [10, 81], [48, 81], [72, 81], [86, 75], [92, 61], [86, 48], [72, 42], [48, 42],
    [10, 42], [-20, 42], [-35, 36], [-41, 21], [-35, 6], [-20, 0], [5, 0],
  ],
  turbos: [[110, 0], [130, 151], [20, 42]],
  rampa: [70, 151],
};

export function diferencia(desde, hasta, largo) {
  let d = (hasta - desde) % largo;
  if (d > largo / 2) d -= largo;
  else if (d <= -largo / 2) d += largo;
  return d;
}

export function diferenciaAngular(desde, hasta) {
  return diferencia(desde, hasta, 2 * Math.PI);
}

// Catmull-Rom centrípeta (Barry y Goldman): no forma rulos aunque los puntos estén a distancias distintas.
function catmullRom(p0, p1, p2, p3, u) {
  const paso = (a, b) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])) || 1e-6;
  const t0 = 0;
  const t1 = t0 + paso(p0, p1);
  const t2 = t1 + paso(p1, p2);
  const t3 = t2 + paso(p2, p3);
  const t = t1 + u * (t2 - t1);
  const mezcla = (a, b, ta, tb) => [0, 1].map((k) => ((tb - t) * a[k] + (t - ta) * b[k]) / (tb - ta));
  const a1 = mezcla(p0, p1, t0, t1);
  const a2 = mezcla(p1, p2, t1, t2);
  const a3 = mezcla(p2, p3, t2, t3);
  return mezcla(mezcla(a1, a2, t0, t2), mezcla(a2, a3, t1, t3), t1, t2);
}

export function crearPista(def) {
  const { puntos } = def;
  const total = puntos.length;
  const fina = [];
  for (let i = 0; i < total; i++) {
    const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((k) => puntos[(i + k + total) % total]);
    for (let j = 0; j < 40; j++) fina.push(catmullRom(p0, p1, p2, p3, j / 40));
  }
  const acumulado = [0];
  for (let i = 1; i <= fina.length; i++) {
    const a = fina[i - 1];
    const b = fina[i % fina.length];
    acumulado.push(acumulado[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const largo = acumulado[fina.length];
  const cantidad = Math.round(largo);
  const paso = largo / cantidad;

  const muestras = [];
  let k = 0;
  for (let i = 0; i < cantidad; i++) {
    const s = i * paso;
    while (acumulado[k + 1] < s) k++;
    const a = fina[k];
    const b = fina[(k + 1) % fina.length];
    const f = (s - acumulado[k]) / (acumulado[k + 1] - acumulado[k] || 1);
    muestras.push({ x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, s });
  }
  muestras.forEach((m, i) => {
    const sig = muestras[(i + 1) % cantidad];
    const ant = muestras[(i - 1 + cantidad) % cantidad];
    const tx = sig.x - ant.x;
    const ty = sig.y - ant.y;
    const l = Math.hypot(tx, ty);
    m.tx = tx / l;
    m.ty = ty / l;
    m.nx = -m.ty;
    m.ny = m.tx;
    m.rumbo = Math.atan2(m.ty, m.tx);
  });

  const pista = { muestras, largo, paso };
  pista.turbos = def.turbos.map(([x, y]) => proyectar(pista, x, y).s);
  pista.rampa = proyectar(pista, def.rampa[0], def.rampa[1]).s;
  pista.controles = Array.from({ length: PUNTOS_DE_CONTROL }, (_, i) => (i * largo) / PUNTOS_DE_CONTROL);
  return pista;
}

// Muestra más cercana al punto (búsqueda local si se indica un índice cercano), distancia
// recorrida s y desplazamiento lateral (positivo a la izquierda del sentido de marcha).
export function proyectar(pista, x, y, cerca = null) {
  const { muestras } = pista;
  const n = muestras.length;
  let mejor = 0;
  let dMejor = Infinity;
  const revisar = (i) => {
    const j = ((i % n) + n) % n;
    const m = muestras[j];
    const d = (m.x - x) ** 2 + (m.y - y) ** 2;
    if (d < dMejor) {
      dMejor = d;
      mejor = j;
    }
  };
  if (cerca === null) for (let i = 0; i < n; i++) revisar(i);
  else for (let i = cerca - 40; i <= cerca + 40; i++) revisar(i);
  const m = muestras[mejor];
  const dx = x - m.x;
  const dy = y - m.y;
  const s = (((m.s + dx * m.tx + dy * m.ty) % pista.largo) + pista.largo) % pista.largo;
  return { indice: mejor, s, lateral: dx * m.nx + dy * m.ny, muestra: m };
}

export function puntoEn(pista, s, lateral = 0) {
  const { muestras, largo } = pista;
  const n = muestras.length;
  const u = (((s % largo) + largo) % largo) / pista.paso;
  const i = Math.floor(u) % n;
  const f = u - Math.floor(u);
  const a = muestras[i];
  const b = muestras[(i + 1) % n];
  return {
    x: a.x + (b.x - a.x) * f + a.nx * lateral,
    y: a.y + (b.y - a.y) * f + a.ny * lateral,
    rumbo: a.rumbo,
    indice: i,
  };
}

// La rampa sube en línea recta y termina de golpe: el kart sale volando.
export function alturaDelPiso(pista, s, lateral) {
  const d = diferencia(pista.rampa, s, pista.largo);
  if (Math.abs(lateral) > MEDIO_ANCHO || d < 0 || d > RAMPA.largo) return 0;
  return (RAMPA.alto * d) / RAMPA.largo;
}
