# Inkanyamba import record

## Scope and current status

- Killer: Inkanyamba the Avenger; existing film ID `s1-sacred-groves`; module ID `inkanyamba`.
- Scope: killer only. The separate [Sacred Groves location import](sacred-groves.md) now supplies Divine Wrath and shared Atonement integration. Final Girl abilities remain outside scope.
- Stage: implemented and locally verified; PR #121 merged with passing CI. Deployment was not performed in this work.
- Branch: `feat/inkanyamba-killer-import`; reviewed and implemented 2026-10-25. Existing selection and film identity retained.
- Photos are persistently available through the Library identifiers below; do not commit raw card photos.

## Evidence ledger

| Source | Persistent reference | Verified coverage |
| --- | --- | --- |
| IMG_9363.jpg | libfile_8e8b602c07488191b3ba7af113e2166e | Killer board: 9 starting health, 4 starting Horror, Bloodlust track and two Minor Power slots. |
| IMG_9364.jpg | libfile_93b570a7629c819185221debeb831ccb | Lore, credits and component counts: 3 Finales, 3 regular Powers, 1 Epic, 1 Wrath card, 2 Atonements, 16 Terror cards. Final Girls pictured in inventory are outside this import. |
| IMG_9365.jpg | libfile_90e3645966948191a8213e146aa164ab | Special setup and complete supplied killer rules: Killer Wrath starts at 2, limits 1–10, Unleash reads current level, both Atonements added to tableau. |
| IMG_9366.jpg | libfile_9c601b5707e08191a854e42684dc316e | Wrath table; both identical Atonements; all 3 Finales and 4 Powers including Epic. |
| IMG_9367.jpg | libfile_e17b5ac8f73081918043e82188cd8efe | 14 killer Terror faces plus 2 Minor Powers = 16; pre-Finale action face. Also includes a Maple Lane Terror card, outside killer catalog. |

### Reconciled card names and quantities

- Regular Powers: Rising Dread, Volatile Temper, Feast of Anger.
- Epic Power: Dark Lightning.
- Finales: Violent Tantrum, We Need a Miracle, Savage Whirlwind.
- Minor Powers: Boiling Anger and Outrageholic, each with 3 health.
- Other killer Terrors: Fickle Temper ×2; He's Coming and There's Nothing We Can Do! ×4; I Don't Know How, But I've Angered Him! ×1; Wrath of Opportunity ×1; Wrath of Blood ×1; Punishment or Mercy ×1; Wrath of Horror ×1; Wrath of Defilers ×1; Wrath of Death ×1; They Disrespected Him, and Now He Wants Their Blood! ×1.
- Extra card: Now Get the Hell Out of My House! is location-marked Maple Lane content; do not attach to Inkanyamba.
- No further killer photos identified as necessary after visual review. Effect/icon transcription and canonical-data reconciliation are implemented in the shared Inkanyamba catalog.

## Verified mechanics and corrections

- Replaced the existing serpentine/weather-dependent narrative note: supplied lore describes an avenger who adopted the legendary monster's name; pictured identity is a muscular masked humanoid carrying paired curved weapons, feather/fur adornments and skull details.
- Corrected both the Play fallback of 10 and result helper of 8 to photographed 9. Previously recorded higher health remains editable; starting Horror remains 4.
- Wrath starts at 2 only for genuinely fresh sessions; absent older observations stay unknown. Range is 1–10.
- Increasing Wrath alone is distinct from Unleashing. Unleash can itself increase Wrath at low levels. Do not repeatedly chain Unleash without a verified instruction.
- Preserve actual effect order, live Power/Minor modifiers, and Finale reveal effects. Do not infer physical movement, casualties, adjacency or Action-card inventory.
- Atonement has 3+/2/1/0-success outcomes. A reduction by half rounded up is a rounded-up reduction, not a rounded-up remaining level.
- Minor health range is 0–3; the existing shared control is reused with configurable maxHealth.
- Divine Wrath belongs to the separate Sacred Groves module. Its import shares Atonement while preserving killer/location ownership; no Divine track is invented at other locations.

## Integration coverage

