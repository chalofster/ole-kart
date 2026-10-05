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
