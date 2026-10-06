import { NOCHE } from './pista.js';

// Catálogo de pistas, en el orden de las tarjetas del menú. El id une la pista con su ambiente
// (src/dibujo/ambientes/) y su música (src/sonido/partituras.js).
export const PISTAS = [
  { id: 'noche', icono: '🌙', nombre: 'Noche de Thriller', recorrido: NOCHE },
];

export const indicePista = (id) => PISTAS.findIndex((p) => p.id === id);
