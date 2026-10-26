# Sacred Groves artwork and exact diagrams

Original illustrations generated 2026-10-25, visually reviewed before integration.
Source photograph identifiers, credits and rule evidence are in
[the import record](../../../../docs/imports/sacred-groves.md). Raw photographs are
not shipped. Art is thematic interpretation, never evidence for a rule or placement.

- Banner: retain the existing `src/assets/locations/ai/sacred-groves.png` location
  painting, with the module's normal HTML overlay/crop. Never borrow killer art.
- `scenes.webp`: 1536×1536; four columns and rows; 384×384 cells, row-major;
  render with a 3px inset. Generated source `exec-2f2c5f04-bf99-4015-82b2-0430fb5a719f.png`.
  0 Burial Ground, 1 Sacred Shrine, 2 Holy Groves, 3 placed trail barricades;
  4 Loud and Obnoxious, 5 Flash Photography, 6 Fire and Brimstone motif,
  7 Hallowed Ground, 8 Unholy Bloodshed, 9 The Gods Hate Failure,
  10 Closed for Maintenance, 11 Fickleness of the Gods,
  12 stored sign/unknown supply motif, 13 retrieved signs, 14 clear location,
  15 incense/Divine Wrath motif. Event mapping is by stable ID, not sort order.
  Fire/lighting motifs do not establish a literal fire or casualty.
- `people.webp`: 1536×1536; three columns and rows; 512×512 cells, 3px inset.
  Generated source `exec-aeb19f70-cee4-4a5b-8774-6d69b5afe4a6.png`.
  Columns: Tour Guide, Uber Tourist, Holy Man. Rows: present/in danger,
  saved/relieved, departed/empty aftermath. Unknown uses the first-row motif
  with explicit HTML Not recorded. Killed/removed/away use the third row with
  distinct HTML status; aftermath does not claim a cause of death. The people
  are fictional adults; their clothes/faces/gender are illustrative choices,
  not additional canonical character facts. No corpses are used.

Both generated square sources have equal grid cells and were normalized to the
specified square atlas resolution; no identity order changes during sorting.
All names, rules and state indicators remain accessible HTML.

`GrovesBoard.tsx` is a separately drawn SVG diagram using the source-reviewed
19-space/30-connection registry in shared `groves.ts`; it is not generated art.
All five Setup references share that registry. A–S and directional names identify
otherwise unnamed board spaces; they are not invented official place names.
Connection selection has a full-size list control: tiny SVG lines are never the
only interactive target. Viewing diagrams does not write gameplay.

## Sacred-space state art, 2026-10-26

`sites.webp` is 1448×1086, four columns × three rows of 362px square cells, rendered with a 3px inset and complete-cell clipping. Source: `exec-20510bf0-a24a-4c0a-ad2d-1102c3ee75bd.png`, generated for this request, retained in the image-generation output. Rows are Burial Ground, Sacred Shrine, Holy Groves. Columns are clear, chained Closed gate, bronze Fire-and-Brimstone medallion, ivory/gold Hallowed medallion. These are decorative state interpretations, not official token facsimiles or new rules. Fire is an emblem, not a burning landscape. Multiple tokens use the first token's place illustration plus all live state labels and a count; Adjust tokens exposes independent placements. The optimized atlas is bounded at 750KiB. Existing identity sources and atlases remain unchanged.


## Environmental state replacements, 2026-10-26

The earlier `sites.webp` token-emblem atlas is superseded in Play by three separately loaded 1536×768 4×2 WebP atlases. Sources were generated using the original named-site views, with a fixed camera/landmarks within each series:

- `site-burial.webp`: `exec-4c7b5aca-17a8-4bac-b5db-f296ac819806.png`.
- `site-shrine.webp`: `exec-313e1f6b-3a56-4c2c-87fb-29b093a9a648.png`.
- `site-holy.webp`: `exec-7d6197c1-2f6c-4e05-8c37-ddb8a16349b9.png`.

Eight row-major cells use the bit pattern Closed=1, Fire=2, Hallowed=4: clear, closed, fire, closed+fire, hallowed, closed+hallowed, fire+hallowed, all three. Each 384px cell has a 3px inset with explicit source clipping. Blocked access, fiery environments and hallowed light replace medallions; combinations visibly retain all their constituent treatments. These are symbolic UI state illustrations; no wildfire, casualty, new terrain rule or narrative fact is inferred. All text stays live HTML, including unknown observations and multi-token labels. Budget: 520KiB per atlas.

`wrath-1.webp` through `wrath-5.webp` come from the right column of shared source `exec-29f83d98-2c0b-48b4-9037-aeb3199d46ac.png`. Five progressive versions of the same tropical lake/standing stones scene, no killer identity. Native derivative size approximately 768×205; 120KiB each. Fickleness's original scene (cell11 in scenes.webp) is unchanged; only its HTML/CSS frame and size are updated.


## Wide photographic follow-up, 2026-10-26

The current Play card/Sacred-space views use standalone native 16:9 photographic derivatives in `../photos/`, superseding their earlier illustrated hero/state atlases. See `../photos/README.md` for per-card/state mapping and source provenance. Earlier atlases remain intact for unaffected uses and history. Identity pictures and the five Wrath backgrounds are unchanged.
