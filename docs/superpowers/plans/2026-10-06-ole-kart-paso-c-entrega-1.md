---
titulo: "Plan de implementación: Olé Kart, paso C, entrega 1 (elegir pista, Feria y Playa)"
tipo: plan de implementación
fecha: 06-10-2026
estado: pendiente de revisión
---

# Olé Kart, paso C, entrega 1: plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** que los niños elijan la pista antes de cada carrera (paso 🗺️ del menú, 🎲 y botón 🗺️ en el podio), con dos pistas nuevas, 🎡 Feria flamenca y 🏖️ Playa, cada una con su ambiente y su música original.

**Arquitectura:** cada pista es una ficha: el recorrido vive en la lógica (`src/logica/pistas.js`), el aspecto en un ambiente de dibujo (`src/dibujo/ambientes/<id>.js`) y la música en una partitura (`src/sonido/partituras.js`), las tres con el mismo id. `crearMundos` arma el mundo de la pista elegida y libera el anterior. La elección de pista es lógica pura (`eleccion.js`) que usan el menú y el podio.

**Tecnologías:** las del proyecto: Three.js 0.186 (`MeshToonMaterial` vía `dibujo`, `mergeGeometries`), Vite 8.3, Vitest 5.0, Web Audio, SVG para el dibujo de las tarjetas.

**Diseño:** `docs/superpowers/specs/2026-10-06-ole-kart-paso-c-pistas-design.md`. Leerlo antes de ejecutar. Este plan cubre solo la entrega 1; la 2 (Ciudad disco y Montaña nevada) tendrá su propio plan.

## Restricciones globales

- Raíz: `C:\Users\Gfigueroa\OleKart`. En PowerShell `npm` está bloqueado: usar la herramienta Bash. Los archivos de trabajo usan CRLF.
- Trabajar en la rama `pistas-1`, creada desde `main`.
- `src/logica/` no importa Three.js ni usa el navegador. Las pruebas de Vitest corren en Node: todo módulo de dibujo debe poder armarse sin `document`.
- Three.js usa (x, altura, -y) de las coordenadas lógicas. En un lugar junto a la pista, x local apunta hacia adelante y z local hacia la derecha.
- Manejo igual en todas las pistas: `MEDIO_ANCHO`, `VALLA`, `RAMPA` y las reglas del kart no cambian.
- Recorridos: largo entre 850 y 1.250 unidades; 16 puntos de control; de 1 a 3 turbos; 1 o 2 rampas, cada una en una recta; de 3 a 5 filas de 4 cajas a más de 20 unidades de turbos y rampas; meta y parrilla en una recta.
- Ambientes: el camino contrasta con el suelo (razón de al menos 1,5). Decorado nuevo con `dibujo` (sombras planas de 3 tonos), sin contorno, piezas repetidas juntas por color. Lo que se mueve usa solo el reloj del dibujo `t` (quieto en pausa). Noche queda sin cambios visibles.
- Música: Noche suena nota por nota como hoy. Partituras nuevas de 8 compases de 16 semicorcheas, tempo entre 100 y 170. Todas originales: no imitan ninguna canción conocida (ni villancicos, ni éxitos de surf o disco, ni *Thriller*). La canción propia 🎵 reemplaza la música de todas las pistas.
- Sin marcas, logos ni personajes de otros juegos o películas.
- Rendimiento: 60 cuadros por segundo con 2 jugadores en cada pista (aceptable: 55 o más en la medición).
- **Punto de control:** al terminar la tarea 6 (Feria) se muestran capturas y la pista a Gonzalo; la tarea 7 (Playa) se hace solo con su visto bueno.
- Cada `commit` termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Publicar (unir a `main` y hacer `push`) exige la confirmación de Gonzalo, en pasos separados y visibles.

## Foco de revisión

1. **Dos controles pulsan A en el mismo cuadro del paso 🗺️** → la pista se elige una sola vez y nada más cambia. Prueba en la tarea 4 ("una vez elegida, otras pulsaciones no cambian nada").
2. **Toques del mouse fuera de lugar** (una tarjeta o un botón que no existe) → no pasa nada. Pruebas en la tarea 4 (elección y podio, "fuera de rango").
3. **Cambiar de pista muchas veces seguidas** (🗺️ en el podio una y otra vez) → la memoria no crece. Prueba en la tarea 3 (liberar el mundo anterior) y medición en el navegador en las tareas 6, 7 y 8.
4. **Pausa en una pista con decorado que se mueve** (noria, espuma) → todo queda quieto. Prueba en la tarea 3 ("depende solo del reloj del dibujo"), que vale para cada ambiente nuevo; captura en pausa en la tarea 8.
5. **Una pista del catálogo sin ambiente o sin música** → la suite falla antes de publicar. Prueba en la tarea 3 ("cada pista tiene su ambiente y su música").

## Estructura de archivos

| Archivo | Cambio |
|---|---|
| `src/logica/pista.js` | `rampas` y `filas` por pista; `alturaDelPiso` con varias rampas |
| `src/logica/pistas.js` | Nuevo: catálogo `PISTAS`, `indicePista`; recorridos de Feria y Playa |
| `src/logica/objetos.js` | Las cajas salen de `pista.filas` |
| `src/logica/decorado.js` | `limites(pista)` |
| `src/logica/eleccion.js` | Nuevo: elegir pista con cruceta, mouse y 🎲 |
| `src/logica/menu.js` | Tercer paso, pista |
| `src/logica/podio.js` | Nuevo: botones 🔁 🗺️ 🏠 del podio |
| `src/sonido/musica.js` | Lectura genérica de partituras |
| `src/sonido/partituras.js` | Nuevo: partituras de Noche, Feria y Playa |
| `src/sonido/sonido.js` | Música con la partitura de la pista; instrumento `redoble` |
| `src/dibujo/ambientes/comun.js` | Nuevo: `juntar`, `juntarBrillo`, `colocar`, `apuntando`, `astro`, `lejosDeLaMeta` |
| `src/dibujo/ambientes/noche.js` | Nuevo: el ambiente de hoy (sale de `decorado3d.js` y de `pista3d.js`) |
| `src/dibujo/ambientes/feria.js`, `playa.js` | Nuevos |
| `src/dibujo/ambientes/index.js` | Nuevo: `AMBIENTES` por id |
| `src/dibujo/decorado3d.js` | Se borra (pasa a `ambientes/noche.js`) |
| `src/dibujo/pista3d.js` | Colores y meta del ambiente; varias rampas |
| `src/dibujo/escena.js` | `crearMundo(pista, ambiente)`, `soltar()`, decorado que se mueve |
| `src/dibujo/objetos3d.js` | Exporta `GEOMETRIAS_OBJETOS` |
| `src/dibujo/mundos.js` | Nuevo: un mundo armado a la vez |
| `src/juego.js` | `ctx.usarPista(id)` |
| `src/pantallas/tarjetas.js` | Nuevo: tarjetas con el dibujo de cada recorrido |
| `src/pantallas/inicio.js`, `podio.js`, `carrera.js`, `src/estilo.css` | Paso 🗺️, botón 🗺️, música y última pista corrida |

---

## Tarea 1: recorridos como fichas

**Archivos:**
- Modificar: `src/logica/pista.js`, `src/logica/objetos.js`, `src/dibujo/pista3d.js`
- Crear: `src/logica/pistas.js`, `tests/pistas.test.js`
- Modificar pruebas: `tests/objetos.test.js`, `tests/kart.test.js`, `tests/pista.test.js`

**Interfaces:**
- Consume: `crearPista`, `simularCarrera`, `ayudar`, `crearObjetos` existentes.
- Produce: recorrido `{ puntos, turbos, rampas: [[x, y], ...], filas: [s, ...] }`; `pista.rampas` (distancias), `pista.filas`; `PISTAS = [{ id, icono, nombre, recorrido }]`; `indicePista(id) → índice o -1`. `FILAS` deja de existir en `objetos.js`.

- [ ] **Paso 1: crear la rama**

```bash
cd /c/Users/Gfigueroa/OleKart && git checkout main && git checkout -b pistas-1 && git status --short
```

Expected: rama `pistas-1`, sin cambios pendientes.

- [ ] **Paso 2: escribir la prueba que falla**

Crear `tests/pistas.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { PISTAS, indicePista } from '../src/logica/pistas.js';
import {
  crearPista, puntoEn, diferencia, diferenciaAngular, alturaDelPiso, MEDIO_ANCHO, VALLA, RAMPA, PUNTOS_DE_CONTROL,
} from '../src/logica/pista.js';
import { crearKart, pasoKart, TURBO_PISO } from '../src/logica/kart.js';
import { actualizarVueltas } from '../src/logica/carrera.js';
import { crearObjetos, LATERALES } from '../src/logica/objetos.js';
import { simularCarrera, ayudar, QUIETO } from '../src/logica/pilotos.js';
import { azarConSemilla } from '../src/logica/azar.js';

const dt = 1 / 60;

// Cuánto se aparta el rumbo del camino, entre dos distancias, del rumbo que tenía en la primera.
function giroEntre(pista, desde, hasta) {
  const inicial = puntoEn(pista, desde).rumbo;
  let peor = 0;
  for (let s = desde; s <= hasta; s += 1) peor = Math.max(peor, Math.abs(diferenciaAngular(inicial, puntoEn(pista, s).rumbo)));
  return peor;
}

describe('catálogo de pistas', () => {
  it('Noche es la primera y cada pista tiene id, ícono y nombre propios', () => {
    expect(PISTAS[0].id).toBe('noche');
    for (const clave of ['id', 'icono', 'nombre']) expect(new Set(PISTAS.map((p) => p[clave])).size).toBe(PISTAS.length);
    expect(indicePista('noche')).toBe(0);
    expect(indicePista('no-existe')).toBe(-1);
  });
});

describe.each(PISTAS)('recorrido de $nombre', ({ recorrido }) => {
  const pista = crearPista(recorrido);
  const { muestras, largo } = pista;
  const n = muestras.length;

  it('mide entre 850 y 1.250 unidades y tiene 16 puntos de control', () => {
    expect(largo).toBeGreaterThanOrEqual(850);
    expect(largo).toBeLessThanOrEqual(1250);
    expect(pista.controles).toHaveLength(PUNTOS_DE_CONTROL);
  });

  it('las vallas no se pliegan en ninguna curva', () => {
    let peor = Infinity;
    for (const lado of [1, -1]) {
      muestras.forEach((m, i) => {
        const sig = muestras[(i + 1) % n];
        const dx = sig.x + sig.nx * VALLA * lado - (m.x + m.nx * VALLA * lado);
        const dy = sig.y + sig.ny * VALLA * lado - (m.y + m.ny * VALLA * lado);
        peor = Math.min(peor, dx * m.tx + dy * m.ty);
      });
    }
    expect(peor).toBeGreaterThan(0);
  });

  it('las partes que no son vecinas quedan separadas por más que dos vallas', () => {
    let menor = Infinity;
    for (let i = 0; i < n; i += 3) {
      for (let j = i + 3; j < n; j += 3) {
        if (Math.abs(diferencia(muestras[i].s, muestras[j].s, largo)) < 70) continue;
        menor = Math.min(menor, Math.hypot(muestras[i].x - muestras[j].x, muestras[i].y - muestras[j].y));
      }
    }
    expect(menor).toBeGreaterThan(2 * VALLA + 10);
  });

  it('la meta y la parrilla de salida están en una recta', () => {
    expect(giroEntre(pista, largo - 30, largo + 10)).toBeLessThan(0.05);
  });

  it('tiene de 1 a 3 turbos y 1 o 2 rampas, cada rampa en una recta para aterrizar en el camino', () => {
    expect(pista.turbos.length).toBeGreaterThanOrEqual(1);
    expect(pista.turbos.length).toBeLessThanOrEqual(3);
    expect(pista.rampas.length).toBeGreaterThanOrEqual(1);
    expect(pista.rampas.length).toBeLessThanOrEqual(2);
    for (const r of pista.rampas) expect(giroEntre(pista, r - 10, r + RAMPA.largo + 50)).toBeLessThan(0.1);
  });

  it('tiene de 3 a 5 filas de 4 cajas, lejos de los turbos y de las rampas', () => {
    expect(pista.filas.length).toBeGreaterThanOrEqual(3);
    expect(pista.filas.length).toBeLessThanOrEqual(5);
    expect(crearObjetos(pista).cajas).toHaveLength(pista.filas.length * LATERALES.length);
    const lejos = (a, s) => Math.abs(diferencia(a, s, largo)) > 20;
    for (const s of pista.filas) {
      for (const t of pista.turbos) expect(lejos(t, s) && lejos(t + TURBO_PISO.largo, s)).toBe(true);
      for (const r of pista.rampas) expect(lejos(r, s) && lejos(r + RAMPA.largo, s)).toBe(true);
    }
  });

  it('cada rampa sube de 0 a su altura y fuera de ellas el piso es plano', () => {
    for (const r of pista.rampas) {
      expect(alturaDelPiso(pista, r - 1, 0)).toBe(0);
      expect(alturaDelPiso(pista, r + RAMPA.largo / 2, 0)).toBeCloseTo(RAMPA.alto / 2, 6);
      expect(alturaDelPiso(pista, r + RAMPA.largo + 0.5, 0)).toBe(0);
      expect(alturaDelPiso(pista, r + 3, MEDIO_ANCHO + 0.5)).toBe(0);
    }
  });
});

describe.each(PISTAS)('carrera en $nombre', ({ recorrido }) => {
  const pista = crearPista(recorrido);
  const normal = simularCarrera(pista, { azar: azarConSemilla(42) });

  it('a velocidad normal los 8 rivales terminan y el ganador tarda entre 100 y 170 s', () => {
    expect(normal.estado).toBe('fin');
    expect(normal.karts.every((k) => k.termino)).toBe(true);
    const ganador = Math.min(...normal.karts.map((k) => k.tiempoFinal));
    expect(ganador).toBeGreaterThan(100);
    expect(ganador).toBeLessThan(170);
  });

  it.each([1.25, 1.5])('a %s× también terminan todos, más rápido', (clase) => {
    const c = simularCarrera(pista, { azar: azarConSemilla(42), clase });
    expect(c.estado).toBe('fin');
    expect(c.karts.every((k) => k.termino)).toBe(true);
    expect(c.tiempo).toBeLessThan((normal.tiempo / clase) * 1.1);
  }, 30000);

  it.each([1, 1.25, 1.5])('a %s× el modo ayuda da la vuelta sin salirse del camino, aunque el niño gire siempre', (clase) => {
    for (const giro of [0, 1, -1]) {
      const k = crearKart(pista, 5);
      Object.assign(k, { vuelta: 0, cp: 1, factor: clase });
      let peor = 0;
      for (let i = 0; i < 60 * 100 && k.vuelta < 1; i++) {
        const antes = k.s;
        pasoKart(k, ayudar({ ...QUIETO, giro }, k, pista), pista, dt, clase);
        actualizarVueltas(k, antes, pista);
        peor = Math.max(peor, Math.abs(k.lateral));
      }
      expect(k.vuelta).toBe(1);
      expect(peor).toBeLessThan(MEDIO_ANCHO);
    }
  }, 30000);
});
```

- [ ] **Paso 3: ver que falla**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run tests/pistas.test.js`
Expected: FAIL al cargar: no existe `../src/logica/pistas.js`.

- [ ] **Paso 4: varias rampas y filas propias en `src/logica/pista.js`**

Reemplazar el comentario y la definición de `NOCHE` (líneas 9 a 20) por:

```js
// Cada recorrido: puntos de la curva central (el primero es la meta), turbos y rampas (puntos junto
// al camino, que se proyectan sobre él) y filas de cajas (distancias desde la meta).

// "Noche de Thriller", en sentido antihorario.
// Forma revisada: radio mínimo ~12 (la horquilla), vallas sin pliegues, partes separadas por más de 37.
export const NOCHE = {
  puntos: [
    [40, 0], [90, 0], [140, 0], [192, 7], [226, 42], [230, 98], [200, 134], [150, 150],
    [95, 152], [40, 150], [-15, 146], [-38, 136], [-48, 114], [-38, 91], [-15, 81],
    [10, 81], [48, 81], [72, 81], [86, 75], [92, 61], [86, 48], [72, 42], [48, 42],
    [10, 42], [-20, 42], [-35, 36], [-41, 21], [-35, 6], [-20, 0], [5, 0],
  ],
  turbos: [[110, 0], [130, 151], [20, 42]],
  rampas: [[70, 151]],
  filas: [35, 410, 660, 790],
};
```

En `crearPista`, reemplazar:

```js
  pista.rampa = proyectar(pista, def.rampa[0], def.rampa[1]).s;
