// Overview (Home), global Workbench (Main), and the full event stream.
import { html, useState, useEffect, useRef, useScreen, Frame, Card, Table, Kpi, Loading, ErrBox, Empty, t, L, I, St, Chip, Bar, Score, IdeaTag, ic, dur, ago, hm, clock, pct, Meter, Evidence } from './common.js';
import { go } from '../app.js';

export function Home({ q, onShell }) {
  const { data, act } = useScreen('home', {}, onShell);
  if (!data) return html`<${Loading} />`;
  const d = data.home, c = data.shell.counts;
  return html`<${Frame}>
    <${Card} title=${L('研究流程', 'Pipeline')} sub=${L('从文献采集到论文成稿的完整流程，各环节均可展开查看', 'The full pipeline from literature collection to manuscript; every stage can be inspected')}>
      <div class="pipe">
        ${d.pipeline.map((p, i) => html`
          ${i > 0 && html`<div class="arrow">${I('arrow', { s: 14, c: 'var(--faint2)' })}</div>`}
          <${Kpi} k=${t(p.label)} v=${html`${p.n.toLocaleString()} <span style="font-size:12px;color:var(--mut2)">${t(p.unit)}</span>`} s=${t(p.sub)} warn=${p.warn} onClick=${() => go(p.go)} />`)}
      </div>
    <//>

    <div class="cols2" style="margin-top:12px">
      <div class="col">
        <${Card} title=${d.star ? L(`同一假设被 ${d.star.places.length} 个 idea 引用`, `One hypothesis cited by ${d.star.places.length} projects`) : L('共享假设', 'Shared hypotheses')}
          right=${html`<a href=${'/graph?h=' + d.star?.id}>${L('查看共享关系 →', 'See shared hypotheses →')}</a>`}>
          ${d.star ? html`<${Fragment}>
            <div class="row" style="margin-bottom:4px">
              <span class="mono b">${d.star.id}</span><${St} s=${d.star.status} /><${Score} v=${d.star.score} />
              <span class="small mut" style="flex:1 1 220px">${t(d.star.claim)}</span>
            </div>
            <div class="small mut" style="line-height:1.7">${L('假设是全局实体，不属于任何一个 idea。同一条假设在不同 idea 中可处于不同层级，一次实验的证据同时作用于所有引用它的 idea。',
              'A hypothesis is a global entity that belongs to no single project. It can sit at a different depth in each project, and evidence from one run applies to every project that cites it.')}</div>
            <${SharedMap} star=${d.star} />
            ${d.star.last && html`<div class="note row" style="margin-top:12px;gap:9px">
              <span class="mono b" style="color:var(--ink)">${d.star.last.exp}</span>
              <span style="color:var(--ink2)">${L(`写入 ${d.star.id} 证据`, `writes evidence to ${d.star.id}`)} <span class="num">${d.star.last.delta > 0 ? '+' : ''}${d.star.last.delta}</span></span>
              <span class="faint">→</span>
              <span style="color:var(--ink2);flex:1 1 180px">${L(`${d.star.places.length} 个 idea 的下游节点同步重估`, `downstream nodes in all ${d.star.places.length} projects are re-estimated together`)}</span>
              <a href=${'/panorama?h=' + d.star.id}>${L('在网络中查看 →', 'View in the network →')}</a>
            </div>`}
          <//>` : html`<${Empty}>${L('目前没有跨 idea 共享的假设。', 'No hypothesis is shared across projects right now.')}<//>`}
        <//>

        <${Card} title=${L('过去 24 小时', 'The last 24 hours')} sub=${L('系统自动完成的工作', 'Work completed automatically')}
          right=${html`<a href="/events">${L('完整事件流 →', 'Full event stream →')}</a>`}>
          <${Table}><tbody>
            ${d.last24.map((x) => html`<tr>
              <td style="width:58px;color:var(--faint)">${t(x.label)}</td>
              <td><div class="b">${t(x.head)}</div><div class="small mut" style="margin-top:3px">${t(x.body)}</div></td>
            </tr>`)}
          </tbody><//>
          <div class="note" style="margin-top:11px">${L(`过去 24 小时内无人工操作；最近一次人工介入：${clock(Date.now() - d.unattendedMs)}。`,
            `No manual operations in the last 24 hours. Last manual intervention: ${clock(Date.now() - d.unattendedMs)}.`)}</div>
        <//>
      </div>

      <div class="col">
        <${Card} title=${L('待人工决策', 'Pending decisions')} right=${html`<span class="chip ${d.decisions.length ? 'warn' : ''}">${d.decisions.length}</span>`}
          sub=${L('以下事项须由研究者决定', 'These decisions are reserved for the researcher')}>
          ${d.decisions.length === 0 ? html`<${Empty}>${L('当前没有待裁定事项。', 'Nothing needs your decision right now.')}<//>` : null}
          <div class="col">
            ${d.decisions.map((x) => html`
              <div style="padding:11px;border:1px solid var(--line);border-radius:6px">
                <div class="row">
                  ${x.kind === 'verdict' && html`<span class="mono b">${x.id}</span>`}
                  <span class="b small" style="flex:1 1 140px">${t(x.title)}</span>
                  ${x.badge && html`<${IdeaTag} id=${x.badge} />`}
                </div>
                <div class="small mut" style="margin-top:6px">${t(x.why)}</div>
                <div class="row" style="margin-top:9px">
                  <a class="btn sm acc" href=${x.go}>${t(x.cta)}</a>
                  <button class="btn sm" onClick=${() => act('decision.snooze', { id: x.kind === 'verdict' ? 'v:' + x.id : x.id })}>${L('暂缓处理', 'Defer')}</button>
                </div>
              </div>`)}
          </div>
        <//>

        <${Card} title=${L('agent 运行状态', 'Agent status')} sub=${L('各 agent 仅写入各自负责的文件', 'Each agent writes only to its own files')}>
          <div class="col">
            ${d.agents.map((a) => html`
              <div class="row" style="align-items:flex-start;cursor:pointer" onClick=${() => go(a.go)}>
                <span class="dot" style=${{ background: a.id === 'executor' ? 'var(--ok)' : a.id === 'reviewer' ? 'var(--acc)' : 'var(--faint2)', marginTop: '5px' }}></span>
                <div style="flex-grow:1">
                  <div class="row"><span class="b small">${a.id}</span><span class="mono tiny faint">${a.model}</span>
                    <div class="grow"></div><span class="tiny mut">${t(a.state)}</span></div>
                  <div class="tiny mut" style="margin-top:3px">${t(a.line)}</div>
                </div>
              </div>`)}
          </div>
        <//>

        <${Card} title=${L('本周算力', 'Compute this week')} right=${html`<a href="/runs">${L('算力与失败 →', 'Compute & failures →')}</a>`}>
          <div class="row"><span class="big">${d.budget.used}</span><span class="mut small">/ ${d.budget.total} GPU·h</span></div>
          <div style="margin-top:8px"><${Bar} v=${d.budget.used / d.budget.total} c=${d.budget.used / d.budget.total > 0.9 ? 'var(--bad)' : 'var(--acc)'} /></div>
        <//>
      </div>
    </div>
  <//>`;
}
const Fragment = ({ children }) => children;

