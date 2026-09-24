// Seed data for a fresh visitor workspace. Every user-facing string is bilingual: {zh, en}.
// Times are stored as epoch ms, relative to workspace creation, so the demo always looks "live".

export const b = (zh, en) => ({ zh, en });
const MIN = 60000, HOUR = 3600000;

export const COLORS = { 'P-014': '#2F5FE0', 'P-016': '#A21CAF', 'P-017': '#0F8F7B', 'P-018': '#BE123C', done: '#64748B' };

// ---------------------------------------------------------------- hypotheses
// [id, zh, en, status, evidence[[exp, idea, delta, zh, en]], extras]
const H = [];
const h = (id, zh, en, status = 'untested', ev = [], extra = {}) => H.push({ id, claim: b(zh, en), status, ev, ...extra });

// Three running ideas defend LLM agents against indirect prompt injection; the finished,
// parked and candidate ones cover jailbreaks, automated review, backdoors, membership
// inference and the reproducibility of AI-scientist output. H-02 is the contested premise
// the three running trees share.
h('H-01', '自动裁判的判定与人工标注一致', 'Automated judges agree with human labels', 'self_verified',
  [['e_01', 'P-014', 0.8, '三个模型上与人工标注一致率 96%', '96% agreement with human labels on three models'], ['e_02', 'P-016', 0.6, '换基准后仍成立', 'Holds on another benchmark']]);
h('H-02', 'agent 对工具返回值的信任高于用户输入', 'Agents trust tool returns more than user input', 'pending_review', [
  ['e_04', 'P-014', -0.7, '三个开源模型上信任差异不显著', 'The trust gap is not significant on three open models'],
  ['e_09', 'P-016', -0.8, '换到 InjecAgent 后差异消失', 'The gap disappears on InjecAgent'],
  ['e_12', 'P-014', -1.2, '改用注意力归因仍未复现', 'Attention attribution still fails to reproduce it'],
  ['e_13', 'P-017', 0.3, '检索场景下局部成立', 'Holds locally in retrieval settings'],
  ['e_14', 'P-016', 0.3, '短返回值内可重复，长返回值失效', 'Repeatable for short returns; fails for long ones']],
  { decisions: ['REFINE', 'REFINE', 'PIVOT', 'PIVOT', 'PIVOT'], pivots: 3 });
h('H-03', '现有评测系统性低估多轮注入', 'Existing evaluations systematically underestimate multi-turn injection', 'inductive_unverified',
  [['ind', 'P-014', 0.6, '由 P-014 的 1.2.2 与 P-016 的 2.1 归纳', 'Induced from P-014 1.2.2 and P-016 2.1']], { induced: true });
h('H-05', '加隔离标记后多轮拦截率回升', 'Delimiters restore interception in multi-turn sessions', 'pending_review', [
  ['e_05', 'P-014', -0.4, '调整标记模板后仍未回升', 'No recovery after changing the delimiter template'],
  ['e_06', 'P-014', -0.6, '限定为两轮会话后无改善', 'No improvement after limiting sessions to two turns'],
  ['e_07', 'P-014', -0.6, '换判定口径后无改善', 'No improvement after switching the judging criterion']],
  { decisions: ['REFINE', 'PIVOT', 'PIVOT', 'PIVOT'], pivots: 3, warrant: b('现有评测低估多轮注入，在每轮返回值上重复标记即可恢复拦截率', 'Evaluations underestimate multi-turn injection; delimiting every turn’s return restores interception') });
h('H-06', '投毒文档在嵌入空间集中于少数方向', 'Poisoned documents concentrate in a few embedding directions', 'self_verified',
  [['e_10', 'P-017', 0.4, '第 1 层通过', 'Layer 1 passed'], ['e_02b', 'P-017', 0.7, '前 8 个主方向占 91% 方差', 'Top-8 directions carry 91% of the variance']]);
h('H-07', '隔离标记在 n ≤ 128 区间稳定生效', 'Delimiters hold steadily for n ≤ 128', 'untested', [], { depends: ['H-05'] });
h('H-09', '注入检测与投毒检测共用同一判据', 'Injection and poisoning detection share one criterion', 'untested', [], { needsDecompose: true });
h('H-11', '注入片段注意力随良性片段数按 n^−1/2 衰减', 'Attention on the injected span decays as n^−1/2', 'untested', [
  ['e_08', 'P-014', 0.2, '三档 n 趋势一致', 'Trend consistent across three tiers of n'],
  ['e_11', 'P-016', 0.2, '换基准后方向不变', 'Direction unchanged on another benchmark']]);
h('H-12', '隔离标记无需额外模型调用', 'Delimiting needs no extra model call', 'untested', [
  ['e_03', 'P-014', 0.5, '标记在解码前完成，不增加调用', 'Applied before decoding; no extra call'],
  ['e_17', 'P-014', 0.4, '拦截率提升 18.4%（旧口径）', 'Interception +18.4% (old metric)']], { rerun: true });
h('H-14', '投影到主方向后检测误差有界', 'Detection error is bounded after projecting onto principal directions');
h('H-16', '三个 idea 共用的攻击基线需在同一种子下重测', 'The attack baseline shared by three ideas must be re-measured under one seed set', 'untested', [], { rerun: true });
h('H-18', '过滤投毒文档不降低检索召回', 'Filtering poisoned documents keeps retrieval recall');
h('H-19', '检测阈值与标记强度的最优区间重合', 'The best ranges of detection threshold and delimiter strength coincide');
// own nodes of the three running ideas
h('H-30', '在工具返回值入口加隔离标记可阻断间接注入', 'Delimiting at the tool-return entry blocks indirect injection');
h('H-31', '隔离标记降低攻击成功率', 'Delimiters lower the attack success rate');
h('H-33', '标记开销可忽略', 'The delimiting overhead is negligible');
h('H-34', '标记无法被攻击者伪造', 'Attackers cannot forge the delimiters');
h('H-35', '共用判据可由注意力熵估计', 'The shared criterion can be estimated from attention entropy');
h('H-36', '困惑度阈值可替代固定规则', 'A perplexity threshold can replace fixed rules');
h('H-38', '沿嵌入主方向过滤可清除投毒文档', 'Filtering along principal embedding directions removes poisoned documents');
h('H-32', '标记效果对提示模板不敏感', 'The effect is insensitive to the prompt template');
h('H-37', '检测不降低正常任务成功率', 'Detection does not lower benign task success');
h('H-39', '自适应攻击下过滤仍然有效', 'Filtering still works under adaptive attacks');
h('H-40', '过滤比例与召回率呈单调关系', 'The filtering ratio is monotone in recall');
h('H-04', '主方向数 r 存在拐点', 'The number of principal directions r has an elbow');
h('H-08', '检测阈值对随机种子稳健', 'The detection threshold is robust to the seed');
// P-011 jailbreak evaluation (7)
h('H-41', '多轮越狱成功率高于单轮', 'Multi-turn jailbreaks succeed more often than single-turn ones', 'self_verified');
h('H-42', '越狱成功率随会话轮数上升', 'Jailbreak success rises with session turns', 'self_verified');
h('H-43', '角色扮演模板在新模型上仍然有效', 'Role-play templates still work on newer models', 'closed');
h('H-44', '护栏效果对基座模型不敏感', 'Guardrail effect is insensitive to the base model', 'lit_supported');
h('H-45', '拒答率与越狱成功率负相关', 'Refusal rate correlates negatively with jailbreak success', 'self_verified');
h('H-10', '安全对齐强度需随模型规模调整', 'Alignment strength must scale with model size');
h('H-13', '越狱链路可迁移到微调模型', 'Jailbreak chains transfer to fine-tuned models');
// P-013 automated peer review (8)
h('H-46', '自动审稿分数与人工评分一致', 'Automated review scores match human scores', 'closed');
h('H-47', '多模型评审可降低单模型偏差', 'Multi-model review reduces single-model bias', 'self_verified');
h('H-48', '自动评审能识别过度声称', 'Automated review detects overclaims', 'self_verified');
h('H-49', '评审分数受写作风格影响', 'Review scores are swayed by writing style');
h('H-50', '评审一致性随论文长度下降', 'Review agreement drops with paper length', 'lit_supported');
h('H-51', '审稿意见可转化为补充实验', 'Review comments can be turned into extra experiments');
h('H-15', '自动评审可替代人工审稿', 'Automated review can replace human review', 'closed');
h('H-17', '评审模型与作者模型同源时分数偏高', 'Scores inflate when reviewer and author share a model family');
// P-015 backdoor detection (9, all verified)
['触发器在激活空间中可分', '后门神经元集中于少数层', '剪枝可移除后门', '检测不依赖干净数据', '检测对触发器形态稳健',
  '误报率低于 1%', '检测结果对种子稳健', '适用于指令微调模型', '在三个基准上复现'].forEach((zh, i) => {
  const en = ['Triggers are separable in activation space', 'Backdoor neurons concentrate in a few layers', 'Pruning removes the backdoor', 'Detection needs no clean data',
    'Detection is robust to trigger form', 'False-positive rate below 1%', 'Results are robust to the seed', 'Works on instruction-tuned models', 'Reproduced on three benchmarks'][i];
  h('H-' + [52, 53, 54, 55, 56, 57, 58, 59, 20][i], zh, en, 'self_verified');
});
// P-019 membership inference (6)
h('H-24', '成员推断优势随训练轮数上升', 'Membership-inference advantage rises with training epochs', 'self_verified');
h('H-25', '校准损失可提升推断准确率', 'Calibrated loss improves inference accuracy', 'self_verified');
h('H-26', '大模型上的成员推断接近随机', 'Membership inference on large models is near chance', 'closed');
h('H-27', '训练数据去重降低推断优势', 'Deduplicating training data lowers the advantage');
h('H-28', '差分隐私训练可消除推断优势', 'Differentially private training removes the advantage');
h('H-29', '参考模型攻击在 7B 以内最有效', 'Reference-model attacks work best up to 7B');

