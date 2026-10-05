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
