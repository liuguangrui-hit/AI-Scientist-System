// The API, run in the browser. Emitted as js/local.js by tools/build-pages.mjs,
// next to a copy of the server modules in js/engine/. Same functions the Node
// server calls; the visitor's workspace is kept in localStorage instead of on disk.
import { buildView, act as apply, SCREENS } from './engine/api.js';
import { makeWorkspace } from './engine/seed.js';
import { tick } from './engine/engine.js';

const KEY = 'ais.workspace';
let ws = null;

function save() { try { localStorage.setItem(KEY, JSON.stringify(ws)); } catch { /* private mode: the session still works, it just won't survive a reload */ } }
function load() {
  try { const w = JSON.parse(localStorage.getItem(KEY)); if (w && w.v === 1) return w; } catch {}
  return null;
}
// get-or-create + advance the clock, as the server's store.get() does
function current() {
  if (!ws) ws = load() || makeWorkspace(Date.now());
  const before = ws.lastTick;
  tick(ws);
  if (ws.lastTick !== before) save();
  return ws;
}
// the server hands back JSON; hand back a copy so the screens never hold live state
const copy = (x) => JSON.parse(JSON.stringify(x));

export function view(screen, q = {}) {
  const s = String(screen || 'home').toLowerCase();
  if (!SCREENS.has(s)) throw new Error('view 404');
  return copy(buildView(current(), s, q));
}
export function act(body) {
  const r = apply(current(), body);
  save();
  return copy(r.body);
}
export function reset() {
  ws = makeWorkspace(Date.now());
  save();
}
