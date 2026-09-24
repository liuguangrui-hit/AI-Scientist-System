// The front door: the 3D forest fills the screen and the words stay out of its way.
// The long explanatory page lives on at /about.
import { html, useEffect, useRef, useState, LANG, setLang, L, I } from './core.js';
import { go } from './app.js';

// Whether this browser has seen the entrance before. Read once per page load.
const SEEN = 'ais.hero';
const seen = (() => { try { return !!localStorage.getItem(SEEN); } catch { return false; } })();

// One node opening into three, three closing into one, and the target both serve.
const glyph = (d) => html`<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"
  dangerouslySetInnerHTML=${{ __html: d }}></svg>`;
const FORK = glyph('<path d="M8 3.5 3 12.5M8 3.5v9M8 3.5l5 9"/><circle cx="8" cy="3" r="1.6" fill="currentColor" stroke="none"/><circle cx="3" cy="13" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="13" r="1.3" fill="currentColor" stroke="none"/><circle cx="13" cy="13" r="1.3" fill="currentColor" stroke="none"/>');
const MERGE = glyph('<path d="M3 3.5 8 12.5M8 3.5v9M13 3.5l-5 9"/><circle cx="3" cy="3" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="3" r="1.3" fill="currentColor" stroke="none"/><circle cx="13" cy="3" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="13" r="1.6" fill="currentColor" stroke="none"/>');

