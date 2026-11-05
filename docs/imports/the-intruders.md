# The Intruders import record

## Scope and current status

Implemented and locally verified, 2026-11-04. Reviewed online `main` at `f2e1611b1c47eec0432bd7b36f34874e66295eab`. Extend the existing killer owner in `s2-knock-at-door` (A Knock at the Door). Standard box content plus the supplied Epic Dark Power. Wingard Cottage, character ability imports, Extreme Horror and the separately sold bonus Epic Finale are outside this plan. Production deployment and signed-in provider verification are pending.

Baseline: [approved standard](../MODULE_STANDARD.md), [actual UI reference](../reference/module-standard/README.md), [Big Bad Wolf](big-bad-wolf.md), and [Tormentor](tormentor.md). Keep existing film and identity art. Reconcile current Rules and ending references to the group rather than creating a duplicate film or owner.

## Evidence ledger

All six original JPEGs decoded completely. Sources are Levi's Nov. 4 upload. Rules cross-checks use [Van Ryder's Series 2 feature-film and core rulebooks](https://vanrydergames.com/collections/final-girl-series-2).

| ID | Photo | Verified coverage |
| --- | --- | --- |
| I1 | IMG_9464.jpeg | 1 killer board. Horror 3, 6 total Health per Intruder, 2 Minor slots, 11 Bloodlust positions. |
| I2 | IMG_9465.jpeg | Killer booklet cover and component totals. Design Mike Martins, art Heather Vaughan. 2 additional meeples, 2 special tokens and Ginny/Ava thumbnail references. |
| I3 | IMG_9466.jpeg | Special setup, Active Killer switching, all-killer order, panic, shared Minor Powers and deferred Final Health. |
| I4 | IMG_9467.jpeg | Worked example. Trish goes down, Baghead takes over, the UP symbol skips Trish to Zeke, and the physical token is checked after the phase. |
| I5 | IMG_9468.jpeg | All 3 regular Dark Powers, the Epic Dark Power and all 3 box Finale faces. |
| I6 | IMG_9469.jpeg | Pre-Finale action face, all 14 ordinary Terror faces including duplicates, and both 2-Health Minors. |

- Dark Powers: Strength in Numbers, No Remorse, Maskaphobia and Epic Won’t Stay Down.
- Finales: Hunt Sweet Hunt, Release the Beast and You’re Gonna Die. The pre-Finale face is a separate all-killer action, not a fourth Finale.
- Terror deck: They Will Hunt You ×2, It Was Wearing a Mask ×2, We’re Not Going to Make It Through the Night! ×2, They’re Everywhere! ×1, Why Are They Doing This to Us? ×2, Where Are They Coming From? ×1, There’s Blood Everywhere ×2, Go Away!!! ×1, We’re All Going to Die! ×1, Amphetamines ×1 and Coordinated Attack ×1.
- Bloodlust 0–10. Damage by row is 1/1/1/1/2/2/2/2/3/3/3 and movement is 1/1/2/2/2/2/2/3/3/3/3. Horror increases at 1 (+2), 4 (+1), 6 (+1), and 9 (+2). Dark Power at 5. Overflow discards the next Terror card. Keep effects in Rules and physical resolution.
- The standard killer batch is sufficient. Full Ginny/Ava faces and the location board, Setup, Event and Item faces were outside this photo batch.

## Review findings

| Finding | Impact and correction |
| --- | --- |
| Portrait focus and physical activation were coupled. | Checking another Intruder’s health could accidentally change the marker. Make focus read-only and provide explicit marker actions. Give the one remaining HP strip a visible target; use the real short-laptop and narrow-phone layouts to judge click count and fit before bulk art. |
| The Final Health plan left state transitions and physical timing underspecified. | A surviving token, an unrevealed token on a downed Intruder, and confirmed death have different consequences. Use explicit observations and keep physical token reveal timing with the player. Resolve Won’t Stay Down with the confirmed death and power consumption in one undoable write, without granting a second use when a card label is corrected. |
| Play is not the only scalar-health caller. | The finish form, history persistence and ending prompts also consume one number, and the legacy Active Intruder input writes prose. New runs need a roster-derived review and facts, without emitting a misleading scalar, duplicate manual field or inferred result. Keep old data readable. |
| Existing generic controls and death replay can disagree with a new module. | Remember This can show a generic selector next to illustrated cards, and its generic revival is permanent. Use the shared reveal mutation and one owner-specific revival path. Deaths already support a raw-prefix pattern; add it with explicit provenance, so later details/Undo cannot alter the new snapshot or invalidate legacy signatures. |
| New art and production identity loading are separate deliverables. | Exact title-to-photo coverage and real crops need review. The group has no trusted opening entry on reviewed main. An absent object fails closed, so stage and verify one reviewed JPEG before enabling the manifest; never make a frontend release dependent on a missing object. |

## Implementation

### 1. Canonical data and the first Play slice

Use one shared owner catalog for physical figures and board order, the starting all-killer action, Bloodlust, the 3 regular Powers and Epic, all 3 Finales, the 2 Minors, and the 9 ordinary Terror titles/14 faces. Independently check every action sequence and arrow direction against the originals and the publisher example. Update searchable Rules and shared guidance, including the incorrect They’re Everywhere! example, the false Minor protection space requirement, the single-9-HP lookup and the blanket assumption that every selected location is Wingard Cottage. The board identifies Trish by the skull mask, Baghead by the tied sack, and Zeke by the jagged grin. Preserve their current casting likenesses while correcting misleading identity language.

Register a killer-owned module and one roster in the existing Killer Health slot. Keep the approved four trackers and the illustrated module header. Build the roster, controls, and handoff against real layouts first.

| Operation | UI and durable state |
| --- | --- |
| New or resumed game | Fresh-cast provenance seeds each Intruder with 6 total HP (5 normal plus a black Final Health token), Trish active, Horror 3, and Bloodlust 0 in the first durable write. Neither rendering nor opening the module performs a separate write. Old games, including legacy empty logs, keep legacy aggregate history and unknown individual values. Bloodlust has 11 verified image stages; keep old values as recorded and allow an explicit correction. Cap new marker inputs at 10 and let the player handle overflow on the board. |
| Focus, HP and marker | Show all three named portraits in fixed equal columns, with Down/Dead fate when applicable and no numeric HP captions. Tap a living portrait to activate it; in all-active mode the tap chooses whose health to edit. One shared HP strip edits the visibly named Intruder. Preserve unknown legacy health and eligibility. Present no second roster in the module header. |
| Health versus fate | Model numeric HP and token/fate separately. HP edits cannot silently pronounce a death. Use an explicit down/resolve transition on final damage. Display a single killer-side +1 Horror die when any confirmed living Intruder has only their final token. An unknown legacy token stays unknown until the player records it. |
| Final Health and handoff | At the physical down observation, move the marker off an active downed Intruder to the top eligible one when known. Keep pending figures out of the rotation. Black token: record blank or the physical 1–3 HP result (with white token); white-token depletion has no black reveal. When another Intruder is still on the board, the printed black-token example defers its reveal. The last Intruder follows core timing. The player signals the actual resolution point; the app does not infer the phase, force a reveal from a survivor count, choose token results, or award a win. Keep multiple pending results independently reachable. A return does not silently reclaim the marker; explicit correction remains available for uncertain physical ordering or an empty marker. |
| Epic | At confirmed death, provide the source-backed option to record the Epic return when in play and unspent. One durable command records two normal HP plus the replacement black token (3 total HP), the resulting roster state, and spent status. Undo restores the entire transition. Never treat a black-token survival as a death that spends the Epic or consume it from a correction. |
| Finale and Minors | One shared permanent reveal per kind. Release the Beast marks eligible Intruders **All Killers Active** and suppresses single-marker controls while it applies. Ordinary all-killer effects do not shift the marker by themselves. Clear-name keeps the known effect; a confirmed different name corrects it; an unnamed reveal is unconfirmed. No duplicate generic selector or generic repeatable-revival entry. Reuse two shared 2-heart Minor controls. Explicit heart edits record the protection before body damage; there is no automated damage allocation, board position, deck, adjacency, phase or victim simulation. |

Resolve state changes through the existing owner-scoped Play log. Validate stale commands, duplicate writes, linked consequences, replay and dependent Undo/Restore at durable boundaries. Use current shared controls for known/unknown and removed Minors, photographic reveals and quiet corrections. Keep prior observations immutable and victim counts independent.

### 2. Cross-surface and artwork integration

- Use the illustrated chooser in both the killer module and Remember This. Keep the permanent reveal and derived Finale mode in one history. For ordinary returns and Epic returns, surface the owner-specific observation instead of requiring the generic “Back from the Dead” milestone.
- The existing Gruesome Death flow records Victim deaths. Offer Trish, Baghead, or Zeke as optional attribution when applicable, with unknown allowed. Reuse one Terror lookup by title and keep mixed killer/location causes distinct. The Active marker alone establishes no attacker. For new deaths only, reconstruct surrounding roster/card state from the raw log prefix at creation, preserving later intentional edits to the death itself and the old hash format for existing takes. Check matching signatures after JSONB round-trips, and prove a later correction or Undo cannot change an old snapshot or detach its narration.
- Render a concise roster-derived ending review (including All Active and unknown). Preserve pre-module manual records and archive data; do not remap the old scalar to an individual, sum the roster into that column, or send a synthetic single Health value to the ending prose or poster. Keep explicit outcome selection; pending tokens and recorded 0 HP do not prove victory. Carry relevant roster facts into the existing story budget alongside the selected location. No results or Stats redesign.
- Plan 22 distinct new photos: a wide group banner, three individual portraits, 9 Power/Finale/Minor photos, and one per unique ordinary Terror title. Keep the approved group casting art, existing generic Bloodlust series, and painted ending-poster treatment. Make the art shot list per stable ID with native ratios, focal positions, and tested derivatives. Lock all three practical mask designs and recognizable silhouettes before bulk generation. Use coherent available light and candid 1980s consumer 35mm. Examples: Maskaphobia from inside a sash window, Strength in Numbers from between two occupied exits, Won’t Stay Down by a low porch step, Hunt Sweet Hunt from undergrowth, Release the Beast with the trio closing in. Design the wide banner for all masks and Trish’s headpiece at the intended crops; adjust composition or use a responsive derivative if needed. Treat the photos as illustrative, including when played at other locations.
- Stage one reviewed group JPEG from the existing casting art for the trusted opening loader. Verify its digest and the object in private Storage before activating the manifest. The prompt should preserve the selected Final Girl and location, keep all three identities distinct, and show only the Intruders called for in the shot. A group reference is conditioning, not evidence that all three appeared. If Storage verification is blocked, keep the manifest entry inactive and report that opening likeness verification is pending.

### 3. Completion and release evidence

| Gate | Evidence required |
| --- | --- |
| Physical rule fidelity | Reconcile all 16 Terror cards and the board table. Reproduce the published Trish → Baghead → Zeke → Baghead example with the token still hidden until the phase ends. Test a miss, an Item hit, wrap in both directions, each Final Health result including white-token depletion, multiple pending figures, last-Intruder timing, the single bonus, and the Epic’s once-only return/Undo. Test both Finale reveal entry points, including rename/clear, and both Minor Powers. |
| Normal gameplay and history | Fresh session, legacy empty and populated saves, reload/offline recovery, stale inputs, failed write/retry, linked Undo/Restore, and wrong-owner rejection. Exercise Wingard Cottage and a location with its own Play module. Verify both Rules search and all 9 Terror choices, a named and an unknown death attacker, stable old/new death signatures, takes/narration, and the real Finish flow through prose, poster request and archive reload. |
| Actual app visuals | At 1280×640, 1366×768, 1440×900, 390×844 and 320×568, check mask and prop continuity, actual crop and photo-to-card mapping, a readable four-tracker dashboard, clear distinction between focus and marker, keyboard/touch operation, and reachable pending-resolution actions. Review real loaded images and representative browser screenshots for quality; run asset, build, domain, edge and final-head Reliability CI checks. |
| Release | Use existing event storage; no SQL migration planned. Trace the final shared imports and release compatible consumers before the Lovable frontend. Candidate consumers are generate-story, generate-ending, generate-scene-image, generate-visual-bible, generate-death-scene and narrate-story. Confirm the private reference before enabling its manifest entry. After authorized deployment, run a signed-in mixed-location smoke test and review a fresh opening and Reshoot for selected Final Girl and Intruder likeness. Report local/CI, deployed revision, and provider verification separately. |

Open physical-rule boundary: the supplied pages demonstrate the standard single knockdown and delayed black-token check. They do not resolve every ordering edge if multiple figures go down and an Epic return intervenes. The tracker records the player’s explicit physical ordering rather than enforcing a ruling on an unverified case.

## Verification and handoff evidence

- The actual Play journey reproduced the printed Trish → Baghead → Zeke → Baghead sequence, recorded blank and surviving Final Health, used both reveal entry points and both Minors, and recovered the roster after reload. Additional journeys verified legacy saves, failed-write retry, mixed-location victim attribution and cached narration, Rules search, ending prose and poster request, and the archived result. The eight desktop/mobile journeys passed against mocked services.
- Reviewed real compiled Play screenshots at 1280×640, 1366×768, 1440×900, 390×844 and 320×568. The banner initially cropped Trish’s antlers and put the phone title over the masks. The final crop keeps the faces and headpiece within the art area and separates the narrow title from the trio. Reviewed all 22 selected photographs. The [artwork manifest and shot list](../../src/assets/play/photos/intruders/README.md) record source identities, derivatives and individual prompts.
- Local lint/typecheck, 934 unit tests, 126 Node edge adapter tests, the asset manifest gate, the production build, and native Deno checks of the changed shared modules passed. Native full edge entrypoint checks require the CI network for remote imports. GitHub final-head checks are the release gate.
- The reviewed opening JPEG is staged at `supabase/reference-assets/the-intruders.jpg`. Exact key `opening-references/the-intruders-b40605eafc7a3b77.jpg`. SHA-256 `b40605eafc7a3b77b625a123301e54af1c4d0cce9cf44b43b4eb76d31b340519`. Private Storage could not be verified here, so the manifest entry is intentionally inactive. After authorized upload and digest verification, enable the fixed entry and verify a live opening and Reshoot. The module requires no SQL migration.
- The shared graph reaches `generate-story`, `generate-ending`, `generate-visual-bible`, `generate-scene-image`, `generate-death-scene`, and `narrate-story`. Deploy compatible edge functions before the frontend on release.


### Play tracker follow-up

Tap a living portrait to make that Intruder active. The portraits remain in three equal columns. Health uses the standard tracker controls. Reducing an Intruder to zero exposes any necessary outcome choice in that moment. An already downed portrait can reopen its pending result. Release the Beast retains all-living-active behavior and lets the player choose whose health to edit.


### Fixed portrait row

The three Intruders keep their canonical order in equal columns. Only active living Intruders are in color, including all eligible figures under Release the Beast. Inactive and downed figures are grey. Per-person focal positions preserve the masks in the narrow crops. The health editor continues to follow the chosen figure in all-active mode.

Portraits show names without numeric HP captions. The bottom health editor and accessible health descriptions retain each figure’s health; down/dead labels remain visible. This follow-up is frontend-only.
