import { dataSchema } from './schema.js';
import { MAX_BACKUP_BYTES } from '../state/storage.js';

export function parseBackup(text) {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new Error('Choose a JSON backup smaller than 5 MB.');
  return dataSchema.parse(JSON.parse(text));
}
export function download(text, filename) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