const IDEAS = [
  ['P-011', '越狱评测', 'Jailbreak evaluation', 'done'],
  ['P-013', '自动审稿', 'Automated review', 'done'],
  ['P-014', '返回值隔离', 'Tool-return isolation', 'running'],
  ['P-015', '后门检测', 'Backdoor detection', 'done'],
  ['P-016', '注入检测', 'Injection detection', 'running'],
  ['P-017', '检索投毒', 'Retrieval poisoning', 'running'],
  ['P-018', '复现评测', 'Reproduction evaluation', 'candidate'],
  ['P-019', '成员推断', 'Membership inference', 'parked'],
];

// tree nodes: [key, hyp, parentKey, role]
const OWN = 'own_to_prove', BOR = 'borrowed_assumption';
const TREES = {
  'P-014': [['1', 'H-30', null, OWN], ['1.1', 'H-01', '1', BOR], ['1.2', 'H-31', '1', OWN], ['1.2.1', 'H-02', '1.2', OWN], ['1.2.2', 'H-11', '1.2', OWN],
    ['1.2.3', 'H-05', '1.2.1', OWN], ['1.2.3.1', 'H-07', '1.2.3', OWN], ['1.2.4', 'H-19', '1.2', OWN], ['1.3', 'H-33', '1', OWN], ['1.3.1', 'H-12', '1.3', OWN],
    ['1.3.2', 'H-34', '1.3', OWN], ['1.I', 'H-03', null, OWN]],
  'P-016': [['1', 'H-02', null, BOR], ['1.1', 'H-01', '1', BOR], ['1.2', 'H-11', '1', OWN], ['1.3', 'H-09', '1', OWN], ['1.3.1', 'H-35', '1.3', OWN],
    ['1.4', 'H-19', '1', OWN], ['1.5', 'H-16', '1', OWN], ['1.6', 'H-36', '1', OWN], ['1.9', 'H-06', '1', BOR], ['1.10', 'H-12', '1', BOR], ['1.I', 'H-03', null, OWN]],
  'P-017': [['1', 'H-38', null, OWN], ['1.1', 'H-06', '1', OWN], ['1.1.1', 'H-02', '1.1', BOR], ['1.2', 'H-14', '1', OWN], ['1.3', 'H-18', '1', OWN],
    ['1.4', 'H-09', '1', OWN], ['1.5', 'H-16', '1', OWN], ['1.6', 'H-39', '1', OWN], ['1.9', 'H-01', '1', BOR], ['1.10', 'H-11', '1', BOR]],
  'P-011': [['1', 'H-41', null, OWN], ['1.1', 'H-42', '1', OWN], ['1.2', 'H-43', '1', OWN], ['1.3', 'H-44', '1', BOR], ['1.4', 'H-45', '1', OWN], ['1.5', 'H-10', '1', OWN], ['1.6', 'H-13', '1', OWN]],
  'P-013': [['1', 'H-46', null, OWN], ['1.1', 'H-47', '1', OWN], ['1.2', 'H-48', '1', OWN], ['1.3', 'H-49', '1', OWN], ['1.4', 'H-50', '1', BOR], ['1.5', 'H-51', '1', OWN], ['1.6', 'H-15', '1', OWN], ['1.7', 'H-17', '1', OWN]],
  'P-015': [['1', 'H-52', null, OWN], ['1.1', 'H-53', '1', OWN], ['1.2', 'H-54', '1', OWN], ['1.3', 'H-55', '1', OWN], ['1.4', 'H-56', '1', OWN], ['1.5', 'H-57', '1', OWN],
    ['1.6', 'H-58', '1', OWN], ['1.7', 'H-59', '1', OWN], ['1.8', 'H-20', '1', OWN]],
  'P-019': [['1', 'H-24', null, OWN], ['1.1', 'H-25', '1', OWN], ['1.2', 'H-26', '1', OWN], ['1.3', 'H-27', '1', OWN], ['1.4', 'H-28', '1', OWN], ['1.5', 'H-29', '1', OWN]],
};
// extra hyps not yet placed in a tree (H-32, H-37, H-40, H-04, H-08) hang under running ideas
TREES['P-014'].push(['1.4', 'H-32', '1', OWN]);
TREES['P-016'].push(['1.7', 'H-37', '1', OWN], ['1.8', 'H-08', '1', OWN]);
TREES['P-017'].push(['1.7', 'H-40', '1', OWN], ['1.8', 'H-04', '1', OWN]);

// ---------------------------------------------------------------- experiments
const cfgOf = (model, batch, seed, opt, steps, measure) => ({ model, batch, seed, opt, steps, measure });
const EXP_DONE = [
  ['e_01', 'H-01', 'P-014', 0.8], ['e_02', 'H-01', 'P-016', 0.6], ['e_03', 'H-12', 'P-014', 0.5], ['e_04', 'H-02', 'P-014', -0.7], ['e_05', 'H-05', 'P-014', -0.4],
  ['e_06', 'H-05', 'P-014', -0.6], ['e_07', 'H-05', 'P-014', -0.6], ['e_08', 'H-11', 'P-014', 0.2], ['e_09', 'H-02', 'P-016', -0.8], ['e_10', 'H-06', 'P-017', 0.4],
  ['e_11', 'H-11', 'P-016', 0.2], ['e_12', 'H-02', 'P-014', -1.2], ['e_13', 'H-02', 'P-017', 0.3], ['e_14', 'H-02', 'P-016', 0.3], ['e_17', 'H-12', 'P-014', 0.4],
];

