import { useSyncExternalStore } from 'react';

function subscribe(callback) { window.addEventListener('hashchange', callback); return () => window.removeEventListener('hashchange', callback); }
const snapshot = () => window.location.hash || '#/';
export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, snapshot);
  const [path, query = ''] = hash.slice(1).split('?');
  return { path: path || '/', params: new URLSearchParams(query) };
}
export function go(path) { window.location.hash = path; }