```

por:

```js
  pista.rampas = def.rampas.map(([x, y]) => proyectar(pista, x, y).s);
  pista.filas = def.filas;
```

Reemplazar `alturaDelPiso` (desde su comentario hasta el final del archivo) por:

```js
// Cada rampa sube en línea recta y termina de golpe: el kart sale volando.
export function alturaDelPiso(pista, s, lateral) {
  if (Math.abs(lateral) > MEDIO_ANCHO) return 0;
  for (const r of pista.rampas) {
    const d = diferencia(r, s, pista.largo);
    if (d >= 0 && d <= RAMPA.largo) return (RAMPA.alto * d) / RAMPA.largo;
  }
  return 0;
}
```

- [ ] **Paso 5: catálogo `src/logica/pistas.js`**

```js
import { NOCHE } from './pista.js';

// Catálogo de pistas, en el orden de las tarjetas del menú. El id une la pista con su ambiente
// (src/dibujo/ambientes/) y su música (src/sonido/partituras.js).
export const PISTAS = [
  { id: 'noche', icono: '🌙', nombre: 'Noche de Thriller', recorrido: NOCHE },
];

export const indicePista = (id) => PISTAS.findIndex((p) => p.id === id);
```

- [ ] **Paso 6: cajas de cada pista en `src/logica/objetos.js`**

Reemplazar:

```js
// Filas de cajas: distancia por la pista y desplazamiento lateral de cada caja.
export const FILAS = [35, 410, 660, 790];
export const LATERALES = [-4.5, -1.5, 1.5, 4.5];
```

por:

```js
// Cada pista trae sus filas de cajas (pista.filas); acá, el desplazamiento lateral de cada caja de una fila.
export const LATERALES = [-4.5, -1.5, 1.5, 4.5];
```

y en `crearObjetos`, `FILAS.flatMap(` por `pista.filas.flatMap(`.

- [ ] **Paso 7: dibujar todas las rampas en `src/dibujo/pista3d.js`**

Reemplazar el bloque final de la rampa (desde `// Rampa: cuña amarilla` hasta antes de `return grupo;`) por:

```js
  for (const s of pista.rampas) grupo.add(rampa3D(pista, s, 0xffd166));
```

y agregar antes de `export function crearPista3D`:

```js
// Rampa: cuña que sube de 0 a RAMPA.alto desde la distancia s.
function rampa3D(pista, s, color) {
  const a = puntoEn(pista, s);
  const b = puntoEn(pista, s + RAMPA.largo);
  const m0 = pista.muestras[a.indice];
  const v = (p, lateral, h) => [p.x + m0.nx * lateral, h, -(p.y + m0.ny * lateral)];
  const vertices = [
    ...v(a, -MEDIO_ANCHO, 0.03), ...v(a, MEDIO_ANCHO, 0.03),
    ...v(b, -MEDIO_ANCHO, RAMPA.alto), ...v(b, MEDIO_ANCHO, RAMPA.alto),
    ...v(b, -MEDIO_ANCHO, 0), ...v(b, MEDIO_ANCHO, 0),
  ];
  const cuna = new THREE.BufferGeometry();
  cuna.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  cuna.setIndex([0, 2, 1, 1, 2, 3, 2, 4, 3, 3, 4, 5, 0, 4, 2, 1, 3, 5]);
  cuna.computeVertexNormals();
  return new THREE.Mesh(cuna, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
}
```

- [ ] **Paso 8: ajustar las pruebas que usaban una sola rampa y `FILAS`**

En `tests/pista.test.js`: `pista.rampa - 440` → `pista.rampas[0] - 440`, y `const r = pista.rampa;` → `const r = pista.rampas[0];`.

En `tests/kart.test.js`: `crearKart(pista, pista.rampa - 20)` → `crearKart(pista, pista.rampas[0] - 20)`.

En `tests/objetos.test.js`:
- Importaciones: `import { crearPista, NOCHE } from '../src/logica/pista.js';`, `import { crearKart, KART } from '../src/logica/kart.js';` y quitar `FILAS` de la importación de `objetos.js`.
- Reemplazar la prueba `'hay cuatro filas de cuatro, lejos de las flechas de turbo y de la rampa'` (la distancia a turbos y rampas ya la revisa `pistas.test.js` en cada pista) por:

```js
  it('las cajas salen de las filas de la pista, cuatro por fila', () => {
    const { cajas } = crearObjetos(pista);
    expect(cajas).toHaveLength(pista.filas.length * LATERALES.length);
    expect(new Set(cajas.map((c) => c.s))).toEqual(new Set(pista.filas));
  });
```

- `FILAS[0]` → `pista.filas[0]` y `FILAS[1]` → `pista.filas[1]` en el resto del archivo.

Luego: `grep -rn "FILAS\|pista\.rampa\b\|def\.rampa\b" src tests` debe quedar vacío.

- [ ] **Paso 9: ver que todo pasa**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run 2>&1 | tail -6`
Expected: PASS de toda la suite (las 204 de antes, con los cambios del paso 8, más las de `pistas.test.js`).

- [ ] **Paso 10: commit**

```bash
cd /c/Users/Gfigueroa/OleKart && git add -A src tests && git commit -q -F - <<'EOF'
Cada pista es una ficha con sus rampas y sus filas de cajas; reglas comunes probadas en todas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tarea 2: música por partitura

**Archivos:**
- Crear: `src/sonido/partituras.js`, `tests/fixtures/musica-noche.json`
- Reemplazar: `src/sonido/musica.js`, `src/sonido/sonido.js`, `tests/musica.test.js`
- Modificar: `src/pantallas/carrera.js`, `src/juego.js`

**Interfaces:**
- Consume: nada de las tareas anteriores.
- Produce: partitura `{ tempo, compases, acordes, bajos, ritmoBajo, golpesAcorde, bateria, rellenos?, melodia, escala, sonidos: { bajo, acorde, melodia: { onda, dur, vol, rasgueo? } } }`; `PARTITURAS` por id (`{ noche }` en esta tarea); `notasDelPaso(partitura, paso)`, `pasosDe(partitura)`, `semicorchea(partitura)`; `sonido.musica(encender, partitura)`; `ctx.pistaId`.

- [ ] **Paso 1: guardar las notas de Noche tal como suenan hoy (antes de tocar `musica.js`)**

```bash
cd /c/Users/Gfigueroa/OleKart && mkdir -p tests/fixtures && node --input-type=module -e "
import fs from 'node:fs';
import { notasDelPaso, PASOS } from './src/sonido/musica.js';
fs.writeFileSync('tests/fixtures/musica-noche.json', JSON.stringify(Array.from({ length: PASOS }, (_, p) => notasDelPaso(p))));
" && node -e "console.log(require('./tests/fixtures/musica-noche.json').length)"
```

Expected: `64`.

- [ ] **Paso 2: escribir la prueba que falla**

Reemplazar `tests/musica.test.js` por:

```js
import { describe, it, expect } from 'vitest';
import { notasDelPaso, pasosDe, semicorchea } from '../src/sonido/musica.js';
import { PARTITURAS } from '../src/sonido/partituras.js';
import notasDeNoche from './fixtures/musica-noche.json';

const clase = (frec) => ((Math.round(12 * Math.log2(frec / 440)) + 69) % 12 + 12) % 12;
const claseMidi = (midi) => ((midi % 12) + 12) % 12;
const BATERIA = ['bombo', 'palmas', 'platillo', 'redoble'];
const ONDAS = ['sine', 'square', 'sawtooth', 'triangle'];

describe('música de Noche', () => {
  it('suena exactamente igual que antes de tener una música por pista', () => {
    const noche = PARTITURAS.noche;
    expect(pasosDe(noche)).toBe(notasDeNoche.length);
    notasDeNoche.forEach((notas, p) => expect(notasDelPaso(noche, p)).toEqual(notas));
    expect(semicorchea(noche)).toBeCloseTo(60 / 116 / 4, 9);
  });
});

describe.each(Object.entries(PARTITURAS))('partitura de %s', (id, partitura) => {
  const total = pasosDe(partitura);
  const todas = () => Array.from({ length: total }, (_, p) => ({ p, notas: notasDelPaso(partitura, p) }));

  it('es un bucle exacto de compases de 16 semicorcheas, a un tempo bailable', () => {
    expect(total).toBe(partitura.compases * 16);
    expect(partitura.compases).toBe(id === 'noche' ? 4 : 8);
    expect(partitura.tempo).toBeGreaterThanOrEqual(100);
    expect(partitura.tempo).toBeLessThanOrEqual(170);
    for (let p = 0; p < total; p++) expect(notasDelPaso(partitura, p + total)).toEqual(notasDelPaso(partitura, p));
  });

  it('el bajo y los acordes usan solo notas del acorde de su compás', () => {
    for (const { p, notas } of todas()) {
      const acorde = partitura.acordes[Math.floor(p / 16)].map(claseMidi);
      for (const n of notas) {
        if (n.tipo === 'bajo') expect(acorde).toContain(clase(n.frec));
        if (n.tipo === 'acorde') n.frecs.forEach((f) => expect(acorde).toContain(clase(f)));
      }
    }
  });

  it('la melodía usa su escala y suena al menos 4 veces en cada compás', () => {
    const porCompas = Array(partitura.compases).fill(0);
    for (const { p, notas } of todas()) {
      for (const n of notas) {
        if (n.tipo !== 'melodia') continue;
        expect(partitura.escala).toContain(clase(n.frec));
        porCompas[Math.floor(p / 16)] += 1;
      }
    }
    porCompas.forEach((cantidad) => expect(cantidad).toBeGreaterThanOrEqual(4));
  });

  it('cada nota tiene un instrumento conocido con su sonido y un volumen moderado', () => {
    for (const { notas } of todas()) {
      for (const n of notas) {
        if (BATERIA.includes(n.tipo)) continue;
        const s = partitura.sonidos[n.tipo];
        expect(ONDAS).toContain(s.onda);
        expect(s.dur).toBeGreaterThan(0);
        expect(s.vol).toBeGreaterThan(0);
        expect(s.vol).toBeLessThanOrEqual(0.25);
      }
    }
  });
});
```

- [ ] **Paso 3: ver que falla**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run tests/musica.test.js`
Expected: FAIL al cargar: no existe `../src/sonido/partituras.js`.

- [ ] **Paso 4: `src/sonido/partituras.js`**

```js
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
```

- [ ] **Paso 5: reemplazar `src/sonido/musica.js`**

```js
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
```

Run: `grep -rn "TEMPO\|SEMICORCHEA\|PASOS\|ACORDES" src` → solo debe aparecer `src/sonido/sonido.js` (se corrige en el paso siguiente).

- [ ] **Paso 6: música con partitura en `src/sonido/sonido.js`**

1. Primera línea: `import { notasDelPaso, semicorchea } from './musica.js';` y debajo `import { NOCHE } from './partituras.js';`.
2. Comentario de `crearSonido`: `// Todo se sintetiza con Web Audio; las partituras de la música están en partituras.js.`
3. Reemplazar `INSTRUMENTOS` y `programar` (desde `const INSTRUMENTOS = {` hasta el cierre de `function programar`) por:

```js
  // La batería suena siempre igual; bajo, acordes y melodía, como diga la partitura.
  // En los acordes, rasgueo separa un poco cada nota, como una guitarra.
  const INSTRUMENTOS = {
    bombo: (n, t) => tono(150, 0.22, 'sine', 0.55, t, 45),
    palmas: (n, t) => ruido(0.1, 0.2, t),
    platillo: (n, t) => ruido(0.03, 0.05, t),
    redoble: (n, t) => ruido(0.05, 0.12, t),
    bajo: (n, t, s) => tono(n.frec, s.dur, s.onda, s.vol, t, n.frec, filtroBajo),
    acorde: (n, t, s) => n.frecs.forEach((f, i) => tono(f, s.dur, s.onda, s.vol, t + i * (s.rasgueo ?? 0))),
    melodia: (n, t, s) => tono(n.frec, s.dur, s.onda, s.vol, t),
  };
  let partitura = NOCHE;
  let reloj = null;
  let siguiente = 0;
  let paso = 0;
  function programar() {
    while (siguiente < ctx.currentTime + 0.2) {
      for (const n of notasDelPaso(partitura, paso)) INSTRUMENTOS[n.tipo](n, siguiente, partitura.sonidos[n.tipo]);
      siguiente += semicorchea(partitura);
      paso += 1;
    }
  }
```

4. Reemplazar el método `musica` por:

```js
    // cual: la partitura de la pista. Si hay canción propia, suena ella en su lugar.
    musica(encender, cual = NOCHE) {
      if (encender) partitura = cual;
      if (encender === sonando) return;
      sonando = encender;
      if (encender) encenderMusica();
      else apagarMusica();
    },
```

- [ ] **Paso 7: la carrera pide la música de su pista**

En `src/juego.js`, en el objeto `ctx`, agregar `pistaId: 'noche',` después de `pista,`.

En `src/pantallas/carrera.js`: agregar `import { PARTITURAS } from '../sonido/partituras.js';` y cambiar `sonido.musica(true);` por `sonido.musica(true, PARTITURAS[ctx.pistaId]);`.

- [ ] **Paso 8: ver que todo pasa**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run 2>&1 | tail -6 && npm run build 2>&1 | tail -3`
Expected: PASS de toda la suite y construcción sin errores.

- [ ] **Paso 9: commit**

```bash
cd /c/Users/Gfigueroa/OleKart && git add -A src tests && git commit -q -F - <<'EOF'
La música se lee de una partitura por pista; Noche suena igual que antes, nota por nota

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tarea 3: ambientes y cambio de pista

**Archivos:**
- Crear: `src/dibujo/ambientes/comun.js`, `src/dibujo/ambientes/noche.js`, `src/dibujo/ambientes/index.js`, `src/dibujo/mundos.js`, `tests/ambientes.test.js`
- Borrar: `src/dibujo/decorado3d.js`
- Reemplazar: `src/dibujo/pista3d.js`, `src/dibujo/escena.js`, `src/juego.js`
- Modificar: `src/logica/decorado.js`, `src/dibujo/objetos3d.js`, `tests/liberar.test.js`, `tests/decorado.test.js`

**Interfaces:**
- Consume: `PISTAS`, `pista.rampas` (tarea 1); `PARTITURAS` (tarea 2).
- Produce: ambiente `{ cielo, niebla: { color, cerca, lejos }, luz: { cielo, suelo, intensidad, sol, solIntensidad, solPos }, suelo, camino, bordes: [c1, c2], vallas: [c1, c2], rampa, meta(pista) → Group, decorado(pista) → Group con actualizar(t) opcional }`; `AMBIENTES` por id; `juntar(piezas)`, `juntarBrillo(piezas)`, `colocar(lugar, piezas)`, `apuntando(dir)`, `astro(pos, color, radio)`, `lejosDeLaMeta(pista)`; `limites(pista) → { minX, maxX, minY, maxY }`; `crearMundo(pista, ambiente)` con `soltar()`; `GEOMETRIAS_OBJETOS`; `crearMundos(pistas?, ambientes?).usar(id) → { id, pista, mundo }`; `ctx.usarPista(id)` (deja `ctx.pistaId`, `ctx.pista`, `ctx.mundo`).

- [ ] **Paso 1: escribir las pruebas que fallan**

Crear `tests/ambientes.test.js`:

```js
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { PISTAS } from '../src/logica/pistas.js';
import { crearPista, puntoEn } from '../src/logica/pista.js';
import { AMBIENTES } from '../src/dibujo/ambientes/index.js';
import { juntar, colocar } from '../src/dibujo/ambientes/comun.js';
import { PARTITURAS } from '../src/sonido/partituras.js';
import { crearMundo } from '../src/dibujo/escena.js';

// Razón de contraste entre dos colores, con la fórmula de las pautas de accesibilidad web.
function luminancia(color) {
  const [r, g, b] = [16, 8, 0]
    .map((s) => ((color >> s) & 255) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contraste(a, b) {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}
function mallas(objeto) {
  let n = 0;
  objeto.traverse((o) => {
    if (o.isMesh || o.isPoints) n += 1;
  });
  return n;
}

describe('catálogo', () => {
  it('cada pista tiene su ambiente y su música, y no sobra ninguno', () => {
    const ids = PISTAS.map((p) => p.id).sort();
    expect(Object.keys(AMBIENTES).sort()).toEqual(ids);
    expect(Object.keys(PARTITURAS).sort()).toEqual(ids);
  });
});

describe('piezas del decorado', () => {
  it('colocar lleva una pieza al costado de la pista según el rumbo del lugar', () => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const [adelante, derecha] = colocar({ x: 10, y: 5, rumbo: Math.PI / 2 }, [
      { geo, color: 1, pos: [2, 0, 0] },
      { geo, color: 1, pos: [0, 1, 3] },
    ]);
    // Rumbo norte: adelante es +y lógico (z negativo en Three.js) y la derecha es +x.
    expect(adelante.pos[0]).toBeCloseTo(10, 6);
    expect(adelante.pos[2]).toBeCloseTo(-7, 6);
    expect(derecha.pos[0]).toBeCloseTo(13, 6);
    expect(derecha.pos[1]).toBeCloseTo(1, 6);
    expect(derecha.pos[2]).toBeCloseTo(-5, 6);
    expect(adelante.rot[1]).toBeCloseTo(Math.PI / 2, 6);
  });

  it('juntar deja una sola malla por color', () => {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const g = juntar([
      { geo, color: 0xff0000, pos: [0, 0, 0] },
      { geo, color: 0xff0000, pos: [3, 0, 0] },
      { geo, color: 0x00ff00, pos: [6, 0, 0] },
    ]);
    expect(g.children).toHaveLength(2);
  });
});

describe.each(PISTAS)('ambiente de $nombre', ({ id, recorrido }) => {
  const ambiente = AMBIENTES[id];
  const pista = crearPista(recorrido);

  it('el camino se distingue del suelo: contraste de al menos 1,5', () => {
    expect(contraste(ambiente.camino, ambiente.suelo)).toBeGreaterThanOrEqual(1.5);
  });

  it('la meta queda sobre la línea de llegada, mirando hacia adelante', () => {
    const meta = ambiente.meta(pista);
    const p = puntoEn(pista, 1);
    expect(meta.position.x).toBeCloseTo(p.x, 6);
    expect(meta.position.z).toBeCloseTo(-p.y, 6);
    expect(meta.rotation.y).toBeCloseTo(p.rumbo, 6);
  });

  it('lo que se mueve del decorado depende solo del reloj del dibujo: en pausa queda quieto', () => {
    const d = ambiente.decorado(pista);
    const foto = () => {
      d.updateMatrixWorld(true);
      const valores = [];
      d.traverse((o) => valores.push(...o.matrixWorld.elements));
      return valores;
    };
    d.actualizar?.(3);
    const antes = foto();
    d.actualizar?.(7.5);
    d.actualizar?.(3);
    expect(foto()).toEqual(antes);
  });

  it('el mundo se arma con el cielo y la neblina del ambiente', () => {
    const mundo = crearMundo(pista, ambiente);
    expect(mundo.escena.background.equals(new THREE.Color(ambiente.cielo))).toBe(true);
    expect(mundo.escena.fog.color.equals(new THREE.Color(ambiente.niebla.color))).toBe(true);
    mundo.soltar();
  });
});

// Noche queda como está; los decorados nuevos juntan sus piezas por color para dibujar rápido.
for (const { id, nombre, recorrido } of PISTAS.filter((p) => p.id !== 'noche')) {
  describe(`decorado de ${nombre}`, () => {
    it('se dibuja con pocas mallas (40 como máximo)', () => {
      expect(mallas(AMBIENTES[id].decorado(crearPista(recorrido)))).toBeLessThanOrEqual(40);
    });
  });
}
```

En `tests/liberar.test.js`:
- Importaciones nuevas: `import { GEOMETRIAS_OBJETOS } from '../src/dibujo/objetos3d.js';`, `import { crearMundos } from '../src/dibujo/mundos.js';`, `import { AMBIENTES } from '../src/dibujo/ambientes/index.js';`, `import { PISTAS } from '../src/logica/pistas.js';`, `import { crearObjetos } from '../src/logica/objetos.js';`.
- En `vigilar`, usar `const COMPARTIDAS = new Set([...GEOMETRIAS_KART, ...GEOMETRIAS_OBJETOS]);` (definida arriba de la función), contar también `o.isPoints` y clasificar con `COMPARTIDAS.has(o.geometry)`.
- `crearMundo(crearPista(NOCHE))` → `crearMundo(crearPista(NOCHE), AMBIENTES.noche)`.
- Agregar al final del `describe`:

```js
  it('al cambiar de pista se libera el mundo anterior entero, salvo lo que comparten karts y objetos', () => {
    const pistas = [...PISTAS, { id: 'otra', icono: '🧪', nombre: 'Otra', recorrido: PISTAS[0].recorrido }];
    const mundos = crearMundos(pistas, { ...AMBIENTES, otra: AMBIENTES.noche });
    const { pista, mundo } = mundos.usar('noche');
    mundo.ponerKarts(PERSONAJES);
    mundo.ponerObjetos(crearObjetos(pista));
    const v = vigilar(mundo.escena);
    const otro = mundos.usar('otra');
    expect(otro.mundo).not.toBe(mundo);
    expect(v.propias.length).toBeGreaterThan(50);
    expect(v.propias.every((g) => v.liberadas.has(g))).toBe(true);
    expect(v.compartidas.length).toBeGreaterThan(0);
    expect(v.compartidas.some((g) => v.liberadas.has(g))).toBe(false);
  });

  it('elegir la pista que ya está armada no la vuelve a armar', () => {
    const mundos = crearMundos();
    const actual = mundos.usar('noche');
    const v = vigilar(actual.mundo.escena);
    expect(mundos.usar('noche')).toBe(actual);
    expect(v.liberadas.size).toBe(0);
  });
```

En `tests/decorado.test.js`, agregar `limites` a la importación de `../src/logica/decorado.js` y la prueba:

```js
  it('limites encierra todo el recorrido', () => {
    const b = limites(pista);
    for (const m of pista.muestras) {
      expect(m.x).toBeGreaterThanOrEqual(b.minX);
      expect(m.x).toBeLessThanOrEqual(b.maxX);
      expect(m.y).toBeGreaterThanOrEqual(b.minY);
      expect(m.y).toBeLessThanOrEqual(b.maxY);
    }
    expect(b.minX).toBeCloseTo(Math.min(...pista.muestras.map((m) => m.x)), 9);
  });
```

- [ ] **Paso 2: ver que fallan**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run tests/ambientes.test.js tests/liberar.test.js tests/decorado.test.js`
Expected: FAIL al cargar (no existen `ambientes/index.js`, `mundos.js` ni `limites`).

- [ ] **Paso 3: `limites` en `src/logica/decorado.js`**

Agregar al final:

```js
// Rectángulo que encierra el recorrido: para centrar el suelo y ubicar lo que va lejos (noria, mar, faro).
export function limites(pista) {
  const xs = pista.muestras.map((m) => m.x);
  const ys = pista.muestras.map((m) => m.y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}
```

- [ ] **Paso 4: `src/dibujo/ambientes/comun.js`**

```js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { dibujo } from '../estilo.js';
import { brillo } from '../comun.js';

const ARRIBA = new THREE.Vector3(0, 1, 0);
const matriz = new THREE.Matrix4();

// Junta piezas en una malla por color: así el decorado se dibuja con pocas llamadas.
// Pieza: { geo, color, pos: [x, y, z], rot: [x, y, z], esc: número o [x, y, z] }.
function porColores(piezas, material) {
  const grupo = new THREE.Group();
  const porColor = new Map();
  for (const p of piezas) {
    const esc = typeof p.esc === 'number' ? [p.esc, p.esc, p.esc] : p.esc ?? [1, 1, 1];
    matriz.compose(
      new THREE.Vector3(...p.pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rot ?? [0, 0, 0]))),
      new THREE.Vector3(...esc),
    );
    if (!porColor.has(p.color)) porColor.set(p.color, []);
    porColor.get(p.color).push(p.geo.clone().applyMatrix4(matriz));
  }
  for (const [color, geos] of porColor) grupo.add(new THREE.Mesh(mergeGeometries(geos), material(color)));
  return grupo;
}

// Con las sombras planas de los dibujos animados, sin contorno.
export const juntar = (piezas) => porColores(piezas, dibujo);
// Con colores que brillan sin luz (ampolletas, faroles encendidos).
export const juntarBrillo = (piezas) => porColores(piezas, brillo);

// Lleva piezas armadas alrededor del origen a un lugar junto a la pista ({ x, y, rumbo }, como los de
// lugaresLibres o puntoEn): x local apunta hacia adelante en la pista y z local hacia la derecha.
export function colocar(lugar, piezas) {
  const giro = new THREE.Quaternion().setFromAxisAngle(ARRIBA, lugar.rumbo);
  return piezas.map((p) => {
    const pos = new THREE.Vector3(...p.pos).applyQuaternion(giro).add(new THREE.Vector3(lugar.x, 0, -lugar.y));
    const propio = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rot ?? [0, 0, 0])));
    const rot = new THREE.Euler().setFromQuaternion(giro.clone().multiply(propio));
    return { ...p, pos: [pos.x, pos.y, pos.z], rot: [rot.x, rot.y, rot.z] };
  });
}

