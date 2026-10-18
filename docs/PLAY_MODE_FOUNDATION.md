# Play mode functional foundation

Play begins tracking once on entry (zero saved/killed, round one), resumes saved sessions, and records locally before acknowledging an observation. Existing unknown rounds and legacy group records remain readable. Saved/Killed/Round have independent correction buttons. Corrections target the latest matching record, preserve unrelated moments, and invalidate death scenes whose factual identity changes.

The main trackers and expandable activity history live in one document scroll. Optional death details open in a dismissible modal. Optional health, Horror and Bloodlust values remain unset until the player opts in. Track starts immediately with an editable starting suggestion: Rena 6, Gwynn 5, Billy 8, Hans 12, Laurie 5, Horror 4, Bloodlust 0. Other casts fall back to 5 Final Girl health and 10 Killer health; these are suggestions rather than researched rules. Existing observations, including zero, are never reset. Stopping a tracker makes it unrecorded again. No automatic game-rule effects or win/loss decisions are inferred. Horror zero now survives tracking, result review, generation and statistics.

Moments record immediately and optionally accept detail. Drafts are saved per event in the active session, merge across independent edits, survive reload, and sync through the existing durable session queue. Death details are checked by default, can be disabled for the session, and open automatically in the Gruesome Death modal after the kill is saved. Cancel, the close button, and Escape discard edits back to the latest saved death facts while preserving the recorded kill. Save and exit commits details and closes. Gruesome Death commits details and generates without closing. Cause is presented first and remains optional; switching it clears incompatible attacker, card, and mechanism fields before checkpointing or generation. Details save only through Save and exit or Gruesome Death; finishing flushes any remaining drafts and reads the latest durable game snapshot.

The existing AI scene generator and narration cache remain in use. New mechanism/card facts affect scene signatures. Absent additions are omitted so legacy scene signatures remain valid. Only explicitly selected, applicable cards with researched effects add effect context; unverified names never become inferred rules or additional deaths.

## Research coverage, 2026-10-18

`supabase/functions/_shared/play/catalog.ts` is the app/edge catalog. Each card has a source URL. Effect summaries are factual paraphrases, not transcriptions of official prose. The following counts are unique names, not the number of physical copies in a deck.

| Deck                         |  Names | Effect summaries | Still missing                                |
| ---------------------------- | -----: | ---------------: | -------------------------------------------- |
| Station 2891 Terror          |      8 |                3 | Five effects                                 |
| Station 2891 Events          |     10 |                1 | Nine effects                                 |
| Hans Terror                  |     11 |                1 | Ten effects; copy counts are not represented |
| Camp Happy Trails Terror     |      8 |                3 | Five effects                                 |
| Camp Happy Trails Events     |     10 |                0 | All ten effects                              |
| The Organism Terror          |      1 |                0 | Full inventory and effects                   |
| Maple Lane Events            |      1 |                1 | Remaining deck                               |
| Sunnydaze Mall Events        |      1 |                1 | Remaining deck                               |
| Billy Terror                 |     11 |               11 | Photographed deck covered                    |
| Buddyland Terror             |      8 |                8 | Photographed deck covered                    |
| Buddyland Events             |     10 |               10 | Photographed deck covered                    |
| **Total researched records** | **79** |           **39** | Other decks remain incomplete                |

Existing location catalogs provide additional Event-name suggestions. Their older, unverified descriptions are not promoted to researched effects. Buddyland's October 18 owner photographs now supply verified effects in the shared catalog; see [BUDDYLAND_PLAY.md](BUDDYLAND_PLAY.md). Free-text card names, mechanisms and board spaces work everywhere.

### Sources

