import { defaultData } from '../data/templates.js';
import { today } from '../lib/dates.js';
import { dataSchema } from '../lib/schema.js';
import { reducer } from '../lib/reducer.js';

export const STORAGE_KEY = 'gym_workout:forge:v1';
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
export function createStore(storage) {
  const listeners = new Set();
  let snapshot;
  function read() {
    const raw = storage.getItem(STORAGE_KEY);
    return raw == null ? defaultData(today()) : dataSchema.parse(JSON.parse(raw));
  }
  function load() {
    try { snapshot = { data: read(), problem: null }; }
    catch { snapshot = { data: defaultData(today()), problem: 'Saved data could not be read. It has not been overwritten. Export the stored text below, or restore a valid backup in Settings.' }; }
  }
  load();
  return {
    getSnapshot: () => snapshot,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    reload() { load(); listeners.forEach(fn => fn()); },
    dispatch(action) {
      // Read the latest disk copy to avoid overwriting an already-saved other-tab change.
      let data;
      if (action.type === 'data/import') data = snapshot.data;
      else {
        if (snapshot.problem) throw new Error('Restore a valid backup in Settings before changing unreadable saved data.');
        data = read();
      }
      const next = dataSchema.parse(reducer(data, action));
      try { storage.setItem(STORAGE_KEY, JSON.stringify(next)); }
      catch { throw new Error('Could not save. Browser storage is full or blocked. Your previous saved data is unchanged; export a backup from Settings.'); }
      // Notify React only after persistence succeeds. Never show a false saved state.
      snapshot = { data: next, problem: null };
      listeners.forEach(fn => fn());
      return next;
    },
    raw: () => storage.getItem(STORAGE_KEY) || '',
  };
}
