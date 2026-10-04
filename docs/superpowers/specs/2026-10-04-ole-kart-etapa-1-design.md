---
titulo: Olé Kart, etapa 1 - la carrera
fecha: 04-10-2026
estado: en revisión
---

## Objetivo

Un juego de carreras de karts en 3D, al estilo Mario Kart, para que la jugadora (6 años) y su mejor amigo (8 años) jueguen juntos en el computador sin ayuda de un adulto. La diferencia de edad no debe decidir siempre la carrera: la menor tiene que poder ganar a veces.

## Contexto de uso

| Aspecto | Definición |
|---|---|
| Equipo | Notebook reciente (menos de 5 años), en la casa |
| Controles | Dos controles USB o Bluetooth (tipo Xbox o PlayStation), más el teclado como respaldo |
| Navegador | Chrome o Edge |
| Lectura | La jugadora recién aprende a leer: ninguna pantalla exige leer; se usan íconos, números y colores |

## Etapas del proyecto

| Etapa | Contenido | Estado |
|---|---|---|
| 1. La carrera | Una pista, 8 personajes, 1 y 2 jugadores, manejo con derrape y turbos, rivales del computador, ayudas | Esta especificación |
| 2. Objetos | Cajas sorpresa con objetos para lanzar y defenderse | Pendiente |
| 3. Más pistas | Dos o tres pistas con ambientes nuevos | Pendiente |
| 4. Modo batalla | Arena con globos | Pendiente |

Cada etapa tiene su propio diseño, especificación, plan e implementación.

## Modos y recorrido

- **1 jugador:** una persona contra 7 karts del computador, en pantalla completa.
- **2 jugadores:** pantalla dividida izquierda y derecha; dos personas contra 6 karts del computador.
- **Recorrido:** inicio (elegir 1 o 2 jugadores) → selección de personaje → cuenta regresiva 3, 2, 1 → carrera de 3 vueltas → podio → jugar otra vez o volver al inicio.
- **Fin de carrera:** cuando todas las personas cruzan la meta en la tercera vuelta, la carrera termina. Las posiciones de los karts del computador que no terminaron se ordenan según su avance.
- **Pausa:** Start o Esc pausa la carrera para todos; el mismo botón la reanuda.

## Controles

| Acción | Control | Teclado de respaldo |
|---|---|---|
| Girar | Palanca izquierda o cruceta | ← → |
| Acelerar | A | ↑ |
| Frenar o retroceder | B | ↓ |
| Derrapar | Gatillo derecho | Barra espaciadora |
| Pausa | Start | Esc |

- Se usa el mapeo estándar de controles del navegador (Gamepad API).
- El teclado cuenta como un control más: en 2 jugadores, si solo hay un control conectado, la otra persona juega con el teclado.
- En la selección, cada persona elige con su propio control; el primer control que presiona A es el jugador 1.

## Selección de personaje

- Muestra los 8 personajes girando sobre una plataforma. Cada jugador mueve un marco de su color (jugador 1 rojo, jugador 2 azul) y confirma con A.
- Dos jugadores no pueden elegir el mismo personaje.
- Cada jugador tiene un interruptor de **modo ayuda** (ícono de estrella) que activa o desactiva con Y. Parte desactivado.
- Los personajes que nadie eligió corren manejados por el computador.

## Manejo

El manejo es arcade, sin simulación física realista. Todos los karts tienen la misma velocidad máxima, aceleración y giro.

