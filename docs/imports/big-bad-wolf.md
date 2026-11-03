# Big Bad Wolf import record

## Scope and current status

Big Bad Wolf, killer owner `big-bad-wolf`, in the existing Once Upon a Full Moon film `s2-once-upon-full-moon`. Standard mode. Killer controls work independently of the chosen location. Existing casting, Collection ownership and the reviewed Wolf identity remain in use. Storybook Woods rules and Final Girl abilities retain their own scope.

## Evidence ledger

The six full-resolution source photos are 1536 × 2048 RGB. Originals stay outside this repository.

| ID | Source | Reconciled coverage |
| --- | --- | --- |
| W1 | IMG_9445.jpeg | 9 Killer Health, Horror 5, Bloodlust positions 0–10 and overflow. Three Minor slots. |
| W2 | IMG_9446.jpeg | Component inventory and credits. Design by Julie Ahern, art by Tyler Johnson. |
| W3 | IMG_9447.jpeg | Track/Slay mode, phase-start timing, Epic combined effects, worked Terror example. |
| W4 | IMG_9448.jpeg | Three regular Dark Powers, one Epic, three Finales and their action lines. |
| W5 | IMG_9449.jpeg | Starting Killer Action and Track face. |
| W6 | IMG_9450.jpeg | Thirteen ordinary Terror faces, including duplicates, and three 2-Health Minors. |

The prior generic setup produced 10 Killer Health and Horror 4. Fresh Wolf sessions use 9 and 5 through their first durable observation. Legacy saves retain recorded or unknown values. The physical card resolves mode-specific actions using phase-start timing. The photographs do not separately illustrate a mid-phase Epic edge case, and the UI records mode without adjudicating it.

## Interaction and integration

- The owner catalog in `supabase/functions/_shared/play/bigBadWolf.ts` feeds the Rules page, both reveal surfaces, Minor controls, and owner-filtered Terror suggestions.
- A compact illustrated mode panel precedes Minor Powers, Dark Power and Finale. Track, Slay, Track + Slay, and unrecorded mode are distinct. A reveal without a recognized card can be clarified. The two reveal entry points share a permanent event. Clearing the label preserves known mode, and a later name correction derives the new mode from the same history. Durable write failure leaves the previous display retryable.
- Minor Powers use the shared jeweled hearts with two, one, zero, and unknown Health. The app records observations and the player resolves the physical effects.
- The death modal uses Wolf-specific Killer and Terror art. New Wolf deaths capture mode and Minor Health from the log through the death. Later reveal edits and health changes do not alter that snapshot. Pre-import death fingerprints and existing takes remain readable.
- The current photographic Wolf identity supersedes stale caller descriptions and old continuity in image prompts. Mixed scenes follow their selected location and Final Girl. Card imagery, pose and arrow marks supply no additional session facts. The ending still uses the existing painted poster treatment.
- [Artwork manifest and prompt set](../../src/assets/play/photos/big-bad-wolf/README.md) records 23 independent originals and 10 derivatives. The existing generic Bloodlust series covers all eleven verified positions.

## Verification

`npm run check` covers the shared module contracts, source counts, reveal replay, legacy signatures, mixed ownership and edge loader. `npm run check:assets` verifies 23 unique sources and their derivative dimensions, sizes and checksums. The browser journeys at `tests/browser/big-bad-wolf.spec.ts` exercise both reveal paths, rejection/retry, old and new setup, Minor health, all named card photographs and cached death. Browser results include actual rendered screenshots at 1280×640, 1366×768, 1440×900, 390×844 and 320×568. The header and death tile scrims were adjusted after reviewing loaded crops.

## Release

The staged immutable opening object is `supabase/reference-assets/big-bad-wolf.jpg`. Upload its exact bytes to the private `opening-references/big-bad-wolf-17a24c1b9e0f9fc3.jpg` key. SHA-256 is `17a24c1b9e0f9fc32f0fd7343c441fb7a76c1e9041c0bf9a6efc1299d4e3e612`. Check the retrieved bytes before activating the manifest.

The changed function graph reaches `generate-story`, `generate-ending`, `generate-visual-bible`, `generate-scene-image`, `generate-death-scene` and `narrate-story`. Deploy compatible functions before publishing the frontend. There is no SQL migration. Private upload, deployment and signed-in live smoke remain release steps. Local reference-loader and browser checks use controlled test data.
