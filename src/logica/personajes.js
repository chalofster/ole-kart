// Cada personaje es una ficha: el dibujo arma su cuerpo con figuras simples.
// Los seis después del bailarín son provisionales hasta que los elijan los niños.
export const PERSONAJES = [
  {
    id: 'bailarina', icono: '💃', kart: 0xd62828,
    cuerpo: {
      tipo: 'persona', piel: 0xe0ac69, pelo: 0x2b1d14, peinado: 'mono', ropa: 0xd62828,
      falda: { color: 0xd62828, lunares: 0xffffff }, adorno: 'flor',
    },
  },
  {
    id: 'bailarin', icono: '🕺', kart: 0x1b1b1b, detalle: 0xd62828,
    cuerpo: {
      tipo: 'persona', piel: 0xc68642, pelo: 0x1b1b1b, peinado: 'corto', ropa: 0xc1121f,
      chaqueta: { color: 0xc1121f, franjas: 0x111111 },
    },
  },
  { id: 'zarpita', icono: '🐱', kart: 0xf4a261, cuerpo: { tipo: 'gato', color: 0xf4a261 } },
  { id: 'trino', icono: '🐦', kart: 0x2a9d8f, cuerpo: { tipo: 'pajaro', color: 0x2a9d8f } },
  { id: 'torito', icono: '🐂', kart: 0x8b5a2b, cuerpo: { tipo: 'toro', color: 0x8b5a2b, panuelo: 0xd62828 } },
  {
    id: 'teclita', icono: '🎹', kart: 0xf5f5f5, detalle: 0x111111,
    cuerpo: {
      tipo: 'persona', piel: 0xf1c27d, pelo: 0x6b3e26, peinado: 'largo', ropa: 0x3a86ff,
      falda: { color: 0x3a86ff }, adorno: 'nota',
    },
  },
  { id: 'calabacita', icono: '🎃', kart: 0x7b2cbf, cuerpo: { tipo: 'calabaza', color: 0xff8c1a } },
  { id: 'fantasmin', icono: '👻', kart: 0x90e0ef, cuerpo: { tipo: 'fantasma', color: 0xffffff } },
];
