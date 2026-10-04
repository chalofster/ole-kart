import {
  MEDIO_ANCHO, VALLA, RAMPA, proyectar, puntoEn, alturaDelPiso, diferencia, diferenciaAngular,
} from './pista.js';

// Manejo arcade: iguales para todos. Velocidades en unidades por segundo.
export const KART = {
  velMax: 24, aceleracion: 14, frenado: 30, roce: 8, retroMax: 6,
  giro: 1.9, giroDerrape: 2.5, radio: 1.2,
  fueraDePista: 0.55, turboExtra: 0.35, rebote: 0.6, gravedad: 30,
};
export const DERRAPE = { azul: 1, naranja: 2, turboAzul: 0.6, turboNaranja: 1.2, velMinima: 8 };
export const TURBO_PISO = { duracion: 1, largo: 4, medioAncho: 4 };

export function crearKart(pista, s, lateral = 0) {
  const p = puntoEn(pista, s, lateral);
  const pr = proyectar(pista, p.x, p.y);
  return {
    x: p.x, y: p.y, rumbo: p.rumbo, vel: 0, h: 0, vh: 0, enAire: false,
    derrape: null, chispas: 0, turbo: 0, indice: pr.indice, s: pr.s, lateral: pr.lateral,
  };
}

// Derrape: se arma girando con el gatillo apretado y, al soltarlo, la carga se cambia por turbo.
export function actualizarDerrape(k, int, dt, eventos = []) {
  if (k.derrape) {
    if (!int.derrapa) {
      const { carga } = k.derrape;
      const turbo = carga >= DERRAPE.naranja ? DERRAPE.turboNaranja : carga >= DERRAPE.azul ? DERRAPE.turboAzul : 0;
      if (turbo > 0) {
        k.turbo = Math.max(k.turbo, turbo);
        eventos.push('turbo');
      }
      k.derrape = null;
    } else if (k.vel < DERRAPE.velMinima || k.enAire) {
      k.derrape = null;
    } else {
      k.derrape.carga += dt;
    }
  } else if (int.derrapa && !k.enAire && k.vel >= DERRAPE.velMinima && Math.abs(int.giro) > 0.3) {
    k.derrape = { dir: Math.sign(int.giro), carga: 0 };
  }
  const antes = k.chispas;
  const carga = k.derrape ? k.derrape.carga : 0;
  k.chispas = !k.derrape ? 0 : carga >= DERRAPE.naranja ? 2 : carga >= DERRAPE.azul ? 1 : 0;
  if (k.chispas > antes) eventos.push('chispas');
  return eventos;
}

export function pasoKart(k, int, pista, dt, factor = 1) {
  const eventos = [];
  const turboAntes = k.turbo;
  const fuera = !k.enAire && Math.abs(k.lateral) > MEDIO_ANCHO;
  let vMax = KART.velMax * factor * (fuera ? KART.fueraDePista : 1);
  if (k.turbo > 0) vMax *= 1 + KART.turboExtra;

  if (k.vel > vMax) k.vel = Math.max(vMax, k.vel - KART.frenado * dt);
  else if (k.turbo > 0) k.vel = Math.min(vMax, k.vel + KART.aceleracion * 3 * dt);
  else if (int.frena) k.vel = Math.max(-KART.retroMax, k.vel - KART.frenado * dt);
  else if (int.acelera) k.vel = Math.min(vMax, k.vel + KART.aceleracion * dt);
  else k.vel = Math.sign(k.vel) * Math.max(0, Math.abs(k.vel) - KART.roce * dt);

  actualizarDerrape(k, int, dt, eventos);

  // Quieto no gira; en reversa el giro se invierte, como un auto.
  const agarre = Math.min(1, Math.abs(k.vel) / 6);
  let giro = int.giro * KART.giro;
  if (k.derrape) {
    const haciaAdentro = (int.giro * k.derrape.dir + 1) / 2;
    giro = k.derrape.dir * KART.giroDerrape * (0.35 + 0.65 * haciaAdentro);
  }
  if (k.enAire) giro *= 0.3;
  k.rumbo += giro * agarre * (k.vel < 0 ? -1 : 1) * dt;

  k.x += Math.cos(k.rumbo) * k.vel * dt;
  k.y += Math.sin(k.rumbo) * k.vel * dt;

  const p = proyectar(pista, k.x, k.y, k.indice);
  k.indice = p.indice;
  k.s = p.s;
  k.lateral = p.lateral;

  const piso = alturaDelPiso(pista, p.s, p.lateral);
  if (k.enAire) {
    k.vh -= KART.gravedad * dt;
    k.h += k.vh * dt;
    if (k.h <= piso) {
      k.h = piso;
      k.vh = 0;
      k.enAire = false;
      eventos.push('aterriza');
    }
  } else if (k.h > piso + 0.05) {
    k.enAire = true;
    k.vh = Math.max(0, k.vel) * (RAMPA.alto / RAMPA.largo);
    eventos.push('salto');
  } else {
    k.h = piso;
  }

  // Valla: el kart vuelve al límite y, si iba hacia ella, rebota y pierde velocidad.
  const limite = VALLA - KART.radio;
  if (Math.abs(k.lateral) > limite) {
    const lado = Math.sign(k.lateral);
    const m = p.muestra;
    const exceso = Math.abs(k.lateral) - limite;
    k.x -= m.nx * lado * exceso;
    k.y -= m.ny * lado * exceso;
    k.lateral = lado * limite;
    const relativo = diferenciaAngular(m.rumbo, k.rumbo);
    if (k.vel > 0 && Math.abs(relativo) < Math.PI / 2 && relativo * lado > 0.02) {
      k.rumbo = m.rumbo - relativo * 0.5;
      k.vel *= KART.rebote;
      eventos.push('choque');
    }
  }

  if (!k.enAire && Math.abs(k.lateral) < TURBO_PISO.medioAncho) {
    for (const t of pista.turbos) {
      const d = diferencia(t, k.s, pista.largo);
      if (d >= 0 && d <= TURBO_PISO.largo) k.turbo = Math.max(k.turbo, TURBO_PISO.duracion);
    }
  }
  if (k.turbo > 0 && turboAntes <= 0 && !eventos.includes('turbo')) eventos.push('turbo');
  k.turbo = Math.max(0, k.turbo - dt);
  return eventos;
}
