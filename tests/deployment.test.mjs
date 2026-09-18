import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { createServer } from 'vite';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('index.html', root), 'utf8');
const built = await readFile(new URL('docs/index.html', root), 'utf8');

function redirectFrom(html, href) {
  let redirected;
  const location = new URL(href);
  location.replace = target => { redirected = target; };
  const script = html.match(/<script id="hosting-fallback">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'entry includes a hosting fallback');
  runInNewContext(script, { URL, window: { location } });
  return redirected;
}

test('a statically published source root opens the build and preserves its route', () => {
  assert.equal(
    redirectFrom(source, 'https://example.github.io/gym_workout/?v=2#/workouts/new?routine=heavy'),
    'https://example.github.io/gym_workout/docs/?v=2#/workouts/new?routine=heavy',
  );
});

test('the built app does not redirect again from either publication folder', () => {
  for (const path of ['/gym_workout/', '/gym_workout/docs/']) {
    assert.equal(redirectFrom(built, `https://example.github.io${path}`), undefined);
  }
  assert.doesNotMatch(built, /%BASE_URL%|\/src\/main\.jsx/);
  assert.match(built, /Opening your training log/);
});

test('development replaces the fallback placeholder and stays on the dev server', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const html = await server.transformIndexHtml('/', source);
    assert.equal(redirectFrom(html, 'http://localhost:5173/'), undefined);
  } finally { await server.close(); }
});

test('all production assets resolve under both possible Pages locations', async () => {
  const names = await readdir(new URL('docs/assets/', root));
  for (const directory of ['/gym_workout/', '/gym_workout/docs/']) {
    const page = new URL(`https://example.github.io${directory}`);
    for (const [, ref] of built.matchAll(/(?:src|href)="(\.\/[^\"]+)"/g)) {
      const url = new URL(ref, page);
      assert.ok(url.pathname.startsWith(directory));
      await readFile(new URL(`docs/${url.pathname.slice(directory.length)}`, root));
    }
    let references = 0;
    for (const name of names.filter(name => name.endsWith('.js'))) {
      const contents = await readFile(new URL(`docs/assets/${name}`, root), 'utf8');
      for (const [, ref] of contents.matchAll(/["'](\.?\/?[A-Za-z0-9_-]+\.(?:js|css))["']/g)) {
        const url = new URL(ref, new URL(`assets/${name}`, page));
        assert.ok(url.pathname.startsWith(`${directory}assets/`));
        await readFile(new URL(`docs/${url.pathname.slice(directory.length)}`, root));
        references++;
      }
    }
    assert.ok(references > 20, 'checked the lazy-loaded page dependency graph');
  }
});
