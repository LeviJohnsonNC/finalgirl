import {
  CARNIVAL_SOURCE,
  CARNIVAL_VISUAL,
  CARNIVAL_EVENTS,
  CARNIVAL_TRAPS,
  CARNIVAL_ITEM_TRAPS,
  CARNIVAL_ITEMS,
  CARNIVAL_TERRORS,
} from "../../../supabase/functions/_shared/play/carnival";
import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";
const cards = (catalog: readonly { name: string; effect: string }[]) =>
  [...catalog]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => `${c.name}: ${c.effect}`);
export const carnivalRules: EntityRuleModule = {
  entity: "Carnival of Blood",
  kind: "location",
  filmId: "s1-carnival-of-blood",
  source: CARNIVAL_SOURCE,
  credits: {
    design: "A.J. Porfirio and Evan Derrick",
    art: "Vladyslava Ladkova",
  },
  tags: [
    "carnival",
    "traps",
    "item traps",
    "terror traps",
    "zappo",
    "werewolf",
    "golf cart",
    "sibling",
    "fiancé",
  ],
  seeAlso: ["searching", "minions", "horror-rolls"],
  setup: [
    {
      type: "list",
      ordered: true,
      items: [
        "Choose the printed Setup card and place the Final Girl, Killer and Victims as its symbols and numbers indicate. Killer rules apply independently of this Location.",
        "Set aside the three Item Traps and shuffle the eighteen ordinary Items. Deal three facedown decks of two Items each. Randomly add one Item Trap to each deck and shuffle the three decks separately.",
        "Deal one ordinary Item faceup onto each deck. Return unused Items to the box. Each finished deck has four cards, including one hidden Item Trap.",
        "Set the three Terror Trap tokens and the reference card nearby. Draw the starting Event and follow its printed setup. The companion initializes only known states in newly cast sessions; record physical placements and immediate effects yourself.",
      ],
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Item Traps are Search encounters" },
    {
      type: "paragraph",
      text: "Resolve an Item Trap revealed by a successful Search unless another effect cancels it. If the Search also reveals an Item, resolve the trap before taking the Item. Discard resolved Item Traps unless their card says otherwise. A later Terror card can return discarded Item Traps to the Item decks; an encounter is not a permanent one-time unlock.",
    },
    { type: "list", items: cards(CARNIVAL_ITEM_TRAPS) },
    { type: "heading", level: 3, text: "Terror Trap tokens stay on the board" },
    {
      type: "paragraph",
      text: "A Terror Trap card places its matching token in the Final Girl’s current space and immediately applies its effects to her and every Victim there. Victims there or entering are killed. The token remains for the rest of the game and triggers again on entry as directed. All Enemies, including Minions, completely ignore the tokens. Resolve the rest of the Terror card and discard the card; discarding the card does not remove the token.",
    },
    { type: "list", items: cards(CARNIVAL_TRAPS) },
    {
      type: "callout",
      variant: "critical",
      title: "Two different ways to avoid traps",
      text: "Zappo only avoids an Item Trap when you use him to Search: he flees and is discarded. Found Footage cancels one Item Trap or Terror Trap card. Canceling a Terror Trap card cancels ALL of that card’s effects, including placement; it does not remove a previously placed token. Record cancellation and placement separately. Neither changes victim totals automatically.",
    },
    { type: "heading", level: 3, text: "Events, people and objects" },
    { type: "list", items: cards(CARNIVAL_EVENTS) },
    {
      type: "callout",
      variant: "note",
      title: "Roles are different",
      text: "The Sibling and Fiancé are Special Victims. Full Moon’s Werewolf will not follow you and cannot be targeted, saved or killed. Zappo is an Item, and losing him is not a Victim death. The Golf Cart must stay on the outer path. Record adjacency, movement, rolls and damage on the physical board; the app cannot infer these from a location note.",
    },
    {
      type: "paragraph",
      text: "So Much Junk’s Search penalty lasts for the remainder of the game after Zappo is lost, even if his current status later changes. Event activation does not restore a saved/killed character or discarded object. Use an explicit correction if a status was recorded incorrectly.",
    },
    { type: "heading", level: 3, text: "Location Terror cards" },
    { type: "list", items: cards(CARNIVAL_TERRORS) },
    { type: "heading", level: 3, text: "Items" },
    { type: "list", items: cards(CARNIVAL_ITEMS) },
    {
      type: "paragraph",
      text: "Found a weapon/item records a find at that moment, not present inventory, remaining uses or proof of use. Keep ordinary item charges and hand/backpack limits on the physical cards. Named trap/actor controls record only the specific observations you choose. Use the regular Victims saved/killed counters separately; marking a character’s status does not add another casualty.",
    },
  ],
};
export const CARNIVAL_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Carnival is the selected Location, independent of the Killer. Only explicitly recorded placements, actors and outcomes happened. Zappo fleeing is not a death. A trap reference or revealed card alone establishes no casualties. The Werewolf is an Event actor, never an extra Killer or a saved/killed Victim.",
  visualGuidance: CARNIVAL_VISUAL,
  rulesSummary:
    "Three Terror Trap tokens persist once placed: blades (two dice, each 1–4 one damage, each 5–6 optional move), rope (random Action discard), acid (lose one Health). Victims in/entering trap spaces die; Enemies ignore tokens. Item Traps are separate Search encounters, sometimes ongoing player conditions. Zappo avoids Item Traps only; Found Footage cancels the entire chosen Terror Trap card before its effects, not an existing token. So Much Junk’s Search penalty persists after losing Zappo. Full Moon’s Werewolf cannot be targeted, saved or killed. Physical placements, rolls and casualties remain explicit observations.",
};
