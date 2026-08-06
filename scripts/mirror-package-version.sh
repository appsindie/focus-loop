#!/usr/bin/env bash
# One-time migration helper: copy exact @appsindie package versions from Azure
# Artifacts to GitHub Packages, preserving name and semver. Only the repository
# and publishConfig metadata is rewritten; the published files are untouched.
#
# Usage:
#   AZURE_DEVOPS_PAT=... GITHUB_PACKAGES_PAT=... \
#     ./scripts/mirror-package-version.sh <repo-owning-the-package> <pkg>@<version> [<pkg>@<version> ...]
#
# Example:
#   ./scripts/mirror-package-version.sh appsindie/appsindie-react-native-cores \
#     @appsindie/react-native-cores@4.0.0 @appsindie/react-native-cores@4.0.1
#
# `latest` follows the highest version published, so re-point it afterwards when
# mirroring an older release:
#   npm dist-tag add @appsindie/react-native-cores@5.0.0 latest
set -euo pipefail

: "${AZURE_DEVOPS_PAT:?set AZURE_DEVOPS_PAT (Azure DevOps PAT with Packaging: Read)}"
: "${GITHUB_PACKAGES_PAT:?set GITHUB_PACKAGES_PAT (GitHub PAT with write:packages)}"

AZURE_FEED="${AZURE_FEED:-https://pkgs.dev.azure.com/AppsIndieCompanyLimited/e3b0221d-4330-444a-a973-a240a2a7726f/_packaging/appsindie/npm/registry/}"
gh_repo="${1:?usage: mirror-package-version.sh <owner/repo> <pkg>@<version>...}"
shift

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
feed_no_scheme="${AZURE_FEED#https:}"

{
  echo "registry=$AZURE_FEED"
  echo "${feed_no_scheme}:username=azure"
  echo "${feed_no_scheme}:_password=$(printf %s "$AZURE_DEVOPS_PAT" | base64 -w0)"
  echo "${feed_no_scheme}:email=npm@appsindie.com"
  echo "always-auth=true"
} > "$work/.npmrc-azure"

{
  echo "registry=https://registry.npmjs.org/"
  echo "@appsindie:registry=https://npm.pkg.github.com"
  echo "//npm.pkg.github.com/:_authToken=$GITHUB_PACKAGES_PAT"
  echo "always-auth=true"
} > "$work/.npmrc-github"

for spec in "$@"; do
  echo "==> $spec"
  rm -rf "$work/stage"
  mkdir -p "$work/stage"
  (cd "$work/stage" && npm pack "$spec" --silent --userconfig "$work/.npmrc-azure" >/dev/null)
  tarball=$(find "$work/stage" -name '*.tgz')
  tar xzf "$tarball" -C "$work/stage"
  rm -f "$tarball"

  # Publishing from a directory would run the library's prepare/bob build, so
  # repack the untouched tree instead and publish the tarball.
  # shellcheck disable=SC2016  # ${...} below is a JS template literal, not shell
  node -e '
    const fs = require("fs");
    const p = process.argv[1] + "/package/package.json";
    const m = JSON.parse(fs.readFileSync(p, "utf8"));
    m.repository = { type: "git", url: `git+https://github.com/${process.argv[2]}.git` };
    m.publishConfig = { ...(m.publishConfig || {}), registry: "https://npm.pkg.github.com" };
    fs.writeFileSync(p, JSON.stringify(m, null, 2));
  ' "$work/stage" "$gh_repo"

  (cd "$work/stage" && tar czf mirrored.tgz package)
  npm publish "$work/stage/mirrored.tgz" --userconfig "$work/.npmrc-github"
done
