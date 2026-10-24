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
| Terror deck and Minor Powers | Sheet lists sixteen Terror cards; board has two Minor Power slots | Components in IMG_9345; slots in IMG_9347 | Faces not supplied; no invented catalog or Minor controls |
| Pre-Finale actions | Facedown Finale/action strip | IMG_9347 | Covered; needs a clear additional photograph |

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

Digital Boiler Room is opt-in at a fresh-deck boundary. Physical sleep tracking remains available. No import of an unknown partly revealed physical deck. The illustrated slider offers four directional buttons, keyboard operation, drag/swipe, opaque uncommitted previews, fixed dialog actions, enlargement, exposed-card history and reduced motion. See [art mapping](../../src/assets/play/fright/README.md).

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

Remaining source coverage: Terror/Minor card faces and uncovered pre-Finale action strip. Do not call the entire killer deck verified until those arrive. All supplied verified components and the digital Boiler Room are the agreed implementation scope.
