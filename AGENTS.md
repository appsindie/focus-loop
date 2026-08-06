# AGENTS

Machine policy for this repository only.

Global AppsIndie policy is **not duplicated here**. It lives in `appsindie/devin-skills`
(`.agents/knowledge/`, `.agents/playbooks/`, `.agents/skills/`) and is copied into a
product repository at bootstrap. When a copy and the canonical corpus disagree, the
canonical corpus wins — re-sync rather than editing the copy.

## Before acting on anything

1. Read `FACTORY_STATE.json` at the repository root: which phase this product is in,
   which gate is open, and whether any exception is blocking.
2. If `hold` is `true`, or the open PR carries `human-hold`, **stop and report**. A
   human has taken control.
3. Otherwise follow the playbook for the current phase.

See the knowledge note **AppsIndie Factory State Contract**.

## Global policy this repository runs under

| Note | Covers |
|---|---|
| **AppsIndie AI Software Factory** | Squads, the five gates, repo map |
| **AppsIndie Factory State Contract** | `FACTORY_STATE.json`, phases, the `hold` lever |
| **AppsIndie Product Lifecycle Playbook** | Phase 0–4 sequence and exit criteria |
| **AppsIndie Branching and Checkpoint Convention** | `release/<version>`, one PR per cycle |
| **AppsIndie AI Review Loop Convention** | Devin fires the reviewer routine; who may apply which label |
| **AppsIndie PR Labeling and Reviewer Convention** | The label taxonomy |
| **AppsIndie Delivery Conventions** | Docs-first workflow, three test levels, release ownership |
| **AppsIndie Team Rules** | Engineering, delivery, security, collaboration |
| **AppsIndie Default Technology Stack** | Stack defaults and override rules |
| **AppsIndie Security Trigger Policy** | When a security review is required |

## Core Policy (do not remove)

- **Unit of work:** a shippable slice — one journey, or one journey step.
- **Branch and PR shape:** slices are commits on `release/<version>`; feature branches
  merge into it locally. **One PR per cycle**, `release/<version>` → `main`, merged by a
  human at Gate 3. Do not open a PR per slice and do not invent a PR boundary — the
  branching convention decides it, not the agent and not the human.
- **Review:** Devin fires the phase's Claude reviewer routine with
  `scripts/fire_review.sh`. The routine posts the verdict and applies `ai-review-pass` /
  `ai-review-rework`. GitHub Copilot review is not used. An unfired PR is an unreviewed
  PR.
- **Human gates:** Gate 0 opportunity, Gate 1 shaping, Gate 2 SIT, Gate 3 production,
  Gate 4 continue/iterate/sunset. Only a human applies `gate-signed`. Everything between
  gates runs autonomously.
- **Escalation:** the `escalation` skill. An escalation states the choice, the
  recommendation, the default if the human says nothing, the deadline and the owner.
  On Gates 0 and 3 the default is always `block` — silence never ships.
- **Living documents:** product truth in `docs/product/`, architecture in
  `docs/architecture/`, QA in `docs/qa/`. Update the relevant one in the same PR as the
  change. **No traceability matrix** and no per-issue evidence pack.
- **Spec is intent, not implementation:** push back and update the spec in the same PR
  when a rule is wrong, missing, or beaten by a better solution. Silently following a
  rule known to be wrong is a defect.
- **Every PR:** lint, typecheck and tests green before firing review; living docs
  current; `FACTORY_STATE.json` current.
- **Template path convention:** references in a `SKILL.md` use repo-root canonical paths
  (e.g. `.agents/skills/<skill>/assets/...`).

## Extension Policy (template-specific, optional)

Add project-specific constraints below this line when this file is copied into a product
repository. Repo-specific skills (e.g. `testing-<product>-backend`) go in
`.agents/skills/` here — never back into the canonical corpus.
