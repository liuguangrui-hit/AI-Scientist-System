# The dynamic hypothesis–evidence forest

English · [中文](CONCEPTS.zh-CN.md)

The system rests on a single design decision from which the rest follows:
**a hypothesis is a global entity and does not belong to any single project.**

The conventional arrangement gives each project an independent tree, and the trees are not
connected. As a result, the same hypothesis is verified three times in three projects, and when
one experiment refutes it, the other two projects continue on the original assumption. In this
system the hypotheses of all projects reside in one forest: each tree represents one project's
line of argument, and the hypotheses referenced by its nodes are shared.

---

## 1. What the forest is made of

```
idea (project)        one tree — one line of argument
  └─ node             a position in that tree: k=1.2.1, parent, role
       └─ hyp         the hypothesis it points at — globally unique, pointed at by many trees
```

The relationship is: **a tree owns its nodes, a node references a hypothesis, and the
hypothesis belongs to no tree.**

The same hypothesis `H-02` can be:

| In which tree | Where it sits | How that tree uses it |
| --- | --- | --- |
| P-014 | mid-layer node, depth 2 | proven inside this project; supports its parent |
| P-016 | root premise | adopted as given and not decomposed; the starting point of the argument |
| P-017 | proven leaf | cited as a verified premise; no further experiment required |

The position is determined by **the argument of each tree**, not by the hypothesis itself. All
behaviour described below follows from this.

### Roles

Each node states how it intends to treat the hypothesis it points at:

- `own_to_prove` — this project will prove it, and will keep decomposing it into
  sub-hypotheses;
- `borrowed_assumption` — taken as given, not expanded further.

The same hypothesis can be `own_to_prove` in one tree and `borrowed_assumption` in another.

---

## 2. Evidence is a signed delta

When a run finishes it writes one piece of evidence onto the **hypothesis**, not onto a tree:

```json
{ "exp": "e_15", "idea": "P-014", "delta": 0.6, "note": "seven-tier fit, R²=0.98", "at": "..." }
```

- `delta` is signed. The sum is the hypothesis' **cumulative score**.
- `idea` records the project under which the run was performed. Evidence has a provenance but no owner.
- At **+1.0** the hypothesis reads as `self_verified`; at **−1.0**, or after three consecutive
  `PIVOT`s with no improvement, it is escalated to the verdict queue.

**One write updates every citing project.** This is the direct benefit of sharing: a baseline
common to three projects is re-measured once, and the downstream nodes in all three projects are
released together.

### State is derived, not stored

The state shown in the interface is **computed**:

```
a run is in progress        → testing
submitted for a verdict     → pending_review
cumulative ≥ +1.0           → self_verified
has evidence, below threshold → active
no runs and no evidence    → untested
```

A hypothesis therefore cannot be marked verified while its cumulative evidence is negative.

---

## 3. The frontier: hypotheses ready for testing

The frontier is the global set of hypotheses whose dependencies are ready. A hypothesis
enters it only when all of these hold:

1. every entry in its `depends_on` is `self_verified`;
2. nothing is running on it, and nothing is queued for it;
3. its node is not frozen by a verdict;
4. it is not already settled (self-verified and not flagged for a re-run drops out);
5. **it is a leaf in at least one tree** — a claim with children is settled by its children,
   not by an experiment of its own.

The frontier is ordered across all projects, with hypotheses serving several projects first.
Scheduling thus reduces to a concrete question: *given one free execution slot, which
hypothesis yields the greatest benefit?*

---

## 4. Verdicts: one failure, three different consequences

When the evidence is contradictory, or three changes of method bring no improvement, the
executor **stops expanding the hypothesis** and refers it to the researcher. This is the only
point at which the system waits for a human decision.

A verdict does not answer whether the hypothesis is true. It answers what each project loses
if the hypothesis does not hold:

| Its position in that tree | Consequence | Scope |
| --- | --- | --- |
| root premise | every node returns to `untested`; written sections must be rewritten | **global** |
| mid-layer node | its downstream subtree freezes; queued runs are withdrawn | **branch** |
| leaf with independent positive evidence in that project | unaffected | **local** |

Four possible rulings:

- `close` — it does not hold; freeze propagates per the table above;
- `return_active` — the evidence is not decisive; return it to the frontier with a new direction;
- `narrow_scope` — rewrite the claim to a narrower domain and reopen (positive evidence kept,
  out-of-scope negative evidence dropped);
- `downgrade` — demote it to a borrowed premise, marked unverified.

**A verdict writes only `verdicts/<hyp>.json`; node state is derived from it.** The reviewer
does not edit the tree. The boundary is deliberate: the writer of each file is fixed, so any
error can be traced to a specific person or agent.

---

## 5. Write boundaries for the three agents

| agent | writes only | does not modify |
| --- | --- | --- |
| surveyor | `index.jsonl`, `sources/`, the cursor `state.json` | hypothesis trees, verdicts |
| executor | `events.jsonl`, `artifacts/`, experiment records | state in `tree.json`, verdicts |
| reviewer | `verdicts/` | tree structure, experiment artifacts |
| researcher | verdicts, queueing experiments, approving new projects | — |

No party can both produce evidence and adjudicate it.

---

## 6. The experiment tree: how a hypothesis is tested

The hypothesis tree answers *what must be shown*; the experiment tree answers *how it was
tried*, in four stages:

```
probe  →  tune  →  main  →  ablation
```

- Nodes are typed **new / fix / improve**, and failed nodes are **retained** so that the same
  error is not repeated;
- only a node marked **representative** writes back to the hypothesis tree; the rest stay as
  a record and never become evidence;
- an entire tier × seed sweep matrix yields **exactly one piece of evidence** — the sentence
  "the trend holds, adjacent tiers are indistinguishable", not eighteen numbers.

---

## 7. Writing is another view of the evidence

Sections map from the hypothesis tree: when a node changes state, its section is flagged for
update.

- every claim must point back to its hypothesis and the run ids behind it;
- a scan flags words like *any*, *generally*, *always* and goes back to check the **scope**
  recorded in the evidence;
- while an overclaim remains, the button that packages the submission refuses and lists which
  sentences are at fault.

Evidence gaps found during writing (for example, a paragraph supported by a single run) are
returned directly to the experiment queue, which closes the loop.

---

## 8. The role of the researcher

Three decisions are reserved for the researcher:

1. **direction** — the source whitelist, the topics, whether a project starts;
2. **verdicts on hypotheses** — what to do when the evidence contradicts itself;
3. **when to submit** — when the manuscript is complete.

All other work (collection, grading, induction, scheduling, pruning, retrying, plotting and
claim auditing) is performed by the system, and every step is recorded in `events.jsonl`.

---

## Glossary

| Term | Meaning |
| --- | --- |
| idea / project | one hypothesis tree |
| hypothesis | a global entity, referenced by any number of trees |
| evidence | a signed delta written onto a hypothesis |
| verdict | a human ruling on a hypothesis, written to `verdicts/` |
| frontier | hypotheses whose dependencies are ready and that can be run now |
| borrowed assumption | a node role: adopted as given, not expanded |
| self_verified | cumulative evidence crossed the +1.0 threshold |
| representative node | the one experiment-tree result that writes evidence back |

File formats and the procedure for connecting a research project are described in [DATA.md](DATA.md).