export function makeWorkspace(now = Date.now()) {
  const ws = { v: 1, createdAt: now, updatedAt: now, lastTick: now, seq: { exp: 26, run: 2310, hyp: 60, node: 145, spark: 6, idea: 20, event: 0, cand: 0 } };

  ws.settings = { parallel: 3, budget: 120, gpuUsed: 84, gpus: 4 };
  ws.agents = { surveyor: 'deepseek', executor: 'codex', reviewer: 'claude' };

  // ---- ideas & hypotheses & trees
  ws.ideas = IDEAS.map(([id, zh, en, status]) => ({ id, name: b(zh, en), status, color: COLORS[id] || COLORS.done }));
  ws.hyps = {};
  for (const x of H) {
    ws.hyps[x.id] = {
      id: x.id, claim: x.claim, warrant: x.warrant || null, status: x.status, induced: !!x.induced, needsDecompose: !!x.needsDecompose, rerun: !!x.rerun,
      depends: x.depends || [], decisions: (x.decisions || []).map((k, i) => ({ kind: k, at: now - (600 - i * 60) * MIN })), pivots: x.pivots || 0,
      evidence: x.ev.map(([exp, idea, delta, zh, en], i) => ({ exp, idea, delta, note: b(zh, en), at: now - (3000 - i * 200) * MIN })),
    };
  }
  ws.trees = {};
  for (const [idea, nodes] of Object.entries(TREES)) ws.trees[idea] = nodes.map(([k, hyp, parent, role]) => ({ k, hyp, parent, role, frozen: false, local: null }));
  ws.hyps['H-02'].depends = [];
  ws.hyps['H-05'].depends = ['H-02', 'H-11'];
  ws.crossDeps = [['H-19', 'H-12'], ['H-09', 'H-06'], ['H-16', 'H-11'], ['H-35', 'H-06'], ['H-36', 'H-01'], ['H-14', 'H-06'], ['H-18', 'H-14']];
  ws.candidateNote = {};

  // ---- experiments
  ws.experiments = {};
  const mk = (e) => (ws.experiments[e.id] = e);
  EXP_DONE.forEach(([id, hyp, idea, delta], i) => mk({
    id, hyp, idea, status: 'done', prog: 1, startedAt: now - (2600 - i * 140) * MIN, durMs: 10 * MIN, gpu: i % 4, cfg: cfgOf('Llama-3.1-8B / AgentDojo', '32 → 512', '0,1,2', 'delimiter', '1,240', 'attn / block_rate'),
    outcome: { delta, rec: delta >= 0 ? 'PROCEED' : 'PIVOT', conf: 0.7 }, decision: { kind: delta >= 0 ? 'PROCEED' : 'PIVOT', at: now - (2590 - i * 140) * MIN, auto: true }, hours: 3.2, cost: 56, label: b('已完成实验', 'Completed experiment'),
  }));
  mk({
    id: 'e_15', hyp: 'H-11', idea: 'P-014', node: 'n_142', status: 'running', prog: 0.62, startedAt: now - 3.7 * MIN, durMs: 6 * MIN, gpu: 0, hours: 6.4, cost: 112, vcpu: 36,
    cfg: cfgOf('Llama-3.1-8B / InjecAgent', '32 → 2048 (7)', '0,1,2', 'delimiter · template B', '1,240', 'block_rate / attn_injected'),
    outcome: { delta: 0.6, rec: 'PROCEED', conf: 0.72 }, label: b('n_142 更换基准复核', 'n_142 benchmark re-check'), sweep: true,
  });
  mk({
    id: 'e_16', hyp: 'H-16', idea: 'P-014', status: 'running', prog: 0.31, startedAt: now - 3.1 * MIN, durMs: 10 * MIN, gpu: 1, hours: 8.0, cost: 140, vcpu: 36,
    cfg: cfgOf('Llama-3.1-8B / AgentDojo', '128', '0,1,2', 'no defence (baseline)', '1,240', 'ASR'), outcome: { delta: 0.5, rec: 'PROCEED', conf: 0.81 }, label: b('共用攻击基线同种子重测', 'Shared attack baseline re-run, same seeds'),
  });
  mk({
    id: 'e_18', hyp: 'H-14', idea: 'P-017', status: 'running', prog: 0.08, startedAt: now - 0.9 * MIN, durMs: 11 * MIN, gpu: 2, hours: 3.5, cost: 61, vcpu: 18,
    cfg: cfgOf('Qwen2.5-7B / PoisonedRAG', '256', '0,1', 'PCA filter · r = 8', '800', 'detection error'), outcome: { delta: 0.4, rec: 'PROCEED', conf: 0.66 }, label: b('主方向误差界', 'Principal-direction error bound'),
  });
  const q = (id, hyp, idea, zh, en, d, rec) => mk({
    id, hyp, idea, status: 'queued', prog: 0, durMs: 7 * MIN, hours: 3, cost: 52, cfg: cfgOf('Llama-3.1-8B / AgentDojo', '128', '0,1,2', 'delimiter', '800', 'block_rate'),
    outcome: { delta: d, rec, conf: 0.6 }, label: b(zh, en), queuedAt: now - 30 * MIN,
  });
  q('e_19', 'H-12', 'P-014', '标记无需额外调用', 'Delimiting without extra calls', 0.5, 'PROCEED');
  q('e_20', 'H-18', 'P-017', '过滤不降低召回', 'Filtering keeps recall', 0.4, 'PROCEED');
  q('e_22', 'H-30', 'P-014', '补两条近期基线对比', 'Head-to-head vs. two recent baselines', 0.5, 'PROCEED');
  q('e_23', 'H-33', 'P-014', 'profiler 实测开销', 'Profiler-measured overhead', 0.4, 'PROCEED');
  ws.experiments.e_22.fromComment = 'B1'; ws.experiments.e_23.fromComment = 'C1';

  // ---- exp tree (per idea, P-014 detailed)
  ws.exptree = { 'P-014': makeExpTree(now) };

  // ---- runs history (timeline). start = ms before now, dur = ms
  const R = (id, gpu, agoH, durH, idea, zh, en, status = 'done', cost = 0) => ({ id, gpu, start: now - agoH * HOUR, dur: durH * HOUR, idea, label: b(zh, en), status, cost });
  ws.runs = [
    R('run_2286', 0, 23.4, 4.2, 'P-014', '调参', 'tuning'), R('run_2291', 0, 17.6, 5.0, 'P-014', '7 档扫描', '7-tier sweep'), R('run_2302', 0, 11.7, 2.6, 'P-016', '裁定核查', 'verdict check'),
    R('run_2288', 1, 23.3, 2.4, 'P-017', '', ''), R('run_2289', 1, 20.2, 1.8, 'P-014', '', '', 'failed'), R('run_2295', 1, 17.7, 5.6, 'P-016', '共用攻击基线', 'shared attack baseline'),
    R('run_2293', 2, 21.3, 4.0, 'P-018', '复现基准初探', 'reproduction-benchmark probe', 'done'), R('run_2290', 2, 16.9, 1.8, 'P-016', '', '', 'failed'), R('run_2298', 2, 13.6, 6.0, 'P-014', '三种子重复', '3-seed repeat'),
    R('run_2287', 3, 23.3, 3.6, 'P-016', '检测判据核查', 'detection-criterion check'), R('run_2292', 3, 19.3, 2.0, 'P-014', '', '', 'failed'), R('run_2297', 3, 15.2, 5.6, 'P-017', '召回率测量', 'recall probe'),
    R('run_2301', 3, 8.4, 2.0, 'P-014', 'H-11 扫描 · n = 2048', 'H-11 sweep · n = 2048', 'failed', 35),
  ];
  ws.failures = [
    { id: 'f1', kind: 'oom', n: 3, rescued: 3, status: 'rescued', title: b('显存不足 OOM', 'Out of memory (OOM)'), cause: b('n = 2048 时上下文超出单卡显存，agent 提交前未估算显存需求。', 'At n = 2048 the context exceeds single-GPU memory; the agent submitted without estimating memory requirements.'), action: b('降到 n = 1024 重试，并把上限写进该节点配置', 'Retry at n = 1024 and write the ceiling into the node config') },
    { id: 'f2', kind: 'timeout', n: 2, rescued: 2, status: 'rescued', title: b('超时', 'Timeout'), cause: b('单次运行超过 6 小时上限被终止，日志停止于第 620 / 1,240 次会话。', 'A run exceeded the 6-hour limit and was terminated; the log ends at session 620 of 1,240.'), action: b('拆分为两段分别运行，每 100 次会话保存断点', 'Split into two segments and resume; checkpoint every 100 sessions') },
    { id: 'f3', kind: 'format', n: 1, rescued: 0, status: 'review', title: b('产物格式错误', 'Malformed artifact'), cause: b('metrics.csv 缺少 seed 列，下游绘图脚本无法读取。', 'metrics.csv lacks a seed column; the plotting script cannot read it.'), action: b('按 artifacts 规范重写并回填，已通知 executor', 'Rewrite per the artifacts spec and backfill; executor notified') },
    { id: 'f4', kind: 'data', n: 1, rescued: 0, status: 'review', title: b('数据缺失', 'Missing data'), cause: b('AgentDojo 环境镜像在新节点上不存在。', 'The AgentDojo environment image does not exist on the new node.'), action: b('重新拉取并缓存至共享存储，任务重新排队', 'Re-pulled and cached on shared storage; task re-queued') },
  ];
  ws.spendByIdea = { 'P-014': 38.2, 'P-016': 23.4, 'P-017': 16.1, 'P-018': 6.3 };
  ws.failBurn = 7.1;

  // ---- sweep for e_15 / H-11
  ws.sweep = makeSweep();

  // ---- verdicts
  ws.verdicts = {};
  ws.verdictHistory = [
    ['H-46', 'close', 'P-013', 26], ['H-43', 'close', 'P-011', 30], ['H-15', 'close', 'P-013', 34], ['H-26', 'close', 'P-019', 41],
    ['H-44', 'downgrade', 'P-011', 44], ['H-50', 'downgrade', 'P-013', 47], ['H-07', 'return_active', 'P-014', 3], ['H-42', 'narrow_scope', 'P-011', 52], ['H-25', 'narrow_scope', 'P-019', 58],
  ].map(([hyp, verdict, idea, agoH]) => ({ hyp, verdict, idea, at: now - agoH * HOUR }));

  // ---- events
  ws.events = [];
  const ev = (agoMin, mod, zh, en, dzh, den, kind = 'info', extra = {}) => ws.events.push({ id: ws.events.length + 1, t: now - agoMin * MIN, mod, title: b(zh, en), detail: b(dzh, den), kind, ...extra });
  ev(60 * 23, 'surveyor', '采集完成 · 200 条文献 / 48 digest', 'Collection done · 200 records / 48 digests', '已达预算上限，采集断点已保存；TDSC 入口不可用，跳过 3 篇', 'Budget reached, cursors written back; TDSC entry unavailable, 3 papers skipped', 'collect');
  ev(60 * 20, 'surveyor', '2026-09 期趋势综述 + 6 条 spark', '2026-09 trend review + 6 sparks', '3 个新簇；1 条 spark 已被展开为 idea', '3 new clusters; 1 spark expanded into an idea', 'collect');
  ev(60 * 17.5, 'executor', 'e_14 完成 · H-02 证据 +0.3', 'e_14 done · H-02 evidence +0.3', '同步更新 P-014 P-016 P-017', 'P-014 P-016 P-017 updated together', 'experiment', { hyp: 'H-02' });
  ev(60 * 16.8, 'reviewer', 'H-05 提交裁定', 'H-05 submitted for verdict', '连续 3 次 PIVOT 无改善', '3 consecutive PIVOTs, no improvement', 'verdict', { hyp: 'H-05' });
  ev(60 * 16.4, 'human', 'P-017 立项 · 复用 H-01 H-02 H-06', 'P-017 launched · reuses H-01 H-02 H-06', '仅新增 3 条自有假设', 'Only 3 own hypotheses added', 'idea');
  ev(60 * 16, 'executor', '归纳出 H-03', 'H-03 induced', '来自 P-014 的 1.2.2 与 P-016 的 2.1', 'From P-014 1.2.2 and P-016 2.1', 'hypothesis', { hyp: 'H-03' });
  ev(60 * 15, 'reviewer', 'reviewer 巡检 · 处理 1 项', 'Reviewer sweep · 1 item handled', 'H-07 退回 active', 'H-07 returned to active', 'verdict');
  ev(60 * 14.5, 'executor', 'P-015 完成 · 生成论文草稿', 'P-015 wrapped up · draft generated', '9 个节点全部通过验证', 'All 9 nodes self_verified', 'paper');
  ev(60 * 13.5, 'executor', 'e_10 完成 · H-06 证据 +0.4', 'e_10 done · H-06 evidence +0.4', 'P-017 第 1 层通过', 'P-017 layer 1 passed', 'experiment', { hyp: 'H-06' });
  ev(60 * 10, 'human', '批准 P-017 立项', 'Approved P-017 launch', '人工介入', 'Manual intervention', 'idea');
  ws.events.sort((a, c) => c.t - a.t);
  ws.seq.event = ws.events.length;
  ws.lastHuman = now - 60 * 16.4 * MIN;

  // ---- survey
  ws.survey = makeSurvey(now);
  ws.trends = null; // static
  ws.papers = makePapers(now);
  ws.sparks = makeSparks(now);
  ws.trendGaps = { g1: false, g2: false, g3: false }; // gap -> spark generated
  ws.ideaLab = makeIdeaLab();
  ws.paper = makePaper(now);
  ws.claims = makeClaims();
  ws.figures = makeFigures(now);
  ws.rebuttal = makeRebuttal();
  ws.exports = { claimsGate: null };
  ws.decisions = { fig3: false }; // human decision cards on Home
  ws.snoozed = {};
  return ws;
}

