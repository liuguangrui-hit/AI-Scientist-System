// Router + workbench shell.
import { html, render, useState, useEffect, useRef, LANG, setLang, onLang, t, L, view, act, reset, onToast, I, clock, dur, useCallback, BASE, href, unbase } from './core.js';
import { Landing } from './landing.js';
import { Hero } from './hero.js';
import { SCREENS } from './screens/index.js';

// ---------------------------------------------------------------- router
// Routes are written as root paths ('/home', '/tree?idea=P-014') everywhere in the
// app; href()/unbase() map them onto BASE when the site lives under a sub-path.
const subs = new Set();
export function go(to, replace = false) {
  const u = new URL(href(to), location.origin);
  if (u.pathname + u.search === location.pathname + location.search) return;
  history[replace ? 'replaceState' : 'pushState']({}, '', u);
  subs.forEach((f) => f());
  const m = document.querySelector('.scroll');
  if (m) m.scrollTop = 0; else scrollTo(0, 0);
}
addEventListener('popstate', () => subs.forEach((f) => f()));
addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href]');
  if (!a) return;
  // In-page anchors: <base href> would resolve '#purpose' against the site root and
  // leave the page, so scroll within the current page instead.
  const raw = a.getAttribute('href');
  if (raw[0] === '#') {
    e.preventDefault();
    const el = raw.length > 1 && document.getElementById(raw.slice(1));
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.focus?.({ preventScroll: true }); history.replaceState(history.state, '', location.pathname + location.search + raw); }
    return;
  }
  if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const u = new URL(a.href);
  if (u.origin !== location.origin || !u.pathname.startsWith(BASE) || /\.\w+$/.test(u.pathname)) return;
  e.preventDefault();
  go(unbase(u.pathname) + u.search);
});
// Under a sub-path, give every '/…' link its real address so that opening it in a
// new tab, copying it or hovering it shows the right URL.
if (BASE !== '/') {
  const fix = (a) => { const h = a.getAttribute('href'); if (h && h[0] === '/' && !h.startsWith(BASE)) a.setAttribute('href', href(h)); };
  new MutationObserver((rows) => {
    for (const r of rows) {
      if (r.type === 'attributes') { if (r.target.tagName === 'A') fix(r.target); continue; }
      for (const n of r.addedNodes) if (n.nodeType === 1) { if (n.tagName === 'A') fix(n); n.querySelectorAll?.('a[href^="/"]').forEach(fix); }
    }
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });
}
function useRoute() {
  const [, bump] = useState(0);
  useEffect(() => { const f = () => bump((x) => x + 1); subs.add(f); return () => subs.delete(f); }, []);
  const p = unbase(location.pathname).replace(/^\/|\/$/g, '');
  return { screen: p || '', q: Object.fromEntries(new URLSearchParams(location.search)) };
}
export const qs = (patch) => {
  const u = new URL(location.href);
  for (const [k, v] of Object.entries(patch)) v == null ? u.searchParams.delete(k) : u.searchParams.set(k, v);
  return unbase(u.pathname) + (u.search || '');
};

// ---------------------------------------------------------------- data hook
export function useView(screen, q, deps = []) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const key = screen + JSON.stringify(q);
  const load = useCallback(async (quiet) => {
    try { const d = await view(screen, q); setData(d); setErr(null); } catch (e) { if (!quiet) setErr(e.message); }
  }, [key]);
  useEffect(() => { let live = true; setData(null); view(screen, q).then((d) => live && setData(d)).catch((e) => live && setErr(e.message)); return () => { live = false; }; }, [key, ...deps]);
  return [data, load, err];
}
// polls while something is live on screen
export function useTick(ms, fn, on = true) {
  useEffect(() => {
    if (!on) return;
    const id = setInterval(fn, ms);
    return () => clearInterval(id);
  }, [on, fn]);
}

// ---------------------------------------------------------------- shell chrome
const NAV = [
  { k: 'home', icon: 'home', zh: '总览', en: 'Overview' },
  { k: 'main', icon: 'board', zh: '工作台', en: 'Workbench' },
  { k: 'survey', icon: 'book', zh: '文献调研', en: 'Literature', count: 'library', subs: [
    { k: 'survey', zh: '文献采集', en: 'Collection' }, { k: 'trends', zh: '趋势分析', en: 'Trends' }, { k: 'sparks', zh: 'idea spark', en: 'Idea sparks' }, { k: 'digest', zh: '论文详情', en: 'Paper detail' }] },
  { k: 'ideas', icon: 'bulb', zh: 'Idea 立项', en: 'Idea intake', count: 'ideas' },
  { k: 'panorama', icon: 'net', zh: '假设网络', en: 'Hypotheses', count: 'hyps', subs: [
    { k: 'panorama', zh: '全景 · 全部 idea', en: 'Panorama · all ideas' }, { k: 'graph', zh: '共享关系 · 跨 idea', en: 'Shared · cross-idea' }, { k: 'tree', zh: '单 idea 树', en: 'Single-idea tree' },
    { k: 'forest3d', zh: '森林 · 三维', en: 'Forest · 3D' }, { k: 'forest2d', zh: '森林 · 二维', en: 'Forest · 2D' }] },
  { k: 'experiments', icon: 'flask', zh: '实验', en: 'Experiments', count: 'running', subs: [
    { k: 'experiments', zh: '单次实验', en: 'Single run' }, { k: 'exptree', zh: '实验树 · 四阶段', en: 'Experiment tree' }, { k: 'sweep', zh: '扫描矩阵', en: 'Sweep matrix' }, { k: 'runs', zh: '算力与失败', en: 'Compute & failures' }] },
  { k: 'review', icon: 'gavel', zh: '裁定队列', en: 'Verdict queue', count: 'pending', warn: true },
  { k: 'paper', icon: 'doc', zh: '论文', en: 'Paper', subs: [
    { k: 'paper', zh: '正文', en: 'Manuscript' }, { k: 'claims', zh: '主张 · 证据对照', en: 'Claims vs evidence' }, { k: 'figures', zh: '图表工作台', en: 'Figures' }, { k: 'rebuttal', zh: '审稿与修订', en: 'Review & rebuttal' }] },
];
const GROUP = {};
for (const n of NAV) { GROUP[n.k] = n.k; for (const s of n.subs || []) GROUP[s.k] = n.k; }

