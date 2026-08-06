# Registry Migration Runbook: Azure Artifacts -> GitHub Packages

Executable form of the "Migration rollout checklist" in
`.agents/skills/internal-frontend-react-and-react-native-libraries/assets/registry-and-migration.md`, annotated with what the AppsIndie cutover actually did.

Scope: the `@appsindie/*` libraries. Package names and semver do **not** change; only the registry host does. Azure stays the backend runtime target and is not otherwise affected.

Strategy: **publish current versions from source, mirror only the older versions that existing lockfiles pin.** Rebuilding from source is the default because it needs no Azure credential in CI; a source rebuild only produces the current version, so any older version a lockfile still resolves is copied byte-for-byte from Azure with `scripts/mirror-package-version.sh`. Mirroring the entire feed history was explicitly rejected.

Prerequisites (operator-provided, one time):

- GitHub PAT with `read:packages` + `write:packages` for the operator running the cutover, stored as the Actions secret `APPSINDIE_PACKAGES_TOKEN` in every consumer repo (read is enough for CI; `repo` scope additionally lets `scripts/set-packages-secret.py` create those secrets in one pass).
- Azure DevOps PAT with `Packaging: Read` — only for the operator's machine while mirroring old pinned versions; never stored in GitHub.
- The library repos exist on GitHub (see `docs/operations/GITHUB_REPO_MIGRATION_RUNBOOK.md`).

## Step 1 — Freeze publish windows

1. Open a migration issue (label `release`) listing the impacted packages and the freeze window.
2. In Azure DevOps, remove publish permission on the feed for all identities except the break-glass owner (keep read for rollback).
3. Announce the freeze on the issue. No `@appsindie` version may be published to either registry outside the plan below.

## Step 2 — Publish current versions from source

Tag the library repo; `.github/workflows/publish.yml` builds, verifies and publishes with `secrets.GITHUB_TOKEN` (`packages: write`), so no long-lived credential exists in the repo.

```bash
git tag v5.0.0 && git push origin v5.0.0
```

Publish in dependency order, since each library installs the ones below it:

```text
common -> node-cores, react-native-user-client -> react-native-cores
       -> cores-extensions, auth, notification, ads, document
```

## Step 3 — Mirror the older versions that lockfiles still pin

Collect the pins first — a library's own lockfile, not its `package.json` range, decides what CI resolves:

```bash
git show HEAD:package-lock.json | python3 -c 'import sys,json; d=json.load(sys.stdin); print({k.split("node_modules/")[-1]: v.get("version") for k,v in d["packages"].items() if "@appsindie" in k})'
```

Any pinned version missing from GitHub Packages is copied from Azure:

```bash
AZURE_DEVOPS_PAT=... GITHUB_PACKAGES_PAT=... \
  ./scripts/mirror-package-version.sh appsindie/appsindie-react-native-cores \
  @appsindie/react-native-cores@4.0.0 @appsindie/react-native-cores@4.0.1
```

Notes:

- `npm publish` of an older version moves the `latest` dist-tag. Re-point it afterwards: `npm dist-tag add @appsindie/react-native-cores@5.0.0 latest`.
- Mirroring publishes the original tarball; only `repository` and `publishConfig` are rewritten, so GitHub Packages links the version to the right repo.
- Versions are immutable in both registries. A bad mirror requires a new patch version, not an overwrite.
- Prefer bumping a consumer to a source-published version over mirroring — mirror only where the bump would be a breaking major (e.g. `react-native-cores` 4.x consumers that do not compile against 5.0.0).
- Record every published and mirrored `name@version` — this is evidence item 1.

## Step 4 — Regenerate lockfiles against GitHub Packages

Old lockfiles hold Azure tarball URLs and Azure integrity hashes, so `npm ci` keeps hitting Azure until the lockfile is rebuilt. Regenerate with the pins from step 3 so resolved versions do not drift:

```bash
cp .agents/skills/internal-frontend-react-and-react-native-libraries/assets/github/npmrc-consumer.example .npmrc
export NODE_AUTH_TOKEN=<PAT with read:packages>

rm -f package-lock.json
npm install --package-lock-only @appsindie/react-native-cores@4.0.0   # repeat per pinned dep
grep -c "pkgs.dev.azure.com" package-lock.json   # must be 0
git diff -- package.json                          # must be empty: npm install can widen ranges
```

