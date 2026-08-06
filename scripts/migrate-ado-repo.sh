#!/usr/bin/env bash
# Mirror one Azure DevOps repo to GitHub with history, then install the
# ai-repo-template governance scaffold and CI on a branch.
#
#   AZURE_DEVOPS_PAT=... ./scripts/migrate-ado-repo.sh <ado-repo-name> [library|app|backend]
#
# Requires: git, gh (authenticated with repo-creation rights in the target org),
# and a checkout of appsindie/ai-repo-template (TEMPLATE_DIR).
set -euo pipefail

ADO_ORG="${ADO_ORG:-AppsIndieCompanyLimited}"
ADO_PROJECT="${ADO_PROJECT:-Application%20Development}"
GH_ORG="${GH_ORG:-appsindie}"
TEMPLATE_DIR="${TEMPLATE_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
WORK_DIR="${WORK_DIR:-$PWD/migration-work}"

repo="${1:?usage: migrate-ado-repo.sh <ado-repo-name> [library|app|backend]}"
kind="${2:-library}"
: "${AZURE_DEVOPS_PAT:?AZURE_DEVOPS_PAT must be set (Code: Read)}"

mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

echo "==> mirroring $repo"
[ -d "$repo.git" ] || git clone --mirror \
  "https://anything:${AZURE_DEVOPS_PAT}@dev.azure.com/${ADO_ORG}/${ADO_PROJECT}/_git/${repo}" "$repo.git"
src_commits=$(git -C "$repo.git" rev-list --count --all)

echo "==> creating github.com/${GH_ORG}/${repo}"
gh repo view "${GH_ORG}/${repo}" >/dev/null 2>&1 || gh repo create "${GH_ORG}/${repo}" --private --disable-wiki

git -C "$repo.git" remote set-url --push origin "https://github.com/${GH_ORG}/${repo}.git"
git -C "$repo.git" push --mirror

echo "==> verifying parity"
dest_commits=$(gh api "repos/${GH_ORG}/${repo}" >/dev/null && git ls-remote "https://github.com/${GH_ORG}/${repo}.git" | wc -l)
echo "source commits: $src_commits ; remote refs: $dest_commits"

echo "==> installing scaffold"
[ -d "$repo" ] || git clone "https://github.com/${GH_ORG}/${repo}.git" "$repo"
cd "$repo"
base=$(git symbolic-ref --short HEAD)
git checkout -b "chore/github-migration"

mkdir -p .github/workflows docs/changes docs/traceability docs/operations
cp -r "$TEMPLATE_DIR/governance" .
cp -r "$TEMPLATE_DIR/.agents" .
cp "$TEMPLATE_DIR/AGENTS.md" .
cp "$TEMPLATE_DIR/.github/CODEOWNERS" .github/
cp "$TEMPLATE_DIR/.github/workflows/ci.yml" .github/workflows/ci.yml
cp "$TEMPLATE_DIR/docs/traceability/matrix.md" docs/traceability/matrix.md
cp "$TEMPLATE_DIR/docs/changes/README.md" docs/changes/README.md
cp "$TEMPLATE_DIR/docs/operations/DEVIN_SOFTWARE_FACTORY.md" \
   "$TEMPLATE_DIR/docs/operations/DEVELOPER_SETUP.md" docs/operations/

lib_assets="$TEMPLATE_DIR/.agents/skills/internal-frontend-react-and-react-native-libraries/assets/github"
case "$kind" in
  library)
    cp "$lib_assets/publish-github-packages.yml" .github/workflows/publish.yml
    grep -v '^#' "$lib_assets/npmrc-library.example" | sed '/^$/d' > .npmrc
    # shellcheck disable=SC2016  # ${...} below is a JS template literal, not shell
    node -e '
      const fs = require("fs");
      const m = JSON.parse(fs.readFileSync("package.json", "utf8"));
      m.repository = { type: "git", url: `git+https://github.com/${process.argv[1]}.git` };
      m.publishConfig = { ...(m.publishConfig || {}), registry: "https://npm.pkg.github.com" };
      fs.writeFileSync("package.json", JSON.stringify(m, null, 2) + "\n");
    ' "${GH_ORG}/${repo}"
    echo "!! tag v<current version> to publish from source, then regenerate lockfiles"
    echo "!! see docs/operations/REGISTRY_MIGRATION_RUNBOOK.md steps 2-4"
    ;;
  app|backend)
    grep -v '^#' "$lib_assets/npmrc-consumer.example" | sed '/^$/d' > .npmrc
    ;;
  *) echo "unknown kind: $kind" >&2; exit 1 ;;
esac

git add -A
git commit -m "Apply ai-repo-template governance scaffold and GitHub Actions CI"
echo "==> branch chore/github-migration ready on top of $base; review, then open a PR"
