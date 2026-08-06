---
name: Set Shared GitHub Actions Secrets Across Organization Repos
id: playbook-f61f18152b7f431aae5a15c71692749f
macro: !set_github_secrets
access: org
url: https://app.devin.ai/settings/playbooks/f61f18152b7f431aae5a15c71692749f
---

Playbook: Set Shared GitHub Actions Secrets Across Organization Repos

## Overview
Propagate three common CI/CD secrets to every repository the organization can manage: Cloudflare Pages deployment credentials (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`) and a GitHub Packages/npm publish token (`NODE_AUTH_TOKEN`). This is useful when the GitHub plan does not support organization-level secrets and the same values must be repeated in many repositories.

## What's Needed From User
- The GitHub organization or owner name (e.g., `appsindie`). Default to the organization that owns the current repo if not provided.
- Confirmation of which secrets to set. Defaults to all three:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN`
  - `NODE_AUTH_TOKEN`
- A GitHub PAT with at least these scopes:
  - `repo` (full control of repositories; needed to read the public key and write repository secrets)
  - `write:packages` (needed if the same token is reused as the value for `NODE_AUTH_TOKEN`)
- The three secret values, supplied as Devin secrets:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN`
  - `NODE_AUTH_TOKEN` (or a source token such as `GITHUB_PAT`/`GITHUB_ACTION_PAT` that has `write:packages`)

## Procedure
1. Verify required secrets are available in the environment. If any are missing, request them from the user using the standard secret options.
2. Determine the target GitHub owner/organization. If the user did not specify one, derive it from the current repository context.
3. List all accessible repositories for that owner using `gh repo list <owner> --limit 1000 --json nameWithOwner` or `git_list_repos`.
   - If there are more than 1000 repos, paginate or filter by name.
4. Present the list to the user and ask for confirmation before writing secrets. If the user explicitly said "all repos" earlier, proceed without asking again.
5. For each repository, attempt to set the secrets using `gh secret set`:
   ```
   gh secret set CLOUDFLARE_ACCOUNT_ID --body "$CLOUDFLARE_ACCOUNT_ID" --repo <owner>/<repo>
   gh secret set CLOUDFLARE_API_TOKEN --body "$CLOUDFLARE_API_TOKEN" --repo <owner>/<repo>
   gh secret set NODE_AUTH_TOKEN --body "$NODE_AUTH_TOKEN" --repo <owner>/<repo>
   ```
   Ensure `GH_TOKEN` (or `GITHUB_TOKEN`) is set to the PAT.
6. If `gh secret set` fails with "Resource not accessible by integration" or similar authentication errors, fall back to `gh api` with libsodium sealed-box encryption. A working script template is available in the repository as `scripts/set_github_repo_secrets.py` or on disk as `set_repo_secrets.py`.
7. If a step fails for a specific repo (e.g., the PAT lacks admin/collaborator rights), record the failure and continue with the remaining repos.
8. After the loop, report a summary:
   - Number of repositories processed
   - List of successful repository/secret pairs
   - List of failed repository/secret pairs with the error reason
9. Validate by listing the secrets for a sample repo using `gh api /repos/<owner>/<repo>/actions/secrets` and confirming that all three secret names are present.

## Specifications
- All three secrets are created or updated in every repository where the PAT has sufficient permissions.
- `NODE_AUTH_TOKEN` is set to the value of the provided token (typically the same PAT used for GitHub Packages publishing).
- No secret values are logged, written to files, or committed beyond the single temporary script execution.
- Validation: `gh api /repos/<owner>/<sample-repo>/actions/secrets --jq '.secrets[].name'` returns `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and `NODE_AUTH_TOKEN`.

## Advice and Pointers
- Run this playbook from a repository owned by the target organization so the owner can be inferred automatically.
- `gh` CLI must authenticate with the PAT. Export `GH_TOKEN=$<PAT_SECRET_NAME>` before running any `gh` command.
- Some `gh` builds may refuse to set secrets for certain tokens. In that case, use the Python fallback that calls `gh api` directly and performs the libsodium encryption.
- Repositories that are forks, archived, or not accessible to the PAT should be skipped and reported.
- If a repository already has one of these secrets, `gh secret set` (or the API PUT) will overwrite it with the new value; this is the intended idempotent behavior.

## Forbidden Actions
- Do not create or update secrets for repositories outside the specified owner/organization.
- Do not print the secret values in any output, log, or message.
- Do not store the secret values in files on disk beyond the lifetime of the single command/script that uses them.