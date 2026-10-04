import { crearCarrera, pasoCarrera } from '../logica/carrera.js';
import { crearPiloto, conducir } from '../logica/pilotos.js';
import { crearCamara, seguir, dibujarVistas } from '../dibujo/camaras.js';
import { el } from './dom.js';

const PASO = 1 / 60;

// Elegir 1 o 2 jugadores. De fondo corre una carrera de demostración con los 8 personajes.
export function pantallaInicio(ctx) {
  const { pista, mundo, personajes, sonido } = ctx;
  const camara = crearCamara(65);
  let demo;
  let pilotos;
  let acumulado = 0;
  let t = 0;
  function nuevaDemo() {
    demo = crearCarrera(pista, personajes.map((p) => p.id));
    demo.estado = 'carrera';
    pilotos = demo.karts.map(() => crearPiloto());
    mundo.ponerKarts(personajes);
    mundo.actualizar(demo, 0);
    seguir(camara, demo.karts[0], 1, true);
  }
  nuevaDemo();

  const raiz = el('div', 'inicio', `
    <div class="logo">Olé Kart</div>
    <div class="opciones"><div class="opcion">👤</div><div class="opcion">👥</div></div>`);
  ctx.capa.append(raiz);
  const opciones = [...raiz.querySelectorAll('.opcion')];
  let elegida = 0;
  let elegidaPor; // id de la fuente que confirmó; null si fue con el mouse
  opciones.forEach((o, i) => o.addEventListener('click', () => {
    elegida = i;
    elegidaPor = null;
  }));

  return {
    actualizar(fuentes, dt) {
      t += dt;
      for (const f of fuentes) {
        if (f.recien.izquierda) elegida = 0;
        if (f.recien.derecha) elegida = 1;
        if (f.recien.confirma) elegidaPor = f.id;
      }
      opciones.forEach((o, i) => o.classList.toggle('elegida', i === elegida));
      if (elegidaPor !== undefined) {
        sonido.reanudar();
        ctx.ir('seleccion', { cantidad: elegida + 1, primera: elegidaPor });
        return;
      }
      acumulado += dt;
      while (acumulado >= PASO) {
        acumulado -= PASO;
        pasoCarrera(demo, demo.karts.map((k, i) => conducir(pilotos[i], k, pista, PASO)), PASO);
      }
      if (demo.estado === 'fin' || demo.tiempo > 120) nuevaDemo();
      mundo.actualizar(demo, t);
      seguir(camara, demo.karts[0], dt);
    },
    dibujar(renderer) {
      dibujarVistas(renderer, mundo.escena, [camara]);
    },
    salir() {},
  };
}
