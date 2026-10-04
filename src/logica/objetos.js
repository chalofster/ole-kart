import { puntoEn } from './pista.js';
import { KART } from './kart.js';

// Objetos originales de Olé Kart. Duraciones en segundos.
export const TIPOS = ['cascara', 'calabaza', 'aji', 'disco'];
export const ICONOS = { cascara: '🍌', calabaza: '🎃', aji: '🌶️', disco: '🪩' };
export const OBJ = {
  ruleta: 1, vuelveCaja: 2, trompo: 1, proteccion: 1.5, aji: 1.5, disco: 6, discoExtra: 1.15,
  calabazaVel: 1.4, calabazaVida: 6, cascaraAtras: 2.5, cascaraDueno: 1, maxCascaras: 10,
  alcance: KART.radio + 0.8,
};
// Filas de cajas: distancia por la pista y desplazamiento lateral de cada caja.
export const FILAS = [35, 410, 660, 790];
export const LATERALES = [-4.5, -1.5, 1.5, 4.5];
// Probabilidades en el orden de TIPOS, según el puesto: más ayuda para quien va atrás.
export const REPARTO = {
  primero: [0.5, 0.4, 0.1, 0],
  medio: [0.25, 0.3, 0.3, 0.15],
  atras: [0.1, 0.2, 0.4, 0.3],
};

export function sortearObjeto(puesto, azar) {
  const p = puesto === 1 ? REPARTO.primero : puesto <= 5 ? REPARTO.medio : REPARTO.atras;
  let r = azar();
  for (let i = 0; i < TIPOS.length; i++) {
    r -= p[i];
    if (r < 0) return TIPOS[i];
  }
  return TIPOS[p.findLastIndex((x) => x > 0)];
}

export function crearObjetos(pista) {
  const cajas = FILAS.flatMap((s) => LATERALES.map((lateral) => {
    const p = puntoEn(pista, s, lateral);
    return { s, lateral, x: p.x, y: p.y, vuelve: 0 };
  }));
  return { cajas, calabazas: [], cascaras: [] };
}

export function prepararKart(k) {
  return Object.assign(k, { objeto: null, ruleta: 0, trompo: 0, proteccion: 0, disco: 0 });
}

const toca = (a, b, distancia = OBJ.alcance) => Math.hypot(a.x - b.x, a.y - b.y) < distancia;

// Trompo suave: no afecta a quien tiene la bola disco, está protegido o ya gira. La ruleta y el objeto se conservan.
export function golpear(k, eventos) {
  if (k.disco > 0 || k.proteccion > 0 || k.trompo > 0) return false;
  Object.assign(k, { trompo: OBJ.trompo, vel: k.vel * 0.5, derrape: null, chispas: 0, turbo: 0 });
  eventos.push('golpe');
  return true;
}

export function usarObjeto(estado, k, pista, clase, eventos = []) {
  if (!k.objeto || k.ruleta > 0 || k.trompo > 0) return eventos;
  const tipo = k.objeto;
  k.objeto = null;
  if (tipo === 'aji') {
    k.turbo = Math.max(k.turbo, OBJ.aji);
    eventos.push('turbo');
  } else if (tipo === 'disco') {
    k.disco = OBJ.disco;
    eventos.push('disco');
  }
  return eventos;
}

// Avanza un paso: efectos de cada kart, cajas y choques con la bola disco.
export function pasoObjetos(estado, karts, pista, dt, azar, eventos) {
  karts.forEach((k, i) => {
    if (k.ruleta > 0) {
      k.ruleta -= dt;
      if (k.ruleta <= 0) {
        k.ruleta = 0;
        eventos[i].push('listo');
      }
    }
    if (k.trompo > 0) {
      k.trompo -= dt;
      if (k.trompo <= 0) {
        k.trompo = 0;
        k.proteccion = OBJ.proteccion;
      }
    } else if (k.proteccion > 0) k.proteccion = Math.max(0, k.proteccion - dt);
    if (k.disco > 0) k.disco = Math.max(0, k.disco - dt);
  });

  for (const caja of estado.cajas) {
    if (caja.vuelve > 0) {
      caja.vuelve = Math.max(0, caja.vuelve - dt);
      continue;
    }
    karts.forEach((k, i) => {
      if (caja.vuelve > 0 || k.enAire || !toca(k, caja)) return;
      caja.vuelve = OBJ.vuelveCaja;
      eventos[i].push('caja');
      if (k.objeto === null && !k.termino) {
        k.objeto = sortearObjeto(k.puesto, azar);
        k.ruleta = OBJ.ruleta;
      }
    });
  }

  karts.forEach((a) => {
    if (a.disco <= 0 || a.enAire) return;
    karts.forEach((b, j) => {
      if (b !== a && !b.enAire && toca(a, b, KART.radio * 2 + 0.2)) golpear(b, eventos[j]);
    });
  });
}