// Giro que deja apuntando hacia dir una figura que por defecto apunta hacia arriba (conos, cilindros).
export function apuntando(dir) {
  const q = new THREE.Quaternion().setFromUnitVectors(ARRIBA, new THREE.Vector3(...dir).normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
}

// Sol o luna: una esfera en el cielo que no recibe luz ni neblina.
export function astro(pos, color, radio = 30) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(radio, 24, 16), new THREE.MeshBasicMaterial({ color, fog: false }));
  m.position.set(...pos);
  return m;
}

// Para los lugares de lugaresLibres: deja fuera los que chocarían con el arco de meta.
export const lejosDeLaMeta = (pista) => (l) => l.s > 10 && l.s < pista.largo - 10;
```

- [ ] **Paso 5: `src/dibujo/ambientes/noche.js` (el ambiente de hoy, sin cambios visibles)**

```bash
cd /c/Users/Gfigueroa/OleKart && git mv src/dibujo/decorado3d.js src/dibujo/ambientes/noche.js
```

Luego, en `src/dibujo/ambientes/noche.js`:
1. Importaciones: `'../logica/decorado.js'` → `'../../logica/decorado.js'`, `'./comun.js'` → `'../comun.js'`, y agregar `import { VALLA, puntoEn } from '../../logica/pista.js';`.
2. `export function crearDecorado(pista, azar = Math.random) {` → `function decorado(pista, azar = Math.random) {` (cuerpo sin cambios).
3. Agregar al final:

```js
// Arco de meta con luces (antes estaba en pista3d.js).
function meta(pista) {
  const arco = new THREE.Group();
  const pm = puntoEn(pista, 1);
  arco.position.set(pm.x, 0, -pm.y);
  arco.rotation.y = pm.rumbo;
  // Dentro del arco, el eje z local apunta a la derecha: lateral izquierdo = z negativo.
  for (const z of [VALLA - 0.5, -(VALLA - 0.5)]) arco.add(malla(new THREE.CylinderGeometry(0.35, 0.35, 6.5), mate(0x333344), 0, 3.25, z));
  arco.add(malla(new THREE.BoxGeometry(0.8, 0.8, 2 * VALLA), mate(0x333344), 0, 6.5, 0));
  const foco = new THREE.SphereGeometry(0.25, 8, 6);
  for (let z = -VALLA + 1; z <= VALLA - 1; z += 1.5) {
    arco.add(malla(foco, brillo(Math.round(z) % 2 ? 0xffd166 : 0xff4d6d), 0.45, 6.5, z));
  }
  return arco;
}

export const NOCHE = {
  cielo: 0x0b1026,
  niebla: { color: 0x0b1026, cerca: 70, lejos: 230 },
  luz: { cielo: 0x8fa3ff, suelo: 0x1d3b2a, intensidad: 1.1, sol: 0xdfe7ff, solIntensidad: 1.2, solPos: [-250, 160, -380] },
  suelo: 0x1d3b2a,
  camino: 0x55586a,
  bordes: [0xd62828, 0xf1f1f1],
  vallas: [0xff9f1c, 0xfaf3dd],
  rampa: 0xffd166,
  meta,
  decorado,
};
```

- [ ] **Paso 6: `src/dibujo/ambientes/index.js`**

```js
import { NOCHE } from './noche.js';

// Ambiente de cada pista, por su id en el catálogo (src/logica/pistas.js).
export const AMBIENTES = { noche: NOCHE };
```

- [ ] **Paso 7: reemplazar `src/dibujo/pista3d.js`**

```js
import * as THREE from 'three';
import { MEDIO_ANCHO, VALLA, RAMPA, puntoEn } from '../logica/pista.js';
import { limites } from '../logica/decorado.js';
import { mate, brillo, malla } from './comun.js';

// Cinta a lo largo de la pista: dos puntos por muestra, colores por vértice.
function cinta(pista, borde, colorDe) {
  const { muestras } = pista;
  const n = muestras.length;
  const pos = [];
  const col = [];
  const idx = [];
  const c = new THREE.Color();
  for (let i = 0; i <= n; i++) {
    for (const [x, h, y] of borde(muestras[i % n])) {
      pos.push(x, h, -y);
      c.set(colorDe(i));
      col.push(c.r, c.g, c.b);
    }
    if (i < n) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
}

const lado = (m, lateral, h) => [m.x + m.nx * lateral, h, m.y + m.ny * lateral];

// Rampa: cuña que sube de 0 a RAMPA.alto desde la distancia s.
function rampa3D(pista, s, color) {
  const a = puntoEn(pista, s);
  const b = puntoEn(pista, s + RAMPA.largo);
  const m0 = pista.muestras[a.indice];
  const v = (p, lateral, h) => [p.x + m0.nx * lateral, h, -(p.y + m0.ny * lateral)];
  const vertices = [
    ...v(a, -MEDIO_ANCHO, 0.03), ...v(a, MEDIO_ANCHO, 0.03),
    ...v(b, -MEDIO_ANCHO, RAMPA.alto), ...v(b, MEDIO_ANCHO, RAMPA.alto),
    ...v(b, -MEDIO_ANCHO, 0), ...v(b, MEDIO_ANCHO, 0),
  ];
  const cuna = new THREE.BufferGeometry();
  cuna.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  cuna.setIndex([0, 2, 1, 1, 2, 3, 2, 4, 3, 3, 4, 5, 0, 4, 2, 1, 3, 5]);
  cuna.computeVertexNormals();
  return new THREE.Mesh(cuna, new THREE.MeshLambertMaterial({ color, side: THREE.DoubleSide }));
}

// Suelo, camino, bordes, vallas, meta, flechas de turbo y rampas, con los colores del ambiente.
export function crearPista3D(pista, ambiente) {
  const grupo = new THREE.Group();

  const b = limites(pista);
  const suelo = malla(new THREE.PlaneGeometry(1400, 1400), mate(ambiente.suelo), (b.minX + b.maxX) / 2, 0, -(b.minY + b.maxY) / 2);
  suelo.rotation.x = -Math.PI / 2;
  grupo.add(suelo);

  grupo.add(cinta(pista, (m) => [lado(m, -MEDIO_ANCHO, 0.03), lado(m, MEDIO_ANCHO, 0.03)], () => ambiente.camino));
  const solera = (i) => ambiente.bordes[Math.floor(i / 3) % 2];
  grupo.add(cinta(pista, (m) => [lado(m, MEDIO_ANCHO, 0.04), lado(m, MEDIO_ANCHO + 0.9, 0.04)], solera));
  grupo.add(cinta(pista, (m) => [lado(m, -MEDIO_ANCHO - 0.9, 0.04), lado(m, -MEDIO_ANCHO, 0.04)], solera));
  const valla = (i) => ambiente.vallas[Math.floor(i / 4) % 2];
  for (const s of [1, -1]) grupo.add(cinta(pista, (m) => [lado(m, s * VALLA, 0), lado(m, s * VALLA, 0.9)], valla));

  // Meta: cuadros blancos y negros, y encima el arco propio del ambiente.
  const cuadro = new THREE.PlaneGeometry(1, 1);
  for (let fila = 0; fila < 2; fila++) {
    for (let col = 0; col < 2 * MEDIO_ANCHO; col++) {
      const p = puntoEn(pista, fila + 0.5, -MEDIO_ANCHO + col + 0.5);
      const m = malla(cuadro, mate((fila + col) % 2 ? 0x111111 : 0xffffff), p.x, 0.05, -p.y);
      m.rotation.x = -Math.PI / 2;
      grupo.add(m);
    }
  }
  grupo.add(ambiente.meta(pista));

  // Flechas de turbo, naranjas y brillantes, apuntando hacia adelante.
  const forma = new THREE.Shape();
  forma.moveTo(-0.8, 1.4);
  forma.lineTo(0.8, 0);
  forma.lineTo(-0.8, -1.4);
  forma.lineTo(-0.2, 0);
  forma.closePath();
  const flecha = new THREE.ShapeGeometry(forma);
  for (const t of pista.turbos) {
    for (const d of [0.8, 2, 3.2]) {
      for (const lat of [-1.8, 1.8]) {
        const p = puntoEn(pista, t + d, lat);
        const g = new THREE.Group();
        g.position.set(p.x, 0.06, -p.y);
        g.rotation.y = p.rumbo;
        const m = malla(flecha, brillo(0xff9f1c));
        m.rotation.x = -Math.PI / 2;
        g.add(m);
        grupo.add(g);
      }
    }
  }

  for (const s of pista.rampas) grupo.add(rampa3D(pista, s, ambiente.rampa));
  return grupo;
}
```

- [ ] **Paso 8: `GEOMETRIAS_OBJETOS` en `src/dibujo/objetos3d.js`**

Después de `const curva = ...;` agregar:

```js
// Figuras que comparten las cajas, calabazas y cáscaras de todas las carreras: no se liberan al cambiar de pista.
export const GEOMETRIAS_OBJETOS = new Set([cubo, bola, tallo, ojo, curva]);
```

- [ ] **Paso 9: reemplazar `src/dibujo/escena.js`**

```js
import * as THREE from 'three';
import { crearPista3D } from './pista3d.js';
import { crearKart3D, GEOMETRIAS_KART } from './kart3d.js';
import { crearObjetos3D, GEOMETRIAS_OBJETOS } from './objetos3d.js';
import { soltar } from './comun.js';

const COMPARTIDAS = new Set([...GEOMETRIAS_KART, ...GEOMETRIAS_OBJETOS]);

// El mundo de una pista: cielo, luz y neblina del ambiente, la pista, su decorado, los karts y los objetos.
export function crearMundo(pista, ambiente) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(ambiente.cielo);
  const { niebla, luz } = ambiente;
  escena.fog = new THREE.Fog(niebla.color, niebla.cerca, niebla.lejos);
  escena.add(new THREE.HemisphereLight(luz.cielo, luz.suelo, luz.intensidad));
  const sol = new THREE.DirectionalLight(luz.sol, luz.solIntensidad);
  sol.position.set(...luz.solPos);
  escena.add(sol);
  const decorado = ambiente.decorado(pista);
  escena.add(crearPista3D(pista, ambiente), decorado);
  let karts = [];
  let objetos = null;
  return {
    escena,
    // Arma los karts de una carrera, en el orden de sus participantes.
    ponerKarts(fichas) {
      karts.forEach((k) => {
        escena.remove(k);
        k.soltar();
      });
      karts = fichas.map(crearKart3D);
      karts.forEach((k) => escena.add(k));
    },
    // Cajas, calabazas y cáscaras de una carrera.
    ponerObjetos(estado) {
      if (objetos) escena.remove(objetos.grupo);
      objetos = crearObjetos3D(estado);
      escena.add(objetos.grupo);
    },
    // t y dt: tiempo del dibujo (dt vale 0 en pausa). eventos[i]: lo que le pasó al kart i en este cuadro.
    actualizar(carrera, t, dt = 0, eventos = null) {
      carrera.karts.forEach((k, i) => karts[i].sincronizar(k, t, dt, eventos?.[i] ?? []));
      objetos?.actualizar(carrera.objetos, t);
      decorado.actualizar?.(t);
    },
    // Libera todo lo que armó este mundo, salvo las figuras que comparten todos los karts y objetos.
    soltar() {
      soltar(escena, COMPARTIDAS);
    },
  };
}
```

- [ ] **Paso 10: `src/dibujo/mundos.js`**

```js
import { PISTAS } from '../logica/pistas.js';
import { crearPista } from '../logica/pista.js';
import { crearMundo } from './escena.js';
import { AMBIENTES } from './ambientes/index.js';

// Un solo mundo armado a la vez: al pasar a otra pista se arma el suyo y se libera el anterior.
// pistas y ambientes se pueden cambiar en las pruebas.
export function crearMundos(pistas = PISTAS, ambientes = AMBIENTES) {
  let actual = null;
  return {
    usar(id) {
      if (actual?.id === id) return actual;
      actual?.mundo.soltar();
      const pista = crearPista(pistas.find((p) => p.id === id).recorrido);
      actual = { id, pista, mundo: crearMundo(pista, ambientes[id]) };
      return actual;
    },
  };
}
```

- [ ] **Paso 11: reemplazar `src/juego.js`**

```js
import { PERSONAJES } from './logica/personajes.js';
import { crearMundos } from './dibujo/mundos.js';
import { pantallaInicio } from './pantallas/inicio.js';
import { pantallaSeleccion } from './pantallas/seleccion.js';
import { pantallaCarrera } from './pantallas/carrera.js';
import { pantallaPodio } from './pantallas/podio.js';

const PANTALLAS = { inicio: pantallaInicio, seleccion: pantallaSeleccion, carrera: pantallaCarrera, podio: pantallaPodio };

export function crearJuego({ renderer, capa, entradas, sonido }) {
  let actual = null;
  const mundos = crearMundos();
  const ctx = { renderer, capa, sonido, personajes: PERSONAJES, nombre: null };
  // Arma la pista elegida (y libera la anterior). Cada pantalla toma ctx.pista y ctx.mundo al empezar.
  ctx.usarPista = (id) => {
    const { pista, mundo } = mundos.usar(id);
    Object.assign(ctx, { pistaId: id, pista, mundo });
  };
  ctx.usarPista('noche');
  ctx.ir = (nombre, datos = {}) => {
    actual?.salir();
    capa.replaceChildren();
    ctx.nombre = nombre;
    actual = PANTALLAS[nombre](ctx, datos);
  };
  ctx.ir('inicio');
  return {
    ctx,
    get pantalla() {
      return ctx.nombre;
    },
    cuadro(dt) {
      actual.actualizar(entradas.leer(), dt);
      actual.dibujar(renderer);
    },
    pausar() {
      actual.pausar?.();
    },
  };
}
```

- [ ] **Paso 12: ver que todo pasa**

Run: `cd /c/Users/Gfigueroa/OleKart && grep -rn "decorado3d\|crearDecorado" src tests; npx vitest run 2>&1 | tail -6 && npm run build 2>&1 | tail -3`
Expected: el `grep` no muestra nada; PASS de toda la suite; construcción sin errores.

- [ ] **Paso 13: Noche se ve igual (navegador)**

Levantar `npx vite --port 5299 --strictPort` en segundo plano (desde la raíz del repositorio). En la carpeta con Playwright del scratchpad (`.../scratchpad/webkit`), correr `node medir.mjs` (el script del paso de personajes: carrera de 2 jugadores en Noche).
Expected: pantalla `carrera`, 55 cuadros por segundo o más, llamadas de dibujo por vista como antes (cerca de 201), `errores: ninguno`. Detener el servidor (PowerShell: `$c=Get-NetTCPConnection -LocalPort 5299 -State Listen; Stop-Process -Id $c.OwningProcess -Force`).

- [ ] **Paso 14: commit**

```bash
cd /c/Users/Gfigueroa/OleKart && git add -A src tests && git commit -q -F - <<'EOF'
Cada pista se dibuja con su ambiente; al cambiar de pista se arma su mundo y se libera el anterior

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tarea 4: elegir pista y botones del podio (lógica)

**Archivos:**
- Crear: `src/logica/eleccion.js`, `src/logica/podio.js`, `tests/eleccion.test.js`, `tests/podio.test.js`

**Interfaces:**
- Consume: nada de las tareas anteriores.
- Produce: `RULETA = 1`; `crearEleccion(cantidad, { marco = 0, ultima = null }) → { cantidad, marco, ultima, ruleta, destino, elegida }` (marco va de 0 a `cantidad`; `cantidad` es 🎲); `pulsarEleccion(e, { izquierda, derecha, confirma, opcion }, azar)`; `avanzarEleccion(e, dt)`. `BOTONES = ['otra', 'pistas', 'inicio']`; `crearOpcionesPodio(pistas, actual) → { pistas, actual, marco, eleccion }`; `pulsarPodio(o, recien, azar)` y `avanzarPodio(o, dt)` → `{ ir: 'carrera', pista }`, `{ ir: 'inicio' }` o `null`.

- [ ] **Paso 1: escribir las pruebas que fallan**

`tests/eleccion.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearEleccion, pulsarEleccion, avanzarEleccion, RULETA } from '../src/logica/eleccion.js';

describe('elegir pista', () => {
  it('parte donde se indica y la cruceta recorre las pistas y 🎲 sin pasarse de los bordes', () => {
    const e = crearEleccion(3, { marco: 1 });
    pulsarEleccion(e, { izquierda: true });
    pulsarEleccion(e, { izquierda: true });
    expect(e.marco).toBe(0);
    for (let i = 0; i < 5; i++) pulsarEleccion(e, { derecha: true });
    expect(e.marco).toBe(3);
    expect(e.elegida).toBe(null);
  });

  it('A sobre una pista la elige', () => {
    const e = crearEleccion(3);
    pulsarEleccion(e, { derecha: true });
    pulsarEleccion(e, { confirma: true });
    expect(e.elegida).toBe(1);
  });

  it('con el mouse, tocar una tarjeta la elige; una tarjeta que no existe no hace nada', () => {
    const e = crearEleccion(3);
    pulsarEleccion(e, { opcion: 7 });
    pulsarEleccion(e, { opcion: -1 });
    expect(e).toMatchObject({ marco: 0, elegida: null, ruleta: 0 });
    pulsarEleccion(e, { opcion: 2 });
    expect(e).toMatchObject({ marco: 2, elegida: 2 });
  });

  it('una vez elegida, otras pulsaciones (por ejemplo, del otro control en el mismo cuadro) no cambian nada', () => {
    const e = crearEleccion(3);
    pulsarEleccion(e, { confirma: true });
    pulsarEleccion(e, { derecha: true, confirma: true });
    pulsarEleccion(e, { opcion: 2 });
    expect(e).toMatchObject({ marco: 0, elegida: 0 });
  });

  it('🎲: la ruleta recorre las tarjetas durante 1 s, ignora pulsaciones y se detiene en una pista distinta de la última', () => {
    const e = crearEleccion(3, { marco: 3, ultima: 1 });
    pulsarEleccion(e, { confirma: true }, () => 0.6);
    expect(e.ruleta).toBe(RULETA);
    const vistos = new Set();
    for (let i = 0; i < 50; i++) {
      avanzarEleccion(e, 1 / 60);
      vistos.add(e.marco);
      pulsarEleccion(e, { izquierda: true, confirma: true });
    }
    expect(e.elegida).toBe(null);
    expect(vistos.size).toBeGreaterThan(1);
    avanzarEleccion(e, RULETA);
    expect(e).toMatchObject({ elegida: 2, marco: 2, ruleta: 0 });
  });

  it('🎲 nunca repite la última pista; con una sola alternativa sale esa', () => {
    for (const azar of [0, 0.5, 0.999]) {
      const e = crearEleccion(2, { marco: 2, ultima: 0 });
      pulsarEleccion(e, { confirma: true }, () => azar);
      avanzarEleccion(e, RULETA);
      expect(e.elegida).toBe(1);
    }
  });

  it('🎲 sin pista anterior puede dar cualquiera; con una sola pista da esa', () => {
    const salen = new Set();
    for (const azar of [0, 0.4, 0.8]) {
      const e = crearEleccion(3, { marco: 3 });
      pulsarEleccion(e, { confirma: true }, () => azar);
      avanzarEleccion(e, RULETA);
      salen.add(e.elegida);
    }
    expect(salen).toEqual(new Set([0, 1, 2]));
    const sola = crearEleccion(1, { marco: 1, ultima: 0 });
    pulsarEleccion(sola, { confirma: true }, () => 0.5);
    avanzarEleccion(sola, RULETA);
    expect(sola.elegida).toBe(0);
  });
});
```

`tests/podio.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearOpcionesPodio, pulsarPodio, avanzarPodio, BOTONES } from '../src/logica/podio.js';
import { RULETA } from '../src/logica/eleccion.js';

describe('botones del podio', () => {
  it('el marco parte en 🔁: A repite la carrera en la misma pista', () => {
    const o = crearOpcionesPodio(3, 2);
    expect(BOTONES[o.marco]).toBe('otra');
    expect(pulsarPodio(o, { confirma: true })).toEqual({ ir: 'carrera', pista: 2 });
  });

  it('B lleva al inicio', () => {
    expect(pulsarPodio(crearOpcionesPodio(3, 0), { vuelve: true })).toEqual({ ir: 'inicio' });
  });

  it('🗺️ abre las pistas con el marco en la actual; elegir otra lleva a la carrera en esa pista', () => {
    const o = crearOpcionesPodio(3, 0);
    expect(pulsarPodio(o, { derecha: true })).toBe(null);
    expect(pulsarPodio(o, { confirma: true })).toBe(null);
    expect(o.eleccion).toMatchObject({ marco: 0, ultima: 0 });
    pulsarPodio(o, { derecha: true });
    expect(pulsarPodio(o, { confirma: true })).toEqual({ ir: 'carrera', pista: 1 });
  });

  it('B en las pistas vuelve a los botones, con el marco en 🗺️; otra B lleva al inicio', () => {
    const o = crearOpcionesPodio(3, 0);
    pulsarPodio(o, { derecha: true });
    pulsarPodio(o, { confirma: true });
    expect(pulsarPodio(o, { vuelve: true })).toBe(null);
    expect(o).toMatchObject({ eleccion: null, marco: 1 });
    expect(pulsarPodio(o, { vuelve: true })).toEqual({ ir: 'inicio' });
  });

  it('🎲 en las pistas: la ruleta gira 1 s, sin hacer caso a B, y lleva a una pista distinta de la actual', () => {
    const o = crearOpcionesPodio(3, 1);
    pulsarPodio(o, { opcion: 1 });
    expect(pulsarPodio(o, { opcion: 3 }, () => 0)).toBe(null);
    expect(avanzarPodio(o, RULETA / 2)).toBe(null);
    expect(pulsarPodio(o, { vuelve: true })).toBe(null);
    expect(o.eleccion).not.toBe(null);
    expect(avanzarPodio(o, RULETA)).toEqual({ ir: 'carrera', pista: 0 });
  });

  it('con el mouse, tocar 🔁 o 🏠 actúa de inmediato', () => {
    expect(pulsarPodio(crearOpcionesPodio(3, 2), { opcion: 0 })).toEqual({ ir: 'carrera', pista: 2 });
    expect(pulsarPodio(crearOpcionesPodio(3, 2), { opcion: 2 })).toEqual({ ir: 'inicio' });
  });

  it('una opción que no existe no hace nada', () => {
    const o = crearOpcionesPodio(3, 0);
    expect(pulsarPodio(o, { opcion: 5 })).toBe(null);
    expect(o).toMatchObject({ marco: 0, eleccion: null });
  });

  it('sin ruleta girando, avanzar no hace nada', () => {
    const o = crearOpcionesPodio(3, 0);
    expect(avanzarPodio(o, 1)).toBe(null);
  });
});
```

- [ ] **Paso 2: ver que fallan**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run tests/eleccion.test.js tests/podio.test.js`
Expected: FAIL al cargar: no existen `eleccion.js` ni `podio.js`.

- [ ] **Paso 3: `src/logica/eleccion.js`**

```js
// Elegir pista: el marco recorre las tarjetas de las pistas y, al final, 🎲.
// cantidad: cuántas pistas hay (el índice cantidad es 🎲). ultima: la última pista corrida (🎲 no la repite), o null.
export const RULETA = 1;

export function crearEleccion(cantidad, { marco = 0, ultima = null } = {}) {
  return { cantidad, marco, ultima, ruleta: 0, destino: null, elegida: null };
}

// Una pulsación. opcion: la tarjeta tocada con el mouse, que además confirma.
// Mientras gira la ruleta, o si ya se eligió, no responde.
export function pulsarEleccion(e, { izquierda = false, derecha = false, confirma = false, opcion } = {}, azar = Math.random) {
  if (e.ruleta > 0 || e.elegida !== null) return e;
  if (opcion !== undefined) {
    if (opcion < 0 || opcion > e.cantidad) return e;
    e.marco = opcion;
    confirma = true;
  }
  if (izquierda) e.marco = Math.max(0, e.marco - 1);
  if (derecha) e.marco = Math.min(e.cantidad, e.marco + 1);
  if (!confirma) return e;
  if (e.marco < e.cantidad) {
    e.elegida = e.marco;
    return e;
  }
  const todas = [...Array(e.cantidad).keys()];
  const otras = todas.filter((i) => i !== e.ultima);
  const posibles = otras.length ? otras : todas;
  e.destino = posibles[Math.floor(azar() * posibles.length)];
  e.ruleta = RULETA;
  return e;
}

// La ruleta de 🎲: el marco salta de tarjeta en tarjeta y, al terminar, se detiene en el destino.
export function avanzarEleccion(e, dt) {
  if (e.ruleta <= 0) return e;
  e.ruleta = Math.max(0, e.ruleta - dt);
  if (e.ruleta === 0) {
    e.marco = e.destino;
    e.elegida = e.destino;
  } else {
    e.marco = Math.floor((RULETA - e.ruleta) * 12) % e.cantidad;
  }
  return e;
}
```

- [ ] **Paso 4: `src/logica/podio.js`**

```js
import { crearEleccion, pulsarEleccion, avanzarEleccion } from './eleccion.js';

// Botones del podio, de izquierda a derecha: 🔁 otra carrera en la misma pista, 🗺️ otra pista y 🏠 inicio.
export const BOTONES = ['otra', 'pistas', 'inicio'];

// pistas: cuántas hay; actual: índice de la pista que se acaba de correr.
export function crearOpcionesPodio(pistas, actual) {
  return { pistas, actual, marco: 0, eleccion: null };
}

const aLaCarrera = (o) => (o.eleccion.elegida === null ? null : { ir: 'carrera', pista: o.eleccion.elegida });

// Una pulsación en el podio. Devuelve qué hacer: { ir: 'carrera', pista }, { ir: 'inicio' } o null.
// opcion: el botón (o, con las pistas abiertas, la tarjeta) tocado con el mouse.
export function pulsarPodio(o, { izquierda = false, derecha = false, confirma = false, vuelve = false, opcion } = {}, azar = Math.random) {
  if (o.eleccion) {
    if (o.eleccion.ruleta > 0) return null;
    if (vuelve) {
      o.eleccion = null;
      return null;
    }
    pulsarEleccion(o.eleccion, { izquierda, derecha, confirma, opcion }, azar);
    return aLaCarrera(o);
  }
  if (vuelve) return { ir: 'inicio' };
  if (opcion !== undefined) {
    if (opcion < 0 || opcion >= BOTONES.length) return null;
    o.marco = opcion;
    confirma = true;
  }
  if (izquierda) o.marco = Math.max(0, o.marco - 1);
  if (derecha) o.marco = Math.min(BOTONES.length - 1, o.marco + 1);
  if (!confirma) return null;
  const boton = BOTONES[o.marco];
  if (boton === 'otra') return { ir: 'carrera', pista: o.actual };
  if (boton === 'inicio') return { ir: 'inicio' };
  o.eleccion = crearEleccion(o.pistas, { marco: o.actual, ultima: o.actual });
  return null;
}

// La ruleta de 🎲 avanza con el tiempo; al detenerse, lleva a la carrera.
export function avanzarPodio(o, dt) {
  if (!o.eleccion || o.eleccion.ruleta <= 0) return null;
  avanzarEleccion(o.eleccion, dt);
  return aLaCarrera(o);
}
```

- [ ] **Paso 5: ver que todo pasa**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run 2>&1 | tail -6`
Expected: PASS de toda la suite.

- [ ] **Paso 6: commit**

```bash
cd /c/Users/Gfigueroa/OleKart && git add -A src tests && git commit -q -F - <<'EOF'
Lógica para elegir pista (cruceta, mouse y 🎲 que no repite) y para los botones del podio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tarea 5: paso 🗺️ en el menú y botón 🗺️ en el podio

**Archivos:**
- Reemplazar: `src/logica/menu.js`, `tests/menu.test.js`, `src/pantallas/inicio.js`, `src/pantallas/podio.js`
- Crear: `src/pantallas/tarjetas.js`, `tests/tarjetas.test.js`
- Modificar: `src/pantallas/carrera.js`, `src/estilo.css`

**Interfaces:**
- Consume: `crearEleccion`, `pulsarEleccion`, `avanzarEleccion`, `RULETA`, `crearOpcionesPodio`, `pulsarPodio`, `avanzarPodio` (tarea 4); `PISTAS`, `indicePista` (tarea 1); `AMBIENTES` (tarea 3); `ctx.usarPista`, `ctx.pistaId` (tarea 3).
- Produce: `crearMenu(velocidad, { pistas, pista, ultima })` con `m.eleccion`; `pulsarMenu(m, id, recien, azar)`; `avanzarMenu(m, dt)`; `trazoDelRecorrido(muestras, ancho, alto, margen, cada = 4) → { d, meta }`; `crearTarjetas() → div.opciones.pista`; `ctx.ultimaCorrida` (id).

- [ ] **Paso 1: escribir las pruebas que fallan**

Reemplazar `tests/menu.test.js` por:

```js
import { describe, it, expect } from 'vitest';
import { crearMenu, pulsarMenu, avanzarMenu } from '../src/logica/menu.js';
import { RULETA } from '../src/logica/eleccion.js';

// Lleva el menú hasta el paso de pista con A del control indicado.
function hastaPista(m, id = 'mando-0') {
  pulsarMenu(m, id, { confirma: true });
  pulsarMenu(m, id, { confirma: true });
  return m;
}

describe('menú de inicio', () => {
  it('parte eligiendo jugadores en 👤, con la última velocidad usada y el marco de pista en la última corrida', () => {
    const m = crearMenu(2, { pistas: 3, pista: 1, ultima: 1 });
    expect(m).toMatchObject({ paso: 'jugadores', jugadores: 0, velocidad: 2, primera: undefined, listo: false });
    expect(m.eleccion).toMatchObject({ cantidad: 3, marco: 1, ultima: 1 });
    expect(crearMenu().velocidad).toBe(0);
    expect(crearMenu().eleccion).toMatchObject({ cantidad: 1, marco: 0, ultima: null });
  });

  it('la cruceta elige entre 👤 y 👥 sin pasarse de los bordes', () => {
    const m = crearMenu();
    pulsarMenu(m, 'mando-0', { derecha: true });
    pulsarMenu(m, 'mando-0', { derecha: true });
    expect(m.jugadores).toBe(1);
    pulsarMenu(m, 'mando-0', { izquierda: true });
    pulsarMenu(m, 'mando-0', { izquierda: true });
    expect(m.jugadores).toBe(0);
  });

  it('A pasa a elegir la velocidad y recuerda qué control eligió', () => {
    const m = crearMenu();
    pulsarMenu(m, 'mando-1', { derecha: true });
    pulsarMenu(m, 'mando-1', { confirma: true });
    expect(m).toMatchObject({ paso: 'velocidad', jugadores: 1, primera: 'mando-1', listo: false });
  });

  it('en la velocidad, la cruceta elige entre 🐢 🐇 🚀 y A pasa a elegir la pista', () => {
    const m = crearMenu();
    pulsarMenu(m, 'teclado', { confirma: true });
    pulsarMenu(m, 'teclado', { derecha: true });
    pulsarMenu(m, 'teclado', { derecha: true });
    pulsarMenu(m, 'teclado', { derecha: true });
    expect(m.velocidad).toBe(2);
    pulsarMenu(m, 'teclado', { confirma: true });
    expect(m).toMatchObject({ paso: 'pista', listo: false });
  });

  it('B en la velocidad vuelve a elegir jugadores; en jugadores no hace nada', () => {
    const m = crearMenu();
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m.paso).toBe('jugadores');
    pulsarMenu(m, 'mando-0', { confirma: true });
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m).toMatchObject({ paso: 'jugadores', listo: false });
  });

  it('en la pista, la cruceta mueve el marco, A elige y el menú queda listo', () => {
    const m = hastaPista(crearMenu(0, { pistas: 3 }));
    pulsarMenu(m, 'mando-0', { derecha: true });
    pulsarMenu(m, 'mando-0', { confirma: true });
    expect(m.listo).toBe(true);
    expect(m.eleccion.elegida).toBe(1);
  });

  it('B en la pista vuelve a la velocidad', () => {
    const m = hastaPista(crearMenu(0, { pistas: 3 }));
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m).toMatchObject({ paso: 'velocidad', listo: false });
  });

  it('🎲: durante la ruleta nada responde y al terminar queda lista una pista distinta de la última', () => {
    const m = hastaPista(crearMenu(0, { pistas: 3, pista: 0, ultima: 0 }));
    pulsarMenu(m, 'mando-0', { opcion: 3 }, () => 0.99);
    expect(m.listo).toBe(false);
    pulsarMenu(m, 'mando-0', { vuelve: true });
    expect(m.paso).toBe('pista');
    avanzarMenu(m, RULETA / 2);
    expect(m.listo).toBe(false);
    avanzarMenu(m, RULETA);
    expect(m.listo).toBe(true);
    expect(m.eleccion.elegida).toBe(2);
  });

  it('con el mouse, tocar un ícono lo elige y avanza', () => {
    const m = crearMenu(0, { pistas: 3 });
    pulsarMenu(m, null, { opcion: 1 });
    expect(m).toMatchObject({ paso: 'velocidad', jugadores: 1, primera: null });
    pulsarMenu(m, null, { opcion: 2 });
    expect(m).toMatchObject({ paso: 'pista', velocidad: 2, primera: null });
    pulsarMenu(m, null, { opcion: 2 });
    expect(m).toMatchObject({ listo: true, primera: null });
    expect(m.eleccion.elegida).toBe(2);
  });

  it('si los jugadores se eligieron con el mouse, el control que confirma la velocidad es el jugador 1', () => {
    const m = crearMenu();
    pulsarMenu(m, null, { opcion: 0 });
    pulsarMenu(m, 'mando-2', { confirma: true });
    expect(m).toMatchObject({ paso: 'pista', primera: 'mando-2' });
  });

  it('si jugadores y velocidad se eligieron con el mouse, el control que elige la pista es el jugador 1', () => {
    const m = crearMenu(0, { pistas: 3 });
    pulsarMenu(m, null, { opcion: 0 });
    pulsarMenu(m, null, { opcion: 0 });
    pulsarMenu(m, 'mando-1', { derecha: true });
    expect(m.primera).toBe(null);
    pulsarMenu(m, 'mando-1', { confirma: true });
    expect(m).toMatchObject({ listo: true, primera: 'mando-1' });
  });
});
```

Crear `tests/tarjetas.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { trazoDelRecorrido } from '../src/pantallas/tarjetas.js';
import { PISTAS } from '../src/logica/pistas.js';
import { crearPista } from '../src/logica/pista.js';

