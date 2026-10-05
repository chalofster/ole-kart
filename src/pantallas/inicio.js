import { crearCarrera, pasoCarrera, VELOCIDADES } from '../logica/carrera.js';
import { crearPiloto, conducir } from '../logica/pilotos.js';
import { crearMenu, pulsarMenu } from '../logica/menu.js';
import { guardarCancion, borrarCancion } from '../sonido/cancion.js';
import { crearCamara, seguir, dibujarVistas } from '../dibujo/camaras.js';
import { el } from './dom.js';

const PASO = 1 / 60;

// Elegir 1 o 2 jugadores y luego la velocidad. De fondo corre una carrera de demostración con los 8 personajes.
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
    mundo.ponerObjetos(demo.objetos);
    mundo.actualizar(demo, 0);
    seguir(camara, demo.karts[0], 1, true);
  }
  nuevaDemo();

  const raiz = el('div', 'inicio', `
    <div class="logo">Olé Kart</div>
    <div class="opciones jugadores"><div class="opcion">👤</div><div class="opcion">👥</div></div>
    <div class="opciones velocidad"><div class="opcion">🐢</div><div class="opcion">🐇</div><div class="opcion">🚀</div></div>
    <div class="cancion"></div>
    <input type="file" accept="audio/*" class="oculto" />`);
  ctx.capa.append(raiz);

  // 🎵 (con el mouse, para el adulto): elegir una canción del computador para las carreras, o quitarla.
  const boton = raiz.querySelector('.cancion');
  const archivo = raiz.querySelector('input');
  const pintarCancion = () => {
    const texto = sonido.hayCancion() ? '🎵✅' : '🎵';
    if (boton.textContent !== texto) boton.textContent = texto;
  };
  pintarCancion();
  boton.addEventListener('click', () => {
    if (!sonido.hayCancion()) {
      archivo.click();
      return;
    }
    sonido.ponerCancion(null);
    borrarCancion();
    pintarCancion();
  });
  archivo.addEventListener('change', () => {
    const elegido = archivo.files[0];
    // Se vacía para que elegir otra vez el mismo archivo también funcione.
    archivo.value = '';
    if (!elegido) return;
    sonido.ponerCancion(elegido);
    guardarCancion(elegido);
    pintarCancion();
  });
  const grupos = { jugadores: raiz.querySelector('.jugadores'), velocidad: raiz.querySelector('.velocidad') };
  const menu = crearMenu(ctx.velocidad ?? 0);
  for (const [paso, grupo] of Object.entries(grupos)) {
    [...grupo.children].forEach((o, i) => o.addEventListener('click', () => {
      if (menu.paso === paso) pulsarMenu(menu, null, { opcion: i });
    }));
  }
  function pintar() {
    for (const [paso, grupo] of Object.entries(grupos)) {
      grupo.classList.toggle('oculto', menu.paso !== paso);
      [...grupo.children].forEach((o, i) => o.classList.toggle('elegida', i === menu[paso]));
    }
  }
  pintar();

  return {
    actualizar(fuentes, dt) {
      t += dt;
      for (const f of fuentes) pulsarMenu(menu, f.id, f.recien);
      pintar();
      pintarCancion();
      if (menu.listo) {
        sonido.reanudar();
        ctx.velocidad = menu.velocidad;
        ctx.ir('seleccion', { cantidad: menu.jugadores + 1, primera: menu.primera, clase: VELOCIDADES[menu.velocidad] });
        return;
      }
      acumulado += dt;
      const delCuadro = demo.karts.map(() => []);
      while (acumulado >= PASO) {
        acumulado -= PASO;
        const eventos = pasoCarrera(demo, demo.karts.map((k, i) => conducir(pilotos[i], k, pista, PASO, demo)), PASO);
        eventos.forEach((e, i) => delCuadro[i].push(...e));
      }
      if (demo.estado === 'fin' || demo.tiempo > 120) nuevaDemo();
      mundo.actualizar(demo, t, dt, delCuadro);
      seguir(camara, demo.karts[0], dt);
    },
    dibujar(renderer) {
      dibujarVistas(renderer, mundo.escena, [camara]);
    },
    salir() {},
  };
}
