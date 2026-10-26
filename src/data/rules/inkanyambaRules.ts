import {
  INKANYAMBA_SOURCE,
  INKANYAMBA_VISUAL,
  INKANYAMBA_POWERS,
  INKANYAMBA_FINALES,
  INKANYAMBA_MINOR_POWERS,
  INKANYAMBA_TERRORS,
  INKANYAMBA_UNLEASH,
  INKANYAMBA_BLOODLUST,
  INKANYAMBA_ATONEMENT,
  INKANYAMBA_PRE_FINALE,
} from "../../../supabase/functions/_shared/play/inkanyamba";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";
const cards = (
  catalog: readonly { name: string; effect: string; quantity?: number }[],
) =>
  [...catalog]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (c) =>
        `${c.name}${c.quantity && c.quantity > 1 ? ` (×${c.quantity})` : ""}: ${c.effect}`,
    );
export const inkanyambaRules: EntityRuleModule = {
  entity: "Inkanyamba",
  kind: "killer",
  filmId: "s1-sacred-groves",
  source: INKANYAMBA_SOURCE,
  credits: {
    design: "Evan Derrick",
    art: "Tumo Mere; Epic Dark Power: Tyler Johnson",
  },
  tags: [
    "inkanyamba",
    "avenger",
    "killer wrath",
    "unleash",
    "atonement",
    "boiling anger",
    "outrageholic",
    "dark power",
    "finale",
  ],
  seeAlso: ["bloodlust", "horror-rolls", "final-health-token"],
  setup: [
    {
      type: "list",
      ordered: true,
      items: [
        "Standard mode: start Inkanyamba at 9 Health and Horror 4, with Bloodlust at the bottom of the board. Follow normal Dark Power and Finale setup; the Epic Dark Power is optional.",
        "Place the Killer Wrath card in the play area and its tracking marker at level 2. Include both Atonement Action cards in the Action Tableau.",
        `Before the Finale: ${INKANYAMBA_PRE_FINALE}`,
        "Killer and Location are independent. Sacred Groves and Divine Wrath do not follow Inkanyamba into another Location.",
      ],
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Killer Wrath" },
    {
      type: "paragraph",
      text: "Killer Wrath is separate from Bloodlust and Divine Wrath. Move its marker by the instructed amount; it cannot fall below 1 or rise above 10. Ignore the portion of an increase or decrease beyond those bounds. Increasing Wrath does not itself Unleash it.",
    },
    { type: "heading", level: 3, text: "Unleash Killer Wrath" },
    {
      type: "paragraph",
      text: "When instructed to Unleash, read the current level and resolve only that row, in its printed order. Health recovery, Horror, targeting, movement and attacks depend on that row. Use current Attack and Movement values for action icons. A row increasing Wrath does not itself instruct another Unleash.",
    },
    {
      type: "list",
      ordered: true,
      items: INKANYAMBA_UNLEASH.map((effect, i) => `Level ${i + 1}: ${effect}`),
    },
    { type: "heading", level: 3, text: "Atonement" },
    { type: "paragraph", text: INKANYAMBA_ATONEMENT },
    {
      type: "callout",
      variant: "note",
      title: "Rounding the reduction",
      text: "At Wrath 5, two successes reduce Wrath by 3, leaving 2. At Wrath 1 it stays at 1. Resolve the chosen track and other effects physically, then record the observed Wrath level in Play.",
    },
    { type: "heading", level: 3, text: "Bloodlust board" },
    {
      type: "list",
      items: INKANYAMBA_BLOODLUST.map(
        (row, i) =>
          `Level ${i}: Attack ${row.attack}, Movement ${row.move}${"darkPower" in row ? "; reveal the Dark Power" : ""}.`,
      ),
    },
    {
      type: "paragraph",
      text: "At the top of the Bloodlust track, the printed overflow instruction discards the next 2 Terror cards. Resolve the physical board; the companion does not draw or discard a digital Terror deck.",
    },
    { type: "heading", level: 3, text: "Dark Powers" },
    { type: "list", items: cards(INKANYAMBA_POWERS) },
    { type: "heading", level: 3, text: "Minor Dark Powers" },
    { type: "list", items: cards(INKANYAMBA_MINOR_POWERS) },
    {
      type: "paragraph",
      text: "Boiling Anger and Outrageholic each have 3 separate Health markers. These are not part of Inkanyamba’s starting 9 Health. Follow core Minor Dark Power damage rules and discard a depleted power. Unknown health is not the same as zero or proof that a power is unrevealed.",
    },
    { type: "heading", level: 3, text: "Finales" },
    { type: "list", items: cards(INKANYAMBA_FINALES) },
    { type: "heading", level: 3, text: "Terror deck" },
    { type: "list", items: cards(INKANYAMBA_TERRORS) },
    {
      type: "callout",
      variant: "note",
      title: "Physical resolution and recorded history",
      text: "Tracker adjustments record the level you choose; they do not resolve chained effects, rolls, damage, movement or casualties. Use active Power reminders while resolving the board. A named card is evidence of a reveal, not that its immediate or conditional effects occurred. The separate We Need a Miracle action records its Wrath change once; reopening or editing the card never applies it again.",
    },
  ],
};
export const INKANYAMBA_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Inkanyamba adopted the legendary monster’s name and is a masked, human-shaped avenger driven by wrath. Use the selected Location, not an assumed Sacred Groves setting. Only recorded events happened. Never infer an Unleash, extra victim, healing or lightning strike from a Wrath level or card reveal alone.",
  visualGuidance: INKANYAMBA_VISUAL,
  rulesSummary:
    "Inkanyamba starts at 9 Health and Horror 4; Killer Wrath starts at 2 and ranges 1–10. Wrath is separate from Bloodlust and location Divine Wrath. Unleash resolves the current printed row only when instructed. Atonement reduces the chosen Wrath. Both Minor Powers have 3 separate Health. Conditional effects depend on revealed Powers and recorded outcomes; Dark Lightning is an Epic Power, not an innate ability. Do not assume a card resolved or invent physical board state.",
};
