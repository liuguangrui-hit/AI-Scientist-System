// Verdicts and writing: verdict queue, manuscript, claims vs evidence, figures, rebuttal.
import { html, useState, useScreen, Frame, Card, Table, Kpi, Loading, Empty, Editable, Evidence, Meter,
  t, L, I, St, Bar, Score, IdeaTag, ic, dur, ago, md, clock, stLabel } from './common.js';
import { go, qs } from '../app.js';
const F = ({ children }) => children;

const VERDICTS = [
  ['close', '判定不成立并关闭', 'Does not hold — close', '记录裁定并传播', 'records the verdict and propagates'],
  ['return_active', '退回 active', 'Return to active', '附新方向，重新进入可执行队列', 'with a new direction, back to the frontier'],
  ['narrow_scope', '改写 claim 后重开', 'Rewrite the claim and reopen', '缩小到短返回值情形', 'narrowed to short tool returns'],
  ['downgrade', '降级为借用前提', 'Downgrade to a borrowed premise', '标注未验证', 'marked unverified'],
];

export function Review({ q, onShell }) {
  const { data, act } = useScreen('review', { h: q.h }, onShell);
  const [pick, setPick] = useState(null);
  if (!data) return html`<${Loading} />`;
  const d = data.review, sel = d.sel;
  const chosen = pick || sel?.advice.action;
  return html`<${Frame} tools=${html`
    <span class="chip warn">${L('待裁定', 'Pending')} ${d.pending.length}</span>
    <span class="chip">${L('已裁定', 'Ruled')} ${d.done.length}</span>
    <div class="grow"></div>
    <span class="tiny faint">${L(`提交裁定的阈值：|累积| ≥ ${d.threshold.score} 或 连续 PIVOT ≥ ${d.threshold.pivots}`, `Escalation: |total| ≥ ${d.threshold.score} or ${d.threshold.pivots} consecutive PIVOTs`)}</span>`}>
    <div class="cols2b">
      <div class="col">
        <${Card} title=${L('裁定队列', 'Verdict queue')} sub=${L('executor 已停止展开', 'the executor has stopped expanding these')}>
          <div class="list" style="margin:-13px -14px">
            ${d.pending.length === 0 && html`<div class="bd"><${Empty}>${L('队列为空。所有假设都在自动推进中。', 'The queue is empty; all hypotheses are progressing automatically.')}<//></div>`}
            ${d.pending.map((v) => html`
              <div class=${'item' + (sel?.id === v.id ? ' on' : '')} onClick=${() => { setPick(null); go(qs({ h: v.id })); }}>
                <div style="flex-grow:1">
                  <div class="row"><span class="mono b">${v.id}</span><${Score} v=${v.score} /><div class="grow"></div><${St} s="pending_review" /></div>
                  <div class="small" style="margin:5px 0">${t(v.claim)}</div>
                  <div class="row">${v.ideas.map((i) => html`<${IdeaTag} id=${i} />`)}</div>
                  <div class="tiny faint" style="margin-top:5px">${L(`${v.ideas.length} 个 idea 引用 · 下游 ${v.downstream} 节点 · 连续 PIVOT ${v.pivots}`,
                    `${v.ideas.length} project(s) · ${v.downstream} downstream · ${v.pivots} consecutive PIVOTs`)}</div>
                </div>
              </div>`)}
          </div>
          <div class="ft">${L('其余节点未达裁定阈值，由 executor 继续自动推进。', 'All other nodes are below the escalation threshold and continue under the executor.')}</div>
        <//>
        <${Card} title=${L('已裁定', 'Ruled')}>
          ${d.done.slice(0, 8).map((v) => html`
            <div class="row" style="padding:6px 0;border-bottom:1px solid var(--line2)">
              <span class="mono small b" style="width:48px">${v.hyp}</span>
              <span class="chip">${t({ zh: VERDICTS.find((x) => x[0] === v.verdict)?.[1], en: VERDICTS.find((x) => x[0] === v.verdict)?.[2] })}</span>
              <div class="grow"></div><span class="tiny faint">${ago(v.at)}</span></div>`)}
        <//>
      </div>

      ${sel ? html`<div class="col">
        <${Card} title=${html`<span class="mono">${sel.id}</span>`} right=${html`<${Score} v=${sel.score} />`} sub=${html`<${St} s="pending_review" />`}>
          <div style="font-size:14px;line-height:1.7">${t(sel.claim)}</div>
          <div class="hr"></div>
          <div class="row"><span class="tiny faint">${L('证据与动作记录 · 跨 idea 汇总', 'Evidence and decision log · across projects')}</span>
            <div class="grow"></div>
            ${sel.decisions.slice(-5).map((x) => html`<span class=${'chip ' + (x.kind === 'PIVOT' ? 'bad' : x.kind === 'PROCEED' ? 'ok' : '')} style="font-size:10.5px">${x.kind}</span>`)}</div>
          <div style="margin-top:8px"><${Evidence} list=${sel.evidence} onExp=${(e) => e.startsWith('e_') && go('/experiments?e=' + e)} /></div>
          <div style="margin-top:10px"><${Meter} v=${sel.score} /></div>
        <//>

        <${Card} title=${L('判定为不成立时的影响范围', 'Impact if the hypothesis is rejected')}
          sub=${L('同一条假设在各 idea 里处在不同层级，后果也不同', 'the same hypothesis sits at a different level in each project, so the consequences differ')}>
          ${sel.impact.map((im) => html`
            <div style=${{ padding: '11px', marginBottom: '8px', border: '1px solid var(--line)', borderRadius: '6px', borderLeft: '3px solid ' + ic(im.idea) }}>
              <div class="row"><span class="mono b">${im.idea}</span>
                <span class="small mut">${im.role.kind === 'root' ? L('根前提 · 直接采纳', 'root premise · adopted as given')
                  : im.role.leaf ? L('叶子 · 已验证', 'leaf · self-verified') : L(`第 ${im.role.depth} 层`, `layer ${im.role.depth}`)}</span>
                <div class="grow"></div>
                <span class=${'chip ' + (im.kind === 'global' ? 'bad' : im.kind === 'local' ? 'ok' : 'warn')}>
                  ${im.kind === 'global' ? L('全局失效 · 整个 idea 需重开', 'global failure · the project reopens')
                    : im.kind === 'local' ? L('局部 · 已有独立证据，不受影响', 'local · independently evidenced, unaffected')
                    : L(`分支失效 · 冻结 ${im.frozen} 个节点`, `branch fails · ${im.frozen} nodes freeze`)}</span></div>
              <div class="mono tiny mut" style="margin-top:7px">${im.chain.join(' → ')}${im.kind === 'global' ? L(' → 全树', ' → whole tree') : ''}</div>
              <div class="tiny mut" style="margin-top:5px">${im.kind === 'global' ? L('全部节点重置为 untested · 已撰写章节需重写', 'every node returns to untested · written sections must be rewritten')
                : im.kind === 'local' ? L('已有独立证据证明该点，无需动作', 'an independent run already proves this point; no action needed')
                : L(`冻结下游节点 · 相关实验从队列撤回`, 'downstream nodes freeze · related runs leave the queue')}</div>
            </div>`)}
          <div class="row note">
            <span>${L(`合计：受影响 idea ${sel.totals.broken} / ${sel.totals.ideas} · 冻结节点 ${sel.totals.frozen} · 需重写章节 ${sel.totals.rewrite}`,
              `In total: ${sel.totals.broken} of ${sel.totals.ideas} projects affected · ${sel.totals.frozen} nodes frozen · ${sel.totals.rewrite} sections to rewrite`)}</span>
          </div>
        <//>

        <${Card} title=${L('reviewer 意见', 'Reviewer’s note')} sub=${data.shell.agents.reviewer}>
          <div style="line-height:1.8">${t(sel.advice.why)}</div>
          <div class="row" style="margin-top:9px"><span class="tiny faint">${L('建议动作', 'Suggested action')}</span>
            <span class="chip acc">${L(VERDICTS.find((v) => v[0] === sel.advice.action)[1], VERDICTS.find((v) => v[0] === sel.advice.action)[2])}</span></div>
        <//>

        <${Card} title=${L('裁定', 'Verdict')} sub=${L('节点状态由裁定结果派生', 'node state derives from the verdict')}>
          <div class="col">
            ${VERDICTS.map(([k, zh, en, dzh, den]) => html`
              <label class="row" style=${{ padding: '9px 11px', border: '1px solid ' + (chosen === k ? 'var(--acc)' : 'var(--line)'), background: chosen === k ? 'var(--accbg)' : undefined, borderRadius: '6px', cursor: 'pointer' }}
                onClick=${() => setPick(k)}>
                <input type="radio" checked=${chosen === k} readOnly style="width:auto" />
                <div><div class="b small">${L(zh, en)}</div><div class="tiny mut">${L(dzh, den)}</div></div>
                ${sel.advice.action === k && html`<div class="grow"></div><span class="chip acc">${L('建议', 'suggested')}</span>`}
              </label>`)}
          </div>
          <div class="hr"></div>
          <pre class="mono tiny" style="margin:0;background:#0F1419;color:#D7DDE5;padding:11px;border-radius:5px;overflow-x:auto;line-height:1.8">${JSON.stringify({ ...sel.preview, verdict: chosen, scope: chosen === 'narrow_scope' ? 'low_rank_only' : null, next_action: chosen === 'close' ? 'freeze' : 'reopen' }, null, 2)}</pre>
          <div class="row" style="margin-top:11px">
            <button class="btn acc" onClick=${async () => { const r = await act('verdict.apply', { hyp: sel.id, verdict: chosen }); if (r.ok) { setPick(null); go('/review'); } }}>
              ${L('确认裁定并传播', 'Confirm and propagate')}</button>
            <a class="btn" href=${'/panorama?h=' + sel.id}>${L('在假设全景中查看', 'View in the panorama')}</a>
            <a class="btn" href=${'/tree?idea=' + sel.ideas[0]?.idea + '&h=' + sel.id}>${L('查看单 idea 树', 'Single-idea tree')}</a>
          </div>
          <div class="note" style="margin-top:10px">${L(`裁定后队列：+${sel.queueAfter.reopen} 节点回到可执行队列 · −${sel.queueAfter.withdraw} 实验从队列撤回 · ${sel.queueAfter.unaffected} 个 idea 不受影响`,
            `After the verdict: +${sel.queueAfter.reopen} nodes return to the frontier · −${sel.queueAfter.withdraw} runs leave the queue · ${sel.queueAfter.unaffected} project(s) unaffected`)}</div>
        <//>
      </div>` : html`<${Card} title=${L('没有待裁定的假设', 'Nothing awaits a verdict')}>
        <${Empty}>${L('所有假设都在自动推进中。出现证据矛盾或连续三次 PIVOT 时，相应假设会列在这里。',
          'All hypotheses are progressing automatically. A hypothesis appears here when evidence conflicts or three consecutive PIVOTs bring no improvement.')}<//>
      <//>`}
    </div>
  <//>`;
}

