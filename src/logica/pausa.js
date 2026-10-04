// Para volver al inicio desde la pausa hay que apretar B y mantenerlo 1,5 s. B también es el freno:
// así un B suelto, o uno que ya estaba apretado al pausar, no termina la carrera.
export const ESPERA_SALIDA = 1.5;

export function crearSalida() {
  return { tiempo: null };
}

// recien: alguien acaba de apretar B; sujeto: alguien lo mantiene apretado. Devuelve true al cumplirse la espera.
export function actualizarSalida(salida, pausa, recien, sujeto, dt) {
  if (!pausa) salida.tiempo = null;
  else if (salida.tiempo === null) {
    if (recien) salida.tiempo = 0;
  } else if (sujeto) salida.tiempo += dt;
  else salida.tiempo = null;
  return salida.tiempo !== null && salida.tiempo >= ESPERA_SALIDA;
}
