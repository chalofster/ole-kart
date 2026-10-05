import { diferenciaAngular } from './pista.js';

// Caras de los personajes, de la menos a la más importante.
export const CARAS = ['normal', 'decidida', 'feliz', 'sorpresa', 'mareo'];
export const GESTO = { feliz: 1, parpadeo: 0.12, parpadeoMin: 2, parpadeoMax: 5, inclinacionMax: (15 * Math.PI) / 180 };

const entreParpadeos = (azar) => GESTO.parpadeoMin + (GESTO.parpadeoMax - GESTO.parpadeoMin) * azar();

export function crearGestos(azar = Math.random) {
  return { azar, feliz: 0, cerrado: 0, hastaParpadeo: entreParpadeos(azar), inclinacion: 0, rumbo: null };
}

// Cara feliz por un rato: al romper una caja o al elegir el personaje.
export function alegrar(g, segundos = GESTO.feliz) {
  g.feliz = Math.max(g.feliz, segundos);
}

// Si pasan varias cosas a la vez, gana la de más arriba.
export function caraDelKart(k, g) {
  if (k.trompo > 0) return 'mareo';
  if (k.enAire) return 'sorpresa';
  if (k.turbo > 0 || k.disco > 0 || g.feliz > 0) return 'feliz';
  if (k.derrape) return 'decidida';
  return 'normal';
}

// Avanza los gestos de un kart. Con dt = 0 (pausa) nada cambia.
export function pasoGestos(g, k, eventos, dt) {
  if (dt > 0) {
    if (eventos.includes('caja')) alegrar(g);
    g.feliz = Math.max(0, g.feliz - dt);
    g.cerrado = Math.max(0, g.cerrado - dt);
    g.hastaParpadeo -= dt;
    if (g.hastaParpadeo <= 0) {
      g.cerrado = GESTO.parpadeo;
      g.hastaParpadeo = entreParpadeos(g.azar);
    }
    // La cabeza se inclina hacia el lado al que gira el kart (positivo: a la izquierda), sin saltos.
    const giro = g.rumbo === null ? 0 : diferenciaAngular(g.rumbo, k.rumbo) / dt;
    g.rumbo = k.rumbo;
    const objetivo = Math.max(-GESTO.inclinacionMax, Math.min(GESTO.inclinacionMax, giro * 0.2));
    g.inclinacion += (objetivo - g.inclinacion) * Math.min(1, dt * 8);
  }
  const cara = caraDelKart(k, g);
  return { cara, ojosCerrados: cara === 'normal' && g.cerrado > 0, inclinacion: g.inclinacion };
}