// ---------------------------------------------------------------- experiment tree (P-014)
function makeExpTree(now) {
  const n = (id, type, status, score, parent, zh, en, extra = {}) => ({ id, type, status, score, parent, summary: b(zh, en), ...extra });
  return {
    budget: { used: 84, total: 120 }, parallel: 3, k: 3,
    nodes: [
      n('n_101', 'new', 'success', 0.52, null, '初探：在三档 n 上复现攻击成功率', 'Probe: reproduce the attack success rate at three tiers of n', { stage: 'probe' }),
      n('n_108', 'improve', 'success', 0.63, 'n_101', '初探：加入隔离标记，观察拦截率', 'Probe: add delimiters and watch the interception rate', { stage: 'probe' }),
      n('n_112', 'fix', 'failed', null, 'n_108', '修复：n = 2048 时上下文超出单卡显存', 'Fix: the context at n = 2048 exceeds single-GPU memory', { stage: 'probe', pruned: true }),
      n('n_115', 'improve', 'success', 0.68, 'n_108', '调参：标记模板 × 标记强度网格', 'Tune: delimiter template × strength grid', { stage: 'tune' }),
      n('n_118', 'improve', 'pruned', 0.55, 'n_108', '调参：随机化标记（不优于固定标记）', 'Tune: randomised delimiters (no better than fixed)', { stage: 'tune', pruned: true }),
      n('n_124', 'improve', 'success', 0.81, 'n_115', '主实验：最优配置 模板 B, α = 0.35', 'Main: best config template B, α = 0.35', { stage: 'main', best: true }),
      n('n_141', 'improve', 'success', 0.79, 'n_124', '7 档 n 扫描', '7-tier sweep over n', { stage: 'main' }),
      n('n_142', 'improve', 'running', null, 'n_124', '更换基准复核。把 n_124 的最优配置从 AgentDojo 迁移到 InjecAgent，只换基准，不调参数。', 'Benchmark re-check: carry n_124’s best config from AgentDojo to InjecAgent, changing only the benchmark.', {
        stage: 'main', exp: 'e_15', change: 'benchmark: agentdojo → injecagent', hyp: 'H-11',
      }),
      n('n_145', 'improve', 'success', 0.74, 'n_124', '三种子重复', 'Three-seed repeat', { stage: 'main' }),
      n('n_151', 'improve', 'queued', null, 'n_141', '消融：去掉隔离标记', 'Ablation: drop the delimiters', { stage: 'ablate', exp: 'e_19' }),
      n('n_152', 'improve', 'success', 0.66, 'n_141', '消融：只保留分隔符，去掉模板', 'Ablation: keep the separator, drop the template', { stage: 'ablate' }),
      n('n_153', 'fix', 'failed', null, 'n_145', '修复：metrics.csv 缺少 seed 列', 'Fix: metrics.csv missing seed column', { stage: 'main', pruned: true }),
    ],
  };
}

// ---------------------------------------------------------------- sweep
function makeSweep() {
  const batches = [32, 64, 128, 512, 1024, 2048];
  const eff = { 32: [0.38, 0.35, 0.4], 64: [0.47, 0.5, 0.45], 128: [0.61, 0.6, 0.64], 512: [0.83, 0.79, 0.85], 1024: [0.91, 0.87, null], 2048: [null, null, null] };
  const noise = { 32: [4.21, 4.35, 4.08], 64: [3.02, 2.96, 3.1], 128: [2.06, 2.1, 2.01], 512: [1.04, 1.01, 1.08], 1024: [0.74, 0.72, null], 2048: [null, null, null] };
  const cells = [];
  for (const bt of batches) for (let s = 0; s < 3; s++) {
    const e = eff[bt][s];
    cells.push({ b: bt, s, eff: e, noise: noise[bt][s], state: e == null ? (bt === 2048 ? 'oom' : 'running') : 'done' });
  }
  return { hyp: 'H-11', metric: 'eff', mode: 'single', alpha: 0.05, cells, cmp: [32, 512], cmp2: [32, 64], rep: { b: 128, s: 1, lr: 'template B · α = 0.35', run: 'run_2291' }, written: false, gpuh: 18.4, remain: 2.6, filled: false };
}

// ---------------------------------------------------------------- survey
function makeSurvey(now) {
  const V = (id, name, type, level, scan, entry, cursor, delta, st = 'ok') => ({ id, name, type, level, scan, entry, cursor, delta, status: st });
  return {
    lastRun: now - 26 * HOUR, nextInDays: 7, job: null, records: 200, fulltext: 48, fulltextCap: 60, library: 1207, whitelist: 62, thisRound: 200, skipped: 79,
    venues: [
      V('CCS', 'ACM CCS', 'conf', 'CCF-A', 'core', 'dblp:conf/ccs', '2024', 18), V('IEEE-SP', 'IEEE S&P (Oakland)', 'conf', 'CCF-A', 'core', 'dblp:conf/sp', '2025', 12),
      V('USENIX-SEC', 'USENIX Security', 'conf', 'CCF-A', 'core', 'byname/108', '2025', 21), V('NDSS', 'NDSS', 'conf', 'CCF-A', 'core', 'ndss', '2026', 9),
      V('SATML', 'IEEE SaTML', 'conf', '', 'core', 'satml.org', '2026', 14), V('POPETS', 'PoPETs / PETS', 'journal', 'CCF-B', 'core', 'popets', '2026-Q3', 7),
      V('TDSC', 'IEEE TDSC', 'journal', 'CCF-A', 'core', 'issn:1545-5971', '', 0, 'broken'), V('NMI', 'Nature Machine Intelligence', 'journal', 'top', 'core', 'issn:2522-5839', '09', 3),
      V('NATURE', 'Nature', 'journal', 'top', 'core', 'issn:0028-0836', '09-12', 1), V('ARXIV-CR', 'arXiv cs.CR', 'preprint', '', 'core', 'arxiv:cs.CR', '2026-09-18', 96),
      V('NEURIPS', 'NeurIPS', 'conf', 'CCF-A', 'watch', 'papers.nips.cc', '2025', 14), V('ICLR', 'ICLR', 'conf', '', 'watch', 'openreview', '2026', 11),
      V('ARXIV-MA', 'arXiv cs.MA', 'preprint', '', 'watch', 'arxiv:cs.MA', '09-18', 8), V('ACL', 'ACL', 'conf', 'CCF-A', 'watch', 'aclanthology', '2026', 6),
      V('TIFS', 'IEEE TIFS', 'journal', 'CCF-A', 'core', 'issn:1556-6013', '08', 5), V('ARXIV-LG', 'arXiv cs.LG', 'preprint', '', 'watch', 'arxiv:cs.LG', '09-18', 4),
      V('RECSYS', 'RecSys', 'conf', 'CCF-B', 'watch', 'recsys.acm.org', '2026', 2),
    ],
    others: 48, parked: 12, enumerated: 3182, passedTopics: 268, funnel: { l1: 200, l2: 48, l3: 12 }, stock: [1207, 486, 38],
    state: { 'dblp:conf/ccs': '2024', 'arxiv:cs.CR': '2026-09-18', 'no-doi': 14, 'auth-failed': 3, 'not-in-scope': 62 },
    notes: b('TDSC 入口改版，本轮 3 篇因登录失败已跳过并记录，未重试；已追加至 candidates 待确认。', 'TDSC changed its entry page; 3 login failures this round were skipped and logged, not retried; appended to candidates for confirmation.'),
    candidates: [
      { id: 'c1', kind: 'venue', name: 'Nature Methods', date: '09-14', why: b('发表了一套可迁移的自动发现框架，符合 ai-scientist 纳入定义 · 触发 arxiv-2608-04417', 'Published a transferable automated-discovery framework that fits the ai-scientist inclusion rule · triggered by arxiv-2608-04417'), accept: b('并入 venues.yaml', 'Add to venues.yaml') },
      { id: 'c2', kind: 'topic', name: b('agent 工具链投毒', 'agent tool-chain poisoning'), date: '09-16', why: b('攻击面在 agent 调用的外部工具上，落点仍在 AI 系统本身 · 触发 4 篇', 'The attack surface is the external tools an agent calls; the impact still falls on the AI system itself · triggered by 4 papers'), accept: b('并入 topics.md', 'Add to topics.md') },
    ],
    topics: ['security', 'ai-scientist'],
  };
}

