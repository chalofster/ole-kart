---
titulo: "Plan de implementación: Olé Kart, paso B (objetos)"
tipo: plan de implementación
fecha: 04-10-2026
estado: pendiente de revisión
---

# Olé Kart, paso B: plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** cajas sorpresa con cuatro objetos originales (🎃 calabaza rodante, 🍌 cáscara, 🌶️ ají turbo, 🪩 bola disco), golpes suaves, reparto según la posición y rivales que los usan con calma contra los niños.

**Arquitectura:** un módulo de lógica pura nuevo, `src/logica/objetos.js`, guarda cajas, calabazas y cáscaras y aplica golpes y efectos. `pasoCarrera` lo llama en cada paso. Los rivales deciden en `pilotos.js`. El dibujo va en `src/dibujo/objetos3d.js` y en el kart, y la casilla del objeto en la pantalla de carrera.

**Tecnologías:** las mismas del proyecto: Three.js 0.186, Vite 8.3, Vitest 5.0, Web Audio, Gamepad API.

**Diseño:** `docs/superpowers/specs/2026-10-04-ole-kart-paso-b-objetos-design.md`. Leerlo antes de ejecutar, junto con `2026-10-04-ole-kart-etapa-1-design.md`.

## Restricciones globales

- Raíz: `C:\Users\Gfigueroa\OleKart`. En PowerShell `npm` está bloqueado: usar la herramienta Bash.
- Trabajar en la rama `paso-b`, creada desde `main`.
- `src/logica/` y `src/entrada/` no importan Three.js ni usan el navegador.
- Coordenadas: la lógica usa `(x, y)` y `h`; Three.js usa `(x, h, -y)`. Lateral positivo a la izquierda.
- Nombres en español. Sin archivos de imagen ni audio. Ninguna pantalla exige leer.
- Objetos originales: sin nombres, dibujos ni sonidos de otros juegos de karts.
- Cada `commit` termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Publicar (unir a `main` y hacer `push`) exige la confirmación de Gonzalo.

## Foco de revisión

1. **Calabaza lanzada justo antes de la meta** → sigue por la pista al pasar de s ≈ largo a s ≈ 0 y golpea al kart que está al otro lado. Prueba en la tarea 3.
2. **Dos karts tocan la misma caja en el mismo paso** → solo uno recibe objeto. Prueba en la tarea 2.
3. **Kart golpeado mientras gira su ruleta** → conserva la ruleta y su objeto. Prueba en la tarea 2.
4. **Niño que aprieta X en un cuadro con varios pasos de simulación** → usa un solo objeto. Prueba en la tarea 4.
5. **Muchas cáscaras y calabazas a la vez** → la carrera sigue a 60 cuadros por segundo. Medición en el navegador en la tarea 7.

## Estructura de archivos

| Archivo | Cambio |
|---|---|
| `src/entrada/mandos.js` | Botón `objeto`: X (2) o LB (4); tecla X |
| `src/logica/objetos.js` | Nuevo: cajas, sorteo, ruleta, golpes, efectos, calabazas y cáscaras |
| `src/logica/carrera.js` | Estado de objetos en la carrera; trompo; bola disco; usar objeto |
| `src/logica/pilotos.js` | `decidirObjeto`; `conducir` y `ayudar` llevan `usa` |
| `src/dibujo/objetos3d.js` | Nuevo: cajas, calabazas y cáscaras |
| `src/dibujo/kart3d.js`, `src/dibujo/escena.js` | Trompo, parpadeo, luces de la bola disco; objetos en el mundo |
| `src/pantallas/carrera.js`, `src/pantallas/inicio.js`, `src/estilo.css` | Casilla del objeto, uso con X, demostración con objetos |
| `src/sonido/sonido.js` | Efectos nuevos |

---

## Tarea 1: botón para usar el objeto

**Archivos:**
- Modificar: `src/entrada/mandos.js`, `src/logica/pilotos.js`
- Probar: `tests/mandos.test.js`, `tests/pilotos.test.js`

**Interfaces:**
- Produce: el estado de cada fuente suma `objeto` (X o LB en el control; tecla X). `ayudar(int, k, pista)` devuelve también `usa: int.usa ?? false`.

- [ ] **Paso 1: crear la rama**

Run: `git checkout -b paso-b`
Expected: `Switched to a new branch 'paso-b'`.

- [ ] **Paso 2: pruebas**

En `tests/mandos.test.js`, dentro de `describe('leerMando', ...)`, agregar:

```js
  it('X o el gatillo izquierdo usan el objeto', () => {
    expect(leerMando(botones({ 2: 1 }), [0, 0]).objeto).toBe(true);
    expect(leerMando(botones({ 4: 1 }), [0, 0]).objeto).toBe(true);
    expect(leerMando(botones(), [0, 0]).objeto).toBe(false);
  });
```

y en `describe('leerTeclado', ...)`:

```js
  it('la tecla X usa el objeto', () => {
    expect(leerTeclado(new Set(['KeyX'])).objeto).toBe(true);
    expect(leerTeclado(new Set()).objeto).toBe(false);
  });
```

En `tests/pilotos.test.js`, dentro de `describe('modo ayuda', ...)`, agregar:

```js
  it('deja pasar el uso del objeto que pidió el niño', () => {
    const k = crearKart(pista, 5);
    expect(ayudar({ ...QUIETO, usa: true }, k, pista).usa).toBe(true);
    expect(ayudar(QUIETO, k, pista).usa).toBe(false);
  });
```

- [ ] **Paso 3: verificar que fallan**

Run: `npx vitest run tests/mandos.test.js tests/pilotos.test.js`
Expected: FAIL en las tres pruebas nuevas (`objeto` y `usa` son `undefined`).

- [ ] **Paso 4: implementar**

En `src/entrada/mandos.js`, cambiar el comentario del mapeo y agregar `objeto` a `leerMando`:

```js
// Mapeo estándar de la Gamepad API: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 7 RT, 9 Start, 12-15 cruceta.
```

```js
    ayuda: pulsado(3),
    objeto: pulsado(2) || pulsado(4),
```

y a `leerTeclado`:

```js
    ayuda: t('KeyY'),
    objeto: t('KeyX'),
```

En `src/logica/pilotos.js`, en el objeto que devuelve `ayudar`, agregar al final:

```js
    derrapa: int.derrapa,
    usa: int.usa ?? false,
```

- [ ] **Paso 5: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 6: commit**

