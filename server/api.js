// The two API calls as plain functions: no HTTP, no disk. server/index.js wraps
// them in a request handler; the static GitHub Pages build runs them in the
// browser against a workspace kept in localStorage.
import * as V from './views.js';
import { apply } from './actions.js';

// screens the SPA owns
export const SCREENS = new Set(['', 'home', 'main', 'survey', 'trends', 'sparks', 'digest', 'ideas', 'panorama', 'graph', 'tree', 'experiments', 'exptree', 'sweep', 'runs', 'review', 'paper', 'claims', 'figures', 'rebuttal', 'events', 'about', 'forest3d', 'forest2d']);

export function buildView(ws, screen, q) {
  const base = { shell: V.shell(ws) };
  switch (screen) {
    case 'home': return { ...base, home: V.home(ws) };
    case 'main': return { ...base, main: V.main(ws) };
    case 'survey': return { ...base, survey: V.survey(ws) };
    case 'trends': return { ...base, trends: V.trends(ws) };
    case 'sparks': return { ...base, sparks: V.sparks(ws) };
    case 'digest': return { ...base, digest: V.digest(ws, q.id) };
    case 'ideas': return { ...base, ideas: V.ideas(ws) };
    case 'panorama': return { ...base, panorama: V.panorama(ws, q.h) };
    case 'graph': return { ...base, graph: V.graph(ws, q.h) };
    case 'tree': return { ...base, tree: V.tree(ws, q.idea, q.h) };
    case 'experiments': return { ...base, experiments: V.experiments(ws, q.e) };
    case 'exptree': return { ...base, exptree: V.exptree(ws, q.idea) };
    case 'sweep': return { ...base, sweep: V.sweep(ws) };
    case 'runs': return { ...base, runs: V.runs(ws) };
    case 'review': return { ...base, review: V.review(ws, q.h) };
    case 'paper': return { ...base, paper: V.paper(ws) };
    case 'claims': return { ...base, claims: V.claims(ws, q.c) };
    case 'figures': return { ...base, figures: V.figures(ws) };
    case 'rebuttal': return { ...base, rebuttal: V.rebuttal(ws) };
    case 'events': return { ...base, events: V.events(ws, q.kind) };
    default: return base;
  }
}

// POST /api/act: apply one op, then return the screens the client asked to refresh.
export function act(ws, body) {
  const r = apply(ws, String(body.op || '').slice(0, 40), body.args || {}, body.lang === 'en' ? 'en' : 'zh');
  const screens = Array.isArray(body.then) ? body.then : [];
  const views = {};
  for (const s of screens) if (SCREENS.has(s)) Object.assign(views, buildView(ws, s, body.q || {}));
  return { ok: r.ok, body: { ...r, views: { ...views, shell: V.shell(ws) } } };
}