- [Station 2891 inventory and named spaces](https://finalgirl.fandom.com/wiki/Station_2891)
- [Hans Terror inventory](https://finalgirl.fandom.com/wiki/Hans_the_Butcher)
- [Camp Happy Trails inventory and named spaces](https://finalgirl.fandom.com/wiki/Camp_Happy_Trails)
- [Published Series 2 rulebook](https://gamers-hq.de/media/pdf/ca/8a/9f/FG_S2_FeatureFilmRules-compressed_2.pdf), printed pp. 11–17: Pair Up, Frostbite, the Organism sample card, and named spaces including the Armory.
- [Taking Souvenirs](https://finalgirl.fandom.com/wiki/Taking_Souvenirs)
- [The generator is out](https://finalgirl.fandom.com/wiki/%22The_generator_is_out.%22)
- [They... just left](https://finalgirl.fandom.com/wiki/%22They..._just_left.%22)
- [We'll be dead by morning](https://finalgirl.fandom.com/wiki/%22We%27ll_be_dead_by_morning.%22)
- [Camp Fire Terror](https://finalgirl.fandom.com/wiki/%22Fire%21%22), [Run for your life](https://finalgirl.fandom.com/wiki/%22Run_for_your_life%21%22), [Rumors](https://finalgirl.fandom.com/wiki/%22Let%27s_go_see_if_the_rumors_are_true%21%22)
- [Maple Lane Fire Event](https://finalgirl.fandom.com/wiki/Fire%21), [Sunnydaze Fire Sale](https://finalgirl.fandom.com/wiki/Fire_Sale%21)
- [Series 2 miniature inventory](https://boardgamegeek.com/boardgameaccessory/407021/final-girl-series-2-alternate-killer-miniatures): Fast, Strong and Tough Organism labels. Selecting one records the player's observation, not a detected active form.
- [Missing Friend](https://finalgirl.fandom.com/wiki/Missing_Friend) explicitly references Horror zero; older app validation incorrectly excluded it.

Several Fandom pages were blocked or had incomplete indexed text. A card title, review, inferred icon, or broad legacy description was not enough to mark a full effect verified.

## Follow-up boundaries

The functional foundation is ready for the UI pass once checks pass. The dedicated mobile pass can refine density, sticky counter placement and one-handed use; the functional tests already exercise small portrait phones, landscape, tablets and desktop.

Module tracking enters through `PlayScreen.moduleControls`, displayed only when populated. Billy and Buddyland now use that extension point. Multiple killer health systems, Exposed Victim/testing state, helicopter progress, and other modules remain follow-up work. No empty placeholder is displayed.

The AI-death pass still needs complete verified card effects, a broader board-space catalog, module-specific cause coverage, and prose/narration evaluation. For the first complete module, Station 2891 plus The Organism needs the missing effects listed above and the remaining Organism Terror cards. Card photos or scans are the most direct way to close gaps.

Deploy the shared edge changes with the frontend: `generate-death-scene`, `narrate-story`, and `generate-ending` consume the updated event validation, fact schema, or zero-Horror request schema. No database migration is required.

## Cinematic Play UI

The dashboard uses the actual session scene, the selected cast portraits, and six compressed atmospheric background plates. Optional module panels share the main surface in two desktop columns and one phone column. The night so far is collapsed initially and opens to the existing undo, restore, and death-detail actions.

Status menus use themed Radix Select controls. Searchable card/space pickers support keyboard selection and custom facts where appropriate. The default Regular victim is stored as an unnamed victim, not a fictional name. Rules explanations and photo provenance remain in the researched data for AI context, without appearing under selected options. The Terror reference, Bloodlust token notes, and manual scene-refresh control have been removed from this surface; existing saved observations are retained.

Deploy `generate-death-scene` and `narrate-story` with this frontend because the shared death-cause validator now accepts `terror`. No database migration is required.

### UI review images

| Surface        | Desktop                                       | Phone                                     |
| -------------- | --------------------------------------------- | ----------------------------------------- |
| Play dashboard | [Desktop](images/play-cinematic-desktop.webp) | [Phone](images/play-cinematic-phone.webp) |
| Gruesome Death | [Desktop](images/gruesome-death-desktop.webp) | [Phone](images/gruesome-death-phone.webp) |
| Death-story payoff | [Desktop](images/gruesome-death-payoff-desktop.webp) | [Phone](images/gruesome-death-payoff-phone.webp) |

## Death-story payoff and control refinements

Nine photographic assets provide Horror/Bloodlust tracker art, the mask banner and six cause tiles. Increment/decrement controls have rounded visible surfaces. Remember this uses all available width, eight distinct icons, and a prominent Record control. Second wind and Back from the dead record the two black Final Health token reversals as separate moment types; they never change tracked health automatically.

The death action works without a selected cause. It immediately displays progress, scrolls the result into view, and renders one or two prose paragraphs between the fields and three primary actions. Errors appear in the same visible result area. Saved takes and narration remain available there. Opening legacy records preserves their signatures until facts change. Token-refresh events for the same user no longer tear down an in-flight request.

The scene prompt asks for a specific 100–150-word miniature horror story with an unsettling turn and memorable final image. It preserves supplied facts, adult-victim safeguards and the ban on em dashes. Generation remains one low-latency Flash call with a 340-token output cap and the existing 20-second provider timeout; it does not generate artwork during play.

Starting-stat evidence: owner photo IMG_9308.jpg for Rena/Gwynn; [photographed Billy board](https://dudetakeyourturn.ca/2026/03/25/cuddle-bears-of-death-final-girl-bad-times-at-buddyland-review/) for 8 Health and 4 Horror; [core rulebook](https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2025/10/Final-Girl-Rules.pdf) for Hans/Laurie and the starting Bloodlust position.

Deploy `generate-death-scene` and `narrate-story` with the frontend so their shared log validator accepts both new moment types. The former also contains the new story prompt and token budget. No database migration is needed.
