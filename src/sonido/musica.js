// Lectura de las partituras (partituras.js): qué suena en cada semicorchea del bucle.
// Todas las partituras usan compases de 16 semicorcheas.
export const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
export const pasosDe = (partitura) => partitura.compases * 16;
export const semicorchea = (partitura) => 60 / partitura.tempo / 4;

export function notasDelPaso(partitura, paso) {
  const total = pasosDe(partitura);
  const p = ((paso % total) + total) % total;
  const compas = Math.floor(p / 16);
  const enCompas = p % 16;
  const notas = [];
  for (const [tipo, golpes] of Object.entries(partitura.bateria)) if (golpes.includes(enCompas)) notas.push({ tipo });
  for (const tipo of partitura.rellenos?.[p] ?? []) notas.push({ tipo });
  if (enCompas in partitura.ritmoBajo) {
    notas.push({ tipo: 'bajo', frec: hz(partitura.bajos[compas] + partitura.ritmoBajo[enCompas]) });
  }
  if (partitura.golpesAcorde.includes(enCompas)) notas.push({ tipo: 'acorde', frecs: partitura.acordes[compas].map(hz) });
  if (p in partitura.melodia) notas.push({ tipo: 'melodia', frec: hz(partitura.melodia[p]) });
  return notas;
}
