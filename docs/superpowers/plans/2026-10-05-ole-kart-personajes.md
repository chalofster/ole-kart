---
titulo: "Plan de implementación: Olé Kart, personajes de dibujo animado"
tipo: plan de implementación
fecha: 05-10-2026
estado: pendiente de revisión
---

# Olé Kart, personajes de dibujo animado: plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development o superpowers:executing-plans para implementar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para el seguimiento.

**Objetivo:** redibujar los 8 personajes con estilo de dibujo animado (cabezones, sombras planas, contorno, caras como la bailarina del Tablao) y darles gestos según lo que le pasa a su kart.

**Arquitectura:** la lógica de gestos es pura y probada (`src/logica/gestos.js`). El dibujo se apoya en dos módulos nuevos: `estilo.js` (sombras planas, contorno y unión de piezas por color) y `caras.js` (caras dibujadas en un lienzo). Cada personaje se arma con `armarPersonaje` desde su ficha. Hay un punto de control con Gonzalo después de la bailarina.

**Tecnologías:** las del proyecto: Three.js 0.186 (`MeshToonMaterial`, `mergeGeometries` de `three/addons`), Vite 8.3, Vitest 5.0, Canvas 2D.

**Diseño:** `docs/superpowers/specs/2026-10-05-ole-kart-personajes-design.md`. Leerlo antes de ejecutar.

## Restricciones globales

- Raíz: `C:\Users\Gfigueroa\OleKart`. En PowerShell `npm` está bloqueado: usar la herramienta Bash.
- Trabajar en la rama `personajes`, creada desde `main`.
- `src/logica/` no importa Three.js ni usa el navegador.
- Los personajes miran hacia +x local; su origen es el punto de apoyo (asiento). Three.js usa (x, altura, -y).
- Ningún personaje mide más de 1,9 unidades sobre su punto de apoyo.
- Sin archivos de imagen: caras y texturas se dibujan en el código.
- Personajes originales: el bailarín de la noche sin sombrero ni guante, sin nombre, cara, música ni pasos de Michael Jackson.
- Las pruebas de Vitest corren en Node (sin navegador): todo módulo de dibujo debe poder armarse sin `document`.
- **Punto de control:** después de la tarea 6 se muestran capturas a Gonzalo y no se sigue sin su visto bueno.
- Cada `commit` termina con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Publicar (unir a `main` y hacer `push`) exige la confirmación de Gonzalo.

## Foco de revisión

1. **La cabeza grande tapa el camino en la cámara de carrera con pantalla dividida** → la ruta adelante debe verse. Captura `p-carrera.png` en las tareas 6 y 9.
2. **Cara espejada, al revés o corrida** → ojos sobre la boca, centrados, mejillas a los lados. Captura `p-caras.png` en las tareas 6 y 9.
3. **Gestos o ruedas que se siguen moviendo en pausa** → dos capturas en pausa deben ser idénticas. Comprobación en las tareas 6 y 9.
4. **Rendimiento con personajes de más piezas** → al menos 55 cuadros por segundo y no más de 1,5 veces las llamadas de dibujo de la línea base. Medición en las tareas 1, 6 y 9.
5. **Personajes nuevos y antiguos mezclados durante la transición** (tareas 3 a 8) → animar uno antiguo no falla. Prueba en la tarea 3.

## Estructura de archivos

| Archivo | Cambio |
|---|---|
| `src/logica/gestos.js` | Nuevo: cara y movimiento según el estado del kart; parpadeo; inclinación |
| `src/dibujo/estilo.js` | Nuevo: material de sombras planas, contorno, `armarParte` |
| `src/dibujo/caras.js` | Nuevo: caras dibujadas en un lienzo, materiales y parche de la cara |
| `src/dibujo/personajes/esqueleto.js` | Nuevo: figuras, `pieza`, `brazoSimple`, `armarPersonaje` |
| `src/dibujo/personajes/personas.js` | Nuevo: bailarina (`flamenca`), bailarín, pianista |
| `src/dibujo/personajes/animales.js` | Nuevo: gato, pájaro, torito |
| `src/dibujo/personajes/fantasia.js` | Nuevo: calabacita, fantasmín |
| `src/dibujo/personajes3d.js` | `crearPersonaje`, `animarPiloto`, `animarPodio` |
| `src/logica/personajes.js` | Fichas con los detalles nuevos |
| `src/dibujo/kart3d.js`, `escena.js`, `vitrina.js`, `podio3d.js` | Estilo nuevo y gestos |
| `src/pantallas/carrera.js`, `inicio.js`, `seleccion.js` | Reloj de dibujo, eventos para los gestos, salto al elegir |
| `src/main.js` | En desarrollo, expone `THREE` para el muestrario de caras |

---

## Tarea 1: gestos

**Archivos:**
- Crear: `src/logica/gestos.js`
- Probar: `tests/gestos.test.js`

**Interfaces:**
- Produce:
  - `CARAS = ['normal', 'decidida', 'feliz', 'sorpresa', 'mareo']`, `GESTO` (constantes).
  - `crearGestos(azar = Math.random) → { azar, feliz, cerrado, hastaParpadeo, inclinacion, rumbo }`.
  - `alegrar(g, segundos = 1)`.
  - `caraDelKart(k, g) → cara`.
  - `pasoGestos(g, k, eventos, dt) → { cara, ojosCerrados, inclinacion }`; con `dt = 0` nada cambia.

- [ ] **Paso 1: rama y línea base de rendimiento**

Run: `git checkout -b personajes && git branch --show-current`
Expected: `Switched to a new branch 'personajes'` y `personajes`.

Levantar `npx vite --port 5299 --strictPort` en segundo plano. En la carpeta con Playwright (en esta sesión, `<scratchpad>/webkit`), crear `medir.mjs`:

```js
// Mide cuadros por segundo y llamadas de dibujo por vista en una carrera de 2 jugadores a 🐢 con ayuda.
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

await pagina.goto('http://localhost:5299/');
await pagina.waitForTimeout(3000);
// 2 jugadores, 🐢, el control 2 se une, ayuda para ambos y los dos confirman.
for (const [m, b] of [[0, 15], [0, 0], [0, 0], [1, 0], [0, 3], [1, 3], [0, 0], [1, 0]]) await pulsar(m, b);
await pagina.waitForTimeout(5000);
await fijar(0, 0, true);
await fijar(1, 0, true);
await pagina.waitForTimeout(6000);
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
console.log('pantalla', await pantalla(), '| cuadros por segundo', r.cuadros.toFixed(1), '| llamadas de dibujo por vista', r.llamadas);
console.log('errores:', errores.length ? errores : 'ninguno');
await navegador.close();
```

Run: `node medir.mjs`
Expected: `pantalla carrera | cuadros por segundo …` y `errores: ninguno`. Anotar en el registro de avance la línea base (cuadros por segundo y llamadas de dibujo por vista). Detener el servidor.

- [ ] **Paso 2: pruebas**

Crear `tests/gestos.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearGestos, pasoGestos, caraDelKart, alegrar, GESTO, CARAS } from '../src/logica/gestos.js';

const dt = 1 / 60;
const kart = (cambios = {}) => ({ trompo: 0, enAire: false, turbo: 0, disco: 0, derrape: null, rumbo: 0, ...cambios });
const DERRAPE = { dir: 1, carga: 0 };
// Avanza los segundos indicados (los eventos llegan en el primer paso) y devuelve el último gesto.
function avanzar(g, k, segundos, eventos = []) {
  let gesto = null;
  for (let i = 0; i < Math.round(segundos / dt); i++) gesto = pasoGestos(g, k, i === 0 ? eventos : [], dt);
  return gesto;
}

describe('cara según lo que le pasa al kart', () => {
  const g = crearGestos(() => 0.5);

  it('hay cinco caras', () => {
    expect(CARAS).toEqual(['normal', 'decidida', 'feliz', 'sorpresa', 'mareo']);
  });

  it('cada situación tiene su cara', () => {
    expect(caraDelKart(kart(), g)).toBe('normal');
    expect(caraDelKart(kart({ derrape: DERRAPE }), g)).toBe('decidida');
    expect(caraDelKart(kart({ turbo: 0.5 }), g)).toBe('feliz');
    expect(caraDelKart(kart({ disco: 3 }), g)).toBe('feliz');
    expect(caraDelKart(kart({ enAire: true }), g)).toBe('sorpresa');
    expect(caraDelKart(kart({ trompo: 0.5 }), g)).toBe('mareo');
  });

  it('si pasan varias cosas a la vez, gana la más importante', () => {
    expect(caraDelKart(kart({ trompo: 0.5, enAire: true, turbo: 1 }), g)).toBe('mareo');
    expect(caraDelKart(kart({ enAire: true, turbo: 1, derrape: DERRAPE }), g)).toBe('sorpresa');
    expect(caraDelKart(kart({ turbo: 1, derrape: DERRAPE }), g)).toBe('feliz');
  });
});

describe('cara feliz', () => {
  it('al romper una caja dura 1 s y después vuelve la cara de antes', () => {
    const g = crearGestos(() => 1);
    const derrapando = kart({ derrape: DERRAPE });
    expect(avanzar(g, derrapando, 0.9, ['caja']).cara).toBe('feliz');
    expect(avanzar(g, derrapando, 0.15).cara).toBe('decidida');
  });

  it('alegrar la pone por el tiempo pedido', () => {
    const g = crearGestos(() => 1);
    alegrar(g, 0.5);
    expect(avanzar(g, kart(), 0.4).cara).toBe('feliz');
    expect(avanzar(g, kart(), 0.15).cara).toBe('normal');
  });
});

describe('parpadeo', () => {
  it('cierra los ojos 0,12 s; el primero a los 2 s si el azar da 0', () => {
    const g = crearGestos(() => 0);
    expect(avanzar(g, kart(), 1.9).ojosCerrados).toBe(false);
    expect(avanzar(g, kart(), 0.15).ojosCerrados).toBe(true);
    expect(avanzar(g, kart(), 0.15).ojosCerrados).toBe(false);
  });

  it('a lo más cada 5 s', () => {
    const g = crearGestos(() => 1);
    expect(avanzar(g, kart(), 4.9).ojosCerrados).toBe(false);
    expect(avanzar(g, kart(), 0.15).ojosCerrados).toBe(true);
  });

  it('solo se ve con la cara normal', () => {
    const g = crearGestos(() => 0);
    expect(avanzar(g, kart({ turbo: 1 }), 2.05).ojosCerrados).toBe(false);
  });
});

describe('pausa', () => {
  it('sin avance del reloj, la cara, el parpadeo y la inclinación no cambian', () => {
    const g = crearGestos(() => 0);
    avanzar(g, kart(), 2.05);
    const antes = { ...g };
    for (let i = 0; i < 100; i++) {
      expect(pasoGestos(g, kart({ rumbo: 1 }), ['caja'], 0)).toEqual({ cara: 'normal', ojosCerrados: true, inclinacion: antes.inclinacion });
    }
    expect(g).toEqual(antes);
  });
});

describe('inclinación de la cabeza', () => {
  it('se inclina hacia el lado de la curva, como máximo 15°', () => {
    expect(GESTO.inclinacionMax).toBeCloseTo((15 * Math.PI) / 180, 9);
    for (const lado of [1, -1]) {
      const g = crearGestos(() => 0.5);
      const k = kart();
      for (let i = 0; i < 120; i++) {
        k.rumbo += lado * 0.03;
        pasoGestos(g, k, [], dt);
      }
      expect(Math.sign(g.inclinacion)).toBe(lado);
      expect(Math.abs(g.inclinacion)).toBeLessThanOrEqual(GESTO.inclinacionMax);
    }
  });

  it('en una recta vuelve al centro', () => {
    const g = crearGestos(() => 0.5);
    const k = kart();
    for (let i = 0; i < 60; i++) {
      k.rumbo += 0.03;
      pasoGestos(g, k, [], dt);
    }
    avanzar(g, k, 1);
    expect(Math.abs(g.inclinacion)).toBeLessThan(0.01);
  });
});
```

