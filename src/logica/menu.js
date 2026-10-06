import { crearEleccion, pulsarEleccion, avanzarEleccion, girando } from './eleccion.js';

// Menú de inicio en tres pasos: cuántos juegan (👤 👥), a qué velocidad (🐢 🐇 🚀) y en qué pista (🗺️).
// velocidad: índice en VELOCIDADES; parte en la última usada. pistas: cuántas hay; pista: dónde parte el
// marco; ultima: la última pista corrida (🎲 no la repite), o null.
export function crearMenu(velocidad = 0, { pistas = 1, pista = 0, ultima = null } = {}) {
  return {
    paso: 'jugadores', jugadores: 0, velocidad, primera: undefined, listo: false,
    eleccion: crearEleccion(pistas, { marco: pista, ultima }),
  };
}

// Una pulsación sobre el menú. id: la fuente que la hizo (null si fue el mouse).
// opcion: el ícono tocado con el mouse, que además confirma. azar: para 🎲.
export function pulsarMenu(m, id, { izquierda = false, derecha = false, confirma = false, vuelve = false, opcion } = {}, azar = Math.random) {
  if (m.paso === 'pista') {
    if (m.listo || girando(m.eleccion)) return m;
    if (vuelve) {
      m.paso = 'velocidad';
      return m;
    }
    if ((confirma || opcion !== undefined) && m.primera === null) m.primera = id;
    pulsarEleccion(m.eleccion, { izquierda, derecha, confirma, opcion }, azar);
    if (m.eleccion.elegida !== null) m.listo = true;
    return m;
  }
  const total = m.paso === 'jugadores' ? 2 : 3;
  if (opcion !== undefined) {
    m[m.paso] = opcion;
    confirma = true;
  }
  if (izquierda) m[m.paso] = Math.max(0, m[m.paso] - 1);
  if (derecha) m[m.paso] = Math.min(total - 1, m[m.paso] + 1);
  if (m.paso === 'velocidad' && vuelve) {
    m.paso = 'jugadores';
    return m;
  }
  if (!confirma) return m;
  if (m.paso === 'jugadores') {
    m.paso = 'velocidad';
    m.primera = id;
  } else {
    if (m.primera === null) m.primera = id;
    m.paso = 'pista';
  }
  return m;
}

// Un cuadro: las pulsaciones de todas las fuentes, en orden. Si una cambia de paso, el resto del cuadro no
// cuenta: así dos A al mismo tiempo no se saltan un paso (por ejemplo, el de la pista).
export function cuadroMenu(m, fuentes, azar = Math.random) {
  for (const f of fuentes) {
    const paso = m.paso;
    pulsarMenu(m, f.id, f.recien, azar);
    if (m.paso !== paso) break;
  }
  return m;
}

// La ruleta de 🎲 avanza con el tiempo; al detenerse, el menú queda listo.
export function avanzarMenu(m, dt) {
  if (m.paso !== 'pista') return m;
  avanzarEleccion(m.eleccion, dt);
  if (m.eleccion.elegida !== null) m.listo = true;
  return m;
}