// ---------------------------------------------------------------- manuscript
const SEC_STATUS = { ok: 'ok', aligned: 'ok', figure: 'warn', missing: 'bad', affected: 'warn', todo: '' };

export function Paper({ q, onShell }) {
  const { data, act } = useScreen('paper', {}, onShell, 3000);
  const [sel, setSel] = useState(q.k || '4.2');
  if (!data) return html`<${Loading} />`;
  const d = data.paper;
  const s = d.sections.find((x) => x.k === sel) || d.sections[0];
  if (!s) return html`<${Frame}><${Card} title=${L('论文正文', 'Manuscript')}>
    <${Empty}>${L('暂无草稿。当某个 idea 的全部节点通过验证后，系统将依据假设树生成章节。',
      'No draft yet. When every node of an idea is self_verified, the sections are generated from its hypothesis tree.')}<//><//><//>`;
  return html`<${Frame} tools=${html`
    <span class="chip mono">${d.idea}</span><span class="small">${t(d.ideaTitle)}</span>
    <span class="vr"></span>
    <span class="chip">${L('断言均有证据', 'Claims evidenced')} ${d.coverage}%</span>
    ${d.claimsFlagged > 0 && html`<a class="chip warn" href="/claims">${L(`待处理断言 ${d.claimsFlagged}`, `${d.claimsFlagged} flagged claims`)}</a>`}
    <div class="grow"></div>
    <a class="btn sm" href="/figures">${L('图表', 'Figures')} ${d.figures || 6}</a>
    <a class="btn sm" href="/claims">${L('证据对照', 'Claims vs evidence')}</a>
    <button class="btn sm pri" onClick=${() => act('paper.regen', {})}>${L('按当前证据重生成草稿', 'Regenerate from current evidence')}</button>`}>
    <div class="cols2b">
      <${Card} title=${L('章节', 'Sections')} sub=${L('由假设树映射', 'mapped from the hypothesis tree')}>
        <div class="list" style="margin:-13px -14px">
          ${d.sections.map((x) => html`
            <div class=${'item' + (s.k === x.k ? ' on' : '')} onClick=${() => setSel(x.k)}>
              <span class="mono small b" style="width:30px">${x.k}</span>
              <div style="flex-grow:1">
                <div class="small b">${t(x.title)}</div>
                <div class="row" style="margin-top:4px">
                  ${x.hypInfo.map((h) => html`<span class="mono tiny" style=${{ color: h.status === 'pending_review' ? 'var(--warn)' : 'var(--faint)' }}>${h.id}</span>`)}
                  ${x.hyps.length === 0 && html`<span class="tiny faint">—</span>`}
                </div>
              </div>
              <span class=${'chip ' + SEC_STATUS[x.status]}>${stLabel(x.status)}</span>
            </div>`)}
        </div>
        <div class="ft">${L('章节与假设一一对应。节点状态变化时，相应小节自动标为待更新。', 'Sections are linked to hypotheses: when a node changes state, its section is flagged for update.')}</div>
      <//>

      <div class="col">
        <${Card} title=${html`<span class="mono">${s.k}</span> ${t(s.title)}`} right=${html`<div class="row">
            <span class=${'chip ' + SEC_STATUS[s.status]}>${stLabel(s.status)}</span>
            ${!s.fig && html`<button class="btn xs" onClick=${() => act('paper.insertFig', { k: s.k })}>${L('插入图 3', 'Insert Figure 3')}</button>`}</div>`}>
          ${s.paras.map((p, i) => html`
            <${Editable} value=${t(p)} multiline=${true} cls="" style=${{ lineHeight: 1.9, marginBottom: '11px', padding: '7px 9px', border: '1px solid transparent', borderRadius: '5px' }}
              onSave=${(v) => act('paper.save', { k: s.k, i, text: v })} />`)}
          ${s.fig && html`<div style="margin:11px 0;padding:11px;border:1px solid var(--line);border-radius:6px;background:#FAFBFC">
            <img src=${'assets/fig3-' + (t({ zh: 'zh', en: 'en' })) + '.png'} alt=${L('图 3', 'Figure 3')} style="width:100%;max-width:520px;display:block;margin:0 auto" />
            <div class="tiny mut" style="margin-top:8px">${L(`图 3：(a) 注入片段注意力随良性片段数满足 n^-0.50；(b) 隔离标记前后的拦截率，n ≤ 128 区间平均 +${d.fig3.measured}%。来源 e_15`,
              `Figure 3: (a) attention on the injected span follows n^-0.50; (b) interception rate with and without delimiters, +${d.fig3.measured}% on average for n ≤ 128. Source: e_15`)}
              <a href="/figures" style="margin-left:6px">${L('图表工作台 →', 'Figure workbench →')}</a></div>
          </div>`}
          <div class="ft" style="margin:11px -14px -13px">
            <span class="tiny faint">${L(`本节 ${s.paras.length} 段 · 引用 ${s.hyps.length} 条假设 · 点击段落即可编辑`, `${s.paras.length} paragraphs · ${s.hyps.length} hypotheses · click a paragraph to edit`)}</span>
            <div class="grow"></div>
            <a class="btn xs" href=${'/claims'}>${L('逐条核查证据', 'Check the claims')}</a>
          </div>
        <//>

        ${s.hypInfo.some((h) => h.status === 'pending_review') && html`<${Card} title=${L('跨 idea 提醒', 'Cross-project warning')}>
          ${s.hypInfo.filter((h) => h.status === 'pending_review').map((h) => html`
            <div class="note warn"><span class="mono b">${h.id}</span> ${L(`正处于裁定流程中。若适用范围被限定，本节结论需要修改。裁定生效时，系统会标出受影响的段落。`,
              'is in the verdict queue. If its scope is narrowed, this section must be revised. The system flags the affected paragraphs once the verdict takes effect.')}
              <a href=${'/review?h=' + h.id} style="margin-left:6px">${L('查看裁定 →', 'See the verdict →')}</a></div>`)}
        <//>`}

        <${Card} title=${L('待补证据', 'Evidence still missing')} sub=${L('写作中发现的证据缺口将直接加入实验队列', 'evidence gaps found during writing are added directly to the run queue')}>
          ${d.gaps.map((g) => html`
            <div style=${{ padding: '11px', marginBottom: '8px', border: '1px solid var(--line)', borderRadius: '6px', background: g.done ? 'var(--okbg)' : undefined }}>
              <div class="row"><span class="b small">${t(g.title)}</span><div class="grow"></div>
                ${g.expStatus && html`<span class=${'chip ' + (g.expStatus === 'done' ? 'ok' : 'acc')}>${g.exp} · ${stLabel(g.expStatus)}${g.expStatus === 'running' ? ' ' + Math.round(g.prog * 100) + '%' : ''}</span>`}</div>
              <div class="small mut" style="margin-top:6px">${t(g.body)}</div>
              ${g.expStatus === 'running' && html`<div style="margin-top:7px"><${Bar} v=${g.prog} /></div>`}
              <div class="row" style="margin-top:9px">
                ${g.exp
                  ? html`<a class="btn sm" href=${'/experiments?e=' + g.exp}>${L(`查看 ${g.exp}`, `Open ${g.exp}`)}</a>`
                  : html`<button class="btn sm acc" onClick=${() => act('paper.gap', { id: g.id })}>${t(g.btn)}</button>`}
              </div>
            </div>`)}
        <//>
      </div>
    </div>
  <//>`;
}