```bash
git add src tests
git commit -m "Botón para usar el objeto: X o LB, y la tecla X

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 2: cajas, sorteo, ruleta, golpes y efectos

**Archivos:**
- Crear: `src/logica/objetos.js`
- Probar: `tests/objetos.test.js`

**Interfaces:**
- Consume: `puntoEn` (pista), `KART` (kart).
- Produce:
  - `TIPOS = ['cascara', 'calabaza', 'aji', 'disco']`, `ICONOS`, `OBJ` (constantes), `FILAS`, `LATERALES`, `REPARTO`.
  - `sortearObjeto(puesto, azar) → tipo`.
  - `crearObjetos(pista) → { cajas: Array<{ s, lateral, x, y, vuelve }>, calabazas: [], cascaras: [] }`.
  - `prepararKart(k)`: agrega `{ objeto: null, ruleta: 0, trompo: 0, proteccion: 0, disco: 0 }`.
  - `golpear(k, eventos) → boolean`.
  - `usarObjeto(estado, k, pista, clase, eventos = []) → eventos` (en esta tarea: ají y bola disco).
  - `pasoObjetos(estado, karts, pista, dt, azar, eventos)`; `eventos` es un arreglo de arreglos, uno por kart. Eventos: `'caja'`, `'listo'`, `'golpe'`, `'turbo'`, `'disco'`, `'calabaza'`, `'cascara'`.

- [ ] **Paso 1: pruebas**

Crear `tests/objetos.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearPista, NOCHE, diferencia, RAMPA } from '../src/logica/pista.js';
import { crearKart, KART, TURBO_PISO } from '../src/logica/kart.js';
import { azarConSemilla } from '../src/logica/azar.js';
import {
  sortearObjeto, crearObjetos, prepararKart, golpear, usarObjeto, pasoObjetos, OBJ, FILAS, LATERALES, TIPOS,
} from '../src/logica/objetos.js';

const pista = crearPista(NOCHE);
const dt = 1 / 60;
const azar = azarConSemilla(1);

function kartEn(s, lateral = 0, cambios = {}) {
  const k = crearKart(pista, s, lateral);
  prepararKart(k);
  return Object.assign(k, { puesto: 4, termino: false }, cambios);
}
// Avanza los objetos los segundos indicados y devuelve los eventos de cada kart.
function avanzar(estado, karts, segundos) {
  const eventos = karts.map(() => []);
  for (let i = 0; i < Math.round(segundos / dt); i++) pasoObjetos(estado, karts, pista, dt, azar, eventos);
  return eventos;
}

describe('sorteo según la posición', () => {
  const contar = (puesto) => {
    const a = azarConSemilla(puesto);
    const n = Object.fromEntries(TIPOS.map((t) => [t, 0]));
    for (let i = 0; i < 2000; i++) n[sortearObjeto(puesto, a)] += 1;
    return n;
  };

  it('el primero nunca recibe la bola disco', () => {
    expect(contar(1).disco).toBe(0);
  });

  it('los últimos reciben sobre todo ajíes y bolas disco', () => {
    const n = contar(8);
    expect((n.aji + n.disco) / 2000).toBeGreaterThan(0.6);
  });

  it('en el medio salen los cuatro', () => {
    for (const cantidad of Object.values(contar(3))) expect(cantidad).toBeGreaterThan(150);
  });
});

describe('cajas', () => {
  it('hay cuatro filas de cuatro, lejos de las flechas de turbo y de la rampa', () => {
    const { cajas } = crearObjetos(pista);
    expect(cajas).toHaveLength(FILAS.length * LATERALES.length);
    for (const s of FILAS) {
      for (const t of pista.turbos) {
        expect(Math.abs(diferencia(t, s, pista.largo))).toBeGreaterThan(20);
        expect(Math.abs(diferencia(t + TURBO_PISO.largo, s, pista.largo))).toBeGreaterThan(20);
      }
      expect(Math.abs(diferencia(pista.rampa, s, pista.largo))).toBeGreaterThan(20);
      expect(Math.abs(diferencia(pista.rampa + RAMPA.largo, s, pista.largo))).toBeGreaterThan(20);
    }
  });

  it('da un objeto con ruleta a quien no tiene, se rompe y vuelve a los 2 s', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(FILAS[0], LATERALES[0]);
    const eventos = avanzar(estado, [k], dt);
    expect(eventos[0]).toContain('caja');
    expect(TIPOS).toContain(k.objeto);
    expect(k.ruleta).toBeGreaterThan(0.9);
    expect(estado.cajas[0].vuelve).toBeGreaterThan(1.9);
    avanzar(estado, [], OBJ.vuelveCaja + dt);
    expect(estado.cajas[0].vuelve).toBe(0);
  });

  it('si dos karts la tocan en el mismo paso, solo uno recibe objeto', () => {
    const estado = crearObjetos(pista);
    const a = kartEn(FILAS[1], LATERALES[2]);
    const b = kartEn(FILAS[1], LATERALES[2]);
    avanzar(estado, [a, b], dt);
    expect([a.objeto, b.objeto].filter(Boolean)).toHaveLength(1);
  });

  it('a quien ya tiene un objeto se le rompe la caja sin darle otro', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(FILAS[0], LATERALES[1], { objeto: 'aji' });
    avanzar(estado, [k], dt);
    expect(k.objeto).toBe('aji');
    expect(estado.cajas[1].vuelve).toBeGreaterThan(0);
  });

  it('un kart en el aire no toca las cajas', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(FILAS[0], LATERALES[0], { enAire: true, h: 2 });
    avanzar(estado, [k], dt);
    expect(k.objeto).toBeNull();
    expect(estado.cajas[0].vuelve).toBe(0);
  });
});

describe('ruleta', () => {
  it('mientras gira no se puede usar; al terminar avisa que está listo', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(300, 0, { objeto: 'aji', ruleta: OBJ.ruleta });
    usarObjeto(estado, k, pista, 1);
    expect(k.objeto).toBe('aji');
    expect(k.turbo).toBe(0);
    const eventos = avanzar(estado, [k], OBJ.ruleta + dt);
    expect(eventos[0]).toContain('listo');
    usarObjeto(estado, k, pista, 1);
    expect(k.objeto).toBeNull();
  });
});

describe('golpe', () => {
  it('trompo de 1 s a media velocidad, sin derrape ni turbo, y después 1,5 s de protección', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(300, 0, { vel: 20, turbo: 0.5, derrape: { dir: 1, carga: 1 }, chispas: 1 });
    const eventos = [];
    expect(golpear(k, eventos)).toBe(true);
    expect(eventos).toContain('golpe');
    expect(k).toMatchObject({ vel: 10, trompo: OBJ.trompo, turbo: 0, derrape: null, chispas: 0 });
    expect(golpear(k, [])).toBe(false);
    avanzar(estado, [k], OBJ.trompo + dt);
    expect(k.trompo).toBe(0);
    expect(k.proteccion).toBeGreaterThan(OBJ.proteccion - 0.05);
    expect(golpear(k, [])).toBe(false);
    avanzar(estado, [k], OBJ.proteccion + dt);
    expect(golpear(k, [])).toBe(true);
  });

  it('un kart golpeado mientras gira su ruleta conserva la ruleta y su objeto', () => {
    const k = kartEn(300, 0, { objeto: 'calabaza', ruleta: 0.5 });
    golpear(k, []);
    expect(k).toMatchObject({ objeto: 'calabaza', ruleta: 0.5 });
  });
});

