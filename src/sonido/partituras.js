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

// Feria flamenca: rumba original en la menor. Bajada andaluza (la menor, sol, fa, mi) dos veces,
// palmas a contratiempo y guitarra rasgueada en 3 + 3 + 2.
export const FERIA = {
  tempo: 124,
  compases: 8,
  acordes: [
    [57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 56, 59],
    [57, 60, 64], [55, 59, 62], [53, 57, 60], [52, 56, 59],
  ],
  bajos: [45, 43, 41, 40, 45, 43, 41, 40],
  ritmoBajo: { 0: 0, 6: 7, 8: 0, 11: 7, 14: 12 },
  golpesAcorde: [0, 3, 6, 8, 11, 14],
  bateria: { bombo: [0, 8], palmas: [2, 6, 10, 14], platillo: [4, 12] },
  melodia: {
    0: 76, 3: 77, 6: 76, 8: 74, 11: 72, 14: 71,
    16: 74, 19: 71, 22: 74, 24: 79, 27: 77, 30: 74,
    32: 72, 35: 69, 38: 72, 40: 77, 43: 76, 46: 74,
    48: 71, 50: 72, 52: 71, 56: 68, 59: 71, 62: 76,
    64: 81, 67: 79, 70: 77, 72: 76, 75: 77, 78: 76,
    80: 79, 83: 74, 86: 71, 88: 74, 91: 79, 94: 77,
    96: 77, 99: 72, 102: 69, 104: 72, 107: 77, 110: 81,
    112: 80, 115: 76, 118: 71, 120: 68, 123: 71, 126: 76,
  },
  // La menor con sol sostenido (la sensible del acorde de mi).
  escala: [9, 11, 0, 2, 4, 5, 7, 8],
  sonidos: {
    bajo: { onda: 'triangle', dur: 0.22, vol: 0.22 },
    acorde: { onda: 'triangle', dur: 0.2, vol: 0.04, rasgueo: 0.012 },
    melodia: { onda: 'square', dur: 0.16, vol: 0.06 },
  },
};

export const PARTITURAS = { noche: NOCHE, feria: FERIA };