const puntos = (d) => d.slice(1, -1).split('L').map((p) => p.split(' ').map(Number));
const rango = (valores) => Math.max(...valores) - Math.min(...valores);

describe('dibujo del recorrido en las tarjetas', () => {
  it.each(PISTAS.map((p) => [p.nombre, p.recorrido]))('%s cabe en la tarjeta, centrado y sin deformarse', (_, recorrido) => {
    const { muestras } = crearPista(recorrido);
    const { d, meta } = trazoDelRecorrido(muestras, 160, 100, 12);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    const ps = puntos(d);
    const xs = ps.map(([x]) => x);
    const ys = ps.map(([, y]) => y);
    for (const x of xs) expect(x >= 11.9 && x <= 148.1).toBe(true);
    for (const y of ys) expect(y >= 11.9 && y <= 88.1).toBe(true);
    // Misma escala en x e y: la proporción del dibujo es la del recorrido.
    expect(Math.abs(rango(xs) / rango(ys) - rango(muestras.map((m) => m.x)) / rango(muestras.map((m) => m.y)))).toBeLessThan(0.05);
    // Centrado: márgenes opuestos iguales.
    expect(Math.abs(Math.min(...xs) + Math.max(...xs) - 160)).toBeLessThan(2);
    expect(Math.abs(Math.min(...ys) + Math.max(...ys) - 100)).toBeLessThan(2);
    expect(meta).toEqual(ps[0]);
  });

  it('el norte queda arriba: un punto más al norte se dibuja más arriba en la tarjeta', () => {
    const muestras = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    const ps = puntos(trazoDelRecorrido(muestras, 160, 100, 12, 1).d);
    expect(ps[2][1]).toBeLessThan(ps[1][1]);
    expect(ps[1][0]).toBeGreaterThan(ps[0][0]);
  });
});
```

- [ ] **Paso 2: ver que fallan**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run tests/menu.test.js tests/tarjetas.test.js`
Expected: FAIL: en `menu.test.js`, varias pruebas (no existe `m.eleccion`, la velocidad deja el menú listo, falta `avanzarMenu`); `tarjetas.test.js` no carga (no existe `tarjetas.js`).

