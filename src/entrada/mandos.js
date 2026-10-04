const ZONA_MUERTA = 0.2;

// Mapeo estándar de la Gamepad API: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 7 RT, 9 Start, 12-15 cruceta.
export function leerMando(botones, ejes) {
  const pulsado = (i) => !!botones[i] && (botones[i].pressed || botones[i].value > 0.3);
  let giro = -(ejes[0] ?? 0);
  if (Math.abs(giro) < ZONA_MUERTA) giro = 0;
  if (pulsado(14)) giro = 1;
  if (pulsado(15)) giro = -1;
  return {
    giro,
    acelera: pulsado(0),
    frena: pulsado(1),
    derrapa: pulsado(7) || pulsado(5),
    pausa: pulsado(9),
    ayuda: pulsado(3),
    objeto: pulsado(2) || pulsado(4),
    confirma: pulsado(0),
    vuelve: pulsado(1),
    arriba: pulsado(12) || (ejes[1] ?? 0) < -0.5,
    abajo: pulsado(13) || (ejes[1] ?? 0) > 0.5,
    izquierda: giro > 0.5,
    derecha: giro < -0.5,
  };
}

export function leerTeclado(teclas) {
  const t = (codigo) => teclas.has(codigo);
  const giro = (t('ArrowLeft') ? 1 : 0) - (t('ArrowRight') ? 1 : 0);
  return {
    giro,
    acelera: t('ArrowUp'),
    frena: t('ArrowDown'),
    derrapa: t('Space'),
    pausa: t('Escape'),
    ayuda: t('KeyY'),
    objeto: t('KeyX'),
    confirma: t('Enter'),
    vuelve: t('Backspace'),
    arriba: t('ArrowUp'),
    abajo: t('ArrowDown'),
    izquierda: giro > 0,
    derecha: giro < 0,
  };
}

// Devuelve, para cada botón, si recién se apretó (estaba suelto en la lectura anterior).
export function detectorDeFlancos() {
  let antes = {};
  return (actual) => {
    const recien = {};
    for (const [clave, valor] of Object.entries(actual)) recien[clave] = valor === true && antes[clave] !== true;
    antes = actual;
    return recien;
  };
}

// El teclado siempre está; cada control conectado es otra fuente.
export function crearEntradas(ventana) {
  const teclas = new Set();
  ventana.addEventListener('keydown', (e) => {
    teclas.add(e.code);
    if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Backspace') e.preventDefault();
  });
  ventana.addEventListener('keyup', (e) => teclas.delete(e.code));
  ventana.addEventListener('blur', () => teclas.clear());
  const detectores = new Map();
  return {
    leer() {
      const fuentes = [{ id: 'teclado', ...leerTeclado(teclas) }];
      for (const m of ventana.navigator.getGamepads?.() ?? []) {
        if (m && m.connected) fuentes.push({ id: `mando-${m.index}`, ...leerMando(m.buttons, m.axes) });
      }
      return fuentes.map((f) => {
        if (!detectores.has(f.id)) detectores.set(f.id, detectorDeFlancos());
        const { id, ...estado } = f;
        return { ...f, recien: detectores.get(id)(estado) };
      });
    },
  };
}
