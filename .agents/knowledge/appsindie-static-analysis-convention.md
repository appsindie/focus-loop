---
name: AppsIndie Static Analysis Convention
id: note-58dddfbc8cf64385a54189d9c28bb1a4
author: user
scope: When bootstrapping a repository, writing or changing code, committing a slice, or preparing a pull request for review in any AppsIndie project
---

# AppsIndie Static Analysis Convention (Global)

**If a machine can find it, a machine finds it — before a reviewer reads the code.**

A type error, an unused import, a missing hook dependency, an unformatted file, a
possible null dereference and a module-boundary violation are all found deterministically,
in seconds, at no cost. When they instead reach the reviewer routine they consume a
finding slot (the routine posts at most ten), trigger a rework round (the cap is two),
and cost a re-fire (the cap is six). The expensive control ends up doing the cheap
control's job, and the defects it exists to find get crowded out.

This note fixes that: the deterministic layer runs **inside** the development loop, not
at its boundary.

## The one command

Every repository that contains code exposes **one** entry point that runs every
deterministic check:

| Stack | Full | Fast |
| --- | --- | --- |
| Node / TypeScript | `npm run verify` | `npm run verify:fast` |
| Java / Gradle | `./gradlew check` | `./gradlew spotlessCheck compileJava` |
| Terraform | `make verify` in the infra directory | — |

Requirements for that entry point:

- Takes **no arguments** and needs no local setup beyond the repo's install step.
- Exits non-zero on any finding. Warnings are errors.
- Runs offline, against the working tree — no network, no deployed environment.
- `verify:fast` (typecheck + lint) completes in seconds; the full `verify` in about two
  minutes. If it is slower than that, agents stop running it, and the convention dies.

An agent must never have to work out which commands a given repo uses. If you cannot run
the whole deterministic layer with one command, that is the first defect to fix.

There is exactly one other entry point — `audit`, for dependency vulnerabilities, which
run on a different clock and are excluded from `verify` for that reason. See *Security
scanning* below. Two commands total; anything else hides behind them.

## What belongs in it

Defaults per the **AppsIndie Default Technology Stack**. A project may substitute a tool
by ADR; it may not drop a *column*.

### TypeScript — Expo, React Native, web, shared libraries

| Concern | Tool |
| --- | --- |
| Types | `tsc --noEmit` with `strict: true` and `noUncheckedIndexedAccess` |
| Lint | ESLint (flat config) + `typescript-eslint` **type-aware** rules, `--max-warnings 0` |
| React correctness | `eslint-plugin-react-hooks` with `exhaustive-deps` at **error** |
| Imports and cycles | `eslint-plugin-import` — unresolved imports, import cycles |
| Formatting | Prettier `--check` (formatting is never a review comment) |
| Dead code, unused deps | `knip` |
| Expo project health | `npx expo-doctor` (SDK and peer-dependency drift) |
| Security patterns | `eslint-plugin-security`, `eslint-plugin-no-unsanitized` |
| Duplication | `eslint-plugin-sonarjs` — `no-identical-functions`, `no-duplicated-branches` |

### Java — Spring Boot backend

| Concern | Tool |
| --- | --- |
| Formatting | Spotless (`google-java-format`) — `spotlessCheck` |
| Compiler | `-Xlint:all -Werror` |
| Null safety and bug patterns | Error Prone + NullAway |
| Bug patterns | SpotBugs |
| Security patterns | **FindSecBugs** plugin for SpotBugs |
| Module boundaries | Spring Modulith `ApplicationModules.verify()` as a test; ArchUnit for layer rules |

Module-boundary verification is the highest-value check on this stack: it catches the
architecture drift that a reviewer can otherwise only find by reading every import.

### Infrastructure and repository-wide

| Concern | Tool |
| --- | --- |
| Terraform | `terraform fmt -check -recursive`, `terraform validate`, `tflint`, `checkov` |
| GitHub Actions | `actionlint` |
| Secrets | `gitleaks detect` |
| Cross-stack SAST | `semgrep --config p/owasp-top-ten` (pinned ruleset — see below) |

## Security scanning: two kinds, two entry points