// ---------------------------------------------------------------- claims
export function Claims({ q, onShell }) {
  const { data, act } = useScreen('claims', { c: q.c }, onShell);
  const [filter, setFilter] = useState('all');
  if (!data) return html`<${Loading} />`;
  const d = data.claims, sel = d.sel;
  if (d.empty) return html`<${Frame}><${Card} title=${L('主张 · 证据对照', 'Claims versus evidence')}>
    <${Empty}>${L('暂无可对照的断言。正文生成后，每条断言将在此与其证据逐一对照。',
      'No claims to check yet. Once the manuscript is drafted, each claim is matched against its evidence here.')}<//>
    <div class="row" style="margin-top:11px"><a class="btn sm" href="/paper">${L('前往正文', 'Open the manuscript')}</a></div><//><//>`;
  const shown = filter === 'all' ? d.items : d.items.filter((c) => c.status === filter);
  return html`<${Frame} tools=${html`
    <div class="seg">
      <button class=${filter === 'all' ? 'on' : ''} onClick=${() => setFilter('all')}>${L('全部', 'All')} ${d.stats.all}</button>
      <button class=${filter === 'supported' ? 'on' : ''} onClick=${() => setFilter('supported')}>${L('已支撑', 'Supported')} ${d.stats.supported}</button>
      <button class=${filter === 'insufficient' ? 'on' : ''} onClick=${() => setFilter('insufficient')}>${L('证据不足', 'Insufficient')} ${d.stats.insufficient}</button>
      <button class=${filter === 'overclaim' ? 'on' : ''} onClick=${() => setFilter('overclaim')}>${L('过度声称', 'Overclaim')} ${d.stats.over}</button>
    </div>
    <span class="vr"></span>
    <span class="chip">${L('覆盖率', 'Coverage')} ${d.stats.coverage}%</span>
    <span class="chip">${L('平均每条', 'Per claim')} ${d.stats.perClaim} ${L('条证据', 'evidence')}</span>
    <div class="grow"></div>
    ${d.stats.over > 0 && html`<button class="btn sm" onClick=${() => act('claim.batchSoften', {})}>${L(`批量降级措辞 ${d.stats.over} 条`, `Soften all ${d.stats.over}`)}</button>`}
    <a class="btn sm" href="/paper">${L('返回正文逐条修改', 'Back to the manuscript')}</a>`}>
    <div class="cols2">
      <${Card} title=${L('断言 · 证据对照', 'Claims versus evidence')}
        sub=${L('扫描会标出全称性措辞，并核对证据的适用范围', 'the scan flags universal wording and checks it against the scope of the evidence')}>
        <${Table}><thead><tr><th style="width:36px">${L('节', '§')}</th><th>${L('断言', 'Claim')}</th><th style="width:52px">${L('假设', 'Hyp')}</th><th style="width:86px">${L('证据', 'Evidence')}</th><th style="width:78px">${L('状态', 'Status')}</th></tr></thead>
          <tbody>
            ${shown.map((c) => html`<tr class=${'clickable' + (sel?.id === c.id ? ' on' : '')} onClick=${() => go(qs({ c: c.id }))}>
              <td class="mono tiny">${c.sec}</td>
              <td>${t(c.text)}${c.why && html`<div class="tiny" style="color:var(--bad);margin-top:3px">${t(c.why)}</div>`}</td>
              <td class="mono tiny">${c.hyp || '—'}</td>
              <td class="mono tiny mut">${c.ev.join(' ') || L('无', 'none')}</td>
              <td><span class=${'chip ' + (c.status === 'supported' ? 'ok' : c.status === 'overclaim' ? 'bad' : 'warn')}>${stLabel(c.status)}</span></td>
            </tr>`)}
          </tbody><//>
        <div class="ft" style="margin:13px -14px -13px">${L(`还有 ${d.collapsed} 条已支撑的断言未展开`, `${d.collapsed} more supported claims are collapsed`)}
          <div class="grow"></div>
          ${d.gate ? html`<span class="chip bad">${L('导出将被中止', 'export will be halted')}</span>` : html`<span class="chip ok">${L('导出检查通过', 'export check passes')}</span>`}</div>
      <//>

      ${sel && html`<div class="col">
        <${Card} title=${L('选中断言', 'Selected claim')} right=${html`<span class=${'chip ' + (sel.status === 'supported' ? 'ok' : sel.status === 'overclaim' ? 'bad' : 'warn')}>${stLabel(sel.status)}</span>`}
          sub=${L(`${sel.sec} 节`, `§${sel.sec}`)}>
          <div style="line-height:1.8">${t(sel.find || sel.text)}</div>
          ${sel.why && html`<div class="note warn" style="margin-top:9px">${t(sel.why)}</div>`}
          ${sel.chain && html`<${F}>
            <div class="hr"></div>
            <div class="tiny faint" style="margin-bottom:6px">${L('证据链', 'Evidence chain')}</div>
            ${sel.chain.map((x, i) => html`<div class="row" style="padding:4px 0">
              <span class="mono tiny faint" style="width:16px">${i + 1}</span><span class="small">${t(x)}</span></div>`)}
          <//>`}
        <//>
        ${sel.status !== 'supported' && html`<${Card} title=${L('可选动作', 'Available actions')}>
          <div class="col">
            ${sel.fixExp && html`<button class="btn acc" style="justify-content:flex-start" onClick=${() => act('claim.fix', { id: sel.id, how: 'experiment' })}>
              ${L(`补充实验：${t({ zh: sel.fixExp.zh, en: sel.fixExp.en })}`, `Run an experiment: ${t({ zh: sel.fixExp.zh, en: sel.fixExp.en })}`)}</button>`}
            ${sel.soften && html`<button class="btn" style="justify-content:flex-start" onClick=${() => act('claim.fix', { id: sel.id, how: 'soften' })}>
              ${L('改为推测性表述并标注', 'Soften and annotate')}</button>`}
            <button class="btn bad" style="justify-content:flex-start" onClick=${() => act('claim.fix', { id: sel.id, how: 'delete' })}>${L('删除该句', 'Delete the sentence')}</button>
          </div>
          ${sel.soften && html`<${F}>
            <div class="hr"></div>
            <div class="tiny faint" style="margin-bottom:5px">${L('改写预览', 'Rewrite preview')}</div>
            <div class="note acc" style="line-height:1.8">${t({ zh: sel.soften.zh, en: sel.soften.en })}</div>
          <//>`}
        <//>`}
        <${Card} title=${L('导出检查', 'Export gate')}>
          <div class="small mut">${L('导出前若仍有过度声称，导出会中止并列出相应条目。',
            'If any overclaim remains, export is halted and the claims are listed.')}</div>
          <div class="row" style="margin-top:9px">
            <a class="btn sm" href="/rebuttal">${L('前往投稿清单', 'Submission checklist')}</a>
            <a class="btn sm" href="/paper">${L('返回正文', 'Back to the manuscript')}</a>
          </div>
        <//>
      </div>`}
    </div>
  <//>`;
}

// ---------------------------------------------------------------- figures
export function Figures({ q, onShell }) {
  const { data, act } = useScreen('figures', {}, onShell, 3000);
  if (!data) return html`<${Loading} />`;
  const d = data.figures, f = d.fig3;
  if (!d.items.length) return html`<${Frame}><${Card} title=${L('图表工作台', 'Figure workbench')}>
    <${Empty}>${L('暂无图表。每张图都记录数据来源与绘图脚本，可以追溯。',
      'No figures yet. Each one records the run id, the data file and the script that drew it.')}<//><//><//>`;
  return html`<${Frame} tools=${html`
    <span class="chip">${L('全部', 'All')} ${d.items.length}</span>
    <span class="chip ok">${L('已生成', 'Generated')} ${d.items.filter((x) => x.status === 'done').length}</span>
    <span class="chip warn">${L('待重绘', 'To redraw')} ${d.items.filter((x) => x.status === 'redraw').length}</span>
    <span class="chip">${L('待实验', 'Awaiting runs')} ${d.items.filter((x) => x.status === 'waiting').length}</span>
    <div class="grow"></div>
    <span class="tiny faint">${L('审图由视觉模型基于渲染结果进行，而非审阅代码', 'the figure review looks at the rendered image, not the code')}</span>`}>
    <div class="cols2">
      <div class="col">
        <${Card} title=${L('图 3 · 注意力权重与拦截率', 'Figure 3 · attention weight and interception rate')}
          right=${html`<span class="chip mono">v${f.ver}</span>`} sub=${L(`已采纳 ${f.reviews.filter((r) => r.st === 'done').length} / ${f.reviews.length} 条审图意见`, `${f.reviews.filter((r) => r.st === 'done').length} / ${f.reviews.length} review comments applied`)}>
          <img src=${'assets/fig3-' + t({ zh: 'zh', en: 'en' }) + '.png'} alt=${L('图 3', 'Figure 3')} style="width:100%;display:block;border:1px solid var(--line);border-radius:5px" />
          <div class="row" style="margin-top:9px">
            ${f.yZero && html`<span class="chip ok">${L('(b) y 轴已从 0 起', '(b) y-axis starts at 0')}</span>`}
            ${f.bandTo === 1024 && html`<span class="chip ok">${L('置信带截止 1024', 'band cut at 1024')}</span>`}
            ${f.sameAxis && html`<span class="chip ok">${L('两栏横轴已统一', 'x ranges unified')}</span>`}
          </div>
          <div class="tiny faint" style="margin:11px 0 5px">${L('图注 · 可直接编辑', 'Caption · editable')}</div>
          <${Editable} value=${t(f.caption)} multiline=${true} cls="note" style=${{ lineHeight: 1.75 }}
            onSave=${(v) => act('fig.caption', { text: v })} />
        <//>

        <${Card} title=${L('审图意见', 'Figure review')} sub=${L('视觉模型审阅', 'reviewed by a vision model on the rendered image')}>
          ${f.reviews.map((r) => html`
            <div style=${{ padding: '10px', marginBottom: '7px', border: '1px solid var(--line)', borderRadius: '6px', background: r.st === 'done' ? 'var(--okbg)' : undefined }}>
              <div class="row"><span class="b small" style="flex:1 1 140px">${L(r.zh, r.en)}</span>
                ${r.st === 'done'
                  ? html`<span class="chip ok">${I('check', { s: 11, c: 'var(--ok)' })}${L('已采纳', 'applied')}</span>`
                  : html`<button class="btn xs acc" onClick=${() => act('fig.review', { id: r.id })}>${L('采纳', 'Apply')}</button>`}</div>
              <div class="small mut" style="margin-top:5px">${L(r.bzh, r.ben)}</div>
            </div>`)}
          <div class="note">${L('采纳后重绘脚本将修改 fig3.py，并将 4.2 节标记为待复核。',
            'Applying a comment edits fig3.py and flags §4.2 for re-check.')}</div>
        <//>
      </div>

      <div class="col">
        ${d.mismatch && html`<${Card} title=${L('数据一致性', 'Data consistency')}>
          <div class="note warn">${L(`正文记为 ${d.textValue}%，图 3 实测为 ${f.measured}%。`, `The text says ${d.textValue}%, Figure 3 measures ${f.measured}%.`)}</div>
          <div class="row" style="margin-top:9px">
            <button class="btn sm acc" onClick=${() => act('fig.align', {})}>${L('按数据改正文', 'Align the text to the data')}</button>
            <a class="btn sm" href="/claims">${L('前往主张对照', 'Claims vs evidence')}</a>
          </div>
        <//>`}
        <${Card} title=${L('来源', 'Provenance')} sub=${L('8 / 8 可追溯', '8 / 8 traceable')}>
          <${Table}><tbody>
            ${[[L('运行', 'Run'), 'run_2291 · seed 0/1/2'], [L('数据', 'Data'), 'metrics.csv @ e_15'], [L('脚本', 'Script'), 'figs/fig3.py'], [L('用在', 'Used in'), L('4.2 节第 1 段', '§4.2, paragraph 1')]].map(([k, v]) => html`
              <tr><td class="tiny faint" style="width:60px">${k}</td><td class="mono small">${v}</td></tr>`)}
          </tbody><//>
        <//>
        <${Card} title=${L('版本', 'Versions')}>
          ${f.versions.map((v) => html`
            <div style="padding:7px 0;border-bottom:1px solid var(--line2)">
              <div class="row"><span class="chip mono">${v.v}</span><span class="tiny faint">${clock(v.at)}</span></div>
              <div class="small mut" style="margin-top:4px">${L(v.zh, v.en)}</div></div>`)}
        <//>
        <${Card} title=${L('图表清单', 'Figure list')} sub=${L('按出现顺序', 'in order of appearance')}>
          ${d.items.map((x) => html`
            <div class="row" style="padding:7px 0;border-bottom:1px solid var(--line2)">
              <span class="mono tiny faint" style="width:34px">${L('图 ', 'Fig ')}${x.n}</span>
              <span class="small" style="flex:1 1 90px">${t(x.title)}</span>
              <span class="mono tiny faint">${x.src}</span>
              ${x.status === 'waiting' && x.prog != null && html`<span class="tiny mut">${Math.round(x.prog * 100)}%</span>`}
              <span class=${'chip ' + (x.status === 'done' ? 'ok' : x.status === 'redraw' ? 'warn' : '')}>${x.status === 'done' ? L('已生成', 'generated') : x.status === 'redraw' ? L('待重绘', 'redraw') : L('待实验', 'waiting')}</span>
              <span class="tag">${x.ver}</span></div>`)}
          <div class="note" style="margin-top:9px">${L('表 1 主要结果与表 2 超参设置，均已按 metrics.csv 重新生成。',
            'Table 1 (main results) and Table 2 (hyper-parameters) were regenerated from metrics.csv.')}</div>
        <//>
      </div>
    </div>
  <//>`;
}

// ---------------------------------------------------------------- rebuttal
export function Rebuttal({ q, onShell }) {
  const { data, act } = useScreen('rebuttal', {}, onShell, 3000);
  if (!data) return html`<${Loading} />`;
  const d = data.rebuttal;
  if (!d.reviewers.length && !d.comments.length) return html`<${Frame}><${Card} title=${L('审稿与修订', 'Review & rebuttal')}>
    <${Empty}>${L('暂无评审意见。三位评审由不同模型独立完成，分歧点单独列出。',
      'No reviews yet. Three reviewers run on different models and their disagreements are listed separately.')}<//><//><//>`;
  return html`<${Frame} tools=${html`
    <span class="chip">${L('意见', 'Comments')} ${d.all}</span>
    <span class="chip ok">${L('已处理', 'Handled')} ${d.doneN}</span>
    <span class="chip warn">${L('待处理', 'Pending')} ${d.pending}</span>
    <span class="vr"></span>
    <span class="chip">${L('平均分', 'Mean score')} ${d.mean}</span>
    <span class="tiny faint">${L(`上一轮 ${d.prevMean}`, `previous round ${d.prevMean}`)}</span>
    <div class="grow"></div>
    <span class="tiny faint hide-s">${L('三位评审由不同模型独立完成，分歧点单独列出', 'three reviewers, three different models, disagreements listed separately')}</span>`}>
    <div class="cols2">
      <div class="col">
        <div class="cols3">
          ${d.reviewers.map((r) => html`
            <${Card} title=${L(`评审 ${r.id}`, `Reviewer ${r.id}`)} sub=${r.model} right=${html`<span class="big" style="font-size:18px">${r.score}</span>`}>
              <div class="tiny faint">${L(`置信 ${r.conf}`, `confidence ${r.conf}`)}</div>
              <div class="small" style="margin-top:6px;line-height:1.7">${t(r.note)}</div>
            <//>`)}
        </div>
        <${Card} title=${L('意见与处理', 'Comments and responses')} sub=${L('每条意见可通过改文或补充实验处理，也可以给出反驳证据', 'every comment is answered by an edit, a run or counter-evidence')}
          right=${html`<button class="btn xs" onClick=${() => act('rebuttal.rewrite', {})}>${L('按处理结果重写相关小节', 'Rewrite the affected sections')}</button>`}>
          ${d.comments.map((c) => html`
            <div style=${{ padding: '11px', marginBottom: '8px', border: '1px solid var(--line)', borderRadius: '6px', background: c.status === 'done' ? 'var(--okbg)' : undefined }}>
              <div class="row"><span class="chip">${c.rv}</span><span class="b small">${t(c.text0 || { zh: '', en: '' }) || t(c.textLabel || { zh: '', en: '' })}${t(c.text).slice(0, 0)}</span>
                <span class="b small">${t(c.text)}</span>
                <div class="grow"></div>
                ${c.status === 'done' ? html`<span class="chip ok">${L('已处理', 'handled')}</span>` : html`<span class="chip warn">${L('待处理', 'pending')}</span>`}</div>
              <div class="small mut" style="margin-top:6px">${t(c.fix0 || { zh: '', en: '' })}${L('处理：', 'Response: ')}${t(c.fix)}</div>
              ${c.expStatus && html`<div class="row" style="margin-top:7px"><span class="chip acc">${c.exp} · ${stLabel(c.expStatus)}</span>
                ${c.expStatus === 'running' && html`<span class="tiny mut">${Math.round(c.prog * 100)}%</span>`}
                <a class="btn xs" href=${'/experiments?e=' + c.exp}>${L('查看运行', 'Open run')}</a></div>`}
              ${c.status === 'pending' && html`<div class="row" style="margin-top:8px">
                ${!c.expStatus && html`<button class="btn xs acc" onClick=${() => act('rebuttal.comment', { id: c.id, act: 'exp' })}>${L('补充该实验', 'Queue this run')}</button>`}
                <button class="btn xs" onClick=${() => act('rebuttal.comment', { id: c.id, act: 'done' })}>${L('标记为已处理', 'Mark handled')}</button></div>`}
            </div>`)}
          <div class="note">${d.pending > 0
            ? L(`待处理的 ${d.pending} 条意见均需补充实验，已加入队列，预计消耗 ${d.gpuNeeded} GPU·h。`, `The ${d.pending} pending comments all need runs; queued, about ${d.gpuNeeded} GPU·h.`)
            : L('所有意见都已处理。', 'Every comment has been handled.')}</div>
        <//>
      </div>

      <div class="col">
        <${Card} title=${L('投稿前复现自评', 'Reproducibility self-check')} sub=${L('在干净环境中仅运行 reproduce.sh', 'reproduce.sh only, in a clean environment')}
          right=${html`<span class="big" style="font-size:20px">${Math.round((d.repro.code * .3 + d.repro.run * .3 + d.repro.match * .4) * 100) / 100}</span>`}>
          ${[[L('代码实现', 'Implementable'), d.repro.code, L('按论文描述能写出来的部分', 'what the paper describes well enough to write')],
            [L('可运行', 'Runs end to end'), d.repro.run, L('脚本在干净环境中完整运行，无需人工干预', 'the script finishes with no manual steps')],
            [L('结果吻合', 'Results match'), d.repro.match, L('图 4 缺失，表 1 中两项相差 0.4 个百分点', 'Figure 4 missing; two cells in Table 1 are off by 0.4')]].map(([k, v, note]) => html`
            <div style="margin-bottom:9px">
              <div class="row"><span class="small">${k}</span><div class="grow"></div><span class="num">${v}</span></div>
              <div style="margin:4px 0"><${Bar} v=${v} c=${v > .8 ? 'var(--ok)' : v > .6 ? 'var(--warn)' : 'var(--bad)'} /></div>
              <div class="tiny mut">${note}</div>
            </div>`)}
          <button class="btn sm" onClick=${() => act('rebuttal.repro', {})}>${L('在干净环境中重新运行', 'Re-run in a clean environment')}</button>
          ${d.repro.at && html`<div class="tiny faint" style="margin-top:6px">${L(`上次 ${clock(d.repro.at)} · 共 ${d.repro.runs} 次`, `last run ${clock(d.repro.at)} · ${d.repro.runs} total`)}</div>`}
        <//>

        <${Card} title=${L('投稿清单', 'Submission checklist')} right=${html`<span class=${'chip ' + (d.ready ? 'ok' : 'warn')}>${d.checklist.filter((k) => k.done).length} / ${d.checklist.length}</span>`}>
          ${d.checklist.map((k) => html`
            <div class="row" style="padding:6px 0;align-items:flex-start">
              ${k.done ? I('check', { s: 14, c: 'var(--ok)' }) : html`<span style="display:inline-block;width:13px;height:13px;border:1px solid var(--faint2);border-radius:3px;margin-top:2px"></span>`}
              <span class="small" style=${{ flex: '1 1 140px', color: k.done ? 'var(--mut)' : 'var(--ink)' }}>${L(k.zh, k.en)}</span>
              ${k.auto && html`<span class="tag">${L('自动', 'auto')}</span>`}
            </div>`)}
          <div class="hr"></div>
          <button class="btn acc" disabled=${!d.ready} onClick=${() => act('rebuttal.pack', {})}>${L('生成投稿版', 'Build the submission package')}</button>
          ${!d.ready && html`<div class="note warn" style="margin-top:9px">${L('两项未完成：图 4 须待 e_16 运行完成；过度声称须先行修改。导出时将自动执行匿名化脚本并生成 diff。',
            'Two items remain: Figure 4 awaits e_16, and overclaims must be resolved first. The anonymisation script runs at export and produces a diff.')}</div>`}
          ${d.packed && html`<div class="note acc" style="margin-top:9px">${L(`投稿版已于 ${clock(d.packed)} 生成。`, `Package built at ${clock(d.packed)}.`)}</div>`}
          <div class="row" style="margin-top:9px"><a class="btn sm" href="/paper">${L('返回正文', 'Back to the manuscript')}</a>
            <a class="btn sm" href="/claims">${L('核查过度声称', 'Check overclaims')}</a></div>
        <//>
      </div>
    </div>
  <//>`;
}
