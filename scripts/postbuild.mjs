import { writeFile } from 'node:fs/promises';
// Avoid Jekyll processing. Vite has already produced the static site.
await writeFile(new URL('../docs/.nojekyll', import.meta.url), '');
console.log('GitHub Pages build ready in docs/ (publish main → /docs).');