| Surface | Implementation / evidence |
| --- | --- |
| Selection/ownership | Existing film and IDs retained, no duplicate selection. Fresh casting with Camp verified through archived ending. |
| Rules/catalog | Shared `inkanyamba.ts` includes exact owner-filtered names, quantities, ordered effects, Wrath/Bloodlust tables and source attribution. Rules/search and death reference suggestions reuse those facts. |
| Play | Registered illustrated panel, 1–10 Wrath tracker, current Unleash instructions, bounded Atonement helper, shared Power/Finale chooser and 3-health Minor controls. |
| Setup/recovery | New-session provenance seeds Wrath 2 once at durable boundary. Legacy unknowns, explicit corrections, atomic Finale resolution, Undo, reload, failed writes and offline cloud failure/recovery are covered. |
| Narration/deaths | Corrected avenger identity, owner-filtered card/mechanism references, bounded ending facts and death-time context. New reveal provenance supplies facts even when legacy Wrath is unknown; old generic reveals do not retroactively change cached death hashes. |
| Artwork | Reviewed original header, seven Power/Finale illustrations, eight Minor health-state images and heart token. On 2026-10-25 Levi supplied the approved candid jungle identity photograph (`image(20261026-010847).png`, attachment `file_000000003ce881fdb87259361374372b`), replacing the painted portrait byte-for-byte; banner/state art remains unchanged. Mapping/provenance in `src/assets/play/inkanyamba/README.md`; future identity-photo direction in `docs/IDENTITY_PHOTOS.md`. |
| Archive/stats | Existing stable owner IDs and archive contracts retained. Browser casting → Play → result → ending → archive verifies identity and Wrath context; historical health above the new reference stays editable. No statistics formula changes needed. |
| Compatibility | Inkanyamba journeys at Camp Happy Trails, Buddyland, Carnival of Blood and Maple Lane on desktop/mobile. Existing shared-control combinations covered separately. Sacred Groves compatibility is covered in its separate import record. |
| Verification | See evidence below and current PR Reliability checks. |
| Deployment | Backend-first: `generate-death-scene`, `narrate-story`, then frontend. No SQL migration. Not deployed or live-provider verified. |

## Interaction decisions

- Tracker +/- and level buttons record physical levels, never trigger chained healing, Horror, casualty, upkeep or movement changes.
- Unleash is an ordered reference for the currently recorded level, not a digital board-resolution action. Low-level Wrath increases do not recursively Unleash.
- Original killer-only Atonement changes Killer Wrath with the rounded-up reduction and lower bound enforced. The Sacred Groves import factors this into a shared helper: at Sacred Groves it appears in the location panel and targets one chosen eligible track; elsewhere Inkanyamba retains its Killer Wrath helper. Time/hand/inventory stay physical.
- Both reveal entry points share one permanent reveal. We Need a Miracle exposes an explicit atomic `wrath:10` + `miracleResolved:true` action; durable checks reject repeats/unearned applications. Undo reverts that observation, not the permanent reveal. Card corrections never resolve effects.
- Shared MinorPowerControl/HealthTokens use maxHealth=3. Unknown, full, damaged and removed remain distinct. Health is separate from killer health and victim totals; prior reveal evidence survives an explicit unknown-health correction.
- Save conflicts disable all new mutations, including shared chooser buttons. Ordinary offline failure keeps durable local tracking available and retryable.
- `inkanyambaReference:true` marks newly recorded Power/Finale moments at the durable boundary. The reference marker is not projected as a fictional event. Context ownership and historical cutoffs remain authoritative.
- The nine-health reference applies to new defaults; the result form preserves previously recorded higher health rather than clamping old games.
- The narrowest phone track uses five columns with 44px minimum widths and 4px gaps. Laptop banner cropping retains the mask. Shared chooser and ending layouts are preserved.

## Verification evidence

- `npm run check`: lint (existing warnings, no errors), both TypeScript projects, **427 Vitest tests**, **102 Node edge/handler tests**. Native Deno validation: **25 passed**. Deno checked the six generation/narration entry points, including both affected bundles.
- `npm run check:assets`: **287 original artwork files** verified. `npm run build`: passes.
- Domain/UI/hook tests cover all ten source-backed Unleash levels, deck quantities, odd Atonement rounding, illegal bounds, 3-health states, owner rejection, unknown legacy states, new reveal provenance, one-time Finale resolution/Undo, rapid duplicate attempts, save retry and historical/JSONB death identity.
- `tests/browser/inkanyamba.spec.ts`: four mixed locations, shared reveals, persistence/Undo/offline/local-write rejection, Finale resolution, cached death/reopening/narration, minimum touch dimensions and actual atlas loading, fresh casting through ending/archive/Rules, legacy higher health. Both Chromium desktop/mobile projects.
- Shared browser regression selection: module-consistency, dark-power-layout, death-completion, story-request-contract. Final PR CI runs the full device suites.
- Loaded UI/artwork inspected at 1280×640, 1366×768, 1440×900, 320×568 and 390×844: header/track, unselected/selected/Epic cards, unknown/full/damaged/removed Minors and Rules. Screenshots are emitted to the corresponding Playwright test output/CI artifacts.
- Fixed material review findings before handoff: mask cropping, narrow-phone Wrath touch width, preservation of legacy result health and cached death fingerprints.
- Tests use mocked providers/accounts. They do not establish production deployment, live AI prose quality or actual paid-provider audio generation.