// One shared hypothesis drawn inside each tree that cites it, and a single dashed
// thread through all of its positions. The thread is measured from the laid-out
// cards, so it follows them whether they sit side by side or stack on a phone.
function SharedMap({ star }) {
  const box = useRef(null);
  const [pts, setPts] = useState([]);
  const [cw, setCw] = useState(0);
  const tone = star.status === 'pending_review' ? 'var(--warn)' : 'var(--acc)';
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const o = el.getBoundingClientRect();
      setCw(Math.round(el.querySelector('.shmap-card')?.getBoundingClientRect().width || 0));
      setPts([...el.querySelectorAll('[data-star]')].map((n) => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2 - o.left, r.top + r.height / 2 - o.top]; }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [star.id, star.places.length]);
  // Trees are drawn in real pixels, so a node stays the same size on a phone.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const o = el.getBoundingClientRect();
    setPts([...el.querySelectorAll('[data-star]')].map((n) => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2 - o.left, r.top + r.height / 2 - o.top]; }));
  }, [cw]);
  const d = pts.map(([x, y], i) => {
    if (!i) return `M${x} ${y}`;
    const [px, py] = pts[i - 1], dx = x - px, dy = y - py;
    return Math.abs(dx) >= Math.abs(dy)
      ? `C${px + dx * 0.5} ${py} ${x - dx * 0.5} ${y} ${x} ${y}`
      : `C${px} ${py + dy * 0.5} ${x} ${y - dy * 0.5} ${x} ${y}`;
  }).join(' ');
  const rows = Math.max(...star.places.map((p) => depthOf(p.mini))) + 1;
  return html`<div class="shmap" ref=${box}>
    <div class="shmap-grid" style=${{ '--n': star.places.length }}>
      ${star.places.map((p) => html`<a class="shmap-card" href=${'/tree?idea=' + p.idea + '&h=' + star.id} style=${{ '--c': ic(p.idea) }}>
        <${MiniTree} nodes=${p.mini} rows=${rows} color=${ic(p.idea)} W=${cw || 200} />
        <div class="shmap-cap">
          <div class="row" style="gap:6px"><span class="dot" style=${{ background: ic(p.idea) }}></span><span class="mono b small" style="color:var(--ink)">${p.idea}</span><span class="small mut">${t(p.name)}</span></div>
          <div class="tiny faint" style="margin-top:3px">${p.role.kind === 'root' ? L('根前提', 'root premise') : L(`第 ${p.role.depth} 层`, `layer ${p.role.depth}`)}${p.role.leaf && p.role.kind !== 'root' ? L(' · 叶子', ' · leaf') : ''} · ${p.role.role === 'borrowed_assumption' ? L('借用前提', 'borrowed premise') : L('由本 idea 验证', 'proven here')}</div>
        </div>
      </a>`)}
    </div>
    <svg class="shmap-link" aria-hidden="true">
      <path d=${d} stroke=${tone} stroke-width="1.6" stroke-dasharray="5 4" fill="none" opacity=".85" />
      ${pts.map(([x, y]) => html`<g><circle cx=${x} cy=${y} r="8.5" fill="#fff" stroke=${tone} stroke-width="2.4" />
        <text x=${x} y=${y - 14} text-anchor="middle" class="shmap-id">${star.id}</text></g>`)}
    </svg>
  </div>`;
}
const depthOf = (nodes) => { const dep = {}; let m = 0; for (const n of nodes) { dep[n.k] = n.parent == null ? 0 : (dep[n.parent] ?? 0) + 1; m = Math.max(m, dep[n.k]); } return m; };

