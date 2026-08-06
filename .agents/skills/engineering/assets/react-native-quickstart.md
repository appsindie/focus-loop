# React Native Quickstart Checklist

Use this when a build issue requires scaffolding a new React Native app.

## Inputs
- Target app name
- Delivery scope (MVP features)
- Platform targets (iOS, Android, web if applicable)
- Runtime constraints (Expo managed, bare RN, Firebase, ads, auth)

## Bootstrap steps
1. Choose runtime path:
   - Expo managed workflow for fast delivery and EAS support.
   - Bare React Native only when native customization requires it.
2. Initialize project using upstream CLI for selected runtime.
3. Set baseline project structure (`src/features`, `src/shared`, `src/navigation`, `src/config`, `src/test`).
4. Configure static analysis per **AppsIndie Static Analysis Convention**, before the first feature slice. Start from the reference configs in `.agents/skills/engineering/assets/verify/node/` rather than assembling this by hand:
   - `tsconfig.json` with `strict: true` and `noUncheckedIndexedAccess`.
   - ESLint flat config with type-aware `typescript-eslint`, `eslint-plugin-import`, and `eslint-plugin-react-hooks` (`exhaustive-deps` at **error**); run with `--max-warnings 0`.
   - Prettier as the formatter, checked in CI with `--check`.
   - `knip` for dead code and unused dependencies; `npx expo-doctor` for SDK/peer drift.
   - Security, deterministic so it belongs in `verify`: `eslint-plugin-security`, `eslint-plugin-no-unsanitized`, `gitleaks`, and Semgrep OSS on a **pinned** ruleset.
   - Expose the entry points as `package.json` scripts — `verify` (everything), `verify:fast` (typecheck + lint), and `audit` (dependency CVEs, kept separate because its result changes when the advisory database moves, not when the code does). Agents run these, not the underlying commands.
5. Add baseline test setup (unit + smoke/E2E harness according to project risk).
6. Add environment and secret handling pattern for local + CI.
7. Integrate internal packages as needed:
   - `@appsindie/react-native-cores`
   - `@appsindie/react-native-cores-extensions`
   - `@appsindie/react-native-auth`
   - `@appsindie/react-native-notification`
   - `@appsindie/react-native-ads`
8. Record compatibility notes (Expo SDK, React Native version, peer dependency constraints).

## Required evidence
- Bootstrap command log and resulting project layout.
- Dependency list with pinned major versions and compatibility notes.
- Baseline test execution output.
- Known risks and follow-up work linked to the build issue.
