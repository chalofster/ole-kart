import { PISTAS } from '../logica/pistas.js';
import { crearPista } from '../logica/pista.js';
import { crearMundo } from './escena.js';
import { AMBIENTES } from './ambientes/index.js';

// Un solo mundo armado a la vez: al pasar a otra pista se arma el suyo y se libera el anterior.
// pistas y ambientes se pueden cambiar en las pruebas.
export function crearMundos(pistas = PISTAS, ambientes = AMBIENTES) {
  let actual = null;
  return {
    usar(id) {
      if (actual?.id === id) return actual;
      actual?.mundo.soltar();
      const pista = crearPista(pistas.find((p) => p.id === id).recorrido);
      actual = { id, pista, mundo: crearMundo(pista, ambientes[id]) };
      return actual;
    },
  };
}
