# Verified Final Girl facts and personal item unlocks

Owner photographs IMG_9327 (starting faces) and IMG_9326 (Ultimate faces) supply the verified facts for 32 characters in `supabase/functions/_shared/play/finalGirls.ts`. The frontend reuses that catalog for starting health, observed Ultimate maximum-health changes, and character details. Rescue rewards and special starting rules remain structured source data. The photographed card crops and card-viewer controls are no longer shipped; the source photo identifiers and factual paraphrases remain documented for future corrections. Existing character portraits and biographies remain.

## Character details

Casting, Collection, and the small named character-info action in the Play header use `LoreInfoModal` and the same compact character facts: starting health, any different Ultimate maximum, the verified Ultimate ability, additional-save reward, and personal item status. Backstory opens on demand beneath the details. There is no separate full-width character-file panel in Play. Missing verified facts do not produce invented abilities or unlock controls.

Reading details never changes gameplay. The existing manual Ultimate observation marks the ability as recorded for that game. No rewards, healing, ability use, or card flips are inferred from rescue totals; Adrianne and Maureen retain their distinct printed instructions in the data. Custom item entry remains available.

## Personal items

A locked item has no visible identity. A short confirmation records that the player unlocked it in the physical game. Confirmed unlocks belong to the account and are reused across sessions. An unlocked item shows its verified name and effect without a photograph. Its name is offered alongside Location Items in Play for the selected Final Girl, including mixed-film games. It is not automatically equipped or recorded as found/used. Locking it again conceals the reference and removes the suggestion without rewriting past observations, stories, or images.

Existing unlocks, the durable account-scoped outbox, RPCs and row-level security are retained. A queued/offline unlock cannot authorize a read; a durably queued lock conceals immediately. Failed unlock loading stays concealed. Old account responses cannot populate the next account's view. Secret text stays in memory rather than localStorage or the shared query cache. The client consumes only girl/name/effect; the existing RPC's image metadata is ignored and no storage download is requested.

The private catalog is populated outside Git. Never put secret identities into public source, assets, tests, build output or logs. Test items are synthetic. No account-wide unlock list enters story/image generation, and existing prompt guards prohibit inventing signature equipment. Explicitly recorded items may appear in saved stories/images even after being locked again.

If an unlocked character has no verified item record, show “Unlocked. Item details aren’t available yet.” Request failures have an explicit retry that refreshes all mounted readers, keeping character details and Play suggestions in sync. Guests can read character facts but must sign in to save unlocks.

## Health compatibility

New casts snapshot corrected starting health; outcome rows retain optional `final_girl_max_health`. A recorded Kate flip establishes 7 maximum health but never heals her automatically. Outcome entry and scrapbook displays use this session maximum. Records without a snapshot retain the legacy denominator, matching statistics and ending interpretation. Never backfill or recalculate old games from the current catalog.

## Release and verification

This simplification requires no new migration, private catalog rewrite, storage deletion or edge-function deployment. Existing `20261021170000_final_girl_references.sql` and private item provisioning remain prerequisites for the original unlock feature. Historical setup documented 22 supplied item references; confirm actual deployed availability through authorized access rather than assuming all characters have records.

Run `npm run check`, asset verification, build, and desktop/mobile browser suites; retain existing database ownership and edge checks in CI. Browser tests cover compact shared info, locked/confirmed/locked-again flows, pending acknowledgement, reload persistence, existing unlocks, mixed locations, request failure/retry, missing records, guests, manual Ultimate health, and 320px overflow. Inspect laptop/mobile character dialogs, the Play header, Collection, and casting. Confirm no card crops are emitted in the public build and no item-image request is made. Tests mock external services and use no paid generation.