- [ ] **Paso 3: verificar que fallan**

Run: `npx vitest run tests/gestos.test.js`
Expected: FAIL. No existe `src/logica/gestos.js`.

- [ ] **Paso 4: escribir los gestos**

Crear `src/logica/gestos.js`:

```js
import { diferenciaAngular } from './pista.js';

// Caras de los personajes, de la menos a la más importante.
export const CARAS = ['normal', 'decidida', 'feliz', 'sorpresa', 'mareo'];
export const GESTO = { feliz: 1, parpadeo: 0.12, parpadeoMin: 2, parpadeoMax: 5, inclinacionMax: (15 * Math.PI) / 180 };

const entreParpadeos = (azar) => GESTO.parpadeoMin + (GESTO.parpadeoMax - GESTO.parpadeoMin) * azar();

export function crearGestos(azar = Math.random) {
  return { azar, feliz: 0, cerrado: 0, hastaParpadeo: entreParpadeos(azar), inclinacion: 0, rumbo: null };
}

// Cara feliz por un rato: al romper una caja o al elegir el personaje.
export function alegrar(g, segundos = GESTO.feliz) {
  g.feliz = Math.max(g.feliz, segundos);
}

// Si pasan varias cosas a la vez, gana la de más arriba.
export function caraDelKart(k, g) {
  if (k.trompo > 0) return 'mareo';
  if (k.enAire) return 'sorpresa';
  if (k.turbo > 0 || k.disco > 0 || g.feliz > 0) return 'feliz';
  if (k.derrape) return 'decidida';
  return 'normal';
}

// Avanza los gestos de un kart. Con dt = 0 (pausa) nada cambia.
export function pasoGestos(g, k, eventos, dt) {
  if (dt > 0) {
    if (eventos.includes('caja')) alegrar(g);
    g.feliz = Math.max(0, g.feliz - dt);
    g.cerrado = Math.max(0, g.cerrado - dt);
    g.hastaParpadeo -= dt;
    if (g.hastaParpadeo <= 0) {
      g.cerrado = GESTO.parpadeo;
      g.hastaParpadeo = entreParpadeos(g.azar);
    }
    // La cabeza se inclina hacia el lado al que gira el kart (positivo: a la izquierda), sin saltos.
    const giro = g.rumbo === null ? 0 : diferenciaAngular(g.rumbo, k.rumbo) / dt;
    g.rumbo = k.rumbo;
    const objetivo = Math.max(-GESTO.inclinacionMax, Math.min(GESTO.inclinacionMax, giro * 0.2));
    g.inclinacion += (objetivo - g.inclinacion) * Math.min(1, dt * 8);
  }
  const cara = caraDelKart(k, g);
  return { cara, ojosCerrados: cara === 'normal' && g.cerrado > 0, inclinacion: g.inclinacion };
}
```

- [ ] **Paso 5: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 6: commit**

```bash
git add src/logica/gestos.js tests/gestos.test.js
git commit -m "Gestos de los personajes según lo que le pasa al kart

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 2: estilo de dibujo animado y caras

**Archivos:**
- Crear: `src/dibujo/estilo.js`, `src/dibujo/caras.js`
- Probar: `tests/estilo.test.js`

**Interfaces:**
- Consume: `CARAS` (tarea 1).
- Produce:
  - `estilo.js`: `TONOS` (textura de 3 tonos), `dibujo(color) → MeshToonMaterial` (uno por color), `CONTORNO` (material), `armarParte(piezas) → THREE.Group` con `porColor: Map<color, Mesh>`. Pieza: `{ geo, color, pos: [x, y, z], rot?: [x, y, z], esc?: número | [x, y, z], contorno?: boolean }`.
  - `caras.js`: `materialCara(cara, ojosCerrados = false) → material` (uno por combinación), `geometriaCareta(radio)`, `dibujarCara(g, cara, ojosCerrados)` sobre un contexto 2D de 256 × 256.

- [ ] **Paso 1: pruebas**

Crear `tests/estilo.test.js`:

```js
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { dibujo, armarParte, CONTORNO } from '../src/dibujo/estilo.js';
import { materialCara, dibujarCara } from '../src/dibujo/caras.js';
import { CARAS } from '../src/logica/gestos.js';

describe('sombras planas', () => {
  it('un material de 3 tonos por color, que se reutiliza', () => {
    const m = dibujo(0xd62828);
    expect(m).toBeInstanceOf(THREE.MeshToonMaterial);
    expect(m.gradientMap.image.width).toBe(3);
    expect(m.color.getHex()).toBe(0xd62828);
    expect(dibujo(0xd62828)).toBe(m);
  });

  it('el contorno se pinta por dentro de la forma inflada', () => {
    expect(CONTORNO.side).toBe(THREE.BackSide);
  });
});

describe('armar una parte', () => {
  it('junta las piezas en una malla por color y un contorno, con su posición y tamaño', () => {
    const parte = armarParte([
      { geo: new THREE.BoxGeometry(1, 1, 1), color: 0xff0000, pos: [0, 2, 0] },
      { geo: new THREE.SphereGeometry(1, 8, 6), color: 0xff0000, pos: [3, 0, 0], esc: [0.5, 1, 1] },
      { geo: new THREE.SphereGeometry(0.2, 6, 4), color: 0x00ff00, pos: [0, 0, 0], contorno: false },
    ]);
    expect(parte.children).toHaveLength(3);
    const rojo = parte.porColor.get(0xff0000);
    expect(rojo.material).toBe(dibujo(0xff0000));
    const caja = new THREE.Box3().setFromObject(rojo);
    expect(caja.max.y).toBeCloseTo(2.5, 5);
    expect(caja.max.x).toBeCloseTo(3.5, 5);
    const contorno = parte.children.find((m) => m.material === CONTORNO);
    expect(contorno.geometry.attributes.position.count).toBe(rojo.geometry.attributes.position.count);
  });
});

