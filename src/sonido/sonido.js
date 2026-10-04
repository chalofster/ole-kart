import { notasDelPaso, SEMICORCHEA } from './musica.js';

export const frecuenciaMotor = (vel) => 55 + Math.abs(vel) * 5;

const SILENCIO = {
  reanudar() {}, activo: () => true, motores() {}, efecto() {}, musica() {},
  ponerCancion() {}, hayCancion: () => false, cancionSonando: () => false,
};

// Todo se sintetiza con Web Audio; la música original está en musica.js.
// En las carreras, una canción propia del computador puede reemplazar esa música.
export function crearSonido(Contexto = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
  if (!Contexto) return SILENCIO;
  const ctx = new Contexto();
  const maestro = ctx.createGain();
  maestro.gain.value = 0.6;
  maestro.connect(ctx.destination);

  const motores = [0, 1].map(() => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 600;
    const vol = ctx.createGain();
    vol.gain.value = 0;
    osc.connect(filtro).connect(vol).connect(maestro);
    osc.start();
    return { osc, vol };
  });

  function tono(frec, dur, tipo = 'square', vol = 0.15, cuando = ctx.currentTime, hasta = frec, destino = maestro) {
    const o = ctx.createOscillator();
    o.type = tipo;
    o.frequency.setValueAtTime(frec, cuando);
    o.frequency.exponentialRampToValueAtTime(hasta, cuando + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, cuando);
    g.gain.exponentialRampToValueAtTime(0.0001, cuando + dur);
    o.connect(g).connect(destino);
    o.start(cuando);
    o.stop(cuando + dur + 0.02);
  }

  function ruido(dur, vol, cuando = ctx.currentTime) {
    const n = Math.floor(ctx.sampleRate * dur);
    const bufer = ctx.createBuffer(1, n, ctx.sampleRate);
    const datos = bufer.getChannelData(0);
    for (let i = 0; i < n; i++) datos[i] = Math.random() * 2 - 1;
    const fuente = ctx.createBufferSource();
    fuente.buffer = bufer;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, cuando);
    g.gain.exponentialRampToValueAtTime(0.001, cuando + dur);
    fuente.connect(g).connect(maestro);
    fuente.start(cuando);
  }

  const EFECTOS = {
    cuenta: () => tono(440, 0.25),
    ya: () => tono(880, 0.5),
    turbo: () => tono(200, 0.5, 'sawtooth', 0.12, ctx.currentTime, 600),
    chispas: () => tono(1200, 0.08, 'triangle', 0.08),
    choque: () => ruido(0.15, 0.3),
    salto: () => tono(300, 0.3, 'triangle', 0.12, ctx.currentTime, 700),
    vuelta: () => [660, 880].forEach((f, i) => tono(f, 0.15, 'square', 0.12, ctx.currentTime + i * 0.12)),
    meta: () => [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.3, 'square', 0.12, ctx.currentTime + i * 0.15)),
  };

  // El bajo pasa por un filtro para que suene redondo.
  const filtroBajo = ctx.createBiquadFilter();
  filtroBajo.type = 'lowpass';
  filtroBajo.frequency.value = 700;
  filtroBajo.connect(maestro);
  const INSTRUMENTOS = {
    bombo: (n, t) => tono(150, 0.22, 'sine', 0.55, t, 45),
    palmas: (n, t) => ruido(0.1, 0.2, t),
    platillo: (n, t) => ruido(0.03, 0.05, t),
    bajo: (n, t) => tono(n.frec, 0.2, 'sawtooth', 0.16, t, n.frec, filtroBajo),
    acorde: (n, t) => n.frecs.forEach((f) => tono(f, 0.12, 'square', 0.03, t)),
    melodia: (n, t) => tono(n.frec, 0.18, 'triangle', 0.1, t),
  };
  let reloj = null;
  let siguiente = 0;
  let paso = 0;
  function programar() {
    while (siguiente < ctx.currentTime + 0.2) {
      for (const n of notasDelPaso(paso)) INSTRUMENTOS[n.tipo](n, siguiente);
      siguiente += SEMICORCHEA;
      paso += 1;
    }
  }

  // Canción propia: suena en bucle por el mismo volumen general que el resto.
  const reproductor = new Audio();
  reproductor.loop = true;
  const volCancion = ctx.createGain();
  volCancion.gain.value = 0.8;
  ctx.createMediaElementSource(reproductor).connect(volCancion).connect(maestro);
  let cancion = null;
  let sonando = false;

  function encenderMusica() {
    if (cancion) {
      reproductor.currentTime = 0;
      reproductor.play().catch(() => {});
    } else {
      paso = 0;
      siguiente = ctx.currentTime + 0.1;
      reloj = setInterval(programar, 50);
    }
  }
  function apagarMusica() {
    reproductor.pause();
    clearInterval(reloj);
    reloj = null;
  }

  return {
    reanudar() {
      if (ctx.state !== 'running') ctx.resume();
    },
    activo: () => ctx.state === 'running',
    motores(velocidades) {
      motores.forEach((m, i) => {
        const vel = velocidades[i] ?? null;
        m.osc.frequency.setTargetAtTime(frecuenciaMotor(vel ?? 0), ctx.currentTime, 0.05);
        m.vol.gain.setTargetAtTime(vel === null ? 0 : 0.05, ctx.currentTime, 0.1);
      });
    },
    efecto(nombre) {
      EFECTOS[nombre]?.();
    },
    musica(encender) {
      if (encender === sonando) return;
      sonando = encender;
      if (encender) encenderMusica();
      else apagarMusica();
    },
    // archivo: un archivo de música del computador, o null para volver a la música del juego.
    ponerCancion(archivo) {
      if (sonando) apagarMusica();
      if (cancion) URL.revokeObjectURL(cancion);
      cancion = archivo ? URL.createObjectURL(archivo) : null;
      if (cancion) reproductor.src = cancion;
      else reproductor.removeAttribute('src');
      if (sonando) encenderMusica();
    },
    hayCancion: () => cancion !== null,
    cancionSonando: () => cancion !== null && !reproductor.paused,
  };
}