- [ ] **Paso 3: reemplazar `src/logica/menu.js`**

```js
import { crearEleccion, pulsarEleccion, avanzarEleccion } from './eleccion.js';

// Menú de inicio en tres pasos: cuántos juegan (👤 👥), a qué velocidad (🐢 🐇 🚀) y en qué pista (🗺️).
// velocidad: índice en VELOCIDADES; parte en la última usada. pistas: cuántas hay; pista: dónde parte el
// marco; ultima: la última pista corrida (🎲 no la repite), o null.
export function crearMenu(velocidad = 0, { pistas = 1, pista = 0, ultima = null } = {}) {
  return {
    paso: 'jugadores', jugadores: 0, velocidad, primera: undefined, listo: false,
    eleccion: crearEleccion(pistas, { marco: pista, ultima }),
  };
}

// Una pulsación sobre el menú. id: la fuente que la hizo (null si fue el mouse).
// opcion: el ícono tocado con el mouse, que además confirma. azar: para 🎲.
export function pulsarMenu(m, id, { izquierda = false, derecha = false, confirma = false, vuelve = false, opcion } = {}, azar = Math.random) {
  if (m.paso === 'pista') {
    if (m.listo || m.eleccion.ruleta > 0) return m;
    if (vuelve) {
      m.paso = 'velocidad';
      return m;
    }
    if ((confirma || opcion !== undefined) && m.primera === null) m.primera = id;
    pulsarEleccion(m.eleccion, { izquierda, derecha, confirma, opcion }, azar);
    if (m.eleccion.elegida !== null) m.listo = true;
    return m;
  }
  const total = m.paso === 'jugadores' ? 2 : 3;
  if (opcion !== undefined) {
    m[m.paso] = opcion;
    confirma = true;
  }
  if (izquierda) m[m.paso] = Math.max(0, m[m.paso] - 1);
  if (derecha) m[m.paso] = Math.min(total - 1, m[m.paso] + 1);
  if (m.paso === 'velocidad' && vuelve) {
    m.paso = 'jugadores';
    return m;
  }
  if (!confirma) return m;
  if (m.paso === 'jugadores') {
    m.paso = 'velocidad';
    m.primera = id;
  } else {
    if (m.primera === null) m.primera = id;
    m.paso = 'pista';
  }
  return m;
}

// La ruleta de 🎲 avanza con el tiempo; al detenerse, el menú queda listo.
export function avanzarMenu(m, dt) {
  if (m.paso !== 'pista') return m;
  avanzarEleccion(m.eleccion, dt);
  if (m.eleccion.elegida !== null) m.listo = true;
  return m;
}
```

- [ ] **Paso 4: `src/pantallas/tarjetas.js`**

```js
import { PISTAS } from '../logica/pistas.js';
import { crearPista } from '../logica/pista.js';
import { AMBIENTES } from '../dibujo/ambientes/index.js';
import { el } from './dom.js';

const hex = (color) => `#${color.toString(16).padStart(6, '0')}`;