describe('ají y bola disco', () => {
  it('el ají da un turbo de 1,5 s', () => {
    const k = kartEn(300, 0, { objeto: 'aji' });
    const eventos = usarObjeto(crearObjetos(pista), k, pista, 1);
    expect(eventos).toContain('turbo');
    expect(k.turbo).toBe(OBJ.aji);
    expect(k.objeto).toBeNull();
  });

  it('la bola disco dura 6 s, protege de golpes y hace girar a quien toca', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(300, 0, { objeto: 'disco' });
    expect(usarObjeto(estado, k, pista, 1)).toContain('disco');
    expect(golpear(k, [])).toBe(false);
    const otro = kartEn(300, 0);
    Object.assign(otro, { x: k.x + KART.radio * 2 - 0.1, y: k.y });
    const eventos = avanzar(estado, [k, otro], dt);
    expect(eventos[1]).toContain('golpe');
    expect(otro.trompo).toBeGreaterThan(0);
    avanzar(estado, [k], OBJ.disco + dt);
    expect(k.disco).toBe(0);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/objetos.test.js`
Expected: FAIL. No existe `src/logica/objetos.js`.

- [ ] **Paso 3: escribir los objetos**

Crear `src/logica/objetos.js`:

```js
import { puntoEn } from './pista.js';
import { KART } from './kart.js';

// Objetos originales de Olé Kart. Duraciones en segundos.
export const TIPOS = ['cascara', 'calabaza', 'aji', 'disco'];
export const ICONOS = { cascara: '🍌', calabaza: '🎃', aji: '🌶️', disco: '🪩' };
export const OBJ = {
  ruleta: 1, vuelveCaja: 2, trompo: 1, proteccion: 1.5, aji: 1.5, disco: 6, discoExtra: 1.15,
  calabazaVel: 1.4, calabazaVida: 6, cascaraAtras: 2.5, cascaraDueno: 1, maxCascaras: 10,
  alcance: KART.radio + 0.8,
};
// Filas de cajas: distancia por la pista y desplazamiento lateral de cada caja.
export const FILAS = [35, 410, 660, 790];
export const LATERALES = [-4.5, -1.5, 1.5, 4.5];
// Probabilidades en el orden de TIPOS, según el puesto: más ayuda para quien va atrás.
export const REPARTO = {
  primero: [0.5, 0.4, 0.1, 0],
  medio: [0.25, 0.3, 0.3, 0.15],
  atras: [0.1, 0.2, 0.4, 0.3],
};

export function sortearObjeto(puesto, azar) {
  const p = puesto === 1 ? REPARTO.primero : puesto <= 5 ? REPARTO.medio : REPARTO.atras;
  let r = azar();
  for (let i = 0; i < TIPOS.length; i++) {
    r -= p[i];
    if (r < 0) return TIPOS[i];
  }
  return TIPOS[p.findLastIndex((x) => x > 0)];
}

export function crearObjetos(pista) {
  const cajas = FILAS.flatMap((s) => LATERALES.map((lateral) => {
    const p = puntoEn(pista, s, lateral);
    return { s, lateral, x: p.x, y: p.y, vuelve: 0 };
  }));
  return { cajas, calabazas: [], cascaras: [] };
}

export function prepararKart(k) {
  return Object.assign(k, { objeto: null, ruleta: 0, trompo: 0, proteccion: 0, disco: 0 });
}

const toca = (a, b, distancia = OBJ.alcance) => Math.hypot(a.x - b.x, a.y - b.y) < distancia;

// Trompo suave: no afecta a quien tiene la bola disco, está protegido o ya gira. La ruleta y el objeto se conservan.
export function golpear(k, eventos) {
  if (k.disco > 0 || k.proteccion > 0 || k.trompo > 0) return false;
  Object.assign(k, { trompo: OBJ.trompo, vel: k.vel * 0.5, derrape: null, chispas: 0, turbo: 0 });
  eventos.push('golpe');
  return true;
}

export function usarObjeto(estado, k, pista, clase, eventos = []) {
  if (!k.objeto || k.ruleta > 0 || k.trompo > 0) return eventos;
  const tipo = k.objeto;
  k.objeto = null;
  if (tipo === 'aji') {
    k.turbo = Math.max(k.turbo, OBJ.aji);
    eventos.push('turbo');
  } else if (tipo === 'disco') {
    k.disco = OBJ.disco;
    eventos.push('disco');
  }
  return eventos;
}

// Avanza un paso: efectos de cada kart, cajas y choques con la bola disco.
export function pasoObjetos(estado, karts, pista, dt, azar, eventos) {
  karts.forEach((k, i) => {
    if (k.ruleta > 0) {
      k.ruleta -= dt;
      if (k.ruleta <= 0) {
        k.ruleta = 0;
        eventos[i].push('listo');
      }
    }
    if (k.trompo > 0) {
      k.trompo -= dt;
      if (k.trompo <= 0) {
        k.trompo = 0;
        k.proteccion = OBJ.proteccion;
      }
    } else if (k.proteccion > 0) k.proteccion = Math.max(0, k.proteccion - dt);
    if (k.disco > 0) k.disco = Math.max(0, k.disco - dt);
  });

  for (const caja of estado.cajas) {
    if (caja.vuelve > 0) {
      caja.vuelve = Math.max(0, caja.vuelve - dt);
      continue;
    }
    karts.forEach((k, i) => {
      if (caja.vuelve > 0 || k.enAire || !toca(k, caja)) return;
      caja.vuelve = OBJ.vuelveCaja;
      eventos[i].push('caja');
      if (k.objeto === null && !k.termino) {
        k.objeto = sortearObjeto(k.puesto, azar);
        k.ruleta = OBJ.ruleta;
      }
    });
  }

  karts.forEach((a) => {
    if (a.disco <= 0 || a.enAire) return;
    karts.forEach((b, j) => {
      if (b !== a && !b.enAire && toca(a, b, KART.radio * 2 + 0.2)) golpear(b, eventos[j]);
    });
  });
}
```

- [ ] **Paso 4: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 5: commit**

```bash
git add src/logica/objetos.js tests/objetos.test.js
git commit -m "Cajas sorpresa, sorteo según la posición, ruleta, golpes, ají y bola disco

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 3: calabazas y cáscaras

**Archivos:**
- Modificar: `src/logica/objetos.js`
- Probar: `tests/objetos.test.js`

**Interfaces:**
- Consume: lo producido en la tarea 2.
- Produce: `usarObjeto` también lanza calabazas y deja cáscaras. `estado.calabazas: Array<{ s, lateral, x, y, vel, vida, dueno }>`, `estado.cascaras: Array<{ x, y, dueno, espera, fuera }>`.

- [ ] **Paso 1: pruebas**

Agregar al final de `tests/objetos.test.js`:

```js
describe('calabaza rodante', () => {
  it('rueda por la pista y golpea al primer kart de su línea, no al de otra línea ni a su dueño', () => {
    const estado = crearObjetos(pista);
    const lanzador = kartEn(100, 0, { objeto: 'calabaza' });
    const blanco = kartEn(125, 0);
    const lejos = kartEn(115, 5);
    expect(usarObjeto(estado, lanzador, pista, 1)).toContain('calabaza');
    expect(estado.calabazas).toHaveLength(1);
    expect(estado.calabazas[0].vel).toBeCloseTo(OBJ.calabazaVel * KART.velMax, 9);
    avanzar(estado, [lanzador, blanco, lejos], 1.5);
    expect(blanco.trompo).toBeGreaterThan(0);
    expect(lejos.trompo).toBe(0);
    expect(lanzador.trompo).toBe(0);
    expect(estado.calabazas).toHaveLength(0);
  });

  it('va más rápido con la velocidad 🚀', () => {
    const estado = crearObjetos(pista);
    usarObjeto(estado, kartEn(100, 0, { objeto: 'calabaza' }), pista, 1.5);
    expect(estado.calabazas[0].vel).toBeCloseTo(OBJ.calabazaVel * KART.velMax * 1.5, 9);
  });

  it('lanzada justo antes de la meta, la cruza y golpea al otro lado', () => {
    const estado = crearObjetos(pista);
    const lanzador = kartEn(pista.largo - 6, 0, { objeto: 'calabaza' });
    const blanco = kartEn(12, 0);
    usarObjeto(estado, lanzador, pista, 1);
    avanzar(estado, [lanzador, blanco], 1.5);
    expect(blanco.trompo).toBeGreaterThan(0);
  });

  it('si no toca a nadie desaparece a los 6 s; un kart en el aire no la toca', () => {
    const estado = crearObjetos(pista);
    usarObjeto(estado, kartEn(100, 0, { objeto: 'calabaza' }), pista, 1);
    const enAire = kartEn(110, 0, { enAire: true, h: 2 });
    avanzar(estado, [enAire], 1);
    expect(enAire.trompo).toBe(0);
    expect(estado.calabazas).toHaveLength(1);
    avanzar(estado, [], OBJ.calabazaVida);
    expect(estado.calabazas).toHaveLength(0);
  });
});

describe('cáscara de plátano', () => {
  it('queda detrás del kart y hace girar a quien la pisa', () => {
    const estado = crearObjetos(pista);
    const dueno = kartEn(200, 0, { objeto: 'cascara' });
    expect(usarObjeto(estado, dueno, pista, 1)).toContain('cascara');
    const c = estado.cascaras[0];
    expect(Math.hypot(c.x - dueno.x, c.y - dueno.y)).toBeCloseTo(OBJ.cascaraAtras, 0);
    const otro = kartEn(200, 0);
    Object.assign(otro, { x: c.x, y: c.y });
    avanzar(estado, [otro], dt);
    expect(otro.trompo).toBeGreaterThan(0);
    expect(estado.cascaras).toHaveLength(0);
  });

  it('su dueño la puede pisar recién pasado 1 s', () => {
    const estado = crearObjetos(pista);
    const dueno = kartEn(200, 0, { objeto: 'cascara' });
    usarObjeto(estado, dueno, pista, 1);
    Object.assign(dueno, { x: estado.cascaras[0].x, y: estado.cascaras[0].y });
    avanzar(estado, [dueno], 0.5);
    expect(dueno.trompo).toBe(0);
    avanzar(estado, [dueno], 0.6);
    expect(dueno.trompo).toBeGreaterThan(0);
  });

  it('no golpea a un kart en el aire, que la deja en su lugar', () => {
    const estado = crearObjetos(pista);
    usarObjeto(estado, kartEn(200, 0, { objeto: 'cascara' }), pista, 1);
    const enAire = kartEn(200, 0, { enAire: true, h: 2 });
    Object.assign(enAire, { x: estado.cascaras[0].x, y: estado.cascaras[0].y });
    avanzar(estado, [enAire], dt);
    expect(enAire.trompo).toBe(0);
    expect(estado.cascaras).toHaveLength(1);
  });

  it('hay como máximo 10: al dejar otra, desaparece la más antigua', () => {
    const estado = crearObjetos(pista);
    const k = kartEn(200, 0);
    for (let i = 0; i < 12; i++) {
      k.objeto = 'cascara';
      usarObjeto(estado, k, pista, 1);
    }
    expect(estado.cascaras).toHaveLength(OBJ.maxCascaras);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/objetos.test.js`
Expected: FAIL en las pruebas nuevas (no se crean calabazas ni cáscaras).

- [ ] **Paso 3: implementar**

En `src/logica/objetos.js`, cambiar la importación:

```js
import { puntoEn, MEDIO_ANCHO } from './pista.js';
```

En `usarObjeto`, agregar después de la rama de la bola disco:

```js
  } else if (tipo === 'calabaza') {
    // Sale delante del kart, dentro del camino, y rueda a 1,4 veces la velocidad máxima de la carrera.
    const s = k.s + KART.radio * 2 + 0.5;
    const lateral = Math.max(-MEDIO_ANCHO + 1, Math.min(MEDIO_ANCHO - 1, k.lateral));
    const p = puntoEn(pista, s, lateral);
    estado.calabazas.push({
      s, lateral, x: p.x, y: p.y, vel: OBJ.calabazaVel * KART.velMax * clase, vida: OBJ.calabazaVida, dueno: k,
    });
    eventos.push('calabaza');
  } else if (tipo === 'cascara') {
    const p = puntoEn(pista, k.s - OBJ.cascaraAtras, k.lateral);
    estado.cascaras.push({ x: p.x, y: p.y, dueno: k, espera: OBJ.cascaraDueno, fuera: false });
    if (estado.cascaras.length > OBJ.maxCascaras) estado.cascaras.shift();
    eventos.push('cascara');
  }
```

(La rama anterior `} else if (tipo === 'disco') { ... }` queda igual; el bloque nuevo reemplaza su `}` final).

En `pasoObjetos`, antes del bloque de la bola disco (`karts.forEach((a) => {`), agregar:

```js
  for (const c of estado.calabazas) {
    c.vida -= dt;
    c.s = (c.s + c.vel * dt) % pista.largo;
    const p = puntoEn(pista, c.s, c.lateral);
    c.x = p.x;
    c.y = p.y;
    karts.forEach((k, i) => {
      if (c.vida <= 0 || k === c.dueno || k.enAire || !toca(k, c)) return;
      golpear(k, eventos[i]);
      c.vida = 0;
    });
  }
  estado.calabazas = estado.calabazas.filter((c) => c.vida > 0);

  for (const c of estado.cascaras) {
    if (c.espera > 0) c.espera -= dt;
    karts.forEach((k, i) => {
      if (c.fuera || k.enAire || (k === c.dueno && c.espera > 0) || !toca(k, c)) return;
      golpear(k, eventos[i]);
      c.fuera = true;
    });
  }
  estado.cascaras = estado.cascaras.filter((c) => !c.fuera);
```

- [ ] **Paso 4: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 5: commit**

```bash
git add src/logica/objetos.js tests/objetos.test.js
git commit -m "Calabazas rodantes y cáscaras de plátano

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 4: objetos en la carrera

**Archivos:**
- Modificar: `src/logica/carrera.js`
- Probar: `tests/carrera.test.js`

**Interfaces:**
- Consume: `crearObjetos`, `prepararKart`, `usarObjeto`, `pasoObjetos`, `OBJ` (tareas 2 y 3).
- Produce: la carrera suma `{ azar, objetos }`; cada kart suma los campos de `prepararKart`. `pasoCarrera` usa el objeto cuando la intención trae `usa`, ignora la intención de un kart en trompo y multiplica el factor por 1,15 con la bola disco.

- [ ] **Paso 1: pruebas**

En `tests/carrera.test.js`, agregar al final:

```js
describe('objetos en la carrera', () => {
  const usa = (cambios = {}) => IDS.map(() => ({ giro: 0, acelera: true, frena: false, derrapa: false, usa: true, ...cambios }));

  it('la carrera trae las cajas y cada kart parte sin objeto ni efectos', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(10));
    expect(c.objetos.cajas.length).toBeGreaterThan(0);
    for (const k of c.karts) expect(k).toMatchObject({ objeto: null, ruleta: 0, trompo: 0, proteccion: 0, disco: 0 });
  });

  it('se usa el objeto cuando la intención lo pide, y una sola vez aunque se repita', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(11));
    c.estado = 'carrera';
    c.karts[0].objeto = 'cascara';
    pasoCarrera(c, usa(), dt);
    pasoCarrera(c, usa(), dt);
    expect(c.karts[0].objeto).toBeNull();
    expect(c.objetos.cascaras).toHaveLength(1);
  });

  it('no se usan objetos durante la cuenta regresiva ni después de terminar', () => {
    const c = crearCarrera(pista, IDS, [0], azarConSemilla(12));
    c.karts[0].objeto = 'aji';
    pasoCarrera(c, usa(), dt);
    expect(c.karts[0].objeto).toBe('aji');
    c.estado = 'carrera';
    c.karts[0].termino = true;
    pasoCarrera(c, usa(), dt);
    expect(c.karts[0].objeto).toBe('aji');
  });

  it('un kart en trompo no responde a los controles', () => {
    const c = crearCarrera(pista, IDS, [], azarConSemilla(13));
    c.estado = 'carrera';
    Object.assign(c.karts[0], { trompo: OBJ.trompo, vel: 10 });
    for (let i = 0; i < 20; i++) pasoCarrera(c, ACELERAN, dt);
    expect(c.karts[0].vel).toBeLessThan(10);
  });

  it('la bola disco sube 15 % el factor de velocidad', () => {
    const normal = crearCarrera(pista, IDS, [], azarConSemilla(14));
    const disco = crearCarrera(pista, IDS, [], azarConSemilla(14));
    disco.karts[3].disco = OBJ.disco;
    for (const c of [normal, disco]) {
      c.estado = 'carrera';
      pasoCarrera(c, ACELERAN, dt);
    }
    expect(disco.karts[3].factor).toBeCloseTo(normal.karts[3].factor * OBJ.discoExtra, 9);
  });
});
```

y agregar `OBJ` a las importaciones de ese archivo:

```js
import { OBJ } from '../src/logica/objetos.js';
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/carrera.test.js`
Expected: FAIL en las pruebas nuevas (`c.objetos` es `undefined`).

- [ ] **Paso 3: implementar**

En `src/logica/carrera.js`:

Agregar la importación y la intención vacía:

```js
import { crearObjetos, prepararKart, usarObjeto, pasoObjetos, OBJ } from './objetos.js';

