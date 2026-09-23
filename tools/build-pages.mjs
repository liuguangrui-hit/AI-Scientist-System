// Build the static site for GitHub Pages: the whole demo, no server.
//
//   node tools/build-pages.mjs              → _site/, served under /ai-scientist/
//   PAGES_BASE=/ node tools/build-pages.mjs → _site/, served at a domain root
//
// public/ is copied as is. The server's pure modules (api, views, actions, engine,
// seed, input) are copied to js/engine/ with a demo-only data source, and
// js/local.js runs them in the browser against a workspace in localStorage.
// index.html is told where it lives (<base href>) and to use the local engine.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '_site');
const BASE = (process.env.PAGES_BASE || '/ai-scientist/').replace(/^\/?/, '/').replace(/\/?$/, '/');

rmSync(OUT, { recursive: true, force: true });
cpSync(join(ROOT, 'public'), OUT, { recursive: true });

const ENGINE = join(OUT, 'js', 'engine');
mkdirSync(join(ENGINE, 'source'), { recursive: true });
for (const f of ['api.js', 'views.js', 'actions.js', 'engine.js', 'seed.js', 'input.js']) copyFileSync(join(ROOT, 'server', f), join(ENGINE, f));
copyFileSync(join(ROOT, 'tools', 'pages', 'source.js'), join(ENGINE, 'source', 'index.js'));
copyFileSync(join(ROOT, 'tools', 'pages', 'local.js'), join(OUT, 'js', 'local.js'));

const html = readFileSync(join(OUT, 'index.html'), 'utf8');
if (!html.includes('<base href="/">')) throw new Error('public/index.html lost its <base href="/">');
const page = html.replace('<base href="/">', `<base href="${BASE}">\n<meta name="ais-mode" content="local">`);
writeFileSync(join(OUT, 'index.html'), page);
// GitHub Pages answers unknown paths with 404.html: the same app, which then routes
// by the address bar, so a reload on /ai-scientist/tree?idea=P-014 still works.
writeFileSync(join(OUT, '404.html'), page);
writeFileSync(join(OUT, '.nojekyll'), '');

console.log(`Static site → _site/ (base ${BASE})`);
