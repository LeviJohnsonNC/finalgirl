# Four-module reference gap checklist

Reviewed 2026-10-24. These are the remaining source limits recorded in the import
records, separate from the software parity fixes. No additional photographs are
needed for that first PR. Existing Rules, Play trackers and mixed films continue
to use the verified references already supplied.

## First batch: missing rule/card text

- [ ] **Maple Lane — both Convince Action cards.** Photograph the complete face of
  each card, including every success/failure line, the three-or-more-success
  result, Time costs and all icons. The general occupied-House rules are already
  verified; the detailed result tables are not. Source: [Maple Lane record](imports/maple-lane.md).
- [ ] **Dr. Fright — complete Terror deck, including both Minor Dark Powers.**
  Lay out all physical copies so repeated names and the deck count can be checked.
  The component sheet lists sixteen Terror cards. Close shots of three or four
  cards at a time will help with small icons. Powers, Finales, Boiler Room faces
  and the special rules already supplied do not need resending.
- [ ] **Dr. Fright — pre-Finale action strip.** Show the entire action line on the
  facedown Finale side, uncovered, with targets, movement, attack and timing
  symbols readable. The earlier board photo covered this area. Source:
  [Dr. Fright record](imports/dr-fright.md).
- [ ] **Billy — Killer board and Bloodlust tokens.** Show the full standard board,
  its complete Bloodlust track and any initially covered action strip. Lay out
  every Bloodlust token, including set-aside copies, and photograph both sides.
  Keep the two token types grouped so quantities, effects and track mapping can
  be verified. Starting Health/Horror and the general setup are already known;
  this completes the token-specific reference. Source: [Buddyland Play record](BUDDYLAND_PLAY.md).

## Second batch: board reference coverage

- [ ] **Buddyland — full Location board.** One straight-on image with every room,
  Arcade marking, Entrance, connection and panic arrow visible. Add close shots
  only where the small symbols cannot be read. This closes the documented map
  reference gap; it does not request a movement simulator.

## Optional, outside the current tracker scope

- [ ] **Maple Lane — itemized token inventory.** All token types with physical
  quantities and both sides visible. Twenty-one tokens total is known, but the
  per-type counts and reverse-face mapping are not. This is only needed to
  complete the inventory reference or consider a future token-supply feature.
- [ ] Mention any **different printing, errata or Extreme Horror variant** you
  want supported when sending its relevant face. The current imports target
  Standard mode and the supplied printing.

## Already covered for this pass

- Camp/Hans and Carnival/Geppetto need no additional photos for these QA fixes.
- Existing Billy/Buddyland Powers, Finales, Buddies, Events and Items can populate
  the Rulebook and Play disclosures directly from their verified catalogs.
- No new Final Girl or personal-item work is included in this checklist.

Keep card edges in frame, avoid glare, and make small result icons readable.
Multiple clear photos are better than one dense overhead shot. There is no need
to resend an entire box to fill a specific gap.

## Release verification, separate from source photos

After compatible functions and the frontend are deployed, verify a signed-in
mixed game: save/reload, one module action, a contextual death, cached reopening,
saved narration and an ending. Automated tests mock the providers; CI and source
photos do not establish live AI/audio quality or deployed compatibility.
