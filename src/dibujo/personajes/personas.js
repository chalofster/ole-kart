import {
  armarPersonaje, pieza, esfera, cono, cilindro, aro, caja, casquete, mitadCilindro, mitadDisco, brazoSimple,
} from './esqueleto.js';

// Pelo sobre la cabeza, inclinado hacia atrás para dejar libre la frente.
const peloArriba = (color, inclinacion = 0.5) => pieza(casquete(0.445), color, [0, 0, 0], { rot: [0, 0, inclinacion] });
// Pelo que cubre la nuca y los costados, dejando libre la cara.
const peloAtras = (color) => pieza(esfera(0.435), color, [-0.05, 0.02, 0]);
const pies = (color) => [1, -1].map((s) => pieza(esfera(0.09), color, [0.2, 0.04, s * 0.13]));
const HOMBROS = [[0.02, 0.62, 0.33], [0.02, 0.62, -0.33]];

// Bailarina flamenca: vestido rojo de lunares con volante, mantón con flecos, moño con peineta, flor y aros.
export function flamenca(c) {
  const lunares = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const [y, r] = i % 2 ? [0.5, 0.335] : [0.28, 0.345];
    return pieza(esfera(0.045), c.lunares, [Math.cos(a) * r, y, Math.sin(a) * r], { contorno: false });
  });
  const flecos = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return pieza(cono(0.025, 0.1, 5), c.fleco, [Math.cos(a) * 0.41, 0.48, Math.sin(a) * 0.41], { rot: [Math.PI, 0, 0], contorno: false });
  });
  const petalos = [0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return pieza(esfera(0.065), c.flor, [-0.12 + Math.cos(a) * 0.075, 0.26 + Math.sin(a) * 0.075, 0.34]);
  });
  const adornosPeineta = [0.15, 0.3, 0.5, 0.7, 0.85].map((f) =>
    pieza(esfera(0.035), c.peineta, [-0.38, 0.4 + Math.sin(f * Math.PI) * 0.27, Math.cos(f * Math.PI) * 0.27], { contorno: false }));
  return armarPersonaje({
    cuerpo: [
      pieza(esfera(0.34), c.vestido, [0, 0.38, 0], { esc: [1, 1.15, 1] }),
      pieza(aro(0.32, 0.07), c.volante, [0, 0.14, 0], { rot: [Math.PI / 2, 0, 0] }),
      ...lunares,
      pieza(cilindro(0.3, 0.42, 0.2), c.manton, [0, 0.62, 0]),
      ...flecos,
      ...pies(c.zapatos),
    ],
    cabeza: {
      centro: [0, 1.08, 0],
      radio: 0.42,
      piezas: [
        pieza(esfera(0.42), c.piel, [0, 0, 0]),
        peloArriba(c.pelo),
        peloAtras(c.pelo),
        pieza(esfera(0.2), c.pelo, [-0.3, 0.3, 0]),
        pieza(mitadDisco(0.26, 0.04), c.peineta, [-0.38, 0.4, 0], { rot: [0, 0, Math.PI / 2] }),
        ...adornosPeineta,
        ...petalos,
        pieza(esfera(0.05), c.centroFlor, [-0.12, 0.26, 0.39], { contorno: false }),
        ...[1, -1].map((s) => pieza(esfera(0.05), c.aros, [0.02, -0.28, s * 0.31], { contorno: false })),
      ],
    },
    brazos: { hombros: HOMBROS, piezas: brazoSimple(c.vestido, c.piel, c.piel) },
  });
}

const RULOS = [
  [0.12, 0.4, 0], [-0.08, 0.42, 0.14], [-0.08, 0.42, -0.14], [-0.28, 0.32, 0.1], [-0.28, 0.32, -0.1],
  [0.06, 0.36, 0.24], [0.06, 0.36, -0.24],
];

// Bailarín de la noche: chaqueta roja con hombreras, franjas negras en V adelante y dos atrás, pelo con rulos.
// Sin sombrero ni guante.
export function bailarin(c) {
  // Media vuelta de aro horizontal por la espalda.
  const franjaAtras = (radio, y) => pieza(aro(radio, 0.03, Math.PI), c.franjas, [0, y, 0], { rot: [Math.PI / 2, 0, Math.PI / 2], contorno: false });
  return armarPersonaje({
    cuerpo: [
      pieza(esfera(0.34), c.chaqueta, [0, 0.38, 0], { esc: [1, 1.15, 1] }),
      ...[1, -1].map((s) => pieza(esfera(0.13), c.chaqueta, [0, 0.66, s * 0.27], { esc: [1, 0.6, 1] })),
      ...[1, -1].map((s) => pieza(caja(0.04, 0.26, 0.05), c.franjas, [0.33, 0.42, s * 0.08], { rot: [s * 0.45, 0, 0], contorno: false })),
      franjaAtras(0.335, 0.32),
      franjaAtras(0.325, 0.5),
      ...pies(c.zapatos),
    ],
    cabeza: {
      centro: [0, 1.08, 0],
      radio: 0.42,
      piezas: [
        pieza(esfera(0.42), c.piel, [0, 0, 0]),
        peloArriba(c.pelo, 0.45),
        peloAtras(c.pelo),
        ...RULOS.map((pos) => pieza(esfera(0.1), c.pelo, pos)),
      ],
    },
    brazos: { hombros: HOMBROS, piezas: brazoSimple(c.chaqueta, c.chaqueta, c.piel) },
  });
}

// Pianista: vestido azul con cuello blanco, pelo largo, cintillo con teclas y una nota que flota.
export function pianista(c) {
  const teclas = [0.3, 0.4, 0.5, 0.6, 0.7].map((f) =>
    pieza(caja(0.05, 0.06, 0.05), c.teclas, [0.1, 0.46 * Math.sin(f * Math.PI), -0.46 * Math.cos(f * Math.PI)], { contorno: false }));
  return armarPersonaje({
    cuerpo: [
      pieza(esfera(0.34), c.vestido, [0, 0.38, 0], { esc: [1, 1.15, 1] }),
      pieza(aro(0.32, 0.06), c.volante, [0, 0.14, 0], { rot: [Math.PI / 2, 0, 0] }),
      pieza(aro(0.22, 0.04), c.cuello, [0, 0.7, 0], { rot: [Math.PI / 2, 0, 0] }),
      ...pies(c.zapatos),
    ],
    cabeza: {
      centro: [0, 1.08, 0],
      radio: 0.42,
      piezas: [
        pieza(esfera(0.42), c.piel, [0, 0, 0]),
        peloArriba(c.pelo),
        peloAtras(c.pelo),
        pieza(mitadCilindro(0.36, 0.42, 0.6), c.pelo, [-0.04, -0.3, 0]),
        // El cintillo pasa por arriba de la cabeza, de oreja a oreja.
        pieza(aro(0.44, 0.035, Math.PI), c.cintillo, [0.1, 0, 0], { rot: [0, Math.PI / 2, 0] }),
        ...teclas,
      ],
    },
    brazos: { hombros: HOMBROS, piezas: brazoSimple(c.vestido, c.piel, c.piel) },
    extras: {
      nota: {
        pos: [-0.15, 1.58, 0.15],
        piezas: [
          pieza(esfera(0.07), c.nota, [0, 0, 0], { esc: [1.2, 0.9, 1] }),
          pieza(cilindro(0.015, 0.015, 0.22, 6), c.nota, [0.06, 0.11, 0]),
          pieza(caja(0.1, 0.03, 0.02), c.nota, [0.1, 0.2, 0], { rot: [0, 0, -0.5] }),
        ],
      },
    },
  });
}