// Intención de un kart que no responde (por ejemplo, durante un trompo).
const SIN_CONTROL = { giro: 0, acelera: false, frena: false, derrapa: false };
```

En `crearCarrera`, reemplazar el `return Object.assign(k, { ... });` del `map` por:

```js
    return prepararKart(Object.assign(k, {
      id, humano, ritmo: humano ? 1 : 0.92 + 0.08 * azar(),
      vuelta: 0, cp: 0, termino: false, tiempoFinal: null, contrario: 0, puesto: i + 1,
    }));
```

y el `return` final por:

```js
  return {
    pista, karts, clase, azar, objetos: crearObjetos(pista),
    tiempo: 0, cuenta: CUENTA, estado: 'cuenta', puestos: karts.map((_, i) => i),
  };
```

En `pasoCarrera`, reemplazar el cuerpo del `c.karts.forEach((k, i) => { ... });` por:

```js
  c.karts.forEach((k, i) => {
    const sAntes = k.s;
    const intencion = k.trompo > 0 ? SIN_CONTROL : intenciones[i];
    if (intencion.usa && !k.termino) usarObjeto(c.objetos, k, c.pista, c.clase, eventos[i]);
    // Queda en el kart para que el modo ayuda y los rivales aceleren hasta la velocidad que les toca.
    k.factor = c.clase * factorVelocidad(k, valores[i], lider, mejorHumano, c.pista.largo) * (k.disco > 0 ? OBJ.discoExtra : 1);
    eventos[i].push(...pasoKart(k, intencion, c.pista, dt, k.factor));
    actualizarVueltas(k, sAntes, c.pista, eventos[i]);
    if (!k.termino && k.vuelta >= VUELTAS) {
      k.termino = true;
      k.tiempoFinal = c.tiempo;
    }
    actualizarContrario(k, c.pista, dt);
  });
  pasoObjetos(c.objetos, c.karts, c.pista, dt, c.azar, eventos);
