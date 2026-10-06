// Partituras de la música de las carreras: una por pista, con el mismo id del catálogo. Todas originales.
// Compases de 16 semicorcheas; notas como números MIDI (60 = do central).
// bateria: golpes de cada instrumento en las semicorcheas del compás; rellenos: golpes extra en semicorcheas del bucle.
// ritmoBajo: semicorchea del compás → semitonos sobre la nota base del compás (0 base, 7 quinta, 12 octava).
// escala: clases de nota que usa la melodía (0 = do, 2 = re, ... 11 = si).
// sonidos: onda, duración (s) y volumen del bajo, los acordes y la melodía; rasgueo separa las notas del acorde.

// Noche de Thriller: pop y funk bailable de los años 80, en re menor (la música de siempre).
export const NOCHE = {
  tempo: 116,
  compases: 4,
  // Re menor, si bemol, do y la menor.
  acordes: [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 60, 64]],
  bajos: [38, 34, 36, 33],
  ritmoBajo: { 0: 0, 3: 0, 6: 12, 8: 0, 10: 0, 11: 12, 14: 7 },
  golpesAcorde: [2, 7, 10],
  bateria: { bombo: [0, 4, 8, 12], palmas: [4, 12], platillo: [2, 6, 10, 14] },
  melodia: {
    0: 81, 2: 77, 4: 74, 6: 77, 8: 81, 11: 79, 14: 77,
    16: 77, 18: 74, 20: 70, 22: 74, 24: 77, 27: 74, 30: 72,
    32: 79, 34: 76, 36: 79, 38: 81, 40: 79, 43: 76, 46: 72,
    48: 76, 50: 72, 52: 69, 54: 72, 56: 76, 59: 74, 62: 72,
  },
  escala: [2, 4, 5, 7, 9, 10, 0],
  sonidos: {
    bajo: { onda: 'sawtooth', dur: 0.2, vol: 0.16 },
    acorde: { onda: 'square', dur: 0.12, vol: 0.03 },
    melodia: { onda: 'triangle', dur: 0.18, vol: 0.1 },
  },
};

export const PARTITURAS = { noche: NOCHE };