describe('caras', () => {
  it('un material por cara y por ojos cerrados, reutilizado; sin navegador queda invisible', () => {
    for (const cara of CARAS) {
      const m = materialCara(cara);
      expect(materialCara(cara, false)).toBe(m);
      expect(m.transparent).toBe(true);
    }
    expect(materialCara('normal', true)).not.toBe(materialCara('normal', false));
    expect(materialCara('feliz').opacity).toBe(0);
  });

  it('cada cara se dibuja distinta, y los ojos cerrados también', () => {
    const ordenes = (cara, cerrados = false) => {
      const lista = [];
      const g = new Proxy({}, {
        get: (_, nombre) => (...args) => lista.push(`${String(nombre)}(${args.length})`),
        set: () => true,
      });
      dibujarCara(g, cara, cerrados);
      return lista.join(' ');
    };
    expect(new Set(CARAS.map((c) => ordenes(c))).size).toBe(CARAS.length);
    expect(ordenes('normal', true)).not.toBe(ordenes('normal', false));
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/estilo.test.js`
Expected: FAIL. No existen `src/dibujo/estilo.js` ni `src/dibujo/caras.js`.

- [ ] **Paso 3: escribir el estilo**

Crear `src/dibujo/estilo.js`:

```js
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Tres tonos planos, como en los dibujos animados: sombra, medio y luz.
export const TONOS = new THREE.DataTexture(new Uint8Array([80, 170, 255]), 3, 1, THREE.RedFormat);
TONOS.minFilter = THREE.NearestFilter;
TONOS.magFilter = THREE.NearestFilter;
TONOS.needsUpdate = true;

const materiales = new Map();

export function dibujo(color) {
  if (!materiales.has(color)) materiales.set(color, new THREE.MeshToonMaterial({ color, gradientMap: TONOS }));
  return materiales.get(color);
}

// Contorno: la misma forma inflada un poco hacia afuera y pintada solo por dentro, en café casi negro.
const GROSOR_CONTORNO = 0.035;
export const CONTORNO = new THREE.MeshBasicMaterial({ color: 0x2b1a12, side: THREE.BackSide });
CONTORNO.onBeforeCompile = (shader) => {
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `vec3 transformed = vec3( position ) + normal * ${GROSOR_CONTORNO.toFixed(3)};`,
  );
};

// Une las piezas de una parte del cuerpo: una malla por color y un solo contorno para todas.
// Pieza: { geo, color, pos: [x, y, z], rot: [x, y, z], esc: número o [x, y, z], contorno: false para detalles chicos }.
export function armarParte(piezas) {
  const grupo = new THREE.Group();
  const porColor = new Map();
  const conContorno = [];
  const matriz = new THREE.Matrix4();
  for (const p of piezas) {
    const esc = typeof p.esc === 'number' ? [p.esc, p.esc, p.esc] : p.esc ?? [1, 1, 1];
    matriz.compose(
      new THREE.Vector3(...p.pos),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rot ?? [0, 0, 0]))),
      new THREE.Vector3(...esc),
    );
    const geo = p.geo.clone().applyMatrix4(matriz);
    if (!porColor.has(p.color)) porColor.set(p.color, []);
    porColor.get(p.color).push(geo);
    if (p.contorno !== false) conContorno.push(geo);
  }
  grupo.porColor = new Map();
  for (const [color, geos] of porColor) {
    const malla = new THREE.Mesh(mergeGeometries(geos), dibujo(color));
    grupo.add(malla);
    grupo.porColor.set(color, malla);
  }
  if (conContorno.length) grupo.add(new THREE.Mesh(mergeGeometries(conContorno), CONTORNO));
  return grupo;
}
```

- [ ] **Paso 4: escribir las caras**

Crear `src/dibujo/caras.js`:

```js
import * as THREE from 'three';
import { TONOS } from './estilo.js';

// Caras al estilo de la bailarina del Tablao: ojos ovalados con brillo, cejas, mejillas rosadas y boca.
// Se dibujan en un lienzo transparente de 256 × 256 que cubre el frente de la cabeza.
const TAM = 256;
const OSCURO = '#2b1a12';
const BOCA = '#8d1b1b';
const LENGUA = '#f08080';
const MEJILLA = 'rgba(240, 128, 128, 0.55)';
const OJOS_X = [88, 168];
const OJOS_Y = 112;

