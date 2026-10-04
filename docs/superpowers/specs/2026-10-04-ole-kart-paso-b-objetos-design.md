---
titulo: Olé Kart, paso B - objetos
fecha: 04-10-2026
estado: en revisión
---

## Objetivo

Agregar cajas sorpresa con objetos para lanzar y defenderse, para que las carreras sean más entretenidas y variadas, sin que la jugadora menor deje de poder competir. Los objetos son originales: no usan nombres, dibujos ni sonidos de otros juegos de karts.

## Contexto

- Parte de la etapa 1 publicada y del paso A (velocidades 🐢 🐇 🚀, música original y canción propia). Todo lo que este documento no cambia sigue rigiéndose por `2026-10-04-ole-kart-etapa-1-design.md`.
- Orden acordado de lo que sigue: B objetos (este documento), C más pistas, D personalizar el kart, E modo batalla.

## Cajas sorpresa

| Aspecto | Regla |
|---|---|
| Ubicación | Cuatro filas en rectas de la pista, cerca de s = 35, 410, 660 y 790, a más de 20 unidades de las flechas de turbo y de la rampa |
| Filas | Cuatro cajas por fila, a lo ancho del camino: desplazamiento lateral −4,5; −1,5; 1,5 y 4,5 |
| Aspecto | Cubo de colores que gira y flota sobre la pista |
| Al tocarla | La caja se rompe. Si el kart no tiene objeto, recibe uno |
| Ruleta | Durante 1 s los íconos giran en la casilla del jugador; después queda el objeto. Mientras gira no se puede usar |
| Vuelve | La caja reaparece 2 s después de romperse |
| Kart en el aire | No toca las cajas |

## Objetos

| Objeto | Efecto |
|---|---|
| 🎃 Calabaza rodante | Sale hacia adelante desde el kart y rueda siguiendo la pista, con el desplazamiento lateral con que salió, a 1,4 veces la velocidad máxima de la carrera (según la velocidad elegida 🐢 🐇 🚀). Al primer kart que toca le da un trompo y desaparece. Si no toca a nadie, desaparece a los 6 s |
| 🍌 Cáscara de plátano | Queda en la pista 2,5 unidades detrás del kart. Quien la pisa recibe un trompo y la cáscara desaparece. Su dueño también puede pisarla, pasado 1 s. Hay como máximo 10 en la pista; al dejar una más, desaparece la más antigua |
| 🌶️ Ají turbo | Turbo de 1,5 s, igual a los turbos actuales (llamas y sonido) |
| 🪩 Bola disco | Durante 6 s: velocidad máxima 15 % mayor, ningún golpe lo afecta, y al tocar a otro kart le da un trompo. El kart cambia de colores |

- Cada kart guarda un solo objeto.
- Ningún objeto se puede usar durante la cuenta regresiva, ni después de que el kart terminó la carrera.

## Golpe

| Aspecto | Regla |
|---|---|
| Trompo | Dura 1 s. El kart gira en el lugar (solo en el dibujo; el rumbo no cambia), no responde a los controles, pierde el derrape y el turbo, y su velocidad baja a la mitad en el momento del golpe |
| Protección | Después del trompo, el kart parpadea 1,5 s y no puede recibir otro golpe |
| Kart en el aire | Las calabazas y las cáscaras no lo golpean |

## Reparto según la posición

Al tomar una caja, el objeto se sortea según el puesto del kart en ese momento:

| Puesto | 🍌 | 🎃 | 🌶️ | 🪩 |
|---|---|---|---|---|
| 1.º | 50 % | 40 % | 10 % | 0 % |
| 2.º a 5.º | 25 % | 30 % | 30 % | 15 % |
| 6.º a 8.º | 10 % | 20 % | 40 % | 30 % |

## Rivales del computador

- No se desvían para tomar cajas: las toman si pasan por encima en su línea.
- Revisan una vez por segundo si conviene usar el objeto:
  - 🪩 la usan apenas termina la ruleta;
  - 🌶️ la usan en las rectas (donde su velocidad prudente es la máxima);
  - 🍌 la dejan cuando un kart los sigue a menos de 12 unidades y casi en su misma línea (menos de 3 de diferencia lateral);
  - 🎃 la lanzan cuando tienen un kart adelante a menos de 40 unidades y casi en su misma línea.
