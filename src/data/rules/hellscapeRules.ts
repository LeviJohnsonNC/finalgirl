import {
  HELLSCAPE, HELLSCAPE_EVENTS, HELLSCAPE_ITEMS, HELLSCAPE_SETUP, HELLSCAPE_SETUPS,
  HELLSCAPE_SOURCE, HELLSCAPE_SPACES, HELLSCAPE_TERRORS, HELLSCAPE_VISUAL, HELLSHIFT,
} from "../../../supabase/functions/_shared/play/hellscape";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";
import type { RuleBlock } from "./types";

function cardTable(label: string, cards: readonly { name: string; effect: string }[]): RuleBlock {
  return {type: "table", modalLayout: "records", headers: [label, "Effect"], rows: cards.map(card => [card.name, card.effect])};
}

export const hellscapeRules: EntityRuleModule = {
  entity: HELLSCAPE,
  kind: "location",
  filmId: "s3-hell-to-pay",
  source: HELLSCAPE_SOURCE,
  credits: {design: "Ryan Jorjorian", art: "Roland MacDonald"},
  tags: [
    "Hell to Pay", "tile symbols", "flip", "swap", "shift", "rearrange", "walls", "adjacency",
    "Special Victims", "Bone Chariot", "Hellshift", ...HELLSCAPE_SPACES,
    ...[...HELLSCAPE_SETUPS, ...HELLSCAPE_EVENTS, ...HELLSCAPE_TERRORS, ...HELLSCAPE_ITEMS].map(card => card.name),
  ],
  seeAlso: ["special-victims", "panic", "killer-action"],
  setup: [
    {type: "list", ordered: true, items: [...HELLSCAPE_SETUP]},
    {type: "paragraph", text: "Read left and right with the Hellscape title at the top of the location board. Each corner has an outer space and an approach. The placements below add to the eight tile Victims."},
    {type: "table", modalLayout: "placements", headers: ["Setup", "Final Girl", "Killer", "Additional Victims"],
      rows: HELLSCAPE_SETUPS.map(card => [card.name, card.girl, card.killer, card.victims.map(([count, space]) => `${space} × ${count}`).join("; ")])},
  ],
  rules: [
    {type: "heading", level: 3, text: "Hellscape dice in Upkeep"},
    {type: "paragraph", text: "Roll both Hellscape dice once in Upkeep. The two symbols determine what changes on the physical board."},
    {type: "hellscape-upkeep"},
    {type: "paragraph", text: "Look for the star, square-with-dot, striped tile and wheel symbols. When a card asks you to roll the Hellscape dice for another effect, follow that card’s instructions."},
    {type: "heading", level: 3, text: "Shift and rearrange"},
    {type: "list", items: [
      "To shift, slide every tile one slot in the indicated clockwise or counterclockwise direction. Keep the orientation and the visible face.",
      "To rearrange, put the four tiles in any order. Keep their current faces and orientation.",
      "Pieces and tokens travel with a tile when it changes slots.",
    ]},
    {type: "heading", level: 3, text: "Walls, Panic and placement"},
    {type: "list", items: [
      "A wall or disconnected edge blocks movement and range. A figure that Panics toward a blocked route stays put.",
      "Measure range along connected spaces. If a Killer Action can’t reach its target, the Killer stays put and resolves the attack icons in its own space.",
      "For closest or farthest effects, consider reachable Victims first. If all candidates are unreachable, ignore blocking Hellscape tile walls and use your judgment. Apply the same check for effects that look for a specific space or object, such as the nearest Exit.",
      "When a card says to place a figure in a space, walls do not prevent that placement. Choose the destination as directed by the effect.",
    ]},
    {type: "heading", level: 3, text: "Hellshift"},
    {type: "paragraph", text: `Starts in the tableau and costs ${HELLSHIFT.cost} Time to buy.`},
    {type: "table", modalLayout: "records", headers: ["Roll result", "Effect"], rows: HELLSHIFT.outcomes.map(row => [...row])},
    {type: "heading", level: 3, text: "The Nexus and Search spaces"},
    {type: "list", items: [
      "The Nexus starts as both an Exit and a Search space. The House of Mutilation and the Sepulchre of Blood are Search spaces. The top-right and bottom-left corners have the remaining Exits.",
      "In Terror From Above, redraw the Peon, Wretch and Seeker Events because they use the vignette’s Special Victim meeples.",
    ]},
    {type: "heading", level: 3, text: "Events"},
    {type: "paragraph", text: "Record a Special Victim after applying its Event on the board. If an Event can’t apply because there are no Victims, ignore it according to the core Event rules."},
    cardTable("Event", HELLSCAPE_EVENTS),
    {type: "heading", level: 3, text: "Terror cards"},
    cardTable("Terror", HELLSCAPE_TERRORS),
    {type: "heading", level: 3, text: "Items"},
    cardTable("Item", HELLSCAPE_ITEMS),
  ],
};

export const HELLSCAPE_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance: "Hellscape is the location and works with the selected Killer. Name a specific room only when supported. Use confirmed Peon, Wretch or Seeker outcomes when present. Their Event cards describe possible effects, so apply no unrecorded reward, damage or casualty.",
  visualGuidance: HELLSCAPE_VISUAL,
  rulesSummary: "Hellscape tiles shift, swap or flip on the physical board. Walls block movement and range. Placement can bypass walls after picking a legal target. The Nexus starts as an Exit and Search space. Keep the current layout and effects unspecified unless the player records them.",
};
