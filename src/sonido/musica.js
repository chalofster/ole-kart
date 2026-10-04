// Música original de las carreras: pop y funk bailable al estilo de los años 80, en re menor.
// Cuatro compases de 16 semicorcheas que se repiten. No copia ninguna canción.
export const TEMPO = 116;
export const SEMICORCHEA = 60 / TEMPO / 4;
export const PASOS = 64;

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Un acorde por compás (notas MIDI): re menor, si bemol, do y la menor.
export const ACORDES = [
  [62, 65, 69],
  [58, 62, 65],
  [60, 64, 67],
  [57, 60, 64],
];
const BAJOS = [38, 34, 36, 33];
// Bajo sincopado: semicorchea del compás → semitonos sobre la nota base (0 base, 7 quinta, 12 octava).
const RITMO_BAJO = { 0: 0, 3: 0, 6: 12, 8: 0, 10: 0, 11: 12, 14: 7 };
const GOLPES_ACORDE = [2, 7, 10];
// Melodía (semicorchea del bucle → nota MIDI), con notas de cada acorde.
const MELODIA = {
  0: 81, 2: 77, 4: 74, 6: 77, 8: 81, 11: 79, 14: 77,
  16: 77, 18: 74, 20: 70, 22: 74, 24: 77, 27: 74, 30: 72,
  32: 79, 34: 76, 36: 79, 38: 81, 40: 79, 43: 76, 46: 72,
  48: 76, 50: 72, 52: 69, 54: 72, 56: 76, 59: 74, 62: 72,
};

// Lo que suena en una semicorchea del bucle.
export function notasDelPaso(paso) {
  const p = ((paso % PASOS) + PASOS) % PASOS;
  const compas = Math.floor(p / 16);
  const enCompas = p % 16;
  const notas = [];
  if (p % 4 === 0) notas.push({ tipo: 'bombo' });
  if (enCompas === 4 || enCompas === 12) notas.push({ tipo: 'palmas' });
  if (p % 4 === 2) notas.push({ tipo: 'platillo' });
  if (enCompas in RITMO_BAJO) notas.push({ tipo: 'bajo', frec: hz(BAJOS[compas] + RITMO_BAJO[enCompas]) });
  if (GOLPES_ACORDE.includes(enCompas)) notas.push({ tipo: 'acorde', frecs: ACORDES[compas].map(hz) });
  if (p in MELODIA) notas.push({ tipo: 'melodia', frec: hz(MELODIA[p]) });
  return notas;
}
