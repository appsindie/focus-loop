# Migration Inventory (Azure DevOps -> GitHub)

Source of truth for what actually has to move. Collected 2026-07-25 from Azure DevOps org `AppsIndieCompanyLimited`, project `Application Development`, npm feed `appsindie`.

## Source repositories

All repos default to the **`develop`** branch (not `main`), and each carries an `azure-pipelines.yml` plus an `.npmrc` pointing `@appsindie` at the Azure feed.

All were mirrored to GitHub with `git push --mirror` on 2026-07-25; branch/tag parity verified and `develop` kept as the default branch.

| Azure DevOps repo | Package / artifact | Version at `develop` | Commits | Branches | Migrated to |
| --- | --- | --- | --- | --- | --- |
| `appsindie-react-native-cores` | `@appsindie/react-native-cores` | 5.0.0 | 45 | 1 | `appsindie/appsindie-react-native-cores` |
| `appsindie-react-native-auth` | `@appsindie/react-native-auth` | 6.0.1 | 61 | 3 | `appsindie/appsindie-react-native-auth` |
| `appsindie-react-native-notification` | `@appsindie/react-native-notification` | 7.0.0 | 62 | 2 | `appsindie/appsindie-react-native-notification` |
| `appsindie-react-native-ads` | `@appsindie/react-native-ads` | 3.0.0 | 9 | 1 | `appsindie/appsindie-react-native-ads` |
| `appsindie-react-native-document` | `@appsindie/react-native-document` | 3.0.2 | 15 | 1 | `appsindie/appsindie-react-native-document` |
| `appsindie-user-manager-functions` | `appsindie-user-functions` (Azure Functions app) | 2025.09.2 | 46 | 1 | `appsindie/appsindie-user-manager-functions` |
| `appsindie-document-functions` | `appsindie-document-functions` (Azure Functions app) | 2025.09.1 | 11 | 1 | `appsindie/appsindie-document-functions` |
| `appsindie-notification-functions` | `appsindie-notification-functions` (Azure Functions app) | 2025.09.3 | 29 | 3 | `appsindie/appsindie-notification-functions` |
| `appsindie-common` | `@appsindie/common` | 1.0.2 | 6 | 1 | `appsindie/common` |
| `appsindie-react-native-user-client` | `@appsindie/react-native-user-client` | 2.1.0 | 6 | 1 | `appsindie/react-native-user-client` |
| `appsindie-node-core` | `@appsindie/node-cores` (note: repo singular, package plural) | 2.4.1 | 29 | 1 | `appsindie/appsindie-node-core` |
| `appsindie-react-native-cores-extensions` | `@appsindie/react-native-cores-extensions` | 2.2.0 | 11 | 1 | `appsindie/appsindie-react-native-cores-extensions` |
| `qr-generator` | Expo app | 3.0.0 | 13 | 10 | `appsindie/qr-generator` |
| `qr-scanner` | Expo app | 2.0.0 | 30 | 17 | `appsindie/qr-scanner` |
| `football-livescore-app` | Expo app (`football-livescore`) | 3.0.0 | 6 | 6 | `appsindie/football-livescore-app` |
| `football-livescore-v2-functions` | Azure Functions app | 2024.08.p2 | 10 | 9 | `appsindie/football-livescore-v2-functions` |

`common` and `react-native-user-client` were created without the `appsindie-` prefix.

None of the four consumer apps declares an `@appsindie/*` dependency, so they migrate without any registry cutover work; they cannot serve as the reference app for rollout checklist step 3 (install/lockfile validation against GitHub Packages).

No repo carried tags, so no release tags needed re-pushing. Each migrated repo has a `chore/github-migration` PR installing the scaffold, CI, regenerated lockfiles, and (libraries only) `publish.yml`.

Backend note: the backend is **three Node/TypeScript Azure Functions apps**, not the Spring Boot service the template assumes. Their pipelines run madge (circular deps), Jest with coverage, `npm run build`, then zip + `PublishBuildArtifacts` for Azure deploy. On GitHub Actions the test/build stages move to `ci.yml`; the deploy stage keeps targeting Azure.

## Feed inventory (13 packages)

