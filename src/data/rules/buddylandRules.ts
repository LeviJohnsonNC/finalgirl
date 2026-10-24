import type { EntityRuleModule, ModulePromptContext } from "./moduleRules";
import { BUDDYLAND_VISUALS } from "../buddyland";
import {
  BILLY_POWERS,
  BILLY_FINALES,
  BUDDIES,
  BUDDYLAND_EVENTS,
  BUDDYLAND_ITEMS,
  BUDDYLAND_TERRORS,
} from "../../../supabase/functions/_shared/play/buddyland";

const cardEntries = (cards: readonly { name: string; effect: string }[]) =>
  [...cards]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((card) => `${card.name}: ${card.effect}`);

export const billyRules: EntityRuleModule = {
  entity: "Billy the Bear",
  kind: "killer",
  filmId: "s4-buddyland",
  source:
    "Billy the Bear Killer Sheet; Core Rules p. 32 (Minions); owner photos IMG_9308–IMG_9309 and IMG_9313",
  credits: { design: "Motti Eisenbach", art: "Jacqui Davis" },
  tags: [
    "billy",
    "bear",
    "buddies",
    "minions",
    "initiative",
    "power sources",
    "battery",
    "bloodlust",
  ],
  setup: [
    {
      type: "list",
      ordered: true,
      items: [
        "Before revealing the Setup card, place 4 Power Source tokens Active-side up in 4 different spaces. None may be adjacent to another Power Source. Set aside the 5th token; it may enter play later.",
        "Separate the 2 types of Bloodlust Track tokens and shuffle each type facedown. Put 6 tokens on the matching colors and icons of the Killer board. Set aside the unused token of each type without revealing it.",
        "Shuffle the 5 ordinary Buddy cards facedown to form the Buddy deck. Set aside the 2 Special Buddy cards; effects may bring them into play later.",
        "Spawn a Buddy using the rules below. Billy starts with 8 Health and Horror Level 4.",
      ],
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Power Sources" },
    {
      type: "paragraph",
      text: "Spend 1 Time while in a Power Source’s space to deactivate it, flipping it to its Inactive side. You may do this while moving through the space. If an effect activates an Inactive source, flip it back to Active.",
    },
    {
      type: "callout",
      variant: "critical",
      title: "The battery-heart icon",
      text: "When the battery-heart effect resolves, Billy recovers 1 Health if at least one Power Source is Active. Ignore that effect if all sources are Inactive. This is an icon-triggered effect, not automatic healing every turn. Shutting down the power does not itself defeat Billy.",
    },
    { type: "heading", level: 3, text: "Bloodlust Track tokens" },
    {
      type: "paragraph",
      text: "When Bloodlust reaches a level with a facedown token, reveal that token and apply its effects.",
    },
    { type: "heading", level: 3, text: "Spawning a Buddy" },
    {
      type: "paragraph",
      text: "Buddies are Minions with their own Health, Attack and Movement values. Reveal the top Buddy card, put it in the play area and add its printed number of Health markers. Place its token in a space adjacent to Billy, choosing a space without another Buddy if possible. If Billy is no longer in play, ignore the spawn effect.",
    },
    { type: "heading", level: 3, text: "Initiative and activation" },
    {
      type: "paragraph",
      text: "Resolve Minion Actions and Terror-card effects in ascending Initiative order, from the lowest number to the highest. A Buddy spawned during the Killer phase does not activate until the next Killer phase.",
    },
    { type: "heading", level: 3, text: "Killing Buddies" },
    {
      type: "paragraph",
      text: "Remove the defeated Buddy’s token and remove its card from the game. Take the Kill Reward printed on its card. If the Buddy dies outside the Action phase, take that reward at the beginning of the next Action phase.",
    },
    {
      type: "callout",
      variant: "critical",
      title: "They protect Billy",
      text: "Billy cannot be attacked while any Buddy shares his space. Deal with his protection before attacking him.",
    },
    { type: "heading", level: 3, text: "Finale reminder" },
    {
      type: "paragraph",
      text: "Follow the revealed Finale card. With Power Surge, both Billy and Boris must be defeated to win. Do not assume that defeating Billy alone always ends that Finale.",
    },
    { type: "heading", level: 3, text: "Dark Powers and Minor Dark Powers" },
    { type: "list", items: cardEntries(BILLY_POWERS) },
    { type: "heading", level: 3, text: "Finales" },
    { type: "list", items: cardEntries(BILLY_FINALES) },
    { type: "heading", level: 3, text: "Buddy references" },
    {
      type: "list",
      items: [...BUDDIES]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(
          (b) =>
            `${b.name}: Health ${b.health}, Attack ${b.attack}, Movement ${b.movement}, Initiative ${b.initiative}. ${b.ability} Kill reward: ${b.reward}`,
        ),
    },
    { type: "heading", level: 3, text: "Killer Terror cards" },
    {
      type: "list",
      items: cardEntries(BUDDYLAND_TERRORS.filter((card) => "killer" in card)),
    },
  ],
};

export const buddylandRules: EntityRuleModule = {
  entity: "Buddyland",
  kind: "location",
  filmId: "s4-buddyland",
  source:
    "Buddyland Location Sheet; owner photos IMG_9309 and IMG_9311–IMG_9312 (Terrors, Events and Items)",
  credits: {
    design: "Motti Eisenbach",
    art: "Jacqui Davis; board and Item art: Agnieszka Dąbrowiecka",
  },
  tags: [
    "buddyland",
    "arcade",
    "arcade tokens",
    "items",
    "party room",
    "ball pit",
  ],
  setup: [
    {
      type: "paragraph",
      text: "Set up the Location normally. Buddyland has no additional Location setup instructions. Apply your selected Killer’s setup separately; Power Sources and Buddies belong to Billy the Bear.",
    },
  ],
  rules: [
    { type: "heading", level: 3, text: "Arcade spaces" },
    {
      type: "paragraph",
      text: "The 4 spaces in the center of the board bearing the Arcade icon are Arcade spaces. Cards that refer to the Arcade mean these marked spaces, rather than every room containing a machine.",
    },
    { type: "heading", level: 3, text: "Arcade Tokens and Items" },
    {
      type: "paragraph",
      text: "Use Arcade Token Items and machine effects as directed by their printed cards. Follow the particular Item or effect you draw.",
    },
    { type: "heading", level: 3, text: "Rooms and starting Events" },
    {
      type: "paragraph",
      text: "The Party Room, Kitchen, Dining Area, Prize Counter, Janitor’s Closet, Bathroom, Jungle Gym and Ball Pit matter to specific cards. Apply your selected Setup card’s printed placements, then resolve the starting Event. Events can add Special Victims, change rescue requirements or alter Enemy targeting.",
    },
    {
      type: "callout",
      variant: "note",
      title: "Mix your Feature Films",
      text: "Buddyland works with other Killers. Billy’s Power Sources, healing icon, Buddy deck and protection rule do not apply just because the game is set here. Conversely, Billy brings those mechanics to any Location.",
    },
    { type: "heading", level: 3, text: "Events and Special Victims" },
    { type: "list", items: cardEntries(BUDDYLAND_EVENTS) },
    { type: "heading", level: 3, text: "Location Terror cards" },
    {
      type: "list",
      items: cardEntries(
        BUDDYLAND_TERRORS.filter((card) => "location" in card),
      ),
    },
    { type: "heading", level: 3, text: "Items" },
    { type: "list", items: cardEntries(BUDDYLAND_ITEMS) },
  ],
};

export const BILLY_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Billy is an animatronic bear supported by separate animatronic Buddies, not a single human slasher. His welcoming gestures and mechanical persistence are disturbing. Only describe Buddy identities or special Finale conditions when established by the player; do not invent an opening roster. Billy and his Power Sources can appear at ANY selected Location. Do not relocate a mixed game to Buddyland.",
  visualGuidance: BUDDYLAND_VISUALS.billy,
  rulesSummary:
    "Billy starts with 8 Health and Horror 4. Four nonadjacent Power Sources start Active; a fifth is set aside. Deactivating a source in your space costs 1 Time, including while passing through. The battery-heart effect heals Billy by 1 only when a source is Active; there is no passive every-turn heal. Buddies are Minions acting in ascending Initiative; newly spawned Buddies wait until the next Killer phase. Billy cannot be attacked while a Buddy shares his space. A Buddy spawns adjacent to Billy; none spawns if he is out of play. Power Surge requires defeating both Billy and Boris. Respect the selected Finale and reported ending state. Do not assume Power Surge was selected when no Finale is reported. Switching off the power does not automatically win.",
};

export const BUDDYLAND_PROMPT_CONTEXT: ModulePromptContext = {
  narrativeGuidance:
    "Set this story inside the abandoned pizza-and-arcade venue Buddyland, closed after grisly murders. Use its four central Arcade spaces, Prize Counter, Party Room, Kitchen, Dining Area, Janitor’s Closet, Bathroom, Jungle Gym and Ball Pit. Follow the selected Setup and Event, including any Special Victim. Do not introduce Billy, Buddies or Power Sources unless Billy is the selected Killer. Do not force Rena or Gwynn into the cast when another Final Girl is selected.",
  visualGuidance: BUDDYLAND_VISUALS.location,
  rulesSummary:
    "Buddyland has no special Location setup. Four central marked spaces are Arcade spaces. Use Arcade Tokens and machine effects only as their Item cards direct. Location Events can change rescue, targeting and panic rules. These Location rules are independent of the selected Killer.",
};
