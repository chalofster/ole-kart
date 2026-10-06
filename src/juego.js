import { PERSONAJES } from './logica/personajes.js';
import { crearMundos } from './dibujo/mundos.js';
import { pantallaInicio } from './pantallas/inicio.js';
import { pantallaSeleccion } from './pantallas/seleccion.js';
import { pantallaCarrera } from './pantallas/carrera.js';
import { pantallaPodio } from './pantallas/podio.js';

const PANTALLAS = { inicio: pantallaInicio, seleccion: pantallaSeleccion, carrera: pantallaCarrera, podio: pantallaPodio };

export function crearJuego({ renderer, capa, entradas, sonido }) {
  let actual = null;
  const mundos = crearMundos();
  const ctx = { renderer, capa, sonido, personajes: PERSONAJES, nombre: null };
  // Arma la pista elegida (y libera la anterior). Cada pantalla toma ctx.pista y ctx.mundo al empezar.
  ctx.usarPista = (id) => {
    const { pista, mundo } = mundos.usar(id);
    Object.assign(ctx, { pistaId: id, pista, mundo });
  };
  ctx.usarPista('noche');
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
