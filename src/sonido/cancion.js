// La canción propia se guarda en el navegador de este computador (IndexedDB), para no elegirla cada vez.
// Nunca sale del computador. Si el navegador no deja guardar, solo dura mientras la página esté abierta.
const BASE = 'ole-kart';
const ALMACEN = 'cancion';

function abrir() {
  return new Promise((listo, error) => {
    const pedido = indexedDB.open(BASE, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore(ALMACEN);
    pedido.onsuccess = () => listo(pedido.result);
    pedido.onerror = () => error(pedido.error);
  });
}

async function usar(modo, accion) {
  const base = await abrir();
  return new Promise((listo, error) => {
    const tx = base.transaction(ALMACEN, modo);
    const pedido = accion(tx.objectStore(ALMACEN));
    tx.oncomplete = () => listo(pedido.result);
    tx.onerror = () => error(tx.error);
  });
}

export const guardarCancion = (archivo) => usar('readwrite', (a) => a.put(archivo, 'actual')).catch(() => {});
export const leerCancion = () => usar('readonly', (a) => a.get('actual')).catch(() => null);
export const borrarCancion = () => usar('readwrite', (a) => a.delete('actual')).catch(() => {});