`example/` and `demo/` apps have their own lockfile and need their own `.npmrc`. A `yarn.lock` must be regenerated too — the Azure-referencing check reads every lockfile in the repo. Yarn reuses the `resolved` URL already in the lockfile (so it keeps hitting Azure and fails `401`); drop those entries first:

```bash
python3 scripts/strip-appsindie-lock.py example/yarn.lock
(cd example && yarn install --ignore-scripts --ignore-engines)
```

## Step 5 — Switch CI consumer installs

Per consumer repo:

1. Commit the `.npmrc` from step 4.
2. Ensure `.github/workflows/ci.yml` is the current `ci-light.yml` baseline (it fails if package config still references an Azure feed).
3. Add `permissions: packages: read` to any workflow that installs dependencies but does not inherit it.
4. `secrets.GITHUB_TOKEN` can only read packages owned by **its own** repository. Cross-repo `@appsindie` dependencies therefore install with `APPSINDIE_PACKAGES_TOKEN`; the baseline falls back to `GITHUB_TOKEN` when it is absent. Symptom when it is missing: `npm ci` fails `403 permission_denied: read_package` on a package that demonstrably exists.
   - An **organization** secret is the tidiest home, but GitHub Free rejects org secrets for private repos, so set it per repository — `scripts/set-packages-secret.py` does that for a list of repos via the API.
   - Package **Internal visibility does not help here**: visibility governs users, while a workflow in another repository must be added explicitly under "Manage Actions access" ([docs](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility#ensuring-workflow-access-to-your-package)). That route also requires first removing each package's inherited repository permissions.
5. Remove the Azure Artifacts token secret from the repo **after** the rollback window closes, not at cutover.

## Step 6 — Developer setup docs and rollback

- Update `docs/operations/DEVELOPER_SETUP.md` (registry section) in each repo.
- Confirm the rollback section of `registry-and-migration.md` is accurate for this cutover, including the agreed rollback window.

## Evidence pack

Paste into the migration PR body (satisfies "Evidence required in migration PR"):

```markdown
### 1. Impacted packages and version plan
| Package | Published from source | Mirrored from Azure | Consumers pinned to |
| --- | --- | --- | --- |
| @appsindie/common | 1.0.2 | 1.0.1 | 1.0.1, 1.0.2 |
| @appsindie/node-cores | 2.4.1 | 2.3.1, 2.3.2 | 2.3.1, 2.3.2, 2.4.1 |
| @appsindie/react-native-cores | 5.0.0 | 3.0.0, 4.0.0, 4.0.1 | 3.0.0, 4.0.0, 4.0.1 |
| @appsindie/react-native-user-client | 2.1.0 | 2.0.0 | 2.0.0 |
| @appsindie/react-native-cores-extensions | 2.2.0 | - | - |
| @appsindie/react-native-auth | 6.0.1 | - | - |
| @appsindie/react-native-notification | 7.0.0 | - | - |
| @appsindie/react-native-ads | 3.0.0 | - | - |
| @appsindie/react-native-document | 3.0.2 | - | - |

### 2. Auth configuration deltas
- Local: <old Azure .npmrc> -> <new GitHub Packages .npmrc>; token = classic PAT, `read:packages` only
- CI: <old Azure token secret> -> per-repo secret `APPSINDIE_PACKAGES_TOKEN` with `permissions: packages: read`
- Publish: tag-triggered `publish.yml`, `packages: write`, no long-lived credential

### 3. Consumer verification (reference app: <app>)
- Install: <npm ci result>
- Lockfile: resolved hosts now npm.pkg.github.com, 0 azure references, versions unchanged
- Smoke: <expo start / test results>

### 4. Rollback
- Window: <date> (Azure feed read-only until then)
- Procedure: registry-and-migration.md -> "Rollback (registry switch failure)"
- Verified by: <dry-run rollback evidence or explicit waiver>
```
