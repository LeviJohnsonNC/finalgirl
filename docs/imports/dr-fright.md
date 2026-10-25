# Dr. Fright import record

Standard-mode Killer, `Dr. Fright`, film `s1-maple-lane`, module `fright`. Paired Location Maple Lane and new Final Girl/personal-item work are outside this import. Branch: `feat/dr-fright-boiler-room`. Final committed validation, screenshots and release status belong to the implementation PR; consult its current checks rather than an old suite count.

## Evidence ledger

| Component | Coverage | Durable source | Status |
| --- | --- | --- | --- |
| Setup and worked Boiler Room example | Both pages, components and four-step example | IMG_9345.jpg; Library `libfile_2ce8fa6cdfb8819193e4f5aa8cb854d4` | Verified |
| Awake/Asleep and Boiler Room rules | Both special-rule pages | IMG_9346.jpg; Library `libfile_54456fd53e488191b7047a73f1a86b15` | Verified; end of Killer phase, not older Terror-phase descriptions |
| Killer board | 9 Health, Horror 4, Bloodlust sleep/reset instruction | IMG_9347.jpg; Library `libfile_7524afb178f48191a1ce9972a995eef4` | Verified; pre-Finale action strip is covered |
| Regular Powers | Pitchfork Assault; The Frightmare Is Inevitable; Never Really Dead | IMG_9348.jpg; Library `libfile_a26a82402ba08191be711904af47c340` | 3/3 verified |
| Epic Power | Shock Factor | IMG_9348.jpg | 1/1 verified |
| Finales | Face Your Fright; Time to Die; Everyone Must Die | IMG_9348.jpg | 3/3 verified |
| Boiler Room | Four faces, one Dr. Fright quadrant on each | IMG_9349.jpg; Library `libfile_60bdfe52d9c08191b28217feec50adcd` | 4/4 verified |
| Terror deck and Minor Powers | Sheet lists sixteen Terror cards; board has two Minor Power slots | Components in IMG_9345; slots in IMG_9347 | All 16 faces now supplied in IMG_9350.jpg, including Hellish Pursuit (2 Health) and Endless Sleep (1 Health) |
| Pre-Finale actions | Facedown Finale/action strip | IMG_9347 | Owner confirmed October 24: target Final Girl/Victim, then attack, no movement |

Designer A.J. Porfirio; original publisher artist Roland MacDonald, as credited on the supplied sheet. Raw photos are retained outside the public app/repository; use the stable identifiers to retrieve evidence, rather than relying on this session's temporary paths.

## Verified mechanics and corrections

- Standard 9 Health / Horror 4. Corrects the former 8-Health outcome catalog and 10-Health Play fallback. Recorded old values remain authoritative.
- Fresh Dr. Fright casts carry explicit setup provenance. The first durable Play observation seeds Awake once. Older/part-played games retain unknown sleep state; viewing a panel never initializes gameplay.
- Awake prevents attacks between Dr. Fright and the Final Girl, with the printed targeting behavior and recorded card exceptions. Asleep permits ordinary combat but prevents Victims following or being saved. Victims do not become Boiler Room occupants.
- Short Rest/Long Rest apply normally, then cause sleep regardless of result. Boiler Room timing is player-directed: optional Action-phase cards, exactly one at the end of the Killer phase unless a game effect changes this. No global phase engine or auto damage/casualties.
- Every slide translates the cover AND earlier exposed cards while the unresolved deck stays put. Higher cards occlude lower cards. U,U,L,D yields bottom half, bottom half, right half, top-right quarter. With the example quadrant order, only the third reveal attacks.
- Pending attacks survive closing/reload and block further slides until explicitly resolved. Fourth-card attacks finish before waking. Normal completion prepares the next concealed shuffle; Face Your Fright remains Asleep and starts another deck.
- The top Bloodlust sleep/reset effect is explicit. Round advancement never silently resets the deck.
- Card selection remains the shared permanent observation/detail correction. Immediate Face Your Fright sleep, Everyone Must Die off-board and Never Really Dead token replacement effects use explicit once-per-reveal resolution markers. Changing a card name or revisiting the chooser cannot automatically reapply them.

## Integration and interaction

Canonical mechanics/catalog: `_shared/play/fright.ts`. Rules and prompt guidance: `src/data/rules/frightRules.ts`, registered in `moduleRules.ts`. Existing selection/ownership IDs are reused without a duplicate film. The registered Killer panel follows Dr. Fright to every Location; Location controls remain independently owned.

The panel uses shared Power/Finale artwork and the same chooser in Remember This. Unselected art is dimmed, selected art vivid, and Shock Factor has the independent Epic frame. Full rules/corrections are disclosed; consequential active restrictions remain visible. No unsupported Minor Power substitutes or generic creature controls.

Digital Boiler Room is opt-in at a fresh-deck boundary. Physical sleep tracking remains available. No import of an unknown partly revealed physical deck. The illustrated slider offers four directional buttons, keyboard operation, direct drag/swipe with concealed-safe previews, fixed dialog actions, enlargement, exposed-card history and reduced motion. See [art mapping](../../src/assets/play/fright/README.md).