// Trazo SVG del recorrido visto desde arriba, a escala y centrado dentro de ancho × alto, con el norte arriba.
// cada: se usa una de cada tantas muestras. meta: dónde queda la meta en el dibujo.
export function trazoDelRecorrido(muestras, ancho, alto, margen, cada = 4) {
  const xs = muestras.map((m) => m.x);
  const ys = muestras.map((m) => m.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const escala = Math.min((ancho - 2 * margen) / (x1 - x0), (alto - 2 * margen) / (y1 - y0));
  const dx = (ancho - (x1 - x0) * escala) / 2;
  const dy = (alto - (y1 - y0) * escala) / 2;
  const punto = (m) => [+(dx + (m.x - x0) * escala).toFixed(1), +(dy + (y1 - m.y) * escala).toFixed(1)];
  const pasos = muestras.filter((_, i) => i % cada === 0).map(punto);
  return { d: `M${pasos.map(([x, y]) => `${x} ${y}`).join('L')}Z`, meta: punto(muestras[0]) };
}

// El dibujo de cada pista se arma una vez: crearPista toma unos milisegundos.
const dibujos = new Map();
function dibujoDe(p) {
  if (!dibujos.has(p.id)) {
    const a = AMBIENTES[p.id];
    const { d, meta } = trazoDelRecorrido(crearPista(p.recorrido).muestras, 160, 100, 12);
    dibujos.set(p.id, `<svg viewBox="0 0 160 100">
      <rect width="160" height="100" rx="10" fill="${hex(a.suelo)}"/>
      <path d="${d}" fill="none" stroke="${hex(a.bordes[0])}" stroke-width="9" stroke-linejoin="round"/>
      <path d="${d}" fill="none" stroke="${hex(a.camino)}" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="${meta[0]}" cy="${meta[1]}" r="5" fill="#fff" stroke="#111" stroke-width="2"/></svg>`);
  }
  return dibujos.get(p.id);
}

// Una tarjeta por pista (su recorrido con los colores de su ambiente, ícono y nombre) y al final 🎲.
export function crearTarjetas() {
  const grupo = el('div', 'opciones pista');
  for (const p of PISTAS) {
    const tarjeta = el('div', 'opcion tarjeta', `${dibujoDe(p)}<div class="icono">${p.icono}</div><div class="nombre">${p.nombre}</div>`);
    tarjeta.style.background = hex(AMBIENTES[p.id].cielo);
    grupo.append(tarjeta);
  }
  grupo.append(el('div', 'opcion tarjeta', '<div class="dado">🎲</div>'));
  return grupo;
}
```

- [ ] **Paso 5: reemplazar `src/pantallas/inicio.js`**

```js
import { crearCarrera, pasoCarrera, VELOCIDADES } from '../logica/carrera.js';
import { crearPiloto, conducir } from '../logica/pilotos.js';
import { crearMenu, pulsarMenu, avanzarMenu } from '../logica/menu.js';
import { PISTAS, indicePista } from '../logica/pistas.js';
import { guardarCancion, borrarCancion } from '../sonido/cancion.js';
import { crearCamara, seguir, dibujarVistas } from '../dibujo/camaras.js';
import { crearTarjetas } from './tarjetas.js';
import { el } from './dom.js';

const PASO = 1 / 60;

// Elegir 1 o 2 jugadores, la velocidad y la pista. De fondo corre una carrera de demostración con los
// 8 personajes en la última pista corrida.
export function pantallaInicio(ctx) {
  const { pista, mundo, personajes, sonido } = ctx;
  const camara = crearCamara(65);
  let demo;
  let pilotos;
  let acumulado = 0;
  let t = 0;
  function nuevaDemo() {
    demo = crearCarrera(pista, personajes.map((p) => p.id));
    demo.estado = 'carrera';
    pilotos = demo.karts.map(() => crearPiloto());
    mundo.ponerKarts(personajes);
    mundo.ponerObjetos(demo.objetos);
    mundo.actualizar(demo, 0);
    seguir(camara, demo.karts[0], 1, true);
  }
  nuevaDemo();

  const raiz = el('div', 'inicio', `
    <div class="logo">Olé Kart</div>
    <div class="opciones jugadores"><div class="opcion">👤</div><div class="opcion">👥</div></div>
    <div class="opciones velocidad"><div class="opcion">🐢</div><div class="opcion">🐇</div><div class="opcion">🚀</div></div>
    <div class="cancion"></div>
    <input type="file" accept="audio/*" class="oculto" />`);
  const tarjetas = crearTarjetas();
  raiz.insertBefore(tarjetas, raiz.querySelector('.cancion'));
  ctx.capa.append(raiz);

  // 🎵 (con el mouse, para el adulto): elegir una canción del computador para las carreras, o quitarla.
  const boton = raiz.querySelector('.cancion');
  const archivo = raiz.querySelector('input');
  const pintarCancion = () => {
    const texto = sonido.hayCancion() ? '🎵✅' : '🎵';
    if (boton.textContent !== texto) boton.textContent = texto;
  };
  pintarCancion();
  boton.addEventListener('click', () => {
    if (!sonido.hayCancion()) {
      archivo.click();
      return;
    }
    sonido.ponerCancion(null);
    borrarCancion();
    pintarCancion();
  });
  archivo.addEventListener('change', () => {
    const elegido = archivo.files[0];
    // Se vacía para que elegir otra vez el mismo archivo también funcione.
    archivo.value = '';
    if (!elegido) return;
    sonido.ponerCancion(elegido);
    guardarCancion(elegido);
    pintarCancion();
  });
  const grupos = { jugadores: raiz.querySelector('.jugadores'), velocidad: raiz.querySelector('.velocidad'), pista: tarjetas };
  const ultima = ctx.ultimaCorrida === undefined ? null : indicePista(ctx.ultimaCorrida);
  const menu = crearMenu(ctx.velocidad ?? 0, { pistas: PISTAS.length, pista: ultima ?? 0, ultima });
  for (const [paso, grupo] of Object.entries(grupos)) {
    [...grupo.children].forEach((o, i) => o.addEventListener('click', () => {
      if (menu.paso === paso) pulsarMenu(menu, null, { opcion: i });
    }));
  }
  function pintar() {
    for (const [paso, grupo] of Object.entries(grupos)) {
      grupo.classList.toggle('oculto', menu.paso !== paso);
      const marcada = paso === 'pista' ? menu.eleccion.marco : menu[paso];
      [...grupo.children].forEach((o, i) => o.classList.toggle('elegida', i === marcada));
    }
  }
  pintar();

  return {
    actualizar(fuentes, dt) {
      t += dt;
      for (const f of fuentes) pulsarMenu(menu, f.id, f.recien);
      avanzarMenu(menu, dt);
      pintar();
      pintarCancion();
      if (menu.listo) {
        sonido.reanudar();
        ctx.velocidad = menu.velocidad;
        // El mundo de la pista elegida se arma ahora; la selección de personajes no lo muestra.
        // Si desde la selección vuelven al inicio, la carrera de fondo ya es de esta pista: armar otra vez la
        // anterior costaría una espera sin beneficio.
        ctx.usarPista(PISTAS[menu.eleccion.elegida].id);
        ctx.ir('seleccion', { cantidad: menu.jugadores + 1, primera: menu.primera, clase: VELOCIDADES[menu.velocidad] });
        return;
      }
      acumulado += dt;
      const delCuadro = demo.karts.map(() => []);
      while (acumulado >= PASO) {
        acumulado -= PASO;
        const eventos = pasoCarrera(demo, demo.karts.map((k, i) => conducir(pilotos[i], k, pista, PASO, demo)), PASO);
        eventos.forEach((e, i) => delCuadro[i].push(...e));
      }
      if (demo.estado === 'fin' || demo.tiempo > 120) nuevaDemo();
      mundo.actualizar(demo, t, dt, delCuadro);
      seguir(camara, demo.karts[0], dt);
    },
    dibujar(renderer) {
      dibujarVistas(renderer, mundo.escena, [camara]);
    },
    salir() {},
  };
}
```

- [ ] **Paso 6: reemplazar `src/pantallas/podio.js`**

```js
import { crearPodio3D } from '../dibujo/podio3d.js';
import { dibujarVistas } from '../dibujo/camaras.js';
import { crearOpcionesPodio, pulsarPodio, avanzarPodio } from '../logica/podio.js';
import { PISTAS, indicePista } from '../logica/pistas.js';
import { crearTarjetas } from './tarjetas.js';
import { el } from './dom.js';

export function pantallaPodio(ctx, { carrera, jugadores, orden, humanos }) {
  const { personajes, sonido } = ctx;
  const ficha = (i) => personajes.find((p) => p.id === orden[i]);
  const podio = crearPodio3D(carrera.puestos.slice(0, 3).map(ficha));
  sonido.efecto('meta');
  const filas = carrera.puestos
    .map((i, p) => {
      const j = humanos.indexOf(i);
      return `<div class="fila ${j >= 0 ? `j${j + 1}` : ''}"><span class="numero">${p + 1}</span>${ficha(i).icono}</div>`;
    })
    .join('');
  const raiz = el('div', 'podio', `<div class="tabla">${filas}</div>
    <div class="opciones botones"><div class="opcion">🔁</div><div class="opcion">🗺️</div><div class="opcion">🏠</div></div>`);
  const tarjetas = crearTarjetas();
  raiz.append(tarjetas);
  ctx.capa.append(raiz);
  const botones = raiz.querySelector('.botones');
  const opciones = crearOpcionesPodio(PISTAS.length, indicePista(ctx.pistaId));

  // 🔁 y 🗺️ siguen con los mismos personajes y la misma velocidad; 🗺️ además arma la pista nueva.
  function hacer(accion) {
    if (!accion) return false;
    if (accion.ir === 'inicio') {
      ctx.ir('inicio');
    } else {
      ctx.usarPista(PISTAS[accion.pista].id);
      ctx.ir('carrera', { jugadores, clase: carrera.clase });
    }
    return true;
  }
  [...botones.children].forEach((b, i) => b.addEventListener('click', () => hacer(pulsarPodio(opciones, { opcion: i }))));
  [...tarjetas.children].forEach((c, i) => c.addEventListener('click', () => {
    if (opciones.eleccion) hacer(pulsarPodio(opciones, { opcion: i }));
  }));
  function pintar() {
    const eligiendo = opciones.eleccion !== null;
    botones.classList.toggle('oculto', eligiendo);
    tarjetas.classList.toggle('oculto', !eligiendo);
    [...botones.children].forEach((b, i) => b.classList.toggle('elegida', i === opciones.marco));
    if (eligiendo) [...tarjetas.children].forEach((c, i) => c.classList.toggle('elegida', i === opciones.eleccion.marco));
  }
  pintar();

  let t = 0;
  return {
    actualizar(fuentes, dt) {
      t += dt;
      podio.actualizar(t);
      // El primer segundo se ignora: así el botón que se tenía apretado al llegar no salta el podio.
      if (t < 1) return;
      if (hacer(avanzarPodio(opciones, dt))) return;
      for (const f of fuentes) {
        if (hacer(pulsarPodio(opciones, f.recien))) return;
      }
      pintar();
    },
    dibujar(renderer) {
      dibujarVistas(renderer, podio.escena, [podio.camara]);
    },
    salir() {
      podio.soltar();
    },
  };
}
```

- [ ] **Paso 7: la carrera recuerda su pista; estilos de las tarjetas**

En `src/pantallas/carrera.js`, después de `const { pista, mundo, personajes, sonido } = ctx;` agregar:

```js
  // Para el menú: el marco de pista parte aquí y 🎲 no la repite.
  ctx.ultimaCorrida = ctx.pistaId;
```

Al final de `src/estilo.css` agregar:

```css
.opciones.pista { gap: 2vw; }
.tarjeta { width: 26vh; height: 28vh; flex-direction: column; gap: 0.6vh; font-size: 6vh; border-radius: 3vh; }
.tarjeta svg { width: 23vh; height: 14.4vh; }
.tarjeta .icono { line-height: 1; }
.tarjeta .nombre { font-size: 2.3vh; font-weight: 700; text-shadow: 0 0.2vh 0 #000; }
.tarjeta .dado { font-size: 12vh; }
.podio .tarjeta { width: 22vh; height: 24vh; font-size: 5vh; }
.podio .tarjeta svg { width: 19vh; height: 11.9vh; }
```

- [ ] **Paso 8: ver que todo pasa**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run 2>&1 | tail -6 && npm run build 2>&1 | tail -3`
Expected: PASS de toda la suite y construcción sin errores.

- [ ] **Paso 9: prueba en el navegador**

Levantar `npx vite --port 5299 --strictPort` en segundo plano. En la carpeta con Playwright del scratchpad, crear `probar-menu-pistas.mjs`:

```js
// Paso 🗺️ del menú, 🎲, y botón 🗺️ del podio, con controles falsos.
import { chromium } from 'playwright';

const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } });
const errores = [];
pagina.on('pageerror', (e) => errores.push(e.message));
pagina.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
await pagina.addInitScript(() => {
  const boton = () => ({ pressed: false, value: 0 });
  window.__mandos = [0, 1].map((index) => ({
    index, id: `falso ${index}`, connected: true, mapping: 'standard', timestamp: 0,
    axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, boton),
  }));
  Object.defineProperty(navigator, 'getGamepads', { value: () => window.__mandos });
});
const fijar = (m, b, si) => pagina.evaluate(([m, b, si]) => { window.__mandos[m].buttons[b] = { pressed: si, value: si ? 1 : 0 }; }, [m, b, si]);
const pulsar = async (m, b) => { await fijar(m, b, true); await pagina.waitForTimeout(150); await fijar(m, b, false); await pagina.waitForTimeout(150); };
const estado = () => pagina.evaluate(() => ({ pantalla: window.__ole.juego.pantalla, pista: window.__ole.juego.ctx.pistaId }));

await pagina.goto('http://localhost:5299/');
await pagina.waitForTimeout(3000);
// 👤, 🐢 y el paso de pista.
await pulsar(0, 0);
await pulsar(0, 0);
await pagina.screenshot({ path: 'm-pistas.png' });
// B vuelve a la velocidad; A vuelve a la pista; 🎲 (a la derecha de la última pista) y su ruleta.
await pulsar(0, 1);
console.log('tras B', await pagina.evaluate(() => [...document.querySelectorAll('.opciones')].filter((g) => !g.classList.contains('oculto')).map((g) => g.className)));
await pulsar(0, 0);
const cantidad = await pagina.evaluate(() => document.querySelectorAll('.tarjeta').length);
for (let i = 1; i < cantidad; i++) await pulsar(0, 15);
await pulsar(0, 0);
await pagina.waitForTimeout(400);
await pagina.screenshot({ path: 'm-ruleta.png' });
await pagina.waitForTimeout(1500);
console.log('tras 🎲', await estado());
// Selección: A elige personaje; la carrera parte.
await pulsar(0, 0);
await pagina.waitForTimeout(5000);
console.log('carrera', await estado());
// Podio sin terminar la carrera: con los datos de la carrera en curso.
await pagina.evaluate(() => {
  const { ctx } = window.__ole.juego;
  const c = ctx.carrera;
  const humano = c.karts.findIndex((k) => k.humano);
  ctx.ir('podio', { carrera: c, jugadores: [{ fuente: 'mando-0', personaje: c.karts[humano].id, ayuda: false }], orden: c.karts.map((k) => k.id), humanos: [humano] });
});
await pagina.waitForTimeout(1500);
await pagina.screenshot({ path: 'p-botones.png' });
await pulsar(0, 15);
await pulsar(0, 0);
await pagina.waitForTimeout(300);
await pagina.screenshot({ path: 'p-pistas.png' });
await pulsar(0, 1);
console.log('B en las pistas del podio', await estado());
// El marco quedó en 🗺️: A abre las pistas (marco en la actual) y otra A la elige.
await pulsar(0, 0);
await pulsar(0, 0);
await pagina.waitForTimeout(800);
console.log('🗺️ y A en la misma pista', await estado());
console.log('errores:', errores.length ? errores : 'ninguno');
await navegador.close();
```

Run: `node probar-menu-pistas.mjs`
Expected: `tras B` muestra solo `opciones velocidad`; `tras 🎲` → `{ pantalla: 'seleccion', pista: 'noche' }` (con una sola pista, 🎲 da Noche); `carrera` → pantalla `carrera`; `B en las pistas del podio` → pantalla `podio`; la última línea → pantalla `carrera`; `errores: ninguno`. Mirar `m-pistas.png`, `m-ruleta.png`, `p-botones.png` y `p-pistas.png`: tarjetas legibles, con el recorrido y la meta, y el marco visible. Detener el servidor.

- [ ] **Paso 10: commit**

```bash
cd /c/Users/Gfigueroa/OleKart && git add -A src tests && git commit -q -F - <<'EOF'
Paso 🗺️ en el menú con tarjetas del recorrido y 🎲, y botón 🗺️ en el podio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tarea 6: Feria flamenca y punto de control

**Archivos:**
- Modificar: `src/logica/pistas.js`, `src/sonido/partituras.js`, `src/dibujo/ambientes/index.js`
- Crear: `src/dibujo/ambientes/feria.js`

**Interfaces:**
- Consume: `PISTAS` (tarea 1), `PARTITURAS` (tarea 2), `AMBIENTES`, `juntar`, `juntarBrillo`, `colocar`, `astro`, `lejosDeLaMeta`, `limites` (tarea 3).
- Produce: pista `feria` en el catálogo, su ambiente `FERIA` y su partitura `FERIA`.

- [ ] **Paso 1: agregar el recorrido al catálogo**

En `src/logica/pistas.js`, antes de `export const PISTAS`:

```js
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
```

y en `PISTAS`, después de Noche: `{ id: 'feria', icono: '🎡', nombre: 'Feria flamenca', recorrido: FERIA },`.

- [ ] **Paso 2: ver que falla**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run 2>&1 | grep -E "FAIL|Test Files|Tests "`
Expected: FAIL en `ambientes.test.js` (catálogo: faltan el ambiente y la música de `feria`; las pruebas del ambiente de Feria flamenca fallan porque `AMBIENTES.feria` no existe). `pistas.test.js` pasa también para Feria (el recorrido se validó al diseñarlo).

- [ ] **Paso 3: `src/dibujo/ambientes/feria.js`**

```js
import * as THREE from 'three';
import { lugaresLibres, limites } from '../../logica/decorado.js';
import { VALLA, puntoEn } from '../../logica/pista.js';
import { juntar, juntarBrillo, colocar, astro, lejosDeLaMeta } from './comun.js';

// Feria flamenca de día: casetas a rayas, farolillos de colores, naranjos y una noria a lo lejos.
const BLANCO = 0xfdf6e3;
const ROJO = 0xd62828;
const VERDE = 0x2d9c5a;
const AMARILLO = 0xffd166;
const COLORES_CASETA = [ROJO, VERDE, ROJO, 0x1e6fd9];
const FAROLILLOS = [ROJO, AMARILLO, VERDE, 0xffffff, 0x1e88e5];

// Portada de la feria sobre la meta: dos torres blancas, una viga con franjas, un remate y ampolletas.
function meta(pista) {
  const p = puntoEn(pista, 1);
  const g = new THREE.Group();
  g.position.set(p.x, 0, -p.y);
  g.rotation.y = p.rumbo;
  const ancho = 2 * VALLA + 4;
  const franja = new THREE.BoxGeometry(1.7, 0.5, ancho + 0.1);
  g.add(juntar([
    ...[VALLA + 1, -(VALLA + 1)].map((z) => ({ geo: new THREE.BoxGeometry(2.4, 10, 2.4), color: BLANCO, pos: [0, 5, z] })),
    { geo: new THREE.BoxGeometry(1.6, 2.6, ancho), color: BLANCO, pos: [0, 10, 0] },
    { geo: franja, color: ROJO, pos: [0, 9.2, 0] },
    { geo: franja, color: AMARILLO, pos: [0, 10.8, 0] },
    // Medio disco de pie sobre la viga, de cara a quien llega.
    { geo: new THREE.CylinderGeometry(4, 4, 1.2, 20, 1, false, 0, Math.PI), color: ROJO, pos: [0, 11.3, 0], rot: [0, 0, Math.PI / 2] },
  ]));
  const ampolleta = new THREE.SphereGeometry(0.3, 6, 5);
  const ampolletas = [];
  for (let z = -VALLA; z <= VALLA; z += 1.5) ampolletas.push({ geo: ampolleta, color: AMARILLO, pos: [-0.9, 10, z] });
  g.add(juntarBrillo(ampolletas));
  return g;
}

// Casetas a la derecha del camino; el frente con rayas mira a la pista (z local negativo).
function casetas(pista) {
  const cuerpo = new THREE.BoxGeometry(8, 4.5, 6);
  const raya = new THREE.BoxGeometry(0.8, 4.5, 0.12);
  // Techo a dos aguas: una caja girada 45° sobre el eje de la pista.
  const techo = new THREE.BoxGeometry(8.4, 4.4, 4.4);
  return lugaresLibres(pista, { cada: 14, distancia: 21, holgura: 16, lado: -1 }).flatMap((l, i) => {
    const color = COLORES_CASETA[i % COLORES_CASETA.length];
    return colocar(l, [
      { geo: cuerpo, color: BLANCO, pos: [0, 2.25, 0] },
      ...[-3, -1, 1, 3].map((x) => ({ geo: raya, color, pos: [x, 2.25, -3.06] })),
      { geo: techo, color, pos: [0, 4.5, 0], rot: [Math.PI / 4, 0, 0] },
    ]);
  });
}

// Postes a ambos lados con una barra de farolillos de colores.
function farolillos(pista) {
  const poste = new THREE.CylinderGeometry(0.12, 0.15, 5, 6);
  const barra = new THREE.CylinderGeometry(0.06, 0.06, 7, 5);
  const farol = new THREE.SphereGeometry(0.42, 8, 6);
  return [1, -1].flatMap((lado) => lugaresLibres(pista, { cada: 16, distancia: 12.5, holgura: 12, lado })
    .filter(lejosDeLaMeta(pista))
    .flatMap((l, i) => colocar(l, [
      { geo: poste, color: 0x5c4033, pos: [0, 2.5, 0] },
      { geo: barra, color: 0x5c4033, pos: [0, 5, 0], rot: [0, 0, Math.PI / 2] },
      ...[-3, -1.5, 0, 1.5, 3].map((x, j) => ({
        geo: farol, color: FAROLILLOS[(i + j) % FAROLILLOS.length], pos: [x, 4.4, 0], esc: [1, 1.3, 1],
      })),
    ])));
}

// Naranjos a la izquierda del camino.
function naranjos(pista) {
  const tronco = new THREE.CylinderGeometry(0.35, 0.45, 2.4, 6);
  const copa = new THREE.SphereGeometry(2.2, 10, 8);
  const naranja = new THREE.SphereGeometry(0.32, 6, 5);
  const frutas = [[1.6, 3.9, 1], [-1.4, 3.3, 1.2], [0.4, 4.9, -1.5], [-0.8, 4.2, -1.6], [1.2, 3, -1.3]];
  return lugaresLibres(pista, { cada: 22, distancia: 18, holgura: 15, lado: 1 }).flatMap((l) => colocar(l, [
    { geo: tronco, color: 0x7a4a2a, pos: [0, 1.2, 0] },
    { geo: copa, color: 0x2f8f46, pos: [0, 3.6, 0], esc: [1, 0.9, 1] },
    ...frutas.map((pos) => ({ geo: naranja, color: 0xff8c1a, pos })),
  ]));
}

// Noria a lo lejos, de frente a la pista. La rueda gira (g.rueda).
function noria(pista) {
  const b = limites(pista);
  const g = new THREE.Group();
  g.position.set(b.maxX + 75, 0, -(b.minY + b.maxY) / 2);
  g.rotation.y = Math.PI / 2;
  // Patas en A a cada lado de la rueda, del suelo al eje (a 28 de altura).
  const pata = new THREE.BoxGeometry(1, 29.4, 1);
  g.add(juntar([-3, 3].flatMap((z) => [
    { geo: pata, color: BLANCO, pos: [-4.5, 14, z], rot: [0, 0, -0.31] },
    { geo: pata, color: BLANCO, pos: [4.5, 14, z], rot: [0, 0, 0.31] },
  ])));
  const rueda = juntar([
    { geo: new THREE.TorusGeometry(20, 0.6, 6, 40), color: ROJO, pos: [0, 0, 0] },
    ...[0, 1, 2, 3].map((k) => ({ geo: new THREE.BoxGeometry(0.4, 40, 0.4), color: BLANCO, pos: [0, 0, 0], rot: [0, 0, (k * Math.PI) / 4] })),
    ...Array.from({ length: 8 }, (_, k) => ({
      geo: new THREE.BoxGeometry(2.6, 2.6, 2.6),
      color: FAROLILLOS[k % FAROLILLOS.length],
      pos: [Math.cos((k * Math.PI) / 4) * 20, Math.sin((k * Math.PI) / 4) * 20, 0],
    })),
  ]);
  rueda.position.y = 28;
  g.add(rueda);
  g.rueda = rueda;
  return g;
}

function decorado(pista) {
  const g = new THREE.Group();
  g.add(juntar([...casetas(pista), ...farolillos(pista), ...naranjos(pista)]));
  const n = noria(pista);
  g.add(n, astro(FERIA.luz.solPos, 0xfff3b0, 26));
  // La noria gira despacio con el reloj del dibujo: en pausa queda quieta.
  g.actualizar = (t) => {
    n.rueda.rotation.z = t * 0.12;
  };
  return g;
}

export const FERIA = {
  cielo: 0x8fd3ff,
  niebla: { color: 0xc7ebff, cerca: 90, lejos: 320 },
  luz: { cielo: 0xffffff, suelo: 0xe2b259, intensidad: 1.2, sol: 0xfff1d6, solIntensidad: 1.6, solPos: [320, 220, -460] },
  // Albero: la tierra amarilla de la feria. Camino gris (contraste 2,57).
  suelo: 0xe2b259,
  camino: 0x6b6f7a,
  bordes: [ROJO, 0xffffff],
  vallas: [ROJO, 0xffffff],
  rampa: 0xf4a261,
  meta,
  decorado,
};
```

En `src/dibujo/ambientes/index.js`: `import { FERIA } from './feria.js';` y `export const AMBIENTES = { noche: NOCHE, feria: FERIA };`.

- [ ] **Paso 4: la rumba de la feria en `src/sonido/partituras.js`**

Antes de `export const PARTITURAS` agregar:

```js
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
```

y `export const PARTITURAS = { noche: NOCHE, feria: FERIA };`.

- [ ] **Paso 5: ver que todo pasa**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run 2>&1 | tail -6 && npm run build 2>&1 | tail -3`
Expected: PASS de toda la suite (con las pruebas de recorrido, carrera, ambiente, decorado y partitura de Feria) y construcción sin errores.

- [ ] **Paso 6: medir y capturar en el navegador**

Levantar `npx vite --port 5299 --strictPort` en segundo plano. En la carpeta con Playwright, crear:

`medir-pistas.mjs`:

```js
// Mide cuadros por segundo y llamadas de dibujo en una carrera de 2 jugadores a 🐢 con ayuda, en la pista
// indicada; captura la carrera y comprueba que la pausa deja todo quieto.
// Uso: node medir-pistas.mjs <posición de la pista en el menú> <nombre>
import { chromium } from 'playwright';

const indice = Number(process.argv[2] ?? 0);
const nombre = process.argv[3] ?? `pista-${indice}`;
const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } });
const errores = [];
pagina.on('pageerror', (e) => errores.push(e.message));
pagina.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
await pagina.addInitScript(() => {
  const boton = () => ({ pressed: false, value: 0 });
  window.__mandos = [0, 1].map((index) => ({
    index, id: `falso ${index}`, connected: true, mapping: 'standard', timestamp: 0,
    axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, boton),
  }));
  Object.defineProperty(navigator, 'getGamepads', { value: () => window.__mandos });
});
const fijar = (m, b, si) => pagina.evaluate(([m, b, si]) => { window.__mandos[m].buttons[b] = { pressed: si, value: si ? 1 : 0 }; }, [m, b, si]);
const pulsar = async (m, b) => { await fijar(m, b, true); await pagina.waitForTimeout(150); await fijar(m, b, false); await pagina.waitForTimeout(150); };

