// Reglas de la pantalla de selección. Los jugadores parten sobre la bailarina (0) y el bailarín (1).
export function crearSeleccion(cantidad, primera) {
  return {
    jugadores: Array.from({ length: cantidad }, (_, j) => ({
      fuente: j === 0 && primera ? primera : null, cursor: j, listo: false, ayuda: false,
    })),
    volver: false,
  };
}

// Aplica lo que recién pulsó una fuente. La pulsación que une a un jugador no elige nada.
export function procesarSeleccion(sel, fuente, total = 8) {
  const r = fuente.recien;
  const j = sel.jugadores.find((x) => x.fuente === fuente.id);
  if (!j) {
    const libre = sel.jugadores.find((x) => x.fuente === null);
    if (libre && r.confirma) libre.fuente = fuente.id;
    return sel;
  }
  if (j.listo) {
    if (r.vuelve) j.listo = false;
    return sel;
  }
  if (r.izquierda) j.cursor = (j.cursor + total - 1) % total;
  if (r.derecha) j.cursor = (j.cursor + 1) % total;
  if (r.arriba || r.abajo) j.cursor = (j.cursor + total / 2) % total;
  if (r.ayuda) j.ayuda = !j.ayuda;
  const ocupado = sel.jugadores.some((o) => o !== j && o.listo && o.cursor === j.cursor);
  if (r.confirma && !ocupado) j.listo = true;
  else if (r.vuelve) sel.volver = true;
  return sel;
}

export const todosListos = (sel) => sel.jugadores.every((j) => j.listo);
