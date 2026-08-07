# Operating Runbook — Focus Loop mobile

## Document control

- **Product / surface**: Focus Loop / iOS & Android
- **Version (CalVer)**: v1.0.0
- **Rollback owner**: TBD
- **Last rehearsed**: N/A

## What this service does

Focus Loop is an ad-light Pomodoro timer for adults with ADHD/remote workers. The mobile app runs an offline-first timer, stores session history locally, schedules local notifications, and displays AdMob banner/interstitial ads. "Broken" means crashes on launch, timers not completing, notifications not firing, or ads breaking the core flow.

## Operate

| Task                   | Command / step                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Check health           | Run `npm run verify` locally; verify `tsc`, lint, tests, and Prettier pass.                                       |
| View EAS build status  | `npx eas build:list --platform <ios\|android>`                                                                    |
| View submission status | `npx eas submit:list`                                                                                             |
| Rotate a secret        | Update the value in Devin/org secrets; `NODE_AUTH_TOKEN` is consumed at install time, `EXPO_TOKEN` at build time. |

## Diagnose

Start here when an alert fires.

| Symptom / alert                | First check                                                                                                                  | Likely cause                                                | Action                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| Crash-free sessions drop       | Check Crashlytics / Play Console crash clusters for `react-native-google-mobile-ads` or `expo-notifications` native crashes. | Native SDK crash; ad request with invalid unit ID.          | Halt rollout; ship hotfix with updated ad config or SDK patch. |
| ANR rate spike                 | Check Android Vitals for blocked main thread during ad load.                                                                 | Interstitial blocking UI thread on older devices.           | Reduce interstitial frequency; move load earlier.              |
| Ad load failure rate high      | Check AdMob console for fill errors and invalid units.                                                                       | Test IDs in production or network restrictions.             | Replace with production IDs; verify `app.json` plugin config.  |
| Timer notifications not firing | Check `NotificationScheduler` logs; verify permission granted.                                                               | Notification permission denied or channel misconfiguration. | Prompt permission; check Android notification channels.        |

If the symptom is not in this table and the rollout is in progress: **halt the staged rollout first, diagnose after.**

## Roll back

Mobile binaries cannot be recalled from user devices. The rollback action is to **halt the staged rollout** and submit a hotfix.

```bash
# Halt staged rollout in App Store Connect / Play Console
# Then build and submit a hotfix
npx eas build --platform <ios|android> --profile production
npx eas submit -p <ios|android>
```

- **Trigger conditions**: thresholds in `docs/release/SLO_AND_ALERTING.md`.
- **Expected duration**: 1–3 hours for a hotfix build + store review (if expedited review requested).
- **Data implications**: no server data; local user data in AsyncStorage persists across app updates.
- **Verify rollback succeeded**: monitor Crashlytics / Play Console crash-free rate and confirm new version adoption.

## Escalate

| Situation              | Who / where                             | Notes                                                |
| ---------------------- | --------------------------------------- | ---------------------------------------------------- |
| Vendor outage (AdMob)  | https://status.google.com/workspace     | Pause ad serving if extended.                        |
| Expo / EAS incident    | https://status.expo.dev/                | Blocks builds/submissions.                           |
| Store review rejection | App Store Connect / Google Play Console | Update metadata or binary.                           |
| Data loss suspected    | Stop writes; contact rollback owner     | Local-first app; device backups are user-controlled. |

## Known issues and workarounds

| Issue                                                                     | Workaround                                                               | Tracked at                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| Web preview secondary `Pressable` buttons do not respond to mouse clicks. | Test on native device or emulator; web preview is not a release surface. | `docs/qa/v1-e2e-test-report.md` |

## Sunset

When Focus Loop is retired: remove from App Store and Play Store; preserve no backend user data because the app is local-first. Final release should clear AsyncStorage or document export steps if a successor app is offered.
