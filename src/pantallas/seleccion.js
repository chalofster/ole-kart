import { crearSeleccion, procesarSeleccion, todosListos } from '../logica/seleccion.js';
import { crearVitrina } from '../dibujo/vitrina.js';
import { dibujarVistas } from '../dibujo/camaras.js';
import { el } from './dom.js';

export function pantallaSeleccion(ctx, { cantidad, primera, clase = 1 }) {
  const { personajes } = ctx;
  const vitrina = crearVitrina(personajes);
  const sel = crearSeleccion(cantidad, primera);
  const raiz = el('div', 'seleccion');
  const barra = el('div', 'barra');
  raiz.append(barra);
  ctx.capa.append(raiz);
  let t = 0;
  let espera = null;

  function pintar() {
    barra.innerHTML = sel.jugadores
      .map((j, i) => {
        const quien = j.fuente === null ? '🎮❓' : personajes[j.cursor].icono;
        return `<div class="ficha j${i + 1}">${i + 1} ${quien}${j.ayuda ? ' ⭐' : ''}${j.listo ? ' ✅' : ''}</div>`;
      })
      .join('');
    vitrina.marcar(sel.jugadores.map((j) => (j.fuente === null ? undefined : j.cursor)));
  }
  pintar();

  return {
    actualizar(fuentes, dt) {
      t += dt;
      const antes = sel.jugadores.map((j) => j.listo);
      for (const f of fuentes) procesarSeleccion(sel, f);
      sel.jugadores.forEach((j, i) => {
        if (j.listo && !antes[i]) vitrina.celebrar(j.cursor);
      });
      if (sel.volver) {
        ctx.ir('inicio');
        return;
      }
      pintar();
      vitrina.actualizar(t, dt);
      if (!todosListos(sel)) {
        espera = null;
        return;
      }
      espera = (espera ?? 0.8) - dt;
      if (espera <= 0) {
        ctx.ir('carrera', {
          jugadores: sel.jugadores.map((j) => ({ fuente: j.fuente, personaje: personajes[j.cursor].id, ayuda: j.ayuda })),
          clase,
        });
      }
    },
    dibujar(renderer) {
      dibujarVistas(renderer, vitrina.escena, [vitrina.camara]);
    },
    salir() {},
  };
}