## Release and remaining work

1. PR #121 is merged. Current paired-location work and its release status are tracked in the separate Sacred Groves record.
2. Deploy `generate-death-scene` and `narrate-story` with their updated shared Play validators, context, card references and death cue before publishing the frontend. These are the changed backend import graphs; opening/ending/image/bible handlers were checked but require no additional deployment for this import because their supplied frontend guidance uses existing contracts.
3. Publish the frontend. No SQL migration, schema changes, new model or dependency is required.
4. Production signed-in smoke: new mixed game, Wrath/Minor change, save/reload, one contextual death, cached reopening and saved narration. Deployment/live smoke are pending, not claimed complete.
5. Sacred Groves is now handled by the separate location import. Final Girl abilities remain out of scope.

No killer source gaps remain for standard mode. Raw card photos are retained at their existing persistent references and excluded from Git/build output.

## Play presentation follow-up, 2026-10-26

User-approved simplification replaces the Wrath presentation with the shared `WrathTrack`, themed separately for this owner. Power/Finale cards are compact and stable across selection; Minor Powers precede them and preserve full artwork motifs/health semantics. Shared atlas framing now clips each source cell explicitly. Source facts, validators, setup provenance, immutable historical observations and story/death context are unchanged.

Play removes the requested reference/correction panels. The dedicated Rules page retains mechanics and source attribution; obsolete references to retired UI helpers are corrected. Existing observations from hidden controls remain compatible and are not migrated or erased. Special-victim Rules disclosures are omitted while outcome actions and consequential reminders remain. Holy Man allocation remains provisional as previously approved. Sacred-space image cycling, explicit combined/unknown editing and Fickleness presence toggling use existing fields only. These UI conveniences never execute physical board effects, alter totals or infer Event/token state from one another.

Release: frontend/artwork only; no new SQL or edge deployment. Current-head CI and the final PR record verification results separately from production publication.


### Cinematic Play follow-up, 2026-10-26

Approved visual-only follow-up: compact muted choices with large revealed Power/Finale panels across all applicable killers; independent active Minor panels with original health limits; Rules disclosures removed from Power/Finale chooser. Five Wrath background bands per owner replace static backgrounds; Play Unleash text and Inkanyamba Wrath reference removed. Sacred spaces use transformed environment images for all eight combinations, preserving actual placement/unknown/correction logic. Fickleness keeps its original artwork, loses reminder text and becomes 195px high. Shared presentation applies only to equivalent controls; linked Events and other owner mechanics retain their workflows.

Source/art mappings and symbolic interpretation are recorded in the owner artwork READMEs. Raw rules, canonical validation, historical observations, narrative context, token limits, separate victim totals and provisional Holy Man allocation remain unchanged. No backfill or migration. Release: frontend/artwork only; CI/merge/publication are tracked on the PR separately.


## Wide photographic selection follow-up, 2026-10-26

User-requested: remove Inkanyamba's duplicate Power/Minor reminder beneath Wrath, hide unused choices after a named Power/Finale/Minor is recorded, retain explicit Change/Add another actions, and replace affected images with wide candid photographic motifs. Shared selection behavior applies to Inkanyamba, Hans, Billy, Geppetto and Dr. Fright, including Hans's second power. Sacred Groves uses all 24 separately cropped 16:9 environmental-state photos, with unchanged token limits and atomic observations. Exact provenance/mappings: `src/assets/play/photos/README.md`. Several Minor Powers remain supported; unknown, zero, correction, failed writes and permanent reveal history remain distinct. The chosen photo stays stable through Minor health changes. Original source-backed rules, canonical IDs, compatibility, narrative/death context and provisional Holy Man allocation remain unchanged. No SQL, backfill, function or secret changes; frontend/artwork release only. Verification and publication status are recorded in the PR.


## Banner and correction follow-up, 2026-10-26

Replace this owner's illustrated module banner with an original owner-specific candid photograph, alongside all ten existing Play headers after visual audit. Native crops/focal points/provenance are in `src/assets/play/banners/README.md`; supplied identity pictures and gameplay imagery remain intact. Dark Power uses left-aligned Clear card name without a Change button, preserving its permanent reveal. Minor Powers replace Details & corrections with the existing Clear record action as a quiet link; live heart controls, Undo and historical observations remain. Sacred spaces suppress only the known-empty No tokens caption; unknown/mixed/live states retain their labels. Canonical facts, compatibility, context and provisional Holy Man allocation are unchanged. Frontend/artwork only; no SQL, function or secret changes. Verification/publication are tracked in the PR.