```

- [ ] **Paso 4: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos. Si alguna prueba de tiempos de carrera o de equilibrio de `tests/pilotos.test.js` falla por los objetos (los karts ahora toman cajas, aunque todavía nadie los usa), anotar la cifra y seguir: la tarea 5 revisa el equilibrio con objetos.

- [ ] **Paso 5: commit**

```bash
git add src/logica/carrera.js tests/carrera.test.js
git commit -m "Los objetos en la carrera: usar, trompo y bola disco

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 5: rivales que usan objetos

**Archivos:**
- Modificar: `src/logica/pilotos.js`
- Probar: `tests/pilotos.test.js`

**Interfaces:**
- Consume: `diferencia` (pista); carrera con `{ pista, karts, azar }` (tarea 4).
- Produce:
  - `crearPiloto` suma `{ revision: 0, guardado: 0 }`.
  - `decidirObjeto(piloto, k, carrera, dt, azar = Math.random) → boolean`.
  - `conducir(piloto, k, pista, dt, carrera = null)` devuelve también `usa` (siempre `false` sin carrera).
  - `simularCarrera` usa objetos.

- [ ] **Paso 1: pruebas**

En `tests/pilotos.test.js`, agregar `decidirObjeto` a la importación de `../src/logica/pilotos.js` y estas pruebas antes de `describe('carrera completa simulada', ...)`:

