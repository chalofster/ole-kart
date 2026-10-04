import { crearPista, NOCHE } from './logica/pista.js';
import { PERSONAJES } from './logica/personajes.js';
import { crearMundo } from './dibujo/escena.js';
import { pantallaInicio } from './pantallas/inicio.js';

const PANTALLAS = { inicio: pantallaInicio };

export function crearJuego({ renderer, capa, entradas, sonido }) {
  const pista = crearPista(NOCHE);
  let actual = null;
  const ctx = { renderer, capa, pista, mundo: crearMundo(pista), sonido, personajes: PERSONAJES, nombre: null };
  ctx.ir = (nombre, datos = {}) => {
    actual?.salir();
    capa.replaceChildren();
    ctx.nombre = nombre;
    actual = PANTALLAS[nombre](ctx, datos);
  };
  ctx.ir('inicio');
  return {
    ctx,
    get pantalla() {
      return ctx.nombre;
    },
    cuadro(dt) {
      actual.actualizar(entradas.leer(), dt);
      actual.dibujar(renderer);
    },
    pausar() {
      actual.pausar?.();
    },
  };
}
