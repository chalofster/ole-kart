import { crearPodio3D } from '../dibujo/podio3d.js';
import { dibujarVistas } from '../dibujo/camaras.js';
import { crearOpcionesPodio, pulsarPodio, avanzarPodio } from '../logica/podio.js';
import { PISTAS, indicePista } from '../logica/pistas.js';
import { crearTarjetas } from './tarjetas.js';
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
    <div class="opciones botones"><div class="opcion">🔁</div><div class="opcion">🗺️</div><div class="opcion">🏠</div></div>`);
  const tarjetas = crearTarjetas();
  raiz.append(tarjetas);
  ctx.capa.append(raiz);
  const botones = raiz.querySelector('.botones');
  const opciones = crearOpcionesPodio(PISTAS.length, indicePista(ctx.pistaId));

  // 🔁 y 🗺️ siguen con los mismos personajes y la misma velocidad; 🗺️ además arma la pista nueva.
  function hacer(accion) {
    if (!accion) return false;
    if (accion.ir === 'inicio') {
      ctx.ir('inicio');
    } else {
      ctx.usarPista(PISTAS[accion.pista].id);
      ctx.ir('carrera', { jugadores, clase: carrera.clase });
    }
    return true;
  }
  [...botones.children].forEach((b, i) => b.addEventListener('click', () => hacer(pulsarPodio(opciones, { opcion: i }))));
  [...tarjetas.children].forEach((c, i) => c.addEventListener('click', () => {
    if (opciones.eleccion) hacer(pulsarPodio(opciones, { opcion: i }));
  }));
  function pintar() {
    const eligiendo = opciones.eleccion !== null;
    botones.classList.toggle('oculto', eligiendo);
    tarjetas.classList.toggle('oculto', !eligiendo);
    [...botones.children].forEach((b, i) => b.classList.toggle('elegida', i === opciones.marco));
    if (eligiendo) [...tarjetas.children].forEach((c, i) => c.classList.toggle('elegida', i === opciones.eleccion.marco));
  }
  pintar();

  let t = 0;
  return {
    actualizar(fuentes, dt) {
      t += dt;
      podio.actualizar(t);
      // El primer segundo se ignora: así el botón que se tenía apretado al llegar no salta el podio.
      if (t < 1) return;
      if (hacer(avanzarPodio(opciones, dt))) return;
      for (const f of fuentes) {
        if (hacer(pulsarPodio(opciones, f.recien))) return;
      }
      pintar();
    },
    dibujar(renderer) {
      dibujarVistas(renderer, podio.escena, [podio.camara]);
    },
    salir() {
      podio.soltar();
    },
  };
}
