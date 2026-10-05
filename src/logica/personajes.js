// Cada personaje es una ficha: el dibujo arma su cuerpo con figuras simples.
// Los seis después del bailarín son provisionales hasta que los elijan los niños.
export const PERSONAJES = [
  {
    id: 'bailarina', icono: '💃', kart: 0xd62828,
    cuerpo: {
      tipo: 'flamenca', piel: 0xe0ac69, pelo: 0x2b1d14, vestido: 0xd62828, volante: 0xa4161a, lunares: 0xffffff,
      manton: 0xfff1d0, fleco: 0xe9c46a, flor: 0xff4d6d, centroFlor: 0xffd166, peineta: 0x8b4a2b, aros: 0xffd166,
      zapatos: 0x7b2d26,
    },
  },
  {
    id: 'bailarin', icono: '🕺', kart: 0x1b1b1b, detalle: 0xd62828,
    cuerpo: { tipo: 'bailarin', piel: 0xc68642, pelo: 0x1b1b1b, chaqueta: 0xc1121f, franjas: 0x111111, zapatos: 0x111111 },
  },
  {
    id: 'zarpita', icono: '🐱', kart: 0xf4a261,
    cuerpo: {
      tipo: 'gato', color: 0xf4a261, barriga: 0xffe8d6, orejas: 0xffb4c2, nariz: 0xff8fab, collar: 0xd62828,
      cascabel: 0xffd166, punta: 0xffffff, bigotes: 0x2b1a12,
    },
  },
  {
    id: 'trino', icono: '🐦', kart: 0x2a9d8f,
    cuerpo: { tipo: 'pajaro', color: 0x2a9d8f, barriga: 0xe9f5db, pico: 0xffb703 },
  },
  {
    id: 'torito', icono: '🐂', kart: 0x8b5a2b,
    cuerpo: {
      tipo: 'toro', color: 0x8b5a2b, hocico: 0xd4a373, cuernos: 0xf8f9fa, panuelo: 0xd62828, mechon: 0x5c3a1e,
      pezunas: 0x3d2b1f,
    },
  },
  {
    id: 'teclita', icono: '🎹', kart: 0xf5f5f5, detalle: 0x111111,
    cuerpo: {
      tipo: 'pianista', piel: 0xf1c27d, pelo: 0x6b3e26, vestido: 0x3a86ff, volante: 0x265fc4, cuello: 0xffffff,
      cintillo: 0xffffff, teclas: 0x111111, nota: 0xffd166, zapatos: 0x1d3557,
    },
  },
  { id: 'calabacita', icono: '🎃', kart: 0x7b2cbf, cuerpo: { tipo: 'calabaza', color: 0xff8c1a } },
  { id: 'fantasmin', icono: '👻', kart: 0x90e0ef, cuerpo: { tipo: 'fantasma', color: 0xffffff } },
];