```js
describe('rivales con objetos', () => {
  // Carrera con un niño (índice 7); todos lejos salvo los que cada prueba ubica.
  function preparar() {
    const c = crearCarrera(pista, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [7], azarConSemilla(20));
    c.estado = 'carrera';
    c.karts.forEach((k, i) => Object.assign(k, crearKart(pista, 600 + i * 30, 0)));
    return c;
  }
  const ubicar = (k, s, lateral = 0) => Object.assign(k, crearKart(pista, s, lateral));
  const decide = (c, k, azar = () => 0) => decidirObjeto(crearPiloto(azarConSemilla(3)), k, c, dt, azar);

  it('la bola disco la usa de inmediato; sin objeto o con la ruleta girando, nada', () => {
    const c = preparar();
    const k = c.karts[0];
    expect(decide(c, k)).toBe(false);
    k.objeto = 'disco';
    k.ruleta = 0.5;
    expect(decide(c, k)).toBe(false);
    k.ruleta = 0;
    expect(decide(c, k)).toBe(true);
  });

  it('el ají lo usa en las rectas y no antes de una curva cerrada', () => {
    const c = preparar();
    const k = ubicar(c.karts[0], 30);
    k.objeto = 'aji';
    expect(decide(c, k)).toBe(true);
    ubicar(k, proyectar(pista, 92, 61).s - 15);
    expect(decide(c, k)).toBe(false);
  });

  it('la calabaza la lanza si tiene un kart adelante en su línea; a un niño, solo 1 de cada 3 veces', () => {
    const c = preparar();
    const k = ubicar(c.karts[0], 100);
    k.objeto = 'calabaza';
    expect(decide(c, k)).toBe(false);
    ubicar(c.karts[1], 120);
    expect(decide(c, k)).toBe(true);
    ubicar(c.karts[1], 600);
    ubicar(c.karts[7], 120);
    expect(decide(c, k, () => 0.5)).toBe(false);
    expect(decide(c, k, () => 0.2)).toBe(true);
  });

  it('la cáscara la deja si alguien lo sigue de cerca en su línea', () => {
    const c = preparar();
    const k = ubicar(c.karts[0], 200);
    k.objeto = 'cascara';
    expect(decide(c, k)).toBe(false);
    ubicar(c.karts[2], 192, 1);
    expect(decide(c, k)).toBe(true);
  });

  it('revisa una vez por segundo y, si lo guarda más de 8 s, lo usa igual', () => {
    const c = preparar();
    const k = ubicar(c.karts[0], 100);
    k.objeto = 'calabaza';
    const piloto = crearPiloto(azarConSemilla(4));
    let usos = 0;
    let pasos = 0;
    while (!usos && pasos < 60 * 12) {
      if (decidirObjeto(piloto, k, c, dt, () => 0)) usos += 1;
      pasos += 1;
    }
    expect(pasos * dt).toBeGreaterThan(8);
    expect(pasos * dt).toBeLessThan(10);
  });

  it('conducir lleva la decisión en usa, y sin carrera nunca usa', () => {
    const c = preparar();
    const k = c.karts[0];
    k.objeto = 'disco';
    expect(conducir(crearPiloto(azarConSemilla(5)), k, pista, dt, c).usa).toBe(true);
    k.objeto = 'disco';
    expect(conducir(crearPiloto(azarConSemilla(5)), k, pista, dt).usa).toBe(false);
  });
});
```

Agregar `proyectar` ya está importado en ese archivo; si no, agregarlo a la importación de `../src/logica/pista.js`.

Reemplazar la prueba de equilibrio existente (`describe('equilibrio del modo ayuda', ...)`) por:

```js
describe('equilibrio del modo ayuda', () => {
  it('con ayuda, acelerando y usando su objeto apenas lo tienen, los niños a veces quedan entre los primeros', () => {
    const puestos = [];
    for (let semilla = 1; semilla <= 10; semilla++) {
      const azar = azarConSemilla(semilla);
      const c = crearCarrera(pista, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], [6, 7], azar);
      const pilotos = c.karts.map(() => crearPiloto(azar));
      while (c.estado !== 'fin' && c.tiempo < 400) {
        const intenciones = c.karts.map((k, i) => {
          if (c.estado !== 'carrera') return QUIETO;
          if (!k.humano || k.termino) return conducir(pilotos[i], k, pista, dt, c);
          return ayudar({ ...QUIETO, acelera: true, usa: !!k.objeto && k.ruleta === 0 }, k, pista);
        });
        pasoCarrera(c, intenciones, dt);
      }
      puestos.push(...c.karts.filter((k) => k.humano).map((k) => k.puesto));
    }
    expect(puestos.reduce((a, b) => a + b, 0) / puestos.length).toBeLessThanOrEqual(6.2);
    expect(Math.min(...puestos)).toBeLessThanOrEqual(4);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/pilotos.test.js`
Expected: FAIL en las pruebas de `rivales con objetos` (`decidirObjeto` no existe).

- [ ] **Paso 3: implementar**

En `src/logica/pilotos.js`:

`crearPiloto` pasa a:

```js
export function crearPiloto(azar = Math.random) {
  return { carril: (azar() * 2 - 1) * 3, reloj: 0, desde: null, retroceso: 0, revision: 0, guardado: 0 };
}
```

Agregar después de `velocidadPrudente`:

```js
// Una vez por segundo el rival revisa si conviene usar su objeto. Si el blanco es un niño, solo 1 de cada 3 veces.
export function decidirObjeto(piloto, k, carrera, dt, azar = Math.random) {
  if (!k.objeto || k.ruleta > 0 || k.termino) {
    piloto.guardado = 0;
    return false;
  }
  piloto.guardado += dt;
  piloto.revision -= dt;
  if (piloto.revision > 0) return false;
  piloto.revision = 1;
  if (piloto.guardado > 8) return true;
  const { pista, karts } = carrera;
  const enLinea = (o) => o !== k && !o.termino && Math.abs(o.lateral - k.lateral) < 3;
  const delante = (o) => diferencia(k.s, o.s, pista.largo);
  const adelante = karts.find((o) => enLinea(o) && delante(o) > 0 && delante(o) < 40);
  const atras = karts.find((o) => enLinea(o) && delante(o) < 0 && delante(o) > -12);
  const conCalma = (o) => !!o && (!o.humano || azar() < 1 / 3);
  if (k.objeto === 'disco') return true;
  if (k.objeto === 'aji') return velocidadPrudente(pista, k.s) === 1;
  if (k.objeto === 'calabaza') return conCalma(adelante);
  return conCalma(atras);
}
```

`conducir` pasa a:

```js
export function conducir(piloto, k, pista, dt, carrera = null) {
  const usa = carrera ? decidirObjeto(piloto, k, carrera, dt, carrera.azar) : false;
  if (piloto.retroceso > 0) {
    piloto.retroceso -= dt;
    return { ...QUIETO, frena: true, usa };
  }
  // Atascado: si en 2 s casi no avanzó por la pista, retrocede 1 s y vuelve a intentar.
  if (piloto.desde === null) piloto.desde = k.s;
  piloto.reloj += dt;
  if (piloto.reloj >= 2) {
    if (diferencia(piloto.desde, k.s, pista.largo) < 2) piloto.retroceso = 1;
    piloto.reloj = 0;
    piloto.desde = k.s;
  }
  const prudente = velocidadPrudente(pista, k.s) * KART.velMax * (k.factor ?? 1);
  return {
    giro: haciaAdelante(k, pista, piloto.carril),
    acelera: k.vel < prudente,
    frena: k.vel > prudente + 4,
    derrapa: false,
    usa,
  };
}
```

En `simularCarrera`, pasar la carrera a `conducir`:

```js
    const intenciones = c.karts.map((k, i) => (c.estado === 'carrera' ? conducir(pilotos[i], k, pista, dt, c) : QUIETO));
```

- [ ] **Paso 4: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos. Si la prueba de equilibrio o las de tiempos de carrera simulada fallan con objetos, no cambiar la prueba: revisar primero con una simulación de diagnóstico qué los frena (golpes, cajas, rivales), corregir la causa o ajustar las cifras del reparto o de `OBJ`, y registrar la decisión.

- [ ] **Paso 5: commit**

```bash
git add src/logica/pilotos.js tests/pilotos.test.js
git commit -m "Los rivales usan objetos, con calma contra los niños

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 6: dibujo de los objetos y efectos del kart

**Archivos:**
- Crear: `src/dibujo/objetos3d.js`
- Modificar: `src/dibujo/kart3d.js`, `src/dibujo/escena.js`

**Interfaces:**
- Consume: `OBJ` (objetos); estado de objetos de la carrera.
- Produce: `crearObjetos3D(estado) → { grupo, actualizar(estado, t) }`; `mundo.ponerObjetos(estado)`; `mundo.actualizar(carrera, t)` también dibuja los objetos.

- [ ] **Paso 1: objetos en 3D**

Crear `src/dibujo/objetos3d.js`:

```js
import * as THREE from 'three';
import { mate, brillo, malla } from './comun.js';

