import {
  WOLF, WOLF_SOURCE, WOLF_SETUP, WOLF_VISUAL, WOLF_STARTING_ACTION,
  WOLF_TIMING, WOLF_BLOODLUST, WOLF_OVERFLOW, WOLF_POWERS,
  WOLF_MINORS, WOLF_FINALES, WOLF_TERRORS,
} from "@/lib/play/bigBadWolf";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";

function describeCards(cards: readonly { name: string; effect: string; quantity?: number; health?: number }[]) {
  return cards.map(card => `${card.name}${card.quantity && card.quantity > 1 ? ` (×${card.quantity})` : ""}${card.health ? ` (${card.health} Health)` : ""} — ${card.effect}`);
}

export const bigBadWolfRules: EntityRuleModule = {
  entity: WOLF,
  kind: "killer",
  filmId: "s2-once-upon-full-moon",
  source: WOLF_SOURCE,
  credits: { design: "Julie Ahern", art: "Tyler Johnson" },
  tags: ["big bad wolf", "wolf", "track", "slay", "killer"],
  setup: [{
    type: "paragraph",
    text: `Start in Track with ${WOLF_SETUP.killerHealth} Killer Health, Horror ${WOLF_SETUP.finalHorrorLevel} and Bloodlust ${WOLF_SETUP.bloodlust}. Follow normal setup otherwise.`,
  }],
  rules: [
    { type: "heading", level: 3, text: "Track and Slay" },
    { type: "paragraph", text: "The Wolf starts in Track. Revealing a regular Dark Power changes it to Slay. A Killing Machine, its Epic Dark Power, applies both modes." },
    { type: "paragraph", text: WOLF_TIMING },
    { type: "heading", level: 3, text: "Starting Killer Action" },
    { type: "paragraph", text: WOLF_STARTING_ACTION },
    { type: "heading", level: 3, text: "Bloodlust" },
    { type: "list", items: WOLF_BLOODLUST.map(({ attack, move, entry }, position) => `${position} — Attack ${attack}, Move ${move}${entry ? ` · ${entry}` : ""}`) },
    { type: "paragraph", text: WOLF_OVERFLOW },
    { type: "heading", level: 3, text: "Minor Dark Powers" },
    { type: "list", items: describeCards(WOLF_MINORS) },
    { type: "heading", level: 3, text: "Dark Powers" },
    { type: "list", items: describeCards(WOLF_POWERS) },
    { type: "heading", level: 3, text: "Finales" },
    { type: "list", items: describeCards(WOLF_FINALES) },
    { type: "heading", level: 3, text: "Terror cards" },
    { type: "list", items: describeCards(WOLF_TERRORS) },
  ],
};

export const WOLF_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance: "A patient, predatory fairy-tale Wolf that can shift from stalking to attacking. Follow the selected Location and recorded actions. Mode, a named reveal and arrow-studded appearance alone establish no attack, injury, healing, casualty or lost Item.",
  visualGuidance: WOLF_VISUAL,
  rulesSummary: "The Wolf starts in Track, changes to Slay after a regular Dark Power, and uses both with A Killing Machine. Terror mode branches use the Killer phase's starting mode. Resolve physical cards separately from recorded observations.",
};