// ---------------------------------------------------------------- papers
function makePapers(now) {
  const P = {};
  const add = (id, o) => (P[id] = { id, doi: null, status: 'preprint', level: 1, tracks: ['security'], fetched: '2026-09-1' + (Object.keys(P).length % 9), size: '1.8 MB', queued: false, brief: false, full: false, keywords: [], digest: null, similar: [], ...o });
  add('arxiv-2606-01882', {
    title: b('Tool-Returned Content as an Injection Surface in LLM Agents', 'Tool-Returned Content as an Injection Surface in LLM Agents'), authors: 'L. Ren, M. Okabe, S. Iyer, +2', venue: 'ARXIV-CR', year: 2026, arxiv: '2606.01882', level: 2,
    tracks: ['security', 'ai-scientist'], fetched: '2026-09-14', size: '2.4 MB', regenAt: null,
    reason: b('攻击面在 agent 读取的工具返回值上，失效后果落在 AI 系统自身；同时提出可复用的自动评测流程。', 'The attack surface is the tool-return value an agent reads, with the failure falling on the AI system itself; it also proposes a reusable automated evaluation pipeline.'),
    keywords: ['indirect prompt injection', 'tool poisoning', 'agent hijacking', 'LLM agent', 'black-box attack', 'automated evaluation'],
    digest: {
      title: b('工具返回值：LLM agent 中被忽略的注入面', 'Tool return values: the overlooked injection surface in LLM agents'),
      problem: b('agent 把外部工具的返回值直接读进上下文时，这段内容是否构成一条独立的注入路径？现有防御集中在用户输入与系统提示，这一侧几乎没有覆盖。', 'When an agent reads external tool return values straight into its context, do they form an independent injection path? Existing defences focus on user input and system prompts; this side is almost entirely unaddressed.'),
      threat: b('攻击者不接触模型与用户，只控制 agent 调用的某个第三方工具的返回内容，例如搜索结果页或文档服务。攻击者没有梯度与权重访问权限，可多轮返回。', 'The attacker has no access to the model or the user; they only control the return content of a third-party tool the agent calls (search page, document service, MCP tool). No gradients, no weight access, multi-turn returns allowed.'),
      method: b('把工具返回值建模为不可信通道，构造 5 类载荷。在 3 个开源 agent 框架上做黑盒注入，并用自动化流水线批量生成与判定。', 'Model tool returns as an untrusted channel, craft 5 payload classes (instruction rewrite, goal substitution, tool-chain hop, privilege escalation, silent exfiltration), inject black-box into 3 open-source agent frameworks, and use an automated pipeline to generate and judge at scale.'),
      eval: b('3 个框架 × 4 个基座模型 × 5 类载荷，共 1,240 次会话。总成功率 34.7%，其中指令改写最高，为 51.2%。输入端净化基线只把成功率降到 31.1%，几乎无效。', '3 frameworks × 4 base models × 5 payload classes, 1,240 sessions; success rate 34.7% (instruction rewrite highest at 51.2%, silent exfiltration lowest at 9.8%); an input-side sanitising baseline only lowers it from 34.7% to 31.1%, almost no effect.'),
      conclusion: b('注入面的位置比载荷形式更关键；把防御放在工具返回值入口处，同样的规则集可把成功率降到 6.4%。', 'The location of the injection surface matters more than the payload form; putting the defence at the tool-return entry drops the success rate to 6.4% with the same rule set.'),
      limits: b('只测了三个开源框架，未覆盖闭源产品。判定依赖自动裁判，误判率为 4.1%。多轮场景只做了 3 轮，更长的会话可能提高静默外泄的成功率。', 'Only three open-source frameworks were tested; closed products are not covered. Judging relies on an automated judge with a reported 4.1% error rate. Multi-turn tests stop at 3 rounds; longer sessions may raise silent-exfiltration success.'),
    },
    similar: [['arxiv-2608-04417', 0.89], ['doi-10-1145-3576915-3616600', 0.84], ['arxiv-2605-09931', 0.71]],
    cluster: b('间接注入与工具链投毒 · 该簇的首篇论文', 'Indirect injection & tool-chain poisoning · first paper of the cluster'),
  });
  const mini = (id, zh, en, venue, year, kw, prob, meth, concl, extra = {}) => add(id, {
    title: b(zh, en), authors: 'A. Author, B. Author, +1', venue, year, keywords: kw, level: 2, tracks: ['security'], reason: b('命中 security track。', 'Matches the security track.'),
    digest: { title: b(zh, en), problem: prob, threat: b('未提及', 'Not mentioned'), method: meth, eval: b('未提及', 'Not mentioned'), conclusion: concl, limits: b('未提及', 'Not mentioned') }, ...extra,
  });
  mini('arxiv-2608-04417', '工具链跳转的静态检测', 'Static detection of tool-chain hops', 'ARXIV-CR', 2026, ['tool poisoning', 'static analysis', 'agent hijacking'],
    b('agent 在多个工具之间跳转时，恶意返回值能否被静态发现。', 'Can malicious return values be found statically when an agent hops between tools?'), b('对工具调用图做污点传播分析。', 'Taint-propagation analysis over the tool-call graph.'), b('静态检测能发现 71% 的跳转，但只做检测，不改变防御位置。', 'Static analysis finds 71% of hops. It only detects them and does not move the defence.'));
  mini('doi-10-1145-3576915-3616600', 'RAG 检索结果投毒', 'RAG retrieval-result poisoning', 'CCS', 2024, ['RAG poisoning', 'retrieval', 'indirect prompt injection'],
    b('在检索结果中注入指令能否劫持生成。', 'Can instructions inserted into retrieval results hijack generation?'), b('构造带指令的文档并注入语料。', 'Craft instruction-bearing documents and inject them into the corpus.'), b('少量投毒文档即可显著改变输出。', 'A handful of poisoned documents significantly change the output.'));
  mini('arxiv-2605-09931', '越狱成功率与模型规模', 'Jailbreak success versus model scale', 'ARXIV-CR', 2026, ['jailbreak', 'guardrail bypass', 'scaling'],
    b('模型规模越大是否越难被越狱。', 'Are larger models harder to jailbreak?'), b('在同一基准上测 7 个规模的模型。', 'Evaluate models at 7 scales on one benchmark.'), b('小模型反而更难被越狱，与通常认识相反。', 'Smaller models are harder to jailbreak, contrary to common belief.'));
  mini('doi-10-1109-sp2026-00142', '智能体工具输出的隐式信任', 'Implicit trust in agent tool outputs', 'IEEE-SP', 2026, ['tool poisoning', 'agent hijacking', 'trust'],
    b('agent 对工具输出的信任假设是否合理。', 'Is an agent’s trust assumption on tool outputs reasonable?'), b('形式化信任边界并做黑盒实验。', 'Formalise the trust boundary and run black-box experiments.'), b('隐式信任使注入几乎零成本。', 'Implicit trust reduces the cost of injection to almost zero.'));
  mini('arxiv-2607-11244', '自动科研系统的可复现性评测', 'Reproducibility evaluation for automated-science systems', 'ARXIV-MA', 2026, ['automated reproduction', 'benchmark', 'ai scientist'],
    b('自动科研系统的产出能否被第三方复现。', 'Can a third party reproduce what automated-science systems produce?'), b('构建复现基准，并在干净环境中重新运行。', 'Build a reproduction benchmark and re-run in clean environments.'), b('只有一小部分产出可被复现。', 'Only a small share of outputs can be reproduced.'), { tracks: ['ai-scientist'] });
  return P;
}

