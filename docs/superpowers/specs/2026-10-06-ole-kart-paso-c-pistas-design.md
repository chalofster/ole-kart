---
titulo: Olé Kart, paso C, más pistas
fecha: 06-10-2026
estado: en revisión
---

## Objetivo

Sumar 4 pistas nuevas con ambiente y música propios, y que los niños elijan la pista antes de cada carrera. El manejo es igual en todas: la variedad viene de la forma, el largo, las curvas, los turbos, las rampas y las cajas.

## Contexto

- Parte de lo publicado hasta el paso de personajes (05-10-2026). Todo lo que este documento no cambia sigue rigiéndose por las especificaciones anteriores de `docs/superpowers/specs/`.
- Hoy hay una sola pista, "Noche de Thriller": 993 unidades; una carrera de 3 vueltas dura cerca de 130 s en 🐢 y 85 s en 🚀. La pista, el ambiente de noche, las 4 filas de cajas y la música están fijos en el código.
- Decisiones tomadas con Gonzalo: 4 pistas (feria flamenca de día, playa, ciudad disco de noche con neón, montaña nevada); elegir antes de cada carrera como un paso más del menú, con dibujo del recorrido y 🎲; mismo manejo en todas; una música original por ambiente, y la canción propia 🎵 reemplaza a todas; entrega en dos partes.
- Enfoque aprobado: cada pista es una ficha completa (recorrido, cajas, rampas, aspecto, decorado y música). Al elegir otra pista, el juego arma ese mundo y libera el anterior; en memoria vive un solo ambiente a la vez.

## Entregas

| Entrega | Contenido |
|---|---|
| 1 | Pistas como fichas (Noche pasa a ser la primera), paso 🗺️ del menú con 🎲, botón 🗺️ en el podio, música por partitura, 🎡 Feria flamenca y 🏖️ Playa |
| 2 | 🪩 Ciudad disco y 🏔️ Montaña nevada |

Una sola especificación (esta) y un plan por entrega. Cada entrega se publica con la confirmación de Gonzalo.

## Menú y flujo

### Paso 🗺️ del menú

Después de 👤👥 (jugadores) y 🐢🐇🚀 (velocidad) viene la pista.

| Elemento | Diseño |
|---|---|
| Tarjetas | Una por pista, en fila: 🌙 Noche de Thriller, 🎡 Feria flamenca, 🏖️ Playa, 🪩 Ciudad disco, 🏔️ Montaña nevada, y al final 🎲. En la entrega 1: 🌙, 🎡, 🏖️ y 🎲 |
| Cada tarjeta | Dibujo del recorrido visto desde arriba, con la meta marcada, sobre los colores de su ambiente; ícono de la pista y nombre en letra pequeña |
| Controles | Izquierda y derecha mueven el marco; A elige; B vuelve al paso de velocidad. Con el mouse, tocar una tarjeta la elige. Cualquiera de los dos controles puede elegir, como en el resto del menú |
| Dónde parte el marco | En la última pista corrida en esta sesión; la primera vez, en Noche |
| 🎲 | Al elegirlo, el marco recorre las tarjetas durante 1 s (como la ruleta de los objetos) y se detiene en una pista distinta de la última corrida. Durante ese segundo no se aceptan pulsaciones |

### Recorrido de pantallas

1. Menú: 👤👥 → 🐢🐇🚀 → 🗺️.
2. Selección de personajes. Si la pista elegida no es la que está armada, el mundo nuevo se arma al pasar a la selección, que no lo muestra; no hay espera visible.
3. Carrera en la pista elegida.
4. Podio:

| Botón | Qué hace |
|---|---|
| 🔁 | Otra carrera en la misma pista, con los mismos personajes y la misma velocidad (como hoy) |
| 🗺️ (nuevo) | Abre solo el paso de pista; al elegir, va directo a la carrera con los mismos personajes y la misma velocidad. B en ese paso vuelve al podio |
| 🏠 | Vuelve al inicio |

Con el control, izquierda y derecha mueven el marco entre los tres botones y A elige. El marco parte en 🔁, así que A sola repite la carrera como hoy, y B sigue llevando al inicio.

- La carrera de fondo del inicio muestra la última pista corrida; no cambia mientras se mueve el marco.

## Recorridos

### Reglas comunes

| Regla | Valor |
|---|---|
| Ancho del camino, vallas y manejo | Iguales a Noche (`MEDIO_ANCHO`, `VALLA`, reglas del kart sin cambios) |
| Largo | Entre 850 y 1.250 unidades |
| Curvas | Ninguna más cerrada que la horquilla de Noche: las vallas no se pliegan en ninguna curva |
| Separación | Las partes de la pista que no son vecinas quedan separadas por más que dos vallas y un margen, como en Noche |
| Meta | En el primer punto del recorrido; la parrilla de salida cabe en la recta anterior |
| Puntos de control | 16, como hoy |
| Turbos | De 1 a 3 grupos de flechas |
| Rampas | 1 o 2, con la misma forma de hoy, cada una en una recta para que el kart aterrice sobre el camino |
| Cajas | De 3 a 5 filas de 4 cajas, cada pista con las suyas; a más de 20 unidades de turbos y rampas, como hoy |
| Rivales | Los 8 karts del computador terminan las 3 vueltas en las 3 velocidades, sin quedarse atascados |
| Modo ayuda | Mantiene el kart dentro del camino en todas las curvas |

