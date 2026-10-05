---
titulo: Olé Kart, personajes de dibujo animado
fecha: 05-10-2026
estado: en revisión
---

## Objetivo

Redibujar los 8 personajes que manejan para que se vean como dibujos animados, al estilo de la bailarina flamenca dibujada del Tablao de Palabras, y darles gestos simples mientras manejan. El manejo y los resultados de la carrera no cambian.

## Contexto

- Parte de lo publicado hasta el paso B (objetos). Todo lo que este documento no cambia sigue rigiéndose por las especificaciones anteriores de `docs/superpowers/specs/`.
- Modelo de estilo: la bailarina del Tablao (`juego-ingles/src/escenas/bailarina.js`): cabeza grande, ojos ovalados oscuros con un brillo blanco, mejillas rosadas, boca que cambia y muchos detalles propios (volantes, mantón, peineta, aros, flor).
- Este paso va antes del paso C (más pistas). Orden acordado después: C más pistas, D personalizar el kart, E modo batalla.

## Estilo

| Aspecto | Regla |
|---|---|
| Proporciones | Cabezón de dibujo animado: la cabeza ocupa cerca del 45 % de la altura del personaje (hoy cerca del 30 %). Cuerpo corto y redondeado; manos y pies como bolitas |
| Altura | Ningún personaje mide más de 1,9 unidades sobre el asiento, es decir, sobre su punto de apoyo en el kart (hoy el más alto llega a cerca de 1,75), para que la cabeza no tape el camino en la cámara de carrera |
| Sombras | Planas, de 3 tonos por color (claro, medio, oscuro), sin degradados. Colores vivos; el color principal de cada personaje no cambia |
| Contorno | Línea oscura (café casi negro) alrededor del cuerpo, la cabeza y los accesorios grandes |
| Cara | Dibujada en el código en el estilo del Tablao: ojos ovalados oscuros con brillo blanco, cejas, mejillas rosadas y boca. Sin archivos de imagen |
| Espalda | En carrera cada niño ve a su personaje de espalda, así que cada uno tiene una espalda reconocible (ver la tabla de personajes) |
| Kart | Pasa a sombras planas con contorno, con la misma forma de hoy. Con la bola disco, la carrocería también cambia de colores |
| Escenario | No cambia |

## Personajes

Los mismos 8, con sus colores principales de hoy. Todos son originales: sin rasgos de personajes de películas ni de otros juegos. Cada personaje sigue siendo una ficha de datos que el dibujo arma.

| Personaje | De frente | De espalda |
|---|---|---|
| 💃 Bailarina | Vestido rojo de lunares blancos con volantes, mantón crema con flecos, aros dorados, flor roja con centro amarillo | Moño con peineta café y la flor a un costado |
| 🕺 Bailarín de la noche | Chaqueta roja con hombreras y franjas negras en V, pelo negro corto con rulos, sonrisa grande. Sin sombrero ni guante | Chaqueta roja con franjas y pelo con rulos |
| 🐱 Gato | Naranjo, orejas con interior rosado, bigotes, nariz rosada, collar con cascabel | Orejas y cola con punta blanca que se mueve |
| 🐦 Pájaro | Turquesa, barriga clara, pico amarillo, copete de tres plumas | Copete y alas que aletean con turbo |
| 🐂 Torito | Café, hocico crema, mechón en la frente, cuernos blancos cortos, pañuelo rojo | Cuernos, pañuelo anudado y cola con pompón |
| 🎹 Pianista | Niña de pelo largo castaño, vestido azul, cintillo con teclas blancas y negras | Pelo largo y una nota musical que flota sobre la cabeza |
| 🎃 Calabacita | Calabaza con cara simpática dibujada (no tallada, sin susto), tallo con hojita, cuello de hojas verdes | Gajos de la calabaza y el tallo con la hoja |
| 👻 Fantasmín | Blanco y tierno, mejillas rosadas, sonrisa, borde ondulado abajo | Forma redonda; flota subiendo y bajando suavemente |

## Gestos

Cada personaje tiene 5 caras. En carrera, la cara y el movimiento salen del estado del kart; si hay varias situaciones a la vez, gana la de más arriba:

