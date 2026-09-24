// The front door: the 3D forest fills the screen and the words stay out of its way.
// The long explanatory page lives on at /about.
import { html, useEffect, useRef, useState, LANG, setLang, L, I } from './core.js';
import { go } from './app.js';

// Whether this browser has seen the entrance before. Read once per page load.
const SEEN = 'ais.hero';
const seen = (() => { try { return !!localStorage.getItem(SEEN); } catch { return false; } })();

export function Hero() {
  const frame = useRef(null);
  const root = useRef(null);
  const [busy, setBusy] = useState(false);
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
  return html`<div ref=${root} class=${'fh' + (seen ? ' quick' : '') + (busy ? ' busy' : '')}>
    <iframe ref=${frame} class="fh-gl" src=${'forest/3d.html?mode=hero&lang=' + LANG + (seen ? '&quick' : '')} title=${L('动态假设-证据森林三维视图', 'The hypothesis–evidence forest in 3D')}></iframe>
    <div class="fh-shade" aria-hidden="true"></div>

    <nav class="fh-nav">
      <a class="fh-brand" href="/">${I('logo', { s: 17, c: 'currentColor', w: 1.8 })}<span>AI Scientist</span></a>
      <div class="grow"></div>
      <a href="/about">${L('系统介绍', 'About')}</a>
      <a href="/forest2d" class="hide-s">${L('二维森林', '2D forest')}</a>
      <button class="fh-lang" onClick=${() => setLang(LANG === 'zh' ? 'en' : 'zh')}>${LANG === 'zh' ? 'EN' : '中文'}</button>
      <a class="fh-enter" href="/home">${L('进入系统', 'Enter')}<span aria-hidden="true">→</span></a>
    </nav>

    <header class="fh-copy">
      <div class="fh-eye">Dynamic Hypothesis–Evidence Forest</div>
      <h1>
        <span class="fh-k">${L('AI 科学家', 'AI Scientist')}</span><span class="sr">${L('：', ': ')}</span>
        <span class="fh-m">${L('动态假设-证据森林', 'A Dynamic Hypothesis–Evidence Forest')}</span>
      </h1>
      <p>${L('每棵树是一个研究 idea，每个节点是一条假设。共享假设把不同的树连在一起。',
        'Each tree is a research idea. Each node is a hypothesis. Shared hypotheses connect the trees.')}</p>
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