// ---------------------------------------------------------------- sparks
function makeSparks(now) {
  const S = (n, status, zh, en, papers, basisZh, basisEn, from, extra = {}) => ({
    id: 'SPARK-2026-09-00' + n, month: '2026-09', status, ask: b(zh, en), papers, basis: b(basisZh, basisEn), from: b(from[0], from[1]), createdAt: now - (7 - n) * HOUR * 6, ...extra,
  });
  const common = ['arxiv-2606-01882', 'doi-10-1145-3576915-3616600', 'arxiv-2608-04417', 'doi-10-1109-sp2026-00142', 'arxiv-2607-11244', 'arxiv-2605-09931'];
  return {
    quota: [5, 8], drafted: 9, dropped: 3, history: 47, carried: 12,
    items: [
      S(1, 'available', '若注入点位于工具返回值，将防御部署在用户输入端是否从一开始就选错了位置？', 'If the injection point lies in tool return values, was placing the defence at the user-input side misguided from the outset?', common,
        '已有工作都在净化用户输入与系统提示。agent 读取工具输出的一侧，有 6 篇论文提及风险，但没有工作给出防御，也没有人测量过实际成功率。', 'Existing work sanitises user input and system prompts; on the side where an agent reads tool output, 6 papers mention the risk, none proposes a defence, and the actual success rate on this path has not been measured.',
        ['来自本期空白：注入点位于工具返回值', 'From this period’s gap: the injection point is in tool return values'],
        { search: b('本地 index 中没有相同问法。历史最近邻是 SPARK-2026-07-003，已 merged，关注的是输入端。网络检索的最近邻 2 篇只做检测，不改防御位置。', 'No same question in the local index; nearest historical neighbour SPARK-2026-07-003 (merged, about the input side); two web queries, top 20 each, the 2 nearest papers only detect and do not move the defence.'),
          checks: [b('具有明确的现实影响：部署方将把净化层从输入端移至工具返回值处，覆盖范围与成本均会改变。', 'Has a real-world consequence: deployers would move the sanitising layer from the input side to the tool-return side, with different coverage and cost.'),
            b('去掉具体的方法与数据集后仍然成立。它关注的是防御位置，而不是具体方案。', 'It still holds without specific methods or datasets. It asks about location, not a solution.'),
            b('它不是把 A 方法用到 B 数据集。既没有指定方法，也没有指定数据集。', 'It is not a matter of applying method A to dataset B. It specifies neither.')], gap: 'g1' }),
      S(2, 'available', '同一基准上的规模与越狱关系出现相反结论时，测量的究竟是模型还是基准？', 'When one benchmark gives opposite results on scale and jailbreak success, is it measuring the model or the benchmark?', common.slice(4, 6),
        '两篇论文在同一基准上得出相反结论，评测口径不同但均未说明。', 'Two papers reach opposite conclusions on the same benchmark; the evaluation setups differ and neither says so.', ['来自本期矛盾：模型规模与越狱成功率', 'From this period’s contradiction: model scale vs. jailbreak success'], { gap: 'g2' }),
      S(3, 'developed', '自动科研系统的产出中，可被第三方复现的比例是多少？该问题尚无测量这一事实本身说明了什么？', 'What share of an automated-science system’s output can a third party reproduce? What does the absence of any such measurement imply?', ['arxiv-2607-11244'],
        '现有评测均针对结果正确性，尚无工作评估产出能否被第三方复现。', 'Evaluations look only at correctness of results; none checks whether outputs are reproducible by a third party.', ['来自本期空白：自动科研系统的评测仅关注正确性', 'From this period’s gap: automated-science systems are only judged on correctness'], { gap: 'g3', developedAs: 'P-018' }),
      S(4, 'selected', '如果把确认某类攻击不存在视为有效结论，评测成本是否反而更低？', 'If confirming that a class of attack does not exist counts as a result, is evaluation cheaper?', ['arxiv-2606-01882', 'arxiv-2608-04417', 'arxiv-2605-09931'],
        '负结果的评测只需覆盖上界，而无需穷举。', 'Negative results only need to cover an upper bound rather than enumerate.', ['源自历史 spark 的延伸问题', 'A follow-up on a historical spark']),
      S(5, 'available', '在已知某条越狱链路有效后，部署方实际会调整哪项配置？未作调整的原因是什么？', 'Once a jailbreak chain is known to be effective, which configuration does the deployer actually change, and why are other configurations left unchanged?', common.slice(0, 5),
        '现有工作止步于证明攻击可行，未追踪部署方的后续应对。', 'Existing work stops at demonstrating feasibility and does not examine the deployer’s subsequent response.', ['来自本期趋势中的上升方向', 'From this period’s rising directions']),
      S(6, 'available', '同一现象存在两种命名时，两个研究社区的文献检索是否已相互隔离？', 'When one phenomenon has two names, have the two research communities’ literature searches become mutually isolated?', common.concat(['x']).slice(0, 6),
        'jailbreak 与 guardrail bypass 并存，agent hijacking 与 agent takeover 也并存。', 'jailbreak and guardrail bypass coexist; so do agent hijacking and agent takeover.', ['来自本期术语变化', 'From this period’s term shifts']),
    ],
    actions: [
      { at: now - 26 * HOUR, zh: '003 被展开为一个 idea，状态转 developed', en: '003 expanded into an idea, status → developed' },
      { at: now - 50 * HOUR, zh: '004 转 selected，等待展开', en: '004 → selected, waiting to be expanded' },
      { at: now - 74 * HOUR, zh: '07-003 与本期 001 判为不同问法，未合并', en: '07-003 and this period’s 001 judged different questions, not merged' },
      { at: now - 98 * HOUR, zh: '12 篇已写入全文队列，surveyor 已读取', en: '12 papers written to the full-text queue; surveyor has retrieved them' },
    ],
  };
}

// ---------------------------------------------------------------- idea lab (candidates)
function makeIdeaLab() {
  const P = (id, zh, en, venue, ex, ids) => ({ id, title: b(zh, en), venue, extracted: ex, hyps: ids, selected: false });
  const T = (t) => [t, t]; // paper titles stay in the original English
  const lit = [
    P('l1', ...T('Not What You’ve Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection'), 'AISec 2023', 2, ['H-02', 'H-11']),
    P('l2', ...T('PoisonedRAG: Knowledge Corruption Attacks to Retrieval-Augmented Generation of Large Language Models'), 'USENIX Security 2025', 2, ['H-06', 'H-14']),
    P('l3', ...T('Defending Against Indirect Prompt Injection Attacks With Spotlighting'), 'arXiv 2024', 1, ['H-12']),
    P('l4', ...T('AgentDojo: A Dynamic Environment to Evaluate Prompt Injection Attacks and Defenses for LLM Agents'), 'NeurIPS 2024', 1, ['H-09']),
    P('l5', ...T('The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery'), 'arXiv 2024', null, []),
    P('l6', ...T('PaperBench: Evaluating AI’s Ability to Replicate AI Research'), 'ICML 2025', null, []),
  ];
  const plan = (rows) => rows.map(([hyp, mode, zh, en]) => ({ hyp, mode, claim: hyp ? null : b(zh, en) }));
  return {
    lit, cur: 0, launched: [],
    cands: [
      { id: 'P-018', spark: 'SPARK-2026-09-003', name: b('复现评测', 'Reproduction evaluation'), src: 'arXiv cs.MA + 12', claim: b('在干净环境中重跑 AI 科学家的产出，度量可被第三方复现的比例，并自动归类失败原因。', 'Re-run AI-scientist outputs in clean environments, measure the share a third party can reproduce, and classify the causes of failure automatically.'),
        plan: plan([['H-01', 'reuse'], ['H-47', 'reuse'], ['H-17', 'reuse'], [null, 'new', '复现结果须在干净环境中判定', 'Reproduction must be judged in a clean environment'], [null, 'new', '可复现比例随论文复杂度下降', 'The reproducible share falls with paper complexity'], [null, 'new', '失败原因可自动归类', 'Failure causes can be classified automatically']]) },
      { id: 'P-020', spark: 'SPARK-2026-09-004', name: b('负结果评测', 'Negative-result evaluation'), src: 'arXiv cs.CR + 8', claim: b('把确认某类攻击无效视为可提前终止的结论，以上界覆盖代替穷举，降低评测成本。', 'Treat confirming that a class of attack fails as a result that ends the evaluation early, covering an upper bound instead of enumerating, which lowers evaluation cost.'),
        plan: plan([['H-01', 'reuse'], ['H-08', 'reuse'], ['H-36', 'reuse'], [null, 'new', '无效攻击的上界可在 3 个种子内确认', 'The upper bound of an ineffective attack can be confirmed within 3 seeds'], [null, 'new', '提前终止不遗漏有效攻击', 'Early termination does not miss effective attacks']]) },
      { id: 'P-021', spark: 'SPARK-2026-09-005', name: b('检测与可用性折中', 'Detection–utility trade-off'), src: 'USENIX Security + 5', claim: b('联合选择检测阈值与过滤比例，使拦截率提升的同时正常任务成功率的损失落在噪声范围内。', 'Jointly choose the detection threshold and filtering ratio so that interception rises while the loss in benign task success stays within the noise.'),
        plan: plan([['H-06', 'reuse'], ['H-14', 'reuse'], ['H-18', 'reuse'], ['H-37', 'reuse'], [null, 'new', '联合选择优于分别选择', 'Joint selection beats separate selection'], [null, 'new', '折中点对随机种子稳健', 'The trade-off point is robust to the seed']]) },
    ],
  };
}

