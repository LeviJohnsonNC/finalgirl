# Current module interaction alignment

Billy/Buddyland, Hans/Camp Happy Trails and Geppetto/Carnival of Blood share character, ongoing-Event, card-reveal and Minor Dark Power controls. Physical board resolution remains manual.

## Player behavior

- A special-character portrait adds an unrecorded character. A recorded portrait opens Change status. Saved/Killed (or a companion's legal outcome) is explicit; reversing an outcome requires Change status. Character observations do not increment victim totals.
- Ongoing Events activate from artwork. Active/ended artwork opens details; End effect is explicit. Clearing a record is a correction, not physical removal or reversal of lasting effects. Carnival's linked changes remain atomic.
- Dark Power/Finale choices share illustrated presentation between Remember This and each killer panel. There is one permanent reveal per type; choosing a different card edits its detail. Unknown card names remain supported. Hans's second power stays distinct and cannot duplicate his first.
- All six Minor Dark Powers use numeric two-heart controls. A filled/empty heart removes/restores exactly one health. Change status permits directly recording the actual 0/1/2 health or clearing the observation. Billy's Renewable Energy and Backup Generator use existing `power.*` fields; older reveals never imply full health.
- Puppets remain reusable Ready/on-board/Exhausted tokens; Buddies retain their streamlined lifecycle; batteries stay binary; permanent Carnival traps stay placed until an explicit correction. No shared character control offers illegal Werewolf outcomes.

## Persistence and compatibility

New Billy casts carry `billySetupVersion: 1`. Their standard four-on/one-set-aside sources are written atomically with the first Play observation. Component mount, panel expansion, reload and older empty-log games never seed Billy sources. Existing saved source values and detailed legacy observations remain readable. Setup provenance stays out of narrative/death context.

Shared recording rejects duplicate stale-render payloads, permits unrelated observations, and permits retry after a failed durable write. The active-game boundary also enforces permanent-reveal uniqueness across entry points. Existing event names/fields are retained; no database migration, dependency, secret or new validator field is introduced.

## Verification

`module-consistency.spec.ts` exercises all nine supported killer/location combinations on both device projects, including explicit outcomes/corrections, one reveal shared across entry points, hearts, reload, Undo, separate victim totals, 44px targets and 1366/390/320px overflow checks. Existing Buddyland, Camp, Geppetto and Carnival journeys cover legacy recovery, failed writes, offline recovery, starting Events, historical deaths and module-specific rules. Inspect the resulting artwork screenshots; a passing DOM check is not a visual-quality review.

Expanded Play content may scroll vertically. Do not shrink controls or clip content to force every open section into one viewport. Preserve compact collapsed panels and fixed control order.