// A tidy little tree: leaves spread evenly, each parent centred over its children.
function MiniTree({ nodes, rows, color, W }) {
  const ROW = W < 170 ? 34 : 38, PAD = 28, M = Math.min(34, W * 0.16), H = PAD * 2 + (rows - 1) * ROW;
  const kids = {}, pos = {};
  for (const n of nodes) (kids[n.parent ?? ''] ||= []).push(n);
  let leaf = 0;
  const place = (n, dep) => {
    const ch = kids[n.k] || [];
    ch.forEach((c) => place(c, dep + 1));
    pos[n.k] = { y: PAD + dep * ROW, x: ch.length ? (pos[ch[0].k].x + pos[ch[ch.length - 1].k].x) / 2 : leaf++ };
  };
  (kids[''] || []).forEach((r) => place(r, 0));
  const span = Math.max(1, leaf - 1), sx = (x) => leaf < 2 ? W / 2 : M + (x / span) * (W - 2 * M);
  const on = new Set();
  for (let n = nodes.find((x) => x.on); n; n = nodes.find((x) => x.k === n.parent)) on.add(n.k);
  return html`<svg class="shmap-tree" viewBox=${`0 0 ${W} ${H}`} height=${H} aria-hidden="true">
    ${nodes.filter((n) => n.parent != null && pos[n.parent]).map((n) => html`<line x1=${sx(pos[n.parent].x)} y1=${pos[n.parent].y} x2=${sx(pos[n.k].x)} y2=${pos[n.k].y}
      stroke=${on.has(n.k) ? color : '#D5D9E0'} stroke-opacity=${on.has(n.k) ? 0.45 : 1} stroke-width="1.3" />`)}
    ${nodes.map((n) => n.on
      ? html`<circle data-star cx=${sx(pos[n.k].x)} cy=${pos[n.k].y} r="8.5" fill="none" />`
      : html`<circle cx=${sx(pos[n.k].x)} cy=${pos[n.k].y} r=${n.parent == null ? 6.5 : 5.5} fill=${color} />`)}
  </svg>`;
}