function circulo(g, x, y, r, color) {
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

function ovalo(g, x, y, rx, ry, color) {
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function trazo(g, color, ancho, dibujar) {
  g.strokeStyle = color;
  g.lineWidth = ancho;
  g.lineCap = 'round';
  g.beginPath();
  dibujar();
  g.stroke();
}

export function dibujarCara(g, cara, cerrados) {
  g.clearRect(0, 0, TAM, TAM);
  for (const x of [64, 192]) circulo(g, x, 150, 16, MEJILLA);
  // Cejas: la sorpresa las sube; la decidida baja la punta de adentro.
  const subir = cara === 'sorpresa' ? -14 : 0;
  const fruncir = cara === 'decidida' ? 10 : 0;
  for (const x of OJOS_X) {
    const centro = Math.sign(128 - x);
    trazo(g, OSCURO, 6, () => {
      g.moveTo(x - centro * 18, 78 + subir);
      g.lineTo(x + centro * 18, 78 + subir + fruncir);
    });
  }
  for (const x of OJOS_X) {
    if (cara === 'mareo') {
      trazo(g, OSCURO, 4, () => {
        for (let a = 0; a <= Math.PI * 4; a += 0.2) g.lineTo(x + Math.cos(a) * (2 + a * 1.3), OJOS_Y + Math.sin(a) * (2 + a * 1.3));
      });
    } else if (cerrados) {
      trazo(g, OSCURO, 5, () => g.arc(x, OJOS_Y - 6, 14, 0.15 * Math.PI, 0.85 * Math.PI));
    } else {
      const grande = cara === 'sorpresa' ? 1.3 : 1;
      const alto = cara === 'decidida' ? 0.75 : 1;
      ovalo(g, x, OJOS_Y, 13 * grande, 19 * grande * alto, OSCURO);
      circulo(g, x - 4 * grande, OJOS_Y - 7 * grande * alto, 5 * grande, '#ffffff');
    }
  }
  if (cara === 'feliz') {
    g.fillStyle = BOCA;
    g.beginPath();
    g.arc(128, 150, 26, 0, Math.PI);
    g.closePath();
    g.fill();
    g.fillStyle = LENGUA;
    g.beginPath();
    g.arc(128, 164, 11, 0, Math.PI);
    g.fill();
  } else if (cara === 'sorpresa') {
    ovalo(g, 128, 164, 12, 16, BOCA);
  } else if (cara === 'mareo') {
    trazo(g, BOCA, 6, () => {
      for (let x = 100; x <= 156; x += 2) g.lineTo(x, 162 + Math.sin((x - 100) / 6) * 5);
    });
  } else if (cara === 'decidida') {
    trazo(g, BOCA, 7, () => {
      g.moveTo(110, 160);
      g.lineTo(146, 156);
    });
    circulo(g, 144, 165, 7, LENGUA);
  } else {
    trazo(g, BOCA, 7, () => g.arc(128, 146, 22, 0.2 * Math.PI, 0.8 * Math.PI));
  }
}

const materiales = new Map();

// Sin navegador (pruebas en Node) no hay lienzo: el material existe pero queda invisible.
export function materialCara(cara, ojosCerrados = false) {
  const clave = `${cara}-${ojosCerrados}`;
  if (!materiales.has(clave)) {
    let mapa = null;
    if (typeof document !== 'undefined') {
      const lienzo = document.createElement('canvas');
      lienzo.width = TAM;
      lienzo.height = TAM;
      dibujarCara(lienzo.getContext('2d'), cara, ojosCerrados);
      mapa = new THREE.CanvasTexture(lienzo);
      mapa.colorSpace = THREE.SRGBColorSpace;
    }
    materiales.set(clave, new THREE.MeshToonMaterial({ map: mapa, transparent: true, opacity: mapa ? 1 : 0, gradientMap: TONOS }));
  }
  return materiales.get(clave);
}

// Parche del frente de la cabeza (mirando a +x): 60° a cada lado y 45° arriba y abajo.
export function geometriaCareta(radio) {
  return new THREE.SphereGeometry(radio * 1.012, 24, 16, Math.PI - Math.PI / 3, (2 * Math.PI) / 3, Math.PI / 4, Math.PI / 2);
}
```

- [ ] **Paso 5: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 6: commit**

```bash
git add src/dibujo/estilo.js src/dibujo/caras.js tests/estilo.test.js
git commit -m "Estilo de dibujo animado: sombras planas, contorno y caras dibujadas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 3: esqueleto de los personajes y la bailarina

**Archivos:**
- Crear: `src/dibujo/personajes/esqueleto.js`, `src/dibujo/personajes/personas.js`
- Modificar: `src/dibujo/personajes3d.js`, `src/logica/personajes.js`
- Probar: `tests/personajes3d.test.js`, `tests/personajes.test.js`

**Interfaces:**
- Consume: `armarParte` (tarea 2), `materialCara`, `geometriaCareta` (tarea 2).
- Produce:
  - `esqueleto.js`: figuras `esfera`, `casquete`, `cono`, `cilindro`, `mitadCilindro`, `mitadDisco`, `caja`, `aro`; `pieza(geo, color, pos, extra)`; `brazoSimple(manga, brazo, mano)`; `armarPersonaje({ cuerpo, cabeza: { centro, radio, escala?, piezas }, brazos: { hombros, piezas }, extras?, asiento = 0.75, flota = false, alas = false })`.
  - Un personaje nuevo es un `THREE.Group` con `rebote`, `cabeza`, `careta`, `brazos` (2), `extras` (`{ cola?, nota? }`, cada uno con `baseY`), `asiento`, `flota`, `alas`.
  - `personajes3d.js`: `crearPersonaje(cuerpo)`, `ponerCara(p, cara, ojosCerrados)`, `animarPiloto(p, gesto, t)`, `animarPodio(p, puesto, t)` (puesto 0, 1 o 2). Con un personaje antiguo (sin `careta`) las dos animaciones no hacen nada.
  - Ficha de la bailarina: `cuerpo.tipo = 'flamenca'`.

- [ ] **Paso 1: pruebas**

Crear `tests/personajes3d.test.js`:

```js
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { PERSONAJES } from '../src/logica/personajes.js';
import { crearPersonaje, animarPiloto, animarPodio } from '../src/dibujo/personajes3d.js';
import { materialCara } from '../src/dibujo/caras.js';
import { CARAS } from '../src/logica/gestos.js';

// Personajes que ya tienen el estilo nuevo.
const NUEVOS = ['bailarina'];
const alto = (o) => new THREE.Box3().setFromObject(o).max.y;
const centro = (o) => {
  o.updateWorldMatrix(true, true);
  return new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
};
const gesto = (cara, ojosCerrados = false) => ({ cara, ojosCerrados, inclinacion: 0 });

describe('personajes en 3D', () => {
  it('los 8 se arman desde su ficha y ninguno mide más de 1,9 sobre su punto de apoyo', () => {
    for (const f of PERSONAJES) expect(alto(crearPersonaje(f.cuerpo))).toBeLessThanOrEqual(1.9);
  });

  it('los que todavía tienen el dibujo simple no fallan al animarse', () => {
    const antiguo = crearPersonaje(PERSONAJES.find((p) => !NUEVOS.includes(p.id)).cuerpo);
    expect(() => {
      animarPiloto(antiguo, gesto('mareo'), 1);
      animarPodio(antiguo, 0, 1);
    }).not.toThrow();
  });

  for (const id of NUEVOS) {
    const ficha = PERSONAJES.find((p) => p.id === id);

    it(`${id}: cara dibujada, dos brazos y cabeza grande`, () => {
      const p = crearPersonaje(ficha.cuerpo);
      expect(p.careta.material).toBe(materialCara('normal', false));
      expect(p.brazos).toHaveLength(2);
      const cabeza = new THREE.Box3().setFromObject(p.cabeza);
      expect((cabeza.max.y - cabeza.min.y) / alto(p)).toBeGreaterThan(0.4);
    });

    it(`${id}: pone cada cara y cierra los ojos`, () => {
      const p = crearPersonaje(ficha.cuerpo);
      for (const cara of CARAS) {
        animarPiloto(p, gesto(cara), 0.5);
        expect(p.careta.material).toBe(materialCara(cara, false));
      }
      animarPiloto(p, gesto('normal', true), 0.5);
      expect(p.careta.material).toBe(materialCara('normal', true));
    });

    it(`${id}: maneja con las manos adelante y en el aire sube los brazos`, () => {
      const p = crearPersonaje(ficha.cuerpo);
      const hombro = p.brazos[0].position.clone();
      animarPiloto(p, gesto('normal'), 0);
      expect(centro(p.brazos[0]).x).toBeGreaterThan(hombro.x + 0.1);
      animarPiloto(p, gesto('sorpresa'), 0);
      expect(centro(p.brazos[0]).y).toBeGreaterThan(hombro.y + 0.1);
    });
  }
});
```

En `tests/personajes.test.js`, cambiar la lista de tipos y la prueba de la bailarina:

```js
const TIPOS = ['flamenca', 'persona', 'gato', 'pajaro', 'toro', 'calabaza', 'fantasma'];
```

```js
  it('la bailarina lleva vestido rojo de lunares, mantón y peineta; el bailarín, chaqueta roja con franjas negras', () => {
    const [bailarina, bailarin] = PERSONAJES;
    expect(bailarina.cuerpo).toMatchObject({ tipo: 'flamenca', vestido: 0xd62828, lunares: 0xffffff, manton: 0xfff1d0, peineta: 0x8b4a2b });
    expect(bailarin.cuerpo.chaqueta).toEqual({ color: 0xc1121f, franjas: 0x111111 });
  });
```

(La prueba anterior `'la bailarina lleva falda con lunares y el bailarín, chaqueta roja con franjas negras'` se reemplaza por esta).

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/personajes3d.test.js tests/personajes.test.js`
Expected: FAIL: la bailarina no tiene `careta` y su ficha no es `flamenca`.

- [ ] **Paso 3: esqueleto**

Crear `src/dibujo/personajes/esqueleto.js`:

```js
import * as THREE from 'three';
import { armarParte } from '../estilo.js';
import { materialCara, geometriaCareta } from '../caras.js';

// Figuras simples para armar personajes.
export const esfera = (r) => new THREE.SphereGeometry(r, 16, 12);
// Media esfera de arriba: pelo sobre la cabeza.
export const casquete = (r) => new THREE.SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
export const cono = (r, alto, lados = 12) => new THREE.ConeGeometry(r, alto, lados);
export const cilindro = (arriba, abajo, alto, lados = 12) => new THREE.CylinderGeometry(arriba, abajo, alto, lados);
// Media caña que cubre solo la espalda (x negativo): pelo largo.
export const mitadCilindro = (arriba, abajo, alto) => new THREE.CylinderGeometry(arriba, abajo, alto, 16, 1, true, Math.PI, Math.PI);
// Medio disco (x positivo); girado [0, 0, π/2] queda parado, con la mitad de arriba: peineta.
export const mitadDisco = (r, grosor) => new THREE.CylinderGeometry(r, r, grosor, 16, 1, false, 0, Math.PI);
export const caja = (x, y, z) => new THREE.BoxGeometry(x, y, z);
export const aro = (radio, grosor, arco = Math.PI * 2) => new THREE.TorusGeometry(radio, grosor, 8, 24, arco);
export const pieza = (geo, color, pos, extra = {}) => ({ geo, color, pos, ...extra });

// Brazo que cuelga del hombro: manga abullonada, brazo y mano como bolita.
export function brazoSimple(manga, brazo, mano) {
  return [
    pieza(esfera(0.11), manga, [0, -0.04, 0]),
    pieza(cilindro(0.055, 0.055, 0.3), brazo, [0, -0.2, 0]),
    pieza(esfera(0.08), mano, [0, -0.38, 0]),
  ];
}

// Personaje mirando a +x, con su punto de apoyo en el origen: cuerpo, cabeza con cara,
// dos brazos y partes extra que se mueven. Todo cuelga de "rebote", que salta o se inclina.
export function armarPersonaje({ cuerpo, cabeza, brazos, extras = {}, asiento = 0.75, flota = false, alas = false }) {
  const p = new THREE.Group();
  const rebote = new THREE.Group();
  p.add(rebote);
  rebote.add(armarParte(cuerpo));
  const cab = new THREE.Group();
  cab.position.set(...cabeza.centro);
  cab.add(armarParte(cabeza.piezas));
  const careta = new THREE.Mesh(geometriaCareta(cabeza.radio), materialCara('normal'));
  if (cabeza.escala) careta.scale.set(...cabeza.escala);
  cab.add(careta);
  rebote.add(cab);
  const hombros = brazos.hombros.map((pos) => {
    const h = new THREE.Group();
    h.position.set(...pos);
    h.add(armarParte(brazos.piezas));
    rebote.add(h);
    return h;
  });
  const partes = {};
  for (const [nombre, extra] of Object.entries(extras)) {
    const g = new THREE.Group();
    g.position.set(...extra.pos);
    g.baseY = extra.pos[1];
    g.add(armarParte(extra.piezas));
    rebote.add(g);
    partes[nombre] = g;
  }
  return Object.assign(p, { rebote, cabeza: cab, careta, brazos: hombros, extras: partes, asiento, flota, alas });
}
```

- [ ] **Paso 4: la bailarina**

Crear `src/dibujo/personajes/personas.js` (solo exporta constructores de personajes):

```js
import { armarPersonaje, pieza, esfera, cono, cilindro, aro, casquete, mitadDisco, brazoSimple } from './esqueleto.js';

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
```

- [ ] **Paso 5: animación de los personajes**

En `src/dibujo/personajes3d.js`, reemplazar el comienzo del archivo (las importaciones) por:

```js
import * as THREE from 'three';
import { mate, malla } from './comun.js';
import { materialCara } from './caras.js';
import * as personas from './personajes/personas.js';

// Personajes con el estilo de dibujo animado; los demás usan todavía el dibujo simple de más abajo.
const NUEVOS = { flamenca: personas.flamenca };

export function ponerCara(p, cara, ojosCerrados = false) {
  p.careta.material = materialCara(cara, ojosCerrados);
}

// Brazo que cuelga del hombro, girado según la postura. lado: +1 o -1 según el costado.
function posarBrazo(b, pose, t) {
  const lado = b.position.z >= 0 ? 1 : -1;
  if (pose === 'arriba') b.rotation.set(lado * 0.35, 0, Math.PI);
  else if (pose === 'aletear') b.rotation.set(-lado * (0.9 + Math.sin(t * 25) * 0.5), 0, 0);
  else if (pose === 'aplauso') b.rotation.set(0, lado * (0.5 + Math.sin(t * 14) * 0.35), 1.4);
  else if (pose === 'baile') b.rotation.set(lado * 0.3, 0, Math.PI * 0.85 + Math.sin(t * 6 + lado) * 0.35);
  else b.rotation.set(0, lado * 0.15, 1.3);
}

function moverExtras(p, t) {
  const { cola, nota } = p.extras;
  if (cola) cola.rotation.x = Math.sin(t * 4) * 0.4;
  if (nota) {
    nota.position.y = nota.baseY + Math.sin(t * 3) * 0.05;
    nota.rotation.y = t * 1.5;
  }
}

// Manejando: manos al volante y cabeza que se inclina en las curvas; en el aire, brazos arriba;
// feliz, rebota (y el pájaro aletea); decidida, se inclina hacia la curva; mareada, la cabeza se bambolea.
export function animarPiloto(p, gesto, t) {
  if (!p.careta) return;
  const { cara, inclinacion } = gesto;
  ponerCara(p, cara, gesto.ojosCerrados);
  const pose = cara === 'sorpresa' ? 'arriba' : p.alas && cara === 'feliz' ? 'aletear' : 'volante';
  p.brazos.forEach((b) => posarBrazo(b, pose, t));
  if (cara === 'mareo') p.cabeza.rotation.set(Math.sin(t * 14) * 0.3, 0, Math.cos(t * 11) * 0.15);
  else p.cabeza.rotation.set(-inclinacion, 0, 0);
  p.rebote.rotation.x = cara === 'decidida' ? -inclinacion * 0.8 : 0;
  p.rebote.position.y = (cara === 'feliz' ? Math.abs(Math.sin(t * 12)) * 0.06 : 0) + (p.flota ? Math.sin(t * 2.5) * 0.05 : 0);
  moverExtras(p, t);
}

// En el podio, todos felices: el primero (puesto 0) baila con los brazos arriba y los otros aplauden.
export function animarPodio(p, puesto, t) {
  if (!p.careta) return;
  ponerCara(p, 'feliz', false);
  p.brazos.forEach((b) => posarBrazo(b, puesto === 0 ? 'baile' : 'aplauso', t));
  p.cabeza.rotation.set(puesto === 0 ? Math.sin(t * 6) * 0.2 : 0, 0, 0);
  moverExtras(p, t);
}
```

y reemplazar la función final `crearPersonaje` por:

```js
export function crearPersonaje(cuerpo) {
  return (NUEVOS[cuerpo.tipo] ?? TIPOS[cuerpo.tipo])(cuerpo);
}
```

Las funciones antiguas (`persona`, `gato`, `pajaro`, `toro`, `calabaza`, `fantasma`, `ojos`, `esfera` y `TIPOS`) quedan como están hasta que se reemplace cada personaje.

- [ ] **Paso 6: ficha de la bailarina**

En `src/logica/personajes.js`, reemplazar el `cuerpo` de la bailarina por:

```js
    cuerpo: {
      tipo: 'flamenca', piel: 0xe0ac69, pelo: 0x2b1d14, vestido: 0xd62828, volante: 0xa4161a, lunares: 0xffffff,
      manton: 0xfff1d0, fleco: 0xe9c46a, flor: 0xff4d6d, centroFlor: 0xffd166, peineta: 0x8b4a2b, aros: 0xffd166,
      zapatos: 0x7b2d26,
    },
```

- [ ] **Paso 7: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 8: commit**

```bash
git add src tests
git commit -m "Esqueleto de los personajes de dibujo animado y la bailarina flamenca

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 4: kart con el estilo nuevo y gestos en la carrera

**Archivos:**
- Modificar: `src/dibujo/kart3d.js`, `src/dibujo/escena.js`, `src/pantallas/carrera.js`, `src/pantallas/inicio.js`
- Probar: `tests/kart3d.test.js`

**Interfaces:**
- Consume: `crearPersonaje`, `animarPiloto` (tarea 3); `crearGestos`, `pasoGestos` (tarea 1); `dibujo`, `armarParte` (tarea 2).
- Produce:
  - `crearKart3D(ficha)` devuelve el grupo con `piloto`, `chasis` y `sincronizar(k, t, dt = 0, eventos = [])`.
  - `mundo.actualizar(carrera, t, dt = 0, eventos = null)`; `eventos[i]` son los eventos del kart `i` en ese cuadro.
  - En la pantalla de carrera, el reloj del dibujo no avanza en pausa.

- [ ] **Paso 1: pruebas**

Crear `tests/kart3d.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearKart3D } from '../src/dibujo/kart3d.js';
import { PERSONAJES } from '../src/logica/personajes.js';
import { materialCara } from '../src/dibujo/caras.js';
import { dibujo } from '../src/dibujo/estilo.js';

const dt = 1 / 60;
const kart = (cambios = {}) => ({
  x: 0, y: 0, h: 0, rumbo: 0, vel: 0, trompo: 0, proteccion: 0, disco: 0, turbo: 0, chispas: 0,
  derrape: null, enAire: false, ...cambios,
});
const bailarina = PERSONAJES[0];

describe('kart en 3D', () => {
  it('el piloto pone cara de mareo durante el trompo y después vuelve a la normal', () => {
    const k3 = crearKart3D(bailarina);
    k3.sincronizar(kart({ trompo: 0.5 }), 0, dt, []);
    expect(k3.piloto.careta.material).toBe(materialCara('mareo', false));
    k3.sincronizar(kart(), 0.1, dt, []);
    expect(k3.piloto.careta.material).toBe(materialCara('normal', false));
  });

  it('al romper una caja, el piloto se alegra', () => {
    const k3 = crearKart3D(bailarina);
    k3.sincronizar(kart(), 0, dt, ['caja']);
    expect(k3.piloto.careta.material).toBe(materialCara('feliz', false));
  });

  it('con la bola disco la carrocería cambia de colores, y después vuelve a la suya', () => {
    const k3 = crearKart3D(bailarina);
    const colores = new Set();
    for (let i = 0; i < 10; i++) {
      k3.sincronizar(kart({ disco: 3 }), i * 0.13, dt, []);
      colores.add(k3.chasis.material);
    }
    expect(colores.size).toBeGreaterThan(2);
    k3.sincronizar(kart(), 2, dt, []);
    expect(k3.chasis.material).toBe(dibujo(bailarina.kart));
  });

  it('en pausa (dt = 0) las ruedas no giran', () => {
    const k3 = crearKart3D(bailarina);
    const rueda = k3.chasis.parent.parent.children.find((m) => m.geometry?.type === 'CylinderGeometry');
    const antes = rueda.rotation.y;
    k3.sincronizar(kart({ vel: 20 }), 1, 0, []);
    expect(rueda.rotation.y).toBe(antes);
    k3.sincronizar(kart({ vel: 20 }), 1, dt, []);
    expect(rueda.rotation.y).not.toBe(antes);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/kart3d.test.js`
Expected: FAIL: el kart no tiene `piloto` ni `chasis`.

- [ ] **Paso 3: kart**

Reemplazar `src/dibujo/kart3d.js` por:

```js
import * as THREE from 'three';
import { crearPersonaje, animarPiloto } from './personajes3d.js';
import { brillo, malla } from './comun.js';
import { dibujo, armarParte } from './estilo.js';
import { OBJ } from '../logica/objetos.js';
import { crearGestos, pasoGestos } from '../logica/gestos.js';

const COLORES_DISCO = [0xff4d6d, 0xffd166, 0x4cc9f0, 0x80ed99, 0xc77dff];
const bolaDisco = new THREE.SphereGeometry(0.4, 12, 10);
const aroDisco = new THREE.TorusGeometry(1.5, 0.1, 6, 24);
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
  // Carrocería con sombras planas y contorno. El volante queda cerca del piloto, al alcance de sus manos.
  const carroceria = armarParte([
    { geo: new THREE.BoxGeometry(2.4, 0.45, 1.5), color: ficha.kart, pos: [0, 0.5, 0] },
    { geo: new THREE.BoxGeometry(0.5, 0.35, 1.7), color: ficha.detalle ?? ficha.kart, pos: [1.15, 0.45, 0] },
    { geo: new THREE.BoxGeometry(0.7, 0.5, 0.9), color: 0x222222, pos: [-0.45, 0.9, 0] },
    { geo: new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), color: 0x222222, pos: [0.3, 0.95, 0], rot: [0, 0, 0.75] },
    { geo: new THREE.TorusGeometry(0.22, 0.05, 6, 14), color: 0x222222, pos: [0.08, 1.2, 0], rot: [0, Math.PI / 2, 0] },
  ]);
  cuerpo.add(carroceria);
  const chasis = carroceria.porColor.get(ficha.kart);
  const ruedas = [[0.85, 0.85], [0.85, -0.85], [-0.85, 0.85], [-0.85, -0.85]].map(([x, z]) => {
    const r = malla(rueda, dibujo(0x111111), x, 0.38, z);
    r.rotation.x = Math.PI / 2;
    cuerpo.add(r);
    return r;
  });
  const piloto = crearPersonaje(ficha.cuerpo);
  piloto.position.set(-0.45, piloto.asiento ?? 0.95, 0);
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
  const bola = malla(bolaDisco, brillo(COLORES_DISCO[0]), -0.45, 3, 0);
  bola.visible = false;
  cuerpo.add(bola);
  const aro = malla(aroDisco, brillo(COLORES_DISCO[1]), 0, 0.15, 0);
  aro.rotation.x = Math.PI / 2;
  aro.visible = false;
  raiz.add(aro);
  const gestos = crearGestos();
  Object.assign(raiz, { piloto, chasis });

  // dt es el tiempo del dibujo: vale 0 en pausa, y entonces nada se mueve.
  raiz.sincronizar = (k, t, dt = 0, eventos = []) => {
    raiz.position.set(k.x, 0, -k.y);
    raiz.rotation.y = k.rumbo;
    cuerpo.position.y = k.h;
    // Trompo: una vuelta completa en el dibujo; el rumbo del kart no cambia.
    if (k.trompo > 0) cuerpo.rotation.y = (1 - k.trompo / OBJ.trompo) * Math.PI * 2;
    else cuerpo.rotation.y = k.derrape ? k.derrape.dir * 0.35 : 0;
    raiz.visible = !(k.proteccion > 0 && Math.floor(t * 12) % 2 === 0);
    const disco = k.disco > 0;
    const n = Math.floor(t * 8);
    bola.visible = disco;
    aro.visible = disco;
    // Con la bola disco, también la carrocería cambia de colores.
    chasis.material = dibujo(disco ? COLORES_DISCO[(n + 4) % COLORES_DISCO.length] : ficha.kart);
    if (disco) {
      bola.material = brillo(COLORES_DISCO[n % COLORES_DISCO.length]);
      aro.material = brillo(COLORES_DISCO[(n + 2) % COLORES_DISCO.length]);
      bola.rotation.y = t * 4;
    }
    ruedas.forEach((r) => {
      r.rotation.y += k.vel * 3 * dt;
    });
    chispas.forEach((c) => {
      c.visible = k.chispas > 0;
      c.material = brillo(k.chispas === 2 ? 0xff9f1c : 0x4cc9f0);
      c.scale.setScalar(0.7 + 0.5 * Math.abs(Math.sin(t * 30)));
    });
    fuego.visible = k.turbo > 0;
    fuego.scale.setScalar(0.8 + 0.3 * Math.abs(Math.sin(t * 25)));
    animarPiloto(piloto, pasoGestos(gestos, k, eventos, dt), t);
  };
  return raiz;
}
```

- [ ] **Paso 4: mundo y pantallas**

En `src/dibujo/escena.js`, reemplazar `actualizar` por:

```js
    // dt: tiempo del dibujo (0 en pausa). eventos[i]: lo que le pasó al kart i en este cuadro.
    actualizar(carrera, t, dt = 0, eventos = null) {
      carrera.karts.forEach((k, i) => karts[i].sincronizar(k, t, dt, eventos?.[i] ?? []));
      objetos?.actualizar(carrera.objetos, t);
    },
```

En `src/pantallas/carrera.js`:
- Borrar la línea `t += dt;` del comienzo de `actualizar`.
- Justo después de `const detenida = pausa || perdido !== -1;`, agregar:

```js
      // El reloj del dibujo se detiene en pausa: gestos, parpadeos, ruedas y ruleta quedan quietos.
      const dtDibujo = detenida ? 0 : dt;
      t += dtDibujo;
      const delCuadro = carrera.karts.map(() => []);
```

- Después de `const eventos = pasoCarrera(carrera, intenciones, PASO);`, agregar:

```js
          eventos.forEach((e, i) => delCuadro[i].push(...e));
```

- Reemplazar `mundo.actualizar(carrera, t);` (la del final de `actualizar`) por `mundo.actualizar(carrera, t, dtDibujo, delCuadro);`.

En `src/pantallas/inicio.js`, reemplazar el ciclo de la demostración y su dibujo:

```js
      acumulado += dt;
      const delCuadro = demo.karts.map(() => []);
      while (acumulado >= PASO) {
        acumulado -= PASO;
        const eventos = pasoCarrera(demo, demo.karts.map((k, i) => conducir(pilotos[i], k, pista, PASO, demo)), PASO);
        eventos.forEach((e, i) => delCuadro[i].push(...e));
      }
      if (demo.estado === 'fin' || demo.tiempo > 120) nuevaDemo();
      mundo.actualizar(demo, t, dt, delCuadro);
```

- [ ] **Paso 5: verificar que pasan y construir**

Run: `npx vitest run && npx vite build`
Expected: PASS en todos los archivos y la construcción termina sin errores.

- [ ] **Paso 6: commit**

```bash
git add src tests
git commit -m "Kart con sombras planas y contorno; gestos del piloto en la carrera; todo quieto en pausa

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 5: selección y podio

**Archivos:**
- Modificar: `src/dibujo/vitrina.js`, `src/dibujo/podio3d.js`, `src/pantallas/seleccion.js`
- Probar: `tests/vitrina-podio.test.js`

**Interfaces:**
- Consume: `animarPiloto`, `animarPodio`, `crearPersonaje` (tarea 3); `crearGestos`, `pasoGestos`, `alegrar` (tarea 1); kart con `piloto` (tarea 4).
- Produce: `crearVitrina(fichas)` suma `karts`, `celebrar(i)` y `actualizar(t, dt = 0)`; `crearPodio3D(fichas)` suma `figuras`.

- [ ] **Paso 1: pruebas**

Crear `tests/vitrina-podio.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { crearVitrina } from '../src/dibujo/vitrina.js';
import { crearPodio3D } from '../src/dibujo/podio3d.js';
import { PERSONAJES } from '../src/logica/personajes.js';
import { materialCara } from '../src/dibujo/caras.js';

describe('vitrina de la selección', () => {
  it('el personaje elegido salta feliz durante 1 s; los demás quedan en su lugar', () => {
    const v = crearVitrina(PERSONAJES);
    v.celebrar(0);
    v.actualizar(0.25, 0.25);
    expect(v.karts[0].position.y).toBeGreaterThan(0.5);
    expect(v.karts[0].piloto.careta.material).toBe(materialCara('feliz', false));
    expect(v.karts[1].position.y).toBeCloseTo(0.15, 5);
    v.actualizar(1.5, 1.25);
    expect(v.karts[0].position.y).toBeCloseTo(0.15, 5);
    expect(v.karts[0].piloto.careta.material).toBe(materialCara('normal', false));
  });
});

describe('podio', () => {
  it('los tres ponen cara feliz; el primero baila con los brazos arriba y los otros aplauden', () => {
    const bailarina = PERSONAJES[0];
    const podio = crearPodio3D([bailarina, bailarina, bailarina]);
    podio.actualizar(1);
    for (const p of podio.figuras) expect(p.careta.material).toBe(materialCara('feliz', false));
    expect(podio.figuras[0].brazos[0].rotation.z).toBeGreaterThan(2);
    expect(podio.figuras[1].brazos[0].rotation.z).toBeCloseTo(1.4, 5);
  });
});
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/vitrina-podio.test.js`
Expected: FAIL: la vitrina no tiene `celebrar` ni `karts`, y el podio no tiene `figuras`.

- [ ] **Paso 3: vitrina**

Reemplazar `src/dibujo/vitrina.js` por:

```js
import * as THREE from 'three';
import { crearKart3D } from './kart3d.js';
import { animarPiloto } from './personajes3d.js';
import { mate, brillo, malla } from './comun.js';
import { crearGestos, pasoGestos, alegrar } from '../logica/gestos.js';

// Kart detenido: en la vitrina los pilotos solo parpadean o se alegran.
const DETENIDO = { trompo: 0, enAire: false, turbo: 0, disco: 0, derrape: null, rumbo: 0 };

// Los 8 personajes en sus karts, girando sobre plataformas en dos filas de 4.
export function crearVitrina(fichas) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x0b1026);
  escena.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.3));
  // Luz con dirección: sin ella, las sombras planas no muestran sus tonos.
  const sol = new THREE.DirectionalLight(0xffffff, 1.6);
  sol.position.set(4, 10, 12);
  escena.add(sol);
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
  const gestos = fichas.map(() => crearGestos());
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
    karts,
    // Un anillo del color de cada jugador bajo su personaje; undefined lo oculta.
    marcar(cursores) {
      anillos.forEach((a, j) => {
        const c = cursores[j];
        a.visible = c !== undefined;
        if (c !== undefined) a.position.set(posiciones[c].x, 0.2, posiciones[c].z);
      });
    },
    // El personaje recién elegido salta feliz durante 1 s.
    celebrar(i) {
      alegrar(gestos[i]);
    },
    actualizar(t, dt = 0) {
      karts.forEach((k, i) => {
        k.rotation.y = t * 0.8 + i;
        const gesto = pasoGestos(gestos[i], DETENIDO, [], dt);
        k.position.y = 0.15 + Math.abs(Math.sin(gestos[i].feliz * Math.PI * 2)) * 0.6;
        animarPiloto(k.piloto, gesto, t);
      });
    },
  };
}
```

- [ ] **Paso 4: podio**

Reemplazar `src/dibujo/podio3d.js` por:

```js
import * as THREE from 'three';
import { crearPersonaje, animarPodio } from './personajes3d.js';
import { mate, malla } from './comun.js';