// ---------------------------------------------------------------- manuscript
function makePaper(now) {
  const S = (k, zh, en, hyps, status, paras, extra = {}) => ({ k, title: b(zh, en), hyps, status, paras, stale: false, ...extra });
  return {
    idea: 'P-014', ideaTitle: b('P-014 返回值隔离', 'P-014 Tool-return isolation'),
    sections: [
      S('1', '引言 · 问题与主张', 'Introduction · problem and claim', ['H-30'], 'ok', [
        b('agent 把工具返回值直接读入上下文，使间接注入的成本几乎为零。本文在工具返回值入口加入隔离标记，并证明它无需额外的模型调用。', 'Agents read tool returns straight into their context, which makes indirect injection almost free. We add delimiters at the tool-return entry and show that they need no extra model call.')]),
      S('2', '相关工作', 'Related work', ['H-01'], 'aligned', [b('已有工作用自动裁判统计攻击成功率，并把防御放在用户输入端（借用前提 4 条）。', 'Prior work measures attack success with automated judges and places defences at the user input (4 borrowed premises).')]),
      S('3', '方法 · 隔离标记', 'Method · delimiting', ['H-11', 'H-12', 'H-16'], 'ok', [b('隔离标记在解码前完成，不增加模型调用 [H-12, e_17, e_03]。', 'Delimiting is applied before decoding and adds no model call [H-12, e_17, e_03].'),
        b('该方法对任何基座模型都成立。', 'The method holds for any base model.')]),
      S('4.1', '实验设置', 'Experimental setup', ['H-16'], 'figure', [b('所有实验使用同一随机种子集合与同一攻击基线。', 'All experiments use the same seed set and the same attack baseline.')]),
      S('4.2', '拦截率随良性片段数的变化', 'Interception rate versus the number of benign chunks', ['H-11', 'H-02'], 'missing', [
        b('图 3(a) 给出六档良性片段数 n 下注入片段的注意力权重，2048 档因显存不足未完成。拟合显示注意力权重与 n 近似满足 −0.49 次幂关系，95% 置信带覆盖 −1/2 [e_15]，与 H-11 的断言一致；该趋势在两个独立基准上重复出现 [e_08, e_11]。',
          'Fig. 3(a) shows the attention weight on the injected span at six values of the benign-chunk count n; the 2048 tier did not finish because of insufficient memory. The fit follows roughly a −0.49 power of n, with a 95% band covering −1/2 [e_15], consistent with H-11; the trend repeats on two independent benchmarks [e_08, e_11].'),
        b('加入隔离标记后，拦截率在 n ≤ 128 区间提升 18.4% [e_17]，且标记在解码前完成，不增加模型调用 [H-12, e_03]。', 'With delimiters, the interception rate rises by 18.4% for n ≤ 128 [e_17], and delimiting happens before decoding, adding no model call [H-12, e_03].'),
        b('在 n = 2048 时趋势出现拐点，我们认为这是长上下文下注意力归因本身方差增大所致。', 'At n = 2048 the trend shows an inflection, which we attribute to the higher variance of attention attribution itself in long contexts.'),
        b('该结论的适用范围取决于 H-02 的最终判定：若其被限定在短返回值情形，本节结论需相应收窄。', 'The scope of this conclusion depends on the final verdict on H-02: if it is limited to short tool returns, the conclusion here must narrow accordingly.')],
        { fig: 'fig3' }),
      S('4.3', '消融 · 去掉隔离标记', 'Ablation · removing the delimiters', ['H-12'], 'ok', [b('去除隔离标记后拦截率回落至基线。', 'Removing the delimiters drops the interception rate back to the baseline.')]),
      S('5', '讨论 · 适用边界', 'Discussion · scope of applicability', ['H-02'], 'affected', [b('本方法在短返回值场景下普遍更优。', 'The method is generally better when tool returns are short.')]),
      S('6', '结论', 'Conclusion', [], 'todo', [b('（待写）', '(to be written)')]),
    ],
    gaps: [
      { id: 'gap1', done: false, title: b('n = 2048 需补充两个种子', 'n = 2048 needs seeds 2 and 3'), body: b('当前拐点结论仅有单次运行支撑，补充运行后本段可改为结论性表述。', 'The inflection conclusion rests on a single run. After re-running, this paragraph can be stated conclusively.'), hyp: 'H-11', label: b('n = 2048 补两个种子', 'n = 2048, two extra seeds'), btn: b('创建 e_21 并加入队列', 'Create e_21 and queue it') },
      { id: 'gap2', done: false, title: b('图 4 缺攻击基线曲线', 'Figure 4 lacks the attack-baseline curve'), body: b('H-16 的共用攻击基线重测正在运行（e_16），完成后将自动生成图 4。', 'The shared attack-baseline re-run for H-16 is in progress (e_16); Figure 4 is generated automatically when it finishes.'), exp: 'e_16', btn: b('查看 e_16', 'Open e_16') },
    ],
    version: 1, savedAt: now,
  };
}

function makeClaims() {
  const C = (id, sec, zh, en, hyp, ev, status, extra = {}) => ({ id, sec, text: b(zh, en), hyp, ev, status, ...extra });
  return {
    collapsed: 39,
    items: [
      C('c1', '4.2', '注入片段注意力与 n 近似满足 −0.49 次幂关系', 'Attention on the injected span follows roughly a −0.49 power of n', 'H-11', ['e_15', 'e_08'], 'supported'),
      C('c2', '4.2', '该趋势在两个独立基准上重复出现', 'The trend repeats on two independent benchmarks', 'H-11', ['e_08', 'e_11'], 'supported'),
      C('c3', '4.2', '在 n = 2048 时趋势出现拐点', 'At n = 2048 the trend shows an inflection', null, [], 'insufficient', {
        why: b('仅运行 1 个种子，且该档三格均出现 OOM', 'Only 1 seed was run, and all three cells at this tier hit OOM'), find: { zh: '在 n = 2048 时趋势出现拐点，我们认为这是长上下文下注意力归因本身方差增大所致。', en: 'At n = 2048 the trend shows an inflection, which we attribute to the higher variance of attention attribution itself in long contexts.' },
        chain: [b('断言 → 没有绑定假设', 'Claim → no bound hypothesis'), b('最近的假设 H-11 · 只覆盖 32–1024', 'Nearest hypothesis H-11 · covers only 32–1024'), b('相关运行 run_2301 · OOM 未完成', 'Related run run_2301 · OOM, not finished')],
        soften: { zh: '在 n = 2048 时，单次运行出现拐点。受显存限制，该档未做重复，此处仅作为待验证的现象记录。', en: 'At n = 2048 we observe an inflection in a single run; because of memory limits this tier was not repeated, so it is recorded here only as a phenomenon to be verified.' }, fixExp: { hyp: 'H-11', zh: 'n = 2048 补两个种子', en: 'n = 2048, two extra seeds' } }),
      C('c4', '3.1', '隔离标记在解码前完成，不增加模型调用', 'Delimiting is applied before decoding and adds no model call', 'H-12', ['e_17', 'e_03'], 'supported'),
      C('c5', '3.1', '该方法对任何基座模型都成立', 'The method holds for any base model', 'H-12', ['e_17'], 'overclaim', {
        why: b('仅在 Llama-3.1 与 Qwen2.5 上测试过，任何一词缺乏证据', 'Only tested on Llama-3.1 and Qwen2.5. The word any is not supported'), find: { zh: '该方法对任何基座模型都成立。', en: 'The method holds for any base model.' },
        chain: [b('断言 → 绑定 H-12', 'Claim → bound to H-12'), b('证据 e_17 · 仅 Llama-3.1 / Qwen2.5', 'Evidence e_17 · Llama-3.1 / Qwen2.5 only'), b('任何一词超出证据范围', 'the word any exceeds the evidence')],
        soften: { zh: '该方法在 Llama-3.1 与 Qwen2.5 上成立。', en: 'The method holds on Llama-3.1 and Qwen2.5.' } }),
      C('c6', '4.3', '去除隔离标记后拦截率回落至基线', 'Removing the delimiters drops the interception rate back to the baseline', 'H-12', ['e_19'], 'supported'),
      C('c7', '5', '本方法在短返回值场景下普遍更优', 'The method is generally better when tool returns are short', 'H-02', ['e_04'], 'overclaim', {
        why: b('H-02 正在裁定，且 e_04 是反例证据', 'H-02 is under verdict and e_04 is counter-evidence'), find: { zh: '本方法在短返回值场景下普遍更优。', en: 'The method is generally better when tool returns are short.' },
        chain: [b('断言 → 绑定 H-02', 'Claim → bound to H-02'), b('H-02 状态 pending_review', 'H-02 status pending_review'), b('e_04 −0.7 为反例', 'e_04 −0.7 is a counter-example')],
        soften: { zh: '在 n ≤ 128 的短返回值情形下，本方法更优；更一般的场景待 H-02 裁定。', en: 'For short returns with n ≤ 128 the method is better; more general settings await the verdict on H-02.' } }),
      C('c8', '4.1', '所有实验使用同一随机种子集合与同一攻击基线', 'All experiments use the same seed set and the same attack baseline', 'H-16', ['e_16'], 'insufficient', {
        why: b('e_16 仍在运行，完成前不宜作此表述', 'e_16 is still running; this statement is premature until it completes'), find: { zh: '所有实验使用同一随机种子集合与同一攻击基线。', en: 'All experiments use the same seed set and the same attack baseline.' },
        chain: [b('断言 → 绑定 H-16', 'Claim → bound to H-16'), b('证据 e_16 · 运行中', 'Evidence e_16 · running')],
        soften: { zh: '实验使用共用攻击基线；同种子重测正在进行（e_16）。', en: 'Experiments use a shared attack baseline; the same-seed re-run is in progress (e_16).' } }),
    ],
  };
}

