# Devin Software Factory — how this repository is operated

Generic skills, knowledge notes and playbooks live in `appsindie/devin-skills` and are
copied here at bootstrap. This document is the local map, not a second copy of policy.

## Operating principle

- The unit of work is a **shippable journey slice**, committed to `release/<version>`.
  One PR per cycle to `main`, merged by a human at Gate 3 — see
  **AppsIndie Branching and Checkpoint Convention**.
- Product truth lives in living documents (`docs/product/`, `docs/architecture/`,
  `docs/qa/`) and is updated in the same PR as the code.
- **Position is a file, not a conversation.** `FACTORY_STATE.json` records the phase,
  each gate's status, the open PR, the last review verdict and any open exceptions.
  Read it first; if `hold` is true, stop.
- `AGENTS.md` is the entry point for repo-specific machine policy. Where a copied
  canonical file and `appsindie/devin-skills` disagree, the canonical corpus wins.

## Policy mapping

| Canonical note | Local expression |
|---|---|
| AppsIndie Factory State Contract | `FACTORY_STATE.json`, `.github/workflows/factory-state.yml` |
| AppsIndie Product Lifecycle Playbook | Phase playbooks in `.agents/playbooks/` |
| AppsIndie Branching and Checkpoint Convention | `release/<version>` + one PR to `main` |
| AppsIndie AI Review Loop Convention | `scripts/fire_review.sh`, review labels |
| AppsIndie PR Labeling and Reviewer Convention | `.github/labels.json`, `.github/workflows/labels.yml` |
| AppsIndie Team Rules | `AGENTS.md` core + extension policy |
| AppsIndie Default Technology Stack | ADRs under `docs/architecture/ADR/` |
| AppsIndie Security Trigger Policy | `docs/security/<feature>-security-review.md` |

## Skills

All canonical skills come from `appsindie/devin-skills`:

| Skill | Phase | Output |
|---|---|---|
| `opportunity-research` | 0 | Niche screen, scoring, Gate 0 decision |
| `product-shaping` | 1 | `PRODUCT_CONCEPT.md`, `PRODUCT_SPEC_LIVE.md` |
| `product-design` | 1 | `DESIGN.md`, `DESIGN_REVIEW.md` |
| `architecture` | 1–2 | Arc42 doc, ADRs, LLD |
| `engineering` | 2 | Backend, web, mobile implementation |
| `qa` | 2–3 | `QA_PLAN.md`, test evidence |
| `security` | 1–3 | Security review artifact |
| `release` | 3 | Infra, CI, rollout and rollback |
| `expo-mobile-release-and-compliance` | 3 | EAS pipeline, store compliance |
| `production-readiness` | 3 | `READINESS.md`, `EXCEPTION_REPORT.md` |
| `go-to-market` | 4 | Store listing, ASO, launch content |
| `growth` | 4 | Day-7 / day-14 north-star review, Gate 4 recommendation |
| `escalation` | any | Framed decisions for the human |

Repo-specific skills (e.g. `testing-<product>-web`) live in `.agents/skills/` here and
are never promoted back into the canonical corpus without being generalised first.

## Phase loop

1. Read `FACTORY_STATE.json`; stop if `hold` is set.
2. Load the phase's playbook and the skills it names.
3. Execute the slice, updating living documents as the work lands.
4. Commit to `release/<version>`; keep the single PR description current.
5. Fire the phase's reviewer routine when the slice is ready; record the session URL and
   the verdict in `FACTORY_STATE.json`.
6. At a gate, present the artifact and stop. A human applies `gate-signed`.
7. On a clean gate the orchestrator advances the phase — except product-repo creation
   and production rollout, which always wait for an explicit human go-ahead.

Anything that blocks and is not fixable in scope becomes an **exception**, not a stalled
session. See the `escalation` skill.