// Los tres primeros sobre el podio, mirando a la cámara: el 1.º salta y baila, los otros aplauden.
export function crearPodio3D(fichas) {
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(0x0b1026);
  escena.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.3));
  const sol = new THREE.DirectionalLight(0xffffff, 1.6);
  sol.position.set(4, 10, 12);
  escena.add(sol);
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
    figuras,
    actualizar(t) {
      figuras.forEach((p, i) => {
        p.position.y = lugares[i].alto + (i === 0 ? Math.abs(Math.sin(t * 4)) * 0.4 : 0);
        p.rotation.y = -Math.PI / 2 + Math.sin(t * 2 + i) * (i === 0 ? 0.5 : 0.15);
        animarPodio(p, i, t);
      });
    },
  };
}
```

- [ ] **Paso 5: salto al elegir**

En `src/pantallas/seleccion.js`, en `actualizar`, reemplazar:

```js
      for (const f of fuentes) procesarSeleccion(sel, f);
```

por:

```js
      const antes = sel.jugadores.map((j) => j.listo);
      for (const f of fuentes) procesarSeleccion(sel, f);
      sel.jugadores.forEach((j, i) => {
        if (j.listo && !antes[i]) vitrina.celebrar(j.cursor);
      });
```

y `vitrina.actualizar(t);` por `vitrina.actualizar(t, dt);`.

- [ ] **Paso 6: verificar que pasan y construir**

Run: `npx vitest run && npx vite build`
Expected: PASS en todos los archivos y la construcción termina sin errores.

- [ ] **Paso 7: commit**

```bash
git add src tests
git commit -m "Selección: el personaje elegido salta feliz; podio: el primero baila y los otros aplauden

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 6: punto de control con la bailarina

