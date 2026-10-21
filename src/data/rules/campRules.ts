import {
  HANS_VISUAL,
  CAMP_EVENTS,
  CAMP_ITEMS,
  CAMP_SETUPS,
  CAMP_TERRORS,
  HANS_FINALES,
  HANS_MINOR_POWERS,
  HANS_POWERS,
  HANS_TERRORS,
} from "../../../supabase/functions/_shared/play/camp";
export { HANS_VISUAL } from "../../../supabase/functions/_shared/play/camp";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";

const source = "Owner photos IMG_9319–IMG_9325; Final Girl Core Rulebook";
const entries = (cards: readonly { name: string; effect: string }[]) =>
  [...cards]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => `${c.name}: ${c.effect}`);
export const hansRules: EntityRuleModule = {
  entity: "Hans",
  kind: "killer",
  filmId: "s1-camp-happy-trails",
  source,
  tags: [
    "hans",
    "butcher",
    "dark power",
    "minor dark power",
    "finale",
    "bloodlust",
  ],
  setup: [
    {
      type: "paragraph",
      text: "Hans starts with 12 Health and Horror 4. Bloodlust starts at the bottom of his track. Choose the Killer’s facedown Dark Power and Finale using the normal setup rules. The facedown Finale’s initial Killer Action targets the Final Girl and moves.",
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Dark Powers" },
    { type: "list", items: entries(HANS_POWERS) },
    { type: "heading", level: 3, text: "Finales" },
    { type: "list", items: entries(HANS_FINALES) },
    { type: "heading", level: 3, text: "Minor Dark Powers" },
    { type: "list", items: entries(HANS_MINOR_POWERS) },
    {
      type: "paragraph",
      text: "Minor Dark Power Health is separate from Hans’s general Health. Remove it before damaging his general Health; discard the Minor Dark Power when its Health is gone. The number of remaining markers determines its bonus. Follow the core rules when the main Dark Power is revealed.",
    },
    { type: "heading", level: 3, text: "Terror cards" },
    { type: "list", items: entries(HANS_TERRORS) },
    {
      type: "callout",
      variant: "note",
      title: "Bloodlust",
      text: "Use the printed track for the current Attack and Movement values and threshold effects. At the top, further Bloodlust heals Hans and discards the next Terror card. Tracking counters in the app does not resolve these effects.",
    },
  ],
};
export const campRules: EntityRuleModule = {
  entity: "Camp Happy Trails",
  kind: "location",
  filmId: "s1-camp-happy-trails",
  source,
  tags: ["camp happy trails", "location", "items"],
  setup: [
    {
      type: "paragraph",
      text: "Use the selected Setup card for exact placements, prepare the three Item decks at Cabins, Dock and Utility Shed, then resolve the starting Event. Apply the selected Killer’s setup independently.",
    },
    {
      type: "list",
      items: CAMP_SETUPS.map((c) => `${c.name}: ${c.description}`),
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Camp spaces" },
    {
      type: "paragraph",
      text: "Named spaces are Cabins, Cliff, Dock, Firepit, Lake, Makeout Point and Utility Shed. Paths, exits and panic connections follow the printed board. Being visually close across the water does not make two spaces adjacent.",
    },
    { type: "heading", level: 3, text: "Events" },
    { type: "list", items: entries(CAMP_EVENTS) },
    { type: "heading", level: 3, text: "Location Terror cards" },
    { type: "list", items: entries(CAMP_TERRORS) },
    { type: "heading", level: 3, text: "Items" },
    { type: "list", items: entries(CAMP_ITEMS) },
    {
      type: "callout",
      variant: "note",
      title: "Independent modules",
      text: "These Events, Items and spaces follow Camp Happy Trails with any Killer. Hans’s Dark Powers and Killer board do not apply simply because the game is set at Camp.",
    },
  ],
};
export const HANS_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Hans is a patient, physically overwhelming butcher with a metal pig mask and sledgehammer. Use only recorded powers, Finale and revival observations; do not invent supernatural abilities from card titles or assume he resurrected. Hans can stalk any selected Location.",
  visualGuidance: HANS_VISUAL,
  rulesSummary: [
    "Hans starts at 12 Health and Horror 4. Minor Dark Powers have separate Health, not extra base Health. Catalog reference only: apply powers and Finales only if recorded; a reveal does not prove every effect happened.",
    ...entries(HANS_POWERS),
    ...entries(HANS_FINALES),
  ].join("\n"),
};
export const CAMP_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Camp Happy Trails is a secluded lakeside summer camp, with cabins, a dock, utility shed, firepit, cliff and Makeout Point linked by forest paths around the lake. Follow the selected Setup and starting Event. Boyfriend, Girlfriend and The Damned appear only when established. Dark Waters is lethal to Victims only if its Event is established; the lake is not inherently lethal. Keep the selected Killer and Final Girl.",
  visualGuidance:
    "A modest weathered wooden summer camp around a pine-fringed lake, amber cabin windows, rustic dock, utility shed, dirt paths, a firepit and an old car at Makeout Point. Lifelike physical materials, cool pine shadows and warm practical lights. Preserve selected killer identity; do not insert Hans into other killers’ games.",
  rulesSummary:
    "Cabins, Dock and Utility Shed are Search spaces. Secret Tunnel joins two selected Search spaces for the Final Girl, not Enemies. Dark Waters kills Victims at or entering the Lake. Event roles and hazards require evidence. Card effects never justify inventing unrecorded kills, rescues, injuries or expended Items. Boyfriend: his death in the Final Girl’s space grants 12 Time next Action phase. Girlfriend: follows into the Killer’s space; sharing the Final Girl’s space grants an extra die, but her death there raises Horror by five. The Damned: priority Killer target, can only be saved as the last Victim. Star Crossed Lovers: when exactly two Victims share a space, one death kills the other too; only recorded deaths happened.",
};
