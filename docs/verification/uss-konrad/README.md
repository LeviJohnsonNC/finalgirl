# USS Konrad rendered verification

Actual built app, Chromium with desktop/mobile Playwright projects and mocked Supabase/provider responses. These are screenshots of running controls, not generated UI mockups. Local preview/socket/Chromium access is restricted; decoded CI logs provided the JPEG bytes, which were saved, decoded and visually opened. No production/provider/audio or physical-device certification is implied.

The [owner record](../../imports/uss-konrad.md) holds the source reconciliation and deployment audit. [captures.json](captures.json) records every JPEG's dimensions, checksum, source commit and successful capture run. Runtime photography provenance is in the [asset README](../../../src/assets/play/photos/konrad/README.md).

| Capture set | Source and successful run | Review |
| --- | --- | --- |
| Systems at 1280×640, 1366×768, 1440×900, 390×844, 320×568 | `bcaabcfd7698904e71b576d233371aa75cc8d286`; [40901137625](https://github.com/LeviJohnsonNC/finalgirl/actions/runs/40901137625) | Inactive machinery, armed Airlock, middle countdown. Readable captions, stable two-column/phone stack, no overflow. |
| Crew, Events, shafts, Slippery, props and header at 1366/390 | Same | Independent scene identities; safe complete role faces; four stable shaft landmarks; live hearts with correct health. Header remains concise. |
| Unknown/removed at 320; Solar/reboot at 1366/390 | Same | Explicit Not recorded/? counts and compact removed Slippery; repeated-token quantities retained, aligned numeric inputs, cancellation preview and conservation visible. |
| Active/terminal machinery, Loader parked/lost, lower shafts at 1366/390 | `a040417f7ddbfc6c985160c6b75206ad7a286c33`; [40904630631](https://github.com/LeviJohnsonNC/finalgirl/actions/runs/40904630631) | Active Crusher/Incinerator and start countdown; released Airlock and explosion; intact machine versus empty lost footprint; lower shafts open with retained camera/landmarks. Loader loss defaults from its observed Hangar location and is explicitly confirmed. |

All listed captures were visually inspected. Required photographs and meaningful physical state variants also had native-source inspection. The exterior identity was reviewed separately with corrected Noguchi Masaki Mining Corporation / 9791-Bison / Lockheed Martin markings and unchanged ship geometry.

The browser suite decodes images before capture, checks 320px overflow, checks visible actionable controls are at least 44px high, exercises reduced motion and keyboard focus, and confirms viewing/resizing does not change saved gameplay. Five reference viewport dimensions are above; cropped image height varies with the selected region, so it is not the viewport height.

Preflight comparison against the approved Groves reference pack found and fixed caption anchoring before bulk art. Subsequent review aligned Solar quantities and preserved explicit unknowns, role correction semantics, and atomic equipment state/space actions. Final UI uses shared picture toggles, characters and Minor health controls. Countdown advances and token/reset/release previews are deliberate mechanic-specific exceptions; they cannot be safely represented as a presence toggle. No new map/combat/deck simulator was introduced.

Temporary base64 log emission and the dedicated capture workflow were removed after retrieval. Regular desktop/mobile regression journeys and CI artifact/report capture remain. Final-head Reliability results are recorded on [PR #151](https://github.com/LeviJohnsonNC/finalgirl/pull/151); the reviewed runtime UI is unchanged by that evidence/logging cleanup.


## Picture-control refresh

The current browser journeys in `tests/browser/konrad.spec.ts` capture the simplified maintenance/shaft switches, crew outcomes, Events, hazards, independent Loader states and shared Slippery hearts. Desktop captures cover 1280×640, 1366×768 and 1440×900; mobile covers 390×844 and 320×568. They decode photographs before capture, check overflow and 44px controls, exercise keyboard/reduced motion, reload and Undo, and confirm that viewing does not write observations. Starting-Event activation and all seven selected Killers are covered separately. Capture artifacts on the PR's final Reliability run are the source for this refresh. Earlier tables above describe the superseded workbench UI.

The new observation action also has native/shared domain validation, legacy/history/death-cache checks and an existing JSONB session/archive round-trip test. Release requires all six dependent edge bundles before frontend publication; see the owner record. No production deployment or live-provider verification is claimed.
