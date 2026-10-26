import {
  GROVES_SOURCE,
  GROVES_VISUAL,
  GROVES_UNLEASH,
  GROVES_BLOODLUST,
  GROVES_SETUPS,
  GROVES_EVENTS,
  GROVES_ITEMS,
  GROVES_TERRORS,
  GROVES_FINALE,
  HOLY_MAN_PROVISIONAL,
  grovesSetupDescription,
} from "../../../supabase/functions/_shared/play/groves";
import { INKANYAMBA_ATONEMENT } from "../../../supabase/functions/_shared/play/inkanyamba";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";
const cards = (list: readonly { name: string; effect: string }[]) =>
  [...list]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => `${c.name}: ${c.effect}`);
export const grovesRules: EntityRuleModule = {
  entity: "Sacred Groves",
  kind: "location",
  filmId: "s1-sacred-groves",
  source: GROVES_SOURCE,
  credits: { design: "Evan Derrick", art: "Tumo Mere" },
  tags: [
    "sacred groves",
    "divine wrath",
    "sacred spaces",
    "burial ground",
    "burial grounds",
    "atonement",
    "holy man",
    "tour guide",
    "uber tourist",
    "out of order",
    "fickleness",
    "bloodlust",
    "fire and brimstone",
  ],
  seeAlso: ["bloodlust", "horror-rolls", "saving-victims"],
  setup: [
    {
      type: "list",
      ordered: true,
      items: [
        "Choose any Killer independently. Set Divine Wrath to 2. Put the Sacred Groves Bloodlust strip beside the Killer's board, aligned at the bottom. Set aside the Sacred Groves Finale token until Finale reveal.",
        "Include both identical Atonement Action cards in the Action Tableau, even when the Killer is not Inkanyamba.",
        "Use the chosen Setup diagram below. Form the three normal Item decks at Welcome Center, Lost & Found and Groundskeeper's Shed. Resolve the starting Event on the physical board; record optional choices and die-selected token placements explicitly.",
      ],
    },
    ...GROVES_SETUPS.flatMap((s) => [
      { type: "heading" as const, level: 3 as const, text: s.name },
      { type: "paragraph" as const, text: grovesSetupDescription(s) },
      { type: "groves-setup" as const, setup: s.name },
    ]),
  ],
  rules: [
    { type: "heading", level: 3, text: "Divine Wrath and Sacred spaces" },
    {
      type: "paragraph",
      text: "Divine Wrath ranges from 1 to 10; ignore increases or decreases beyond those bounds. Unleash only when instructed: read the current row and resolve its effects in order. A change in level does not itself Unleash. Burial Ground (also written Burial Grounds on cards), Sacred Shrine and Holy Groves are the three Sacred spaces. Victims there can increase the gods' anger.",
    },
    {
      type: "table",
      headers: ["Level", "Unleash Divine Wrath"],
      rows: GROVES_UNLEASH.map((text, i) => [String(i + 1), text]),
    },
    { type: "heading", level: 3, text: "Bloodlust strip and Finale" },
    {
      type: "paragraph",
      text: "Bloodlust starts at 0. On each increase, apply the matching location line as well as the Killer board's effects. The seven-row strip is bottom aligned; a line above it has no additional printed location effect. At the Killer's maximum, use the physical track's repeated final-effect rules. Viewing this reference or correcting Bloodlust does not execute effects.",
    },
    {
      type: "table",
      headers: ["Bloodlust line", "Additional location instruction"],
      rows: GROVES_BLOODLUST.map((text, i) => [String(i), text]),
    },
    {
      type: "callout",
      variant: "critical",
      title: "Sacred Groves Finale extension",
      text: GROVES_FINALE,
    },
    { type: "heading", level: 3, text: "Atonement" },
    { type: "paragraph", text: INKANYAMBA_ATONEMENT },
    {
      type: "paragraph",
      text: "Use one chosen track per Atonement. In the helper enter final successes after Prayer Book, rerolls and conversions; do not count the same bonus twice. Divine Wrath follows this Location and Killer Wrath follows Inkanyamba. Failed Atonement costs are resolved physically.",
    },
    { type: "heading", level: 3, text: "Events and Special Victims" },
    { type: "list", items: cards(GROVES_EVENTS) },
    {
      type: "callout",
      variant: "note",
      title: "Holy Man without Inkanyamba · provisional",
      text: HOLY_MAN_PROVISIONAL,
    },
    {
      type: "paragraph",
      text: "The Holy Man's ritual removal is not automatically a kill. Setting both Wraths TO 1 differs from reducing them by 1. With Inkanyamba, allocate the ten-point increase before clamping each track; do not redistribute excess. These roles identify existing Victims, not additional people. Changing a role status is a correction; Record outcome resolves an explicitly chosen effect.",
    },
    { type: "heading", level: 3, text: "Location Terror cards" },
    { type: "list", items: cards(GROVES_TERRORS) },
    { type: "heading", level: 3, text: "Items and Out of Order connections" },
    { type: "list", items: cards(GROVES_ITEMS) },
    {
      type: "paragraph",
      text: "Two Out of Order tokens block connections, not Search spaces; following Victims may still pass. Closed blocks Victims entering one Sacred space, even when following, but allows the Final Girl and Enemies. Fire and Brimstone doubles a count; it does not cause automatic fire damage. Token placement, current item possession, card use, damage, Time, movement and victim totals remain separate observations.",
    },
  ],
};
export const GROVES_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Sacred Groves is the selected Location independently of the Killer. Respect explicitly recorded special Victim roles, tokens and Events without creating people, item use, damage or deaths. The Holy Man's ritual removal is not a casualty. Divine Wrath only establishes anger; Fire and Brimstone is a victim-count modifier, not a literal fire. Unleash and Finale references do not establish that instructions occurred.",
  visualGuidance: GROVES_VISUAL,
  rulesSummary:
    "Divine Wrath starts at 2 and ranges 1–10. Three Sacred spaces: Burial Ground, Sacred Shrine, Holy Groves. Both Atonements are included with any Killer. Location Bloodlust strip adds printed effects; after a revealed Finale's Killer Action, Unleash Divine Wrath then increase it 1. Closed blocks Victims entering one Sacred space; Out of Order signs block connections with a following exception. Fire and Brimstone doubles its site's victim count; Hallowed Ground grants Time at Action-phase end. Only explicit records establish outcomes.",
};
