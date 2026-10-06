// Elegir pista: el marco recorre las tarjetas de las pistas y, al final, 🎲.
// cantidad: cuántas pistas hay (el índice cantidad es 🎲). ultima: la última pista corrida (🎲 no la repite), o null.
export const RULETA = 1;
// Al detenerse, la pista que salió se ve este tiempo antes de quedar elegida.
export const RESULTADO = 0.7;

// Mientras gira la ruleta o se ve su resultado, la elección no responde.
export const girando = (e) => e.ruleta > 0 || e.resultado > 0;

export function crearEleccion(cantidad, { marco = 0, ultima = null } = {}) {
  return { cantidad, marco, ultima, ruleta: 0, resultado: 0, destino: null, elegida: null };
}

// Una pulsación. opcion: la tarjeta tocada con el mouse, que además confirma.
// Mientras gira la ruleta o se ve su resultado, o si ya se eligió, no responde.
export function pulsarEleccion(e, { izquierda = false, derecha = false, confirma = false, opcion } = {}, azar = Math.random) {
  if (girando(e) || e.elegida !== null) return e;
  if (opcion !== undefined) {
    if (opcion < 0 || opcion > e.cantidad) return e;
    e.marco = opcion;
    confirma = true;
  }
  if (izquierda) e.marco = Math.max(0, e.marco - 1);
  if (derecha) e.marco = Math.min(e.cantidad, e.marco + 1);
  if (!confirma) return e;
  if (e.marco < e.cantidad) {
    e.elegida = e.marco;
    return e;
  }
  const todas = [...Array(e.cantidad).keys()];
  const otras = todas.filter((i) => i !== e.ultima);
  const posibles = otras.length ? otras : todas;
  e.destino = posibles[Math.floor(azar() * posibles.length)];
  e.ruleta = RULETA;
  return e;
}

// La ruleta de 🎲: el marco salta de tarjeta en tarjeta, se detiene en el destino y, tras mostrarlo un
// momento, la pista queda elegida.
export function avanzarEleccion(e, dt) {
  if (e.ruleta > 0) {
    e.ruleta = Math.max(0, e.ruleta - dt);
    if (e.ruleta > 0) {
      e.marco = Math.floor((RULETA - e.ruleta) * 12) % e.cantidad;
      return e;
    }
    e.marco = e.destino;
    e.resultado = RESULTADO;
    return e;
  }
  if (e.resultado > 0) {
    e.resultado = Math.max(0, e.resultado - dt);
    if (e.resultado === 0) e.elegida = e.destino;
  }
  return e;
}