export function Main({ q, onShell }) {
  const { data, act } = useScreen('main', {}, onShell);
  const [sort, setSort] = useState('ideas');
  if (!data) return html`<${Loading} />`;
  const d = data.main;
  const fr = [...d.frontier].sort((a, b) => sort === 'ideas' ? b.ideas.length - a.ideas.length : a.id.localeCompare(b.id));
  return html`<${Frame} tools=${html`
    <span class="chip">${L('并发执行', 'Slots')} ${d.running.length}/${d.slots}</span>
    <span class="chip">${L('排队', 'Queued')} ${d.queued.length}</span>
    <div class="grow"></div>
    <a class="btn sm" href="/ideas">${I('plus', { s: 13 })}${L('新建 idea', 'New idea')}</a>`}>
    <div class="kpis">
      <${Kpi} k=${L('并行 idea', 'Parallel ideas')} v=${d.stats.parallel} s=${L(`${d.stats.candidates} 个待启动`, `${d.stats.candidates} to start`)} onClick=${() => go('/ideas')} />
      <${Kpi} k=${L('可执行假设', 'Global frontier')} v=${d.stats.frontier} s=${L('可立即执行', 'ready to run')} />
      <${Kpi} k=${L('运行中实验', 'Running')} v=${d.stats.running} s=${d.running.map((r) => r.id).join(' ')} onClick=${() => go('/experiments')} />
      <${Kpi} k=${L('待裁定', 'Pending verdicts')} v=${d.stats.pending} warn=${d.stats.pending > 0} s=${L('待处理', 'awaiting review')} onClick=${() => go('/review')} />
      <${Kpi} k=${L('每次实验平均关联', 'Ideas served per run')} v=${d.stats.perExp} s=${L('个 idea', 'ideas')} />
    </div>

    <div class="cols2" style="margin-top:12px">
      <${Card} title=${L('可执行假设', 'Global frontier')} sub=${L('依赖已满足的假设 · 跨全部 idea', 'Hypotheses whose dependencies are ready · across all projects')}
        right=${html`<div class="row"><span class="tiny faint">${L('排序', 'Sort')}</span>
          <div class="seg"><button class=${sort === 'ideas' ? 'on' : ''} onClick=${() => setSort('ideas')}>${L('覆盖 idea 数', 'Ideas covered')}</button>
          <button class=${sort === 'id' ? 'on' : ''} onClick=${() => setSort('id')}>ID</button></div></div>`}
        foot=${html`<button class="btn sm pri" onClick=${() => act('exp.runBatch', { hyps: fr.filter((f) => !f.queued).slice(0, 3).map((f) => f.id) })}>
            ${L('按优先级批量运行前 3 条', 'Queue the top 3 in order')}</button>
          <span class="tiny faint">${L('优先处理关联多个 idea 的假设', 'Hypotheses serving multiple projects take priority')}</span>`}>
        <${Table} class="frontier-table"><tbody>
          ${fr.map((f) => html`<tr class="clickable" onClick=${() => go('/panorama?h=' + f.id)}>
            <td style="width:112px">${f.ideas.map((i) => html`<${IdeaTag} id=${i} />`)}</td>
            <td style="width:52px" class="mono b">${f.id}</td>
            <td>${t(f.claim)}${f.ideas.length > 1 && html`<span class="chip acc" style="margin-left:7px">${L(`关联 ${f.ideas.length} 个 idea`, `serves ${f.ideas.length} ideas`)}</span>`}</td>
            <td style="width:88px"><${St} s=${f.needsDecompose ? 'untested' : f.status} label=${f.needsDecompose ? L('待拆解', 'to decompose') : f.rerun ? L('需重新运行', 'needs re-run') : undefined} /></td>
            <td style="width:92px;text-align:right" onClick=${(e) => e.stopPropagation()}>
              ${f.needsDecompose
                ? html`<button class="btn xs" onClick=${() => act('hyp.decompose', { hyp: f.id })}>${L('拆解', 'Decompose')}</button>`
                : f.queued ? html`<span class="chip">${L('已排队', 'queued')}</span>`
                : html`<button class="btn xs acc" onClick=${() => act('exp.run', { hyp: f.id })}>${L('运行实验', 'Run')}</button>`}
            </td>
          </tr>`)}
        </tbody><//>
      <//>

      <div class="col">
        <${Card} title=${L('并发执行', 'Execution slots')} sub=${L(`${d.running.length} / ${d.slots} 运行中 · 排队 ${d.queued.length}`, `${d.running.length} / ${d.slots} busy · ${d.queued.length} queued`)}
          right=${html`<a href="/experiments">${L('实验详情 →', 'Experiments →')}</a>`}>
          <div class="col">
            ${d.running.map((r) => html`
              <div style="padding:10px;border:1px solid var(--line);border-radius:6px;cursor:pointer" onClick=${() => go('/experiments?e=' + r.id)}>
                <div class="row">${r.ideas.map((i) => html`<${IdeaTag} id=${i} />`)}<span class="mono b">${r.id}</span>
                  <span class="mono tiny mut">${r.hyp}</span><div class="grow"></div>
                  <span class="tiny mut">${dur(r.etaMs)}</span></div>
                <div class="small mut" style="margin:6px 0">${t(r.claim)}</div>
                <${Bar} v=${r.prog} />
              </div>`)}
            ${d.queued.map((r) => html`
              <div class="row" style="padding:8px 10px;border:1px dashed var(--line);border-radius:6px;cursor:pointer" onClick=${() => go('/experiments?e=' + r.id)}>
                <span class="mono b small">${r.id}</span><span class="mono tiny mut">${r.hyp}</span>
                <span class="small mut" style="flex:1 1 90px">${t(r.label)}</span><${St} s="queued" /></div>`)}
          </div>
        <//>

        <${Card} title=${L('待裁定', 'Awaiting a verdict')} sub=${L('executor 已停止展开', 'the executor stops expanding here')}>
          <div class="col">
            ${d.pending.length === 0 && html`<${Empty}>${L('队列为空。', 'The queue is empty.')}<//>`}
            ${d.pending.map((v) => html`
              <div style="padding:10px;border:1px solid var(--warnln);background:var(--warnbg);border-radius:6px;cursor:pointer" onClick=${() => go('/review?h=' + v.id)}>
                <div class="row"><span class="mono b">${v.id}</span><span class="small" style="flex:1 1 120px">${t(v.claim)}</span><${Score} v=${v.score} /></div>
                <div class="row" style="margin-top:7px">${v.ideas.map((i) => html`<${IdeaTag} id=${i} />`)}</div>
                <div class="tiny mut" style="margin-top:6px">${v.impact.map((i) => i.kind === 'global' ? L(`${i.idea} 的根前提，裁定后整棵树重估`, `root premise of ${i.idea}; the whole tree is re-estimated`)
                  : i.kind === 'local' ? L(`${i.idea} 有独立证据，不受影响`, `${i.idea} has independent evidence`)
                  : L(`${i.idea} 下游 ${i.frozen} 个节点冻结`, `${i.frozen} downstream nodes freeze in ${i.idea}`)).join(' · ')}</div>
              </div>`)}
          </div>
        <//>

        <${Card} title=${L('活动', 'Activity')} right=${html`<a href="/events">${L('全部 →', 'All →')}</a>`}>
          <div class="list">
            ${d.events.map((e) => html`<div class="item" style="cursor:default;padding:8px 0">
              <span class="mono tiny faint" style="width:42px;flex-shrink:0">${hm(e.t)}</span>
              <div><div class="small">${t(e.title)}</div><div class="tiny mut" style="margin-top:2px">${t(e.detail)}</div></div>
            </div>`)}
          </div>
        <//>
      </div>
    </div>
  <//>`;
}

