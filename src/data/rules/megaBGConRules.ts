import { BOOTHS, BOOTH_EVENTS, CON_EVENTS, CON_ITEMS, CON_SETUPS, CON_SPACES, CON_TERRORS, CON_VISUAL, MEGABGCON, MEGABGCON_SOURCE } from "../../../supabase/functions/_shared/play/megabgconCatalog";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";
import type { RuleBlock } from "./types";

function cardTable(heading: string, cards: readonly { name: string; effect: string; copies?: number }[]): RuleBlock {
  return { type: "table", headers: [heading, "Copies", "Effect"], rows: cards.map(c => [c.name, String(c.copies ?? 1), c.effect]) };
}

export const megaBgCon: EntityRuleModule = {
  entity: MEGABGCON, kind: "location", filmId: "s4-shriek", source: MEGABGCON_SOURCE,
  credits: { design: "A.J. Porfirio", art: "Tyler Johnson and Agnieszka Dabrowiecka" },
  seeAlso: ["Mort the Teenage Dirtbag"],
  tags: ["Create a Panic", "search", "Booths", "Booth Events", "Finale Reminder", ...CON_SETUPS, ...CON_SPACES,
    ...[...BOOTHS.map(name => ({ name })), ...CON_EVENTS, ...BOOTH_EVENTS, ...CON_TERRORS, ...CON_ITEMS].map(card => card.name)],
  setup: [
    { type: "list", items: [
      "Use the chosen Setup card for physical placements. The five setups are First Day, Family Day, Busiest Day, Last Day and Mega Events.",
      "Shuffle the 12 Booths and 10 Booth Events into two separate face-down decks.",
      "Add both Create a Panic cards to the Action Tableau. Put the Finale Reminder under the Finale card with the reminder side facing up.",
    ] },
  ],
  rules: [
    { type: "heading", level: 3, text: "Exhibit Areas, Food Court and General Areas" },
    { type: "paragraph", text: "The 12 marked vendor spaces are Exhibit Areas. The Food Court is its own area. All remaining spaces are General Areas, including the halls, docks, Event Hall and Tarmac. A successful Search works anywhere and draws from the deck for that area. Every space counts as a Search space for other effects." },
    { type: "paragraph", text: "Victims won’t willingly follow from an Exhibit Area into a General Area. Panic can send them across. Lunch Time! and the Convention Staff Badge allow following out of Exhibit Areas. Apply any additional restrictions on the specific Victim or card." },
    { type: "heading", level: 3, text: "Create a Panic and rapid routes" },
    { type: "paragraph", text: "Play Create a Panic while sharing a space with at least one Victim. Two successes let you choose a direction for each Victim. With one success, you may modify each Panic roll by one. On a failure, use standard Panic rolls. Apply the printed Time cost. During the Action phase you may discard any Action card to take Create a Panic into your hand." },
    { type: "paragraph", text: "Roll two dice for Panic direction from the Main Hallway. Marked hallway and dock links give one extra die when resolving the movement Action card, provided your first move crosses that marked link to the adjacent space." },
    { type: "heading", level: 3, text: "Booth draws and the Finale" },
    { type: "paragraph", text: "Each Upkeep, draw a Booth and roll. On 1–3 place a regular Victim there. On 4–6 draw a Booth Event and apply it there. Discard the Booth after resolving it. Reshuffle used Booths when another draw is needed and the deck is empty. Follow each Booth Event’s own discard or ongoing instructions." },
    { type: "paragraph", text: "When a card draws a Booth solely to locate its effect, use that space without rolling. At the Finale, flip the Finale Reminder onto the Booth deck and stop routine Upkeep draws. Ongoing effects follow their own end conditions." },
    { type: "paragraph", text: "While Mort is disguised, draw one Suspect token for a Location card that calls for a Killer action or effect. Use that Active Killer for all applicable effects on the card. Discard a ruled-out token and skip the Killer effects. Panic caused by a card still resolves during the investigation." },
    { type: "paragraph", text: `Booth cards identify these spaces: ${BOOTHS.join(", ")}.` },
    cardTable("Booth Event", BOOTH_EVENTS), cardTable("Event", CON_EVENTS), cardTable("Terror", CON_TERRORS), cardTable("Item", CON_ITEMS),
  ],
};

export const MEGABGCON_PROMPT_CONTEXT: ModulePromptContext = {
  visualGuidance: CON_VISUAL,
  rulesSummary: "Exhibit crowds usually resist leaving for General Areas. Every space can be searched using its area's deck. Booth arrivals and Booth Events happen during Upkeep until the selected Killer's Finale.",
  narrativeGuidance: "Use the gaming convention chosen in the session with its selected cast. A Booth draw, Special Victim, Event or prop is evidence only when recorded. Keep sealed SWAG contents and Mort's disguise unknown until confirmed.",
};