| Aspecto | Regla |
|---|---|
| Paso de simulación | Fijo, 60 veces por segundo, independiente de los cuadros por segundo de la pantalla |
| Velocidad | Sube con A hasta la máxima; baja sola al soltar; B frena y luego retrocede a baja velocidad |
| Fuera de la pista | Sobre pasto o tierra la velocidad máxima baja a 55 % |
| Bordes | Vallas bajas. Al chocar, el kart rebota hacia la pista y conserva 60 % de la velocidad; nunca se da vuelta |
| Derrape | Con el gatillo apretado y girando, el kart derrapa y acumula carga: chispas azules a 1 s, naranjas a 2 s. Al soltar: turbo de 0,6 s (azul) o 1,2 s (naranja). Soltar antes de 1 s no da turbo |
| Turbo | Durante un turbo la velocidad máxima sube 35 % |
| Flechas de turbo en el piso | Pasar sobre ellas da un turbo de 1 s |
| Rampa | Lanza el kart en un salto corto; aterriza siempre sobre la pista |
| Sentido contrario | Si un kart avanza en sentido contrario por más de 1 s, su pantalla muestra una flecha grande hacia la dirección correcta |
| Choques entre karts | Se empujan suave hacia los lados; sin trompos ni pérdida grande de velocidad |

## Ayudas

| Ayuda | Regla |
|---|---|
| Modo ayuda (por jugador) | Acelera solo y corrige la dirección cerca del borde, para que el kart no se salga de la pista. La persona solo gira |
| Impulso para quien va atrás | Vale para todos los karts: la velocidad máxima sube hasta 12 % según la distancia al primero (0 % junto al primero, 12 % a media vuelta o más) |
| Ritmo de los rivales | Un kart del computador que va más de un cuarto de vuelta delante de la mejor persona baja su velocidad máxima hasta 15 %; uno que va más de un cuarto de vuelta detrás la sube hasta 10 % |

## Rivales del computador

- Siguen una línea de carrera definida por puntos a lo largo de la pista, cada uno con un desplazamiento lateral propio, para que no vayan en fila.
- Cada rival tiene un factor de velocidad entre 0,92 y 1,00, fijo durante la carrera, asignado al azar.
- Pasan por las flechas de turbo cuando les quedan cerca de su línea. No derrapan.
- Si un rival queda detenido más de 2 s (por ejemplo, contra una valla), retrocede y vuelve a su línea.

## Vueltas y posiciones

- La pista tiene puntos de control en orden. Una vuelta cuenta solo al cruzar la meta después de pasar por todos los puntos de control de esa vuelta; atajos y retrocesos no suman.
- La posición se calcula por vueltas completas, luego por punto de control alcanzado y luego por distancia al siguiente punto de control.
- Cada mitad de pantalla muestra la posición de su jugador (1.º a 8.º) y la vuelta actual (1/3, 2/3, 3/3) con números grandes.

## Pista "Noche de Thriller"

| Aspecto | Definición |
|---|---|
| Forma | Circuito cerrado definido por una curva central, un ancho y una altura en cada punto |
| Duración | Unos 45 s por vuelta a velocidad máxima |
| Elementos | Una curva cerrada para derrapar, tres zonas de flechas de turbo, una rampa con salto, meta con arco de luces |
| Ambiente | Calle de barrio de noche: luna grande, estrellas, faroles amarillos, casas con ventanas encendidas, calabazas sonrientes, niebla suave a lo lejos |
| Tono | Divertido, sin sustos: sin zombis, esqueletos ni tumbas |
| Visibilidad | Cielo oscuro y pista bien iluminada; el camino siempre se distingue del pasto |

## Personajes

Cada personaje es una ficha de datos (colores, accesorios y forma del cuerpo) que el dibujo arma con figuras simples. Cambiar un personaje es cambiar su ficha. Todos tienen cara simple de caricatura (ojos de punto y sonrisa) y celebran en el podio con un baile corto.

| Personaje | Aspecto | Kart |
|---|---|---|
| Bailarina flamenca | Vestido rojo con lunares blancos y volantes, moño negro con flor | Rojo |
| Bailarín de la noche | Chaqueta roja con franjas negras en V, pantalón rojo, pelo oscuro corto | Negro con detalles rojos |
| Zarpita (provisional) | Gata naranja de orejas puntudas, como la criatura del Tablao | Naranja |
| Trino (provisional) | Pájaro verde azulado con copete | Verde azulado |
| Torito (provisional) | Toro café amistoso con cuernos cortos y pañuelo rojo | Café |
| Teclita (provisional) | Pianista con vestido azul y una nota musical en el pelo | Blanco y negro, como teclas |
| Calabacita (provisional) | Calabaza sonriente con hojas en la cabeza | Morado |
| Fantasmín (provisional) | Fantasma blanco, redondo y simpático | Celeste |

