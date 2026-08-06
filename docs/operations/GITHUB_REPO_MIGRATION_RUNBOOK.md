# GitHub Repo Migration Runbook

Moves a repository from Azure DevOps Repos to GitHub with history intact, then applies this template's structure, governance scaffold, and CI. One GitHub repo per unit: each `@appsindie/*` library, each Expo app, and each backend Azure Functions app.

Target end state per repo: code + issues + PRs + Actions CI on GitHub; Azure only as the backend deploy target.

The concrete source repos, packages, versions and open gaps are inventoried in `docs/operations/MIGRATION_INVENTORY.md`. `scripts/migrate-ado-repo.sh` automates steps 1-3 for one repo:

```bash
AZURE_DEVOPS_PAT=... ./scripts/migrate-ado-repo.sh appsindie-react-native-cores library
```

The steps below are the contract that script implements; run them by hand when a repo needs to deviate.

## Prerequisites (operator-provided)

- Azure DevOps org/project URL and a PAT with `Code: Read` for the source repos.
- Permission to create repos in the `appsindie` GitHub org.
- The org teams referenced by `CODEOWNERS` (`@appsindie/engineering`, `product`, `tech-leads`, `qa`, `frontend`, `mobile`, `backend`, `devops`) exist — or the file is edited to match real teams.

## Step 1 — Mirror the repository with history

```bash
# Project names with spaces must stay URL-encoded.
export ADO_ORG="https://dev.azure.com/AppsIndieCompanyLimited/Application%20Development/_git"
export SRC=appsindie-react-native-cores
export DEST=appsindie/appsindie-react-native-cores

git clone --mirror "https://anything:$AZURE_DEVOPS_PAT@${ADO_ORG#https://}/$SRC" "$SRC.git"
gh repo create "$DEST" --private --disable-wiki
cd "$SRC.git"
git remote set-url --push origin "https://github.com/$DEST.git"
git push --mirror
```

`--mirror` carries all branches, tags, and notes. Verify before decommissioning:

```bash
git -C "$SRC.git" rev-list --count --all      # compare against the GitHub repo
gh api "repos/$DEST/branches" --jq '.[].name'
gh api "repos/$DEST/tags" --jq '.[].name'
```

Then set the Azure DevOps repo to read-only (do not delete during the rollback window) and add a README banner pointing at the GitHub repo.

If a source repo uses Git LFS, run `git lfs fetch --all` before the mirror push and `git lfs push --all` after.

## Step 2 — Apply the template structure

Copy from `appsindie/ai-repo-template` into the migrated repo, in a branch, as one PR:

| Path | Rule |
| --- | --- |
| `AGENTS.md` | Copy. **Core Policy section is copied verbatim**; per-repo constraints go under "Extension Policy" only. |
| `.agents/**` | Copy the whole tree (the only governance source of record). |
| `.github/CODEOWNERS` | Copy, then edit owners to the real teams for that repo. |
| `docs/changes/` | Copy skeleton; CI asserts `docs/changes` exists. Product truth lives in `docs/product/`, `docs/architecture/` and `docs/qa/`. |
| `docs/operations/DEVIN_SOFTWARE_FACTORY.md` | Copy. |
| `apps/`, `backend/`, `infra/`, `packages/`, `qa/` placeholders | Copy **only** the ones that apply; do not reshape existing source layout to match the template. |

Do not move existing source files to fit the template layout in the migration PR — that destroys review signal. Layout alignment, if wanted, is a separate PR.

## Step 3 — CI and (for libraries) publish

```bash
cp .agents/skills/devops-terraform-azure-delivery/assets/github/ci-light.yml .github/workflows/ci.yml
# library repos only:
cp .agents/skills/internal-frontend-react-and-react-native-libraries/assets/github/publish-github-packages.yml \
   .github/workflows/publish.yml
cp .agents/skills/internal-frontend-react-and-react-native-libraries/assets/github/npmrc-library.example .npmrc
# consumer apps only:
cp .agents/skills/internal-frontend-react-and-react-native-libraries/assets/github/npmrc-consumer.example .npmrc
```

Adapt per repo:

- **Library repo:** add `publishConfig.registry = https://npm.pkg.github.com` and `repository.url` = the GitHub repo to `package.json` — none of the migrated libraries have either today, and `publish.yml` fails without `publishConfig`. Replace the Azure `.npmrc` (which points `@appsindie` at `pkgs.dev.azure.com`) with the library template. The old `azure-pipelines.yml` publish job is superseded by `publish.yml`; delete it once the first GitHub publish succeeds.
- **Expo app:** add the Expo/EAS jobs the app needs on top of the CI baseline; keep the governance steps.
- **Backend (Azure Functions, Node/TypeScript):** port the pipeline's madge, Jest-with-coverage and `npm run build` stages onto the CI baseline, and keep the zip + deploy stage targeting Azure — Azure remains the runtime target, only the CI host moves.

## Step 4 — Repo settings

- Default branch: the source repos default to `develop`, and the CI baseline triggers on `main`, `master` and `develop`. Keep `develop` (least disruption to existing branch names and pipelines) unless the team decides to rename during cutover.
- Branch protection: require the `governance-checks` status check and at least one review (`CODEOWNERS`-based).
- Actions: read-only default `GITHUB_TOKEN` permissions (workflows request `packages:` explicitly).
- Enable issues; import or re-create open Azure Boards work items as GitHub issues using the templates (closed items stay in Azure as an archive).

## Step 5 — Cutover record

On the migration issue, record: source Azure repo URL, GitHub repo URL, commit count/tag parity check, the PR applying the template, first green CI run, and the date the Azure repo was set read-only.
