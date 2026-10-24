import {
  MAPLE_SOURCE,
  MAPLE_VISUAL,
  MAPLE_EVENTS,
  MAPLE_TERRORS,
  MAPLE_ITEMS,
} from "../../../supabase/functions/_shared/play/maple";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";
const cards = (list: readonly { name: string; effect: string }[]) =>
  [...list]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => `${c.name}: ${c.effect}`);
export const mapleRules: EntityRuleModule = {
  entity: "Maple Lane",
  kind: "location",
  filmId: "s1-maple-lane",
  source: MAPLE_SOURCE,
  credits: {
    design: "A.J. Porfirio",
    art: "Roland MacDonald; additional Item art Tumo Mere",
  },
  tags: [
    "maple lane",
    "convince",
    "houses",
    "quadrants",
    "roadblocks",
    "boyfriend",
    "smalleys",
    "officer kopp",
    "fireworks",
    "booby trap",
    "bicycle",
  ],
  seeAlso: ["movement", "searching", "horror-rolls", "saving-victims"],
  setup: [
    {
      type: "list",
      ordered: true,
      items: [
        "Choose Block Party, Playtime, A Quiet Place, Maple Lane or Revenge and place figures using its printed diagram. The Killer and Location are selected independently.",
        "Form four Item decks of three cards, one for each quadrant (NW, SW, NE, SE). Reveal each deck’s top card as normal.",
        "Include both Convince Action cards in the Action Tableau. Draw the starting Event and resolve its physical instructions; record any required roll or placement explicitly.",
      ],
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Street spaces and four quadrants" },
    {
      type: "paragraph",
      text: "Ordinary Street spaces, the four green Exits and the Intersection all count as Streets. Twelve Houses occupy four quadrants, three per quadrant. The Boyfriend’s House is northeast; the Smalley’s House is southwest. Positional labels for the other houses are navigation aids, not official family names.",
    },
    { type: "heading", level: 3, text: "Searching Houses" },
    {
      type: "paragraph",
      text: "Every House is a Search space. After a successful Search, draw from that House’s quadrant deck and mark that House with an X; it cannot be searched again. If multiple Items are drawn, choose what to keep and return the other to the top faceup or bottom facedown as normal. If an Item must be added to a fully searched quadrant, add it to the closest quadrant with an unsearched House.",
    },
    { type: "heading", level: 3, text: "Convince and occupied Houses" },
    {
      type: "paragraph",
      text: "A House containing at least one Victim is occupied. You cannot enter it with Walk, Sprint or other normal movement. From its adjacent Street, successfully use Convince to enter. Convince is only for entering occupied Houses. Leave any House with normal movement; unoccupied Houses can be entered normally. Enemies and panicking Victims are not restricted. Convince has a separate result for three or more successes.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Use the physical Convince cards",
      text: "The supplied sheet verifies the entry rules, but the two Action-card outcome faces were not supplied. Use their printed success, failure and Time results. Friendly Neighbors and Bible add dice, not automatic successes.",
    },
    {
      type: "heading",
      level: 3,
      text: "Events, Special Victims and the Cop Car",
    },
    { type: "list", items: cards(MAPLE_EVENTS) },
    {
      type: "callout",
      variant: "critical",
      title: "Persistent effects stay separate",
      text: "A Roadblock prevents rescue at its Exit; it does not prohibit movement. A burning House cannot be entered or searched. Neither fire nor a Booby Trap means the House has been searched. The Smalleys are two separate Special Victims; their additional Bloodlust is separate from the normal death increase. Boyfriend’s Upkeep penalty is two Time, not Health.",
    },
    { type: "heading", level: 3, text: "Location Terror cards" },
    { type: "list", items: cards(MAPLE_TERRORS) },
    { type: "heading", level: 3, text: "Items and placed props" },
    { type: "list", items: cards(MAPLE_ITEMS) },
    {
      type: "paragraph",
      text: "The sixteen Item cards include three Crucifixes. Keep inventory, charges, movement, dice and once-per-turn limits on the physical cards. Finding an Item does not record using it. Fireworks and Bicycle stay on Streets; Booby Traps go in Houses, at most one per House. Physical token quantities by type were not supplied, so there is no simulated token supply.",
    },
  ],
};
export const MAPLE_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Maple Lane is the selected Location, independent of the Killer. Respect explicitly recorded House searches, fire, Roadblocks, Special Victims, Cop Car and props. Only matching death-specific details identify a victim or cause. Item finds and token placements do not establish use, damage, rescues or casualties. Do not introduce dreams or Dr. Fright if a different killer was selected.",
  visualGuidance: MAPLE_VISUAL,
  rulesSummary:
    "Four quadrant Item decks and twelve one-search Houses. Occupied Houses require Convince from the adjacent Street; ordinary exit movement remains legal. Roadblocks prevent rescue, not movement. Fire closes one named House. Smalleys are separate Special Victims; Boyfriend redirects targeting and may cost Time. Officer Kopp moves the Cop Car toward the opposite Exit each Upkeep. Placed props and physical effects require explicit observations.",
};
