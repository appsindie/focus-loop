---
name: Testing Focus Loop (web preview)
description: How to end-to-end test the Focus Loop Expo app in the web preview, including the current mouse/keyboard interaction workarounds.
---

# Testing Focus Loop — web preview

## When to use
- Validating a Focus Loop mobile build slice when no iOS/Android simulator is available.
- Smoke-testing the core focus journey before native device QA.

## Preconditions
- Repo: `/home/ubuntu/repos/focus-loop`
- Branch: `release/v1`
- Node >= 20, npm
- Chrome installed (`/home/ubuntu/.local/bin/google-chrome`)

## Start the app
1. `cd /home/ubuntu/repos/focus-loop && npm install`
2. `cd apps/mobile && npx expo start --web --port 8081 --offline`
3. Open Chrome with a fresh profile so AsyncStorage/localStorage is clean:
   `google-chrome --no-first-run --user-data-dir=/tmp/focus-loop-test-profile --start-maximized --new-window http://localhost:8081`
4. Allow the browser notification permission prompt when it appears; otherwise `expo-notifications` may reject scheduling.

## Key journeys
- Home → Settings → change duration → Save → Home
- Start Focus → Timer → Pause → Resume → complete → Summary → Home
- View History
- Cancel regression (start then cancel; no session recorded)

## Known web-preview gotchas
- **Mouse clicks on secondary `Pressable` buttons often fail** in `react-native-web` (Settings, Pause, Resume, Cancel, Back, View history, Start another). Use keyboard `Tab + Enter/Space` or `browser_console` `.click()` to drive those interactions.
- **Keyboard resume after pause may trigger Cancel** because focus lands on the Cancel button when the Pause button unmounts. Programmatic `.click()` on the Resume button is the most reliable way to resume in web preview.
- **Non-preset default durations are not shown as selected** on Home; only `15/25/45` buttons highlight.
- **Notifications/vibration cannot be physically observed** in the browser; verify only that the app does not crash and no console errors appear.
- **Use a short default duration (1 minute) for the complete flow** to keep the recording reasonable.

## Verify command
- Run `npm run verify` at the repo root. It runs `tsc`, `eslint`, `jest --ci --coverage=false`, and `prettier --check` in `apps/mobile`.

## Devin Secrets Needed
- None.
