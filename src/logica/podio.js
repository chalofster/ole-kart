import { crearEleccion, pulsarEleccion, avanzarEleccion, girando } from './eleccion.js';

// Botones del podio, de izquierda a derecha: 🔁 otra carrera en la misma pista, 🗺️ otra pista y 🏠 inicio.
export const BOTONES = ['otra', 'pistas', 'inicio'];

// pistas: cuántas hay; actual: índice de la pista que se acaba de correr.
export function crearOpcionesPodio(pistas, actual) {
  return { pistas, actual, marco: 0, eleccion: null };
}

const aLaCarrera = (o) => (o.eleccion.elegida === null ? null : { ir: 'carrera', pista: o.eleccion.elegida });

// Una pulsación en el podio. Devuelve qué hacer: { ir: 'carrera', pista }, { ir: 'inicio' } o null.
// opcion: el botón (o, con las pistas abiertas, la tarjeta) tocado con el mouse.
export function pulsarPodio(o, { izquierda = false, derecha = false, confirma = false, vuelve = false, opcion } = {}, azar = Math.random) {
  if (o.eleccion) {
    if (girando(o.eleccion)) return null;
    if (vuelve) {
      o.eleccion = null;
      return null;
    }
    pulsarEleccion(o.eleccion, { izquierda, derecha, confirma, opcion }, azar);
    return aLaCarrera(o);
  }
  if (vuelve) return { ir: 'inicio' };
  if (opcion !== undefined) {
    if (opcion < 0 || opcion >= BOTONES.length) return null;
    o.marco = opcion;
    confirma = true;
  }
  if (izquierda) o.marco = Math.max(0, o.marco - 1);
  if (derecha) o.marco = Math.min(BOTONES.length - 1, o.marco + 1);
  if (!confirma) return null;
  const boton = BOTONES[o.marco];
  if (boton === 'otra') return { ir: 'carrera', pista: o.actual };
  if (boton === 'inicio') return { ir: 'inicio' };
  o.eleccion = crearEleccion(o.pistas, { marco: o.actual, ultima: o.actual });
  return null;
}

// Un cuadro: las pulsaciones de todas las fuentes, en orden. Si una abre o cierra las pistas, el resto del
// cuadro no cuenta: así dos A al mismo tiempo sobre 🗺️ no eligen una pista sin mirar.
export function cuadroPodio(o, fuentes, azar = Math.random) {
  for (const f of fuentes) {
    const abiertas = o.eleccion !== null;
    const accion = pulsarPodio(o, f.recien, azar);
    if (accion || (o.eleccion !== null) !== abiertas) return accion;
  }
  return null;
}

// La ruleta de 🎲 avanza con el tiempo; al detenerse, lleva a la carrera.
export function avanzarPodio(o, dt) {
  if (!o.eleccion || !girando(o.eleccion)) return null;
  avanzarEleccion(o.eleccion, dt);
  return aLaCarrera(o);
}