**Archivos:**
- Modificar: `src/main.js`

**Interfaces:**
- Consume: todo lo anterior. En desarrollo, `window.__ole = { juego, THREE }`.

- [ ] **Paso 1: exponer THREE en desarrollo**

En `src/main.js`, reemplazar `if (import.meta.env.DEV) window.__ole = { juego };` por:

```js
  if (import.meta.env.DEV) window.__ole = { juego, THREE };
```

Run: `npx vitest run && npx vite build`
Expected: PASS y construcción sin errores.

- [ ] **Paso 2: prueba con capturas**

Levantar `npx vite --port 5299 --strictPort` en segundo plano. En la carpeta con Playwright, crear `probar-personajes.mjs`:

```js
// Capturas de los personajes nuevos: selección, carrera de espalda, caras y podio; y pausa congelada.
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

await pagina.goto('http://localhost:5299/');
await pagina.waitForTimeout(3000);
// 2 jugadores, 🐢, el control 2 se une, ayuda para ambos; el jugador 1 elige la bailarina.
for (const [m, b] of [[0, 15], [0, 0], [0, 0], [1, 0], [0, 3], [1, 3], [0, 0]]) await pulsar(m, b);
await pagina.screenshot({ path: 'p-seleccion.png' });
await pulsar(1, 0);
await pagina.waitForTimeout(5000);
console.log('1', await pantalla());
await fijar(0, 0, true);
await fijar(1, 0, true);
await pagina.waitForTimeout(3000);
await pagina.screenshot({ path: 'p-carrera.png' });

// En pausa, dos capturas separadas por 1,5 s deben ser idénticas.
await pulsar(0, 9);
await pagina.waitForTimeout(1500);
const a = await pagina.screenshot();
await pagina.waitForTimeout(1500);
const b = await pagina.screenshot();
console.log('2 pausa congelada:', a.equals(b) ? 'sí' : 'no');
await pulsar(0, 9);
await fijar(0, 0, false);
await fijar(1, 0, false);

// Muestrario: cada personaje con estilo nuevo, de frente, con sus 5 caras.
await pagina.evaluate(async () => {
  const { THREE } = window.__ole;
  const { crearPersonaje, animarPiloto } = await import('/src/dibujo/personajes3d.js');
  const { PERSONAJES } = await import('/src/logica/personajes.js');
  const lienzo = document.createElement('canvas');
  lienzo.id = 'muestrario';
  Object.assign(lienzo.style, { position: 'fixed', left: '0', top: '0', zIndex: '99' });
  document.body.append(lienzo);
  const renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true });
  const nuevos = PERSONAJES.filter((p) => crearPersonaje(p.cuerpo).careta);
  const caras = ['normal', 'feliz', 'decidida', 'sorpresa', 'mareo'];
  renderer.setSize(caras.length * 200, nuevos.length * 200);
  renderer.setScissorTest(true);
  const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camara.position.set(4.2, 1.2, 0);
  camara.lookAt(0, 1, 0);
  nuevos.forEach((ficha, fila) => caras.forEach((cara, col) => {
    const escena = new THREE.Scene();
    escena.background = new THREE.Color(0x0b1026);
    escena.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.3));
    const sol = new THREE.DirectionalLight(0xffffff, 1.6);
    sol.position.set(6, 8, 4);
    escena.add(sol);
    const p = crearPersonaje(ficha.cuerpo);
    animarPiloto(p, { cara, ojosCerrados: false, inclinacion: 0 }, 0.3);
    escena.add(p);
    const y = (nuevos.length - 1 - fila) * 200;
    renderer.setViewport(col * 200, y, 200, 200);
    renderer.setScissor(col * 200, y, 200, 200);
    renderer.render(escena, camara);
  }));
});
await pagina.locator('#muestrario').screenshot({ path: 'p-caras.png' });
await pagina.evaluate(() => document.getElementById('muestrario').remove());

// Podio con la bailarina primera.
await pagina.evaluate(() => {
  const { ctx } = window.__ole.juego;
  const c = ctx.carrera;
  const orden = c.karts.map((k) => k.id);
  const humanos = c.karts.map((k, i) => (k.humano ? i : -1)).filter((i) => i >= 0);
  const primera = orden.indexOf('bailarina');
  c.puestos = [primera, ...c.puestos.filter((i) => i !== primera)];
  ctx.ir('podio', { carrera: c, jugadores: [], orden, humanos });
});
await pagina.waitForTimeout(1500);
console.log('3', await pantalla());
await pagina.screenshot({ path: 'p-podio.png' });
console.log('errores:', errores.length ? errores : 'ninguno');
await navegador.close();
```

