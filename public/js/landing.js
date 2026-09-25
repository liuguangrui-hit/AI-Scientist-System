// The public homepage: one long scrolling page that explains the system,
// then hands the visitor a live workbench.
import { html, useState, useEffect, useRef, LANG, setLang, t, L, I, view, reset } from './core.js';

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const show = (e) => e.classList.add('in');
    const all = () => ref.current?.querySelectorAll('.reveal:not(.in)') || [];
    if (!('IntersectionObserver' in window)) { all().forEach(show); return; }
    const io = new IntersectionObserver((rows) => rows.forEach((r) => r.isIntersecting && (show(r.target), io.unobserve(r.target))), { rootMargin: '-40px' });
    all().forEach((e) => io.observe(e));
    // A fast scroll can outrun the observer; sweep anything already on screen.
    const sweep = () => { for (const e of all()) { const r = e.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) show(e); } };
    addEventListener('scroll', sweep, { passive: true });
    const t = setTimeout(sweep, 300);
    return () => { io.disconnect(); removeEventListener('scroll', sweep); clearTimeout(t); };
  }, []);
  return ref;
}

const Section = ({ id, cls = '', children, style }) => html`<section id=${id} class=${'band ' + cls} style=${style}><div class="sec reveal">${children}</div></section>`;

export function Landing({ about }) {
  const ref = useReveal();
  const [live, setLive] = useState(null);
  useEffect(() => { view('home').then((d) => setLive(d)).catch(() => {}); }, []);
  useEffect(() => { document.title = L('系统介绍 · AI Scientist', 'About · AI Scientist'); }, [LANG]);
  const c = live?.shell?.counts;
  const stats = [
    [c ? c.library.toLocaleString() : '1,207', L('已建库文献', 'papers indexed')],
    [c ? c.hyps : '56', L('网络中的假设', 'hypotheses live')],
    [c ? c.running + c.queued : '7', L('运行中 / 排队实验', 'runs live & queued')],
    ['9h12m', L('最近一次无人值守运行', 'last unattended run')],
  ];
  return html`<div class="lp" ref=${ref}>
    <a class="sr" href="#main">${L('跳至正文', 'Skip to content')}</a>
    <nav class="lnav">
      <a class="brand" href="/" style="color:#fff">${I('logo', { s: 21, c: '#fff', w: 1.8 })}<span style="font-size:15px;font-weight:600;color:#fff">AI Scientist</span></a>
      <div class="grow"></div>
      <a href="#purpose" class="hide-s">${L('设计主旨', 'Purpose')}</a>
      <a href="#features" class="hide-s">${L('特色', 'Features')}</a>
      <a href="#pipeline" class="hide-s">${L('研究流程', 'Pipeline')}</a>
      <a href="#screens" class="hide-s">${L('全部界面', 'All screens')}</a>
      <a href="/panorama" class="hide-s">${L('假设图', 'Graph')}</a>
      <a href="/forest3d" class="hide-s">${L('森林', 'Forest')}</a>
      <button class="btn xs" style="background:transparent;color:#98A2B3;border-color:rgba(255,255,255,.18)" onClick=${() => setLang(LANG === 'zh' ? 'en' : 'zh')}>${LANG === 'zh' ? 'EN' : '中文'}</button>
      <a class="cta" href="/home">${L('进入系统', 'Open the system')}</a>
    </nav>

    <header class="hero" id="main">
      <span class="pill"><span style="width:6px;height:6px;border-radius:50%;background:#7DA2FF"></span>${L('科研全流程自动化系统', 'End-to-end research automation')}</span>
      <h1>${L(html`从 idea 到 paper<br/>科研全流程<em>自动化</em>`, html`From idea to paper<br/>research, <em>end to end</em>`)}</h1>
      <p>${L('从文献调研到论文写作，各环节由 agent 自主推进，研究者只在必要的节点作出决策。',
        'Agents carry literature review, project intake, experiments and writing forward on their own. The researcher decides only where a decision is necessary.')}</p>
      <div class="hbtns">
        <a class="hbtn" href="/home">${L('进入系统 →', 'Open the system →')}</a>
        <a class="hbtn ghost" href="/panorama">${L('查看假设网络', 'See the hypothesis network')}</a>
      </div>
      <div class="hstats">${stats.map(([v, k], i) => html`
        ${i > 0 && html`<span class="sep"></span>`}
        <div class="s"><div class="v">${v}</div><div class="k">${k}</div></div>`)}</div>
      <div class="shot">
        <div class="shotframe">
          <div class="shotbar"><i></i><i></i><i></i><span class="u">app.ai-scientist · ${L('总览', 'overview')}</span></div>
          <img src=${LANG === 'zh' ? 'assets/hero-zh.png' : 'assets/hero-en.png'} width="1060" height="662" alt=${L('总览界面截图', 'Screenshot of the overview')} />
        </div>
      </div>
    </header>

    <${Section} id="purpose" cls="">
      <div class="eyebrow">${L('设计主旨', 'Purpose')}</div>
      <h2>${L('面向未来的 AI 科学家', 'Designed for the AI scientist of the future')}</h2>
      <p class="lead">${L('AI 的智力水平持续提升，过细的流程指引反而会限制 agent 的自主性。本系统尝试回答一个问题：当 AI 的能力趋于无限时，人类在科研中还有哪些必要的参与点？',
        'As AI grows more capable, detailed procedural guidance increasingly constrains an agent’s autonomy. The system asks one question: as AI capability approaches its limit, where must humans still take part in research?')}</p>
      <div class="feat">
        ${[['确定方向', 'Set the direction', '划定研究领域与采集范围，并审批立项。', 'Define the research field and the scope of collection, and approve new projects.'],
          ['裁定假设', 'Rule on hypotheses', '证据相互矛盾，或连续三次 PIVOT 仍无改善时，agent 暂停并提交人工裁定。', 'When evidence conflicts or three PIVOTs bring no improvement, the agent pauses for a human verdict.'],
          ['决定投稿', 'Decide to submit', '判断论文何时完成。仍有过度声称时，导出将被中止并列出相应条目。', 'Judge when the paper is finished. If overclaims remain, export is halted and they are listed.']].map(([zh, en, dzh, den], i) => html`
          <div class="f"><div class="mono" style="color:var(--acc);font-size:11px">0${i + 1}</div><h3>${L(zh, en)}</h3><p>${L(dzh, den)}</p></div>`)}
      </div>
      <p class="lead" style="margin-top:28px">${L('这是目前保留给研究者的三项决策，其余环节由系统自动完成，每一步都有记录可查。',
        'These are the three decisions currently reserved for the researcher. Everything else runs automatically, and every step is recorded.')}</p>
    <//>

    <${Section} id="features" cls="alt">
      <div class="eyebrow">${L('特色', 'Features')}</div>
      <h2>${L('假设森林的展开与收敛', 'Expansion and convergence of the hypothesis forest')}</h2>
      <p class="lead">${L('每个 idea 拆解为一棵由实验检验的假设树，共享假设把树连成森林。整体目标是以最精简的假设，解释最多的实验证据。',
        'Each idea becomes a tree of hypotheses tested by experiments, and shared hypotheses join the trees into a forest. The overall objective is the fewest hypotheses that explain the most experimental evidence.')}</p>
      <div class="feat">
        ${[['net', '多 idea 共享假设', 'Hypotheses shared across ideas', '假设是全局实体，不属于任何单个 idea。一次实验的证据同时作用于所有引用它的 idea，推翻一条假设时，影响按其在各 idea 中的位置分别计算。', 'A hypothesis is a global entity that belongs to no single idea. Evidence from one run applies to every idea that cites it, and when a hypothesis is overturned the impact is computed from its position in each idea.'],
          ['fork', '苏格拉底式追问', 'Socratic questioning', '多个 agent 对假设层层追问，直至拆解为可由实验检验的子假设。未通过检验的假设继续追问拆解，森林由此展开。', 'Agents question each hypothesis until it is split into sub-hypotheses that experiments can test. Those that fail are questioned and split again, and so the forest expands.'],
          ['merge', '奥卡姆剃刀', 'Occam’s razor', '强化学习将多条具体假设抽象为一条更普适的假设，并剪除冗余分支，森林由此收敛。', 'Reinforcement learning abstracts several specific hypotheses into one more general hypothesis and prunes redundant branches, and so the forest converges.']].map(([ic, zh, en, dzh, den]) => html`
          <div class="f">${I(ic, { s: 20, c: 'var(--acc)' })}<h3>${L(zh, en)}</h3><p>${L(dzh, den)}</p></div>`)}
      </div>
      <div style="margin-top:34px" class="card">
        <div class="hd"><h2 style="font-size:15px;margin:0;letter-spacing:0">${L('示例：H-02 在三个 idea 中的不同角色', 'Example: the roles of H-02 in three projects')}</h2><span class="sub2">${L('同一条假设，三种后果', 'One hypothesis, three consequences')}</span></div>
        <div class="bd"><div class="cols3">
          ${[['P-014', L('第 2 层', 'layer 2'), L('分支失效 · 冻结 2 个节点', 'branch fails · 2 nodes frozen'), 'var(--acc)'],
            ['P-016', L('根前提', 'root premise'), L('全局失效 · 整个 idea 需重开', 'global failure · the whole project reopens'), 'var(--pur)'],
            ['P-017', L('叶节点 · 已验证', 'leaf · verified'), L('已有独立证据，不受影响', 'has independent evidence, unaffected'), 'var(--ok)']].map(([id, role, eff, col]) => html`
            <div style=${{ padding: '13px', border: '1px solid var(--line)', borderRadius: '7px', borderLeft: '3px solid ' + col }}>
              <div class="mono b">${id}</div><div class="small mut" style="margin-top:3px">${role}</div>
              <div style="margin-top:9px;font-size:12.5px;line-height:1.6">${eff}</div></div>`)}
        </div></div>
        <div class="ft"><a href="/graph">${L('在共享关系页打开 →', 'Open in the shared-hypotheses view →')}</a></div>
      </div>
    <//>

    <${Section} id="pipeline" cls="">
      <div class="eyebrow">${L('研究流程', 'Pipeline')}</div>
      <h2>${L('六个环节，一张假设网络', 'Six stages, one hypothesis network')}</h2>
      <p class="lead">${L('每个环节都可以展开查看。从文献来源到每次实验写入的证据，都有据可查。',
        'Every stage can be opened and inspected. Each piece of evidence can be traced back to its run.')}</p>
      <div class="steps">
        ${[[1, '采集', 'Collect', '从 62 个来源增量采集，分三级处理至全文。', 'Incremental collection from 62 sources by cursor, processed in three levels up to full text.'],
          [2, '趋势', 'Trends', '聚类研究主题，识别空白与矛盾，由此生成 spark。', 'Topics are clustered and gaps are identified. Sparks come from these gaps.'],
          [3, '立项', 'Intake', '将研究主张展开为假设树，可复用的假设不重复验证。', 'A research claim is expanded into a hypothesis tree; reusable hypotheses are not re-verified.'],
          [4, '实验', 'Experiments', '四阶段实验树，保留失败节点以避免重复错误。', 'A four-stage experiment tree; failed nodes are retained to avoid repeating errors.'],
          [5, '裁定', 'Verdicts', '证据矛盾时提交人工裁定，影响按 idea 分别计算。', 'Contradictions are escalated for human review, with the impact computed per idea.'],
          [6, '写作', 'Writing', '章节由假设树映射，缺少证据的部分予以标注。', 'Sections are mapped from the hypothesis tree; unsupported passages are flagged.']].map(([i, zh, en, dzh, den]) => html`
          <div class="step"><div class="i">0${i}</div><h4>${L(zh, en)}</h4><p>${L(dzh, den)}</p></div>`)}
      </div>
    <//>

    <${Section} id="screens" cls="alt">
      <div class="eyebrow">${L('全部界面', 'All screens')}</div>
      <h2>${L('18 个功能界面，均可交互操作', '18 screens, all interactive')}</h2>
      <p class="lead">${L('每个界面都可以实际操作。实验完成后证据写入假设，裁定会冻结下游节点。',
        'Every screen is fully interactive. Finished runs write evidence back to hypotheses, and verdicts freeze downstream nodes.')}</p>
      <div class="screens">
        ${[['home', '总览', 'Overview', '流程指标与待决事项', 'Live pipeline counts, the last 24 hours and pending decisions'],
          ['main', '工作台 · 全局', 'Workbench · global', '全局可执行假设与并发实验', 'Global frontier, execution slots and the activity stream'],
          ['survey', '文献采集', 'Collection pipeline', '来源白名单与三级分级', 'Source whitelist, cursor budget, three grading levels'],
          ['trends', '趋势分析', 'Trend analysis', '主题聚类与研究空白', 'Monthly depth, clusters, term shifts, gaps and contradictions'],
          ['sparks', 'idea spark', 'Idea sparks', '四行格式与三道自检', 'Four-line format, three self-checks, state flow'],
          ['digest', '论文详情', 'Paper detail', '结构化摘要与衍生文本', 'Structured digest and derived texts'],
          ['ideas', 'Idea 立项', 'Idea intake', '候选主张与立项成本', 'Candidate claims, reuse of hypotheses, cost to start'],
          ['panorama', '假设全景', 'Hypothesis panorama', '8 个 idea 与 56 条假设的全局网络', 'The global network: 8 ideas, 56 hypotheses'],
          ['graph', '共享关系', 'Shared hypotheses', '同一假设在不同 idea 中的层级', 'One hypothesis at three levels in three projects'],
          ['tree', '单 idea 树', 'Single-idea tree', '节点编辑与依赖关系', 'Node editing, dependencies, evidence and verdicts'],
          ['experiments', '单次实验', 'Single experiment', '运行配置与执行决策', 'Config, live stream, PROCEED / REFINE / PIVOT'],
          ['exptree', '实验树 · 四阶段', 'Experiment tree', '初探 → 调参 → 主实验 → 消融', 'Probe → tune → main → ablation'],
          ['sweep', '扫描矩阵', 'Sweep matrix', '方差分析与显著性检验', 'n × seed, variance and significance'],
          ['runs', '算力与失败', 'Compute & failures', '占用时间线与失败处置', 'Occupancy timeline, failure classes and auto-handling'],
          ['review', '裁定队列', 'Verdict queue', '失效在各 idea 中的不同后果', 'How one failure plays out differently in three projects'],
          ['paper', '论文正文', 'Manuscript', '章节由假设树映射', 'Sections map from the tree; gaps are highlighted'],
          ['claims', '主张 · 证据对照', 'Claims vs evidence', '逐条核查证据不足与过度声称', 'Unsupported and overclaimed sentences, one by one'],
          ['figures', '图表工作台', 'Figure workbench', '来源可追溯的发表级图表', 'Publication figures, traceable sources, review comments'],
          ['rebuttal', '审稿与修订', 'Review & rebuttal', '评审意见与投稿清单', 'Three reviewers, a reproducibility self-score, the checklist']].map(([k, zh, en, dzh, den]) => html`
          <a href=${'/' + k}><div class="t">${L(zh, en)}</div><div class="d">${L(dzh, den)}</div><div class="k">${k.replace(/^\w/, (x) => x.toUpperCase())}</div></a>`)}
      </div>
    <//>

    <${Section} cls="" style=${{ background: 'var(--dark)' }}>
      <div class="dark" style="text-align:center">
        <div class="eyebrow" style="color:#7DA2FF">${L('整体目标', 'Objective')}</div>
        <h2 style="color:#fff;margin-top:12px">${L('以最精简的假设，解释最多的实验证据', 'The fewest hypotheses that explain the most experimental evidence')}</h2>
        <div class="hbtns"><a class="hbtn" href="/home">${L('进入系统', 'Open the system')}</a>
          <a class="hbtn ghost" href="/forest3d">${L('查看假设森林', 'See the hypothesis forest')}</a></div>
      </div>
    <//>

    <footer class="foot">
      <div class="in">
        <div style="max-width:330px">
          <div class="row" style="color:#fff">${I('logo', { s: 20, c: '#fff', w: 1.8 })}<span style="font-weight:600">AI Scientist</span></div>
          <div style="margin-top:10px">${L('从 idea 到 paper 的科研全流程自动化系统。',
            'An end-to-end research automation system, from idea to paper.')}</div>
        </div>
        <div><div style="color:#98A2B3;font-weight:600;margin-bottom:6px">${L('工作流', 'Workflow')}</div>
          <div><a href="/survey">${L('文献调研', 'Literature')}</a></div><div><a href="/panorama">${L('假设网络', 'Hypotheses')}</a></div>
          <div><a href="/experiments">${L('实验', 'Experiments')}</a></div><div><a href="/review">${L('裁定队列', 'Verdicts')}</a></div><div><a href="/paper">${L('论文', 'Paper')}</a></div></div>
        <div><div style="color:#98A2B3;font-weight:600;margin-bottom:6px">${L('界面', 'Screens')}</div>
          <div><a href="/home">${L('总览', 'Overview')}</a></div><div><a href="/main">${L('工作台', 'Workbench')}</a></div>
          <div><a href="/runs">${L('算力与失败', 'Compute')}</a></div><div><a href="/claims">${L('主张对照', 'Claims')}</a></div><div><a href="/rebuttal">${L('审稿与修订', 'Rebuttal')}</a></div></div>
        <div><div style="color:#98A2B3;font-weight:600;margin-bottom:6px">${L('关于', 'About')}</div>
          <div>${L('语言', 'Language')}: <a href="#" onClick=${(e) => { e.preventDefault(); setLang(LANG === 'zh' ? 'en' : 'zh'); }}>${LANG === 'zh' ? 'English' : '中文'}</a></div>
          <div><a href="#" onClick=${async (e) => { e.preventDefault(); await reset(); location.reload(); }}>${L('重置会话数据', 'Reset session data')}</a></div></div>
      </div>
    </footer>
  </div>`;
}