### Carácter de cada pista

| Pista | Forma | Largo aprox. | Turbos | Rampas | Filas de cajas |
|---|---|---|---|---|---|
| 🌙 Noche de Thriller | Sin cambios | 993 | 3 | 1 | 4 (las de hoy) |
| 🎡 Feria flamenca | "Calles" de la feria: esquinas en ángulo recto suavizadas y un zigzag entre las casetas | 1.100 | 2 | 1 | 4 |
| 🏖️ Playa | Rápida y abierta: curvas amplias por la orilla, una recta larga junto al mar y dos saltos en las dunas | 1.200 | 3 | 2 | 4 |
| 🪩 Ciudad disco | Compacta, con muchas curvas alrededor de la pista de baile | 900 | 3 | 1 | 5 |
| 🏔️ Montaña nevada | Caracoles: curvas de ida y vuelta por la ladera, al estilo de los de la cordillera | 1.100 | 2 | 1 | 4 |

- Las formas y largos son aproximados: cada recorrido se dibuja punto a punto y se ajusta hasta cumplir las reglas comunes.
- El camino es plano en todas; los caracoles suben solo en el dibujo del decorado.

## Ambientes

### Reglas comunes

| Regla | Detalle |
|---|---|
| Qué define cada ambiente | Cielo, sol o luna, luz, neblina a lo lejos, suelo, colores del camino, bordes y vallas, arco de meta y decorado |
| Estilo | El decorado nuevo usa los materiales de sombras planas de 3 tonos de los personajes (`dibujo` de `estilo.js`), sin contorno. Noche queda como está |
| Camino visible | El color del camino contrasta con el del suelo en cada ambiente: razón de contraste de al menos 1,5 (la de Noche, que se ve bien, es cerca de 1,75) |
| Rendimiento | 60 cuadros por segundo con 2 jugadores en cada pista. Las piezas repetidas del decorado se juntan por color para dibujar pocas cosas por cuadro |
| Originalidad | Sin marcas, logos ni personajes de otros juegos o películas |

### Cada ambiente

| Pista | Cielo y luz | Suelo y camino | Decorado |
|---|---|---|---|
| 🌙 Noche | Sin cambios | Sin cambios | Sin cambios |
| 🎡 Feria flamenca | Día de sol, celeste, luz cálida | Albero (tierra amarilla de la feria); bordes y vallas a franjas rojas y blancas | Casetas a rayas con techo a dos aguas, farolillos de colores en hileras, naranjos con naranjas, una noria a lo lejos. Meta: portada de feria decorada |
| 🏖️ Playa | Día de sol, azul intenso | Arena; mar turquesa a un costado hasta el horizonte, con una línea de espuma que va y viene; bordes azules y blancos | Palmeras, quitasoles de colores con toallas, castillos de arena, un faro a rayas. Las rampas se ven como dunas. Meta: arco de tablas de surf |
| 🪩 Ciudad disco | Noche morada | Asfalto oscuro con bordes de neón; un tramo de pista de baile con baldosas que se encienden al ritmo de la música (solo dibujo) | Edificios con letreros de neón de formas simples (estrellas, notas, rayos), focos que mueven haces de luz en el cielo, bola disco gigante sobre la meta |
| 🏔️ Montaña nevada | Día frío, celeste pálido, copos de nieve cayendo | Nieve; camino despejado con bordes de nieve y vallas de madera | Cordillera con cumbres nevadas al fondo, pinos con nieve, monos de nieve, una cabaña. Meta: arco de troncos |

- Lo que se mueve en el decorado (espuma, baldosas, focos, copos) usa el reloj del dibujo: queda quieto en pausa.

## Música

| Elemento | Diseño |
|---|---|
| Reproductor | Uno solo, que lee la partitura de la pista de la carrera: tempo, acordes, bajo, batería, melodía y sonido de cada instrumento |
| Noche | Su partitura reproduce la música actual nota por nota |
| Largo | Las partituras nuevas tienen 8 compases de 16 semicorcheas (dos frases que se alternan); Noche sigue con 4 |
| Tempo | Entre 100 y 170 pulsos por minuto |
| 🎵 Canción propia | Igual que hoy: si está puesta, reemplaza la música de todas las pistas |
| Cuándo suena | Solo en la carrera, como hoy |
| Volumen | El mismo de hoy en todas |

