---
titulo: "Plan de implementación: Olé Kart, etapa 1 (la carrera)"
tipo: plan de implementación
fecha: 04-10-2026
estado: pendiente de revisión
---

# Olé Kart, etapa 1: plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** juego de karts en 3D para el navegador, con 8 karts por carrera, 1 o 2 jugadores con controles y pantalla dividida, en la pista "Noche de Thriller".

**Arquitectura:** la lógica del juego (pista, kart, carrera, pilotos del computador, selección y entrada) es JavaScript puro en `src/logica/` y `src/entrada/`, probado con Vitest. El dibujo con Three.js está en `src/dibujo/`, las pantallas como capas HTML en `src/pantallas/` y el sonido sintetizado en `src/sonido/`. `src/juego.js` cambia de pantalla y `src/main.js` arranca todo con un paso de simulación fijo de 1/60 s.

**Tecnologías:** Three.js 0.186, Vite 8.3, Vitest 5.0, Node 24, Web Audio, Gamepad API, GitHub Pages.

**Diseño:** `docs/superpowers/specs/2026-10-04-ole-kart-etapa-1-design.md`. Leerlo antes de ejecutar.

## Restricciones globales

- Raíz del repositorio: `C:\Users\Gfigueroa\OleKart`. Todos los comandos se ejecutan desde ahí.
- En PowerShell, `npm` está bloqueado por la política de ejecución: usar la herramienta Bash.
- Versiones: `three ~0.186.1`, `vite ~8.3.2`, `vitest ~5.0.3`.
- `src/logica/` y `src/entrada/` no importan Three.js ni usan el navegador directamente (la entrada recibe la ventana como parámetro).
- Coordenadas: la lógica usa `(x, y)` sobre el piso y `h` para la altura; Three.js usa `(x, h, -y)`. El rumbo es el ángulo en radianes medido desde +x hacia +y; `giro` positivo es hacia la izquierda.
- Nombres de módulos, funciones y variables en español.
- Sin archivos de imagen, modelos ni audio: figuras con geometrías de Three.js, íconos con emoji, sonido con Web Audio.
- Ninguna pantalla exige leer: íconos, números y colores.
- El bailarín de la noche no usa el nombre, la cara, la música ni los pasos de Michael Jackson. No se usan personajes de otros juegos o películas.
- Cada `commit` termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Crear el repositorio en GitHub y hacer el primer `push` exige la confirmación explícita de Gonzalo.

## Foco de revisión

1. **Kart con turbo de frente contra una valla** → nunca la atraviesa. Prueba en la tarea 2.
2. **Dos jugadores intentan el mismo personaje** → el segundo no puede confirmarlo. Prueba en la tarea 5.
3. **Carrera con niños** → termina cuando los niños cruzan la meta final, aunque falten karts del computador. Prueba en la tarea 3.
4. **Niño con modo ayuda que gira siempre hacia un lado** → el kart no sale del camino. Prueba en la tarea 4.
5. **Control desconectado en plena carrera** → la carrera se pausa y sigue al reconectarlo. Prueba en el navegador en la tarea 8.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `package.json`, `vite.config.js`, `index.html`, `.gitignore` | Proyecto, construcción y página |
| `src/logica/azar.js` | Números al azar repetibles para las pruebas |
| `src/logica/pista.js` | Pista "Noche de Thriller": curva, muestras, proyección, rampa, turbos, controles |
| `src/logica/kart.js` | Avance de un kart: velocidad, giro, derrape, turbos, vallas, salto |
| `src/logica/carrera.js` | Parrilla, cuenta regresiva, vueltas, posiciones, ayudas de ritmo, choques entre karts, fin |
| `src/logica/pilotos.js` | Rivales del computador, modo ayuda y carrera simulada |
| `src/logica/seleccion.js` | Reglas de la selección de personaje |
| `src/logica/personajes.js` | Fichas de los 8 personajes |
| `src/logica/decorado.js` | Lugares libres para casas, faroles y calabazas |
| `src/entrada/mandos.js` | Controles y teclado convertidos a intenciones |
| `src/sonido/sonido.js` | Motores, efectos y música |
| `src/dibujo/comun.js` | Materiales y mallas compartidas |
| `src/dibujo/pista3d.js`, `decorado3d.js` | Pista y ambiente nocturno |
| `src/dibujo/personajes3d.js`, `kart3d.js` | Personajes y karts desde sus fichas |
| `src/dibujo/escena.js`, `camaras.js` | Mundo de la carrera, cámaras y pantalla dividida |
| `src/dibujo/vitrina.js`, `podio3d.js` | Escenas de selección y de podio |
| `src/pantallas/dom.js`, `inicio.js`, `seleccion.js`, `carrera.js`, `podio.js` | Las cuatro pantallas |
| `src/juego.js`, `src/main.js`, `src/estilo.css` | Cambio de pantalla, arranque y estilos |
| `.github/workflows/pages.yml` | Publicación |

---

## Tarea 1: proyecto base y pista

**Archivos:**
- Crear: `package.json`, `vite.config.js`, `.gitignore`, `src/logica/azar.js`, `src/logica/pista.js`
- Probar: `tests/azar.test.js`, `tests/pista.test.js`

**Interfaces:**
- Produce:
  - `azarConSemilla(semilla) → () => número en [0, 1)`.
  - `MEDIO_ANCHO = 7`, `VALLA = 10.5`, `RAMPA = { largo: 6, alto: 1.5 }`, `PUNTOS_DE_CONTROL = 16`, `NOCHE` (definición de la pista).
  - `crearPista(def) → { muestras, largo, paso, turbos: number[], rampa: number, controles: number[] }`. Cada muestra: `{ x, y, s, tx, ty, nx, ny, rumbo }`.
  - `proyectar(pista, x, y, cerca = null) → { indice, s, lateral, muestra }` (lateral positivo a la izquierda).
  - `puntoEn(pista, s, lateral = 0) → { x, y, rumbo, indice }`.
  - `alturaDelPiso(pista, s, lateral) → número`.
  - `diferencia(desde, hasta, largo) → número en (-largo/2, largo/2]`, `diferenciaAngular(desde, hasta)`.

- [ ] **Paso 1: proyecto**

Crear `package.json`:

```json
{
  "name": "ole-kart",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "three": "~0.186.1"
  },
  "devDependencies": {
    "vite": "~8.3.2",
    "vitest": "~5.0.3"
  }
}
```

Crear `vite.config.js`:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  test: { environment: 'node' },
});
```

Crear `.gitignore`:

```
node_modules/
dist/
```

Run: `npm install`
Expected: termina sin errores y crea `package-lock.json`.

- [ ] **Paso 2: pruebas de azar y pista**

Crear `tests/azar.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { azarConSemilla } from '../src/logica/azar.js';

