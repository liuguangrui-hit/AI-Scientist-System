// The forest at scale: the standalone 2D / 3D views, framed inside the workbench.
// They draw generated demo data (dozens of ideas, ~1k hypotheses), not this workspace,
// so they sit beside the panorama as a picture of the model rather than a view of your data.
import { html, useScreen, L, LANG, I, Fragment } from './common.js';
import { go } from '../app.js';

function ForestView({ dim, q, onShell }) {
  useScreen(dim === '3d' ? 'forest3d' : 'forest2d', {}, onShell);
  const src = `forest/${dim}.html?mode=embed&lang=${LANG}`;
  return html`<${Fragment}>
    <div class="toolbar">
      <div class="seg">
        <button class=${dim === '3d' ? 'on' : ''} onClick=${() => go('/forest3d')}>${L('三维', '3D')}</button>
        <button class=${dim === '2d' ? 'on' : ''} onClick=${() => go('/forest2d')}>${L('二维', '2D')}</button>
      </div>
      <span class="chip">${L('大规模结构 · 生成数据', 'At scale · generated data')}</span>
      <div class="grow"></div>
      <span class="tiny faint hide-s">${dim === '3d'
        ? L('每个 idea 一棵树，高度 = 深度；共享假设位于各树之间', 'One tree per idea, height = depth; shared hypotheses sit between trees')
        : L('六个研究方向按扇区分布，跨方向的边汇向中心', 'Six research themes by sector; cross-theme edges bundle to the centre')}</span>
      <a class="btn sm" href="/panorama">${I('net', { s: 13 })}${L('本工作区的假设全景', 'This workspace’s panorama')}</a>
      <a class="btn sm hide-s" href=${`forest/${dim}.html?lang=${LANG}`} target="_blank" rel="noopener">${L('全屏打开', 'Open full screen')} ↗</a>
    </div>
    <div class="forest-wrap">
      <iframe key=${src} src=${src} title=${L(dim === '3d' ? '三维假设森林' : '二维假设森林', dim === '3d' ? '3D hypothesis forest' : '2D hypothesis forest')}></iframe>
    </div>
  <//>`;
}

export const Forest3D = (p) => html`<${ForestView} dim="3d" ...${p} />`;
export const Forest2D = (p) => html`<${ForestView} dim="2d" ...${p} />`;
