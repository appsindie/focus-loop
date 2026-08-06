# Internal React Native Library Catalog

Use this guide to choose the correct AppsIndie library set for a build issue.

## Selection order
1. `@appsindie/react-native-cores`
2. `@appsindie/react-native-cores-extensions` (if formatting/domain UI helpers are required)
3. Journey-specific accelerators:
   - `@appsindie/react-native-auth`
   - `@appsindie/react-native-notification`
   - `@appsindie/react-native-ads`

## Package map
| Package | Primary purpose | Typical usage |
| --- | --- | --- |
| `@appsindie/react-native-cores` | Core shared UI kit and foundational app components | Base UI components and shared visual patterns |
| `@appsindie/react-native-cores-extensions` | Number/currency/percentage extensions on top of cores | Financial and KPI-heavy views |
| `@appsindie/react-native-ads` | Plug-and-play ad components | Banner/interstitial/rewarded ad journeys |
| `@appsindie/react-native-auth` | Plug-and-play authentication journeys | Login, register, forgot password, social auth |
| `@appsindie/react-native-notification` | Push and notification history/config journeys | Remote push handling and notification center UI |

## Compatibility checks
- Confirm Expo SDK and React Native compatibility before install.
- Confirm peer dependencies are present in consumer app.
- Confirm Firebase major version alignment for auth/notification libraries.
- Validate navigation/redux dependencies where required.

## Required integration evidence
- Selected package set with rationale.
- Version and peer dependency compatibility notes.
- Quick smoke verification of integrated journeys.
- Risks/follow-up issues for gaps or deferred integration work.