| Package | Latest on Azure Artifacts | Published versions |
| --- | --- | --- |
| `@appsindie/common` | 1.0.2 | 3 |
| `@appsindie/node-cores` | 2.4.1 | 21 |
| `@appsindie/react-native-ads` | 3.0.0 | 6 |
| `@appsindie/react-native-auth` | 6.0.1 | 25 |
| `@appsindie/react-native-bpm` | 3.0.0 | 13 |
| `@appsindie/react-native-cores` | 5.0.0 | 23 |
| `@appsindie/react-native-cores-extensions` | 2.2.0 | 9 |
| `@appsindie/react-native-crm` | 3.0.3 | 20 |
| `@appsindie/react-native-cs` | 4.0.4 | 12 |
| `@appsindie/react-native-document` | 3.0.2 | 13 |
| `@appsindie/react-native-notification` | 7.0.0 | 20 |
| `@appsindie/react-native-qc` | 4.0.0 | 8 |
| `@appsindie/react-native-user-client` | 2.1.0 | 5 |

## Version plan (executed)

Historical mirroring was rejected: each package is **built and published from source at its current version**, and only the older versions that migrated lockfiles actually pin are copied from Azure with `scripts/mirror-package-version.sh`. That is 9 source publishes plus 7 mirrored versions instead of 44.

| Package | Published from source | Mirrored from Azure (pinned by a lockfile) | Owning repo |
| --- | --- | --- | --- |
| `@appsindie/common` | 1.0.2 | 1.0.1 | `common` |
| `@appsindie/node-cores` | 2.4.1 | 2.3.1, 2.3.2 | `appsindie-node-core` |
| `@appsindie/react-native-cores` | 5.0.0 | 3.0.0, 4.0.0, 4.0.1 | `appsindie-react-native-cores` |
| `@appsindie/react-native-user-client` | 2.1.0 | 2.0.0 | `react-native-user-client` |
| `@appsindie/react-native-cores-extensions` | 2.2.0 | — | `appsindie-react-native-cores-extensions` |
| `@appsindie/react-native-auth` | 6.0.1 | — | `appsindie-react-native-auth` |
| `@appsindie/react-native-notification` | 7.0.0 | — | `appsindie-react-native-notification` |
| `@appsindie/react-native-ads` | 3.0.0 | — | `appsindie-react-native-ads` |
| `@appsindie/react-native-document` | 3.0.2 | — | `appsindie-react-native-document` |
| `@appsindie/react-native-bpm`, `-crm`, `-cs`, `-qc` | — | — | not migrated |

Everything else stays on the read-only Azure feed for the rollback window. Two constraints shaped the mirrored set:

- `react-native-auth@6.0.1` does not type-check against `react-native-user-client@2.1.0` (`EnrichedUser.lastRefreshTime`), so it stays pinned to 2.0.0; bumping it is a follow-up code change, not a migration step.
- `npm publish` of an older version steals the `latest` dist-tag, so `latest` was re-pointed to the source-published version of every mirrored package.

### Packages still to migrate

Every published package has a source repo in Azure DevOps (the project holds ~60 repos, most out of scope here). The remaining package repos are `appsindie-react-native-bpm`, `-crm`, `-cs`, `-qc`, plus `appsindie-react-native-document-client`.

Because GitHub Packages binds a package to a repository, these need either their migrated source repo or a shared holder repo (e.g. `appsindie/appsindie-packages-mirror`) to publish under. A holder repo restores install continuity but cannot publish new versions — that still needs the real source repo.

### Consumer apps

No Expo app has been migrated yet. Candidates visible in the Azure project include `stayhub-apps`, `stayhub-partnerapp`, `echecklist-app`, `ilaundry-app`, `digimenu-user-app` and `digimenu-merchant-app`; one of them must be nominated as the reference app for rollout checklist step 3.

## Gaps blocking completion

| Gap | Effect |
| --- | --- |
| ~~Cross-repo package reads~~ (resolved) | `secrets.GITHUB_TOKEN` only reads packages owned by its own repo. Fixed by setting `APPSINDIE_PACKAGES_TOKEN` as a **per-repository** Actions secret in all 12 package/consumer repos (`scripts/set-packages-secret.py`); org secrets are unavailable on GitHub Free for private repos, and package Internal visibility does not grant Actions access. |
| `-bpm`, `-crm`, `-cs`, `-qc`, `-document-client` not migrated | Their consumers cannot cut over until those packages exist on GitHub Packages under some repo. |
| No Expo consumer app repo supplied | Rollout checklist step 3 (validate install + lockfile in a reference app) and the consumer-auth task cannot be executed or evidenced. |
| Peer ranges are almost all `*` | Publish workflow reports them as warnings; consumers carry the compatibility risk until ranges are narrowed. |

## Documentation drift found

`library-catalog.md` listed five libraries (`cores`, `cores-extensions`, `auth`, `notification`, `ads`). The feed has thirteen; `document`, `bpm`, `crm`, `cs`, `qc`, `user-client`, `common` and `node-cores` were undocumented. The catalog has been updated from the feed.
