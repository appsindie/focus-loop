# LIVE_E2E_INDEX

Canonical smoke/regression index.

Defaults:

- Mobile smoke/regression: Maestro
- Web smoke/regression: Playwright
- Backend smoke checks: minimal API integration suite

Map each test set to shaping/build/release issue IDs.

| Journey                                             | Automated coverage                                         |
| --------------------------------------------------- | ---------------------------------------------------------- |
| Clean install, ATT prompt, deny, then use the timer | `ATT prompt + deny = automated` — `.maestro/att-deny.yaml` |
