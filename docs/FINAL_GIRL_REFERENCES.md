# Photographed Final Girls and private Item unlocks

IMG_9327 supplies the starting faces of 32 characters; IMG_9326 supplies their Ultimate faces. `supabase/functions/_shared/play/finalGirls.ts` contains factual paraphrases, printed starting/flipped health and rescue rewards. The frontend reuses it. Individual, perspective-corrected 600×400 WebP crops contain only that character's card. Group photos and unrelated surroundings are not shipped. Existing casting artwork and biographies remain.

Collection character links, casting info and the initially collapsed Play character file reuse the same reference. Inspecting/flipping a reference never changes gameplay. Play's existing manual Ultimate observation selects its reference face. No rewards, healing, ability use or card flips are inferred from rescue totals; Adrianne and Maureen retain their distinct printed flip instructions. Custom item entry remains available.

## Spoiler boundary

Account confirmation is separate from film ownership, wins, Ultimate observations and recorded Items. A neutral confirmation appears before any secret retrieval. The client sends only a character name and boolean; a pending/offline reveal does not authorize access. A durably queued hide conceals immediately and retries safely. Failed unlock loading stays concealed. Old account responses cannot populate the next account's view.

The secret catalog is populated privately, outside Git, after the schema migration. It is never imported into app/edge source, public assets, tests, or build outputs. Test references are synthetic. RLS protects the catalog and per-account choices. Images use opaque paths in the PRIVATE `final-girl-secret-items` bucket, with SELECT authorization tied to the same unlock. There are no client upload/update/delete policies. Provision objects with zero cache lifetime; the client downloads authenticated blobs only when the player opens the Item card, and revokes blob URLs on close/account change/hide. Secret text stays in memory, never localStorage or the shared query cache. Account-scoped outboxes store character names and booleans only.

The existing Item picker combines Location Items with an authorized Item for the selected Final Girl. Revealing a reference doesn't create an observation; a recorded find doesn't establish later use, charges or current inventory. No full secret catalog or account unlock list enters generation. Text/image directions prohibit inventing signature equipment from game knowledge. Explicitly recorded facts can appear in saved stories/images, which remain spoiler-bearing after a reference is hidden. This is deliberate discovery protection, not protection against a player intentionally taking a screenshot or sharing a revealed picture.

## Health compatibility

The photographs correct the old 5/6-only assumptions. New casts snapshot starting health into the active selection; new outcome rows retain an optional `final_girl_max_health`. A recorded Kate flip establishes 7 maximum health but never heals her automatically. Previously recorded numeric health is untouched. Rows without the snapshot retain their legacy statistics denominator and ending interpretation. No backfill recalculates old games. Ending validation accepts 1–10, including the photographed 4 and 7, without treating the input ceiling as a universal maximum.

## Release order and verification

1. Replay the schema migration and ownership tests on disposable PostgreSQL. Apply `20261021170000_final_girl_references.sql` before publishing the frontend.
2. Privately provision the 22 photographed Item records and their individual images. Do not put the seed SQL or images into a public branch, PR, migration, log, or public bucket. Privately import the owner's supplied unlocks into that owner's account only. A character without a supplied Item keeps a neutral unavailable-reference message after confirmation; never fabricate a card.
3. Deploy `generate-story`, `generate-ending`, `generate-scene-image`, and `generate-visual-bible` from the verified revision. Shared prompt guardrails and the revised ending schema must be live before publishing. Preserve the bounded planner failover repair.
4. Publish the frontend. Verify both a locked account and the owner's confirmed references, including authenticated private-image loading. No paid generation is necessary to verify references.

Run `npm run check`, asset verification, build, native Deno checks, SQL ownership tests, and desktop/mobile browser suites. Browser coverage checks sealed/loading/confirmed/hidden flows, failure recovery, mixed-film selection, manual health behavior, readable reference images and 320px overflow. Inspect the captured Play and Collection reference screenshots. Also inspect public build assets for secret identities before release.