function makeFigures(now) {
  const F = (n, zh, en, status, src, ver) => ({ n, title: b(zh, en), status, src, ver });
  return {
    items: [F(1, '方法示意', 'Method overview', 'done', 'draw.io · ' + 'hand-drawn', 'v2'), F(2, '注意力权重分布', 'Attention-weight distribution', 'done', 'run_2286', 'v1'), F(3, '注意力权重与拦截率', 'Attention weight and interception rate', 'redraw', 'run_2291', 'v4'),
      F(4, '攻击基线对照', 'Attack-baseline comparison', 'waiting', 'e_16', '—'), F(5, '消融：去掉隔离标记', 'Ablation: delimiters removed', 'waiting', 'e_19', '—'), F(6, '开销分解', 'Overhead breakdown', 'done', 'run_2297', 'v1')],
    fig3: {
      caption: b('图 3：(a) 注入片段注意力权重随良性片段数满足 n^-0.50（3 个种子均值，阴影为 95% 置信带）；(b) 加入隔离标记前后的拦截率，n ≤ 128 区间平均提升 17.6%。2048 档因显存不足未运行。', 'Figure 3: (a) attention weight on the injected span follows n^-0.50 (mean of 3 seeds, shaded area is the 95% band); (b) interception rate with and without delimiters, +17.6% on average for n ≤ 128. The 2048 tier was not run for lack of memory.'),
      captionEdited: false, measured: 17.6, ver: 4, yZero: false, bandTo: 2048, sameAxis: false,
      versions: [{ v: 'v4', at: now - 2 * HOUR, zh: '改成双栏 (a)(b)，加 95% 置信带与基线对比', en: 'Two-panel (a)(b), add 95% band and baseline comparison' }, { v: 'v2', at: now - 76 * HOUR, zh: '误差棒改成三种子极差', en: 'Error bars now show the 3-seed range' }, { v: 'v1', at: now - 119 * HOUR, zh: '首版，只有 4 档', en: 'First version, only 4 tiers' }],
      reviews: [
        { id: 'r1', st: 'open', zh: '(b) 的 y 轴从 0.26 起', en: '(b) y-axis starts at 0.26', bzh: '截断放大了两条曲线的差距，建议从 0 起始，或在图注中注明截断', ben: 'The truncation exaggerates the gap between the two curves; start the axis at 0 or state the truncation in the caption', fix: 'yZero' },
        { id: 'r2', st: 'open', zh: '(a) 的置信带外推到了 2048', en: '(a) confidence band is extrapolated to 2048', bzh: '该档无数据，建议将置信带截止于 1024，避免被误读为实测结果', ben: 'That tier has no data; cut the band at 1024 so it is not read as measured', fix: 'bandTo' },
        { id: 'r3', st: 'open', zh: '两栏横轴范围不同', en: 'The two panels have different x ranges', bzh: '(a) 到 2048，(b) 到 1024，并排阅读容易误认为同一区间', ben: '(a) goes to 2048 and (b) to 1024; read side by side, they may be mistaken for the same range', fix: 'sameAxis' },
      ],
    },
  };
}

function makeRebuttal() {
  const R = (id, rv, kind, zh, en, fzh, fen, status, extra = {}) => ({ id, rv, kind, text: b(zh, en), fix: b(fzh, fen), status, ...extra });
  return {
    reviewers: [
      { id: 'A', model: 'claude', score: 6, conf: 4, note: b('方法表述清晰，但长上下文部分的结论超出数据范围', 'The method is clearly presented, but the long-context conclusion extends beyond the data') },
      { id: 'B', model: 'gpt', score: 5, conf: 3, note: b('缺少与 StruQ、SecAlign 两条近期防御的直接对比，创新性难以判断', 'No direct comparison with two recent defences, StruQ and SecAlign; novelty is hard to judge') },
      { id: 'C', model: 'deepseek', score: 7, conf: 4, note: b('消融实验充分；建议给出开销的实测值而非估计值', 'The ablation is thorough; the overhead should be reported as a measurement rather than an estimate') },
    ],
    prevMean: 5.0, collapsed: 8,
    comments: [
      R('B1', 'B', 'exp', '实验不足', 'Insufficient experiments', '缺与 StruQ / SecAlign 两条防御的直接对比，无法判断提升幅度。', 'No direct comparison with the StruQ / SecAlign defences, so the size of the gain cannot be judged.', '补充 e_22：在相同设置下运行两条基线', 'Add e_22: run both baselines under the same setting', 'pending', { exp: 'e_22' }),
      R('A1', 'A', 'scope', '超出范围', 'Out of scope', '4.2 节第 3 段用单次运行下结论，2048 档未重复。', 'Section 4.2 paragraph 3 draws a conclusion from a single run; the 2048 tier is not repeated.', '已改成推测语气并标注单次运行', 'Rewritten as a tentative statement and marked as a single run', 'done'),
      R('C1', 'C', 'measure', '测量口径', 'Measurement basis', '开销 3% 是估计值还是实测？', 'Is the 3% overhead an estimate or a measurement?', '补 e_23：用 profiler 实测三档 n 下的开销', 'Add e_23: measure overhead with a profiler at three tiers of n', 'pending', { exp: 'e_23' }),
      R('B2', 'B', 'related', '相关工作', 'Related work', '漏了工具链投毒方向的两篇近期工作。', 'Two recent works on tool-chain poisoning are missing.', '从文献库直接引 2 篇，已插入 2 节', 'Two papers cited from the library; added to Section 2', 'done'),
      R('A2', 'A', 'repro', '复现', 'Reproducibility', '没说随机种子与环境版本。', 'Random seeds and environment versions are not stated.', '附录 A 加环境表，种子写进表 2', 'Environment table added to Appendix A; seeds written into Table 2', 'done'),
      R('C2', 'C', 'wording', '表述', 'Wording', '任何基座模型的说法与实验范围不符。', 'The phrase any base model does not match the experiments.', '已改为在 Llama-3.1 与 Qwen2.5 上成立', 'Changed to state Llama-3.1 and Qwen2.5 only', 'done'),
    ],
    repro: { code: 0.92, run: 0.85, match: 0.61, runs: 1, at: null },
    checklist: [
      { id: 'k1', done: true, zh: '正文 8 页内，附录另页', en: 'Main text within 8 pages, appendix separate' },
      { id: 'k2', done: true, zh: '参考文献格式统一', en: 'Reference format is consistent' },
      { id: 'k3', done: true, zh: '所有实验附随机种子与环境版本', en: 'Every experiment lists seeds and environment versions' },
      { id: 'k4', done: false, auto: 'fig4', zh: '图 4 已生成（待 e_16 运行完成）', en: 'Figure 4 is generated (awaiting e_16)' },
      { id: 'k5', done: false, auto: 'anon', zh: '匿名化已完成，作者信息与自引均已处理', en: 'Anonymised: authors, affiliations, acknowledgements, self-citations handled' },
      { id: 'k6', done: true, zh: '无过度声称，主张对照已通过', en: 'No overclaims (claim-evidence check passed)', auto: 'claims' },
    ],
    packed: null,
  };
}

// ---------------------------------------------------------------- blank workspace
// The same shape as makeWorkspace with nothing in it. A real project fills the
// parts it actually has; every screen must render an empty section without
// crashing, so all containers exist from the start.
export function blankWorkspace(now = Date.now()) {
  return {
    v: 1, createdAt: now, updatedAt: now, lastTick: now,
    seq: { exp: 1, run: 1, hyp: 1, node: 1, spark: 1, idea: 1, event: 0, cand: 0 },
    settings: { parallel: 3, budget: 120, gpuUsed: 0, gpus: 4 },
    agents: { surveyor: 'deepseek', executor: 'codex', reviewer: 'claude' },
    ideas: [], hyps: {}, trees: {}, crossDeps: [], candidateNote: {},
    experiments: {}, exptree: {}, runs: [], failures: [], spendByIdea: {}, failBurn: 0,
    sweep: null, verdicts: {}, verdictHistory: [], events: [], lastHuman: now,
    survey: {
      lastRun: now, nextInDays: 7, job: null, records: 0, fulltext: 0, fulltextCap: 0, library: 0,
      whitelist: 0, thisRound: 0, skipped: 0, venues: [], others: 0, parked: 0, enumerated: 0, passedTopics: 0,
      funnel: { l1: 0, l2: 0, l3: 0 }, stock: [0, 0, 0], state: {}, notes: b('', ''), candidates: [], topics: [],
    },
    trends: null, papers: {}, sparks: { quota: [5, 8], drafted: 0, dropped: 0, history: 0, carried: 0, items: [], actions: [] },
    trendGaps: {}, ideaLab: { lit: [], cur: 0, cands: [], launched: [] },
    paper: { idea: null, ideaTitle: b('', ''), sections: [], gaps: [], version: 1, savedAt: now },
    claims: { collapsed: 0, items: [] },
    figures: { items: [], fig3: { caption: b('', ''), captionEdited: false, measured: 0, ver: 1, yZero: true, bandTo: 0, sameAxis: true, versions: [], reviews: [] } },
    rebuttal: { reviewers: [], prevMean: 0, collapsed: 0, comments: [], repro: { code: 0, run: 0, match: 0, runs: 0, at: null }, checklist: [], packed: null },
    exports: { claimsGate: null }, decisions: {}, snoozed: {},
  };
}
