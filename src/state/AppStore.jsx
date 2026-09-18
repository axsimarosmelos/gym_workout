import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { createStore, STORAGE_KEY } from './storage.js';

// Access may itself throw in restricted browsers; the wrapper preserves the error path.
const store = createStore({ getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) });
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) store.reload(); });
const AppContext = createContext(null);
export function AppProvider({ children }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const value = useMemo(() => ({ ...snapshot, dispatch: store.dispatch, raw: store.raw }), [snapshot]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp() { return useContext(AppContext); }
