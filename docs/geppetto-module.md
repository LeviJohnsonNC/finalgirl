# Gepetto module

Scope: standard-mode **Geppetto**, independently of Location. Carnival of Blood gameplay and Extreme Horror are separate work. The canonical data spelling is `Geppetto`; search tags also accept `gepetto`. Final Girl references/items are unchanged.

## Verified references

Owner photos IMG_9333–IMG_9337 provide the board (8 starting Health, Horror 4), both rule-sheet pages, three regular Dark Powers plus one Epic, three Finales, the Puppet tray, and sixteen Terror-deck cards including two Minor Dark Powers. The supplied 2026-10-22 17:48 screenshot verifies the facedown Finale actions. Human-readable summaries and provenance live in `_shared/play/geppetto.ts`; rules, selections and model references use the same catalog. App Puppet numbers identify three physical tokens and are not invented official character names.

Before the Finale: spawn one Ready Puppet, return Exhausted tokens to Ready, then resolve the printed target/movement actions on the board. Never refresh before choosing the spawned token. An unnamed Finale reveal also stops this helper. Special-card spawning is explicit and separate; no reveal automatically applies card effects, attacks or casualties.

## State and recovery

Newly cast Geppetto sessions carry `geppettoSetupVersion: 1`. Their three-Ready setup is saved once with the first Play observation, alongside any independent starting Event. Older sessions, even those with no log yet, receive no automatic puppet setup. They can record each token or explicitly choose standard setup. Opening/closing the panel never creates observations.

Three fixed token IDs enforce a maximum pool of three. Normal spawning is one atomic observation; Undo restores all affected tokens. Ready/on-board/Exhausted states, Minor Health and first-hit protection markers survive the existing device outbox/cloud session recovery. Rapid same-render repeats are guarded. A rejected save leaves the UI state unchanged.

Puppet defeats do not count as Victim deaths. Minor Health is separate from Geppetto’s Health. Massive Abominations protection is initially unrecorded; the player marks hits or explicitly resets for a new turn. Round advancement does not reset it. Immortal Master protects the Final Health token conditionally; Join the Family needs co-location that token counts alone cannot prove. I Made Your Friends does not expand the three-token physical pool.

Play suggestions and new outcome references use eight Health. Existing recorded/result/draft Health above eight is preserved in the outcome range. Nothing rewrites saved games.

## Narratives and independence

Geppetto controls and Terror suggestions follow the Killer; Items, Events and rooms follow the Location. No new Carnival location catalog is implied. Reveals use the same immutable moment plus detail corrections as Remember This. Ending summaries prioritize Geppetto state within existing context limits. Death context is reduced at the original death, not from later puppet changes. Existing other-module fingerprints retain their shape. Only explicitly recorded events establish damage, attackers or casualties.

## Artwork and interaction

Four original generated WebP assets provide the header, nine puppet states, regular/Epic powers and Finales, health-token art, and six Minor Power states. Atlases retain their original sizes and are addressed through SVG rectangles rather than independently repainting or stretching the figures. The UI uses text labels, keyboard-focus styling, 44px controls and reduced-motion handling. Photos are references, not card-viewer UI. Minor powers use symbolic string/puppet imagery with different full/weakened/removed compositions.

## Deployment

No SQL migration or new secrets are required. Deploy **generate-death-scene** and **narrate-story** with the updated shared Play validator/context before publishing this frontend. Older edge bundles reject the new module observations. The UI and shared server code must agree on death fingerprints. Merge/CI alone does not deploy the linked Lovable app or its functions.

After deployment, verify one signed-in Geppetto + Camp session: tray setup, spawn/exhaust/reload, Minor hearts, a Puppet death scene and its saved narration. Production access/paid provider calls are not part of automated verification.

## Verification

Unit coverage checks all 27 three-token distributions, ordered normal spawning, special spawns, unnamed Finales, invalid fields, Undo/restore, legacy sessions, prompt budgets, reviewed Health, module independence and historical JSONB-stable death signatures. An edge-handler adapter case authorizes a Puppet scene from canonical owned state. Desktop/mobile journeys exercise the real UI, casting, failed local storage, rapid taps, reveals shared with Remember This, hearts/art changes, death suggestions, owned rules and mixed Locations. Existing Camp and Buddyland regression suites remain required. CI also replays database ownership tests and checks native Deno entrypoints.
