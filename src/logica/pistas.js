import { NOCHE } from './pista.js';

// Feria flamenca: calles de la feria con esquinas en ángulo recto y un zigzag entre las casetas. Antihoraria.
// Medida al diseñarla: 1.152 unidades, radio mínimo 14,6, partes separadas por 59; carrera de ~150 s en 🐢.
export const FERIA = {
  puntos: [
    [0, 0], [60, 0], [120, 0], [165, 0], [183, 7], [190, 25], [190, 75], [183, 93], [165, 100], [135, 100],
    [117, 107], [110, 125], [110, 150], [117, 168], [135, 175], [185, 175], [203, 182], [210, 200], [210, 235],
    [203, 253], [185, 260], [150, 260], [125, 260], [105, 272], [80, 272], [60, 260], [20, 260], [-40, 260],
    [-58, 253], [-65, 235], [-65, 25], [-58, 7], [-40, 0], [-20, 0],
  ],
  turbos: [[110, 0], [0, 260]],
  rampas: [[-65, 200]],
  filas: [40, 330, 600, 1000],
};

// Catálogo de pistas, en el orden de las tarjetas del menú. El id une la pista con su ambiente
// (src/dibujo/ambientes/) y su música (src/sonido/partituras.js).
export const PISTAS = [
  { id: 'noche', icono: '🌙', nombre: 'Noche de Thriller', recorrido: NOCHE },
  { id: 'feria', icono: '🎡', nombre: 'Feria flamenca', recorrido: FERIA },
];

export const indicePista = (id) => PISTAS.findIndex((p) => p.id === id);