Security static analysis is free — `npm audit` ships with npm, and the rest below are open
source. Cost is not the reason any of it sits outside `verify`. **Determinism is.**

| | Same code, next week | Where it goes |
| --- | --- | --- |
| Type error, injection sink, hardcoded key, insecure IaC default | Same result forever | **`verify`** |
| A dependency's known CVEs | **Different result** — the advisory database moved, your code did not | **`audit`** |

That distinction is the whole design. A check whose result changes without the code
changing cannot live in the edit loop: it turns a green commit red overnight, sends an
agent hunting for a break it did not cause, and breaks the two-attempt cap — you cannot
"fix" a transitive CVE with no patched version upstream. It also needs network, which
`verify` does not.

So the **deterministic** security checks are already in the tables above and are ordinary
`verify` failures: `eslint-plugin-security` and `no-unsanitized`, FindSecBugs, `checkov`
on Terraform, `gitleaks` on secrets. Add **Semgrep OSS** with a *pinned* ruleset
(`p/owasp-top-ten`, `p/security-audit`) for cross-stack SAST — injection, path traversal,
weak crypto, unsafe deserialization. Pin the ruleset version; an auto-updating ruleset
turns a deterministic check into a time-varying one and forfeits its place in `verify`.

### The `audit` entry point

A **second** command, `npm run audit` / `./gradlew audit`, for the time-varying checks:

| Tool | Covers | Free |
| --- | --- | --- |
| `npm audit --audit-level=high` | npm advisories | built in |
| **`osv-scanner`** | npm, Maven/Gradle, Go, PyPI and more from one binary — the best single choice for a mixed repo | OSS (Google) |
| OWASP Dependency-Check | Maven/Gradle CVEs (needs a free NVD API key to be tolerable) | OSS |
| Trivy | dependencies, IaC and container images | OSS |
| Dependabot alerts | passive backstop, no setup | free on private repos |

Cadence — **not** the `verify` cadence:

| When | Why |
| --- | --- |
| At slice completion | Catches what the slice's new dependencies dragged in |
| Before every gate | A gate signature should not sit on top of a known critical CVE |
| Weekly in CI, on a schedule | The database moves even when the repo does not — this is the only check that finds a vulnerability in code nobody touched |

**Never** per file, per commit, or inside the generation loop.

### When `audit` is red and you cannot fix it

Different from a red `verify`, and it needs its own answer: the fix is often not yours to
make. Upgrade or patch if a fixed version exists — that is the whole job most of the time.
When none exists, this is a **risk-acceptance decision**, not a code problem, so it goes
straight to an exception under the **AppsIndie Security Trigger Policy** rather than
through the two-attempt loop:

- **A — Pin or override** to a patched transitive version. Consequence: resolution risk.
- **B — Replace the dependency.** Consequence: real work, permanent fix.
- **C — Accept, with a documented reason and a recheck date.** Only where the vulnerable
  path is genuinely unreachable from your code — state *why* it is unreachable, not that
  it seems unlikely.

`critical` blocks and never defaults to `proceed`; a `high` deferred needs human approval
before release sign-off, per **AppsIndie Team Rules**. An accepted CVE carries a recheck
date — acceptance is time-boxed, never permanent.

**A red `audit` is never a reason to hold a slice's `verify` green.** They are separate
signals answering separate questions, and collapsing them loses both.

## Choosing a tool: free, local, no account

Every tool named above is free and open source, and that is a **rule**, not a
coincidence:

- **Free and open source.** No seat licence, no paid tier, no trial that expires mid-cycle.
- **Runs locally** from a repo checkout with the project's own install step. An agent must
  be able to run the full check offline, in-session, without provisioning anything.
- **No account, no upload.** A tool that sends source code to a third-party service is
  not a default — that is a data decision, not a tooling one.

This rules out the hosted analysis platforms (SonarQube Cloud, Snyk, Codacy, DeepSource
and similar) as defaults. It does **not** rule out `eslint-plugin-sonarjs`, which is a
local OSS ESLint plugin and shares nothing with the hosted product but a name. A self-hosted or free-tier equivalent may be adopted by **ADR**
that states who runs it and what leaves the repository; it never replaces the local
`verify` entry point, which must stay runnable with the service switched off.