const COLORES_CAJA = [0xff4d6d, 0xffd166, 0x4cc9f0, 0x80ed99];
const cubo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
const bola = new THREE.SphereGeometry(0.7, 12, 10);
const tallo = new THREE.CylinderGeometry(0.08, 0.1, 0.35);
const ojo = new THREE.SphereGeometry(0.1, 6, 6);
const curva = new THREE.TorusGeometry(0.5, 0.18, 6, 12, Math.PI * 1.2);

function calabaza3D() {
  const g = new THREE.Group();
  const b = malla(bola, mate(0xff8c1a));
  b.scale.set(1.15, 0.9, 1.15);
  g.add(b);
  g.add(malla(tallo, mate(0x2d6a4f), 0, 0.75, 0));
  for (const z of [-0.25, 0.25]) g.add(malla(ojo, brillo(0xffd166), 0.75, 0.15, z));
  return g;
}

function cascara3D() {
  const m = malla(curva, mate(0xffe066));
  m.rotation.x = -Math.PI / 2;
  return m;
}

// Reutiliza las mallas: muestra tantas como objetos haya en la pista.
function coleccion(grupo, crear) {
  const mallas = [];
  return (cantidad) => {
    while (mallas.length < cantidad) {
      const m = crear();
      grupo.add(m);
      mallas.push(m);
    }
    mallas.forEach((m, i) => {
      m.visible = i < cantidad;
    });
    return mallas;
  };
}

// Cajas de colores que giran y flotan, calabazas que ruedan y cáscaras en el suelo.
export function crearObjetos3D(estado) {
  const grupo = new THREE.Group();
  const cajas = estado.cajas.map((c, i) => {
    const m = malla(cubo, brillo(COLORES_CAJA[i % COLORES_CAJA.length]), c.x, 1.3, -c.y);
    grupo.add(m);
    return m;
  });
  const calabazas = coleccion(grupo, calabaza3D);
  const cascaras = coleccion(grupo, cascara3D);
  return {
    grupo,
    actualizar(e, t) {
      e.cajas.forEach((c, i) => {
        const m = cajas[i];
        m.visible = c.vuelve <= 0;
        m.rotation.set(t * 0.9 + i, t * 1.5 + i, 0);
        m.position.y = 1.3 + Math.sin(t * 3 + i) * 0.2;
      });
      const mc = calabazas(e.calabazas.length);
      e.calabazas.forEach((c, i) => {
        mc[i].position.set(c.x, 0.65, -c.y);
        mc[i].rotation.y = t * 10;
      });
      const mk = cascaras(e.cascaras.length);
      e.cascaras.forEach((c, i) => {
        mk[i].position.set(c.x, 0.2, -c.y);
      });
    },
  };
}
```

- [ ] **Paso 2: efectos del kart**

En `src/dibujo/kart3d.js`, agregar la importación y las geometrías:

```js
import { OBJ } from '../logica/objetos.js';
```

```js
const COLORES_DISCO = [0xff4d6d, 0xffd166, 0x4cc9f0, 0x80ed99, 0xc77dff];
const bolaDisco = new THREE.SphereGeometry(0.4, 12, 10);
const aroDisco = new THREE.TorusGeometry(1.5, 0.1, 6, 24);
```

En `crearKart3D`, antes de `raiz.sincronizar = ...`:

```js
  const bola = malla(bolaDisco, brillo(COLORES_DISCO[0]), -0.45, 2.6, 0);
  bola.visible = false;
  cuerpo.add(bola);
  const aro = malla(aroDisco, brillo(COLORES_DISCO[1]), 0, 0.15, 0);
  aro.rotation.x = Math.PI / 2;
  aro.visible = false;
  raiz.add(aro);
```

En `raiz.sincronizar`, reemplazar la línea `cuerpo.rotation.y = k.derrape ? k.derrape.dir * 0.35 : 0;` por:

```js
    // Trompo: una vuelta completa en el dibujo; el rumbo del kart no cambia.
    if (k.trompo > 0) cuerpo.rotation.y = (1 - k.trompo / OBJ.trompo) * Math.PI * 2;
    else cuerpo.rotation.y = k.derrape ? k.derrape.dir * 0.35 : 0;
    raiz.visible = !(k.proteccion > 0 && Math.floor(t * 12) % 2 === 0);
    const disco = k.disco > 0;
    bola.visible = disco;
    aro.visible = disco;
    if (disco) {
      const n = Math.floor(t * 8);
      bola.material = brillo(COLORES_DISCO[n % COLORES_DISCO.length]);
      aro.material = brillo(COLORES_DISCO[(n + 2) % COLORES_DISCO.length]);
      bola.rotation.y = t * 4;
    }
```

- [ ] **Paso 3: objetos en el mundo**

En `src/dibujo/escena.js`, agregar `import { crearObjetos3D } from './objetos3d.js';`, y dentro de `crearMundo`, junto a `let karts = [];`:

```js
  let objetos = null;
```

Agregar al objeto que devuelve `crearMundo`:

```js
    // Cajas, calabazas y cáscaras de una carrera.
    ponerObjetos(estado) {
      if (objetos) escena.remove(objetos.grupo);
      objetos = crearObjetos3D(estado);
      escena.add(objetos.grupo);
    },
```

y en `actualizar(carrera, t)`, después de sincronizar los karts:

```js
      objetos?.actualizar(carrera.objetos, t);
```

- [ ] **Paso 4: suite y construcción**

Run: `npx vitest run && npx vite build`
Expected: PASS en todos los archivos y la construcción termina sin errores. (El dibujo se ve en el navegador en la tarea 7, cuando las pantallas llamen a `ponerObjetos`).

- [ ] **Paso 5: commit**

```bash
git add src/dibujo
git commit -m "Dibujo de cajas, calabazas y cáscaras; trompo, parpadeo y bola disco en el kart

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 7: pantalla, sonido y prueba en el navegador

**Archivos:**
- Modificar: `src/pantallas/carrera.js`, `src/pantallas/inicio.js`, `src/estilo.css`, `src/sonido/sonido.js`

**Interfaces:**
- Consume: `ICONOS`, `TIPOS` (objetos); `mundo.ponerObjetos` (tarea 6); `conducir(..., carrera)` (tarea 5); fuente con `objeto` (tarea 1).

- [ ] **Paso 1: pantalla de carrera**

En `src/pantallas/carrera.js`:

Agregar `import { ICONOS, TIPOS } from '../logica/objetos.js';`.

Al crear la carrera, agregar `mundo.ponerObjetos(carrera.objetos);` entre `ponerKarts` y `actualizar`:

```js
  mundo.ponerKarts(orden.map((id) => personajes.find((p) => p.id === id)));
  mundo.ponerObjetos(carrera.objetos);
  mundo.actualizar(carrera, 0);
```

En el HTML de cada marcador, agregar la casilla:

```js
    const m = el('div', `marcador j${j + 1}`, '<div class="puesto"></div><div class="vuelta"></div><div class="casilla"></div><div class="contrario">↩️</div>');
```