| Pista | Estilo | Rasgos |
|---|---|---|
| 🌙 Noche | Pop y funk de los 80 | Sin cambios |
| 🎡 Feria | Rumba | Palmas a contratiempo, guitarra rasgueada, la bajada andaluza de acordes (la menor, sol, fa, mi) |
| 🏖️ Playa | Surf | Rápida, guitarra de notas repetidas, redobles de batería |
| 🪩 Ciudad disco | Disco | Bombo en cada tiempo, bajo que salta de octava, acordes de cuerdas |
| 🏔️ Montaña | Invernal | Cascabeles y campanitas, alegre, en tono mayor |

- Todas son originales y sintetizadas en el navegador: ritmos y progresiones tradicionales (que no pertenecen a nadie) con melodías propias. No imitan ninguna canción conocida: ni villancicos, ni éxitos de surf o disco, ni *Thriller*.

## Arquitectura

| Parte | Cambio |
|---|---|
| `src/logica/pistas.js` (nuevo) | Catálogo de pistas: id, ícono, nombre y recorrido (puntos, turbos, rampas y filas de cajas). Noche es la primera |
| `src/logica/pista.js` | Admite varias rampas y guarda las filas de cajas de la pista; las demás funciones no cambian |
| `src/logica/objetos.js` | Las cajas salen de las filas de la pista, no de una constante fija |
| `src/logica/menu.js` | Tercer paso, pista, con 🎲 que no repite la última |
| `src/dibujo/ambientes/` (nuevo) | Un archivo por ambiente: cielo, luz, neblina, suelo, colores del camino, meta y decorado. `noche.js` toma lo de hoy sin cambios visibles |
| `src/dibujo/pista3d.js` | Colores del camino, bordes, vallas y meta vienen del ambiente; dibuja todas las rampas |
| `src/dibujo/escena.js` | El mundo se arma con el ambiente de la pista y se puede soltar entero |
| `src/sonido/musica.js` y partituras (nuevo) | Lectura genérica de una partitura; una partitura por pista |
| `src/sonido/sonido.js` | La música de la carrera recibe la partitura de la pista |
| `src/juego.js` | La pista y el mundo actuales cambian a pedido; el anterior se libera |
| `src/pantallas/` | Paso 🗺️ (dibujo de cada recorrido en su tarjeta), usado por el inicio y por el podio; botón 🗺️ en el podio |

## Casos límite

| Situación | Comportamiento |
|---|---|
| Se elige la pista que ya está armada | No se vuelve a armar |
| 🎲 con una sola pista distinta posible | Sale esa |
| Pulsaciones durante la ruleta de 🎲 | Se ignoran hasta que se detiene |
| B en el paso 🗺️ abierto desde el podio | Vuelve al podio |
| Canción propia puesta | Suena en todas las pistas |
| Pausa o control desconectado | Igual que hoy; lo que se mueve del decorado queda quieto |
| Uno o dos jugadores | Igual en todas las pistas |
| Computador sin WebGL | Igual que hoy: aviso ⚠️🖥️ |

## Pruebas

- **Automáticas (Vitest):**
  - reglas de recorrido de cada pista: largo, curvas, separación, meta, turbos, rampas en recta y cajas lejos de turbos y rampas;
  - carrera simulada en cada pista y cada velocidad: los 8 rivales terminan sin atascarse, en un tiempo dentro del rango;
  - modo ayuda dentro del camino en cada pista;
  - contraste entre camino y suelo de cada ambiente;
  - menú: paso 🗺️ con controles y mouse, B vuelve, 🎲 no repite la última pista;
  - podio: 🔁 usa la misma pista; 🗺️ cambia la pista y conserva personajes y velocidad;
  - partituras: bucle exacto, bajo y acordes con notas del acorde, melodía en su escala y en todos los compases, tempo en rango; la de Noche da las mismas notas que hoy;
  - memoria: al cambiar de pista se libera el mundo anterior;
  - las pruebas actuales siguen pasando.
- **En el navegador:** 60 cuadros por segundo con 2 jugadores en cada pista; memoria estable tras cambiar de pista 4 veces; capturas de cada ambiente; sin errores.
- **Real:** los niños con los controles en el notebook.

## Punto de control

En cada entrega, al terminar la primera pista nueva (🎡 Feria en la entrega 1, 🪩 Ciudad disco en la 2), Gonzalo revisa su forma, su aspecto y su música en el navegador. La segunda pista se hace solo con su visto bueno. Si pide cambios, se ajusta antes de seguir.

## Publicación

Igual que los pasos anteriores: rama propia, punto de control con Gonzalo, revisión final independiente, unión a `main` y publicación en `https://chalofster.github.io/ole-kart/` con la confirmación de Gonzalo. Una publicación por entrega.

## Fuera de alcance

Copa de varias pistas, dificultad marcada por pista, manejo distinto según la pista (nieve que resbala, arena que frena, baldosas con turbo), desniveles reales, música en el menú, récords guardados, personalizar el kart (paso D) y modo batalla (paso E).
