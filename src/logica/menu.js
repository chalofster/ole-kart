// Menú de inicio en dos pasos: cuántos juegan (👤 👥) y a qué velocidad (🐢 🐇 🚀).
// velocidad: índice en VELOCIDADES; parte en la última usada.
export function crearMenu(velocidad = 0) {
  return { paso: 'jugadores', jugadores: 0, velocidad, primera: undefined, listo: false };
}

// Una pulsación sobre el menú. id: la fuente que la hizo (null si fue el mouse).
// opcion: el ícono tocado con el mouse, que además confirma.
export function pulsarMenu(m, id, { izquierda = false, derecha = false, confirma = false, vuelve = false, opcion } = {}) {
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
    m.listo = true;
  }
  return m;
}