### October 24 interaction polish

- Supplied open-eye Awake and closed-eye Asleep card backs replace the placeholder cover. Full source IDs, 2:3 dimensions and conversions are recorded in the [art mapping](../../src/assets/play/fright/README.md). Existing sleep-selector illustrations and the Dream Doctor cutout are preserved.
- The cover and all previously exposed cards follow one captured primary pointer in SVG coordinates. Framing reserves legal travel before pickup, stays fixed during dragging/settling, then eases to the next frame. Direction locks after a small pickup threshold; unavailable directions resist movement. Only a legal release past the threshold requests one existing atomic slide.
- Save acknowledgment gates settling and new faces. Dragging renders only public cutouts and a neutral unresolved surface. Failed saves return the stack without consuming/exposing a card. A newly public cutout rises briefly with a small overshoot and shadow, clipped to exposed quadrants. Reopening, defense and Undo never replay the entrance.
- Short/canceled gestures, capture loss, Escape, resize, blur, closing and conflict changes clear transient motion. Buttons share the slide path and remain available for keyboard users. Reduced motion preserves direct dragging with immediate settling and no pop/camera animation.
- This presentation/callback follow-up changes no snapshot, validation, shuffled deal, attack, narrative or historical signature contract. Publish the frontend only; the original import's backend release requirements below remain historical prerequisites.
- Verification includes native mouse/touch displacement before release, no pre-release log writes/cutouts, all four directions, exact single commits, save rejection/retry, cancellation paths, reduced motion and keyboard operation. Successful motion videos and laptop/phone stills are retained in the implementation PR's current-head CI artifacts.

## Persistence, information boundaries and Undo

One bounded validated module snapshot is one atomic observation. It includes a parent-step ID, mode, sleep, cycle, current/reserve deals, path, pending attack, completed-trip display and explicit effect markers. The write boundary checks the exact valid successor against the durable current state, rejecting stale renders, wrong owners and skipped/invalid transitions. A failed local save reveals nothing; offline cloud failure does not block local play. Known cloud conflicts disable new digital decisions until the existing whole-version handoff is resolved.

Parent links make dependent steps inactive when an earlier step is undone. Restore replays the same chain. New branches after correction retain the deal identities from raw history, including a next deck already generated by an undone completion; Undo/recompletion never rerolls it. The raw immutable observations remain recoverable. This is protection against accidental leaks/rerolls in a personal companion, not a server-authoritative anti-cheat system.

Timeline descriptions and narrative/death projections explicitly omit raw snapshots, order, reserve, parent IDs, paths and effect markers. Only sleep, publicly recorded progress/attack and named revealed cards enter module facts. Legacy Dr. Fright reveals with no new module observation acquire no new death context/hash. Other-owner contexts remain unchanged. Ordinary Victim death context never claims the Boiler Room attack injured that Victim.

## Verification and release

- Domain tests: independent raster oracle for every reachable path × all 24 orders; printed example; fourth-card defense; forced sleep; dependency Undo/restore; same next shuffle on recompletion; invalid payloads; safe projections and historical signatures.
- Durable-boundary tests: fresh versus old saves, same-render duplicates, foreign-owner and impossible transitions, preservation of recorded 8 Health in an old draft.
- Browser journeys: each supported Location, both reveal entry points, physical/unknown states, save rejection/retry, canceled gestures, attack reopening, offline persistence, exact example/quarter reveal, forced-sleep completion, Rules search, death generation/cache and narration. Actual laptop/phone captures are reviewed in the implementation PR.
- Run source checks, asset check, production build and both Reliability browser projects; retain native Deno/database checks. CI/provider fixtures do not prove live deployment.

No SQL migration, new secret or dependency. Deploy **generate-death-scene** and **narrate-story** from this revision with the new shared Play module before publishing the frontend. The old edge bundles reject unknown module observations. Verify the actual deployed revision, then smoke-test an authorized signed-in Dr. Fright mixed game with save/reload, Boiler Room progress, a contextual death and saved narration. Merge/CI alone does not deploy the linked app.

Source gaps closed October 24: IMG_9350 supplies all 16 Terror faces; the owner directly confirmed the starting Action. See the follow-up below for implementation and release status.

### October 24 concealed reset and direct sleep controls

