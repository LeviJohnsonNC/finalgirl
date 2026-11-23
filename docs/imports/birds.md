# Terror From Above import record

The Series 1 vignette uses the existing `s1-terror-from-above` Collection entry.
Birds are selected independently from the Location and Final Girl. Melanie’s
existing cover treatment, biography, character photograph, health images and
trusted opening identity are retained.

## Evidence

| Source | Verified detail |
| --- | --- |
| IMG_9614 and IMG_9615 | Both faces of the five rules cards. Setup, difficulty, win and loss, spawn, attacks and cross-box rules |
| IMG_9616 | Spawn and five-position Bloodlust cards, three Dark Powers and three Finale fronts |
| IMG_9617 | Four ordinary Terror titles in 16 copies, plus Bird Wall. Melanie’s Ultimate is also visible |
| IMG_9618 | Melanie’s 5 Health and six rescue choices |
| IMG_9619 and IMG_9620 | Existing Melanie portrait and biography cross-check |

The minimum pre-Finale spawn is verified. The exact additional icons on the
unphotographed Finale reverse are left to the physical card. Use the printed
effect at the table when two card or Location interactions lack a verified
ruling. The vignette’s Special Victims and Falconwood’s Mission Friends are
separate, and Falconwood retains its documented Mission requirement.

The supplied character card supports Melanie’s existing dossier. Her personal
item remains unavailable in the app pending source evidence and private
eligibility. The current database has an explicit unlock allowlist that does
not yet contain Melanie. No item provisioning or schema changes are part of
this import.

## App integration

- **Casting and setup.** Standard difficulty defaults to Normal. A fresh Birds
  session carries its chosen rescue target. On first Play write, initialize
  the hidden objective and verified starting tracks in the same durable write.
  Legacy sessions may record a correction from unknown. Casting marks Creech
  Manor’s Ghost Hunters as incompatible and supports compatible starting Events.
- **Play.** Objective progress, ordinary totals and tracks remain separately
  visible. One live Special Victim save advances the objective and shared
  saved total, with one Undo. Objective corrections leave shared totals alone.
  Bird Wall has its own token count and stays removed at five until corrected
  or undone. The spawn reference lives in the Rules chapter. Resolve the tabletop
  position, victims, eligibility, dice and attack outcomes on the board.
- **Finish.** Confirm an off-app result before the first archive write. A
  logged rescue win can prefill the review. Loss reason distinguishes overrun
  with known life, overrun with unknown fate, confirmed death and unspecified.
  Save and Generate use the same bounded result. Store reviewed details in
  existing case events and the active ending snapshot. Off-app completion
  retains unknown totals. Scrapbook renders the latest reviewed result from
  the case record.
- **Content and art.** The Rules chapter, card reference catalog, reveal
  controls and opening/ending guidance share the Birds data. Historical death
  facts use the event prefix, excluding later corrections or review. The
  [art manifest](../../src/assets/play/photos/birds/README.md) lists the
  original banner and seven card scenes.

## Verification and release

The Birds browser spec covers Casting, both arrival routes, rescue and Undo,
reload, untracked finish confirmation, mixed Falconwood outcome, Bird Wall,
the revealed card images and Melanie cross-casting. Unit and edge checks cover
the bounded log and ending schema, and event-time death facts. The Play
captures use the supplied laptop and phone viewport standards with mocked
accounts and requests.

Deploy compatible Supabase `generate-ending`, `generate-scene-image`,
`generate-death-scene` and `narrate-story` functions before serving the updated
frontend. The opener’s new guidance travels through its existing fields.
Existing JSON snapshots and logs accept the new bounded observations.
There is no migration or new trusted opening-reference upload. Production
publication and live generation verification are separate release steps.
