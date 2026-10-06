import { useSyncExternalStore } from 'react';

const KEY = 'favorites';

function read() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    if (!Array.isArray(list)) return [];
    // Los favoritos guardados antes de existir las series no tienen "type": son películas
    return list.map(item => ({ ...item, type: item.type || 'movie' }));
  } catch {
    return []; // si el JSON está dañado, empieza vacío en vez de romper la página
  }
}

// Un solo almacén compartido por todos los componentes
let cache = read();
const listeners = new Set();

function emit() {
  listeners.forEach(listener => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Cambios hechos desde otra pestaña del navegador
window.addEventListener('storage', (e) => {
  if (e.key === KEY || e.key === null) {
    cache = read();
    emit();
  }
});

const same = (item, id, type) => item.id === id && item.type === type;

function write(list) {
  cache = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (error) {
    console.error(error); // modo privado o almacenamiento lleno: sigue funcionando en memoria
  }
  emit();
}

// Cada corazón solo se vuelve a dibujar si SU estado (true/false) cambia
export function useIsFavorite(id, type = 'movie') {
  return useSyncExternalStore(subscribe, () => cache.some(item => same(item, id, type)));
}

export function toggleFavorite(item, type = 'movie') {
  const exists = cache.some(fav => same(fav, item.id, type));
  write(
    exists
      ? cache.filter(fav => !same(fav, item.id, type))
      : [...cache, { id: item.id, type, title: item.title ?? item.name, poster_path: item.poster_path }]
  );
}

// Lista completa (para la página de favoritos)
export default function useFavorites() {
  const favs = useSyncExternalStore(subscribe, () => cache);
  return { favs };
}