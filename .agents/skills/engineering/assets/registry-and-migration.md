# Registry and Migration Guidance

This guide covers package source strategy for internal AppsIndie React Native libraries.

## Current default
- Private package source: **GitHub Packages** (`https://npm.pkg.github.com`), org `appsindie`.
- Package names and semver are unchanged: `@appsindie/react-native-cores`, `-cores-extensions`, `-auth`, `-notification`, `-ads`.
- Every consumer repo commits an `.npmrc` scoping **only** `@appsindie` to GitHub Packages; all other packages stay on the public npm registry.
- Read access requires authentication (GitHub Packages has no anonymous read for private packages), so consumers must provide `NODE_AUTH_TOKEN` before install.
- Publishing is CI-only, from the library repo, triggered by a `v*.*.*` tag.

Config templates:

| Use | Path |
| --- | --- |
| Consumer app / repo `.npmrc` | `.agents/skills/engineering/assets/github/npmrc-consumer.example` |
| Library repo `.npmrc` | `.agents/skills/engineering/assets/github/npmrc-library.example` |
| Library publish workflow | `.agents/skills/engineering/assets/github/publish-github-packages.yml` |

## Previous source (Azure DevOps Artifacts)
- Feed: `https://pkgs.dev.azure.com/AppsIndieCompanyLimited/e3b0221d-4330-444a-a973-a240a2a7726f/_packaging/appsindie/npm/registry/` (org `AppsIndieCompanyLimited`, project `Application Development`, feed `appsindie`).
- Azure DevOps Artifacts was the private package source before the GitHub cutover; Azure now retains only backend runtime/deploy responsibilities.
- Full package inventory and per-repo migration status: `docs/operations/MIGRATION_INVENTORY.md`.
- The feed is kept **read-only, not deleted**, for the rollback window agreed in the migration issue (default: 90 days after cutover). Do not repoint new work at it.
- GitHub Packages holds each library's current version (rebuilt from source) plus the older versions that consumer lockfiles pin (copied from Azure). Older unreferenced versions were **not** mirrored, so a rollback is a registry swap only for versions in that set.

### Rollback (registry switch failure)
1. Announce the rollback on the migration issue and re-freeze publishing.
2. In affected repos, restore the Azure Artifacts `.npmrc` (scope `@appsindie` to the Azure feed) and its CI token secret.
3. Delete `node_modules` and the lockfile's `@appsindie` entries, reinstall, and commit the regenerated lockfile.
4. Confirm resolved versions match the pre-cutover lockfile (identical versions exist in both registries).
5. Record the failure cause and re-plan on the migration issue; leave GitHub Packages versions published (they are inert if unreferenced).

## Auth baseline checklist
1. Package manager config for private scope access — committed `.npmrc` with `@appsindie:registry=https://npm.pkg.github.com` and `//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}`.
2. CI registry token — GitHub Actions passes `NODE_AUTH_TOKEN` with `permissions: packages: read` (consumers) / `packages: write` (publishers). `secrets.GITHUB_TOKEN` suffices for publishing and for reading the repo's own packages; reading another repo's package needs `APPSINDIE_PACKAGES_TOKEN` (`read:packages`), set per repository because GitHub Free does not allow org secrets in private repos.
3. Local developer setup — classic PAT with `read:packages` **only**, exported as `NODE_AUTH_TOKEN`; never committed, never a fine-grained token with write scopes.
4. Publish pipeline least privilege — publishing happens only in `.github/workflows/publish.yml` with `packages: write`, tag-triggered, with tag/version and scope verification before `npm publish`.
5. Cross-repo read access — a package's Internal visibility only covers users, not workflows: a workflow in another repo must either authenticate with `APPSINDIE_PACKAGES_TOKEN` or be added under package settings -> Manage Actions access.

## Migration rollout checklist
1. Freeze publish windows for impacted packages (Azure feed set read-only for publishers; announce on the migration issue).
2. Publish current versions from source (tag-triggered `publish.yml`), then mirror only the older versions consumer lockfiles pin, preserving names and semver.
3. Validate install and lockfile behavior in reference app(s).
4. Switch CI consumer installs to the new registry source.
5. Update developer setup documentation and rollback strategy.

Executable step-by-step commands for each of these live in `docs/operations/REGISTRY_MIGRATION_RUNBOOK.md`.

## Evidence required in migration PR
- Impacted package list and version plan.
- Auth configuration deltas (local and CI).
- Verification results from at least one consumer app.
- Rollback instructions for registry switch failure.

Use the evidence pack template in `docs/operations/REGISTRY_MIGRATION_RUNBOOK.md` ("Evidence pack") so every migration PR presents these four items in the same shape.

## Maintainer mode (library repo authoring and releasing)
Consumer integration is only half of this skill. When the unit of work is a **library repo** (`appsindie/react-native-*`), also apply:

- **Repo shape:** `.npmrc` from the library template, `publishConfig.registry = https://npm.pkg.github.com`, `repository.url` pointing at the GitHub repo (GitHub Packages ties a package to its repo), `files`/`exports` reviewed so the tarball ships build output only.
- **Peer dependency policy:** React, React Native, Expo, Firebase, navigation and redux belong in `peerDependencies`, never duplicated into `dependencies` — CI fails on duplication. Prefer explicit ranges over `*`; the existing libraries use `*` widely, so `publish.yml` reports wildcards as warnings rather than blocking, and they should be narrowed whenever a breaking peer version lands.
- **Breaking changes:** a breaking API change requires a major bump, a migration note in the library's integration asset under `assets/libraries/`, and a consumer impact list on the issue.
- **Release flow:** merge to default branch -> bump version -> tag `vX.Y.Z` -> `publish.yml` builds, tests, verifies peer deps and tag/version match, then publishes. Never `npm publish` from a developer machine.
- **Post-release:** verify the version resolves in a reference Expo app, then record the version and consumer impact on the release issue.
