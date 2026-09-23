// The front door: the 3D forest fills the screen and the words stay out of its way.
// The long explanatory page lives on at /about.
import { html, useEffect, useRef, useState, LANG, setLang, L, I } from './core.js';

export function Hero() {
  const frame = useRef(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { document.title = L('AI 科学家：动态假设-证据森林', 'AI Scientist: A Dynamic Hypothesis–Evidence Forest'); }, [LANG]);
  // Same-origin frame: while the visitor is dragging the forest, the type steps back.
  useEffect(() => {
    const f = frame.current;
    let win = null;
    const down = () => setBusy(true), up = () => setBusy(false);
    const hook = () => {
      win = f?.contentWindow;
      if (!win) return;
      win.addEventListener('pointerdown', down);
      win.addEventListener('pointerup', up);
      win.addEventListener('pointercancel', up);
    };
    f?.addEventListener('load', hook);
    return () => {
      f?.removeEventListener('load', hook);
      if (win) { win.removeEventListener('pointerdown', down); win.removeEventListener('pointerup', up); win.removeEventListener('pointercancel', up); }
    };
  }, []);
  return html`<div class=${'fh' + (busy ? ' busy' : '')}>
    <iframe ref=${frame} class="fh-gl" src=${'/forest/3d.html?mode=hero&lang=' + LANG} title=${L('动态假设-证据森林三维视图', 'The hypothesis–evidence forest in 3D')}></iframe>
    <div class="fh-shade" aria-hidden="true"></div>

    <nav class="fh-nav">
      <a class="fh-brand" href="/">${I('logo', { s: 17, c: 'currentColor', w: 1.8 })}<span>AI Scientist</span></a>
      <div class="grow"></div>
      <a href="/about" class="hide-s">${L('了解系统', 'About')}</a>
      <a href="/forest2d" class="hide-s">${L('二维森林', '2D forest')}</a>
      <button class="fh-lang" onClick=${() => setLang(LANG === 'zh' ? 'en' : 'zh')}>${LANG === 'zh' ? 'EN' : '中文'}</button>
    </nav>

    <header class="fh-copy">
      <div class="fh-eye">Dynamic Hypothesis–Evidence Forest</div>
      <h1>
        <span class="fh-k">${L('AI 科学家', 'AI Scientist')}</span><span class="sr">${L('：', ': ')}</span>
        <span class="fh-m">${L('动态假设-证据森林', 'A Dynamic Hypothesis–Evidence Forest')}</span>
      </h1>
      <p>${L('每棵树是一个 idea，每个光点是一条假设。证据从地面升起，共享假设在树与树之间架桥。',
        'Each tree is an idea, each point of light a hypothesis. Evidence rises from the ground; shared hypotheses bridge the trees.')}</p>
      <div class="fh-cta">
        <a class="fh-go" href="/home">${L('进入系统', 'Enter the system')}<span aria-hidden="true">→</span></a>
        <a class="fh-link" href="/about">${L('它如何工作', 'How it works')}</a>
      </div>
    </header>

    <div class="fh-foot">
      <div class="fh-keys">${L('拖动光点 · 拖动空白处环绕 · 滚轮远近 · 双击复位', 'Drag a light · drag empty space to orbit · scroll to zoom · double-click to reset')}</div>
      <div>${L('演示数据', 'Demo data')}</div>
    </div>
  </div>`;
}
