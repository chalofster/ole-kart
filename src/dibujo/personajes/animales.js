import { armarPersonaje, pieza, esfera, cono, cilindro, aro } from './esqueleto.js';

// Gato: barriga clara, collar con cascabel, orejas con interior rosado, bigotes y cola con punta blanca.
export function gato(c) {
  const bigotes = [];
  for (const s of [1, -1]) {
    for (const dy of [0, -0.06]) {
      bigotes.push(pieza(cilindro(0.008, 0.008, 0.28, 4), c.bigotes, [0.3, -0.04 + dy, s * 0.3], { rot: [Math.PI / 2, 0, 0], contorno: false }));
    }
  }
  return armarPersonaje({
    cuerpo: [
      pieza(esfera(0.34), c.color, [0, 0.36, 0], { esc: [1, 1.1, 1] }),
      pieza(esfera(0.25), c.barriga, [0.14, 0.34, 0], { esc: [0.6, 1, 1], contorno: false }),
      pieza(aro(0.25, 0.04), c.collar, [0, 0.66, 0], { rot: [Math.PI / 2, 0, 0] }),
      pieza(esfera(0.06), c.cascabel, [0.27, 0.6, 0]),
      ...[1, -1].map((s) => pieza(esfera(0.09), c.color, [0.2, 0.04, s * 0.13])),
    ],
    cabeza: {
      centro: [0, 1.05, 0],
      radio: 0.42,
      piezas: [
        pieza(esfera(0.42), c.color, [0, 0, 0]),
        ...[1, -1].map((s) => pieza(cono(0.14, 0.3, 4), c.color, [-0.02, 0.38, s * 0.22], { rot: [s * 0.35, 0, 0] })),
        ...[1, -1].map((s) => pieza(cono(0.08, 0.18, 4), c.orejas, [0.05, 0.36, s * 0.21], { rot: [s * 0.35, 0, 0], contorno: false })),
        pieza(esfera(0.05), c.nariz, [0.415, -0.02, 0], { contorno: false }),
        ...bigotes,
      ],
    },
    brazos: {
      hombros: [[0.02, 0.55, 0.3], [0.02, 0.55, -0.3]],
      piezas: [pieza(cilindro(0.07, 0.07, 0.28), c.color, [0, -0.16, 0]), pieza(esfera(0.085), c.barriga, [0, -0.32, 0])],
    },
    extras: {
      cola: {
        pos: [-0.3, 0.25, 0],
        piezas: [
          pieza(cilindro(0.055, 0.055, 0.5), c.color, [-0.12, 0.2, 0], { rot: [0, 0, 0.55] }),
          pieza(esfera(0.08), c.punta, [-0.26, 0.42, 0]),
        ],
      },
    },
  });
}

// Pájaro: barriga clara, pico amarillo, copete de tres plumas y alas que aletean con el turbo.
export function pajaro(c) {
  return armarPersonaje({
    cuerpo: [
      pieza(esfera(0.36), c.color, [0, 0.4, 0], { esc: [1, 1.15, 1] }),
      pieza(esfera(0.27), c.barriga, [0.15, 0.38, 0], { esc: [0.6, 1, 1], contorno: false }),
      ...[1, -1].map((s) => pieza(esfera(0.08), c.pico, [0.22, 0.03, s * 0.12])),
    ],
    cabeza: {
      centro: [0, 1.08, 0],
      radio: 0.4,
      piezas: [
        pieza(esfera(0.4), c.color, [0, 0, 0]),
        pieza(cono(0.1, 0.26, 10), c.pico, [0.44, -0.03, 0], { rot: [0, 0, -Math.PI / 2] }),
        ...[-1, 0, 1].map((i) => pieza(cono(0.05, 0.26, 6), c.color, [-0.05 + i * 0.07, 0.45, 0], { rot: [0, 0, i * 0.35] })),
      ],
    },
    brazos: {
      hombros: [[0, 0.55, 0.34], [0, 0.55, -0.34]],
      piezas: [pieza(esfera(0.2), c.color, [0, -0.15, 0], { esc: [0.9, 1.1, 0.35] })],
    },
    alas: true,
  });
}

// Torito: hocico crema, mechón en la frente, cuernos blancos cortos, pañuelo rojo anudado y cola con pompón.
export function toro(c) {
  return armarPersonaje({
    cuerpo: [
      pieza(esfera(0.36), c.color, [0, 0.38, 0], { esc: [1, 1.1, 1] }),
      pieza(cono(0.36, 0.22, 16), c.panuelo, [0, 0.7, 0]),
      pieza(esfera(0.08), c.panuelo, [-0.33, 0.66, 0]),
      ...[1, -1].map((s) => pieza(cono(0.05, 0.16, 6), c.panuelo, [-0.38, 0.56, s * 0.06], { rot: [Math.PI + s * 0.3, 0, 0] })),
      ...[1, -1].map((s) => pieza(esfera(0.1), c.pezunas, [0.2, 0.05, s * 0.14])),
    ],
    cabeza: {
      centro: [0, 1.1, 0],
      radio: 0.42,
      piezas: [
        pieza(esfera(0.42), c.color, [0, 0, 0]),
        pieza(esfera(0.2), c.hocico, [0.33, -0.24, 0], { esc: [0.6, 0.65, 1.1] }),
        ...[1, -1].map((s) => pieza(esfera(0.025), c.mechon, [0.45, -0.24, s * 0.07], { contorno: false })),
        ...[1, -1].map((s) => pieza(cono(0.07, 0.28, 8), c.cuernos, [0, 0.34, s * 0.3], { rot: [s * 0.9, 0, 0] })),
        ...[-0.06, 0, 0.06].map((z) => pieza(esfera(0.08), c.mechon, [0.22, 0.36, z])),
        ...[1, -1].map((s) => pieza(esfera(0.1), c.color, [-0.05, 0.18, s * 0.42], { esc: [0.4, 0.6, 1] })),
      ],
    },
    brazos: {
      hombros: [[0.02, 0.58, 0.34], [0.02, 0.58, -0.34]],
      piezas: [pieza(cilindro(0.075, 0.075, 0.28), c.color, [0, -0.16, 0]), pieza(esfera(0.085), c.pezunas, [0, -0.32, 0])],
    },
    extras: {
      cola: {
        pos: [-0.36, 0.3, 0],
        piezas: [
          pieza(cilindro(0.03, 0.03, 0.4, 6), c.color, [-0.08, -0.15, 0], { rot: [0, 0, -0.4] }),
          pieza(esfera(0.08), c.mechon, [-0.16, -0.33, 0]),
        ],
      },
    },
  });
}
