import { KART } from './kart.js';
import { crearCarrera, pasoCarrera } from './carrera.js';
import { puntoEn, diferencia, diferenciaAngular } from './pista.js';

export const QUIETO = { giro: 0, acelera: false, frena: false, derrapa: false };

const limitar = (v) => Math.max(-1, Math.min(1, v));

export function crearPiloto(azar = Math.random) {
  return { carril: (azar() * 2 - 1) * 3, reloj: 0, desde: null, retroceso: 0, revision: 0, guardado: 0 };
}

// Cuánto gira la pista un poco más adelante: más giro, menos velocidad.
export function velocidadPrudente(pista, s) {
  const giro = Math.abs(diferenciaAngular(puntoEn(pista, s + 4).rumbo, puntoEn(pista, s + 24).rumbo));
  return giro > 1.2 ? 0.55 : giro > 0.8 ? 0.7 : giro > 0.45 ? 0.85 : 1;
}

// Una vez por segundo el rival revisa si conviene usar su objeto. Si el blanco es un niño, solo 1 de cada 3 veces.
export function decidirObjeto(piloto, k, carrera, dt, azar = Math.random) {
  if (!k.objeto || k.ruleta > 0 || k.termino) {
    piloto.guardado = 0;
    return false;
  }
  piloto.guardado += dt;
  piloto.revision -= dt;
  if (piloto.revision > 0) return false;
  piloto.revision = 1;
  if (piloto.guardado > 8) return true;
  const { pista, karts } = carrera;
  const enLinea = (o) => o !== k && !o.termino && Math.abs(o.lateral - k.lateral) < 3;
  const delante = (o) => diferencia(k.s, o.s, pista.largo);
  const adelante = karts.find((o) => enLinea(o) && delante(o) > 0 && delante(o) < 40);
  const atras = karts.find((o) => enLinea(o) && delante(o) < 0 && delante(o) > -12);
  const conCalma = (o) => !!o && (!o.humano || azar() < 1 / 3);
  if (k.objeto === 'disco') return true;
  if (k.objeto === 'aji') return velocidadPrudente(pista, k.s) === 1;
  if (k.objeto === 'calabaza') return conCalma(adelante);
  return conCalma(atras);
}

// Gira hacia un punto de la pista más adelante, en su propio carril.
function haciaAdelante(k, pista, lateral) {
  const destino = puntoEn(pista, k.s + 8 + Math.max(0, k.vel) * 0.4, lateral);
  return limitar(diferenciaAngular(k.rumbo, Math.atan2(destino.y - k.y, destino.x - k.x)) * 2.5);
}

export function conducir(piloto, k, pista, dt, carrera = null) {
  const usa = carrera ? decidirObjeto(piloto, k, carrera, dt, carrera.azar) : false;
  if (piloto.retroceso > 0) {
    piloto.retroceso -= dt;
    return { ...QUIETO, frena: true, usa };
  }
  // Atascado: si en 2 s casi no avanzó por la pista, retrocede 1 s y vuelve a intentar.
  if (piloto.desde === null) piloto.desde = k.s;
  piloto.reloj += dt;
  if (piloto.reloj >= 2) {
    if (diferencia(piloto.desde, k.s, pista.largo) < 2) piloto.retroceso = 1;
    piloto.reloj = 0;
    piloto.desde = k.s;
  }
  const prudente = velocidadPrudente(pista, k.s) * KART.velMax * (k.factor ?? 1);
  return {
    giro: haciaAdelante(k, pista, piloto.carril),
    acelera: k.vel < prudente,
    frena: k.vel > prudente + 4,
    derrapa: false,
    usa,
  };
}

// En las curvas, el modo ayuda va un poco más rápido que los rivales para que la jugadora menor pueda adelantarlos.
const AYUDA_EXTRA = 1.05;

// Modo ayuda: acelera solo y, cerca del borde, la dirección se corrige hacia el centro.
// Mira dónde estará el kart en medio segundo, para corregir antes de que se vaya de lado.
export function ayudar(int, k, pista) {
  const m = pista.muestras[k.indice];
  const previsto = k.lateral + k.vel * Math.sin(diferenciaAngular(m.rumbo, k.rumbo)) * 0.5;
  const cerca = Math.max(Math.abs(k.lateral), Math.abs(previsto));
  const peso = Math.min(1, Math.max(0, (cerca - 2.5) / 3));
  const prudente = velocidadPrudente(pista, k.s) * KART.velMax * (k.factor ?? 1) * AYUDA_EXTRA;
  return {
    giro: limitar(int.giro * (1 - peso) + haciaAdelante(k, pista, 0) * peso),
    acelera: !int.frena && k.vel < prudente,
    frena: int.frena,
    derrapa: int.derrapa,
    usa: int.usa ?? false,
  };
}

// Carrera completa sin pantalla, con los 8 karts manejados por el computador.
export function simularCarrera(pista, { azar = Math.random, segundos = 400, clase = 1 } = {}) {
  const c = crearCarrera(pista, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [], azar, clase);
  const pilotos = c.karts.map(() => crearPiloto(azar));
  const dt = 1 / 60;
  while (c.estado !== 'fin' && c.tiempo < segundos) {
    const intenciones = c.karts.map((k, i) => (c.estado === 'carrera' ? conducir(pilotos[i], k, pista, dt, c) : QUIETO));
    pasoCarrera(c, intenciones, dt);
  }
  return c;
}
