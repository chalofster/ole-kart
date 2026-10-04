import { crearKart, pasoKart, KART } from './kart.js';
import { diferencia } from './pista.js';

export const VUELTAS = 3;
export const CUENTA = 3;

// Parrilla detrás de la meta, de a dos por fila. El índice 0 parte adelante a la izquierda.
export function crearCarrera(pista, personajes, humanos = [], azar = Math.random) {
  const karts = personajes.map((id, i) => {
    const fila = Math.floor(i / 2);
    const k = crearKart(pista, pista.largo - 8 - fila * 6, i % 2 === 0 ? 3 : -3);
    const humano = humanos.includes(i);
    return Object.assign(k, {
      id, humano, ritmo: humano ? 1 : 0.92 + 0.08 * azar(),
      vuelta: 0, cp: 0, termino: false, tiempoFinal: null, contrario: 0, puesto: i + 1,
    });
  });
  return { pista, karts, tiempo: 0, cuenta: CUENTA, estado: 'cuenta', puestos: karts.map((_, i) => i) };
}

// cp es el siguiente control por cruzar: 0 = la meta antes de empezar, 1..N-1 = controles,
// N = la meta al final de la vuelta. Retroceder deshace el último control.
export function actualizarVueltas(k, sAntes, pista, eventos = []) {
  const L = pista.largo;
  const N = pista.controles.length;
  const avance = diferencia(sAntes, k.s, L);
  if (avance === 0 || Math.abs(avance) > 20) return eventos;
  const cruza = (control) => {
    const a = diferencia(sAntes, control, L);
    return avance > 0 ? a > 0 && a <= avance : a < 0 && a >= avance;
  };
  if (avance > 0) {
    if (cruza(pista.controles[k.cp % N])) {
      if (k.cp === 0) k.cp = 1;
      else if (k.cp < N) k.cp += 1;
      else {
        k.vuelta += 1;
        k.cp = 1;
        eventos.push(k.vuelta >= VUELTAS ? 'meta' : 'vuelta');
      }
    }
  } else if (k.cp >= 1 && cruza(pista.controles[(k.cp - 1) % N])) {
    k.cp -= 1;
  }
  return eventos;
}

// Distancia total recorrida, sin pasar del siguiente control (los atajos no adelantan).
export function recorrido(k, pista) {
  const L = pista.largo;
  const N = pista.controles.length;
  if (k.cp === 0) return k.vuelta * L + Math.min(0, diferencia(0, k.s, L));
  const desde = pista.controles[k.cp - 1];
  const hasta = k.cp === N ? L : pista.controles[k.cp];
  return k.vuelta * L + Math.min(hasta, Math.max(desde, k.s));
}

// Impulso para quien va atrás (todos) y ritmo de los rivales respecto del mejor niño.
export function factorVelocidad(k, propio, lider, mejorHumano, largo) {
  const limitar = (v) => Math.min(1, Math.max(0, v));
  let f = k.ritmo * (1 + 0.12 * limitar((lider - propio) / (largo / 2)));
  if (!k.humano && mejorHumano !== null) {
    const ventaja = propio - mejorHumano;
    if (ventaja > largo / 4) f *= 1 - 0.15 * limitar((ventaja - largo / 4) / (largo / 4));
    else if (ventaja < -largo / 4) f *= 1 + 0.1 * limitar((-ventaja - largo / 4) / (largo / 4));
  }
  return f;
}

export function separarKarts(karts) {
  const minimo = KART.radio * 2;
  for (let i = 0; i < karts.length; i++) {
    for (let j = i + 1; j < karts.length; j++) {
      const a = karts[i];
      const b = karts[j];
      if (Math.abs(a.h - b.h) > 1) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d >= minimo) continue;
      const nx = d > 1e-6 ? dx / d : 1;
      const ny = d > 1e-6 ? dy / d : 0;
      const empuje = (minimo - d) / 2;
      a.x -= nx * empuje;
      a.y -= ny * empuje;
      b.x += nx * empuje;
      b.y += ny * empuje;
      a.vel *= 0.98;
      b.vel *= 0.98;
    }
  }
}

export function actualizarContrario(k, pista, dt) {
  const m = pista.muestras[k.indice];
  const alReves = Math.cos(k.rumbo) * m.tx + Math.sin(k.rumbo) * m.ty < -0.3;
  k.contrario = alReves && k.vel > 2 && !k.enAire ? k.contrario + dt : 0;
}

export function ordenarPuestos(c) {
  const valor = c.karts.map((k) => recorrido(k, c.pista));
  c.puestos = c.karts.map((_, i) => i).sort((a, b) => {
    const ka = c.karts[a];
    const kb = c.karts[b];
    if (ka.termino && kb.termino) return ka.tiempoFinal - kb.tiempoFinal;
    if (ka.termino !== kb.termino) return ka.termino ? -1 : 1;
    return valor[b] - valor[a];
  });
  c.puestos.forEach((i, p) => {
    c.karts[i].puesto = p + 1;
  });
}

export function pasoCarrera(c, intenciones, dt) {
  const eventos = c.karts.map(() => []);
  if (c.estado === 'cuenta') {
    c.cuenta -= dt;
    if (c.cuenta <= 0) {
      c.cuenta = 0;
      c.estado = 'carrera';
    }
    return eventos;
  }
  c.tiempo += dt;
  const valores = c.karts.map((k) => recorrido(k, c.pista));
  const lider = Math.max(...valores);
  const deNinos = valores.filter((_, i) => c.karts[i].humano);
  const mejorHumano = deNinos.length ? Math.max(...deNinos) : null;
  c.karts.forEach((k, i) => {
    const sAntes = k.s;
    const factor = factorVelocidad(k, valores[i], lider, mejorHumano, c.pista.largo);
    eventos[i].push(...pasoKart(k, intenciones[i], c.pista, dt, factor));
    actualizarVueltas(k, sAntes, c.pista, eventos[i]);
    if (!k.termino && k.vuelta >= VUELTAS) {
      k.termino = true;
      k.tiempoFinal = c.tiempo;
    }
    actualizarContrario(k, c.pista, dt);
  });
  separarKarts(c.karts);
  ordenarPuestos(c);
  // Con niños, la carrera termina cuando ellos llegan; sin niños (simulación), cuando llegan todos.
  const quienes = c.karts.some((k) => k.humano) ? c.karts.filter((k) => k.humano) : c.karts;
  if (c.estado === 'carrera' && quienes.every((k) => k.termino)) c.estado = 'fin';
  return eventos;
}