## Stacks not listed above

A stack absent from the tables above is **not exempt**. Every ecosystem has a free
formatter and a free linter; pick the standard one, wire it into `verify`, and name the
choice in the slice report.

| Stack | Format | Lint / analyse | Types |
| --- | --- | --- | --- |
| Python | `ruff format` | `ruff check` | `mypy` |
| Go | `gofmt -l` | `go vet`, `staticcheck` | compiler |
| Kotlin | `ktlint` | `detekt` | compiler `-Werror` |
| Rust | `cargo fmt --check` | `cargo clippy -D warnings` | compiler |
| C# / .NET | `dotnet format --verify-no-changes` | built-in Roslyn analyzers, warnings-as-errors | compiler |
| Swift | `swift-format` | `swiftlint` | compiler |
| Shell | — | `shellcheck` | — |
| Dockerfile | — | `hadolint` | — |
| SQL | `sqlfluff format` | `sqlfluff lint` | — |
| YAML / JSON / Markdown | Prettier | `yamllint` | — |

**The minimum bar, on any stack: a formatter check, a linter, and a type or compile check
with warnings as errors.** Three commands behind one entry point. Start there rather than
installing eight tools on day one — the richer per-stack tables above are the target a
repo grows into, and a repo with the three-column minimum is in far better shape than one
still arguing about which analyzer to adopt.

A stack with genuinely no free tool for a column leaves that column out and says so in
the slice report. It does not skip the columns it *can* fill.

## Cadence in the development loop

| When | Run |
| --- | --- |
| Before writing the first line of a slice, on a clean tree | `verify` |
| After each meaningful unit of generation — a file, a component, a class | `verify:fast` on what you touched |
| Before every commit | `verify:fast`, and `verify` if the slice is complete |
| Before firing a reviewer routine | `verify` — full, green, on the pushed head |
| After applying review corrections, before re-firing | `verify` |

Two of these are the ones that actually save the tokens:

- **The clean-tree run.** A baseline that is already red means every later result is
  noise, and you will spend the slice deciding whether each finding is yours. If the
  baseline is red, fix it or record the exception *before* writing feature code. Never
  inherit a red baseline silently.
- **The per-unit run.** Running only at slice completion means a systematic mistake has
  been made in thirty files before anything reports it. Catching it in the first file
  costs one fix; catching it at the end costs thirty, plus the diff churn.

Firing a reviewer routine on a tree that fails `verify` wastes a fire against the
six-fire cap and buys findings you already had for free. It is not permitted — see
**AppsIndie AI Review Loop Convention**.

## The first failure is the pattern

When the analyzer reports the same rule ten times, that is **one** mistake made ten
times. Fix the pattern, not the ten sites, and then ask whether the rule that caught it
should be tightened so it cannot recur. A repeated finding that a lint rule could have
prevented is a missing lint rule.

Name the pattern in the slice report. A mistake made repeatedly across slices is a
candidate for this corpus, not for another round of manual correction.

## Ratchet

The check exists to be satisfied by fixing code, never by weakening the check. When you
genuinely cannot fix it, the exit is *When `verify` cannot be made green* below — through
a human, not around the rule.

- **Never** widen a rule, lower a severity, extend an ignore file, delete a check, or
  pass `--no-verify` to make a run go green. That falsifies the one signal downstream
  controls trust, and it is a defect regardless of what it unblocks.
- A suppression is **inline**, at the narrowest possible scope, and carries a reason:
  `// eslint-disable-next-line <rule> -- <why>` / `@SuppressWarnings("<check>") // <why>`.
  A suppression with no reason is treated as an unfixed finding.
- A file-level, directory-level or rule-wide disable needs an **ADR**, not a comment.
- Introducing analysis to an existing repository: generate a baseline that freezes the
  current violations, and let the count only ever fall. The baseline covers existing
  code; new code has none.

## When `verify` cannot be made green

The ratchet above forbids the cheap exit. Without a stated alternative that would trap an
agent between looping forever and quietly weakening the rule anyway, so the alternative is
stated here: **after two attempts on the same failing check, stop and raise an exception.**

