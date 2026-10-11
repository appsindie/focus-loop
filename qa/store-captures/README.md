# Store screenshot captures

Maestro flows used to capture the raw app frames that feed the store-listing
screenshots in `docs/product/brand/store/` (theme) + `docs/product/store_metadata/`
(captions). The composed store images are rendered by the go-to-market skill in
`appsindie/devin-skills` (`.agents/skills/go-to-market/assets/render-store-frames.mjs`)
— that script is the source of truth, never copy it here.

Usage (iOS simulator, iPhone 1206×2622):

```bash
xcrun simctl install <udid> <dev-client.app>
~/.maestro/bin/maestro -p ios --device <udid> test <flow>.yaml
```

Each flow ends with `takeScreenshot`; rename to `NN-<name>.png` matching the caption
order in `docs/product/store_metadata/<locale>.md`.

Gotchas hard-won on this app:

- `assertVisible` takes no `timeout` — use `extendedWaitUntil: {visible: <text>, timeout: N}`.
- `tapOn` point percents must be integers ("86%" not "86.5%") — decimals crash Maestro.
- React Native `Modal`/sheet content is invisible to Maestro's accessibility tree —
  interact inside sheets via `tapOn: {point}` only.
- Text taps must match the full accessibility label (e.g. "Start a 25-minute focus",
  not "Start").
- The dev-client toast "Open debugger to view warnings." contaminates captures —
  dismiss it (tap ~"94%,94%") and `waitForAnimationToEnd` before `takeScreenshot`.
- `WelcomeBack` shows only when the restored engine snapshot is step-done/loop-done,
  step=focus, and `wasInFlight`. To force it: terminate the app, set
  `stepStartedAtMs` in `RCTAsyncLocalStorage_V1/manifest.json` key
  `focus-loop/v1/engine-snapshot` to `now - focusMin*60s - 60s`, relaunch.
- Rendering:

```bash
node render-store-frames.mjs \
  --theme docs/product/brand/store \
  --raw <raw-captures-dir> \
  --captions docs/product/store_metadata/<locale>.md \
  --size 1290x2796 --out <out-dir> --prefix APP_IPHONE_69- --format jpeg \
  --crops <crops.json> --lang <locale>
```

Sizes: App Store 6.9" = 1290×2796; Play phone = 1080×1920; feature graphic 1024×500.
Upload: `fastlane deliver --skip_metadata --skip_binary_upload --overwrite_screenshots`
(iOS) and `fastlane supply --skip_upload_apk --skip_upload_aab --skip_upload_metadata
--skip_upload_changelogs` (Play), assets staged under `apps/mobile/fastlane/`
(the standard deliver/supply input layout — gitignored, local artifact only;
never commit rendered binaries to the repo).