const AIM = glyph('<circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none"/>');
export function Hero() {
  const frame = useRef(null);
  const root = useRef(null);
  const copy = useRef(null);
  const [busy, setBusy] = useState(false);
  // On a phone or an upright tablet the forest takes the space above the words instead of sitting under them.
  const [top] = useState(() => matchMedia('(max-width:760px), (orientation:portrait)').matches);
  // The canvas still fills the screen, so a drag on the words turns the forest too;
  // the frame is told how much of the height above the words is its to draw in.
  useEffect(() => {
    const el = copy.current, r = root.current, f = frame.current;
    if (!el || !r || !top) return;
    const fit = () => {
      const h = Math.ceil(el.getBoundingClientRect().height), bottom = el.getBoundingClientRect().bottom;
      r.style.setProperty('--copy-h', h + 'px');
      r.style.setProperty('--copy-b', Math.round(innerHeight - bottom) + 'px');
      const nav = r.querySelector('.fh-nav')?.getBoundingClientRect().bottom || 52;
      const region = [nav / innerHeight, (bottom - h + 20) / innerHeight];
      try { if (f?.contentWindow) f.contentWindow.__heroRegion = region; } catch {}
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    f?.addEventListener('load', fit);
    addEventListener('resize', fit);
    return () => { ro.disconnect(); f?.removeEventListener('load', fit); removeEventListener('resize', fit); };
  }, [top]);
  useEffect(() => { try { localStorage.setItem(SEEN, '1'); } catch {} }, []);
  // Any sign of intent plays the rest of the entrance out at speed; Enter opens the system.
  // The forest frame is a separate window, so its input is forwarded here (see below).
  const hurry = useRef(null);
  useEffect(() => {
    let sped = false;
    const speed = () => {
      if (sped) return;
      sped = true;
      for (const a of root.current?.getAnimations?.({ subtree: true }) || []) if (a.playState !== 'finished') a.updatePlaybackRate(7);
    };
    const key = (e) => {
      if (e.key === 'Enter' && !e.target.closest?.('a,button,input,textarea')) { go('/home'); return; }
      speed();
    };
    hurry.current = { speed, key };
    const evs = ['pointerdown', 'wheel', 'touchstart'];
    evs.forEach((n) => addEventListener(n, speed, { passive: true }));
    addEventListener('keydown', key);
    return () => { evs.forEach((n) => removeEventListener(n, speed)); removeEventListener('keydown', key); };
  }, []);
  useEffect(() => { document.title = L('AI 科学家：动态假设-证据森林', 'AI Scientist: A Dynamic Hypothesis–Evidence Forest'); }, [LANG]);
  // Same-origin frame: while the visitor is dragging the forest, the type steps back.
  useEffect(() => {
    const f = frame.current;
    let win = null;
    const down = () => { setBusy(true); hurry.current?.speed(); }, up = () => setBusy(false);
    const wheel = () => hurry.current?.speed(), key = (e) => hurry.current?.key(e);
    const on = [['pointerdown', down], ['pointerup', up], ['pointercancel', up], ['wheel', wheel], ['keydown', key]];
    const hook = () => {
      win = f?.contentWindow;
      if (win) on.forEach(([n, h]) => win.addEventListener(n, h, { passive: true }));
    };
    f?.addEventListener('load', hook);
    return () => {
      f?.removeEventListener('load', hook);
      if (win) on.forEach(([n, h]) => win.removeEventListener(n, h));
    };
  }, []);
  return html`<div ref=${root} class=${'fh' + (top ? ' top' : '') + (seen ? ' quick' : '') + (busy ? ' busy' : '')}>
    <iframe ref=${frame} class="fh-gl" src=${'forest/3d.html?mode=hero&lang=' + LANG + (seen ? '&quick' : '') + (top ? '&fit=top' : '')} title=${L('动态假设-证据森林三维视图', 'The hypothesis–evidence forest in 3D')}></iframe>
    <div class="fh-shade" aria-hidden="true"></div>

    <nav class="fh-nav">
      <a class="fh-brand" href="/">${I('logo', { s: 17, c: 'currentColor', w: 1.8 })}<span>AI Scientist</span></a>
      <div class="grow"></div>
      <a href="/about">${L('系统介绍', 'About')}</a>
      <a href="/forest2d" class="hide-s">${L('二维森林', '2D forest')}</a>
      <button class="fh-lang" onClick=${() => setLang(LANG === 'zh' ? 'en' : 'zh')}>${LANG === 'zh' ? 'EN' : '中文'}</button>
      <a class="fh-enter" href="/home">${L('进入系统', 'Enter')}<span aria-hidden="true">→</span></a>
    </nav>

    <header class="fh-copy" ref=${copy}>
      <div class="fh-eye">Dynamic Hypothesis–Evidence Forest</div>
      <h1>
        <span class="fh-k">${L('AI 科学家', 'AI Scientist')}</span><span class="sr">${L('：', ': ')}</span>
        <span class="fh-m">${L('动态假设-证据森林', 'A Dynamic Hypothesis–Evidence Forest')}</span>
      </h1>
      <p>${L('每个 idea 拆解为一棵由实验检验的假设树，共享假设把树连成森林。',
        'Each idea is a tree of hypotheses tested by experiments. Shared hypotheses join the trees into a forest.')}</p>
      <div class="fh-idea">
        <div class="fh-f">
          <div class="fh-fk">${FORK}${L('展开', 'Expand')}</div>
          <b>${L('苏格拉底式追问', 'Socratic questioning')}</b>
          <span>${L('多 agent 层层追问，直至假设可检验', 'Agents ask until each hypothesis is testable')}</span>
        </div>
        <div class="fh-f">
          <div class="fh-fk">${MERGE}${L('收敛', 'Converge')}</div>
          <b>${L('奥卡姆剃刀', "Occam's razor")}</b>
          <span>${L('强化学习将具体假设抽象为普适假设', 'RL abstracts specific hypotheses into general ones')}</span>
        </div>
      </div>
      <div class="fh-goal">
        <div class="fh-fk">${AIM}${L('整体目标', 'Objective')}</div>
        <b>${L('以最精简的假设，解释最多的实验证据', 'The fewest hypotheses that explain the most experimental evidence')}</b>
      </div>
      <div class="fh-cta">
        <a class="fh-go" href="/home">${L('进入系统', 'Enter the system')}<span aria-hidden="true">→</span></a>
        <a class="fh-link" href="/about">${L('系统原理', 'How it works')}</a>
      </div>
    </header>

    <div class="fh-foot">
      <div class="fh-keys"><kbd>Enter</kbd>${L('进入系统 · 拖动节点 · 拖动空白处旋转视角 · 滚轮缩放 · 双击复位', 'enter the system · drag a node · drag empty space to rotate · scroll to zoom · double-click to reset')}</div>
    </div>
  </div>`;
}