await pagina.goto('http://localhost:5299/');
await pagina.waitForTimeout(3000);
// 👥, 🐢, la pista indicada; el control 2 se une, ayuda para ambos y los dos confirman.
const pasos = [[0, 15], [0, 0], [0, 0], ...Array(indice).fill([0, 15]), [0, 0], [1, 0], [0, 3], [1, 3], [0, 0], [1, 0]];
for (const [m, b] of pasos) await pulsar(m, b);
await pagina.waitForTimeout(5000);
await fijar(0, 0, true);
await fijar(1, 0, true);
await pagina.waitForTimeout(6000);
await pagina.screenshot({ path: `c-${nombre}.png` });
const r = await pagina.evaluate(() => new Promise((listo) => {
  const { renderer } = window.__ole.juego.ctx;
  let n = 0;
  let llamadas = 0;
  const inicio = performance.now();
  const contar = () => {
    n += 1;
    llamadas = Math.max(llamadas, renderer.info.render.calls);
    if (performance.now() - inicio < 4000) requestAnimationFrame(contar);
    else listo({ cuadros: n / 4, llamadas });
  };
  requestAnimationFrame(contar);
}));
// Pausa (Start): dos capturas separadas por 1,5 s deben ser idénticas.
await pulsar(0, 9);
await pagina.waitForTimeout(500);
const a = await pagina.screenshot();
await pagina.waitForTimeout(1500);
const b = await pagina.screenshot();
const { pantalla, pistaId } = await pagina.evaluate(() => ({ pantalla: window.__ole.juego.pantalla, pistaId: window.__ole.juego.ctx.pistaId }));
console.log('pantalla', pantalla, '| pista', pistaId, '| cuadros por segundo', r.cuadros.toFixed(1), '| llamadas de dibujo por vista', r.llamadas);
console.log('pausa congelada:', a.equals(b) ? 'sí' : 'NO');
console.log('errores:', errores.length ? errores : 'ninguno');
await navegador.close();
```

`aerea.mjs`:

```js
// Vista aérea de una pista, sin neblina, para mostrar el decorado completo. Uso: node aerea.mjs <id>
import { chromium } from 'playwright';

const id = process.argv[2] ?? 'noche';
const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } });
await pagina.goto('http://localhost:5299/');
await pagina.waitForTimeout(3000);
await pagina.evaluate((id) => {
  const { ctx } = window.__ole.juego;
  ctx.usarPista(id);
  ctx.ir('inicio');
}, id);
await pagina.waitForTimeout(1500);
await pagina.evaluate(() => {
  const { juego, THREE } = window.__ole;
  const { renderer, mundo, pista } = juego.ctx;
  renderer.setAnimationLoop(null);
  document.getElementById('capa').style.display = 'none';
  const xs = pista.muestras.map((m) => m.x);
  const ys = pista.muestras.map((m) => m.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const w = renderer.domElement.clientWidth;
  const h = renderer.domElement.clientHeight;
  const camara = new THREE.PerspectiveCamera(45, w / h, 1, 3000);
  camara.position.set(cx, 300, -cy + 300);
  camara.lookAt(cx, 0, -cy);
  const niebla = mundo.escena.fog;
  mundo.escena.fog = null;
  renderer.setViewport(0, 0, w, h);
  renderer.setScissor(0, 0, w, h);
  renderer.render(mundo.escena, camara);
  mundo.escena.fog = niebla;
});
await pagina.screenshot({ path: `a-${id}.png` });
await navegador.close();
```

`memoria-pistas.mjs`:

```js
// Cambia de pista varias veces y anota las figuras en la tarjeta gráfica: con la misma pista, el número
// debe repetirse. Uso: node memoria-pistas.mjs <id> <id> ...
import { chromium } from 'playwright';

const ids = process.argv.slice(2);
const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } });
await pagina.goto('http://localhost:5299/');
await pagina.waitForTimeout(3000);
const medidas = [];
for (const id of ids) {
  await pagina.evaluate((id) => {
    const { ctx } = window.__ole.juego;
    ctx.usarPista(id);
    ctx.ir('inicio');
  }, id);
  await pagina.waitForTimeout(1500);
  medidas.push([id, await pagina.evaluate(() => window.__ole.juego.ctx.renderer.info.memory.geometries)]);
}
console.log(medidas.map(([id, n]) => `${id}: ${n}`).join(' | '));
await navegador.close();
```

Run (en la carpeta con Playwright):
- `node medir-pistas.mjs 1 feria` → Expected: pantalla `carrera`, pista `feria`, 55 cuadros por segundo o más, pausa congelada `sí`, `errores: ninguno`.
- `node aerea.mjs feria` → `a-feria.png`.
- `node memoria-pistas.mjs noche feria noche feria noche feria` → Expected: cada `noche` con el mismo número, y cada `feria` con el mismo número.

Mirar `c-feria.png` y `a-feria.png`: camino visible sobre el albero; casetas, farolillos, naranjos y noria sin chocar con el camino ni con la portada.

- [ ] **Paso 7: commit**

```bash
cd /c/Users/Gfigueroa/OleKart && git add -A src tests && git commit -q -F - <<'EOF'
Pista Feria flamenca: recorrido de calles con zigzag, casetas, farolillos, naranjos, noria y rumba

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

- [ ] **Paso 8: PUNTO DE CONTROL con Gonzalo (detenerse)**

1. Enviar a Gonzalo `m-pistas.png`, `c-feria.png` y `a-feria.png` (SendUserFile), con las medidas (cuadros por segundo, memoria).
2. Dejar el servidor de desarrollo encendido y pedirle que pruebe en su navegador `http://localhost:5299/`: 👤 → 🐢 → 🎡, para ver la forma y escuchar la rumba.
3. Preguntar si aprueba la Feria (forma, aspecto y música) o qué cambia.
4. **No seguir con la tarea 7 sin su visto bueno.** Si pide cambios: hacerlos con su prueba (RED → GREEN), repetir el paso 6 y volver a mostrar.

---

## Tarea 7: Playa

**Archivos:**
- Modificar: `src/logica/pistas.js`, `src/sonido/partituras.js`, `src/dibujo/ambientes/index.js`
- Crear: `src/dibujo/ambientes/playa.js`

