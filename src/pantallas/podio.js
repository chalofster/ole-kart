import { crearPodio3D } from '../dibujo/podio3d.js';
import { dibujarVistas } from '../dibujo/camaras.js';
import { el } from './dom.js';

export function pantallaPodio(ctx, { carrera, jugadores, orden, humanos }) {
  const { personajes, sonido } = ctx;
  const ficha = (i) => personajes.find((p) => p.id === orden[i]);
  const podio = crearPodio3D(carrera.puestos.slice(0, 3).map(ficha));
  sonido.efecto('meta');
  const filas = carrera.puestos
    .map((i, p) => {
      const j = humanos.indexOf(i);
      return `<div class="fila ${j >= 0 ? `j${j + 1}` : ''}"><span class="numero">${p + 1}</span>${ficha(i).icono}</div>`;
    })
    .join('');
  const raiz = el('div', 'podio', `<div class="tabla">${filas}</div>
    <div class="opciones"><div class="opcion elegida">🔁</div><div class="opcion">🏠</div></div>`);
  ctx.capa.append(raiz);
  const [otra, casa] = raiz.querySelectorAll('.opcion');
  // Otra carrera con los mismos personajes y la misma velocidad.
  const otraCarrera = () => ctx.ir('carrera', { jugadores, clase: carrera.clase });
  otra.addEventListener('click', otraCarrera);
  casa.addEventListener('click', () => ctx.ir('inicio'));
  let t = 0;
  return {
    actualizar(fuentes, dt) {
      t += dt;
      podio.actualizar(t);
      // El primer segundo se ignora: así el botón que se tenía apretado al llegar no salta el podio.
      if (t < 1) return;
      for (const f of fuentes) {
        if (f.recien.confirma) {
          otraCarrera();
          return;
        }
        if (f.recien.vuelve) {
          ctx.ir('inicio');
          return;
        }
      }
    },
    dibujar(renderer) {
      dibujarVistas(renderer, podio.escena, [podio.camara]);
    },
    salir() {
      podio.soltar();
    },
  };
}
