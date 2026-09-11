# Falconwood Missions + Slayer Result Tracking

Falconwood is the first location whose rules add a whole extra layer — a randomly drawn Mission that must be completed to win — and Slayer adds the Mirror Dimension. Right now neither is represented anywhere outside the rules text, so the story AI doesn't know what the Final Girl is trying to do, and the ending can't reflect it.

## 1. Mission picker in the Casting Room

When the chosen location is Falconwood, a third selector appears beside Setup Scenario and Event: **Mission**, with the same look and a randomize button (the Mission is drawn at random by the official rules, so randomize is the primary way to pick it).

The five Missions, with their in-world blurbs:

- **Save Your Father** — Government officials have imprisoned your father to keep him quiet. Help him escape before he's transported to another prison.
- **Missing Friend** — They say your friend died, but it's a lie. Look for clues to find your friend.
- **Survive the Hunt** — Secret agents have arrived in Falconwood with one mission: eliminate you. Eliminate them first.
- **Expose the Lab** — The lab is performing experiments that endanger Falconwood. It's time to expose what they're doing.
- **Crack the Code** — Spies are in Falconwood, communicating in code. Crack the code to foil their plan.

The picked Mission is shown in the session header during play ("Mission: Expose the Lab") and fed to the story AI, so the intro is written around that specific goal rather than a generic hunt.

## 2. Falconwood / Slayer fields on the results form

After the game, when the location is Falconwood or the killer is Slayer, an extra section appears:

- **Mission completed?** — yes/no. If no, a Mission progress note (how close she got).
- **Friend joined** — shown only when the Mission was completed; a short text field for who came to help.
- **Dimension at the end** — Our Dimension or the Mirror Dimension.

All three are folded into the game highlights the same way the Grimlash, Berith, and Shriek fields already are, so the ending narration and the scrapbook entry mention them.

## 3. Ending narration awareness

The ending prompt already receives the highlights text, so no new plumbing is needed — but the Falconwood/Slayer guidance gets a line telling the narrator to treat an incomplete Mission as the reason the killer could not be finished, and a completed one as the turning point.

## Technical notes

- New data file `src/data/falconwoodMissions.ts` exporting the five missions (id, name, description); no schema change — the Mission rides in the existing `setup_scenario`-adjacent path as a new optional `mission` field on `GameSelection` and on `GameResult` (persisted into `game_highlights` text, not a new column).
- `CastingRoom.tsx`: add `selectedMission` state + a conditional selector reusing the existing dropdown/randomize components; include it in the `onStartGame` payload.
- `Index.tsx`: thread `mission` through `GameSelection` → `NowPlaying` props → `recordGame`.
- `NowPlaying.tsx`: display the mission line and add it to the `generate-story` payload (as part of the location's `specialRules`/context string, so no edge-function signature change).
- `GameOutcomeForm.tsx`: add `isFalconwood` / `isSlayer` flags and the three fields, appended to `highlights` in `handleContinue` following the existing per-killer pattern.
- `moduleRules.ts`: extend the Falconwood/Slayer `rulesSummary`/`narrativeGuidance` with the mission-gating note.