| Situación | Cara | Movimiento |
|---|---|---|
| Trompo (`trompo > 0`) | Mareo: ojos en espiral, boca ondulada | La cabeza se bambolea |
| En el aire (`enAire`) | Sorpresa: ojos grandes, boca en "O" | Los brazos suben |
| Turbo, ají, bola disco (`turbo > 0` o `disco > 0`) o rompió una caja hace menos de 1 s | Feliz: boca abierta sonriendo | Rebota un poco en el asiento |
| Derrapando (`derrape`) | Decidida: cejas firmes, una puntita de lengua | Se inclina hacia la curva |
| Ninguna de las anteriores | Normal: sonrisa | Parpadea cada 2 a 5 s (0,12 s cerrado) |

- Siempre: manos en el volante y la cabeza se inclina hacia el lado de la curva, como máximo 15°.
- Los rivales también hacen gestos.
- **Selección:** al elegir un personaje, salta con cara feliz durante 1 s.
- **Podio:** el 1.º baila con cara feliz; el 2.º y el 3.º aplauden sonriendo.
- **Pausa:** el reloj del dibujo de la carrera se detiene: gestos, parpadeo, parpadeo de protección y ruleta de la casilla quedan quietos hasta que se sigue.
- Los gestos son solo dibujo: no cambian el manejo ni los resultados.

## Rendimiento

- Meta: 60 cuadros por segundo con pantalla dividida, 8 karts y objetos, igual que en el paso B.
- Las piezas de un personaje del mismo color se juntan en una sola, para dibujar pocas cosas por cuadro. Materiales y caras se crean una vez y se reutilizan; las caras usan pocas texturas pequeñas, compartidas entre personajes cuando se puede.
- Se mide en el navegador antes y después. Si baja de la meta, se corrige antes del punto de control.

## Punto de control

1. Primero se hacen el estilo, el kart y solo la bailarina, con sus 5 caras.
2. Se muestran a Gonzalo capturas desde la cámara de carrera (de espalda), en la selección, en el podio y de las 5 caras.
3. Los otros 7 personajes se hacen solo con su visto bueno. Si pide cambios, se ajusta la bailarina antes de seguir.

## Arquitectura

| Parte | Cambio |
|---|---|
| `src/dibujo/estilo.js` (nuevo) | Materiales de sombras planas de 3 tonos y contorno oscuro |
| `src/dibujo/caras.js` (nuevo) | Dibujo de las caras y sus 5 expresiones en el estilo del Tablao |
| `src/logica/gestos.js` (nuevo) | Qué cara y qué movimiento tocan según el estado del kart y los eventos recientes; parpadeo. Lógica pura, sin Three.js |
| `src/dibujo/personajes3d.js` | Se rehace: los 8 personajes armados desde sus fichas, con gestos |
| `src/logica/personajes.js` | Fichas con los detalles nuevos (mantón, peineta, aros, cascabel, cintillo, etc.) |
| `src/dibujo/kart3d.js` | Estilo nuevo, carrocería que cambia de colores con la bola disco, gestos del piloto |
| `src/dibujo/vitrina.js`, `src/dibujo/podio3d.js` | Salto al elegir; baile y aplausos en el podio |
| `src/pantallas/carrera.js` | El reloj del dibujo no avanza en pausa; los eventos de cada kart llegan a los gestos |

## Casos límite

| Situación | Comportamiento |
|---|---|
| Trompo en el aire | Gana el mareo |
| Rompe una caja durante un derrape | Feliz durante 1 s y después vuelve a decidida si sigue derrapando |
| Pausa o control desconectado | Gestos y parpadeos quietos |
| Pantalla de un jugador o de dos | Los mismos gestos; la cámara de carrera no queda tapada por la cabeza |
| Computador sin WebGL | Igual que hoy: aviso ⚠️🖥️ |

## Pruebas

- **Automáticas (Vitest):**
  - cada situación de la tabla de gestos da su cara, y la prioridad se respeta cuando hay varias a la vez;
  - la cara feliz dura 1 s después de una caja;
  - el parpadeo ocurre cada 2 a 5 s y dura 0,12 s;
  - sin avance del reloj (pausa) la cara y el parpadeo no cambian;
  - los 8 personajes se arman desde sus fichas y ninguno supera 1,9 unidades sobre el asiento.
- **En el navegador:** capturas de los 8 en carrera (de espalda), selección y podio; una captura de cada cara; cuadros por segundo con pantalla dividida; sin errores.
- **Real:** los niños con los controles en el notebook.

## Publicación

Igual que los pasos anteriores: rama propia, punto de control con Gonzalo, revisión final independiente, unión a `main` y publicación en `https://chalofster.github.io/ole-kart/` con la confirmación de Gonzalo.

## Fuera de alcance

El escenario, la forma del kart (paso D), personajes nuevos, voces y pasar el resto del juego al estilo de dibujo animado.