En el cálculo de intenciones, pasar la carrera a los rivales y el botón del niño:

```js
            if (j === -1 || k.termino) return conducir(pilotos[i], k, pista, PASO, carrera);
            const f = porId.get(jugadores[j].fuente);
            const propia = f ? { giro: f.giro, acelera: f.acelera, frena: f.frena, derrapa: f.derrapa, usa: f.recien.objeto } : QUIETO;
```

En la actualización de cada marcador (dentro de `humanos.forEach((i, j) => { ... })`), agregar:

```js
        const casilla = k.ruleta > 0 ? ICONOS[TIPOS[Math.floor(t * 12) % TIPOS.length]] : k.objeto ? ICONOS[k.objeto] : '';
        if (m.querySelector('.casilla').textContent !== casilla) m.querySelector('.casilla').textContent = casilla;
```

- [ ] **Paso 2: demostración del inicio**

En `src/pantallas/inicio.js`, dentro de `nuevaDemo()`, después de `mundo.ponerKarts(personajes);`:

```js
    mundo.ponerObjetos(demo.objetos);
```

y en el ciclo de la demostración, pasar la carrera a `conducir`:

```js
        pasoCarrera(demo, demo.karts.map((k, i) => conducir(pilotos[i], k, pista, PASO, demo)), PASO);
```

- [ ] **Paso 3: estilo de la casilla**

En `src/estilo.css`, agregar:

```css
.casilla { position: absolute; top: 2vh; left: 50%; transform: translateX(-50%); width: 14vh; height: 14vh; border-radius: 3vh; background: rgba(11, 16, 38, 0.75); border: 0.6vh solid #ffd166; font-size: 9vh; display: flex; align-items: center; justify-content: center; }
```

- [ ] **Paso 4: sonidos**

En `src/sonido/sonido.js`, agregar al objeto `EFECTOS`:

```js
    caja: () => [880, 1100, 1320, 1100, 1320].forEach((f, i) => tono(f, 0.07, 'triangle', 0.07, ctx.currentTime + i * 0.12)),
    listo: () => tono(1320, 0.18, 'triangle', 0.1),
    calabaza: () => tono(500, 0.25, 'sawtooth', 0.1, ctx.currentTime, 150),
    cascara: () => tono(300, 0.12, 'square', 0.08, ctx.currentTime, 200),
    golpe: () => {
      tono(700, 0.6, 'square', 0.1, ctx.currentTime, 120);
      ruido(0.2, 0.2);
    },
    disco: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, 0.12, 'square', 0.07, ctx.currentTime + i * 0.06)),
```

- [ ] **Paso 5: suite y construcción**

Run: `npx vitest run && npx vite build`
Expected: PASS en todos los archivos y la construcción termina sin errores.

- [ ] **Paso 6: carrera en el navegador con objetos**

Levantar `npx vite --port 5299 --strictPort` en segundo plano. En la carpeta con Playwright (en esta sesión, `<scratchpad>/webkit`), crear `probar-objetos.mjs`:

```js
// Dos controles simulados que aprietan X cada tanto: cajas, objetos, golpes, rendimiento y podio.
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
  if (!c) return null;
  return {
    estado: c.estado, tiempo: Math.round(c.tiempo), calabazas: c.objetos.calabazas.length, cascaras: c.objetos.cascaras.length,
    ninos: c.karts.filter((k) => k.humano).map((k) => ({ vuelta: k.vuelta, puesto: k.puesto, objeto: k.objeto, trompo: k.trompo > 0 })),
    golpeados: c.karts.filter((k) => k.trompo > 0 || k.proteccion > 0).length,
  };
});

await pagina.goto('http://localhost:5299/');
await pagina.waitForTimeout(3000);
await pulsar(0, 15);
await pulsar(0, 0);
await pulsar(0, 0);            // 🐢
await pulsar(1, 0);
await pulsar(0, 3);
await pulsar(1, 3);
await pulsar(0, 0);
await pulsar(1, 0);
await pagina.waitForTimeout(1500);
console.log('1', await pantalla());
await pagina.waitForTimeout(2000);
await fijar(0, 0, true);
await fijar(1, 0, true);
let usos = 0;
let capturaCasilla = false;
let capturaGolpe = false;
let maxObjetos = 0;
for (let i = 0; i < 200 && (await pantalla()) === 'carrera'; i++) {
  await pagina.waitForTimeout(700);
  const e = await estado();
  if (!e) continue;
  maxObjetos = Math.max(maxObjetos, e.calabazas + e.cascaras);
  if (!capturaCasilla && e.ninos.some((n) => n.objeto)) {
    await pagina.screenshot({ path: 'ole-casilla.png' });
    capturaCasilla = true;
  }
  if (!capturaGolpe && e.golpeados > 0) {
    await pagina.screenshot({ path: 'ole-golpe.png' });
    capturaGolpe = true;
  }
  for (const m of [0, 1]) {
    if (e.ninos[m].objeto) {
      await pulsar(m, 2);
      usos += 1;
    }
  }
  if (i === 20) {
    const cuadros = await pagina.evaluate(() => new Promise((listo) => {
      let n = 0; const inicio = performance.now();
      const contar = () => { n++; if (performance.now() - inicio < 4000) requestAnimationFrame(contar); else listo(n / 4); };
      requestAnimationFrame(contar);
    }));
    console.log('2 cuadros por segundo', cuadros.toFixed(1), JSON.stringify(e));
  }
}
console.log('3 objetos usados por los niños', usos, '| máximo de calabazas + cáscaras a la vez', maxObjetos, '| capturas', capturaCasilla, capturaGolpe);
await pagina.waitForTimeout(1500);
console.log('4', await pantalla());
console.log('errores:', errores.length ? errores : 'ninguno');
await navegador.close();
```

Run: `node probar-objetos.mjs`
Expected:
- `1 carrera`.
- `2 cuadros por segundo …` con un número mayor que 50 (la meta de 60 se confirma en el notebook).
- `3 objetos usados por los niños` mayor que 0, máximo de objetos a la vez mayor que 0 y las dos capturas en `true`.
- `4 podio` y `errores: ninguno`.

Revisar `ole-casilla.png` (casilla con un ícono de objeto en cada mitad, cajas de colores en la pista) y `ole-golpe.png` (un kart girando o parpadeando). Detener el servidor.

- [ ] **Paso 7: commit**

```bash
git add src
git commit -m "Casilla del objeto, uso con X, sonidos y demostración con objetos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 8: publicación

**Archivos:** ninguno.

**Interfaces:**
- Consume: la rama `paso-b` completa y revisada.

- [ ] **Paso 1: unir y probar**

Run: `git checkout main && git merge --ff-only paso-b && npx vitest run`
Expected: unión sin conflictos y PASS en todos los archivos.

- [ ] **Paso 2: publicar (con confirmación de Gonzalo)**

Run: `git push origin main`
Expected: el envío termina sin errores.

- [ ] **Paso 3: verificar**

Run: consultar `https://api.github.com/repos/chalofster/ole-kart/actions/runs?per_page=1` cada 15 s hasta que el último envío figure `completed` y `success`; luego `curl -s https://chalofster.github.io/ole-kart/` y el archivo `assets/index-*.js` que nombra.
Expected: `200`, y el `.js` contiene `🪩` y `🎃`.