- The live modal renders only the current `path`/`deal`. `lastPath` and `lastDeal` stay in immutable history for Undo and never substitute for the new concealed deck. Fourth-card defense still finishes before the reset; Face Your Fright resets while remaining Asleep and immediately permits the next trip.
- Main-panel and modal Awake/Asleep tiles share `FrightSleepControls` and the same domain command/write boundary. A deliberate Awake correction during a partial digital trip atomically promotes the already shuffled reserve, clears the exposed path and prepares a new reserve. An untouched deck is retained. Selected-state activation is a no-op, pending attacks block changes, forced sleep blocks Awake, and failed writes leave the current artwork intact. Undo/re-wake reuses recorded randomness.
- The side result panel and top sleep/progress strip are removed. A full-width transparent stage sits over Levi's supplied boiler room background; compact illustrated state tiles and directional alternatives remain below it. Required attack/conflict notices and save errors stay visible beside fixed footer actions; routine progress uses an assistive announcement. The Awake cover fits the available stage without reserving unusable travel. Asleep framing still reserves legal travel before pickup.
- Public card layers gather briefly after a committed reset/wake, then disappear. Reduced motion and cancellation show the current saved deck immediately. Pointer move/release also checks the pickup viewport dimensions so a resize cannot race the window event and commit a stale gesture.
- Artwork source and conversion are in `src/assets/play/fright/README.md`. This changes an existing frontend transition, not the snapshot schema or narrative projection. `validFrightSuccessor` is enforced at the frontend active-game boundary; the server's existing parser already accepts the unchanged snapshot shape. No database migration or edge-function deployment is required.
- Verification: domain successor/Undo/no-reroll tests, artwork gather tests, existing module contracts and Dr. Fright journeys, plus `fright-state-controls.spec.ts` for both entry points, fourth-card attacks, concealed reload/reopen, failure/retry, forced sleep, and laptop/390px/320px layouts. Current CI results belong to the implementation PR.

### October 24 follow-up: gesture controls and deliberate waking

- Removed all four visible direction buttons. Drag/swipe remains the primary interaction; the card stage is also keyboard focusable and accepts arrow keys through the same saved-slide path. Disabled/pending/completed states reject keyboard moves as well as pointer moves. No replacement directional toolbar is shown.
- The Attack resolved action has a copper/brass plate treatment, inset framing, a shield/check icon and clear hover/focus states. It retains the explicit defense acknowledgment and never records damage automatically.
- After a safe fourth reveal, keep the completed Asleep layout visible until the player chooses Awake from either entry point. The finished sequence remains durable across close/reopen/reload and cannot advance to the next trip before that acknowledgment. As before, the next shuffle is prepared privately once at completion; Awake conceals the finished layout without rerolling it. A fourth-card attack still finishes through Attack resolved, and Face Your Fright still resets automatically because Awake is forbidden.
- The existing v1 snapshot representation, parser and public story/death projection remain unchanged. A completed safe trip uses its retained lastPath/lastDeal only during the explicit review state. No database migration or backend deployment is needed.
- Tests cover the deliberate wake, reload, Undo/re-wake without a reroll, blocked fifth reveals, keyboard alternatives, absent direction buttons, and existing native drag/cancellation journeys. Browser screenshots include the held safe-fourth layout and the updated attack action.


### October 24 full Terror deck follow-up

- Evidence: `IMG_9350.jpg`, Library `libfile_5e98df20a3b48191a8f3d3546d0f5586`, all 16 faces (14 ordinary Terror cards plus 2 Minor Dark Powers). Re-supplied board/rules/Powers/Finales: `IMG_9345(1).jpg` (`libfile_919b96edbc98819191e809a0a500b03e`), `IMG_9346(1).jpg` (`libfile_273cf5005aa881918426aab280dc1de8`), `IMG_9347(1).jpg` (`libfile_5c6ac2cb1db48191a5a09228a0223daf`), `IMG_9348(1).jpg` (`libfile_0fd3f1b347148191968f0c6efec6c031`). Existing regular/Epic Powers and Finales match. Starting Action confirmed in the owner's October 24 instruction: target Final Girl/Victim, then attack; no movement.
- Canonical catalog includes all 16 names and paraphrased effects, correctly owned by the killer in every Location. Death picker, Rules and Terror reference share this catalog. Card-reference selection alone never records gameplay, invents an Item or applies physical outcomes.
- Hellish Pursuit: 2 Health, one additional Boiler Room reveal at the end of the Killer phase while Asleep, if able. Endless Sleep: 1 Health, atomic reveal/fall Asleep; while active forbids waking and immediately resets completed decks. Removing/clearing its observation does not wake the player, and Face Your Fright independently keeps its restriction. Shared MinorPowerControl/HealthTokens accept a health maximum, defaulting to the existing 2 for other killers.
- Optional bounded `minor` and `conditions` maps extend the existing v1 snapshot; old snapshots remain unchanged. Each explicit update remains a parent-linked immutable observation and is checked by the durable successor guard. Pending attacks block these changes. Unknown/zero and failed writes remain distinct. Optional properties enter historical public context only when explicitly recorded, preserving old signatures and never projecting deals/reserves/paths/parent IDs.
- Temporary effect reminders: Blurred Reality, Better Lock the Door, Marked for Death, Better Stay Up Late, and the conditional Never Sleep Again extra reveal. Activation and ending are deliberate observations; the tracker does not invent phase timing. Blurred Reality updates the mutual Awake-damage reminder. Never Sleep Again's optional digital reset preserves Asleep and promotes the prepared reserve; Undo/retry retain deal identities. Better Stay Up Late reminds the player to resolve all remaining cards and defend each attack.
- Release requirement: deploy **generate-death-scene** and **narrate-story** with the updated shared validators/context before publishing the frontend. No SQL migration. The Lovable connector previously rejected writes because its authorization lacks `projects:write`; deployment and signed-in production smoke verification remain pending until access is restored. CI fixtures alone do not establish a live fix.
- Validation and visual review: results belong to the follow-up PR's current head.
