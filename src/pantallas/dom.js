// Solo se usa con textos e íconos fijos del juego.
export function el(etiqueta, clase, contenido = '') {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  e.innerHTML = contenido;
  return e;
}