describe('azarConSemilla', () => {
  it('con la misma semilla repite la secuencia', () => {
    const a = azarConSemilla(7);
    const b = azarConSemilla(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('entrega números entre 0 y 1', () => {
    const a = azarConSemilla(1);
    for (let i = 0; i < 1000; i++) {
      const v = a();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
```

Crear `tests/pista.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  crearPista, NOCHE, proyectar, puntoEn, alturaDelPiso, diferencia, diferenciaAngular,
  MEDIO_ANCHO, VALLA, RAMPA,
} from '../src/logica/pista.js';

const pista = crearPista(NOCHE);
const { muestras } = pista;
const n = muestras.length;

describe('crearPista', () => {
  it('mide cerca de 993 unidades, con una muestra por unidad', () => {
    expect(pista.largo).toBeGreaterThan(980);
    expect(pista.largo).toBeLessThan(1005);
    let menor = Infinity;
    let mayor = 0;
    muestras.forEach((m, i) => {
      const sig = muestras[(i + 1) % n];
      const d = Math.hypot(sig.x - m.x, sig.y - m.y);
      menor = Math.min(menor, d);
      mayor = Math.max(mayor, d);
    });
    expect(menor).toBeGreaterThan(0.9);
    expect(mayor).toBeLessThan(1.1);
  });

  it('la tangente es unitaria y la normal apunta a la izquierda', () => {
    for (const m of muestras) {
      expect(Math.hypot(m.tx, m.ty)).toBeCloseTo(1, 6);
      expect(m.nx).toBeCloseTo(-m.ty, 9);
      expect(m.ny).toBeCloseTo(m.tx, 9);
    }
  });

  it('la meta está en el primer punto y apunta hacia +x', () => {
    const p = puntoEn(pista, 0);
    expect(p.x).toBeCloseTo(40, 1);
    expect(p.y).toBeCloseTo(0, 1);
    expect(Math.abs(p.rumbo)).toBeLessThan(0.05);
  });

  it('ubica los turbos y la rampa donde se definieron', () => {
    [70, 381, 827].forEach((s, i) => expect(Math.abs(pista.turbos[i] - s)).toBeLessThan(4));
    expect(Math.abs(pista.rampa - 440)).toBeLessThan(4);
  });

  it('reparte 16 puntos de control desde la meta', () => {
    expect(pista.controles).toHaveLength(16);
    expect(pista.controles[0]).toBe(0);
    expect(pista.controles[8]).toBeCloseTo(pista.largo / 2, 6);
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

  it('las partes de la pista que no son vecinas quedan separadas por más que dos vallas', () => {
    let menor = Infinity;
    for (let i = 0; i < n; i += 3) {
      for (let j = i + 3; j < n; j += 3) {
        if (Math.abs(diferencia(muestras[i].s, muestras[j].s, pista.largo)) < 70) continue;
        menor = Math.min(menor, Math.hypot(muestras[i].x - muestras[j].x, muestras[i].y - muestras[j].y));
      }
    }
    expect(menor).toBeGreaterThan(2 * VALLA + 10);
  });
});

describe('proyectar', () => {
  it('una muestra se proyecta sobre sí misma', () => {
    for (const i of [0, 100, 500, 900]) {
      const m = muestras[i];
      const p = proyectar(pista, m.x, m.y);
      expect(p.indice).toBe(i);
      expect(p.lateral).toBeCloseTo(0, 6);
      expect(p.s).toBeCloseTo(m.s, 6);
    }
  });

  it('mide el desplazamiento lateral con signo: positivo a la izquierda', () => {
    const m = muestras[300];
    expect(proyectar(pista, m.x + m.nx * 3, m.y + m.ny * 3).lateral).toBeCloseTo(3, 1);
    expect(proyectar(pista, m.x - m.nx * 5, m.y - m.ny * 5).lateral).toBeCloseTo(-5, 1);
  });

  it('la búsqueda cercana da lo mismo que la completa, también cruzando la meta', () => {
    const m = muestras[640];
    const x = m.x + m.nx * 2 + m.tx * 0.4;
    const y = m.y + m.ny * 2 + m.ty * 0.4;
    expect(proyectar(pista, x, y, 630)).toEqual(proyectar(pista, x, y));
    const cerca = muestras[1];
    expect(proyectar(pista, cerca.x, cerca.y, n - 3).indice).toBe(1);
  });

  it('puntoEn y proyectar son inversos', () => {
    const p = puntoEn(pista, 300.5, 2);
    const q = proyectar(pista, p.x, p.y);
    expect(q.s).toBeCloseTo(300.5, 1);
    expect(q.lateral).toBeCloseTo(2, 1);
  });
});

describe('alturaDelPiso', () => {
  it('la rampa sube de 0 a su altura y fuera de ella el piso es plano', () => {
    const r = pista.rampa;
    expect(alturaDelPiso(pista, r - 1, 0)).toBe(0);
    expect(alturaDelPiso(pista, r + RAMPA.largo / 2, 0)).toBeCloseTo(RAMPA.alto / 2, 6);
    expect(alturaDelPiso(pista, r + RAMPA.largo, 0)).toBeCloseTo(RAMPA.alto, 6);
    expect(alturaDelPiso(pista, r + RAMPA.largo + 0.5, 0)).toBe(0);
    expect(alturaDelPiso(pista, r + 3, MEDIO_ANCHO + 0.5)).toBe(0);
  });
});

describe('diferencia', () => {
  it('mide la distancia más corta por la pista, con signo', () => {
    expect(diferencia(990, 5, 1000)).toBe(15);
    expect(diferencia(5, 990, 1000)).toBe(-15);
    expect(diferencia(100, 400, 1000)).toBe(300);
    expect(diferenciaAngular(3, -3)).toBeCloseTo(2 * Math.PI - 6, 9);
  });
});
```

- [ ] **Paso 3: verificar que fallan**

Run: `npx vitest run`
Expected: FAIL. No existen `src/logica/azar.js` ni `src/logica/pista.js`.

- [ ] **Paso 4: azar**

Crear `src/logica/azar.js`:

```js
// Números al azar repetibles (mulberry32), para que las pruebas den siempre lo mismo.
export function azarConSemilla(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Paso 5: pista**

Crear `src/logica/pista.js`:

```js
// La pista es una curva central cerrada con ancho fijo, muestreada cada ~1 unidad.
// Coordenadas lógicas (x, y) sobre el piso; el dibujo las pasa a Three.js como (x, altura, -y).

export const MEDIO_ANCHO = 7;          // medio ancho del camino
export const VALLA = 10.5;             // distancia de cada valla a la curva central
export const RAMPA = { largo: 6, alto: 1.5 };
export const PUNTOS_DE_CONTROL = 16;

// "Noche de Thriller", en sentido antihorario. El primer punto es la meta.
// Forma revisada: radio mínimo ~12 (la horquilla), vallas sin pliegues, partes separadas por más de 37.
export const NOCHE = {
  puntos: [
    [40, 0], [90, 0], [140, 0], [192, 7], [226, 42], [230, 98], [200, 134], [150, 150],
    [95, 152], [40, 150], [-15, 146], [-38, 136], [-48, 114], [-38, 91], [-15, 81],
    [10, 81], [48, 81], [72, 81], [86, 75], [92, 61], [86, 48], [72, 42], [48, 42],
    [10, 42], [-20, 42], [-35, 36], [-41, 21], [-35, 6], [-20, 0], [5, 0],
  ],
  turbos: [[110, 0], [130, 151], [20, 42]],
  rampa: [70, 151],
};

export function diferencia(desde, hasta, largo) {
  let d = (hasta - desde) % largo;
  if (d > largo / 2) d -= largo;
  else if (d <= -largo / 2) d += largo;
  return d;
}

export function diferenciaAngular(desde, hasta) {
  return diferencia(desde, hasta, 2 * Math.PI);
}

// Catmull-Rom centrípeta (Barry y Goldman): no forma rulos aunque los puntos estén a distancias distintas.
function catmullRom(p0, p1, p2, p3, u) {
  const paso = (a, b) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])) || 1e-6;
  const t0 = 0;
  const t1 = t0 + paso(p0, p1);
  const t2 = t1 + paso(p1, p2);
  const t3 = t2 + paso(p2, p3);
  const t = t1 + u * (t2 - t1);
  const mezcla = (a, b, ta, tb) => [0, 1].map((k) => ((tb - t) * a[k] + (t - ta) * b[k]) / (tb - ta));
  const a1 = mezcla(p0, p1, t0, t1);
  const a2 = mezcla(p1, p2, t1, t2);
  const a3 = mezcla(p2, p3, t2, t3);
  return mezcla(mezcla(a1, a2, t0, t2), mezcla(a2, a3, t1, t3), t1, t2);
}

export function crearPista(def) {
  const { puntos } = def;
  const total = puntos.length;
  const fina = [];
  for (let i = 0; i < total; i++) {
    const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((k) => puntos[(i + k + total) % total]);
    for (let j = 0; j < 40; j++) fina.push(catmullRom(p0, p1, p2, p3, j / 40));
  }
  const acumulado = [0];
  for (let i = 1; i <= fina.length; i++) {
    const a = fina[i - 1];
    const b = fina[i % fina.length];
    acumulado.push(acumulado[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const largo = acumulado[fina.length];
  const cantidad = Math.round(largo);
  const paso = largo / cantidad;

  const muestras = [];
  let k = 0;
  for (let i = 0; i < cantidad; i++) {
    const s = i * paso;
    while (acumulado[k + 1] < s) k++;
    const a = fina[k];
    const b = fina[(k + 1) % fina.length];
    const f = (s - acumulado[k]) / (acumulado[k + 1] - acumulado[k] || 1);
    muestras.push({ x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, s });
  }
  muestras.forEach((m, i) => {
    const sig = muestras[(i + 1) % cantidad];
    const ant = muestras[(i - 1 + cantidad) % cantidad];
    const tx = sig.x - ant.x;
    const ty = sig.y - ant.y;
    const l = Math.hypot(tx, ty);
    m.tx = tx / l;
    m.ty = ty / l;
    m.nx = -m.ty;
    m.ny = m.tx;
    m.rumbo = Math.atan2(m.ty, m.tx);
  });

  const pista = { muestras, largo, paso };
  pista.turbos = def.turbos.map(([x, y]) => proyectar(pista, x, y).s);
  pista.rampa = proyectar(pista, def.rampa[0], def.rampa[1]).s;
  pista.controles = Array.from({ length: PUNTOS_DE_CONTROL }, (_, i) => (i * largo) / PUNTOS_DE_CONTROL);
  return pista;
}

// Muestra más cercana al punto (búsqueda local si se indica un índice cercano), distancia
// recorrida s y desplazamiento lateral (positivo a la izquierda del sentido de marcha).
export function proyectar(pista, x, y, cerca = null) {
  const { muestras } = pista;
  const n = muestras.length;
  let mejor = 0;
  let dMejor = Infinity;
  const revisar = (i) => {
    const j = ((i % n) + n) % n;
    const m = muestras[j];
    const d = (m.x - x) ** 2 + (m.y - y) ** 2;
    if (d < dMejor) {
      dMejor = d;
      mejor = j;
    }
  };
  if (cerca === null) for (let i = 0; i < n; i++) revisar(i);
  else for (let i = cerca - 40; i <= cerca + 40; i++) revisar(i);
  const m = muestras[mejor];
  const dx = x - m.x;
  const dy = y - m.y;
  const s = (((m.s + dx * m.tx + dy * m.ty) % pista.largo) + pista.largo) % pista.largo;
  return { indice: mejor, s, lateral: dx * m.nx + dy * m.ny, muestra: m };
}

export function puntoEn(pista, s, lateral = 0) {
  const { muestras, largo } = pista;
  const n = muestras.length;
  const u = (((s % largo) + largo) % largo) / pista.paso;
  const i = Math.floor(u) % n;
  const f = u - Math.floor(u);
  const a = muestras[i];
  const b = muestras[(i + 1) % n];
  return {
    x: a.x + (b.x - a.x) * f + a.nx * lateral,
    y: a.y + (b.y - a.y) * f + a.ny * lateral,
    rumbo: a.rumbo,
    indice: i,
  };
}

// La rampa sube en línea recta y termina de golpe: el kart sale volando.
export function alturaDelPiso(pista, s, lateral) {
  const d = diferencia(pista.rampa, s, pista.largo);
  if (Math.abs(lateral) > MEDIO_ANCHO || d < 0 || d > RAMPA.largo) return 0;
  return (RAMPA.alto * d) / RAMPA.largo;
}
```

- [ ] **Paso 6: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en `tests/azar.test.js` y `tests/pista.test.js`.

- [ ] **Paso 7: commit**

```bash
git add package.json package-lock.json vite.config.js .gitignore src tests
git commit -m "Proyecto base y pista Noche de Thriller

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 2: el kart

**Archivos:**
- Crear: `src/logica/kart.js`
- Probar: `tests/kart.test.js`

**Interfaces:**
- Consume: `proyectar`, `puntoEn`, `alturaDelPiso`, `diferencia`, `diferenciaAngular`, `MEDIO_ANCHO`, `VALLA`, `RAMPA` (tarea 1).
- Produce:
  - `KART`, `DERRAPE`, `TURBO_PISO` (constantes).
  - Intención de manejo: `{ giro: -1..1, acelera: bool, frena: bool, derrapa: bool }`.
  - `crearKart(pista, s, lateral = 0) → kart` con `{ x, y, rumbo, vel, h, vh, enAire, derrape, chispas, turbo, indice, s, lateral }`.
  - `actualizarDerrape(kart, intencion, dt, eventos = []) → eventos`.
  - `pasoKart(kart, intencion, pista, dt, factor = 1) → eventos` (`'turbo'`, `'chispas'`, `'choque'`, `'salto'`, `'aterriza'`).

- [ ] **Paso 1: pruebas**

Crear `tests/kart.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE, MEDIO_ANCHO, VALLA, RAMPA, diferenciaAngular } from '../src/logica/pista.js';
import { crearKart, pasoKart, actualizarDerrape, KART, DERRAPE } from '../src/logica/kart.js';

const pista = crearPista(NOCHE);
const dt = 1 / 60;
const NADA = { giro: 0, acelera: false, frena: false, derrapa: false };
const ACELERA = { ...NADA, acelera: true };

function avanzar(k, intencion, segundos, factor = 1) {
  const eventos = [];
  for (let i = 0; i < Math.round(segundos / dt); i++) eventos.push(...pasoKart(k, intencion, pista, dt, factor));
  return eventos;
}

describe('crearKart', () => {
  it('parte quieto, en el suelo y mirando en el sentido de la pista', () => {
    const k = crearKart(pista, 10, 2);
    expect(k.vel).toBe(0);
    expect(k.h).toBe(0);
    expect(k.enAire).toBe(false);
    expect(k.s).toBeCloseTo(10, 0);
    expect(k.lateral).toBeCloseTo(2, 1);
    expect(Math.abs(k.rumbo)).toBeLessThan(0.05);
  });
});

describe('velocidad', () => {
  it('acelera hasta la velocidad máxima y avanza por la pista', () => {
    const k = crearKart(pista, 10);
    avanzar(k, ACELERA, 1);
    expect(k.vel).toBeCloseTo(KART.aceleracion, 0);
    avanzar(k, ACELERA, 1.5);
    expect(k.vel).toBe(KART.velMax);
    expect(k.s).toBeGreaterThan(40);
  });

  it('sin acelerar se detiene solo', () => {
    const k = crearKart(pista, 10);
    k.vel = 16;
    avanzar(k, NADA, 2.1);
    expect(k.vel).toBe(0);
  });

  it('B frena y luego retrocede despacio', () => {
    const k = crearKart(pista, 30);
    k.vel = 10;
    avanzar(k, { ...NADA, frena: true }, 1);
    expect(k.vel).toBe(-KART.retroMax);
  });

  it('quieto no gira aunque se mueva la palanca', () => {
    const k = crearKart(pista, 10);
    const rumbo = k.rumbo;
    avanzar(k, { ...NADA, giro: 1 }, 1);
    expect(k.rumbo).toBe(rumbo);
  });

  it('fuera del camino la velocidad máxima baja a 55 %', () => {
    const k = crearKart(pista, 10, 8.5);
    avanzar(k, ACELERA, 2);
    expect(Math.abs(k.lateral)).toBeGreaterThan(MEDIO_ANCHO);
    expect(k.vel).toBeCloseTo(KART.velMax * KART.fueraDePista, 5);
  });

  it('un factor mayor sube la velocidad máxima', () => {
    const k = crearKart(pista, 10);
    avanzar(k, ACELERA, 2.5, 1.1);
    expect(k.vel).toBeCloseTo(KART.velMax * 1.1, 5);
  });
});

describe('vallas', () => {
  it('al chocar rebota hacia la pista, pierde velocidad y avisa', () => {
    const k = crearKart(pista, 20, 4);
    k.vel = 20;
    k.rumbo += 0.6;
    let antes = 0;
    let eventos = [];
    for (let i = 0; i < 120 && !eventos.includes('choque'); i++) {
      antes = k.vel;
      eventos = pasoKart(k, NADA, pista, dt);
    }
    expect(eventos).toContain('choque');
    expect(k.vel).toBeLessThan(antes * 0.61);
    expect(k.lateral).toBeCloseTo(VALLA - KART.radio, 6);
    expect(diferenciaAngular(pista.muestras[k.indice].rumbo, k.rumbo)).toBeLessThan(0);
  });

  it('ni con turbo y girando contra ella atraviesa una valla', () => {
    const k = crearKart(pista, 20);
    k.vel = 32;
    k.turbo = 5;
    k.rumbo += 1.2;
    for (let i = 0; i < 180; i++) {
      pasoKart(k, { ...ACELERA, giro: 1 }, pista, dt);
      expect(Math.abs(k.lateral)).toBeLessThanOrEqual(VALLA - KART.radio + 1e-9);
    }
  });
});

describe('derrape', () => {
  const kart = (vel = 20) => ({ vel, enAire: false, derrape: null, chispas: 0, turbo: 0 });
  const derrapando = { giro: 1, acelera: true, frena: false, derrapa: true };
  const soltar = { ...derrapando, derrapa: false };
  const cargar = (k, segundos) => {
    for (let i = 0; i < Math.round(segundos / dt); i++) actualizarDerrape(k, derrapando, dt);
  };

  it('no empieza sin girar, sin velocidad o en el aire', () => {
    const a = kart();
    actualizarDerrape(a, { ...derrapando, giro: 0.2 }, dt);
    expect(a.derrape).toBeNull();
    const b = kart(5);
    actualizarDerrape(b, derrapando, dt);
    expect(b.derrape).toBeNull();
    const c = kart();
    c.enAire = true;
    actualizarDerrape(c, derrapando, dt);
    expect(c.derrape).toBeNull();
  });

  it('con 2 s de carga da chispas naranjas y, al soltar, un turbo largo', () => {
    const k = kart();
    cargar(k, 2.05);
    expect(k.chispas).toBe(2);
    const eventos = actualizarDerrape(k, soltar, dt);
    expect(eventos).toContain('turbo');
    expect(k.turbo).toBe(DERRAPE.turboNaranja);
    expect(k.derrape).toBeNull();
  });

  it('con 1 s de carga da chispas azules y un turbo corto', () => {
    const k = kart();
    cargar(k, 1.2);
    expect(k.chispas).toBe(1);
    actualizarDerrape(k, soltar, dt);
    expect(k.turbo).toBe(DERRAPE.turboAzul);
  });

  it('soltar antes de 1 s no da turbo', () => {
    const k = kart();
    cargar(k, 0.5);
    actualizarDerrape(k, soltar, dt);
    expect(k.turbo).toBe(0);
  });

  it('si el kart se frena, el derrape se pierde sin turbo', () => {
    const k = kart();
    cargar(k, 1.5);
    k.vel = 5;
    actualizarDerrape(k, derrapando, dt);
    expect(k.derrape).toBeNull();
    expect(k.turbo).toBe(0);
  });

  it('derrapando gira más que sin derrapar', () => {
    const a = crearKart(pista, 20);
    const b = crearKart(pista, 20);
    a.vel = 20;
    b.vel = 20;
    pasoKart(a, { ...ACELERA, giro: 1 }, pista, dt);
    pasoKart(b, { ...ACELERA, giro: 1, derrapa: true }, pista, dt);
    expect(b.rumbo).toBeGreaterThan(a.rumbo);
  });
});

describe('turbos', () => {
  it('durante un turbo la velocidad pasa la máxima', () => {
    const k = crearKart(pista, 10);
    k.vel = KART.velMax;
    k.turbo = 1;
    avanzar(k, ACELERA, 0.5);
    expect(k.vel).toBeGreaterThan(KART.velMax * 1.3);
  });

  it('las flechas del piso dan turbo y avisan', () => {
    const k = crearKart(pista, pista.turbos[0] - 6);
    k.vel = 20;
    const eventos = avanzar(k, ACELERA, 0.5);
    expect(eventos).toContain('turbo');
    expect(k.vel).toBeGreaterThan(KART.velMax);
  });

  it('al terminar el turbo vuelve de a poco a la velocidad normal', () => {
    const k = crearKart(pista, 10);
    k.vel = 32;
    pasoKart(k, ACELERA, pista, dt);
    expect(k.vel).toBeGreaterThan(KART.velMax);
    avanzar(k, ACELERA, 1);
    expect(k.vel).toBe(KART.velMax);
  });
});

describe('rampa', () => {
  it('lanza el kart en un salto corto y lo deja otra vez sobre la pista', () => {
    const k = crearKart(pista, pista.rampa - 20);
    k.vel = KART.velMax;
    let alturaMaxima = 0;
    const eventos = [];
    for (let i = 0; i < 120; i++) {
      eventos.push(...pasoKart(k, ACELERA, pista, dt));
      alturaMaxima = Math.max(alturaMaxima, k.h);
    }
    expect(eventos).toContain('salto');
    expect(eventos).toContain('aterriza');
    expect(alturaMaxima).toBeGreaterThan(RAMPA.alto);
    expect(k.enAire).toBe(false);
    expect(k.h).toBe(0);
    expect(Math.abs(k.lateral)).toBeLessThan(MEDIO_ANCHO);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/kart.test.js`
Expected: FAIL. No existe `src/logica/kart.js`.

- [ ] **Paso 3: escribir el kart**

Crear `src/logica/kart.js`:

```js
import {
  MEDIO_ANCHO, VALLA, RAMPA, proyectar, puntoEn, alturaDelPiso, diferencia, diferenciaAngular,
} from './pista.js';

// Manejo arcade: iguales para todos. Velocidades en unidades por segundo.
export const KART = {
  velMax: 24, aceleracion: 14, frenado: 30, roce: 8, retroMax: 6,
  giro: 1.9, giroDerrape: 2.5, radio: 1.2,
  fueraDePista: 0.55, turboExtra: 0.35, rebote: 0.6, gravedad: 30,
};
export const DERRAPE = { azul: 1, naranja: 2, turboAzul: 0.6, turboNaranja: 1.2, velMinima: 8 };
export const TURBO_PISO = { duracion: 1, largo: 4, medioAncho: 4 };

export function crearKart(pista, s, lateral = 0) {
  const p = puntoEn(pista, s, lateral);
  const pr = proyectar(pista, p.x, p.y);
  return {
    x: p.x, y: p.y, rumbo: p.rumbo, vel: 0, h: 0, vh: 0, enAire: false,
    derrape: null, chispas: 0, turbo: 0, indice: pr.indice, s: pr.s, lateral: pr.lateral,
  };
}

// Derrape: se arma girando con el gatillo apretado y, al soltarlo, la carga se cambia por turbo.
export function actualizarDerrape(k, int, dt, eventos = []) {
  if (k.derrape) {
    if (!int.derrapa) {
      const { carga } = k.derrape;
      const turbo = carga >= DERRAPE.naranja ? DERRAPE.turboNaranja : carga >= DERRAPE.azul ? DERRAPE.turboAzul : 0;
      if (turbo > 0) {
        k.turbo = Math.max(k.turbo, turbo);
        eventos.push('turbo');
      }
      k.derrape = null;
    } else if (k.vel < DERRAPE.velMinima || k.enAire) {
      k.derrape = null;
    } else {
      k.derrape.carga += dt;
    }
  } else if (int.derrapa && !k.enAire && k.vel >= DERRAPE.velMinima && Math.abs(int.giro) > 0.3) {
    k.derrape = { dir: Math.sign(int.giro), carga: 0 };
  }
  const antes = k.chispas;
  const carga = k.derrape ? k.derrape.carga : 0;
  k.chispas = !k.derrape ? 0 : carga >= DERRAPE.naranja ? 2 : carga >= DERRAPE.azul ? 1 : 0;
  if (k.chispas > antes) eventos.push('chispas');
  return eventos;
}

export function pasoKart(k, int, pista, dt, factor = 1) {
  const eventos = [];
  const turboAntes = k.turbo;
  const fuera = !k.enAire && Math.abs(k.lateral) > MEDIO_ANCHO;
  let vMax = KART.velMax * factor * (fuera ? KART.fueraDePista : 1);
  if (k.turbo > 0) vMax *= 1 + KART.turboExtra;

  if (k.vel > vMax) k.vel = Math.max(vMax, k.vel - KART.frenado * dt);
  else if (k.turbo > 0) k.vel = Math.min(vMax, k.vel + KART.aceleracion * 3 * dt);
  else if (int.frena) k.vel = Math.max(-KART.retroMax, k.vel - KART.frenado * dt);
  else if (int.acelera) k.vel = Math.min(vMax, k.vel + KART.aceleracion * dt);
  else k.vel = Math.sign(k.vel) * Math.max(0, Math.abs(k.vel) - KART.roce * dt);

  actualizarDerrape(k, int, dt, eventos);

  // Quieto no gira; en reversa el giro se invierte, como un auto.
  const agarre = Math.min(1, Math.abs(k.vel) / 6);
  let giro = int.giro * KART.giro;
  if (k.derrape) {
    const haciaAdentro = (int.giro * k.derrape.dir + 1) / 2;
    giro = k.derrape.dir * KART.giroDerrape * (0.35 + 0.65 * haciaAdentro);
  }
  if (k.enAire) giro *= 0.3;
  k.rumbo += giro * agarre * (k.vel < 0 ? -1 : 1) * dt;

  k.x += Math.cos(k.rumbo) * k.vel * dt;
  k.y += Math.sin(k.rumbo) * k.vel * dt;

  const p = proyectar(pista, k.x, k.y, k.indice);
  k.indice = p.indice;
  k.s = p.s;
  k.lateral = p.lateral;

  const piso = alturaDelPiso(pista, p.s, p.lateral);
  if (k.enAire) {
    k.vh -= KART.gravedad * dt;
    k.h += k.vh * dt;
    if (k.h <= piso) {
      k.h = piso;
      k.vh = 0;
      k.enAire = false;
      eventos.push('aterriza');
    }
  } else if (k.h > piso + 0.05) {
    k.enAire = true;
    k.vh = Math.max(0, k.vel) * (RAMPA.alto / RAMPA.largo);
    eventos.push('salto');
  } else {
    k.h = piso;
  }

  // Valla: el kart vuelve al límite y, si iba hacia ella, rebota y pierde velocidad.
  const limite = VALLA - KART.radio;
  if (Math.abs(k.lateral) > limite) {
    const lado = Math.sign(k.lateral);
    const m = p.muestra;
    const exceso = Math.abs(k.lateral) - limite;
    k.x -= m.nx * lado * exceso;
    k.y -= m.ny * lado * exceso;
    k.lateral = lado * limite;
    const relativo = diferenciaAngular(m.rumbo, k.rumbo);
    if (k.vel > 0 && Math.abs(relativo) < Math.PI / 2 && relativo * lado > 0.02) {
      k.rumbo = m.rumbo - relativo * 0.5;
      k.vel *= KART.rebote;
      eventos.push('choque');
    }
  }

  if (!k.enAire && Math.abs(k.lateral) < TURBO_PISO.medioAncho) {
    for (const t of pista.turbos) {
      const d = diferencia(t, k.s, pista.largo);
      if (d >= 0 && d <= TURBO_PISO.largo) k.turbo = Math.max(k.turbo, TURBO_PISO.duracion);
    }
  }
  if (k.turbo > 0 && turboAntes <= 0 && !eventos.includes('turbo')) eventos.push('turbo');
  k.turbo = Math.max(0, k.turbo - dt);
  return eventos;
}
```

- [ ] **Paso 4: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 5: commit**

```bash
git add src/logica/kart.js tests/kart.test.js
git commit -m "El kart: velocidad, giro, derrape, turbos, vallas y salto

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 3: la carrera

**Archivos:**
- Crear: `src/logica/carrera.js`
- Probar: `tests/carrera.test.js`

**Interfaces:**
- Consume: `crearKart`, `pasoKart`, `KART` (tarea 2); `diferencia` (tarea 1); `azarConSemilla` (tarea 1, en pruebas).
- Produce:
  - `VUELTAS = 3`, `CUENTA = 3`.
  - `crearCarrera(pista, personajes: string[], humanos: number[] = [], azar = Math.random) → carrera` con `{ pista, karts, tiempo, cuenta, estado: 'cuenta' | 'carrera' | 'fin', puestos: number[] }`. Cada kart agrega `{ id, humano, ritmo, vuelta, cp, termino, tiempoFinal, contrario, puesto }`. El índice 0 parte adelante a la izquierda.
  - `actualizarVueltas(kart, sAntes, pista, eventos = []) → eventos` (`'vuelta'`, `'meta'`).
  - `recorrido(kart, pista) → número`.
  - `factorVelocidad(kart, propio, lider, mejorHumano | null, largo) → número`.
  - `separarKarts(karts)`, `actualizarContrario(kart, pista, dt)`, `ordenarPuestos(carrera)`.
  - `pasoCarrera(carrera, intenciones, dt) → eventos por kart (arreglo de arreglos)`.

- [ ] **Paso 1: pruebas**

Crear `tests/carrera.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE } from '../src/logica/pista.js';
import { azarConSemilla } from '../src/logica/azar.js';
import { KART } from '../src/logica/kart.js';
import {
  crearCarrera, pasoCarrera, actualizarVueltas, recorrido, factorVelocidad, separarKarts,
  ordenarPuestos, actualizarContrario, VUELTAS, CUENTA,
} from '../src/logica/carrera.js';

const pista = crearPista(NOCHE);
const L = pista.largo;
const N = pista.controles.length;
const IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const dt = 1 / 60;
const ACELERAN = IDS.map(() => ({ giro: 0, acelera: true, frena: false, derrapa: false }));

describe('crearCarrera', () => {
  it('pone 8 karts en la parrilla detrás de la meta, de a dos', () => {
    const c = crearCarrera(pista, IDS, [7], azarConSemilla(1));
    expect(c.karts).toHaveLength(8);
    c.karts.forEach((k, i) => {
      expect(k.id).toBe(IDS[i]);
      expect(k.s).toBeCloseTo(L - 8 - Math.floor(i / 2) * 6, 0);
      expect(k.lateral).toBeCloseTo(i % 2 === 0 ? 3 : -3, 1);
      expect(k.vuelta).toBe(0);
      expect(k.cp).toBe(0);
    });
    expect(c.estado).toBe('cuenta');
  });

  it('los niños tienen ritmo 1 y los rivales, entre 0,92 y 1', () => {
    const c = crearCarrera(pista, IDS, [6, 7], azarConSemilla(2));
    expect(c.karts.filter((k) => k.humano).map((k) => k.id)).toEqual(['g', 'h']);
    for (const k of c.karts) {
      if (k.humano) expect(k.ritmo).toBe(1);
      else {
        expect(k.ritmo).toBeGreaterThanOrEqual(0.92);
        expect(k.ritmo).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('cuenta regresiva', () => {
  it('nadie se mueve durante la cuenta, aunque acelere', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(3));
    const x = c.karts[0].x;
    for (let i = 0; i < Math.round((CUENTA - 0.1) / dt); i++) pasoCarrera(c, ACELERAN, dt);
    expect(c.karts[0].x).toBe(x);
    expect(c.estado).toBe('cuenta');
    for (let i = 0; i < 12; i++) pasoCarrera(c, ACELERAN, dt);
    expect(c.estado).toBe('carrera');
    for (let i = 0; i < 30; i++) pasoCarrera(c, ACELERAN, dt);
    expect(c.karts[0].x).toBeGreaterThan(x);
  });
});

describe('vueltas', () => {
  const kart = (s, cp, vuelta = 0) => ({ s, cp, vuelta });
  const mover = (k, hasta) => {
    const antes = k.s;
    k.s = ((hasta % L) + L) % L;
    return actualizarVueltas(k, antes, pista);
  };
  // Avanza o retrocede por la pista en pasos de 5 unidades.
  function recorrer(k, distancia) {
    const eventos = [];
    let hecho = 0;
    while (Math.abs(hecho) < Math.abs(distancia)) {
      const d = Math.sign(distancia) * Math.min(5, Math.abs(distancia) - Math.abs(hecho));
      hecho += d;
      eventos.push(...mover(k, k.s + d));
    }
    return eventos;
  }

  it('cruzar la meta desde la parrilla empieza la vuelta 1 sin contarla', () => {
    const k = kart(L - 2, 0);
    recorrer(k, 3);
    expect(k.cp).toBe(1);
    expect(k.vuelta).toBe(0);
  });

  it('una vuelta completa suma 1 y avisa', () => {
    const k = kart(1, 1);
    const eventos = recorrer(k, L);
    expect(k.vuelta).toBe(1);
    expect(k.cp).toBe(1);
    expect(eventos).toContain('vuelta');
  });

  it('la última vuelta avisa la meta', () => {
    const k = kart(1, 1, VUELTAS - 1);
    expect(recorrer(k, L)).toContain('meta');
    expect(k.vuelta).toBe(VUELTAS);
  });

  it('retroceder deshace el último control y no suma nada', () => {
    const k = kart(1, 1);
    recorrer(k, pista.controles[3] + 1);
    expect(k.cp).toBe(4);
    recorrer(k, -5);
    expect(k.cp).toBe(3);
    recorrer(k, 5);
    expect(k.cp).toBe(4);
    const j = kart(2, 1);
    recorrer(j, -4);
    expect(j.cp).toBe(0);
    recorrer(j, 4);
    expect(j.cp).toBe(1);
    expect(j.vuelta).toBe(0);
  });

  it('un salto grande de la proyección no cuenta', () => {
    const k = kart(pista.controles[2] - 1, 2);
    mover(k, pista.controles[2] + 30);
    expect(k.cp).toBe(2);
  });

  it('si se salta un control, cruzar la meta no suma la vuelta', () => {
    const k = kart(1, 1);
    recorrer(k, pista.controles[8] - 3);
    mover(k, pista.controles[9] + 1);
    recorrer(k, L - k.s + 3);
    expect(k.vuelta).toBe(0);
  });
});

describe('recorrido', () => {
  it('es negativo detrás de la meta y crece al avanzar', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(4));
    const k = c.karts[0];
    expect(recorrido(k, pista)).toBeCloseTo(-8, 0);
    k.cp = 1;
    k.s = 10;
    expect(recorrido(k, pista)).toBeCloseTo(10, 6);
    k.vuelta = 2;
    k.cp = 5;
    k.s = pista.controles[4] + 3;
    expect(recorrido(k, pista)).toBeCloseTo(2 * L + pista.controles[4] + 3, 6);
  });

  it('un atajo no adelanta más allá del siguiente control', () => {
    expect(recorrido({ vuelta: 0, cp: 3, s: pista.controles[6] }, pista)).toBe(pista.controles[3]);
  });
});

describe('puestos', () => {
  it('ordena por recorrido y pone primero a quienes terminaron, por tiempo', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(5));
    c.karts.forEach((k, i) => {
      k.cp = 1;
      k.s = 10 + i;
    });
    Object.assign(c.karts[2], { termino: true, tiempoFinal: 90 });
    Object.assign(c.karts[5], { termino: true, tiempoFinal: 80 });
    ordenarPuestos(c);
    expect(c.puestos.slice(0, 3)).toEqual([5, 2, 7]);
    expect(c.karts[5].puesto).toBe(1);
    expect(c.karts[0].puesto).toBe(8);
  });
});

describe('factorVelocidad', () => {
  const nino = { humano: true, ritmo: 1 };
  const rival = { humano: false, ritmo: 1 };

  it('el primero va normal y quien va media vuelta atrás, 12 % más rápido', () => {
    expect(factorVelocidad(nino, 500, 500, 500, L)).toBe(1);
    expect(factorVelocidad(nino, 500 - L / 2, 500, 500 - L / 2, L)).toBeCloseTo(1.12, 6);
    expect(factorVelocidad(nino, 500 - L / 4, 500, 500 - L / 4, L)).toBeCloseTo(1.06, 6);
  });

  it('un rival muy adelante de los niños baja hasta 15 %', () => {
    expect(factorVelocidad(rival, 1000, 1000, 1000 - L / 2, L)).toBeCloseTo(0.85, 6);
    expect(factorVelocidad(rival, 1000, 1000, 1000 - L / 4, L)).toBeCloseTo(1, 6);
  });

  it('un rival muy atrás de los niños se apura', () => {
    expect(factorVelocidad(rival, 0, L / 2, L / 2, L)).toBeCloseTo(1.12 * 1.1, 6);
  });

  it('sin niños en la carrera solo cuenta el ritmo propio', () => {
    expect(factorVelocidad({ humano: false, ritmo: 0.95 }, 100, 100, null, L)).toBeCloseTo(0.95, 6);
  });
});

describe('choques entre karts', () => {
  it('separa dos karts que se tocan y les quita un poco de velocidad', () => {
    const a = { x: 0, y: 0, h: 0, vel: 10 };
    const b = { x: 1, y: 0, h: 0, vel: 10 };
    separarKarts([a, b]);
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(KART.radio * 2, 6);
    expect(a.vel).toBeLessThan(10);
  });

  it('no separa un kart en el aire de uno en el suelo', () => {
    const a = { x: 0, y: 0, h: 0, vel: 10 };
    const b = { x: 1, y: 0, h: 2, vel: 10 };
    separarKarts([a, b]);
    expect(b.x).toBe(1);
  });
});

describe('sentido contrario', () => {
  it('se marca después de 1 s andando al revés y se borra al corregir', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(6));
    const k = c.karts[0];
    k.rumbo += Math.PI;
    k.vel = 5;
    for (let i = 0; i < 70; i++) actualizarContrario(k, pista, dt);
    expect(k.contrario).toBeGreaterThan(1);
    k.rumbo -= Math.PI;
    actualizarContrario(k, pista, dt);
    expect(k.contrario).toBe(0);
  });
});

describe('fin de carrera', () => {
  it('con niños, termina cuando los niños cruzan la meta final, aunque falten rivales', () => {
    const c = crearCarrera(pista, IDS, [0], azarConSemilla(7));
    c.estado = 'carrera';
    const k = c.karts[0];
    Object.assign(k, { vuelta: VUELTAS - 1, cp: N, vel: 20 });
    for (let i = 0; i < 40; i++) pasoCarrera(c, ACELERAN, dt);
    expect(k.termino).toBe(true);
    expect(k.tiempoFinal).toBeGreaterThan(0);
    expect(c.estado).toBe('fin');
    expect(c.karts.filter((x) => x.termino)).toHaveLength(1);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/carrera.test.js`
Expected: FAIL. No existe `src/logica/carrera.js`.

- [ ] **Paso 3: escribir la carrera**

Crear `src/logica/carrera.js`:

```js
import { crearKart, pasoKart, KART } from './kart.js';
import { diferencia } from './pista.js';

export const VUELTAS = 3;
export const CUENTA = 3;

// Parrilla detrás de la meta, de a dos por fila. El índice 0 parte adelante a la izquierda.
export function crearCarrera(pista, personajes, humanos = [], azar = Math.random) {
  const karts = personajes.map((id, i) => {
    const fila = Math.floor(i / 2);
    const k = crearKart(pista, pista.largo - 8 - fila * 6, i % 2 === 0 ? 3 : -3);
    const humano = humanos.includes(i);
    return Object.assign(k, {
      id, humano, ritmo: humano ? 1 : 0.92 + 0.08 * azar(),
      vuelta: 0, cp: 0, termino: false, tiempoFinal: null, contrario: 0, puesto: i + 1,
    });
  });
  return { pista, karts, tiempo: 0, cuenta: CUENTA, estado: 'cuenta', puestos: karts.map((_, i) => i) };
}

// cp es el siguiente control por cruzar: 0 = la meta antes de empezar, 1..N-1 = controles,
// N = la meta al final de la vuelta. Retroceder deshace el último control.
export function actualizarVueltas(k, sAntes, pista, eventos = []) {
  const L = pista.largo;
  const N = pista.controles.length;
  const avance = diferencia(sAntes, k.s, L);
  if (avance === 0 || Math.abs(avance) > 20) return eventos;
  const cruza = (control) => {
    const a = diferencia(sAntes, control, L);
    return avance > 0 ? a > 0 && a <= avance : a < 0 && a >= avance;
  };
  if (avance > 0) {
    if (cruza(pista.controles[k.cp % N])) {
      if (k.cp === 0) k.cp = 1;
      else if (k.cp < N) k.cp += 1;
      else {
        k.vuelta += 1;
        k.cp = 1;
        eventos.push(k.vuelta >= VUELTAS ? 'meta' : 'vuelta');
      }
    }
  } else if (k.cp >= 1 && cruza(pista.controles[(k.cp - 1) % N])) {
    k.cp -= 1;
  }
  return eventos;
}

// Distancia total recorrida, sin pasar del siguiente control (los atajos no adelantan).
export function recorrido(k, pista) {
  const L = pista.largo;
  const N = pista.controles.length;
  if (k.cp === 0) return k.vuelta * L + Math.min(0, diferencia(0, k.s, L));
  const desde = pista.controles[k.cp - 1];
  const hasta = k.cp === N ? L : pista.controles[k.cp];
  return k.vuelta * L + Math.min(hasta, Math.max(desde, k.s));
}

// Impulso para quien va atrás (todos) y ritmo de los rivales respecto del mejor niño.
export function factorVelocidad(k, propio, lider, mejorHumano, largo) {
  const limitar = (v) => Math.min(1, Math.max(0, v));
  let f = k.ritmo * (1 + 0.12 * limitar((lider - propio) / (largo / 2)));
  if (!k.humano && mejorHumano !== null) {
    const ventaja = propio - mejorHumano;
    if (ventaja > largo / 4) f *= 1 - 0.15 * limitar((ventaja - largo / 4) / (largo / 4));
    else if (ventaja < -largo / 4) f *= 1 + 0.1 * limitar((-ventaja - largo / 4) / (largo / 4));
  }
  return f;
}

export function separarKarts(karts) {
  const minimo = KART.radio * 2;
  for (let i = 0; i < karts.length; i++) {
    for (let j = i + 1; j < karts.length; j++) {
      const a = karts[i];
      const b = karts[j];
      if (Math.abs(a.h - b.h) > 1) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d >= minimo) continue;
      const nx = d > 1e-6 ? dx / d : 1;
      const ny = d > 1e-6 ? dy / d : 0;
      const empuje = (minimo - d) / 2;
      a.x -= nx * empuje;
      a.y -= ny * empuje;
      b.x += nx * empuje;
      b.y += ny * empuje;
      a.vel *= 0.98;
      b.vel *= 0.98;
    }
  }
}

export function actualizarContrario(k, pista, dt) {
  const m = pista.muestras[k.indice];
  const alReves = Math.cos(k.rumbo) * m.tx + Math.sin(k.rumbo) * m.ty < -0.3;
  k.contrario = alReves && k.vel > 2 && !k.enAire ? k.contrario + dt : 0;
}

export function ordenarPuestos(c) {
  const valor = c.karts.map((k) => recorrido(k, c.pista));
  c.puestos = c.karts.map((_, i) => i).sort((a, b) => {
    const ka = c.karts[a];
    const kb = c.karts[b];
    if (ka.termino && kb.termino) return ka.tiempoFinal - kb.tiempoFinal;
    if (ka.termino !== kb.termino) return ka.termino ? -1 : 1;
    return valor[b] - valor[a];
  });
  c.puestos.forEach((i, p) => {
    c.karts[i].puesto = p + 1;
  });
}

export function pasoCarrera(c, intenciones, dt) {
  const eventos = c.karts.map(() => []);
  if (c.estado === 'cuenta') {
    c.cuenta -= dt;
    if (c.cuenta <= 0) {
      c.cuenta = 0;
      c.estado = 'carrera';
    }
    return eventos;
  }
  c.tiempo += dt;
  const valores = c.karts.map((k) => recorrido(k, c.pista));
  const lider = Math.max(...valores);
  const deNinos = valores.filter((_, i) => c.karts[i].humano);
  const mejorHumano = deNinos.length ? Math.max(...deNinos) : null;
  c.karts.forEach((k, i) => {
    const sAntes = k.s;
    const factor = factorVelocidad(k, valores[i], lider, mejorHumano, c.pista.largo);
    eventos[i].push(...pasoKart(k, intenciones[i], c.pista, dt, factor));
    actualizarVueltas(k, sAntes, c.pista, eventos[i]);
    if (!k.termino && k.vuelta >= VUELTAS) {
      k.termino = true;
      k.tiempoFinal = c.tiempo;
    }
    actualizarContrario(k, c.pista, dt);
  });
  separarKarts(c.karts);
  ordenarPuestos(c);
  // Con niños, la carrera termina cuando ellos llegan; sin niños (simulación), cuando llegan todos.
  const quienes = c.karts.some((k) => k.humano) ? c.karts.filter((k) => k.humano) : c.karts;
  if (c.estado === 'carrera' && quienes.every((k) => k.termino)) c.estado = 'fin';
  return eventos;
}
```

- [ ] **Paso 4: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 5: commit**

```bash
git add src/logica/carrera.js tests/carrera.test.js
git commit -m "La carrera: parrilla, cuenta, vueltas, posiciones y ritmo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 4: rivales del computador y modo ayuda

**Archivos:**
- Crear: `src/logica/pilotos.js`
- Probar: `tests/pilotos.test.js`

**Interfaces:**
- Consume: `KART` (tarea 2); `crearCarrera`, `pasoCarrera`, `actualizarVueltas` (tarea 3); `puntoEn`, `diferencia`, `diferenciaAngular`, `proyectar` (tarea 1).
- Produce:
  - `QUIETO` (intención vacía).
  - `crearPiloto(azar = Math.random) → { carril, reloj, desde, retroceso }`.
  - `velocidadPrudente(pista, s) → fracción de la velocidad máxima (0,55 a 1)`.
  - `conducir(piloto, kart, pista, dt) → intención`. Solo se llama con la carrera en curso.
  - `ayudar(intencionDelNino, kart, pista) → intención`.
  - `simularCarrera(pista, { azar, segundos }) → carrera` (8 karts del computador).

- [ ] **Paso 1: pruebas**

Crear `tests/pilotos.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE, MEDIO_ANCHO, proyectar } from '../src/logica/pista.js';
import { crearKart, pasoKart } from '../src/logica/kart.js';
import { actualizarVueltas } from '../src/logica/carrera.js';
import { azarConSemilla } from '../src/logica/azar.js';
import {
  crearPiloto, conducir, ayudar, velocidadPrudente, simularCarrera, QUIETO,
} from '../src/logica/pilotos.js';

const pista = crearPista(NOCHE);
const dt = 1 / 60;

// Da una vuelta con la función de manejo indicada y mide qué tan lejos del centro llegó.
function unaVuelta(manejar, segundos = 80) {
  const k = crearKart(pista, 5);
  Object.assign(k, { vuelta: 0, cp: 1 });
  let maxLateral = 0;
  for (let i = 0; i < 60 * segundos && k.vuelta < 1; i++) {
    const antes = k.s;
    pasoKart(k, manejar(k), pista, dt);
    actualizarVueltas(k, antes, pista);
    maxLateral = Math.max(maxLateral, Math.abs(k.lateral));
  }
  return { k, maxLateral };
}

describe('velocidadPrudente', () => {
  it('en la recta va a fondo y antes de la horquilla baja', () => {
    expect(velocidadPrudente(pista, 30)).toBe(1);
    const horquilla = proyectar(pista, 92, 61).s;
    expect(velocidadPrudente(pista, horquilla - 15)).toBeLessThan(0.75);
  });
});

describe('rival del computador', () => {
  it('da una vuelta completa sin salirse del camino', () => {
    const piloto = crearPiloto(azarConSemilla(1));
    const { k, maxLateral } = unaVuelta((kart) => conducir(piloto, kart, pista, dt));
    expect(k.vuelta).toBe(1);
    expect(maxLateral).toBeLessThan(MEDIO_ANCHO);
  });

  it('si queda atascado de frente a una valla, se suelta y sigue', () => {
    const k = crearKart(pista, 40, 9);
    k.rumbo += Math.PI / 2;
    const piloto = crearPiloto(azarConSemilla(2));
    for (let i = 0; i < 60 * 8; i++) pasoKart(k, conducir(piloto, k, pista, dt), pista, dt);
    expect(k.s).toBeGreaterThan(60);
  });
});

describe('modo ayuda', () => {
  it('sin tocar nada, el kart acelera solo y da la vuelta sin salirse del camino', () => {
    const { k, maxLateral } = unaVuelta((kart) => ayudar(QUIETO, kart, pista));
    expect(k.vuelta).toBe(1);
    expect(maxLateral).toBeLessThan(MEDIO_ANCHO);
  });

  it('aunque el niño gire siempre hacia un lado, no se sale del camino', () => {
    for (const giro of [1, -1]) {
      const { maxLateral } = unaVuelta((kart) => ayudar({ ...QUIETO, giro }, kart, pista));
      expect(maxLateral).toBeLessThan(MEDIO_ANCHO);
    }
  });

  it('respeta el freno del niño', () => {
    const k = crearKart(pista, 5);
    k.vel = 10;
    expect(ayudar({ ...QUIETO, frena: true }, k, pista)).toMatchObject({ frena: true, acelera: false });
  });
});

describe('carrera completa simulada', () => {
  it('los 8 karts del computador terminan las 3 vueltas en un tiempo razonable', () => {
    const c = simularCarrera(pista, { azar: azarConSemilla(42) });
    expect(c.estado).toBe('fin');
    expect(c.karts.every((k) => k.termino)).toBe(true);
    expect(c.tiempo).toBeGreaterThan(3 * 35);
    expect(c.tiempo).toBeLessThan(3 * 70);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/pilotos.test.js`
Expected: FAIL. No existe `src/logica/pilotos.js`.

- [ ] **Paso 3: escribir los pilotos**

Crear `src/logica/pilotos.js`:

```js
import { KART } from './kart.js';
import { crearCarrera, pasoCarrera } from './carrera.js';
import { puntoEn, diferencia, diferenciaAngular } from './pista.js';

export const QUIETO = { giro: 0, acelera: false, frena: false, derrapa: false };

const limitar = (v) => Math.max(-1, Math.min(1, v));

export function crearPiloto(azar = Math.random) {
  return { carril: (azar() * 2 - 1) * 3, reloj: 0, desde: null, retroceso: 0 };
}

// Cuánto gira la pista un poco más adelante: más giro, menos velocidad.
export function velocidadPrudente(pista, s) {
  const giro = Math.abs(diferenciaAngular(puntoEn(pista, s + 4).rumbo, puntoEn(pista, s + 24).rumbo));
  return giro > 1.2 ? 0.55 : giro > 0.8 ? 0.7 : giro > 0.45 ? 0.85 : 1;
}

// Gira hacia un punto de la pista más adelante, en su propio carril.
function haciaAdelante(k, pista, lateral) {
  const destino = puntoEn(pista, k.s + 8 + Math.max(0, k.vel) * 0.4, lateral);
  return limitar(diferenciaAngular(k.rumbo, Math.atan2(destino.y - k.y, destino.x - k.x)) * 2.5);
}

export function conducir(piloto, k, pista, dt) {
  if (piloto.retroceso > 0) {
    piloto.retroceso -= dt;
    return { ...QUIETO, frena: true };
  }
  // Atascado: si en 2 s casi no avanzó por la pista, retrocede 1 s y vuelve a intentar.
  if (piloto.desde === null) piloto.desde = k.s;
  piloto.reloj += dt;
  if (piloto.reloj >= 2) {
    if (diferencia(piloto.desde, k.s, pista.largo) < 2) piloto.retroceso = 1;
    piloto.reloj = 0;
    piloto.desde = k.s;
  }
  const prudente = velocidadPrudente(pista, k.s) * KART.velMax;
  return {
    giro: haciaAdelante(k, pista, piloto.carril),
    acelera: k.vel < prudente,
    frena: k.vel > prudente + 4,
    derrapa: false,
  };
}

// Modo ayuda: acelera solo y, cerca del borde, la dirección se corrige hacia el centro.
export function ayudar(int, k, pista) {
  const peso = Math.min(1, Math.max(0, (Math.abs(k.lateral) - 2.5) / 3));
  const prudente = velocidadPrudente(pista, k.s) * KART.velMax;
  return {
    giro: limitar(int.giro * (1 - peso) + haciaAdelante(k, pista, 0) * peso),
    acelera: !int.frena && k.vel < prudente,
    frena: int.frena,
    derrapa: int.derrapa,
  };
}

// Carrera completa sin pantalla, con los 8 karts manejados por el computador.
export function simularCarrera(pista, { azar = Math.random, segundos = 400 } = {}) {
  const c = crearCarrera(pista, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [], azar);
  const pilotos = c.karts.map(() => crearPiloto(azar));
  const dt = 1 / 60;
  while (c.estado !== 'fin' && c.tiempo < segundos) {
    const intenciones = c.karts.map((k, i) => (c.estado === 'carrera' ? conducir(pilotos[i], k, pista, dt) : QUIETO));
    pasoCarrera(c, intenciones, dt);
  }
  return c;
}
```

- [ ] **Paso 4: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos. Si la carrera simulada o el modo ayuda fallan por poco, ajustar las cifras de `velocidadPrudente` o de `ayudar` (no las de la prueba) y registrar el cambio como decisión.

- [ ] **Paso 5: commit**

```bash
git add src/logica/pilotos.js tests/pilotos.test.js
git commit -m "Rivales del computador, modo ayuda y carrera simulada

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 5: controles y selección de personaje

**Archivos:**
- Crear: `src/entrada/mandos.js`, `src/logica/seleccion.js`
- Probar: `tests/mandos.test.js`, `tests/seleccion.test.js`

**Interfaces:**
- Produce:
  - Estado de una fuente: `{ giro, acelera, frena, derrapa, pausa, ayuda, confirma, vuelve, arriba, abajo, izquierda, derecha }`.
  - `leerMando(botones, ejes) → estado`, `leerTeclado(teclas: Set) → estado`, `detectorDeFlancos() → (estado) => recien`.
  - `crearEntradas(ventana) → { leer() → Array<{ id: 'teclado' | 'mando-N', ...estado, recien }> }`.
  - `crearSeleccion(cantidad, primera: string | null) → { jugadores: Array<{ fuente, cursor, listo, ayuda }>, volver }`.
  - `procesarSeleccion(seleccion, fuente, total = 8)`, `todosListos(seleccion)`.

- [ ] **Paso 1: pruebas**

Crear `tests/mandos.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { leerMando, leerTeclado, detectorDeFlancos, crearEntradas } from '../src/entrada/mandos.js';

const botones = (pulsados = {}) =>
  Array.from({ length: 17 }, (_, i) => ({ pressed: (pulsados[i] ?? 0) >= 1, value: pulsados[i] ?? 0 }));

describe('leerMando', () => {
  it('la palanca a la izquierda gira a la izquierda (giro positivo)', () => {
    expect(leerMando(botones(), [-1, 0]).giro).toBe(1);
    expect(leerMando(botones(), [0.8, 0]).giro).toBe(-0.8);
  });

  it('ignora los movimientos pequeños de la palanca', () => {
    expect(leerMando(botones(), [0.15, 0]).giro).toBe(0);
  });

  it('la cruceta también gira y mueve en los menús', () => {
    expect(leerMando(botones({ 14: 1 }), [0, 0])).toMatchObject({ giro: 1, izquierda: true });
    expect(leerMando(botones({ 15: 1 }), [0, 0])).toMatchObject({ giro: -1, derecha: true });
    expect(leerMando(botones({ 12: 1 }), [0, 0]).arriba).toBe(true);
    expect(leerMando(botones(), [0, 0.9]).abajo).toBe(true);
  });

  it('A acelera y confirma, B frena y vuelve, Start pausa, Y cambia la ayuda', () => {
    expect(leerMando(botones({ 0: 1 }), [0, 0])).toMatchObject({ acelera: true, confirma: true });
    expect(leerMando(botones({ 1: 1 }), [0, 0])).toMatchObject({ frena: true, vuelve: true });
    expect(leerMando(botones({ 9: 1 }), [0, 0]).pausa).toBe(true);
    expect(leerMando(botones({ 3: 1 }), [0, 0]).ayuda).toBe(true);
  });

  it('el gatillo derecho, aunque esté a medio apretar, derrapa', () => {
    expect(leerMando(botones({ 7: 0.5 }), [0, 0]).derrapa).toBe(true);
    expect(leerMando(botones({ 5: 1 }), [0, 0]).derrapa).toBe(true);
  });
});

describe('leerTeclado', () => {
  it('usa flechas, barra espaciadora, Enter, Esc, Retroceso e Y', () => {
    const t = leerTeclado(new Set(['ArrowLeft', 'ArrowUp', 'Space']));
    expect(t).toMatchObject({ giro: 1, acelera: true, derrapa: true, izquierda: true, arriba: true });
    expect(leerTeclado(new Set(['ArrowRight'])).giro).toBe(-1);
    expect(leerTeclado(new Set(['Enter'])).confirma).toBe(true);
    expect(leerTeclado(new Set(['Escape'])).pausa).toBe(true);
    expect(leerTeclado(new Set(['Backspace'])).vuelve).toBe(true);
    expect(leerTeclado(new Set(['KeyY'])).ayuda).toBe(true);
  });
});

describe('detectorDeFlancos', () => {
  it('avisa solo en el momento en que se aprieta un botón', () => {
    const detectar = detectorDeFlancos();
    expect(detectar({ confirma: true, giro: 1 }).confirma).toBe(true);
    expect(detectar({ confirma: true, giro: 1 }).confirma).toBe(false);
    expect(detectar({ confirma: false }).confirma).toBe(false);
    expect(detectar({ confirma: true }).confirma).toBe(true);
  });
});

describe('crearEntradas', () => {
  it('lee el teclado y los controles conectados, con sus flancos', () => {
    const oyentes = {};
    const mandos = [
      { index: 0, connected: true, buttons: botones({ 0: 1 }), axes: [0, 0] },
      null,
      { index: 2, connected: false, buttons: botones(), axes: [0, 0] },
    ];
    const ventana = {
      addEventListener: (tipo, f) => { oyentes[tipo] = f; },
      navigator: { getGamepads: () => mandos },
    };
    const entradas = crearEntradas(ventana);
    oyentes.keydown({ code: 'ArrowUp', preventDefault() {} });
    const fuentes = entradas.leer();
    expect(fuentes.map((f) => f.id)).toEqual(['teclado', 'mando-0']);
    expect(fuentes[0].acelera).toBe(true);
    expect(fuentes[0].recien.acelera).toBe(true);
    expect(fuentes[1].confirma).toBe(true);
    expect(entradas.leer()[0].recien.acelera).toBe(false);
    oyentes.keyup({ code: 'ArrowUp' });
    expect(entradas.leer()[0].acelera).toBe(false);
    oyentes.keydown({ code: 'ArrowUp', preventDefault() {} });
    oyentes.blur();
    expect(entradas.leer()[0].acelera).toBe(false);
  });
});
```

Crear `tests/seleccion.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearSeleccion, procesarSeleccion, todosListos } from '../src/logica/seleccion.js';

const NADA = { confirma: false, vuelve: false, izquierda: false, derecha: false, arriba: false, abajo: false, ayuda: false };
const pulsa = (id, cambios) => ({ id, recien: { ...NADA, ...cambios } });

describe('selección de personaje', () => {
  it('el control que eligió en el inicio ya es el jugador 1, sobre la bailarina', () => {
    const s = crearSeleccion(1, 'mando-0');
    expect(s.jugadores).toEqual([{ fuente: 'mando-0', cursor: 0, listo: false, ayuda: false }]);
  });

  it('si se eligió con el mouse, el primer control que pulsa A es el jugador 1', () => {
    const s = crearSeleccion(1, null);
    procesarSeleccion(s, pulsa('mando-3', { confirma: true }));
    expect(s.jugadores[0].fuente).toBe('mando-3');
    expect(s.jugadores[0].listo).toBe(false);
  });

  it('en 2 jugadores, otro control que pulsa A se une como jugador 2, sobre el bailarín', () => {
    const s = crearSeleccion(2, 'mando-0');
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    expect(s.jugadores[1]).toMatchObject({ fuente: 'mando-1', cursor: 1, listo: false });
  });

  it('un mismo control no se une dos veces', () => {
    const s = crearSeleccion(2, 'mando-0');
    procesarSeleccion(s, pulsa('mando-0', { confirma: true }));
    expect(s.jugadores[0].listo).toBe(true);
    expect(s.jugadores[1].fuente).toBeNull();
  });

  it('mueve el cursor y da la vuelta en los bordes', () => {
    const s = crearSeleccion(1, 'teclado');
    procesarSeleccion(s, pulsa('teclado', { izquierda: true }));
    expect(s.jugadores[0].cursor).toBe(7);
    procesarSeleccion(s, pulsa('teclado', { arriba: true }));
    expect(s.jugadores[0].cursor).toBe(3);
    procesarSeleccion(s, pulsa('teclado', { derecha: true }));
    expect(s.jugadores[0].cursor).toBe(4);
  });

  it('Y activa y desactiva el modo ayuda', () => {
    const s = crearSeleccion(1, 'mando-0');
    procesarSeleccion(s, pulsa('mando-0', { ayuda: true }));
    expect(s.jugadores[0].ayuda).toBe(true);
    procesarSeleccion(s, pulsa('mando-0', { ayuda: true }));
    expect(s.jugadores[0].ayuda).toBe(false);
  });

  it('no se puede confirmar un personaje que otro ya eligió', () => {
    const s = crearSeleccion(2, 'mando-0');
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    procesarSeleccion(s, pulsa('mando-0', { confirma: true }));
    procesarSeleccion(s, pulsa('mando-1', { izquierda: true }));
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    expect(s.jugadores[1].cursor).toBe(0);
    expect(s.jugadores[1].listo).toBe(false);
  });

  it('B quita la confirmación y, sin confirmación, pide volver al inicio', () => {
    const s = crearSeleccion(1, 'mando-0');
    procesarSeleccion(s, pulsa('mando-0', { confirma: true }));
    procesarSeleccion(s, pulsa('mando-0', { vuelve: true }));
    expect(s.jugadores[0].listo).toBe(false);
    expect(s.volver).toBe(false);
    procesarSeleccion(s, pulsa('mando-0', { vuelve: true }));
    expect(s.volver).toBe(true);
  });

  it('todosListos solo cuando todos confirmaron', () => {
    const s = crearSeleccion(2, 'mando-0');
    procesarSeleccion(s, pulsa('mando-0', { confirma: true }));
    expect(todosListos(s)).toBe(false);
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    procesarSeleccion(s, pulsa('mando-1', { confirma: true }));
    expect(todosListos(s)).toBe(true);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/mandos.test.js tests/seleccion.test.js`
Expected: FAIL. No existen `src/entrada/mandos.js` ni `src/logica/seleccion.js`.

- [ ] **Paso 3: escribir los controles**

Crear `src/entrada/mandos.js`:

```js
const ZONA_MUERTA = 0.2;

// Mapeo estándar de la Gamepad API: 0 A, 1 B, 3 Y, 5 RB, 7 RT, 9 Start, 12-15 cruceta.
export function leerMando(botones, ejes) {
  const pulsado = (i) => !!botones[i] && (botones[i].pressed || botones[i].value > 0.3);
  let giro = -(ejes[0] ?? 0);
  if (Math.abs(giro) < ZONA_MUERTA) giro = 0;
  if (pulsado(14)) giro = 1;
  if (pulsado(15)) giro = -1;
  return {
    giro,
    acelera: pulsado(0),
    frena: pulsado(1),
    derrapa: pulsado(7) || pulsado(5),
    pausa: pulsado(9),
    ayuda: pulsado(3),
    confirma: pulsado(0),
    vuelve: pulsado(1),
    arriba: pulsado(12) || (ejes[1] ?? 0) < -0.5,
    abajo: pulsado(13) || (ejes[1] ?? 0) > 0.5,
    izquierda: giro > 0.5,
    derecha: giro < -0.5,
  };
}

export function leerTeclado(teclas) {
  const t = (codigo) => teclas.has(codigo);
  const giro = (t('ArrowLeft') ? 1 : 0) - (t('ArrowRight') ? 1 : 0);
  return {
    giro,
    acelera: t('ArrowUp'),
    frena: t('ArrowDown'),
    derrapa: t('Space'),
    pausa: t('Escape'),
    ayuda: t('KeyY'),
    confirma: t('Enter'),
    vuelve: t('Backspace'),
    arriba: t('ArrowUp'),
    abajo: t('ArrowDown'),
    izquierda: giro > 0,
    derecha: giro < 0,
  };
}

// Devuelve, para cada botón, si recién se apretó (estaba suelto en la lectura anterior).
export function detectorDeFlancos() {
  let antes = {};
  return (actual) => {
    const recien = {};
    for (const [clave, valor] of Object.entries(actual)) recien[clave] = valor === true && antes[clave] !== true;
    antes = actual;
    return recien;
  };
}

// El teclado siempre está; cada control conectado es otra fuente.
export function crearEntradas(ventana) {
  const teclas = new Set();
  ventana.addEventListener('keydown', (e) => {
    teclas.add(e.code);
    if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code === 'Backspace') e.preventDefault();
  });
  ventana.addEventListener('keyup', (e) => teclas.delete(e.code));
  ventana.addEventListener('blur', () => teclas.clear());
  const detectores = new Map();
  return {
    leer() {
      const fuentes = [{ id: 'teclado', ...leerTeclado(teclas) }];
      for (const m of ventana.navigator.getGamepads?.() ?? []) {
        if (m && m.connected) fuentes.push({ id: `mando-${m.index}`, ...leerMando(m.buttons, m.axes) });
      }
      return fuentes.map((f) => {
        if (!detectores.has(f.id)) detectores.set(f.id, detectorDeFlancos());
        const { id, ...estado } = f;
        return { ...f, recien: detectores.get(id)(estado) };
      });
    },
  };
}
```

- [ ] **Paso 4: escribir la selección**

Crear `src/logica/seleccion.js`:

```js
// Reglas de la pantalla de selección. Los jugadores parten sobre la bailarina (0) y el bailarín (1).
export function crearSeleccion(cantidad, primera) {
  return {
    jugadores: Array.from({ length: cantidad }, (_, j) => ({
      fuente: j === 0 && primera ? primera : null, cursor: j, listo: false, ayuda: false,
    })),
    volver: false,
  };
}

// Aplica lo que recién pulsó una fuente. La pulsación que une a un jugador no elige nada.
export function procesarSeleccion(sel, fuente, total = 8) {
  const r = fuente.recien;
  const j = sel.jugadores.find((x) => x.fuente === fuente.id);
  if (!j) {
    const libre = sel.jugadores.find((x) => x.fuente === null);
    if (libre && r.confirma) libre.fuente = fuente.id;
    return sel;
  }
  if (j.listo) {
    if (r.vuelve) j.listo = false;
    return sel;
  }
  if (r.izquierda) j.cursor = (j.cursor + total - 1) % total;
  if (r.derecha) j.cursor = (j.cursor + 1) % total;
  if (r.arriba || r.abajo) j.cursor = (j.cursor + total / 2) % total;
  if (r.ayuda) j.ayuda = !j.ayuda;
  const ocupado = sel.jugadores.some((o) => o !== j && o.listo && o.cursor === j.cursor);
  if (r.confirma && !ocupado) j.listo = true;
  else if (r.vuelve) sel.volver = true;
  return sel;
}

export const todosListos = (sel) => sel.jugadores.every((j) => j.listo);
```

- [ ] **Paso 5: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 6: commit**

```bash
git add src/entrada src/logica/seleccion.js tests/mandos.test.js tests/seleccion.test.js
git commit -m "Controles, teclado y reglas de la selección de personaje

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 6: sonido

**Archivos:**
- Crear: `src/sonido/sonido.js`
- Probar: `tests/sonido.test.js`

**Interfaces:**
- Produce: `frecuenciaMotor(vel)`, `crearSonido(Contexto) → { reanudar(), activo(), motores(velocidades: Array<number | null>), efecto(nombre), musica(encender) }`. Efectos: `'cuenta'`, `'ya'`, `'turbo'`, `'chispas'`, `'choque'`, `'salto'`, `'vuelta'`, `'meta'`. Sin Web Audio devuelve un objeto que no hace nada.

- [ ] **Paso 1: pruebas**

Crear `tests/sonido.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearSonido, frecuenciaMotor } from '../src/sonido/sonido.js';

describe('sonido', () => {
  it('el motor suena más agudo con más velocidad, también en reversa', () => {
    expect(frecuenciaMotor(0)).toBe(55);
    expect(frecuenciaMotor(24)).toBe(175);
    expect(frecuenciaMotor(-6)).toBe(frecuenciaMotor(6));
  });

  it('sin Web Audio, todo funciona en silencio y sin errores', () => {
    const s = crearSonido(null);
    expect(() => {
      s.reanudar();
      s.motores([10, null]);
      s.efecto('turbo');
      s.efecto('desconocido');
      s.musica(true);
      s.musica(false);
    }).not.toThrow();
    expect(s.activo()).toBe(true);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/sonido.test.js`
Expected: FAIL. No existe `src/sonido/sonido.js`.

- [ ] **Paso 3: escribir el sonido**

Crear `src/sonido/sonido.js`:

```js
export const frecuenciaMotor = (vel) => 55 + Math.abs(vel) * 5;

const SILENCIO = { reanudar() {}, activo: () => true, motores() {}, efecto() {}, musica() {} };

// Todo se sintetiza con Web Audio. La música es original: bajo, batería y un arpegio en la menor.
export function crearSonido(Contexto = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
  if (!Contexto) return SILENCIO;
  const ctx = new Contexto();
  const maestro = ctx.createGain();
  maestro.gain.value = 0.6;
  maestro.connect(ctx.destination);

  const motores = [0, 1].map(() => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 600;
    const vol = ctx.createGain();
    vol.gain.value = 0;
    osc.connect(filtro).connect(vol).connect(maestro);
    osc.start();
    return { osc, vol };
  });

  function tono(frec, dur, tipo = 'square', vol = 0.15, cuando = ctx.currentTime, hasta = frec) {
    const o = ctx.createOscillator();
    o.type = tipo;
    o.frequency.setValueAtTime(frec, cuando);
    o.frequency.exponentialRampToValueAtTime(hasta, cuando + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, cuando);
    g.gain.exponentialRampToValueAtTime(0.0001, cuando + dur);
    o.connect(g).connect(maestro);
    o.start(cuando);
    o.stop(cuando + dur + 0.02);
  }

  function ruido(dur, vol, cuando = ctx.currentTime) {
    const n = Math.floor(ctx.sampleRate * dur);
    const bufer = ctx.createBuffer(1, n, ctx.sampleRate);
    const datos = bufer.getChannelData(0);
    for (let i = 0; i < n; i++) datos[i] = Math.random() * 2 - 1;
    const fuente = ctx.createBufferSource();
    fuente.buffer = bufer;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, cuando);
    g.gain.exponentialRampToValueAtTime(0.001, cuando + dur);
    fuente.connect(g).connect(maestro);
    fuente.start(cuando);
  }

  const EFECTOS = {
    cuenta: () => tono(440, 0.25),
    ya: () => tono(880, 0.5),
    turbo: () => tono(200, 0.5, 'sawtooth', 0.12, ctx.currentTime, 600),
    chispas: () => tono(1200, 0.08, 'triangle', 0.08),
    choque: () => ruido(0.15, 0.3),
    salto: () => tono(300, 0.3, 'triangle', 0.12, ctx.currentTime, 700),
    vuelta: () => [660, 880].forEach((f, i) => tono(f, 0.15, 'square', 0.12, ctx.currentTime + i * 0.12)),
    meta: () => [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.3, 'square', 0.12, ctx.currentTime + i * 0.15)),
  };

  const BAJO = [110, 110, 131, 110, 147, 131, 110, 98];
  let reloj = null;
  let siguiente = 0;
  let paso = 0;
  function programar() {
    while (siguiente < ctx.currentTime + 0.2) {
      const corchea = paso % 8;
      tono(BAJO[corchea], 0.22, 'triangle', 0.18, siguiente);
      if (corchea % 2 === 1) ruido(0.05, 0.06, siguiente);
      if (corchea === 2 || corchea === 6) ruido(0.12, 0.12, siguiente);
      if (paso % 16 === 0) [440, 523, 659].forEach((f, i) => tono(f, 0.2, 'square', 0.05, siguiente + i * 0.25));
      siguiente += 0.25;
      paso += 1;
    }
  }

  return {
    reanudar() {
      if (ctx.state !== 'running') ctx.resume();
    },
    activo: () => ctx.state === 'running',
    motores(velocidades) {
      motores.forEach((m, i) => {
        const vel = velocidades[i] ?? null;
        m.osc.frequency.setTargetAtTime(frecuenciaMotor(vel ?? 0), ctx.currentTime, 0.05);
        m.vol.gain.setTargetAtTime(vel === null ? 0 : 0.05, ctx.currentTime, 0.1);
      });
    },
    efecto(nombre) {
      EFECTOS[nombre]?.();
    },
    musica(encender) {
      if (encender && !reloj) {
        siguiente = ctx.currentTime + 0.1;
        reloj = setInterval(programar, 50);
      }
      if (!encender && reloj) {
        clearInterval(reloj);
        reloj = null;
      }
    },
  };
}
```

- [ ] **Paso 4: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 5: commit**

```bash
git add src/sonido tests/sonido.test.js
git commit -m "Sonido sintetizado: motores, efectos y música original

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 7: mundo 3D y pantalla de inicio

**Archivos:**
- Crear: `src/logica/personajes.js`, `src/logica/decorado.js`, `src/dibujo/comun.js`, `src/dibujo/pista3d.js`, `src/dibujo/decorado3d.js`, `src/dibujo/personajes3d.js`, `src/dibujo/kart3d.js`, `src/dibujo/camaras.js`, `src/dibujo/escena.js`, `src/pantallas/dom.js`, `src/pantallas/inicio.js`, `src/juego.js`, `src/main.js`, `src/estilo.css`, `index.html`
- Probar: `tests/personajes.test.js`, `tests/decorado.test.js`

**Interfaces:**
- Consume: todo lo anterior.
- Produce:
  - `PERSONAJES: Array<{ id, icono, kart, detalle?, cuerpo: { tipo, ... } }>` (8; tipos `persona`, `gato`, `pajaro`, `toro`, `calabaza`, `fantasma`).
  - `lugaresLibres(pista, { cada, distancia, holgura, lado }) → Array<{ x, y, rumbo, s }>`.
  - `crearMundo(pista) → { escena, ponerKarts(fichas), actualizar(carrera, t) }`.
  - `crearKart3D(ficha) → Group` con `.sincronizar(kart, t)`; `crearPersonaje(cuerpo) → Group`.
  - `crearCamara(fov)`, `seguir(camara, kart, dt, inmediato = false)`, `dibujarVistas(renderer, escena, camaras)`.
  - Pantalla: `{ actualizar(fuentes, dt), dibujar(renderer), salir(), pausar?() }`; `ctx = { renderer, capa, pista, mundo, sonido, personajes, ir(nombre, datos), carrera? }`.
  - `pantallaInicio(ctx)` va a `seleccion` con `{ cantidad: 1 | 2, primera: id | null }`.

- [ ] **Paso 1: pruebas de personajes y decorado**

Crear `tests/personajes.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { PERSONAJES } from '../src/logica/personajes.js';

const TIPOS = ['persona', 'gato', 'pajaro', 'toro', 'calabaza', 'fantasma'];

describe('personajes', () => {
  it('son 8, con identificador e ícono únicos', () => {
    expect(PERSONAJES).toHaveLength(8);
    expect(new Set(PERSONAJES.map((p) => p.id)).size).toBe(8);
    expect(new Set(PERSONAJES.map((p) => p.icono)).size).toBe(8);
  });

  it('los dos primeros son la bailarina y el bailarín de la noche', () => {
    expect(PERSONAJES.slice(0, 2).map((p) => p.id)).toEqual(['bailarina', 'bailarin']);
  });

  it('cada uno tiene color de kart y un cuerpo que el dibujo sabe armar', () => {
    for (const p of PERSONAJES) {
      expect(Number.isInteger(p.kart)).toBe(true);
      expect(TIPOS).toContain(p.cuerpo.tipo);
    }
  });

  it('la bailarina lleva falda con lunares y el bailarín, chaqueta roja con franjas negras', () => {
    const [bailarina, bailarin] = PERSONAJES;
    expect(bailarina.cuerpo.falda.lunares).toBe(0xffffff);
    expect(bailarin.cuerpo.chaqueta).toEqual({ color: 0xc1121f, franjas: 0x111111 });
  });
});
```

Crear `tests/decorado.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE } from '../src/logica/pista.js';
import { lugaresLibres } from '../src/logica/decorado.js';

const pista = crearPista(NOCHE);
const distanciaMinima = (p) => Math.min(...pista.muestras.map((m) => Math.hypot(m.x - p.x, m.y - p.y)));

describe('lugaresLibres', () => {
  it('encuentra lugares para casas por fuera, lejos de todas las partes de la pista', () => {
    const casas = lugaresLibres(pista, { cada: 32, distancia: 24, holgura: 18, lado: -1 });
    expect(casas.length).toBeGreaterThanOrEqual(10);
    for (const c of casas) expect(distanciaMinima(c)).toBeGreaterThanOrEqual(18);
  });

  it('descarta los lugares que pisan otra parte de la pista', () => {
    const adentro = lugaresLibres(pista, { cada: 32, distancia: 24, holgura: 18, lado: 1 });
    expect(adentro.length).toBeLessThan(Math.ceil(pista.largo / 32));
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/personajes.test.js tests/decorado.test.js`
Expected: FAIL. No existen los módulos.

- [ ] **Paso 3: fichas y lugares**

Crear `src/logica/personajes.js`:

```js
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
```

Crear `src/logica/decorado.js`:

```js
import { puntoEn } from './pista.js';

// Lugares a un costado de la pista que quedan lejos de todas sus partes. lado: 1 izquierda, -1 derecha.
export function lugaresLibres(pista, { cada, distancia, holgura, lado }) {
  const lugares = [];
  for (let s = 0; s < pista.largo; s += cada) {
    const p = puntoEn(pista, s, distancia * lado);
    const libre = pista.muestras.every((m) => (m.x - p.x) ** 2 + (m.y - p.y) ** 2 >= holgura ** 2);
    if (libre) lugares.push({ x: p.x, y: p.y, rumbo: p.rumbo, s });
  }
  return lugares;
}
```

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 4: piezas de dibujo comunes**

Crear `src/dibujo/comun.js`:

```js
import * as THREE from 'three';

const materiales = new Map();

export function mate(color) {
  if (!materiales.has(color)) materiales.set(color, new THREE.MeshLambertMaterial({ color }));
  return materiales.get(color);
}

// Material que no recibe luz: brilla igual de noche (faroles, ventanas, flechas de turbo).
export function brillo(color) {
  const clave = `brillo-${color}`;
  if (!materiales.has(clave)) materiales.set(clave, new THREE.MeshBasicMaterial({ color }));
  return materiales.get(clave);
}

export function malla(geometria, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometria, material);
  m.position.set(x, y, z);
  return m;
}
```

- [ ] **Paso 5: pista y decorado en 3D**

Crear `src/dibujo/pista3d.js`:

```js
import * as THREE from 'three';
import { MEDIO_ANCHO, VALLA, RAMPA, puntoEn } from '../logica/pista.js';
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

export function crearPista3D(pista) {
  const grupo = new THREE.Group();

  const pasto = malla(new THREE.PlaneGeometry(1400, 1400), mate(0x1d3b2a), 95, 0, -75);
  pasto.rotation.x = -Math.PI / 2;
  grupo.add(pasto);

  grupo.add(cinta(pista, (m) => [lado(m, -MEDIO_ANCHO, 0.03), lado(m, MEDIO_ANCHO, 0.03)], () => 0x55586a));
  const solera = (i) => (Math.floor(i / 3) % 2 === 0 ? 0xd62828 : 0xf1f1f1);
  grupo.add(cinta(pista, (m) => [lado(m, MEDIO_ANCHO, 0.04), lado(m, MEDIO_ANCHO + 0.9, 0.04)], solera));
  grupo.add(cinta(pista, (m) => [lado(m, -MEDIO_ANCHO - 0.9, 0.04), lado(m, -MEDIO_ANCHO, 0.04)], solera));
  const valla = (i) => (Math.floor(i / 4) % 2 === 0 ? 0xff9f1c : 0xfaf3dd);
  for (const s of [1, -1]) grupo.add(cinta(pista, (m) => [lado(m, s * VALLA, 0), lado(m, s * VALLA, 0.9)], valla));

  // Meta: cuadros blancos y negros y un arco con luces.
  const cuadro = new THREE.PlaneGeometry(1, 1);
  for (let fila = 0; fila < 2; fila++) {
    for (let col = 0; col < 2 * MEDIO_ANCHO; col++) {
      const p = puntoEn(pista, fila + 0.5, -MEDIO_ANCHO + col + 0.5);
      const m = malla(cuadro, mate((fila + col) % 2 ? 0x111111 : 0xffffff), p.x, 0.05, -p.y);
      m.rotation.x = -Math.PI / 2;
      grupo.add(m);
    }
  }
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
  grupo.add(arco);

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

  // Rampa: cuña amarilla que sube de 0 a RAMPA.alto.
  const a = puntoEn(pista, pista.rampa);
  const b = puntoEn(pista, pista.rampa + RAMPA.largo);
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
  grupo.add(new THREE.Mesh(cuna, new THREE.MeshLambertMaterial({ color: 0xffd166, side: THREE.DoubleSide })));

  return grupo;
}
```

Crear `src/dibujo/decorado3d.js`:

```js
import * as THREE from 'three';
import { lugaresLibres } from '../logica/decorado.js';
import { mate, brillo, malla } from './comun.js';

// Barrio de noche: casas con ventanas encendidas, faroles, calabazas sonrientes, luna y estrellas.
export function crearDecorado(pista, azar = Math.random) {
  const g = new THREE.Group();

  const colores = [0x6d597a, 0x355070, 0xb56576, 0x4a4e69, 0x7f5539];
  const cuerpo = new THREE.BoxGeometry(8, 6, 8);
  const techo = new THREE.ConeGeometry(6.5, 4, 4);
  const ventana = new THREE.BoxGeometry(1.4, 1.6, 0.2);
  lugaresLibres(pista, { cada: 32, distancia: 24, holgura: 18, lado: -1 }).forEach((l, i) => {
    const casa = new THREE.Group();
    casa.position.set(l.x, 0, -l.y);
    casa.rotation.y = l.rumbo;
    casa.add(malla(cuerpo, mate(colores[i % colores.length]), 0, 3, 0));
    const t = malla(techo, mate(0x2b2d42), 0, 8, 0);
    t.rotation.y = Math.PI / 4;
    casa.add(t);
    // La pista queda a la izquierda de la casa: z local negativo.
    for (const x of [-2, 2]) {
      for (const y of [2.2, 4.4]) casa.add(malla(ventana, brillo(azar() < 0.8 ? 0xffd166 : 0x22223b), x, y, -4.05));
    }
    g.add(casa);
  });

  const poste = new THREE.CylinderGeometry(0.15, 0.2, 4.5);
  const foco = new THREE.SphereGeometry(0.45, 10, 8);
  for (const lado of [1, -1]) {
    lugaresLibres(pista, { cada: 40, distancia: 12, holgura: 11.5, lado }).forEach((l) => {
      g.add(malla(poste, mate(0x2b2d42), l.x, 2.25, -l.y));
      g.add(malla(foco, brillo(0xffe8a3), l.x, 4.6, -l.y));
    });
  }

  const calabaza = new THREE.SphereGeometry(1, 12, 10);
  const ojo = new THREE.SphereGeometry(0.16, 6, 6);
  const tallo = new THREE.CylinderGeometry(0.1, 0.12, 0.5);
  lugaresLibres(pista, { cada: 50, distancia: 15, holgura: 13, lado: 1 }).forEach((l) => {
    const c = new THREE.Group();
    c.position.set(l.x, 0.8, -l.y);
    c.rotation.y = l.rumbo;
    const bola = malla(calabaza, mate(0xff8c1a));
    bola.scale.set(1.2, 0.85, 1.2);
    c.add(bola);
    c.add(malla(tallo, mate(0x2d6a4f), 0, 0.95, 0));
    // La pista queda a la derecha de la calabaza: z local positivo.
    for (const x of [-0.35, 0.35]) c.add(malla(ojo, brillo(0xffd166), x, 0.2, 1));
    g.add(c);
  });

  const luna = new THREE.Mesh(new THREE.SphereGeometry(30, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff3c4, fog: false }));
  luna.position.set(-250, 160, -380);
  g.add(luna);
  const estrellas = [];
  for (let i = 0; i < 500; i++) {
    const a = azar() * Math.PI * 2;
    const e = 0.15 + azar() * 1.2;
    estrellas.push(95 + Math.cos(a) * Math.cos(e) * 600, Math.sin(e) * 600, -75 + Math.sin(a) * Math.cos(e) * 600);
  }
  const cielo = new THREE.BufferGeometry();
  cielo.setAttribute('position', new THREE.Float32BufferAttribute(estrellas, 3));
  g.add(new THREE.Points(cielo, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false })));
  return g;
}
```

- [ ] **Paso 6: personajes y karts en 3D**

Crear `src/dibujo/personajes3d.js`:

```js
import * as THREE from 'three';
import { mate, malla } from './comun.js';

// Todos los personajes miran hacia +x local (el frente del kart).
const esfera = (r) => new THREE.SphereGeometry(r, 14, 10);

function ojos(g, alto, adelante, separacion, radio = 0.06) {
  for (const s of [-1, 1]) g.add(malla(esfera(radio), mate(0x111111), adelante, alto, s * separacion));
}

function persona(c) {
  const g = new THREE.Group();
  const torso = c.chaqueta?.color ?? c.ropa;
  g.add(malla(new THREE.CylinderGeometry(0.32, 0.4, 0.8, 12), mate(torso), 0, 0.4, 0));
  if (c.chaqueta) {
    // Franjas negras en V sobre el pecho.
    for (const s of [-1, 1]) {
      const franja = malla(new THREE.BoxGeometry(0.05, 0.55, 0.07), mate(c.chaqueta.franjas), 0.36, 0.45, s * 0.12);
      franja.rotation.x = s * 0.45;
      g.add(franja);
    }
  }
  if (c.falda) {
    g.add(malla(new THREE.ConeGeometry(0.75, 0.7, 14), mate(c.falda.color), 0, 0.05, 0));
    if (c.falda.lunares) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.add(malla(esfera(0.07), mate(c.falda.lunares), Math.cos(a) * 0.46, 0, Math.sin(a) * 0.46));
      }
    }
  }
  for (const s of [-1, 1]) {
    const brazo = malla(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8), mate(torso), 0.35, 0.55, s * 0.32);
    brazo.rotation.z = -1.1;
    g.add(brazo);
  }
  const cabeza = new THREE.Group();
  cabeza.position.y = 1.1;
  g.add(cabeza);
  cabeza.add(malla(esfera(0.36), mate(c.piel)));
  ojos(cabeza, 0.05, 0.32, 0.13);
  for (const s of [-1, 1]) cabeza.add(malla(esfera(0.06), mate(0xf4978e), 0.3, -0.09, s * 0.2));
  const pelo = malla(new THREE.SphereGeometry(0.39, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mate(c.pelo), -0.04, 0.03, 0);
  pelo.rotation.z = 0.35;
  cabeza.add(pelo);
  if (c.peinado === 'mono') cabeza.add(malla(esfera(0.2), mate(c.pelo), -0.3, 0.25, 0));
  if (c.peinado === 'largo') cabeza.add(malla(new THREE.BoxGeometry(0.2, 0.6, 0.66), mate(c.pelo), -0.28, -0.25, 0));
  if (c.adorno === 'flor') cabeza.add(malla(esfera(0.11), mate(0xff4d6d), -0.2, 0.32, 0.22));
  if (c.adorno === 'nota') {
    cabeza.add(malla(esfera(0.08), mate(0x111111), -0.1, 0.38, 0.25));
    cabeza.add(malla(new THREE.CylinderGeometry(0.02, 0.02, 0.25), mate(0x111111), -0.03, 0.5, 0.25));
  }
  return g;
}

function gato(c) {
  const g = new THREE.Group();
  g.add(malla(esfera(0.42), mate(c.color), 0, 0.35, 0));
  const cabeza = new THREE.Group();
  cabeza.position.y = 1;
  g.add(cabeza);
  cabeza.add(malla(esfera(0.4), mate(c.color)));
  for (const s of [-1, 1]) {
    const oreja = malla(new THREE.ConeGeometry(0.13, 0.3, 4), mate(c.color), 0, 0.38, s * 0.22);
    oreja.rotation.x = s * 0.3;
    cabeza.add(oreja);
  }
  ojos(cabeza, 0.06, 0.35, 0.14);
  cabeza.add(malla(esfera(0.06), mate(0xff8fab), 0.39, -0.05, 0));
  const cola = malla(new THREE.CylinderGeometry(0.06, 0.06, 0.8), mate(c.color), -0.45, 0.6, 0);
  cola.rotation.z = 0.6;
  g.add(cola);
  return g;
}

function pajaro(c) {
  const g = new THREE.Group();
  const cuerpo = malla(esfera(0.45), mate(c.color), 0, 0.5, 0);
  cuerpo.scale.set(1, 1.2, 1);
  g.add(cuerpo);
  const cabeza = new THREE.Group();
  cabeza.position.y = 1.15;
  g.add(cabeza);
  cabeza.add(malla(esfera(0.33), mate(c.color)));
  ojos(cabeza, 0.06, 0.29, 0.12);
  const pico = malla(new THREE.ConeGeometry(0.1, 0.3, 8), mate(0xffb703), 0.42, -0.04, 0);
  pico.rotation.z = -Math.PI / 2;
  cabeza.add(pico);
  for (let i = -1; i <= 1; i++) {
    const pluma = malla(new THREE.ConeGeometry(0.05, 0.25, 6), mate(c.color), -0.05 + i * 0.08, 0.38, 0);
    pluma.rotation.z = i * 0.3;
    cabeza.add(pluma);
  }
  for (const s of [-1, 1]) {
    const ala = malla(esfera(0.25), mate(c.color), 0, 0.55, s * 0.45);
    ala.scale.set(1.2, 0.5, 0.3);
    g.add(ala);
  }
  return g;
}

function toro(c) {
  const g = new THREE.Group();
  g.add(malla(esfera(0.48), mate(c.color), 0, 0.4, 0));
  g.add(malla(new THREE.ConeGeometry(0.42, 0.35, 12), mate(c.panuelo), 0, 0.8, 0));
  const cabeza = new THREE.Group();
  cabeza.position.y = 1.15;
  g.add(cabeza);
  const craneo = malla(esfera(0.4), mate(c.color));
  craneo.scale.set(1, 0.9, 1);
  cabeza.add(craneo);
  cabeza.add(malla(esfera(0.22), mate(0xd4a373), 0.32, -0.12, 0));
  ojos(cabeza, 0.1, 0.33, 0.16);
  for (const s of [-1, 1]) {
    const cuerno = malla(new THREE.ConeGeometry(0.07, 0.35, 8), mate(0xf8f9fa), 0, 0.32, s * 0.36);
    cuerno.rotation.x = s * 0.9;
    cabeza.add(cuerno);
  }
  return g;
}

function calabaza(c) {
  const g = new THREE.Group();
  g.add(malla(new THREE.CylinderGeometry(0.3, 0.35, 0.6, 10), mate(0x2d6a4f), 0, 0.3, 0));
  const cabeza = new THREE.Group();
  cabeza.position.y = 1;
  g.add(cabeza);
  const bola = malla(esfera(0.5), mate(c.color));
  bola.scale.set(1.1, 0.85, 1.1);
  cabeza.add(bola);
  ojos(cabeza, 0.08, 0.5, 0.17, 0.07);
  cabeza.add(malla(new THREE.BoxGeometry(0.05, 0.06, 0.3), mate(0x111111), 0.52, -0.12, 0));
  cabeza.add(malla(new THREE.CylinderGeometry(0.05, 0.07, 0.25), mate(0x2d6a4f), 0, 0.5, 0));
  return g;
}

function fantasma(c) {
  const g = new THREE.Group();
  g.add(malla(new THREE.CylinderGeometry(0.42, 0.5, 0.8, 14), mate(c.color), 0, 0.4, 0));
  g.add(malla(esfera(0.43), mate(c.color), 0, 0.85, 0));
  ojos(g, 0.95, 0.38, 0.14, 0.08);
  for (const s of [-1, 1]) g.add(malla(esfera(0.13), mate(c.color), 0.15, 0.55, s * 0.47));
  return g;
}

const TIPOS = { persona, gato, pajaro, toro, calabaza, fantasma };

export function crearPersonaje(cuerpo) {
  return TIPOS[cuerpo.tipo](cuerpo);
}
```

Crear `src/dibujo/kart3d.js`:

```js
import * as THREE from 'three';
import { crearPersonaje } from './personajes3d.js';
import { mate, brillo, malla } from './comun.js';

const rueda = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 14);
const chispa = new THREE.SphereGeometry(0.22, 8, 6);
const sombra = new THREE.CircleGeometry(1.4, 20);
const materialSombra = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });

// El kart mira hacia +x local. La sombra queda en el suelo aunque el kart salte.
export function crearKart3D(ficha) {
  const raiz = new THREE.Group();
  const s = new THREE.Mesh(sombra, materialSombra);
  s.rotation.x = -Math.PI / 2;
  s.position.y = 0.06;
  raiz.add(s);
  const cuerpo = new THREE.Group();
  raiz.add(cuerpo);
  cuerpo.add(malla(new THREE.BoxGeometry(2.4, 0.45, 1.5), mate(ficha.kart), 0, 0.5, 0));
  cuerpo.add(malla(new THREE.BoxGeometry(0.5, 0.35, 1.7), mate(ficha.detalle ?? ficha.kart), 1.15, 0.45, 0));
  cuerpo.add(malla(new THREE.BoxGeometry(0.7, 0.5, 0.9), mate(0x222222), -0.45, 0.9, 0));
  const volante = malla(new THREE.TorusGeometry(0.22, 0.05, 6, 14), mate(0x222222), 0.45, 1.05, 0);
  volante.rotation.y = Math.PI / 2;
  cuerpo.add(volante);
  const ruedas = [[0.85, 0.85], [0.85, -0.85], [-0.85, 0.85], [-0.85, -0.85]].map(([x, z]) => {
    const r = malla(rueda, mate(0x111111), x, 0.38, z);
    r.rotation.x = Math.PI / 2;
    cuerpo.add(r);
    return r;
  });
  const piloto = crearPersonaje(ficha.cuerpo);
  piloto.position.set(-0.45, 0.95, 0);
  cuerpo.add(piloto);
  const chispas = [-0.85, 0.85].map((z) => {
    const c = malla(chispa, brillo(0x4cc9f0), -1.25, 0.3, z);
    c.visible = false;
    cuerpo.add(c);
    return c;
  });
  const fuego = malla(new THREE.ConeGeometry(0.3, 1.2, 10), brillo(0xff9f1c), -1.6, 0.5, 0);
  fuego.rotation.z = Math.PI / 2;
  fuego.visible = false;
  cuerpo.add(fuego);

  raiz.sincronizar = (k, t) => {
    raiz.position.set(k.x, 0, -k.y);
    raiz.rotation.y = k.rumbo;
    cuerpo.position.y = k.h;
    cuerpo.rotation.y = k.derrape ? k.derrape.dir * 0.35 : 0;
    ruedas.forEach((r) => {
      r.rotation.y += k.vel * 0.05;
    });
    chispas.forEach((c) => {
      c.visible = k.chispas > 0;
      c.material = brillo(k.chispas === 2 ? 0xff9f1c : 0x4cc9f0);
      c.scale.setScalar(0.7 + 0.5 * Math.abs(Math.sin(t * 30)));
    });
    fuego.visible = k.turbo > 0;
    fuego.scale.setScalar(0.8 + 0.3 * Math.abs(Math.sin(t * 25)));
  };
  return raiz;
}
```

- [ ] **Paso 7: cámaras, mundo y pantalla de inicio**

Crear `src/dibujo/camaras.js`:

```js
import * as THREE from 'three';

export function crearCamara(fov) {
  return new THREE.PerspectiveCamera(fov, 1, 0.1, 1000);
}

// Cámara detrás y un poco arriba del kart, con un leve retraso para que no tiemble.
export function seguir(camara, k, dt, inmediato = false) {
  const objetivo = new THREE.Vector3(k.x - Math.cos(k.rumbo) * 7, k.h + 3.2, -(k.y - Math.sin(k.rumbo) * 7));
  if (inmediato) camara.position.copy(objetivo);
  else camara.position.lerp(objetivo, 1 - Math.exp(-dt * 6));
  camara.lookAt(k.x + Math.cos(k.rumbo) * 3, k.h + 1, -(k.y + Math.sin(k.rumbo) * 3));
}

// Una vista por cámara, de izquierda a derecha.
export function dibujarVistas(renderer, escena, camaras) {
  const ancho = renderer.domElement.clientWidth;
  const alto = renderer.domElement.clientHeight;
  const w = ancho / camaras.length;
  camaras.forEach((camara, i) => {
    camara.aspect = w / alto;
    camara.updateProjectionMatrix();
    renderer.setViewport(i * w, 0, w, alto);
    renderer.setScissor(i * w, 0, w, alto);
    renderer.render(escena, camara);
  });
}
```

Crear `src/dibujo/escena.js`:

```js
import * as THREE from 'three';
import { crearPista3D } from './pista3d.js';
import { crearDecorado } from './decorado3d.js';
import { crearKart3D } from './kart3d.js';

export function crearMundo(pista) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x0b1026);
  escena.fog = new THREE.Fog(0x0b1026, 70, 230);
  escena.add(new THREE.HemisphereLight(0x8fa3ff, 0x1d3b2a, 1.1));
  const luna = new THREE.DirectionalLight(0xdfe7ff, 1.2);
  luna.position.set(-250, 160, -380);
  escena.add(luna);
  escena.add(crearPista3D(pista), crearDecorado(pista));
  let karts = [];
  return {
    escena,
    // Arma los karts de una carrera, en el orden de sus participantes.
    ponerKarts(fichas) {
      karts.forEach((k) => escena.remove(k));
      karts = fichas.map(crearKart3D);
      karts.forEach((k) => escena.add(k));
    },
    actualizar(carrera, t) {
      carrera.karts.forEach((k, i) => karts[i].sincronizar(k, t));
    },
  };
}
```

Crear `src/pantallas/dom.js`:

```js
// Solo se usa con textos e íconos fijos del juego.
export function el(etiqueta, clase, contenido = '') {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  e.innerHTML = contenido;
  return e;
}
```

Crear `src/pantallas/inicio.js`:

```js
import { crearCarrera, pasoCarrera } from '../logica/carrera.js';
import { crearPiloto, conducir } from '../logica/pilotos.js';
import { crearCamara, seguir, dibujarVistas } from '../dibujo/camaras.js';
import { el } from './dom.js';

const PASO = 1 / 60;

// Elegir 1 o 2 jugadores. De fondo corre una carrera de demostración con los 8 personajes.
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
    mundo.actualizar(demo, 0);
    seguir(camara, demo.karts[0], 1, true);
  }
  nuevaDemo();

  const raiz = el('div', 'inicio', `
    <div class="logo">Olé Kart</div>
    <div class="opciones"><div class="opcion">👤</div><div class="opcion">👥</div></div>
    <div class="sonido">🔇</div>`);
  ctx.capa.append(raiz);
  const opciones = [...raiz.querySelectorAll('.opcion')];
  const silencio = raiz.querySelector('.sonido');
  let elegida = 0;
  let elegidaPor; // id de la fuente que confirmó; null si fue con el mouse
  opciones.forEach((o, i) => o.addEventListener('click', () => {
    elegida = i;
    elegidaPor = null;
  }));

  return {
    actualizar(fuentes, dt) {
      t += dt;
      for (const f of fuentes) {
        if (f.recien.izquierda) elegida = 0;
        if (f.recien.derecha) elegida = 1;
        if (f.recien.confirma) elegidaPor = f.id;
      }
      opciones.forEach((o, i) => o.classList.toggle('elegida', i === elegida));
      silencio.classList.toggle('oculto', sonido.activo());
      if (elegidaPor !== undefined) {
        sonido.reanudar();
        ctx.ir('seleccion', { cantidad: elegida + 1, primera: elegidaPor });
        return;
      }
      acumulado += dt;
      while (acumulado >= PASO) {
        acumulado -= PASO;
        pasoCarrera(demo, demo.karts.map((k, i) => conducir(pilotos[i], k, pista, PASO)), PASO);
      }
      if (demo.estado === 'fin' || demo.tiempo > 120) nuevaDemo();
      mundo.actualizar(demo, t);
      seguir(camara, demo.karts[0], dt);
    },
    dibujar(renderer) {
      dibujarVistas(renderer, mundo.escena, [camara]);
    },
    salir() {},
  };
}
```

Crear `src/juego.js`:

```js
import { crearPista, NOCHE } from './logica/pista.js';
import { PERSONAJES } from './logica/personajes.js';
import { crearMundo } from './dibujo/escena.js';
import { pantallaInicio } from './pantallas/inicio.js';

const PANTALLAS = { inicio: pantallaInicio };

export function crearJuego({ renderer, capa, entradas, sonido }) {
  const pista = crearPista(NOCHE);
  let actual = null;
  const ctx = { renderer, capa, pista, mundo: crearMundo(pista), sonido, personajes: PERSONAJES, nombre: null };
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

Crear `src/main.js`:

```js
import * as THREE from 'three';
import './estilo.css';
import { crearEntradas } from './entrada/mandos.js';
import { crearSonido } from './sonido/sonido.js';
import { crearJuego } from './juego.js';

const lienzo = document.getElementById('lienzo');
const capa = document.getElementById('capa');

let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true });
} catch {
  capa.innerHTML = '<div class="aviso">⚠️🖥️</div>';
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setScissorTest(true);
  const ajustar = () => renderer.setSize(window.innerWidth, window.innerHeight, false);
  ajustar();
  window.addEventListener('resize', ajustar);

  // El navegador solo deja sonar el audio después de un clic o una tecla.
  const sonido = crearSonido();
  window.addEventListener('pointerdown', () => sonido.reanudar());
  window.addEventListener('keydown', () => sonido.reanudar());

  const juego = crearJuego({ renderer, capa, entradas: crearEntradas(window), sonido });
  window.addEventListener('blur', () => juego.pausar());
  let antes = performance.now();
  renderer.setAnimationLoop((ahora) => {
    const dt = Math.min(0.1, (ahora - antes) / 1000);
    antes = ahora;
    juego.cuadro(dt);
  });
  if (import.meta.env.DEV) window.__ole = { juego };
}
```

Crear `src/estilo.css`:

```css
html, body { margin: 0; height: 100%; background: #0b1026; overflow: hidden; font-family: system-ui, sans-serif; color: #fff; user-select: none; }
#lienzo { position: fixed; inset: 0; width: 100vw; height: 100vh; display: block; }
#capa { position: fixed; inset: 0; pointer-events: none; }
.oculto { display: none !important; }
.inicio, .seleccion, .podio { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4vh; }
.logo { font-size: 14vh; font-weight: 900; color: #ffd166; text-shadow: 0 0.6vh 0 #d62828, 0 0 4vh rgba(255, 209, 102, 0.6); }
.opciones { display: flex; gap: 6vw; }
.opcion { pointer-events: auto; cursor: pointer; font-size: 12vh; width: 22vh; height: 22vh; display: flex; align-items: center; justify-content: center; border-radius: 4vh; background: rgba(11, 16, 38, 0.75); border: 1vh solid transparent; }
.opcion.elegida { border-color: #ffd166; transform: scale(1.08); }
.sonido { position: absolute; top: 3vh; right: 3vw; font-size: 8vh; }
.seleccion { justify-content: flex-end; padding-bottom: 4vh; box-sizing: border-box; }
.barra { display: flex; gap: 4vw; }
.ficha { font-size: 7vh; padding: 1vh 3vh; border-radius: 3vh; background: rgba(11, 16, 38, 0.8); border: 0.8vh solid #fff; }
.j1 { border-color: #d62828 !important; }
.j2 { border-color: #3a86ff !important; }
.marcador { position: absolute; top: 0; height: 100vh; padding: 2vh 2vw; box-sizing: border-box; }
.carrera.n1 .marcador { left: 0; width: 100vw; }
.carrera.n2 .marcador { width: 50vw; }
.carrera.n2 .marcador.j2 { left: 50vw; }
.puesto { font-size: 14vh; font-weight: 900; color: #ffd166; text-shadow: 0 0.5vh 0 #000; line-height: 1; }
.vuelta { font-size: 6vh; font-weight: 800; text-shadow: 0 0.4vh 0 #000; }
.contrario { display: none; position: absolute; top: 25vh; left: 0; width: 100%; text-align: center; font-size: 22vh; }
.contrario.visible { display: block; }
.cuenta { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 30vh; font-weight: 900; color: #ffd166; text-shadow: 0 1vh 0 #d62828; }
.aviso { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 20vh; background: rgba(11, 16, 38, 0.6); }
.aviso span { border: 1.5vh solid; border-radius: 4vh; padding: 0 3vh; }
.pequeno { font-size: 6vh; margin-top: 2vh; }
.podio { justify-content: flex-end; padding-bottom: 3vh; box-sizing: border-box; }
.tabla { display: flex; gap: 1.5vw; }
.fila { font-size: 6vh; background: rgba(11, 16, 38, 0.8); border-radius: 2vh; padding: 1vh 1.5vh; border: 0.6vh solid transparent; display: flex; flex-direction: column; align-items: center; }
.numero { font-size: 4vh; font-weight: 900; color: #ffd166; }
.podio .opcion { width: 14vh; height: 14vh; font-size: 8vh; }
```

Crear `index.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Olé Kart</title>
  </head>
  <body>
    <canvas id="lienzo"></canvas>
    <div id="capa"></div>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
```

- [ ] **Paso 8: suite, construcción y vista en el navegador**

Run: `npx vitest run && npx vite build`
Expected: PASS en todos los archivos y la construcción termina sin errores.

Levantar `npx vite --port 5299 --strictPort` en segundo plano. En una carpeta con Playwright instalado (en esta sesión, `<scratchpad>/webkit`), crear `ver-inicio.mjs`:

```js
import { chromium } from 'playwright';
const navegador = await chromium.launch({ channel: 'msedge' });
const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } });
const errores = [];
pagina.on('pageerror', (e) => errores.push(e.message));
pagina.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
await pagina.goto('http://localhost:5299/');
await pagina.waitForTimeout(6000);
await pagina.screenshot({ path: 'ole-inicio.png' });
console.log('pantalla', await pagina.evaluate(() => window.__ole.juego.pantalla));
console.log('errores:', errores.length ? errores : 'ninguno');
await navegador.close();
```

Run: `node ver-inicio.mjs`
Expected: `pantalla inicio` y `errores: ninguno`. En `ole-inicio.png` se ven la pista de noche, karts con personajes avanzando, el logo y los dos íconos 👤 👥. Detener el servidor.

- [ ] **Paso 9: commit**

```bash
git add index.html src tests
git commit -m "Mundo 3D de la Noche de Thriller y pantalla de inicio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 8: selección, carrera y podio

**Archivos:**
- Crear: `src/dibujo/vitrina.js`, `src/dibujo/podio3d.js`, `src/pantallas/seleccion.js`, `src/pantallas/carrera.js`, `src/pantallas/podio.js`
- Modificar: `src/juego.js` (registrar las pantallas)

**Interfaces:**
- Consume: `crearSeleccion`, `procesarSeleccion`, `todosListos` (tarea 5); `crearCarrera`, `pasoCarrera`, `VUELTAS` (tarea 3); `crearPiloto`, `conducir`, `ayudar`, `QUIETO` (tarea 4); dibujo y pantallas de la tarea 7.
- Produce:
  - `pantallaSeleccion(ctx, { cantidad, primera })` va a `carrera` con `{ jugadores: Array<{ fuente, personaje, ayuda }> }` o vuelve a `inicio`.
  - `pantallaCarrera(ctx, { jugadores })` va a `podio` con `{ carrera, jugadores, orden, humanos }`. Deja `ctx.carrera`.
  - `pantallaPodio(ctx, datos)`: A juega otra carrera con los mismos personajes; B vuelve al inicio.

- [ ] **Paso 1: escenas de selección y podio**

Crear `src/dibujo/vitrina.js`:

```js
import * as THREE from 'three';
import { crearKart3D } from './kart3d.js';
import { mate, brillo, malla } from './comun.js';

// Los 8 personajes en sus karts, girando sobre plataformas en dos filas de 4.
export function crearVitrina(fichas) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x0b1026);
  escena.add(new THREE.HemisphereLight(0xffffff, 0x334455, 2));
  const camara = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camara.position.set(0, 7, 16);
  camara.lookAt(0, 1.2, 0);
  const posiciones = fichas.map((_, i) => ({ x: ((i % 4) - 1.5) * 4, z: Math.floor(i / 4) * 4.5 - 2.2 }));
  const karts = fichas.map((f, i) => {
    const { x, z } = posiciones[i];
    escena.add(malla(new THREE.CylinderGeometry(1.6, 1.6, 0.3, 24), mate(0x3a3f58), x, 0, z));
    const kart = crearKart3D(f);
    kart.position.set(x, 0.15, z);
    escena.add(kart);
    return kart;
  });
  const anillos = [0xd62828, 0x3a86ff].map((color, j) => {
    const a = malla(new THREE.TorusGeometry(1.8 + j * 0.3, 0.12, 8, 32), brillo(color));
    a.rotation.x = Math.PI / 2;
    a.visible = false;
    escena.add(a);
    return a;
  });
  return {
    escena,
    camara,
    // Un anillo del color de cada jugador bajo su personaje; undefined lo oculta.
    marcar(cursores) {
      anillos.forEach((a, j) => {
        const c = cursores[j];
        a.visible = c !== undefined;
        if (c !== undefined) a.position.set(posiciones[c].x, 0.2, posiciones[c].z);
      });
    },
    actualizar(t) {
      karts.forEach((k, i) => {
        k.rotation.y = t * 0.8 + i;
      });
    },
  };
}
```

Crear `src/dibujo/podio3d.js`:

```js
import * as THREE from 'three';
import { crearPersonaje } from './personajes3d.js';
import { mate, malla } from './comun.js';

// Los tres primeros bailan sobre el podio, mirando a la cámara.
export function crearPodio3D(fichas) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x0b1026);
  escena.add(new THREE.HemisphereLight(0xffffff, 0x334455, 2));
  const camara = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camara.position.set(0, 4.5, 12);
  camara.lookAt(0, 2, 0);
  const lugares = [
    { x: 0, alto: 2.4, color: 0xffd166 },
    { x: -3, alto: 1.6, color: 0xced4da },
    { x: 3, alto: 1.1, color: 0xcd7f32 },
  ];
  const figuras = fichas.map((f, i) => {
    const l = lugares[i];
    escena.add(malla(new THREE.BoxGeometry(2.6, l.alto, 2.6), mate(l.color), l.x, l.alto / 2, 0));
    const p = crearPersonaje(f.cuerpo);
    p.position.set(l.x, l.alto, 0);
    escena.add(p);
    return p;
  });
  return {
    escena,
    camara,
    actualizar(t) {
      figuras.forEach((p, i) => {
        p.position.y = lugares[i].alto + Math.abs(Math.sin(t * 4 + i)) * 0.4;
        p.rotation.y = -Math.PI / 2 + Math.sin(t * 2 + i) * 0.5;
      });
    },
  };
}
```

- [ ] **Paso 2: pantalla de selección**

Crear `src/pantallas/seleccion.js`:

```js
import { crearSeleccion, procesarSeleccion, todosListos } from '../logica/seleccion.js';
import { crearVitrina } from '../dibujo/vitrina.js';
import { dibujarVistas } from '../dibujo/camaras.js';
import { el } from './dom.js';

export function pantallaSeleccion(ctx, { cantidad, primera }) {
  const { personajes } = ctx;
  const vitrina = crearVitrina(personajes);
  const sel = crearSeleccion(cantidad, primera);
  const raiz = el('div', 'seleccion');
  const barra = el('div', 'barra');
  raiz.append(barra);
  ctx.capa.append(raiz);
  let t = 0;
  let espera = null;

  function pintar() {
    barra.innerHTML = sel.jugadores
      .map((j, i) => {
        const quien = j.fuente === null ? '🎮❓' : personajes[j.cursor].icono;
        return `<div class="ficha j${i + 1}">${i + 1} ${quien}${j.ayuda ? ' ⭐' : ''}${j.listo ? ' ✅' : ''}</div>`;
      })
      .join('');
    vitrina.marcar(sel.jugadores.map((j) => (j.fuente === null ? undefined : j.cursor)));
  }
  pintar();

  return {
    actualizar(fuentes, dt) {
      t += dt;
      for (const f of fuentes) procesarSeleccion(sel, f);
      if (sel.volver) {
        ctx.ir('inicio');
        return;
      }
      pintar();
      vitrina.actualizar(t);
      if (!todosListos(sel)) {
        espera = null;
        return;
      }
      espera = (espera ?? 0.8) - dt;
      if (espera <= 0) {
        ctx.ir('carrera', {
          jugadores: sel.jugadores.map((j) => ({ fuente: j.fuente, personaje: personajes[j.cursor].id, ayuda: j.ayuda })),
        });
      }
    },
    dibujar(renderer) {
      dibujarVistas(renderer, vitrina.escena, [vitrina.camara]);
    },
    salir() {},
  };
}
```

- [ ] **Paso 3: pantalla de carrera**

Crear `src/pantallas/carrera.js`:

```js
import { crearCarrera, pasoCarrera, VUELTAS } from '../logica/carrera.js';
import { crearPiloto, conducir, ayudar, QUIETO } from '../logica/pilotos.js';
import { crearCamara, seguir, dibujarVistas } from '../dibujo/camaras.js';
import { el } from './dom.js';

const PASO = 1 / 60;

export function pantallaCarrera(ctx, { jugadores }) {
  const { pista, mundo, personajes, sonido } = ctx;
  // Los niños parten en las últimas posiciones de la parrilla, como en Mario Kart.
  const elegidos = jugadores.map((j) => j.personaje);
  const resto = personajes.map((p) => p.id).filter((id) => !elegidos.includes(id));
  const orden = [...resto, ...elegidos];
  const humanos = jugadores.map((_, j) => resto.length + j);
  const carrera = crearCarrera(pista, orden, humanos);
  ctx.carrera = carrera;
  const pilotos = carrera.karts.map(() => crearPiloto());
  mundo.ponerKarts(orden.map((id) => personajes.find((p) => p.id === id)));
  mundo.actualizar(carrera, 0);
  const camaras = jugadores.map(() => crearCamara(jugadores.length === 2 ? 75 : 65));
  camaras.forEach((c, j) => seguir(c, carrera.karts[humanos[j]], 1, true));

  const raiz = el('div', `carrera n${jugadores.length}`);
  const marcadores = jugadores.map((_, j) => {
    const m = el('div', `marcador j${j + 1}`, '<div class="puesto"></div><div class="vuelta"></div><div class="contrario">↩️</div>');
    raiz.append(m);
    return m;
  });
  const cuenta = el('div', 'cuenta');
  const aviso = el('div', 'aviso oculto');
  raiz.append(cuenta, aviso);
  ctx.capa.append(raiz);
  sonido.musica(true);

  let acumulado = 0;
  let t = 0;
  let pausa = false;
  let fin = 0;
  let ultimaCuenta = null;

  function mostrarAviso(html) {
    aviso.classList.toggle('oculto', html === null);
    if (html !== null && aviso.innerHTML !== html) aviso.innerHTML = html;
  }

  return {
    actualizar(fuentes, dt) {
      t += dt;
      const porId = new Map(fuentes.map((f) => [f.id, f]));
      jugadores.forEach((j) => {
        if (porId.get(j.fuente)?.recien.pausa) pausa = !pausa;
      });
      // Control desconectado: se espera que vuelva, o que alguien toque el teclado para reemplazarlo.
      const perdido = jugadores.findIndex((j) => !porId.has(j.fuente));
      if (perdido !== -1) {
        const teclado = porId.get('teclado');
        const libre = !jugadores.some((j) => j.fuente === 'teclado');
        if (libre && teclado && Object.values(teclado.recien).some(Boolean)) jugadores[perdido].fuente = 'teclado';
      }
      if (pausa && jugadores.some((j) => porId.get(j.fuente)?.recien.vuelve)) {
        ctx.ir('inicio');
        return;
      }
      const detenida = pausa || perdido !== -1;
      if (perdido !== -1) mostrarAviso(`<div><span class="j${perdido + 1}">🎮</span> ❌</div>`);
      else if (pausa) mostrarAviso('<div>⏸️</div><div class="pequeno">▶️ Start · 🏠 B</div>');
      else mostrarAviso(null);

      if (!detenida) {
        acumulado += dt;
        while (acumulado >= PASO) {
          acumulado -= PASO;
          const intenciones = carrera.karts.map((k, i) => {
            if (carrera.estado === 'cuenta') return QUIETO;
            const j = humanos.indexOf(i);
            if (j === -1 || k.termino) return conducir(pilotos[i], k, pista, PASO);
            const f = porId.get(jugadores[j].fuente);
            const propia = f ? { giro: f.giro, acelera: f.acelera, frena: f.frena, derrapa: f.derrapa } : QUIETO;
            return jugadores[j].ayuda ? ayudar(propia, k, pista) : propia;
          });
          const eventos = pasoCarrera(carrera, intenciones, PASO);
          humanos.forEach((i) => eventos[i].forEach((e) => sonido.efecto(e)));
        }
      }

      const n = carrera.estado === 'cuenta' ? Math.ceil(carrera.cuenta) : 0;
      if (n !== ultimaCuenta) {
        if (n > 0) sonido.efecto('cuenta');
        else if (ultimaCuenta !== null) sonido.efecto('ya');
        ultimaCuenta = n;
      }
      cuenta.textContent = n > 0 ? String(n) : carrera.tiempo < 1 ? '🏁' : '';

      humanos.forEach((i, j) => {
        const k = carrera.karts[i];
        const m = marcadores[j];
        m.querySelector('.puesto').textContent = `${k.puesto}º`;
        m.querySelector('.vuelta').textContent = `${Math.min(VUELTAS, k.vuelta + 1)}/${VUELTAS}`;
        m.querySelector('.contrario').classList.toggle('visible', k.contrario > 1);
      });

      if (carrera.estado === 'fin') {
        fin += dt;
        if (fin > 2.5) {
          ctx.ir('podio', { carrera, jugadores, orden, humanos });
          return;
        }
      }
      sonido.motores(humanos.map((i) => (detenida ? null : carrera.karts[i].vel)));
      mundo.actualizar(carrera, t);
      humanos.forEach((i, j) => seguir(camaras[j], carrera.karts[i], dt));
    },
    dibujar(renderer) {
      dibujarVistas(renderer, mundo.escena, camaras);
    },
    pausar() {
      pausa = true;
    },
    salir() {
      sonido.musica(false);
      sonido.motores([null, null]);
    },
  };
}
```

- [ ] **Paso 4: pantalla de podio**

Crear `src/pantallas/podio.js`:

```js
import { crearPodio3D } from '../dibujo/podio3d.js';
import { dibujarVistas } from '../dibujo/camaras.js';
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
    <div class="opciones"><div class="opcion elegida">🔁</div><div class="opcion">🏠</div></div>`);
  ctx.capa.append(raiz);
  const [otra, casa] = raiz.querySelectorAll('.opcion');
  otra.addEventListener('click', () => ctx.ir('carrera', { jugadores }));
  casa.addEventListener('click', () => ctx.ir('inicio'));
  let t = 0;
  return {
    actualizar(fuentes, dt) {
      t += dt;
      podio.actualizar(t);
      // El primer segundo se ignora: así el botón que se tenía apretado al llegar no salta el podio.
      if (t < 1) return;
      for (const f of fuentes) {
        if (f.recien.confirma) {
          ctx.ir('carrera', { jugadores });
          return;
        }
        if (f.recien.vuelve) {
          ctx.ir('inicio');
          return;
        }
      }
    },
    dibujar(renderer) {
      dibujarVistas(renderer, podio.escena, [podio.camara]);
    },
    salir() {},
  };
}
```

- [ ] **Paso 5: registrar las pantallas**

En `src/juego.js`, reemplazar:

```js
import { pantallaInicio } from './pantallas/inicio.js';

const PANTALLAS = { inicio: pantallaInicio };
```

por:

```js
import { pantallaInicio } from './pantallas/inicio.js';
import { pantallaSeleccion } from './pantallas/seleccion.js';
import { pantallaCarrera } from './pantallas/carrera.js';
import { pantallaPodio } from './pantallas/podio.js';

const PANTALLAS = { inicio: pantallaInicio, seleccion: pantallaSeleccion, carrera: pantallaCarrera, podio: pantallaPodio };
```

- [ ] **Paso 6: suite y construcción**

Run: `npx vitest run && npx vite build`
Expected: PASS en todos los archivos y la construcción termina sin errores.

- [ ] **Paso 7: carrera completa en el navegador con dos controles simulados**

Levantar `npx vite --port 5299 --strictPort` en segundo plano. En la carpeta con Playwright, crear `probar-ole.mjs`:

```js
// Dos controles simulados: selección, carrera completa con modo ayuda, desconexión y podio.
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
const pantalla = () => pagina.evaluate(() => window.__ole.juego.pantalla);
const estado = () => pagina.evaluate(() => {
  const c = window.__ole.juego.ctx.carrera;
  return c && { estado: c.estado, tiempo: Math.round(c.tiempo), ninos: c.karts.filter((k) => k.humano).map((k) => ({ vuelta: k.vuelta, puesto: k.puesto })) };
});

await pagina.goto('http://localhost:5299/');
await pagina.waitForTimeout(3000);
await pulsar(0, 15);           // derecha: 2 jugadores
await pulsar(0, 0);            // A
console.log('1', await pantalla());
await pulsar(1, 0);            // el control 2 se une
await pulsar(0, 3);            // Y: ayuda jugador 1
await pulsar(1, 3);            // Y: ayuda jugador 2
await pulsar(0, 0);            // jugador 1 confirma la bailarina
await pulsar(1, 0);            // jugador 2 confirma el bailarín
await pagina.screenshot({ path: 'ole-seleccion.png' });
await pagina.waitForTimeout(1500);
console.log('2', await pantalla());
await pagina.waitForTimeout(2000);
await pagina.screenshot({ path: 'ole-cuenta.png' });
await fijar(0, 0, true);
await fijar(1, 0, true);
await pagina.waitForTimeout(8000);
await pagina.screenshot({ path: 'ole-carrera.png' });
const cuadros = await pagina.evaluate(() => new Promise((listo) => {
  let n = 0; const inicio = performance.now();
  const contar = () => { n++; if (performance.now() - inicio < 5000) requestAnimationFrame(contar); else listo(n / 5); };
  requestAnimationFrame(contar);
}));
console.log('3 cuadros por segundo', cuadros.toFixed(1), JSON.stringify(await estado()));
await pagina.evaluate(() => { window.__mandos[1].connected = false; });
await pagina.waitForTimeout(1000);
await pagina.screenshot({ path: 'ole-desconectado.png' });
const antes = await estado();
await pagina.waitForTimeout(1500);
console.log('4 detenida', JSON.stringify(antes) === JSON.stringify(await estado()));
await pagina.evaluate(() => { window.__mandos[1].connected = true; });
for (let i = 0; i < 40 && (await pantalla()) === 'carrera'; i++) {
  await pagina.waitForTimeout(5000);
  if (i % 6 === 0) console.log('5', JSON.stringify(await estado()));
}
await pagina.waitForTimeout(1500);
console.log('6', await pantalla());
await pagina.screenshot({ path: 'ole-podio.png' });
console.log('errores:', errores.length ? errores : 'ninguno');
await navegador.close();
```

Run: `node probar-ole.mjs`
Expected:
- `1 seleccion`, `2 carrera`.
- `3 cuadros por segundo …` con un número mayor que 0 (es informativo: la meta de 60 se confirma en el notebook real) y los dos niños en `vuelta` 0 o 1.
- `4 detenida true`: con el control 2 desconectado la carrera no avanza.
- Líneas `5` donde las vueltas de los niños suben hasta 3.
- `6 podio` y `errores: ninguno`.

Revisar las capturas: selección con los dos anillos (rojo y azul), cuenta regresiva, pantalla dividida con puesto y vuelta en cada mitad, aviso del control 2 con borde azul, y podio con la tabla de los 8. Detener el servidor.

- [ ] **Paso 8: commit**

```bash
git add src
git commit -m "Selección de personaje, carrera de 1 y 2 jugadores y podio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 9: publicación

**Archivos:**
- Crear: `.github/workflows/pages.yml`

**Interfaces:**
- Consume: `npm test` y `npm run build` del proyecto.

Esta tarea tiene dos acciones fuera del repositorio que necesitan a Gonzalo: crear el repositorio `ole-kart` en GitHub (vacío y público) y confirmar el primer `push`.

- [ ] **Paso 1: flujo de publicación**

Crear `.github/workflows/pages.yml`:

```yaml
name: Publicar Olé Kart

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  publicar:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.despliegue.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: despliegue
        uses: actions/deploy-pages@v4
```

```bash
git add .github
git commit -m "Publicación en GitHub Pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Paso 2: repositorio en GitHub (con Gonzalo)**

Gonzalo crea el repositorio público y vacío `chalofster/ole-kart`, o deja el navegador con su sesión abierta para hacerlo con Playwright, como con el Tablao. En *Settings → Pages*, la fuente queda en **GitHub Actions**.

- [ ] **Paso 3: primer envío (con confirmación)**

Con la confirmación explícita de Gonzalo:

```bash
git remote add origin https://github.com/chalofster/ole-kart.git
git push -u origin main
```

Expected: el envío termina sin errores (Git Credential Manager ya está autorizado).

- [ ] **Paso 4: verificar la publicación**

Run: `curl -s -o /dev/null -w '%{http_code}' https://chalofster.github.io/ole-kart/` (repetir cada 15 s, hasta 5 minutos)
Expected: `200`, y el archivo `assets/*.js` de la página contiene `Noche` o `bailarina`.
