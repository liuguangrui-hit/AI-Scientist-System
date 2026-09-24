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
  useEffect(() => { document.title = L('AI Scientist 工作台', 'AI Scientist Workbench'); }, [LANG]);
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
      <a href="#pipeline" class="hide-s">${L('研究流程', 'Pipeline')}</a>
      <a href="#network" class="hide-s">${L('假设网络', 'Network')}</a>
      <a href="#screens" class="hide-s">${L('全部界面', 'All screens')}</a>
      <a href="/panorama" class="hide-s">${L('假设图', 'Graph')}</a>
      <a href="/forest3d" class="hide-s">${L('森林', 'Forest')}</a>
      <button class="btn xs" style="background:transparent;color:#98A2B3;border-color:rgba(255,255,255,.18)" onClick=${() => setLang(LANG === 'zh' ? 'en' : 'zh')}>${LANG === 'zh' ? 'EN' : '中文'}</button>
      <a class="cta" href="/home">${L('进入系统', 'Open the system')}</a>
    </nav>

    <header class="hero" id="main">
      <span class="pill"><span style="width:6px;height:6px;border-radius:50%;background:#7DA2FF"></span>${L('自动化科研系统', 'Autonomous research system')}</span>
      <h1>${L(html`从文献到论文<br/>科研全流程<em>自主运行</em>`, html`From literature to manuscript<br/>the research chain, <em>run autonomously</em>`)}</h1>
      <p>${L('8 个课题并行推进，56 条假设共享同一网络。研究者只负责三项关键决策。',
        'Eight projects run in parallel over one shared network of 56 hypotheses. The researcher makes only three key decisions.')}</p>
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

    <${Section} id="pipeline" cls="">
      <div class="eyebrow">${L('研究流程', 'Pipeline')}</div>
      <h2>${L('从文献到论文', 'From literature to manuscript')}</h2>
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

    <${Section} id="network" cls="alt">
      <div class="eyebrow">${L('核心设计', 'The core idea')}</div>
      <h2>${L('假设是全局实体，不属于任何一个 idea', 'A hypothesis is a global entity. It belongs to no single project.')}</h2>
      <p class="lead">${L('同一条假设在不同 idea 中的角色可以不同。一次实验的证据会同时作用于所有引用它的 idea。重新测量一次，就能解决多个课题中的同一问题。',
        'The same hypothesis can play different roles in different projects. Evidence from one run applies to every project that cites it. One re-measurement can settle the same question in several projects.')}</p>
      <div class="feat">
        ${[['net', '共享与传播', 'Shared and propagated', '一次写入，所有引用方同步更新。假设被推翻时，影响按层级分别计算。', 'One write updates every citing project. If a hypothesis is overturned, the impact is computed per project.'],
          ['gavel', '裁定只写 verdicts/', 'Verdicts write only verdicts/', '节点状态由裁定结果决定。reviewer 不直接修改假设树。', 'Node state is derived from the verdict. The reviewer never edits the tree.'],
          ['flask', '证据带方向', 'Evidence carries a sign', '每次实验写入一个带符号的增量。累积达到阈值后，假设转为已验证。', 'Each run writes back a signed delta. A hypothesis turns self_verified once the total crosses the threshold.']].map(([ic, zh, en, dzh, den]) => html`
          <div class="f">${I(ic, { s: 20, c: 'var(--acc)' })}<h3>${L(zh, en)}</h3><p>${L(dzh, den)}</p></div>`)}
      </div>
      <div style="margin-top:34px" class="card">
        <div class="hd"><h2>${L('示例：H-02 在三个 idea 中的不同角色', 'Example: the roles of H-02 in three projects')}</h2><span class="sub2">${L('同一条假设，三种后果', 'One hypothesis, three consequences')}</span></div>
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

    <${Section} cls="">
      <div class="eyebrow">${L('研究者的角色', 'The researcher’s role')}</div>
      <h2>${L('须由研究者作出的三项决策', 'Three decisions reserved for the researcher')}</h2>
      <div class="feat">
        ${[['确定方向', 'Set the direction', '研究者划定采集范围，并审批立项。', 'The researcher defines what is collected and approves new projects.'],
          ['裁定假设', 'Rule on hypotheses', '当证据相互矛盾，或连续三次 PIVOT 仍无改善时，agent 暂停并提交人工裁定。', 'When evidence conflicts or three PIVOTs bring no improvement, the agent pauses for a human verdict.'],
          ['决定投稿', 'Decide to submit', '若仍存在过度声称，导出将被中止并列出相应条目。', 'If overclaims remain, export is halted and the claims are listed.']].map(([zh, en, dzh, den], i) => html`
          <div class="f"><div class="mono" style="color:var(--acc);font-size:11px">0${i + 1}</div><h3>${L(zh, en)}</h3><p>${L(dzh, den)}</p></div>`)}
      </div>
      <p class="lead" style="margin-top:28px">${L('其余环节由系统自动完成。每一步都记录在 events.jsonl 中。',
        'Everything else runs automatically. Every step is logged in events.jsonl.')}</p>
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
          ['digest', '论文详情', 'Paper detail', '结构化摘要与衍生文本', 'meta.json, fixed digest fields, three derived texts'],
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
        <h2 style="color:#fff">${L('数据来源', 'Data sources')}</h2>
        <p class="lead" style="margin-inline:auto;text-align:center">${L('界面直接读取项目目录中的文件。文献条目在 index.jsonl，假设树在 tree.json，裁定在 verdicts/，事件在 events.jsonl，产物在 artifacts/。界面本身不保存状态。',
          'The interface reads the files in the project directory. Records are in index.jsonl, hypothesis trees in tree.json, verdicts in verdicts/, events in events.jsonl and outputs in artifacts/. The interface keeps no state of its own.')}</p>
        <div class="mono" style="margin-top:26px;color:#7DA2FF;font-size:12.5px;line-height:2.1">
          index.jsonl · tree.json · verdicts/ · events.jsonl · artifacts/ · venues.yaml · topics.md
        </div>
        <div class="hbtns"><a class="hbtn" href="/home">${L('打开工作台', 'Open the workbench')}</a>
          <a class="hbtn ghost" href="/survey">${L('从文献采集开始', 'Start at the collection pipeline')}</a></div>
      </div>
    <//>

    <footer class="foot">
      <div class="in">
        <div style="max-width:330px">
          <div class="row" style="color:#fff">${I('logo', { s: 20, c: '#fff', w: 1.8 })}<span style="font-weight:600">AI Scientist</span></div>
          <div style="margin-top:10px">${L('自动化科研系统的操作界面。整个科研流程共享同一张假设网络。',
            'The interface of an autonomous research system. The whole research process shares one hypothesis network.')}</div>
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
