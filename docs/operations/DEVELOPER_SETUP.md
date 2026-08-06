# Developer Setup

## Private packages (`@appsindie/*`)

`@appsindie/*` libraries are published to **GitHub Packages** (`https://npm.pkg.github.com`) under the `appsindie` org. They were previously on Azure DevOps Artifacts; that feed is read-only and kept only for the rollback window.

Package names and versions are unchanged — only the registry host moved.

### One-time local setup

1. Create a **classic** personal access token with the `read:packages` scope only, and authorize it for the `appsindie` org (SSO) if required. Do not grant `write:packages` — publishing is CI-only.
2. Export it from your shell profile:

   ```bash
   export NODE_AUTH_TOKEN=ghp_xxx   # read:packages only
   ```

3. Repos already commit the required `.npmrc`:

   ```ini
   @appsindie:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
   always-auth=true
   ```

   Never commit a token, and never put a token in a repo-local `.npmrc` literal.

4. Verify:

   ```bash
   npm view @appsindie/react-native-cores version
   npm ci
   ```

### Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `401 Unauthorized` | `NODE_AUTH_TOKEN` unset/expired, or SSO not authorized | Re-issue the PAT and authorize it for `appsindie` |
| `404 Not Found` on a package that exists | The package has not granted read access to your repo/user | Package settings -> Manage Actions access / invite user |
| Lockfile still resolves `pkgs.dev.azure.com` | Stale lockfile from before cutover | Delete `node_modules`, reinstall, commit the regenerated lockfile |
| Works locally, fails in CI | Workflow missing `permissions: packages: read` or not passing `NODE_AUTH_TOKEN` | Use the `ci-light.yml` baseline |

### In Devin sessions

Store the `read:packages` PAT as the `GITHUB_PACKAGES_READ_TOKEN` secret and export it as `NODE_AUTH_TOKEN` in the repo blueprint's setup step, so `npm ci` works in a fresh session.

## Publishing a library

Never `npm publish` from a laptop. Bump the version on the default branch, tag `vX.Y.Z`, and let `.github/workflows/publish.yml` build, test, verify peer deps, and publish. See
`.agents/skills/internal-frontend-react-and-react-native-libraries/assets/registry-and-migration.md` -> "Maintainer mode".
