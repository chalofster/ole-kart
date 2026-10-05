import { armarPersonaje, pieza, esfera, cilindro, aro } from './esqueleto.js';

// Calabacita: calabaza con gajos y cara simpática dibujada (no tallada), tallo con hojita y cuello de hojas.
export function calabaza(c) {
  const forma = [1.1, 0.85, 1.1];
  const hojas = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return pieza(esfera(0.15), c.hojas, [Math.cos(a) * 0.27, 0.62, Math.sin(a) * 0.27], { esc: [1, 0.3, 0.55], rot: [0, -a, 0] });
  });
  // Líneas de los gajos: aros verticales que no pasan por la cara.
  const gajos = [Math.PI / 2 - 0.6, Math.PI / 2, Math.PI / 2 + 0.6].map((a) =>
    pieza(aro(0.465, 0.02), c.gajos, [0, 0, 0], { rot: [0, a, 0], esc: forma, contorno: false }));
  return armarPersonaje({
    cuerpo: [
      pieza(cilindro(0.28, 0.34, 0.55), c.hojas, [0, 0.3, 0]),
      ...hojas,
      ...[1, -1].map((s) => pieza(esfera(0.09), c.hojas, [0.2, 0.04, s * 0.13])),
    ],
    cabeza: {
      centro: [0, 1, 0],
      radio: 0.46,
      escala: forma,
      piezas: [
        pieza(esfera(0.46), c.color, [0, 0, 0], { esc: forma }),
        ...gajos,
        pieza(cilindro(0.05, 0.07, 0.22, 8), c.tallo, [0, 0.44, 0]),
        pieza(esfera(0.1), c.hojas, [0.09, 0.5, 0.06], { esc: [1, 0.25, 0.5], rot: [0, 0, -0.4] }),
      ],
    },
    brazos: {
      hombros: [[0.02, 0.5, 0.3], [0.02, 0.5, -0.3]],
      piezas: [pieza(cilindro(0.05, 0.05, 0.3), c.hojas, [0, -0.17, 0]), pieza(esfera(0.08), c.hojas, [0, -0.35, 0])],
    },
  });
}

// Fantasmín: blanco y tierno, con borde ondulado abajo; flota subiendo y bajando.
export function fantasma(c) {
  const borde = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return pieza(esfera(0.12), c.color, [Math.cos(a) * 0.36, 0.08, Math.sin(a) * 0.36]);
  });
  return armarPersonaje({
    cuerpo: [pieza(cilindro(0.4, 0.42, 0.55), c.color, [0, 0.38, 0]), ...borde],
    cabeza: { centro: [0, 0.82, 0], radio: 0.42, piezas: [pieza(esfera(0.42), c.color, [0, 0, 0])] },
    brazos: {
      hombros: [[0.05, 0.5, 0.4], [0.05, 0.5, -0.4]],
      piezas: [pieza(esfera(0.11), c.color, [0, -0.12, 0], { esc: [1, 1.5, 1] })],
    },
    flota: true,
  });
}