- **Con calma con los niños:** si el blanco (el kart de adelante para la calabaza, el de atrás para la cáscara) es de un niño, el rival lo usa solo con probabilidad 1/3 en esa revisión.
- Si guardan un objeto más de 8 s sin usarlo, lo usan igual.

## Controles

| Acción | Control | Teclado |
|---|---|---|
| Usar el objeto | X o gatillo izquierdo (LB) | X |

- Se usa al apretar el botón (no al mantenerlo).
- La calabaza siempre sale hacia adelante y la cáscara siempre cae detrás: no hay que apuntar.
- En modo ayuda, el niño usa sus objetos con X; la ayuda no los usa por él.

## Pantalla

- Cada mitad muestra arriba, al centro, una casilla grande con el ícono del objeto guardado; vacía si no hay. Durante la ruleta, los íconos cambian rápido.
- El kart en trompo gira; el kart protegido parpadea; el kart con bola disco cambia de colores.
- En la carrera de demostración del inicio, los rivales también usan objetos.

## Sonido

Sintetizado con Web Audio, como el resto. Efectos nuevos, solo para los karts de los niños: tomar una caja, ruleta, objeto listo, lanzar la calabaza, dejar la cáscara, recibir un golpe (trompo), activar la bola disco. El ají usa el sonido de turbo existente.

## Arquitectura

| Parte | Cambio |
|---|---|
| `src/logica/objetos.js` (nuevo) | Cajas, sorteo por posición, ruleta, uso de objetos, calabazas y cáscaras en la pista, golpes, protección y bola disco. Lógica pura, sin Three.js |
| `src/logica/carrera.js` | La carrera guarda el estado de los objetos y lo actualiza en cada paso; un kart en trompo no recibe la intención de su piloto; la bola disco multiplica su factor de velocidad |
| `src/logica/pilotos.js` | Decisión de los rivales sobre cuándo usar su objeto |
| `src/entrada/mandos.js` | Nuevo botón: usar objeto |
| `src/dibujo/` | Cajas, calabazas y cáscaras; trompo, parpadeo y colores del kart |
| `src/pantallas/carrera.js` | Casilla del objeto, ruleta y sonidos |
| `src/sonido/sonido.js` | Efectos nuevos |

La intención de manejo suma el campo `usa` (verdadero solo en el paso en que se aprieta el botón).

## Casos límite

| Situación | Comportamiento |
|---|---|
| Kart con objeto guardado toca una caja | La caja se rompe; no recibe otro objeto |
| Pausa o control desconectado | Todo se detiene, incluidas calabazas, cáscaras, ruletas y efectos |
| Calabaza llega a la rampa | Sigue por la pista sin saltar |
| Golpe a un kart con bola disco o protegido | No le pasa nada; la calabaza o cáscara desaparece igual |
| Niño que terminó la carrera | Su kart lo maneja el computador, que no usa objetos |

## Pruebas

- **Automáticas (Vitest):**
  - el puesto 1 nunca recibe 🪩 y los últimos reciben más 🌶️ y 🪩;
  - una caja da objeto solo a quien no tiene y reaparece a los 2 s;
  - la ruleta dura 1 s;
  - la calabaza sigue la pista y golpea al primer kart que toca;
  - la cáscara golpea, también a su dueño pasado 1 s, y no hay más de 10;
  - el trompo dura 1 s, deja media velocidad y da 1,5 s de protección;
  - la bola disco protege y golpea;
  - nada golpea a un kart en el aire;
  - los rivales usan los objetos según las reglas, y contra niños con probabilidad 1/3;
  - una carrera completa con objetos termina en un tiempo razonable;
  - con objetos, los niños en modo ayuda que aceleran y usan su objeto apenas lo tienen siguen pudiendo quedar entre los primeros (puesto medio de 6,2 o mejor y al menos un 4.º puesto en 10 carreras).
- **En el navegador:** carrera de 2 jugadores con controles simulados que usan X; capturas de la casilla con objeto y de un trompo; cuadros por segundo; sin errores.
- **Real:** los niños con los controles en el notebook.

## Publicación

Igual que los pasos anteriores: rama propia, revisión final independiente, unión a `main` y publicación en `https://chalofster.github.io/ole-kart/` con la confirmación de Gonzalo.

## Fuera de alcance

Más objetos que estos cuatro, apuntar hacia atrás o hacia adelante, objetos en el modo batalla (paso E) y cambiar los objetos según la pista.