function Side({ screen, counts, ideas, agents, open, onClose }) {
  const group = GROUP[screen] || screen;
  return html`<nav id="workbench-nav" aria-label=${L('工作流导航', 'Workflow navigation')} class=${'side' + (open ? ' open' : '')} onClick=${(e) => e.target.closest('a') && onClose()}>
    <div class="cap">${L('工作流', 'WORKFLOW')}</div>
    ${NAV.map((n) => html`<${Fragment2}>
      <a class=${'nav' + (group === n.k ? ' on' : '')} href=${'/' + n.k}>
        ${I(n.icon, { c: group === n.k ? 'var(--acc)' : 'var(--mut2)' })}<span>${L(n.zh, n.en)}</span>
        ${n.count && counts[n.count] != null && html`<span class=${'n' + (n.warn && counts[n.count] > 0 ? ' warn' : '')}>${n.count === 'library' ? (counts.library >= 1000 ? (counts.library / 1000).toFixed(1) + 'k' : counts.library) : counts[n.count]}</span>`}
      </a>
      ${group === n.k && n.subs && n.subs.map((s) => html`<a class=${'nav sub' + (screen === s.k ? ' on' : '')} href=${'/' + s.k}>${L(s.zh, s.en)}</a>`)}
    <//>`)}
    <div style="height:14px"></div>
    <div class="cap">${L('进行中的 idea', 'IDEAS IN PROGRESS')}</div>
    ${ideas.filter((i) => i.status === 'running' || i.status === 'candidate').map((i) => html`
      <a class="nav sub" href=${'/tree?idea=' + i.id} style="gap:7px">
        <span class="dot" style=${{ background: i.color, width: '7px', height: '7px' }}></span>
        <span class="mono tiny" style="flex-shrink:0;white-space:nowrap">${i.id}</span><span class="ell" style="min-width:0">${t(i.name)}</span>
      </a>`)}
    <a class="nav sub" href="/ideas" style="color:var(--acc)">${L(`全部 ${ideas.length} 个 idea →`, `All ${ideas.length} ideas →`)}</a>
    <div class="binding">
      <div class="t">${L('当前模型配置', 'CURRENT BINDINGS')}</div>
      ${['surveyor', 'executor', 'reviewer'].map((role) => html`
        <select value=${agents[role]} aria-label=${role} onChange=${async (e) => { await act('agent.bind', { role, model: e.target.value }); location.reload(); }}>
          ${['deepseek', 'codex', 'claude', 'gpt', 'gemini'].map((m) => html`<option value=${m}>${role} · ${m}</option>`)}
        </select>`)}
    </div>
  </nav>`;
}
const Fragment2 = ({ children }) => children;

function Top({ screen, shell, onMenu, open }) {
  const c = shell.counts;
  const title = (() => {
    for (const n of NAV) { if (n.k === screen) return L(n.zh, n.en); for (const s of n.subs || []) if (s.k === screen) return L(s.zh, s.en); }
    return L('工作台', 'Workbench');
  })();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(i); }, []);
  return html`<header class="topbar">
    <button class="btn xs menub" onClick=${onMenu} aria-label=${L(open ? '关闭菜单' : '菜单', open ? 'Close menu' : 'Menu')} aria-expanded=${open} aria-controls="workbench-nav">${I(open ? 'x' : 'menu', { s: 18 })}</button>
    <a class="brand" href="/">${I('logo', { s: 19, c: 'var(--ink)', w: 1.8 })}<span>AI Scientist</span></a>
    <span class="crumb">${title}</span>
    <span class="mono small b hide-s">${clock(now)}</span>
    <div class="grow"></div>
    <span class="small mut hide-s">${L(`最近一次无人值守运行 ${dur(shell.now - shell.createdAt + 33120000)}`, `Last unattended run: ${dur(shell.now - shell.createdAt + 33120000)}`)}</span>
    <${SourceBadge} src=${shell.source} />
    <button class="btn xs lang-toggle" onClick=${() => setLang(LANG === 'zh' ? 'en' : 'zh')} title="Language">${LANG === 'zh' ? 'EN' : '中文'}</button>
    ${c.pending > 0 && screen !== 'review' && html`<a class="btn sm pending-link" aria-label=${L(`${c.pending} 项待裁定`, `${c.pending} pending verdicts`)} href="/review" style="color:var(--warn);border-color:var(--warnln)">${I('warn', { s: 13, c: 'var(--warn)' })}${c.pending}</a>`}
    <a class="btn sm pri hide-s" href=${screen === 'main' ? '/home' : '/main'}>${screen === 'main' ? L('返回总览', 'Overview') : L('进入工作台', 'Workbench')}</a>
  </header>`;
}

// Which data you are looking at: the private demo workspace, or a live project
// directory on disk (read-only when the process cannot write to it).
function SourceBadge({ src }) {
  if (!src || src.mode === 'demo') return null;
  const bad = src.problems > 0;
  return html`<span class=${'chip source-badge ' + (bad ? 'warn' : 'ok')} title=${L('接入的真实项目目录', 'The live project directory in use')}>
    ${src.readonly ? L('真实项目 · 只读', 'Live project · read-only') : L('真实项目', 'Live project')}
    ${bad ? ' · ' + L(`${src.problems} 条数据问题`, `${src.problems} data problems`) : ''}</span>`;
}

function Toasts() {
  const [list, setList] = useState([]);
  useEffect(() => { onToast((x) => { setList((l) => [...l, x]); setTimeout(() => setList((l) => l.filter((y) => y.id !== x.id)), 4200); }); }, []);
  return html`<div class="toasts" role="status" aria-live="polite">${list.map((x) => html`<div key=${x.id} class=${'toast' + (x.bad ? ' bad' : '')}>${x.msg}</div>`)}</div>`;
}

const EMPTY_SHELL = { counts: {}, ideas: [], source: { mode: 'demo' }, agents: { surveyor: 'deepseek', executor: 'codex', reviewer: 'claude' }, now: Date.now(), createdAt: Date.now() };

function Workbench({ screen, q }) {
  const [open, setOpen] = useState(false);
  const [shell, setShell] = useState(null);
  const Screen = SCREENS[screen];
  const onShell = useCallback((s) => setShell(s), []);
  useEffect(() => { setOpen(false); }, [screen]);
  useEffect(() => {
    const wide = matchMedia('(min-width:1021px)');
    const close = () => { if (wide.matches) setOpen(false); };
    wide.addEventListener('change', close);
    return () => wide.removeEventListener('change', close);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const nav = document.getElementById('workbench-nav');
    nav?.querySelector('a')?.focus();
    const key = (e) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key !== 'Tab') return;
      const items = [...nav.querySelectorAll('a, button, select')];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [open]);
  if (!Screen) return html`<${NotFound} />`;
  // Top and Side always render (with an empty shell before the first payload):
  // conditionally mounting them would shift <main> and remount the screen.
  const s = shell || EMPTY_SHELL;
  return html`<div class="app">
    <${Top} screen=${screen} shell=${s} open=${open} onMenu=${() => setOpen((o) => !o)} />
    <div class="body">
      ${open && html`<button class="nav-backdrop" aria-label=${L('关闭导航', 'Close navigation')} tabIndex="-1" onClick=${() => setOpen(false)}></button>`}
      <${Side} screen=${screen} counts=${s.counts} ideas=${s.ideas} agents=${s.agents} open=${open} onClose=${() => setOpen(false)} />
      <main class="main"><${Screen} q=${q} onShell=${onShell} /></main>
    </div>
  </div>`;
}

const NotFound = () => html`<div class="sec" style="text-align:center">
  <h2 style="font-size:22px">404</h2>
  <p class="mut">${L('请求的页面不存在。', 'This page does not exist.')}</p>
  <p><a class="btn" href="/">${L('返回首页', 'Back to home')}</a></p></div>`;

function App() {
  const { screen, q } = useRoute();
  const [, bump] = useState(0);
  useEffect(() => onLang(() => bump((x) => x + 1)), []);
  useEffect(() => { document.documentElement.lang = LANG === 'zh' ? 'zh-CN' : 'en'; }, []);
  useEffect(() => {
    if (screen === '' || screen === 'about') return;   // the homepage and /about name themselves
    const titles = { home: L('总览', 'Overview'), main: L('工作台', 'Workbench'), forest3d: L('森林 · 三维', 'Forest · 3D'), forest2d: L('森林 · 二维', 'Forest · 2D') };
    document.title = (titles[screen] || screen.replace(/^\w/, (c) => c.toUpperCase())) + ' · AI Scientist';
  }, [screen, LANG]);
  return html`<${Fragment2}>
    ${screen === '' ? html`<${Hero} />` : screen === 'about' ? html`<${Landing} about />` : html`<${Workbench} screen=${screen} q=${q} />`}
    <${Toasts} />
  <//>`;
}

render(html`<${App} />`, document.getElementById('app'));
export { reset };
