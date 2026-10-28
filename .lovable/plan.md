# Fix: opening pictures fail with "cast references could not be loaded"

## Diagnosis (confirmed)
- The opening-picture service logs: `Poltergeist: poltergeist.jpg could not be loaded`.
- The recent Poltergeist killer addition put Poltergeist on the list of expected cast photos (42 entries), but its photo was never uploaded to the private cast-photo storage, which still holds the original 41.
- By design, a missing cast photo stops the picture instead of producing a generic one, so every story featuring Poltergeist fails. Other killers should still work.

## Fix
1. Rebuild the Poltergeist reference photo from the existing Poltergeist portrait using the project's reference script (same resize/quality settings), and confirm its fingerprint matches the one already on the expected list.
2. Upload just that one file to the private cast-photo storage (stays private).
3. Confirm storage now holds all 42 expected photos, with no extras.
4. Add a check to the release process notes (docs/MODULE_IMPORT_PLAYBOOK.md) that new killer/Final Girl photos must also be uploaded, so this doesn't recur.

No code or redeploy needed — the service reads storage live. You then start one Poltergeist story to confirm the picture appears.
