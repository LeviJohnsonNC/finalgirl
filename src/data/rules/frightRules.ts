import {
  FRIGHT_SOURCE,
  FRIGHT_VISUAL,
  FRIGHT_POWERS,
  FRIGHT_FINALES,
  FRIGHT_STARTING_ACTION,
  FRIGHT_MINOR_POWERS,
  FRIGHT_TERRORS,
} from "../../../supabase/functions/_shared/play/fright";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";
export const frightRules: EntityRuleModule = {
  entity: "Dr. Fright",
  kind: "killer",
  filmId: "s1-maple-lane",
  source: FRIGHT_SOURCE,
  credits: { design: "A.J. Porfirio", art: "Roland MacDonald" },
  tags: [
    "dr fright",
    "doctor fright",
    "dream doctor",
    "awake",
    "asleep",
    "boiler room",
    "nightmare",
    "pitchfork",
    "final health",
  ],
  seeAlso: ["final-health-token", "killer-phase", "bloodlust"],
  setup: [
    {
      type: "list",
      ordered: true,
      items: [
        "Standard mode: Dr. Fright starts with 9 Health and Horror 4. Follow the printed Bloodlust track and normal game setup. Location setup is independent.",
        "Shuffle the four Boiler Room cards facedown. Place the Awake/Asleep card on top with Awake showing. The Final Girl begins Awake.",
        "For digital cards, explicitly prepare a fresh deck in Dr. Fright’s Play panel. Older games retain an unknown sleep state until recorded; do not reconstruct a partly revealed physical deck by shuffling a new digital one.",
      ],
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Starting Killer Action" },
    { type: "paragraph", text: FRIGHT_STARTING_ACTION },
    { type: "heading", level: 3, text: "Awake and Asleep" },
    {
      type: "list",
      items: [
        "Awake: move, Search and save Victims normally. Dr. Fright cannot attack the Final Girl, and she cannot attack him, unless an applicable card changes this. The Frightmare Is Inevitable permits his attacks while Awake; it does not permit her attacks.",
        "Awake targeting: a Killer Action targeting the closest Final Girl or Victim targets a Victim instead, unless an effect permits attacking her. When an Action targets the Final Girl alone, he still moves toward her but cannot attack her; he attacks a Victim in the space where his movement ends if one is there.",
        "Resolve Short Rest or Long Rest normally; regardless of its result, the Final Girl falls Asleep. Other verified game effects can also make her fall Asleep. Physically, move the Awake/Asleep card to the bottom without flipping it, then flip the whole deck so Asleep is on top.",
        "Asleep: the Final Girl may move, Search and attack normally. Dr. Fright resolves normal Killer Actions and can attack her. Victims will not follow her, and she cannot save them. The dream does not physically move Dr. Fright or ordinary Victims to another board space.",
      ],
    },
    { type: "heading", level: 3, text: "The Boiler Room" },
    {
      type: "list",
      items: [
        "While Asleep, resolve as many Boiler Room cards as desired during the Action phase, including none. Resolve exactly one at the end of the Killer phase unless a game effect changes this.",
        "Slide the cover and already exposed stack up, down, left or right, keeping the unresolved cards underneath. Reveal a half, or sometimes a quarter, of the next unresolved card. A direction must expose part of that card and extend the previously revealed stack. Never expose later cards accidentally.",
        "If Dr. Fright is visible on the newly revealed card, resolve target Final Girl, then attack, regardless of his board position. Defend normally. The reveal itself does not establish damage, Health loss or a casualty.",
        "Each of the four Boiler Room cards places him in a different quadrant. Previously exposed portions supply information for later choices. Resolve all four cards to exit, wake up, and immediately shuffle them facedown with Awake on top. Face Your Fright and an active Endless Sleep change the wake-up rule. In the digital tracker, a safe fourth reveal waits for your explicit Awake acknowledgment.",
        "At the top Bloodlust effect: if Asleep, reset the Boiler Room deck; otherwise fall Asleep. Record that effect explicitly. Reaching a tracked round number does not itself reset or resolve cards.",
      ],
    },
    {
      type: "example",
      title: "Printed four-card example",
      text: "Slide Up, then Up: both lower halves are empty. Slide Left: the right half reveals Dr. Fright and he attacks. Resolve that attack. Slide Down: only the top-right quarter of the final card is visible and it is empty. The Final Girl exits and wakes, then shuffles the deck. The digital geometry reproduces this sequence.",
    },
    { type: "heading", level: 3, text: "Dark Powers" },
    {
      type: "list",
      items: FRIGHT_POWERS.map(
        (c) => `${c.name}${"epic" in c ? " (Epic)" : ""}: ${c.effect}`,
      ),
    },
    { type: "heading", level: 3, text: "Minor Dark Powers" },
    {
      type: "list",
      items: FRIGHT_MINOR_POWERS.map(
        (c) => `${c.name} (${c.health} Health): ${c.effect}`,
      ),
    },
    {
      type: "paragraph",
      text: "Damage Minor Dark Powers before Dr. Fright, following the core rules. Remove a power when its final Health is lost. Removing Endless Sleep permits waking only if Face Your Fright is not active; removal does not itself wake you. The Play controls record Health separately from Dr. Fright's Health.",
    },
    { type: "heading", level: 3, text: "Terror cards" },
    {
      type: "list",
      items: FRIGHT_TERRORS.filter(
        (c) => !FRIGHT_MINOR_POWERS.some((p) => p.id === c.id),
      ).map((c) => `${c.name}: ${c.effect}`),
    },
    {
      type: "paragraph",
      text: "Resolve each card from top to bottom, including its conditional instructions and each separate Killer Action. Track temporary effects explicitly in Play and end them at their printed timing. Reading or selecting a reference does not resolve its actions, change victim totals, apply damage, establish an Item's possession or use, or move physical pieces.",
    },
    { type: "heading", level: 3, text: "Finales" },
    {
      type: "list",
      items: FRIGHT_FINALES.map((c) => `${c.name}: ${c.effect}`),
    },
    {
      type: "callout",
      variant: "note",
      title: "Reference coverage",
      text: "Verified against the owner’s standard board, special rules, four Boiler Room faces, three regular Powers, one Epic Power, three Finales and all sixteen Terror cards (including both Minor Dark Powers). Starting Killer Action confirmed directly by the owner: target Final Girl/Victim, then attack, without moving. Maple Lane has its own separate Location module.",
    },
  ],
};
export const FRIGHT_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Dr. Fright is the supernatural Dream Doctor. Use the selected Location, not an automatic Maple Lane backdrop. Follow only recorded Awake/Asleep facts; unknown is not Awake. The tracked Boiler Room sequence belongs to the Final Girl. Ordinary Victims may experience private nightmares while remaining physically at the selected Location; her sleep status is not theirs. An attack pending defense is not evidence of injury. Apply recorded card exceptions, never unrecorded effects or casualties.",
  visualGuidance: FRIGHT_VISUAL,
  rulesSummary: [
    "Standard Dr. Fright: 9 Health, Horror 4; starts Awake. Awake normally prevents mutual attacks. Asleep permits combat, but Victims cannot follow or be saved. Boiler Room attacks target only the Final Girl from any board position; defense and damage are separate. Clear four cards to wake and shuffle, except forced sleep. Apply card effects only when recorded.",
    FRIGHT_STARTING_ACTION,
    "Pitchfork Assault: +1 Horror whenever he damages the Final Girl. The Frightmare Is Inevitable: he may attack her while Awake, but she cannot attack him. Never Really Dead: replace his black Final Health token with white on reveal; when last Health is lost, reveal three reserve black tokens and restore accordingly. Shock Factor (Epic): panic kills Victims instead, maximum three per turn.",
    "Face Your Fright: fall Asleep on reveal, remain Asleep, immediately reset on each exit; action targets closest Final Girl/Victim, moves, attacks. Time to Die: Awake during Upkeep costs two Health then sleep; action targets Final Girl, moves, attacks twice. Everyone Must Die: remove him onto Finale; she may attack him from any space while Asleep; action kills two chosen Victims, or costs her four Health if none remain.",
    "Hellish Pursuit (2 separate Health): while Asleep, one additional Boiler Room reveal at Killer-phase end if able. Endless Sleep (1 separate Health): fall Asleep on reveal, remain Asleep and reset after each exit while active. Removing it does not wake her or override Face Your Fright. Blurred Reality permits mutual Awake damage only until next Killer phase when explicitly active.",
  ].join("\n"),
};