Count carefully — the cap is not on fixing your own mistakes:

| Situation | This is |
| --- | --- |
| The check is right and your new code is wrong | **Work.** Fix it. Ten different findings fixed in ten edits is a normal slice, not ten attempts |
| The same check fails again after a fix aimed at it, twice | **The cap.** A third attempt is an escalation |
| A dependency, generated file or upstream type emits the violation | Escalate on the first attempt if you cannot reach the source |
| The rule contradicts the stack itself (an Expo or framework idiom the linter cannot see) | Escalate — this is a rule decision, not a code decision |
| The tree was already red before you touched it | See the baseline rule below |

Raise it through the `escalation` skill — the standard five parts, routed all three ways
(PR comment, `open_exceptions`, Slack). Frame it as a real choice, because it is one:

- **A — Narrow, time-boxed suppression.** Inline, single rule, single site, with the reason
  and a linked follow-up. Consequence: the slice proceeds; one known gap is on record.
- **B — Change the rule.** Adjust the config for the whole repo, by ADR. Consequence: the
  gap applies everywhere, including code not yet written.
- **C — Keep it red and block the slice.** Consequence: nothing ships until the underlying
  cause is fixed.

`default_if_silent: proceed` is available only where the check is non-security and the
decision is reversible. A check guarding a trust boundary defaults to `block` — see
**AppsIndie Security Trigger Policy** and the irreversibility rules in the `escalation`
skill.

**A red baseline is one exception, not a slice.** If `verify` was already failing before
you touched the repository, do not spend the slice on inherited debt: baseline the
existing violations so the count can only fall, raise one exception naming the size of the
debt and who owns it, and proceed with new code held to the full standard.

What is never acceptable is the silent version — a suppression added without a reason, an
ignore file quietly extended, or a run reported as green when it was not. Reporting a red
tree honestly costs nothing. Reporting it green costs the reviewer, the gate and the human
who trusted the signal.

## Bootstrap requirement

Configuring this is part of **scaffolding**, before the first feature slice. A repository
holding code with no `verify` entry point is a defect: the first build slice to touch it
sets one up, and says so in the slice report.

**Do not hand-roll it.** Working configs for both stacks — scripts, ESLint flat config,
`tsconfig`, the Gradle analysis block, the `audit` task and the Modulith boundary test —
are in `.agents/skills/engineering/assets/verify/`. Copy and adjust; record what you
changed. Six repositories converging on one setup is most of the value, and it is lost
the moment each one is assembled from scratch.

Wire the same entry point into CI (`.agents/skills/release/assets/github/ci-light.yml`)
so a local skip is caught. CI is the backstop, not the mechanism — a finding that first
appears in CI has already cost a push and a wait.

**Order matters, and getting it backwards breaks the build.** That CI template *requires*
a `verify` script and an `audit` entry point; it fails the repo when they are absent,
which is the point. So in an existing repository:

1. Wire the tools and the `verify` / `verify:fast` / `audit` entry points locally, and get
   them green — baselining pre-existing violations per the red-baseline rule above.
2. Update the workflow **in the same commit**, never before.

Copying the workflow into a repo that has no entry points yet turns a migration into a red
build for everyone. Adopt repo by repo, not portfolio-wide in one pass, and if the tools
cannot be made green in that first commit, the workflow waits — it is not the lever you
use to force the work.

## What this does not replace

Static analysis says nothing about whether the code does the right thing. It does not
replace tests, the QA plan, the security pass, or the reviewer routine — it clears the
mechanical layer so those spend their attention on behaviour, risk and intent.

**A green `verify` is a precondition for review. It is never evidence of correctness,
and never a reason to skip a test.**

## Related

- **AppsIndie Team Rules** — "lint, typecheck and tests green before requesting review"
- **AppsIndie AI Review Loop Convention** — green `verify` is a precondition to fire
- **AppsIndie Default Technology Stack** — the stacks these tools are chosen for
- **AppsIndie Security Trigger Policy** — where dependency and secret findings go
- `.agents/skills/escalation/` — the exit when a check will not go green
- `.agents/skills/engineering/` — the loop that runs it
