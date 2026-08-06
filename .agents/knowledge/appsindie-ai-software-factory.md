---
name: AppsIndie AI Software Factory
id: note-00bbb369faf5434482f3adb42e14d058
author: user
scope: When orienting to the AppsIndie end-to-end AI SDLC, which squad owns a phase, which gate applies, or which repository a run belongs in
---

# AppsIndie AI Software Factory

One founder, multiple products. AI runs the lifecycle; the human signs at quality gates
and decides how closely to watch the rest.

Two operating modes, and the difference matters:

- **Human on the loop** — the human is not needed *inside* any run, and can seize control
  at any moment by setting `hold` / applying `human-hold`. Today they still start each
  run, by choice: no schedule does it. That is a dial, not a fixed property — see
  **AppsIndie Review Routine Registry** → scheduled routines.
- **Human by exception** — an agent that cannot proceed does not stall. It raises an
  **exception**: a choice, a recommendation, a default if the human says nothing, a
  deadline and an owner. See the `escalation` skill.

## Squads

| Squad | Mission | Lead | Reviewer routine | Skills |
| --- | --- | --- | --- | --- |
| 0 Opportunity Research | Idea → Gate 0 portfolio decision | Devin | `research` | `opportunity-research` |
| 1 Product Architecture | Decision → Gate 1 shaping | Devin | `shaping` | `product-shaping`, `product-design`, `architecture`, `go-to-market` (seed) |
| 2 Engineering | Spec → Gate 2 build + SIT | Devin | `code-review` | `engineering`, `qa`, `security` |
| 3 Release | SIT → Gate 3 production | Devin | `release` | `release`, `production-readiness`, `expo-mobile-release-and-compliance` |
| 4 Growth | Production → Gate 4 continue/iterate/sunset | Devin | `growth` (**not yet created**) | `growth`, `go-to-market` |

`escalation` is not owned by a squad — every squad uses it.

## Human gates

| Gate | Artifact | Decision | Irreversible? |
| --- | --- | --- | --- |
| 0 Approve Opportunity | Research PR in `research/` | Spend ≤8 build-weeks? | **Yes** — spends a portfolio slot |
| 1 Approve Product | Shaping commits on the release PR | Scope + UI signed? | No |
| 2 Approve SIT | Build commits after SIT evidence | Human tested SIT? | No |
| 3 Approve Production | Release PR + exception report | Ship / promote? | **Yes** — production and stores |
| 4 Continue / Iterate / Sunset | Growth review | Keep the slot? | No (sunset is reversible in principle) |

Only a human applies `gate-signed`. A reviewer routine's `ai-review-pass` is necessary
but never sufficient.

On the two irreversible gates, silence never carries the decision: an exception there
must default to `block`, and `scripts/factory_state.py` rejects anything else.

## Autonomy

Phases **auto-advance on a clean gate** — signed, no blocking exception, no `hold` — via
`!run_factory`, which reads `FACTORY_STATE.json`.

Auto-advance is **not** the same as unattended, and today the factory is not unattended.
It means a *running* session does not need a human to say which phase comes next; something
still has to start the session, and by current decision that something is the operator.
The factory is autonomous within a session and idle between them — see
**AppsIndie Review Routine Registry** → scheduled routines for what would change that and
when to revisit.

Two transitions never auto-advance:

1. **Creating a product repository** after Gate 0 `VALIDATE NOW`.
2. **Production rollout and store promotion** at Gate 3.

## Repositories

| Repo | Role |
| --- | --- |
| `appsindie/devin-skills` | The factory: canonical skills, knowledge, playbooks, state schema, tooling — **and** the Squad 0 research workspace under `research/` |
| `appsindie/ai-repo-template` | Product bootstrap shape: directories, CI, docs skeleton. Carries **no** copy of the corpus |
| `appsindie/<product>` | Created only after Gate 0 `VALIDATE NOW`; carries `docs/research/OPPORTUNITY_DECISION.json` and `FACTORY_STATE.json` |

`appsindie/portfolio-research` was merged into this repository so the Gate 0 → Gate 1
handoff is a file read rather than a cross-repo copy.

Sync into product repos is **copy-on-bootstrap** from `.agents/`, not a submodule. A
copied skill is never edited to fix a general problem — fix it here and re-sync.

## Tool stack

| Domain | Tool |
| --- | --- |
| Research / implementation lead | Devin |
| Review | Claude Code **routines**, fired by Devin (`scripts/fire_review.sh`) |
| Orchestration | `!run_factory` over `FACTORY_STATE.json` |
| Git / CI | GitHub + GitHub Actions (enforcement only — CI holds no reviewer token) |
| Cloud | Azure Container Apps |
| Database | PostgreSQL |
| Mobile | Expo / React Native |
| Analytics | Firebase, PostHog, RevenueCat |

## Related notes

- **AppsIndie Factory State Contract** — the file the factory runs on
- **AppsIndie AI Review Loop Convention** — how review works and who may label what
- **AppsIndie Review Routine Registry** — routine URLs, secrets, prompt requirements
- **AppsIndie Branching and Checkpoint Convention** — branches, PRs, and merge cost
- **AppsIndie Portfolio Opportunity Policy** — contribution definitions and slot thresholds
- **AppsIndie Product Lifecycle Playbook** — the Phase 0–4 sequence and exit criteria
