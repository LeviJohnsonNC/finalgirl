import {
  FRIGHT_SOURCE,
  FRIGHT_VISUAL,
  FRIGHT_POWERS,
  FRIGHT_FINALES,
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
        "Each of the four Boiler Room cards places him in a different quadrant. Previously exposed portions supply information for later choices. Resolve all four cards to exit, wake up, and immediately shuffle them facedown with Awake on top. Face Your Fright changes the wake-up rule.",
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
    { type: "heading", level: 3, text: "Finales" },
    {
      type: "list",
      items: FRIGHT_FINALES.map((c) => `${c.name}: ${c.effect}`),
    },
    {
      type: "callout",
      variant: "note",
      title: "Reference coverage",
      text: "The owner supplied the special rules, standard board, four Boiler Room faces, three regular Powers, one Epic Power and three Finales. The sixteen-card Terror deck, two Minor Dark Power faces and uncovered pre-Finale action strip have not yet been supplied. Their missing text is not inferred. Maple Lane’s Location module is a separate import.",
    },
  ],
};
export const FRIGHT_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Dr. Fright is the supernatural Dream Doctor. Use the selected Location, not an automatic Maple Lane backdrop. Follow only recorded Awake/Asleep facts; unknown is not Awake. Dreams do not place ordinary Victims in the Boiler Room. An attack pending defense is not evidence of injury. Apply recorded card exceptions, never unrecorded effects or casualties.",
  visualGuidance: FRIGHT_VISUAL,
  rulesSummary: [
    "Standard Dr. Fright: 9 Health, Horror 4. Start Awake. Awake normally prevents attacks between him and the Final Girl. Asleep permits normal combat, but Victims cannot follow or be saved. Boiler Room reveals can trigger an attack from anywhere; resolve physical defense separately. Clear all four to wake and shuffle unless Face Your Fright keeps her Asleep. Catalog reference only; apply cards only when recorded.",
    ...FRIGHT_POWERS.map((c) => `${c.name}: ${c.effect}`),
    ...FRIGHT_FINALES.map((c) => `${c.name}: ${c.effect}`),
  ].join("\n"),
};