export function Events({ q, onShell }) {
  const [kind, setKind] = useState(q.kind || 'all');
  const { data } = useScreen('events', { kind }, onShell);
  if (!data) return html`<${Loading} />`;
  const d = data.events;
  const KINDS = { all: L('全部', 'All'), collect: L('采集', 'Collection'), experiment: L('实验', 'Experiments'), hypothesis: L('假设', 'Hypotheses'), verdict: L('裁定', 'Verdicts'), idea: 'Idea', paper: L('写作', 'Writing') };
  return html`<${Frame} tools=${html`<div class="seg">
      ${Object.entries(KINDS).map(([k, lab]) => html`<button class=${kind === k ? 'on' : ''} onClick=${() => setKind(k)}>${lab}</button>`)}
    </div><div class="grow"></div><span class="tiny faint">${d.list.length} ${L('条记录', 'entries')}</span>`}>
    <${Card} title=${L('事件流', 'Event stream')} sub=${L('各 agent 仅追加各自的记录，人工操作亦记录于此', 'Each agent appends only its own entries; manual actions are also recorded')}>
      <${Table}><tbody>
        ${d.list.map((e) => html`<tr>
          <td style="width:88px" class="mono tiny faint">${hm(e.t)}<div>${ago(e.t)}</div></td>
          <td style="width:74px"><span class="tag">${e.mod}</span></td>
          <td><div class="b small">${t(e.title)}</div><div class="tiny mut" style="margin-top:2px">${t(e.detail)}</div></td>
          <td style="width:80px;text-align:right">
            ${e.hyp && html`<a class="mono tiny" href=${'/panorama?h=' + e.hyp}>${e.hyp}</a>`}
            ${e.exp && html`<a class="mono tiny" href=${'/experiments?e=' + e.exp} style="margin-left:6px">${e.exp}</a>`}
          </td>
        </tr>`)}
      </tbody><//>
    <//>
  <//>`;
}
