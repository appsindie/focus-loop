# `verify` — reference configuration

Working baselines for the entry points **AppsIndie Static Analysis Convention** requires.
Copy, adjust, and say in the slice report what you changed. They exist so six repositories
end up with the same setup rather than six hand-rolled ones.

| File | For |
| --- | --- |
| `node/package.scripts.json` | The `verify` / `verify:fast` / `audit` scripts |
| `node/eslint.config.mjs` | ESLint flat config — type-aware, React, security |
| `node/tsconfig.base.json` | Compiler strictness |
| `gradle/static-analysis.gradle.kts` | Spotless, Error Prone, NullAway, SpotBugs, FindSecBugs, the `audit` task |
| `gradle/ModularityTests.java` | Spring Modulith boundary verification |

## Two entry points, and why `audit` is named at all

`verify` is deterministic — same code, same result, forever. `audit` is not: its result
changes when the advisory database moves. That is why they are separate commands with
separate cadences, and the convention explains the consequences.

**Gradle has no standard `audit` task.** The snippet registers one, and the name is not
cosmetic: `ci-light.yml` looks for exactly `audit` and fails the build when it is missing.
Do not rename it to `dependencyCheck` or `securityScan`.

## Prerequisites

Three checks are binaries rather than packages. Install them at bootstrap — in the
devcontainer or setup script, so a fresh clone can run `verify` immediately:

```sh
# macOS
brew install semgrep gitleaks osv-scanner
# Linux (CI)
pipx install semgrep && \
  curl -sSfL <gitleaks release> | tar -xz && \
  curl -sSfL <osv-scanner release> -o /usr/local/bin/osv-scanner
```

If one is missing, the check **fails loudly** — it does not skip. That is deliberate: a
silently skipped security check is worse than no check, because it reports green.

The lint-based security rules (`eslint-plugin-security`, `no-unsanitized`, FindSecBugs)
need no binary, so a repo always has some SAST even before the binaries land.

## Adoption order

Getting this backwards turns an adoption into a red build for everyone:

1. Wire the tools and entry points, and get them **green locally** — baseline pre-existing
   violations so the count can only fall.
2. Update the workflow **in the same commit**, never before.

`ci-light.yml` requires both entry points and fails the repo without them. That is the
point of it, and it is not the lever you use to force the work: if the tools cannot go
green, the workflow waits.

## Versions

Plugin versions below are a **starting point, not a pin to preserve**. Check for current
releases when you bootstrap — an eighteen-month-old Error Prone against a current JDK
fails in confusing ways. Record what you settled on.
