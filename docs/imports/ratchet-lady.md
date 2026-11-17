# Ratchet Lady killer import

## Scope and status

Ratchet Lady is the killer in **Madness in the Dark** (`s2-madness-in-dark`). The killer module ID is `ratchet-lady`. The standard-mode import extends the existing cast entry, preserves Heather and Veronica’s catalog and visual assets, and works independently of the chosen location. The supplied Wolfe Asylum components remain source evidence for a separate location import. The optional Shield of Madness uses the existing Epic card treatment.

## Source inventory

All six original JPEGs opened at full resolution. The first five are 1536 × 2048 and IMG_9592 is 2048 × 1536. The first and fifth were inspected upright. Use the existing attachments as the source record. The [publisher’s Series 2 Feature Film Rules](https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FG_S2_FeatureFilmRules-compressed_2_d7a4674c-d7cf-4d4d-8118-59622183cbcc.pdf?v=1717771084) corroborate the counts and add an explicit Special Victim exception. See printed pp. 32–38 and the [Core Rules](https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2025/10/Final-Girl-Rules.pdf) for the icon key, Final Health, Bloodlust and Minions. Killer credits are A.J. Porfirio and Evan Derrick for design and Vladyslava Ladkova for art.

| Original | Verified coverage | Scope or open detail |
| --- | --- | --- |
| IMG_9581.jpeg | Killer board, 6 Health, 5 Horror, nine Bloodlust positions and overflow, two Minor slots | Use IMG_9585 for the clear unrevealed action side of the Finale card. |
| IMG_9582.jpeg | Killer booklet introduction, credits and component counts | Heather and Veronica appear as component thumbnails. |
| IMG_9583.jpeg | Starting Maniacs, uncapped Health, Maniac stats and movement penalty, conversion, six-meeple limit and Calm | The publisher’s PDF also explicitly exempts Special Victims from conversion. |
| IMG_9584.jpeg | 3 Finales, 3 regular Dark Powers and Shield of Madness, the Epic Dark Power | Card faces and timing are visible. Hold Her Down’s printed reveal and the six-meeple limit need a joint interpretation when demand exceeds supply. |
| IMG_9585.jpeg | All 16 killer Terror faces, 2 copies of Calm and the unrevealed killer action face | “What Is This Place Doing to Me?” is Wolfe Asylum’s eighth Terror face. |
| IMG_9592.jpeg | 7 further Wolfe Asylum Terror faces, 5 Amped cards and the Pill Effects reference | The location board, setup and event decks, item cards and Side Effects deck are outside this killer import. |

**Killer Terror ledger.** Fourteen ordinary faces across thirteen titles. **Blood Jolt** appears twice. **Keep Her Busy…**, **Screams in the Dark**, **March of the Maniacs**, **Join Us or Die!**, **Leave Her to Me!**, **We Are Helping!**, **Blood Transfusion**, **Let Me Tend to Your Wounds…**, **Bloodletting**, **Whispers in the Dark**, **Don’t Worry, This Won’t Hurt…**, and **Join Me in the Dark Places** appear once each. **Blood Drive** and **Insanity-Lust** each add one Minor Dark Power face. Each has one removable heart.

**Reveal ledger.** Finales are **It’s Raining Maniacs**, **Feed the Madness**, and **Hold Her Down**. Regular Dark Powers are **Manic Burst**, **Dark Injection**, and **Bloodfear**. **Shield of Madness** is Epic. The photograph includes two physical copies of **Calm**.

**Wolfe Asylum ledger.** The eight Terror faces are **What Is This Place Doing to Me?**, **Where Did Everyone Go?**, **Extreme Paranoia**, **4:00… Time for Bingo!**, **Fueled by Madness**, **Give Us Our Meds!**, **All Hail the New Master!**, and **I Found Some Candy!**. The five Amped faces are **Rapid Healing**, **Resistance**, **Extreme Agility**, **Final Girl 2.0**, and **Rabid Fury**. Retain these sources for a later Wolfe Asylum import.

## Verified mechanics and integration

- The nine-position track begins at Bloodlust 0. Dark Power reveals at 4. Overflow recovers one Health and discards the next Terror card. Standard setup is 6 total Health, Horror 5 and two Maniacs. The separate printed one-heart Minor Powers use the existing control and can coexist.
- Play uses a single 0–6 illustrated Maniac tracker. A contextual Calm action records the actual number returned to Victims. Printed penalties, movement, attacks, healing, conversions and card draws resolve on the physical board, with actual totals entered in Play. Special Victims are exempt from conversions. The publisher booklet and photographed Finale do not establish an allocation order for Hold Her Down when insufficient Maniac pieces are available.
- The shared permanent Finale reveal exposes **Record reveal effect**. The explicit observation stores the known count or unknown and Calm removal together. Correction or dependent Undo preserves the previous state. Bloodlust overflow and the separate Health counters never infer a casualty, and the Shield cue leaves Health editable for physical exceptions.
- A verified starting snapshot seeds only genuinely new Ratchet Lady casts. Old saved Health, Horror and Bloodlust stay as recorded, and unobserved Maniacs remain unknown. Requests with elevated Health are accepted for this owner through the existing database integer range. Independent existing killer validation limits still apply.
- Gruesome Death uses owner-specific Terror suggestions and optional Ratchet Lady or Maniac attribution. Newly recorded event-time context uses the raw log prefix. Archived fingerprints keep their prior shape. Finish prefills the existing count, and its reviewed value takes precedence for both prose and poster.
- The [original Play artwork](../../src/assets/play/photos/ratchet-lady/README.md) and runtime derivatives have a checked provenance manifest. Laptop and phone browser journeys cover the populated module, exact count, unknown and linked reveal states.

## Verification and rollout

Run `npm run check`, `npm run check:assets`, `npm run build`, and the Ratchet Lady desktop/mobile Playwright cases. The latter use fixtures for Supabase and generation. The final pull request runs Reliability CI. No SQL migration is required. Deploy compatible Edge functions before introducing the frontend using the new Play event and Health values. The shared graph reaches `generate-story`, `generate-ending`, `generate-visual-bible`, `generate-scene-image`, `generate-death-scene` and `narrate-story`.

Opening and Reshoot use existing prompt guidance with the verified selected cast and location. A candidate trusted portrait JPEG is staged at `supabase/reference-assets/ratchet-lady.jpg`. Its proposed fixed key is `ratchet-lady-3262aa2f920c8e04.jpg`. The SHA-256 digest is `3262aa2f920c8e04cbabb5130ba3a4a9043d0ef64b7298b9f0c92269c0d11612`. Activation requires the exact private object to be uploaded and verified. The deployed manifest currently has no Ratchet Lady entry. Live provider and signed-in production verification are separate from CI.