Run: `node probar-personajes.mjs && node medir.mjs`
Expected:
- `1 carrera`, `2 pausa congelada: sí`, `3 podio`, `errores: ninguno` (dos veces).
- Cuadros por segundo de 55 o más; llamadas de dibujo por vista no más de 1,5 veces la línea base de la tarea 1.

Si algo no cumple, corregirlo antes de seguir, con prueba que falle primero cuando sea lógica, y registrar la decisión.

- [ ] **Paso 3: revisar las capturas**

Mirar las 4 capturas y confirmar:
- `p-carrera.png`: la bailarina se ve de espalda con moño, peineta y flor; la cabeza no tapa el camino de adelante.
- `p-caras.png`: 5 caras distintas, con los ojos arriba de la boca, centradas y sin espejar; mejillas a los lados.
- `p-seleccion.png`: la bailarina salta.
- `p-podio.png`: la bailarina baila con cara feliz.

Si algo se ve mal (cara corrida, brazos que no llegan al volante, cabeza que tapa), ajustar las cifras de forma y repetir el paso 2. Cada ajuste se registra como decisión.

Detener el servidor.

- [ ] **Paso 4: commit**

```bash
git add src/main.js
git commit -m "En desarrollo, THREE queda a mano para el muestrario de caras

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Paso 5: DETENERSE: visto bueno de Gonzalo**

Enviar a Gonzalo las 4 capturas (con la herramienta para enviar archivos o con enlaces a sus rutas), con 2 o 3 líneas sobre qué mirar. **No seguir con la tarea 7 sin su visto bueno.** Si pide cambios, hacerlos en la bailarina, repetir los pasos 2 y 3, y volver a mostrar.

---

## Tarea 7: bailarín de la noche y pianista

**Archivos:**
- Modificar: `src/dibujo/personajes/personas.js`, `src/dibujo/personajes3d.js`, `src/logica/personajes.js`
- Probar: `tests/personajes3d.test.js`, `tests/personajes.test.js`

**Interfaces:**
- Consume: `armarPersonaje` y figuras (tarea 3).
- Produce: tipos `bailarin` y `pianista`; el constructor antiguo `persona` deja de existir.

- [ ] **Paso 1: pruebas**

En `tests/personajes3d.test.js`, cambiar la lista:

```js
const NUEVOS = ['bailarina', 'bailarin', 'teclita'];
```

En `tests/personajes.test.js`, cambiar la lista de tipos y la prueba de los dos primeros:

```js
const TIPOS = ['flamenca', 'bailarin', 'pianista', 'gato', 'pajaro', 'toro', 'calabaza', 'fantasma'];
```

```js
  it('la bailarina lleva vestido rojo de lunares, mantón y peineta; el bailarín, chaqueta roja con franjas negras', () => {
    const [bailarina, bailarin] = PERSONAJES;
    expect(bailarina.cuerpo).toMatchObject({ tipo: 'flamenca', vestido: 0xd62828, lunares: 0xffffff, manton: 0xfff1d0, peineta: 0x8b4a2b });
    expect(bailarin.cuerpo).toMatchObject({ tipo: 'bailarin', chaqueta: 0xc1121f, franjas: 0x111111 });
  });
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/personajes3d.test.js tests/personajes.test.js`
Expected: FAIL: el bailarín y la pianista no tienen `careta` y sus fichas son de tipo `persona`.

- [ ] **Paso 3: constructores**

En `src/dibujo/personajes/personas.js`, cambiar la importación por:

```js
import {
  armarPersonaje, pieza, esfera, cono, cilindro, aro, caja, casquete, mitadCilindro, mitadDisco, brazoSimple,
} from './esqueleto.js';
```

y agregar al final:

```js
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
```

(`cono` y `mitadDisco` siguen en uso por la bailarina).

En `src/dibujo/personajes3d.js`:
- Cambiar `const NUEVOS = { flamenca: personas.flamenca };` por:

```js
const NUEVOS = { flamenca: personas.flamenca, bailarin: personas.bailarin, pianista: personas.pianista };
```

- Borrar la función antigua `persona` y la entrada `persona` de `TIPOS`.

- [ ] **Paso 4: fichas**

En `src/logica/personajes.js`, reemplazar el `cuerpo` del bailarín por:

```js
    cuerpo: { tipo: 'bailarin', piel: 0xc68642, pelo: 0x1b1b1b, chaqueta: 0xc1121f, franjas: 0x111111, zapatos: 0x111111 },
```

y el de la pianista (`teclita`) por:

```js
    cuerpo: {
      tipo: 'pianista', piel: 0xf1c27d, pelo: 0x6b3e26, vestido: 0x3a86ff, volante: 0x265fc4, cuello: 0xffffff,
      cintillo: 0xffffff, teclas: 0x111111, nota: 0xffd166, zapatos: 0x1d3557,
    },
```

- [ ] **Paso 5: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 6: commit**

```bash
git add src tests
git commit -m "Bailarín de la noche y pianista con el estilo de dibujo animado

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 8: gato, pájaro y torito

**Archivos:**
- Crear: `src/dibujo/personajes/animales.js`
- Modificar: `src/dibujo/personajes3d.js`, `src/logica/personajes.js`
- Probar: `tests/personajes3d.test.js`, `tests/personajes.test.js`

**Interfaces:**
- Consume: `armarPersonaje` y figuras (tarea 3).
- Produce: constructores `gato`, `pajaro` y `toro` (mismos tipos de ficha que hoy); los antiguos dejan de existir.

- [ ] **Paso 1: pruebas**

En `tests/personajes3d.test.js`, cambiar la lista:

```js
const NUEVOS = ['bailarina', 'bailarin', 'teclita', 'zarpita', 'trino', 'torito'];
```

En `tests/personajes.test.js`, agregar:

```js
  it('los animales traen sus detalles: cascabel del gato, pico del pájaro, cuernos y pañuelo del torito', () => {
    const porId = Object.fromEntries(PERSONAJES.map((p) => [p.id, p.cuerpo]));
    expect(porId.zarpita).toMatchObject({ tipo: 'gato', color: 0xf4a261, cascabel: 0xffd166 });
    expect(porId.trino).toMatchObject({ tipo: 'pajaro', color: 0x2a9d8f, pico: 0xffb703 });
    expect(porId.torito).toMatchObject({ tipo: 'toro', color: 0x8b5a2b, cuernos: 0xf8f9fa, panuelo: 0xd62828 });
  });
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/personajes3d.test.js tests/personajes.test.js`
Expected: FAIL: los tres animales no tienen `careta` y sus fichas no traen los detalles nuevos.

