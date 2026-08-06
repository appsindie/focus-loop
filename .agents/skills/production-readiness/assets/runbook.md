# Operating Runbook — <product> <surface>

Instantiate as `docs/release/RUNBOOK_<surface>.md` — per surface, updated each release.

The document someone uses at 2am with no context. Written for the operator, not the author: literal commands, no "should be obvious" steps. Referenced by `.agents/skills/release/assets/infra-quickstart.md` step 8 (operating runbook links and escalation paths).

Keep it current per release — a stale runbook is a readiness `exception`, not a formality.

## Document control

- **Product / surface**:
- **Version (CalVer)**:
- **Rollback owner** (a named person, not a role):
- **Last rehearsed**:

## What this service does

Two or three sentences: the job it does, who depends on it, what "broken" looks like to a user.

## Operate

| Task | Command / step |
|---|---|
| Check health | |
| Read logs | |
| Current deployed version | |
| Scale up / down | |
| Rotate a secret | |

## Diagnose

Start here when an alert fires. One row per alert defined in `docs/release/SLO_AND_ALERTING.md`.

| Symptom / alert | First check | Likely cause | Action |
|---|---|---|---|
| Availability SLO breach | | | |
| Latency SLO breach | | | |
| Crash-free sessions drop | | | |
| Background jobs failing | | | |

If the symptom is not in this table and the rollout is in progress: **roll back first, diagnose after.**

## Roll back

The exact command, not a description of one:

```
<literal rollback command or pipeline step>
```

- **Trigger conditions**: the thresholds in `docs/release/SLO_AND_ALERTING.md` — no separate judgement call needed.
- **Expected duration**:
- **Data implications**: what happens to writes made since the deploy; whether the down-migration must also run.
- **Verify rollback succeeded**:
- **Mobile note**: a shipped binary cannot be recalled — halt the staged rollout and ship a hotfix. Say so explicitly rather than implying a rollback exists.

## Escalate

| Situation | Who / where | Notes |
|---|---|---|
| Vendor outage | | Status page link |
| Cloud provider incident | | |
| Store review rejection | | |
| Data loss suspected | | Stop writes first |

## Known issues and workarounds

| Issue | Workaround | Tracked at |
|---|---|---|
| | | |

## Sunset

What to do when this service is retired: data export, user notification, store delisting, infrastructure teardown order. Fill this in before the first production release, not at retirement.
