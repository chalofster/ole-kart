export const frecuenciaMotor = (vel) => 55 + Math.abs(vel) * 5;

const SILENCIO = { reanudar() {}, activo: () => true, motores() {}, efecto() {}, musica() {} };

// Todo se sintetiza con Web Audio. La música es original: bajo, batería y un arpegio en la menor.
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

  function tono(frec, dur, tipo = 'square', vol = 0.15, cuando = ctx.currentTime, hasta = frec) {
    const o = ctx.createOscillator();
    o.type = tipo;
    o.frequency.setValueAtTime(frec, cuando);
    o.frequency.exponentialRampToValueAtTime(hasta, cuando + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, cuando);
    g.gain.exponentialRampToValueAtTime(0.0001, cuando + dur);
    o.connect(g).connect(maestro);
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

  const BAJO = [110, 110, 131, 110, 147, 131, 110, 98];
  let reloj = null;
  let siguiente = 0;
  let paso = 0;
  function programar() {
    while (siguiente < ctx.currentTime + 0.2) {
      const corchea = paso % 8;
      tono(BAJO[corchea], 0.22, 'triangle', 0.18, siguiente);
      if (corchea % 2 === 1) ruido(0.05, 0.06, siguiente);
      if (corchea === 2 || corchea === 6) ruido(0.12, 0.12, siguiente);
      if (paso % 16 === 0) [440, 523, 659].forEach((f, i) => tono(f, 0.2, 'square', 0.05, siguiente + i * 0.25));
      siguiente += 0.25;
      paso += 1;
    }
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
      if (encender && !reloj) {
        siguiente = ctx.currentTime + 0.1;
        reloj = setInterval(programar, 50);
      }
      if (!encender && reloj) {
        clearInterval(reloj);
        reloj = null;
      }
    },
  };
}
