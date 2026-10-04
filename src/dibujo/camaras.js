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
