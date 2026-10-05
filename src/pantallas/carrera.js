import { crearCarrera, pasoCarrera, VUELTAS } from '../logica/carrera.js';
import { crearPiloto, conducir, ayudar, QUIETO } from '../logica/pilotos.js';
import { crearSalida, actualizarSalida } from '../logica/pausa.js';
import { ICONOS, TIPOS } from '../logica/objetos.js';
import { crearCamara, seguir, dibujarVistas } from '../dibujo/camaras.js';
import { el } from './dom.js';

const PASO = 1 / 60;

export function pantallaCarrera(ctx, { jugadores, clase = 1 }) {
  const { pista, mundo, personajes, sonido } = ctx;
  // Los niños parten en las últimas posiciones de la parrilla, como en Mario Kart.
  const elegidos = jugadores.map((j) => j.personaje);
  const resto = personajes.map((p) => p.id).filter((id) => !elegidos.includes(id));
  const orden = [...resto, ...elegidos];
  const humanos = jugadores.map((_, j) => resto.length + j);
  const carrera = crearCarrera(pista, orden, humanos, Math.random, clase);
  ctx.carrera = carrera;
  const pilotos = carrera.karts.map(() => crearPiloto());
  mundo.ponerKarts(orden.map((id) => personajes.find((p) => p.id === id)));
  mundo.ponerObjetos(carrera.objetos);
  mundo.actualizar(carrera, 0);
  const camaras = jugadores.map(() => crearCamara(jugadores.length === 2 ? 75 : 65));
  camaras.forEach((c, j) => seguir(c, carrera.karts[humanos[j]], 1, true));

  const raiz = el('div', `carrera n${jugadores.length}`);
  const marcadores = jugadores.map((_, j) => {
    const m = el('div', `marcador j${j + 1}`, '<div class="puesto"></div><div class="vuelta"></div><div class="casilla"></div><div class="contrario">↩️</div>');
    raiz.append(m);
    return m;
  });
  const cuenta = el('div', 'cuenta');
  const aviso = el('div', 'aviso oculto');
  raiz.append(cuenta, aviso);
  ctx.capa.append(raiz);
  sonido.musica(true);

  let acumulado = 0;
  let t = 0;
  let pausa = false;
  const salida = crearSalida();
  let fin = 0;
  let ultimaCuenta = null;
  const pideObjeto = jugadores.map(() => false);

  function mostrarAviso(html) {
    aviso.classList.toggle('oculto', html === null);
    if (html !== null && aviso.innerHTML !== html) aviso.innerHTML = html;
  }

  return {
    actualizar(fuentes, dt) {
      const porId = new Map(fuentes.map((f) => [f.id, f]));
      jugadores.forEach((j) => {
        if (porId.get(j.fuente)?.recien.pausa) pausa = !pausa;
      });
      // Control desconectado: se espera que vuelva, o que alguien toque el teclado para reemplazarlo.
      const perdido = jugadores.findIndex((j) => !porId.has(j.fuente));
      if (perdido !== -1) {
        const teclado = porId.get('teclado');
        const libre = !jugadores.some((j) => j.fuente === 'teclado');
        if (libre && teclado && Object.values(teclado.recien).some(Boolean)) jugadores[perdido].fuente = 'teclado';
      }
      const apretoB = jugadores.some((j) => porId.get(j.fuente)?.recien.vuelve);
      const sujetaB = jugadores.some((j) => porId.get(j.fuente)?.vuelve);
      if (actualizarSalida(salida, pausa, apretoB, sujetaB, dt)) {
        ctx.ir('inicio');
        return;
      }
      const detenida = pausa || perdido !== -1;
      // El reloj del dibujo se detiene en pausa: gestos, parpadeos, ruedas y ruleta quedan quietos.
      const dtDibujo = detenida ? 0 : dt;
      t += dtDibujo;
      const delCuadro = carrera.karts.map(() => []);
      if (perdido !== -1) mostrarAviso(`<div><span class="j${perdido + 1}">🎮</span> ❌</div>`);
      else if (pausa) mostrarAviso('<div>⏸️</div><div class="pequeno">▶️ Start · 🏠 B ⏳</div>');
      else mostrarAviso(null);

      if (!detenida) {
        // X se guarda hasta el siguiente paso: en pantallas rápidas hay cuadros sin paso de simulación.
        jugadores.forEach((jug, j) => {
          if (porId.get(jug.fuente)?.recien.objeto) pideObjeto[j] = true;
        });
        acumulado += dt;
        while (acumulado >= PASO) {
          acumulado -= PASO;
          const intenciones = carrera.karts.map((k, i) => {
            if (carrera.estado === 'cuenta') return QUIETO;
            const j = humanos.indexOf(i);
            if (j === -1 || k.termino) return conducir(pilotos[i], k, pista, PASO, carrera);
            const f = porId.get(jugadores[j].fuente);
            const propia = f ? { giro: f.giro, acelera: f.acelera, frena: f.frena, derrapa: f.derrapa, usa: pideObjeto[j] } : QUIETO;
            return jugadores[j].ayuda ? ayudar(propia, k, pista) : propia;
          });
          const eventos = pasoCarrera(carrera, intenciones, PASO);
          eventos.forEach((e, i) => delCuadro[i].push(...e));
          pideObjeto.fill(false);
          humanos.forEach((i) => eventos[i].forEach((e) => sonido.efecto(e)));
        }
      }

      const n = carrera.estado === 'cuenta' ? Math.ceil(carrera.cuenta) : 0;
      if (n !== ultimaCuenta) {
        if (n > 0) sonido.efecto('cuenta');
        else if (ultimaCuenta !== null) sonido.efecto('ya');
        ultimaCuenta = n;
      }
      cuenta.textContent = n > 0 ? String(n) : carrera.tiempo < 1 ? '🏁' : '';

      humanos.forEach((i, j) => {
        const k = carrera.karts[i];
        const m = marcadores[j];
        m.querySelector('.puesto').textContent = `${k.puesto}º`;
        m.querySelector('.vuelta').textContent = `${Math.min(VUELTAS, k.vuelta + 1)}/${VUELTAS}`;
        m.querySelector('.contrario').classList.toggle('visible', k.contrario > 1);
        const casilla = k.ruleta > 0 ? ICONOS[TIPOS[Math.floor(t * 12) % TIPOS.length]] : k.objeto ? ICONOS[k.objeto] : '';
        if (m.querySelector('.casilla').textContent !== casilla) m.querySelector('.casilla').textContent = casilla;
      });

      if (carrera.estado === 'fin') {
        fin += dt;
        if (fin > 2.5) {
          ctx.ir('podio', { carrera, jugadores, orden, humanos });
          return;
        }
      }
      sonido.motores(humanos.map((i) => (detenida ? null : carrera.karts[i].vel)));
      mundo.actualizar(carrera, t, dtDibujo, delCuadro);
      humanos.forEach((i, j) => seguir(camaras[j], carrera.karts[i], dtDibujo));
    },
    dibujar(renderer) {
      dibujarVistas(renderer, mundo.escena, camaras);
    },
    pausar() {
      pausa = true;
    },
    salir() {
      sonido.musica(false);
      sonido.motores([null, null]);
    },
  };
}
