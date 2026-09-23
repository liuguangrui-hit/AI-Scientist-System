/* 动态假设-证据森林 · 数据生成
 *
 * 这里长出来的不是随机噪声，而是一片真的森林：每个 idea 是一棵论证树，
 * 树与树之间靠共享假设缝合，证据带符号地累积，裁定沿着角色传播。
 * 所有视觉上的美，都来自这层结构——不是画上去的。
 *
 * 经典脚本，无模块：双击 html 就能跑，不需要服务器。
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- 确定性随机
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------------------------------------------------------------- 六个研究方向
  const THEMES = [
    { id: 'OPT', zh: '优化几何', en: 'Optimisation geometry', hue: 214 },
    { id: 'GEN', zh: '泛化与容量', en: 'Generalisation & capacity', hue: 286 },
    { id: 'SEC', zh: '对抗与安全', en: 'Adversarial & security', hue: 344 },
    { id: 'SCL', zh: '规模律', en: 'Scaling laws', hue: 168 },
    { id: 'REP', zh: '表征结构', en: 'Representation structure', hue: 38 },
    { id: 'SYS', zh: '系统与通信', en: 'Systems & communication', hue: 192 },
  ];

  // 断言的构件：主语 + 关系 + 条件，拼出来的句子读着像真的
  const SUBJ = {
    OPT: ['梯度噪声尺度', '有效步长', '二阶修正项', 'Hessian 谱', '曲率各向异性', '步长调度', '动量累积', '损失面鞍点密度'],
    GEN: ['泛化间隙', '隐式正则强度', '有效容量', '边界间隔', '过参数化收益', '记忆化比例', '早停点', '数据增强强度'],
    SEC: ['注入成功率', '护栏覆盖面', '工具返回值信任度', '越狱链路长度', '检测漏报率', '扰动预算', '对抗鲁棒半径', '投毒样本占比'],
    SCL: ['参数-数据最优比', '计算效率前沿', '涌现阈值', '损失幂律指数', '批量临界点', '词表规模收益', '推理时扩展收益', '蒸馏保真度'],
    REP: ['特征线性可分性', '表征秩', '神经元多义性', '稀疏字典基数', '跨层相似度', '概念方向可迁移性', '探针准确率', '激活稀疏度'],
    SYS: ['通信量', '梯度压缩率', '同步间隔', '陈旧度容忍', '拓扑直径', '带宽利用率', '流水线气泡', '重计算开销'],
  };
  const REL = ['随', '与', '在', '相对', '对'];
  const OBJ = ['batch 大小', '模型宽度', '训练步数', '数据规模', '学习率', '秩 r', '深度', '温度', '序列长度', '并行度'];
  const SHAPE = ['呈幂律关系', '存在拐点', '单调下降', '先升后降', '趋于饱和', '近似线性', '出现相变', '方差显著增大', '与理论上界吻合', '不受影响'];
  const COND = ['', '（小 batch 区间）', '（低秩子空间内）', '（固定算力预算下）', '（去掉正则项后）', '（跨三个数据集）', '（长序列条件下）', '（同种子重复）'];

  const EN_SUBJ = {
    OPT: ['gradient noise scale', 'effective step', 'second-order correction', 'Hessian spectrum', 'curvature anisotropy', 'step schedule', 'momentum buildup', 'saddle density'],
    GEN: ['generalisation gap', 'implicit regularisation', 'effective capacity', 'margin', 'overparameterisation gain', 'memorisation ratio', 'early-stop point', 'augmentation strength'],
    SEC: ['injection success rate', 'guardrail coverage', 'tool-return trust', 'jailbreak chain length', 'detection miss rate', 'perturbation budget', 'robust radius', 'poisoned fraction'],
    SCL: ['params-to-data ratio', 'compute-efficient frontier', 'emergence threshold', 'power-law exponent', 'critical batch size', 'vocabulary gain', 'test-time scaling gain', 'distillation fidelity'],
    REP: ['feature linear separability', 'representation rank', 'neuron polysemanticity', 'dictionary size', 'cross-layer similarity', 'concept transferability', 'probe accuracy', 'activation sparsity'],
    SYS: ['communication volume', 'compression rate', 'sync interval', 'staleness tolerance', 'topology diameter', 'bandwidth utilisation', 'pipeline bubble', 'recompute overhead'],
  };
  const EN_SHAPE = ['follows a power law', 'has an elbow', 'decreases monotonically', 'rises then falls', 'saturates', 'is nearly linear', 'shows a phase transition', 'grows in variance', 'matches the theoretical bound', 'is unaffected'];
  const EN_OBJ = ['batch size', 'model width', 'training steps', 'data scale', 'learning rate', 'rank r', 'depth', 'temperature', 'sequence length', 'parallelism'];

  const IDEA_ZH = ['几何修正', '早停准则', '梯度压缩', '低秩共用', '批量与泛化', '学习率调度', '自适应正则', '分布式同步', '注入面定位', '护栏迁移',
    '规模外推', '涌现判据', '稀疏字典', '多义性消解', '探针校准', '蒸馏保真', '陈旧度补偿', '拓扑选择', '噪声几何', '容量度量',
    '边界锐度', '记忆化边界', '扰动预算', '链路裁剪', '词表经济学', '推理时扩展', '激活稀疏', '跨层对齐', '流水线重排', '重计算权衡',
    '临界批量', '二阶融合', '方差界', '通信-精度折中', '负结果早停', '复现基准', '温度标定', '长序列外推', '概念方向', '谱截断'];
  const IDEA_EN = ['Geometric correction', 'Early-stop criterion', 'Gradient compression', 'Shared low-rank', 'Batch & generalisation', 'LR scheduling', 'Adaptive regularisation', 'Distributed sync', 'Injection surface', 'Guardrail transfer',
    'Scaling extrapolation', 'Emergence criteria', 'Sparse dictionary', 'Polysemanticity', 'Probe calibration', 'Distillation fidelity', 'Staleness compensation', 'Topology choice', 'Noise geometry', 'Capacity measures',
    'Boundary sharpness', 'Memorisation limits', 'Perturbation budget', 'Chain pruning', 'Vocabulary economics', 'Test-time scaling', 'Activation sparsity', 'Cross-layer alignment', 'Pipeline reordering', 'Recompute trade-off',
    'Critical batch', 'Second-order fusion', 'Variance bounds', 'Comms-accuracy trade-off', 'Negative-result early stop', 'Reproduction benchmark', 'Temperature calibration', 'Long-context extrapolation', 'Concept directions', 'Spectral truncation'];

  // ---------------------------------------------------------------- 生成
  function build(opts) {
    const o = Object.assign({ ideas: 38, seed: 20260921, share: 0.3, depth: 4, branch: 3.1, evidence: 3.4 }, opts || {});
    const rnd = mulberry32(o.seed);
    const pick = (a) => a[(rnd() * a.length) | 0];
    const gauss = () => (rnd() + rnd() + rnd() - 1.5) * 1.1;

    const ideas = [], hyps = [], hypById = new Map(), edges = [], evidence = [], experiments = [];
    const byTheme = new Map(THEMES.map((t) => [t.id, []]));

    // ---- ideas
    for (let i = 0; i < o.ideas; i++) {
      const theme = THEMES[i % THEMES.length];
      const r = rnd();
      const status = r < 0.34 ? 'running' : r < 0.52 ? 'candidate' : r < 0.86 ? 'done' : 'parked';
      ideas.push({
        id: 'P-' + String(101 + i),
        idx: i,
        theme: theme.id,
        hue: theme.hue + gauss() * 9,
        name: { zh: IDEA_ZH[i % IDEA_ZH.length], en: IDEA_EN[i % IDEA_EN.length] },
        status,
        nodes: [],
      });
    }

    // ---- 每个 idea 长一棵树，节点或者新建假设，或者复用已有的（森林的缝合处）
    let hid = 1;
    const newHyp = (theme, idea) => {
      const s = SUBJ[theme], es = EN_SUBJ[theme];
      const k = (rnd() * s.length) | 0, sh = (rnd() * SHAPE.length) | 0, ob = (rnd() * OBJ.length) | 0;
      const h = {
        id: 'H-' + String(hid++).padStart(4, '0'),
        theme,
        claim: {
          zh: s[k] + pick(REL) + OBJ[ob] + SHAPE[sh] + pick(COND),
          en: es[k] + ' ' + EN_SHAPE[sh] + ' in ' + EN_OBJ[ob],
        },
        ideas: [], evidence: [], score: 0, status: 'untested', born: idea.idx,
        induced: rnd() < 0.05, lit: rnd() < 0.08,
      };
      hyps.push(h); hypById.set(h.id, h); byTheme.get(theme).push(h);
      return h;
    };

    for (const idea of ideas) {
      const pool = byTheme.get(idea.theme);
      const size = Math.round(9 + rnd() * 22);
      const nodes = [];
      // 根
      const root = newHyp(idea.theme, idea);
      nodes.push({ k: '1', hyp: root.id, parent: null, role: 'own_to_prove', depth: 0 });
      while (nodes.length < size) {
        const parent = nodes[(rnd() * nodes.length) | 0];
        if (parent.depth >= o.depth) continue;
        const sibs = nodes.filter((n) => n.parent === parent.k).length;
        if (sibs > o.branch + gauss()) continue;
        // 复用：优先复用同方向的已有假设，少量跨方向复用
        let h = null;
        if (pool.length > 6 && rnd() < o.share) {
          const cross = rnd() < 0.22;
          const src = cross ? hyps : pool;
          for (let t = 0; t < 8 && !h; t++) {
            const c = src[(rnd() * src.length) | 0];
            if (c && c.born !== idea.idx && !nodes.some((n) => n.hyp === c.id) && c.ideas.length < 6) h = c;
          }
        }
        if (!h) h = newHyp(idea.theme, idea);
        nodes.push({
          k: parent.k + '.' + (sibs + 1), hyp: h.id, parent: parent.k, depth: parent.depth + 1,
          role: h.born !== idea.idx || rnd() < 0.12 ? 'borrowed_assumption' : 'own_to_prove',
        });
      }
      idea.nodes = nodes;
      for (const n of nodes) {
        const h = hypById.get(n.hyp);
        if (!h.ideas.includes(idea.id)) h.ideas.push(idea.id);
        if (h.depth == null || h.ideas[0] === idea.id) h.depth = n.depth;
        h.leaf = !nodes.some((m) => m.parent === n.k);
      }
    }

    // ---- 证据：带符号，累积，状态由此派生
    let eid = 1;
    for (const h of hyps) {
      const live = h.ideas.some((id) => { const i = ideas.find((x) => x.id === id); return i && (i.status === 'running' || i.status === 'candidate'); });
      let n = Math.max(0, Math.round(gauss() * 1.6 + o.evidence * (live ? 1 : 0.6)));
      if (h.lit) n = Math.max(1, n);
      const bias = rnd();
      for (let i = 0; i < n; i++) {
        const positive = rnd() < (bias < 0.18 ? 0.25 : bias > 0.82 ? 0.92 : 0.66);
        const delta = Math.round((positive ? 0.2 + rnd() * 0.6 : -(0.2 + rnd() * 0.7)) * 10) / 10;
        const idea = h.ideas[(rnd() * h.ideas.length) | 0];
        const e = { id: 'e_' + eid++, hyp: h.id, idea, delta, at: rnd() };
        h.evidence.push(e); evidence.push(e);
      }
      h.score = Math.round(h.evidence.reduce((s, e) => s + e.delta, 0) * 10) / 10;
      const pivots = h.evidence.slice(-3).every((e) => e.delta < 0) && h.evidence.length >= 3;
      h.status = h.score >= 1.0 ? 'self_verified'
        : h.score <= -1.0 || pivots ? 'pending_review'
        : h.induced ? 'inductive_unverified'
        : h.lit ? 'lit_supported'
        : h.evidence.length ? 'active' : 'untested';
      if (!live && h.status !== 'self_verified' && rnd() < 0.5) h.status = 'closed';
    }
    // 少数正在跑
    const runnable = hyps.filter((h) => h.status === 'active' || h.status === 'untested');
    for (let i = 0; i < Math.min(runnable.length, Math.round(hyps.length * 0.035)); i++) {
      const h = runnable[(rnd() * runnable.length) | 0];
      h.status = 'testing';
      experiments.push({ id: 'x_' + (100 + i), hyp: h.id, idea: h.ideas[0], prog: rnd() });
    }

    // ---- 边：树边、跨 idea 依赖、归纳边
    const nodeKey = new Map(); // idea|k -> hyp
    for (const idea of ideas) for (const n of idea.nodes) nodeKey.set(idea.id + '|' + n.k, n.hyp);
    for (const idea of ideas) {
      for (const n of idea.nodes) {
        if (!n.parent) continue;
        const a = nodeKey.get(idea.id + '|' + n.parent), b = n.hyp;
        if (a && b && a !== b) edges.push({ a, b, kind: 'tree', idea: idea.id, role: n.role });
      }
    }
    const seen = new Set(edges.map((e) => e.a + '>' + e.b));
    for (const h of hyps) {
      if (h.induced) {
        for (let i = 0; i < 2; i++) {
          const src = hyps[(rnd() * hyps.length) | 0];
          if (src.id !== h.id && !seen.has(src.id + '>' + h.id)) { edges.push({ a: src.id, b: h.id, kind: 'induced' }); seen.add(src.id + '>' + h.id); }
        }
      }
      if (h.ideas.length > 1 && rnd() < 0.5) {
        const pool2 = byTheme.get(h.theme);
        const c = pool2[(rnd() * pool2.length) | 0];
        if (c && c.id !== h.id && !seen.has(h.id + '>' + c.id)) { edges.push({ a: h.id, b: c.id, kind: 'cross' }); seen.add(h.id + '>' + c.id); }
      }
    }

    // ---- 裁定队列
    const verdicts = hyps.filter((h) => h.status === 'pending_review');

    const shared = hyps.filter((h) => h.ideas.length > 1);
    return {
      themes: THEMES, ideas, hyps, hypById, edges, evidence, experiments, verdicts,
      stats: {
        ideas: ideas.length, running: ideas.filter((i) => i.status === 'running').length,
        hyps: hyps.length, shared: shared.length,
        maxShare: shared.reduce((m, h) => Math.max(m, h.ideas.length), 0),
        edges: edges.length, evidence: evidence.length,
        verified: hyps.filter((h) => h.status === 'self_verified').length,
        pending: verdicts.length, testing: hyps.filter((h) => h.status === 'testing').length,
      },
      seed: o.seed,
    };
  }

  global.Forest = { build, THEMES, mulberry32 };
})(window);