- [ ] **Paso 3: constructores**

Crear `src/dibujo/personajes/animales.js` (solo exporta constructores de personajes):

```js
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
```

En `src/dibujo/personajes3d.js`:
- Agregar `import * as animales from './personajes/animales.js';` junto a la importación de `personas`.
- Cambiar `NUEVOS` por:

```js
const NUEVOS = {
  flamenca: personas.flamenca, bailarin: personas.bailarin, pianista: personas.pianista,
  gato: animales.gato, pajaro: animales.pajaro, toro: animales.toro,
};
```

- Borrar las funciones antiguas `gato`, `pajaro` y `toro`, y sus entradas en `TIPOS`.

- [ ] **Paso 4: fichas**

En `src/logica/personajes.js`, reemplazar los `cuerpo` de los tres animales por:

```js
    cuerpo: {
      tipo: 'gato', color: 0xf4a261, barriga: 0xffe8d6, orejas: 0xffb4c2, nariz: 0xff8fab, collar: 0xd62828,
      cascabel: 0xffd166, punta: 0xffffff, bigotes: 0x2b1a12,
    },
```

```js
    cuerpo: { tipo: 'pajaro', color: 0x2a9d8f, barriga: 0xe9f5db, pico: 0xffb703 },
```

```js
    cuerpo: {
      tipo: 'toro', color: 0x8b5a2b, hocico: 0xd4a373, cuernos: 0xf8f9fa, panuelo: 0xd62828, mechon: 0x5c3a1e,
      pezunas: 0x3d2b1f,
    },
```

- [ ] **Paso 5: verificar que pasan**

Run: `npx vitest run`
Expected: PASS en todos los archivos.

- [ ] **Paso 6: commit**

```bash
git add src tests
git commit -m "Gato, pájaro y torito con el estilo de dibujo animado

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 9: calabacita, fantasmín y prueba final

**Archivos:**
- Crear: `src/dibujo/personajes/fantasia.js`
- Modificar: `src/dibujo/personajes3d.js` (queda sin el dibujo antiguo), `src/logica/personajes.js`
- Probar: `tests/personajes3d.test.js`, `tests/personajes.test.js`

**Interfaces:**
- Consume: `armarPersonaje` y figuras (tarea 3); constructores de las tareas 3, 7 y 8.
- Produce: `crearPersonaje` arma los 8 con el estilo nuevo; no queda dibujo antiguo.

- [ ] **Paso 1: pruebas**

En `tests/personajes3d.test.js`:
- Cambiar la lista por `const NUEVOS = PERSONAJES.map((p) => p.id);`.
- Borrar la prueba `'los que todavía tienen el dibujo simple no fallan al animarse'`.

En `tests/personajes.test.js`, agregar:

```js
  it('la calabacita trae gajos, hojas y tallo; el fantasmín es blanco', () => {
    const porId = Object.fromEntries(PERSONAJES.map((p) => [p.id, p.cuerpo]));
    expect(porId.calabacita).toMatchObject({ tipo: 'calabaza', color: 0xff8c1a, gajos: 0xe07012, hojas: 0x2d6a4f, tallo: 0x40916c });
    expect(porId.fantasmin).toEqual({ tipo: 'fantasma', color: 0xffffff });
  });
```

- [ ] **Paso 2: verificar que fallan**

Run: `npx vitest run tests/personajes3d.test.js tests/personajes.test.js`
Expected: FAIL: la calabacita y el fantasmín no tienen `careta`, y la ficha de la calabacita no trae gajos.

- [ ] **Paso 3: constructores**

Crear `src/dibujo/personajes/fantasia.js` (solo exporta constructores de personajes):

```js
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
```

- [ ] **Paso 4: personajes3d sin el dibujo antiguo**

Reemplazar `src/dibujo/personajes3d.js` por:

```js
import { materialCara } from './caras.js';
import * as personas from './personajes/personas.js';
import * as animales from './personajes/animales.js';
import * as fantasia from './personajes/fantasia.js';

// Cada tipo de cuerpo de las fichas tiene su constructor.
const CONSTRUCTORES = { ...personas, ...animales, ...fantasia };

export function crearPersonaje(cuerpo) {
  return CONSTRUCTORES[cuerpo.tipo](cuerpo);
}

export function ponerCara(p, cara, ojosCerrados = false) {
  p.careta.material = materialCara(cara, ojosCerrados);
}

// Brazo que cuelga del hombro, girado según la postura. lado: +1 o -1 según el costado.
function posarBrazo(b, pose, t) {
  const lado = b.position.z >= 0 ? 1 : -1;
  if (pose === 'arriba') b.rotation.set(lado * 0.35, 0, Math.PI);
  else if (pose === 'aletear') b.rotation.set(-lado * (0.9 + Math.sin(t * 25) * 0.5), 0, 0);
  else if (pose === 'aplauso') b.rotation.set(0, lado * (0.5 + Math.sin(t * 14) * 0.35), 1.4);
  else if (pose === 'baile') b.rotation.set(lado * 0.3, 0, Math.PI * 0.85 + Math.sin(t * 6 + lado) * 0.35);
  else b.rotation.set(0, lado * 0.15, 1.3);
}

function moverExtras(p, t) {
  const { cola, nota } = p.extras;
  if (cola) cola.rotation.x = Math.sin(t * 4) * 0.4;
  if (nota) {
    nota.position.y = nota.baseY + Math.sin(t * 3) * 0.05;
    nota.rotation.y = t * 1.5;
  }
}

// Manejando: manos al volante y cabeza que se inclina en las curvas; en el aire, brazos arriba;
// feliz, rebota (y el pájaro aletea); decidida, se inclina hacia la curva; mareada, la cabeza se bambolea.
export function animarPiloto(p, gesto, t) {
  const { cara, inclinacion } = gesto;
  ponerCara(p, cara, gesto.ojosCerrados);
  const pose = cara === 'sorpresa' ? 'arriba' : p.alas && cara === 'feliz' ? 'aletear' : 'volante';
  p.brazos.forEach((b) => posarBrazo(b, pose, t));
  if (cara === 'mareo') p.cabeza.rotation.set(Math.sin(t * 14) * 0.3, 0, Math.cos(t * 11) * 0.15);
  else p.cabeza.rotation.set(-inclinacion, 0, 0);
  p.rebote.rotation.x = cara === 'decidida' ? -inclinacion * 0.8 : 0;
  p.rebote.position.y = (cara === 'feliz' ? Math.abs(Math.sin(t * 12)) * 0.06 : 0) + (p.flota ? Math.sin(t * 2.5) * 0.05 : 0);
  moverExtras(p, t);
}

// En el podio, todos felices: el primero (puesto 0) baila con los brazos arriba y los otros aplauden.
export function animarPodio(p, puesto, t) {
  ponerCara(p, 'feliz', false);
  p.brazos.forEach((b) => posarBrazo(b, puesto === 0 ? 'baile' : 'aplauso', t));
  p.cabeza.rotation.set(puesto === 0 ? Math.sin(t * 6) * 0.2 : 0, 0, 0);
  moverExtras(p, t);
}
```

En `src/dibujo/kart3d.js`, cambiar `piloto.position.set(-0.45, piloto.asiento ?? 0.95, 0);` por `piloto.position.set(-0.45, piloto.asiento, 0);`.

- [ ] **Paso 5: fichas**

En `src/logica/personajes.js`, reemplazar los `cuerpo` de la calabacita y del fantasmín por:

```js
    cuerpo: { tipo: 'calabaza', color: 0xff8c1a, gajos: 0xe07012, hojas: 0x2d6a4f, tallo: 0x40916c },
```

```js
    cuerpo: { tipo: 'fantasma', color: 0xffffff },
```

y el comentario de arriba por:

```js
// Cada personaje es una ficha: el dibujo arma su cuerpo con figuras simples, en estilo de dibujo animado.
```

- [ ] **Paso 6: verificar que pasan y construir**

Run: `npx vitest run && npx vite build`
Expected: PASS en todos los archivos y la construcción termina sin errores.

- [ ] **Paso 7: prueba final en el navegador**

Levantar `npx vite --port 5299 --strictPort` en segundo plano.

Run: `node probar-personajes.mjs && node medir.mjs`
Expected:
- `1 carrera`, `2 pausa congelada: sí`, `3 podio`, `errores: ninguno` (dos veces).
- Cuadros por segundo de 55 o más; llamadas de dibujo por vista no más de 1,5 veces la línea base.

Revisar `p-caras.png` (8 filas de 5 caras), `p-carrera.png`, `p-seleccion.png` y `p-podio.png` con los mismos criterios de la tarea 6, para los 8 personajes. Ajustes de forma: corregir, repetir y registrar la decisión. Detener el servidor.

- [ ] **Paso 8: commit**

```bash
git add src tests
git commit -m "Calabacita y fantasmín con el estilo de dibujo animado; ya no queda dibujo antiguo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 10: publicación

**Archivos:** ninguno.

**Interfaces:**
- Consume: la rama `personajes` completa y revisada.

- [ ] **Paso 1: unir y probar**

Run: `git checkout main && git merge --ff-only personajes && npx vitest run`
Expected: unión sin conflictos y PASS en todos los archivos.

- [ ] **Paso 2: publicar (con confirmación de Gonzalo)**

Run: `git push origin main`
Expected: el envío termina sin errores.

- [ ] **Paso 3: verificar**

Run: consultar `https://api.github.com/repos/chalofster/ole-kart/actions/runs?per_page=1` cada 15 s hasta que el último envío figure `completed` y `success`; luego `curl -s https://chalofster.github.io/ole-kart/` y el archivo `assets/index-*.js` que nombra.
Expected: `200`, y el `.js` contiene `flamenca` y `decidida`.