- Los seis personajes provisionales se reemplazan por los que elijan los niños, sin cambiar el resto del juego.
- El bailarín de la noche se inspira solo en la ropa: no usa el nombre, la cara, la música ni los pasos característicos de Michael Jackson. El nombre lo puede elegir el amigo.
- No se usan personajes, nombres ni imágenes de otros juegos o películas. Si los niños eligen uno, se hace una versión inspirada, sin nombre ni rostro.

## Sonido

Todo el sonido se genera con Web Audio, sin archivos:

- Motor de cada jugador, cuyo tono sube con la velocidad.
- Chispas del derrape, turbo, choque contra valla, cuenta regresiva, cruce de meta y fanfarria del podio.
- Música original, animada y nocturna, en bucle durante la carrera. No se usa la canción *Thriller*.
- El audio se habilita con el primer botón presionado en la pantalla de inicio.

## Arquitectura

| Parte | Responsabilidad |
|---|---|
| `src/logica/` | Lógica pura, sin Three.js ni navegador, probada con Vitest: avance del kart, derrape y turbos, pista (curva, ancho, bordes, puntos de control), vueltas y posiciones, ayudas, rivales, carrera completa |
| `src/entrada/` | Lectura de controles y teclado, convertida a la misma intención de manejo (girar, acelerar, frenar, derrapar) |
| `src/dibujo/` | Escena de Three.js: pista, ambiente, karts y personajes desde sus fichas, cámaras que siguen a cada jugador, pantalla dividida |
| `src/pantallas/` | Inicio, selección, carrera con marcadores y podio, como capas HTML con íconos grandes sobre el lienzo |
| `src/sonido/` | Sintetizador de motor, efectos y música |

Tecnologías: Three.js, Vite y Vitest. Sin motor de física externo.

## Rendimiento

- Meta: 60 cuadros por segundo con 2 jugadores en el notebook.
- Formas simples con colores planos; sin texturas pesadas.
- Sombra bajo cada kart con un círculo oscuro, sin mapas de sombras.
- La niebla oculta lo lejano y limita lo que se dibuja.
- La resolución interna se limita para pantallas de alta densidad.

## Publicación

- Repositorio nuevo `ole-kart` en GitHub, separado del Tablao, publicado con GitHub Pages en `https://chalofster.github.io/ole-kart/`.
- Carpeta local: `C:\Users\Gfigueroa\OleKart`.
- Publicar requiere la confirmación explícita de Gonzalo.

## Errores y casos límite

| Situación | Comportamiento |
|---|---|
| Un control se desconecta durante la carrera | La carrera se pausa y muestra el ícono del control con el color del jugador afectado; continúa al reconectarlo o al presionar una tecla del teclado para reemplazarlo |
| No hay controles | Se juega 1 jugador con el teclado |
| La ventana pierde el foco | La carrera se pausa |
| El computador va lento | La simulación sigue a 60 pasos por segundo; solo se dibujan menos cuadros |
| El navegador no tiene WebGL | Pantalla con un ícono de aviso en vez de una pantalla negra |

## Pruebas

- **Automáticas (Vitest):** avance del kart, frenado, velocidad fuera de pista y rebote en vallas; carga de derrape y duración de turbos; flechas de turbo; conteo de vueltas con atajos y retrocesos; orden de posiciones; impulso para quien va atrás y ritmo de los rivales; modo ayuda que mantiene el kart dentro de la pista; una carrera completa simulada sin pantalla en la que los 8 karts del computador terminan las 3 vueltas, sin quedar detenidos y en un tiempo razonable.
- **En el navegador:** recorrido completo con controles simulados en 1 y 2 jugadores, capturas de pantalla y medición de cuadros por segundo.
- **Real:** los niños con los controles en el notebook.

## Fuera de alcance

Objetos, otras pistas, modo batalla, juego en línea, instalación sin conexión y récords guardados.