**Interfaces:**
- Consume: lo mismo que la tarea 6, más `apuntando` (tarea 3).
- Produce: pista `playa` en el catálogo, su ambiente `PLAYA` y su partitura `PLAYA`.

- [ ] **Paso 1: agregar el recorrido al catálogo**

En `src/logica/pistas.js`, antes de `export const PISTAS`:

```js
// Playa: rápida y abierta, con la recta larga junto al mar (al sur) y dos saltos en las dunas. Antihoraria.
// Medida al diseñarla: 1.171 unidades, radio mínimo 23, partes separadas por 66; carrera de ~148 s en 🐢.
export const PLAYA = {
  puntos: [
    [0, 0], [60, 0], [130, 0], [200, 0], [260, 0], [300, 4], [330, 20], [348, 48], [352, 85], [345, 122],
    [328, 155], [302, 176], [270, 180], [230, 180], [190, 180], [155, 176], [122, 158], [88, 142], [52, 147],
    [18, 170], [-20, 185], [-60, 180], [-92, 155], [-108, 115], [-104, 72], [-92, 40], [-78, 16], [-55, 0], [-30, 0],
  ],
  turbos: [[60, 0], [122, 158], [-102, 90]],
  rampas: [[150, 0], [262, 180]],
  filas: [100, 380, 640, 900],
};
```

y en `PISTAS`, después de Feria: `{ id: 'playa', icono: '🏖️', nombre: 'Playa', recorrido: PLAYA },`.

- [ ] **Paso 2: ver que falla**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run 2>&1 | tail -5`
Expected: FAIL en `ambientes.test.js` (falta el ambiente y la música de `playa`).

- [ ] **Paso 3: `src/dibujo/ambientes/playa.js`**

```js
import * as THREE from 'three';
import { lugaresLibres, limites } from '../../logica/decorado.js';
import { VALLA, puntoEn } from '../../logica/pista.js';
import { dibujo } from '../estilo.js';
import { juntar, juntarBrillo, colocar, apuntando, astro } from './comun.js';

// Playa de día: mar turquesa al sur con espuma que va y viene, palmeras, quitasoles, castillos de arena y un faro.
const ARENA_OSCURA = 0xd9b77e;
const COLORES_QUITASOL = [0xef476f, 0xffd166, 0x118ab2, 0x06d6a0];
const COLORES_TABLA = [0x00b4d8, 0xffd166, 0xff6b6b, 0xffffff, 0x06d6a0];

// Arco de tablas de surf sobre la meta: dos tablas de pie y tres acostadas encima.
function meta(pista) {
  const p = puntoEn(pista, 1);
  const g = new THREE.Group();
  g.position.set(p.x, 0, -p.y);
  g.rotation.y = p.rumbo;
  const tabla = new THREE.CapsuleGeometry(0.9, 7, 4, 12);
  // Aplanadas en x: la cara ancha mira a quien llega.
  const plana = [0.25, 1, 1];
  g.add(juntar([
    { geo: tabla, color: COLORES_TABLA[0], pos: [0, 4.4, VALLA + 0.8], esc: plana },
    { geo: tabla, color: COLORES_TABLA[1], pos: [0, 4.4, -(VALLA + 0.8)], esc: plana },
    ...[-7, 0, 7].map((z, i) => ({ geo: tabla, color: COLORES_TABLA[2 + i], pos: [0, 9.6, z], rot: [Math.PI / 2, 0, 0], esc: plana })),
  ]));
  return g;
}

// Mar al sur del recorrido, desde la orilla (28 unidades más allá del punto más al sur) hasta el horizonte.
function mar(pista) {
  const b = limites(pista);
  const orilla = b.minY - 28;
  const cx = (b.minX + b.maxX) / 2;
  const g = new THREE.Group();
  const agua = new THREE.Mesh(new THREE.PlaneGeometry(1600, 800), dibujo(0x2ec4d6));
  agua.rotation.x = -Math.PI / 2;
  agua.position.set(cx, 0.15, -(orilla - 400));
  const espuma = new THREE.Mesh(new THREE.PlaneGeometry(1600, 2.5), dibujo(0xffffff));
  espuma.rotation.x = -Math.PI / 2;
  espuma.position.set(cx, 0.2, -orilla);
  g.add(agua, espuma);
  g.orilla = orilla;
  // La espuma sube y baja por la arena con el reloj del dibujo.
  g.actualizar = (t) => {
    espuma.position.z = -orilla - 1.5 + Math.sin(t * 0.9) * 1.5;
  };
  return g;
}

function palmeras(lugares) {
  const tramo = new THREE.CylinderGeometry(0.3, 0.38, 1.6, 6);
  const hoja = new THREE.ConeGeometry(0.7, 4.2, 4);
  const coco = new THREE.SphereGeometry(0.35, 6, 5);
  const cima = [0.9, 7.8, 0];
  return lugares.flatMap((l) => {
    const piezas = [0, 1, 2, 3, 4].map((i) => ({
      geo: tramo, color: i % 2 ? 0x8d5a2b : 0xa0693a, pos: [i * 0.2, 0.8 + i * 1.5, 0], rot: [0, 0, -0.06 * i],
    }));
    // Seis hojas hacia afuera y un poco caídas.
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const dir = [Math.cos(a) * 0.94, -0.34, Math.sin(a) * 0.94];
      piezas.push({
        geo: hoja, color: 0x2e9e4f, rot: apuntando(dir), esc: [1, 1, 0.35],
        pos: [cima[0] + dir[0] * 2.1, cima[1] + dir[1] * 2.1, cima[2] + dir[2] * 2.1],
      });
    }
    for (const [x, z] of [[0.4, 0.3], [-0.3, 0.3], [0, -0.4]]) piezas.push({ geo: coco, color: 0x6b4226, pos: [cima[0] + x, cima[1] - 0.5, z] });
    return colocar(l, piezas);
  });
}

function quitasoles(lugares) {
  const palo = new THREE.CylinderGeometry(0.08, 0.08, 3.4, 5);
  const tela = new THREE.ConeGeometry(2.4, 1, 10);
  const toalla = new THREE.BoxGeometry(1.4, 0.08, 2.8);
  return lugares.flatMap((l, i) => colocar(l, [
    { geo: palo, color: 0xffffff, pos: [0, 1.7, 0] },
    { geo: tela, color: COLORES_QUITASOL[i % COLORES_QUITASOL.length], pos: [0, 3.6, 0] },
    { geo: toalla, color: COLORES_QUITASOL[(i + 1) % COLORES_QUITASOL.length], pos: [1.8, 0.05, 0.6] },
  ]));
}

function castillos(lugares) {
  const base = new THREE.BoxGeometry(2.4, 1.2, 2.4);
  const torre = new THREE.CylinderGeometry(0.45, 0.5, 1.4, 6);
  const punta = new THREE.ConeGeometry(0.5, 0.7, 6);
  return lugares.flatMap((l) => colocar(l, [
    { geo: base, color: ARENA_OSCURA, pos: [0, 0.6, 0] },
    ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].flatMap(([x, z]) => [
      { geo: torre, color: ARENA_OSCURA, pos: [x, 1.3, z] },
      { geo: punta, color: 0xc99a5b, pos: [x, 2.35, z] },
    ]),
  ]));
}

// Faro a rayas sobre una roca en el mar, cerca del final de la recta de la orilla.
function faro(pista, orilla) {
  const b = limites(pista);
  const piezas = [{ geo: new THREE.SphereGeometry(6, 10, 8), color: 0x7d8597, pos: [0, -1, 0], esc: [1.3, 0.6, 1.3] }];
  for (let i = 0; i < 6; i++) {
    const radio = 2.2 - i * 0.14;
    piezas.push({ geo: new THREE.CylinderGeometry(radio - 0.14, radio, 2.5, 12), color: i % 2 ? 0xffffff : 0xd62828, pos: [0, 2.6 + i * 2.5, 0] });
  }
  piezas.push({ geo: new THREE.ConeGeometry(1.8, 2, 12), color: 0xd62828, pos: [0, 18.95, 0] });
  const g = juntar(piezas);
  g.add(juntarBrillo([{ geo: new THREE.CylinderGeometry(1.2, 1.2, 1.6, 12), color: 0xffe066, pos: [0, 17.15, 0] }]));
  g.position.set(b.maxX + 15, 0, -(orilla - 20));
  return g;
}

function decorado(pista) {
  const g = new THREE.Group();
  const agua = mar(pista);
  // Afuera (a la derecha) hay arena hasta la orilla: ahí van palmeras y quitasoles, nunca en el agua.
  const afuera = lugaresLibres(pista, { cada: 20, distancia: 18, holgura: 15, lado: -1 }).filter((l) => l.y > agua.orilla + 4);
  g.add(juntar([
    ...palmeras(afuera.filter((_, i) => i % 2 === 0)),
    ...quitasoles(afuera.filter((_, i) => i % 2 === 1)),
    ...castillos(lugaresLibres(pista, { cada: 40, distancia: 16, holgura: 14, lado: 1 })),
    ...palmeras(lugaresLibres(pista, { cada: 30, distancia: 24, holgura: 18, lado: 1 })),
  ]));
  g.add(agua, faro(pista, agua.orilla), astro(PLAYA.luz.solPos, 0xfff6c9, 26));
  g.actualizar = (t) => agua.actualizar(t);
  g.actualizar(0);
  return g;
}

export const PLAYA = {
  cielo: 0x4fc3f7,
  niebla: { color: 0xa8e6ff, cerca: 100, lejos: 360 },
  luz: { cielo: 0xffffff, suelo: 0xf2dfb0, intensidad: 1.2, sol: 0xffffff, solIntensidad: 1.7, solPos: [380, 230, 320] },
  // Arena; camino de asfalto (contraste 4,53). Las rampas se ven como dunas.
  suelo: 0xf2dfb0,
  camino: 0x5d6470,
  bordes: [0x1e88e5, 0xffffff],
  vallas: [0x1e88e5, 0xffffff],
  rampa: 0xd4a35a,
  meta,
  decorado,
};
```

En `src/dibujo/ambientes/index.js`: `import { PLAYA } from './playa.js';` y `export const AMBIENTES = { noche: NOCHE, feria: FERIA, playa: PLAYA };`.

- [ ] **Paso 4: el surf de la playa en `src/sonido/partituras.js`**

Antes de `export const PARTITURAS` agregar:

```js
// Guitarra de surf: cada nota suena dos semicorcheas seguidas (8 notas por compás).
function tremolo(compases) {
  return Object.fromEntries(compases.flatMap((notas, c) => notas.flatMap((n, i) => [[c * 16 + i * 2, n], [c * 16 + i * 2 + 1, n]])));
}

// Playa: surf original en mi mayor, rápido, con redobles al final de cada frase (compases 4 y 8).
export const PLAYA = {
  tempo: 156,
  compases: 8,
  // Mi, mi, la, la, si, la, mi y si mayor.
  acordes: [
    [52, 56, 59], [52, 56, 59], [57, 61, 64], [57, 61, 64],
    [59, 63, 66], [57, 61, 64], [52, 56, 59], [59, 63, 66],
  ],
  bajos: [40, 40, 45, 45, 47, 45, 40, 47],
  ritmoBajo: { 0: 0, 2: 0, 4: 7, 6: 0, 8: 12, 10: 0, 12: 7, 14: 0 },
  golpesAcorde: [4, 12],
  bateria: { bombo: [0, 8], palmas: [4, 12], platillo: [0, 2, 4, 6, 8, 10, 12, 14] },
  rellenos: Object.fromEntries([...Array(8).keys()].flatMap((i) => [[56 + i, ['redoble']], [120 + i, ['redoble']]])),
  melodia: tremolo([
    [76, 76, 76, 76, 80, 80, 80, 80],
    [83, 83, 83, 83, 81, 81, 80, 80],
    [81, 81, 81, 81, 85, 85, 85, 85],
    [83, 83, 81, 81, 80, 80, 78, 78],
    [78, 78, 78, 78, 83, 83, 83, 83],
    [81, 81, 81, 81, 80, 80, 78, 78],
    [76, 76, 80, 80, 83, 83, 88, 88],
    [87, 87, 83, 83, 78, 78, 75, 75],
  ]),
  escala: [4, 6, 8, 9, 11, 1, 3],
  sonidos: {
    bajo: { onda: 'sawtooth', dur: 0.14, vol: 0.16 },
    acorde: { onda: 'square', dur: 0.08, vol: 0.03 },
    melodia: { onda: 'square', dur: 0.08, vol: 0.06 },
  },
};
```

y `export const PARTITURAS = { noche: NOCHE, feria: FERIA, playa: PLAYA };`.

- [ ] **Paso 5: ver que todo pasa**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run 2>&1 | tail -6 && npm run build 2>&1 | tail -3`
Expected: PASS de toda la suite y construcción sin errores.

- [ ] **Paso 6: medir y capturar en el navegador**

Con el servidor en marcha, en la carpeta con Playwright:
- `node medir-pistas.mjs 2 playa` → Expected: pantalla `carrera`, pista `playa`, 55 cuadros por segundo o más, pausa congelada `sí`, `errores: ninguno`.
- `node aerea.mjs playa` → `a-playa.png`: mar al sur sin tapar el camino, palmeras y quitasoles en la arena (ninguno en el agua), faro en su roca.
- `node memoria-pistas.mjs noche playa feria noche playa feria` → Expected: misma cifra en cada repetición de cada pista.

- [ ] **Paso 7: commit**

```bash
cd /c/Users/Gfigueroa/OleKart && git add -A src tests && git commit -q -F - <<'EOF'
Pista Playa: recta junto al mar, dos dunas, palmeras, quitasoles, castillos, faro y surf

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
```

---

## Tarea 8: verificación final y publicación

**Archivos:** ninguno nuevo (solo correcciones que salgan de la revisión).

- [ ] **Paso 1: verificación completa**

Run: `cd /c/Users/Gfigueroa/OleKart && npx vitest run 2>&1 | tail -6 && npm run build 2>&1 | tail -3`
Expected: PASS de toda la suite y construcción sin errores.

Con el servidor en marcha, en la carpeta con Playwright:
- `node medir-pistas.mjs 0 noche`, `node medir-pistas.mjs 1 feria`, `node medir-pistas.mjs 2 playa` → 55 cuadros por segundo o más en las tres, pausa congelada `sí`, sin errores.
- `node probar-menu-pistas.mjs` → como en la tarea 5, salvo que `tras 🎲` puede dar cualquiera de las 3 pistas (todavía no hay una última corrida): anotar cuál. Mirar que `m-pistas.png` muestre las 4 tarjetas (🌙 🎡 🏖️ 🎲) completas y legibles.
- `node memoria-pistas.mjs noche feria playa noche feria playa noche feria playa` → misma cifra por pista en las tres rondas.

Detener el servidor.

- [ ] **Paso 2: revisión final independiente**

Según superpowers:executing-plans: `review-package` del plan entre `git merge-base main HEAD` y `HEAD`, revisor en el modelo más capaz, con este plan, el diseño, el "Foco de revisión" y los `Ruling:` del registro. Corregir lo Crítico e Importante con RED → GREEN; lo menor queda anotado.

- [ ] **Paso 3: informe a Gonzalo y confirmación**

Informe breve: qué quedó, medidas, decisiones (`Ruling:`) y detalles menores. Preguntar: **¿confirma que una la entrega 1 a `main` y la publique en https://chalofster.github.io/ole-kart/?** No seguir sin un sí explícito.

- [ ] **Paso 4: unir a `main` (paso visible y separado)**

```bash
cd /c/Users/Gfigueroa/OleKart && git checkout main && git merge --ff-only pistas-1 && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: avance rápido sin conflictos; todas las pruebas pasan.

- [ ] **Paso 5: publicar (paso visible y separado)**

```bash
cd /c/Users/Gfigueroa/OleKart && git push origin main
```

- [ ] **Paso 6: comprobar la publicación**

Esperar a que `https://api.github.com/repos/chalofster/ole-kart/actions/runs?per_page=1` muestre el commit nuevo con `completed` y `success`. Luego comprobar que la página responde 200 y que su `assets/index-*.js` contiene los textos `Feria flamenca` y `Playa` (los nombres de las tarjetas, que no se minimizan).

- [ ] **Paso 7: limpiar y anotar**

Borrar la rama `pistas-1` y la carpeta de trabajo del plan (`.superpowers/sdd/2026-10-06-ole-kart-paso-c-entrega-1`). Actualizar la memoria `juegos-renata.md`: entrega 1 del paso C publicada; sigue la entrega 2 (Ciudad disco y Montaña nevada). Mensaje final breve a Gonzalo, con qué observar cuando jueguen los niños.
