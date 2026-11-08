import { FALCONWOOD_EVENTS, FALCONWOOD_ITEMS, FALCONWOOD_MISSION_ITEMS, FALCONWOOD_MISSION_RULES, FALCONWOOD_SETUPS, FALCONWOOD_SOURCE, FALCONWOOD_TERRORS } from "../../../supabase/functions/_shared/play/falconwoodCatalog";
import { FALCONWOOD_LEADS, missionById } from "../../../supabase/functions/_shared/play/falconwood";
import { slayerRules, SLAYER_PROMPT_CONTEXT } from "./slayerRules";
import {mallRules,MALL_PROMPT_CONTEXT} from './sunnydazeRules';
import { hunterRules, HUNTER_PROMPT_CONTEXT } from './hunterRules';
import { WINGARD, WINGARD_CRAFTS, WINGARD_EVENTS, WINGARD_STANDARD_ITEMS, WINGARD_SETUPS, WINGARD_SUPPLIES, WINGARD_TERRORS, WINGARD_VISUAL, wingardIngredients, wingardSetupDescription } from '../../../supabase/functions/_shared/play/wingardCatalog';
import { intruderRules, INTRUDER_PROMPT_CONTEXT } from './intruderRules';
import { WOODS, WOODS_SOURCE, WOODS_BRIDGES, WOODS_SPACES, WOODS_EVENTS, WOODS_TERRORS, WOODS_ITEMS, WOODS_SETUPS, woodsSpaceName, woodsSetupDescription } from "../../../supabase/functions/_shared/play/storybookWoods";
import { bigBadWolfRules, WOLF_PROMPT_CONTEXT } from "./bigBadWolfRules";
import {marrekRules,MARREK_PROMPT_CONTEXT} from './marrekRules';
import {tormentorRules,TORMENTOR_PROMPT_CONTEXT} from './tormentorRules';
import {SHADY_CURSES,SHADY_EVENTS,SHADY_TERRORS,SHADY_ITEMS,SHADY_SETUPS,SHADY_SPACES} from '../../../supabase/functions/_shared/play/shadyAcres';
import {GRIMLASH_ACTIONS,GRIMLASH_BLOODLUST,GRIMLASH_HARVEST,GRIMLASH_POWERS,GRIMLASH_FINALES,GRIMLASH_MINORS,GRIMLASH_TERRORS} from '../../../supabase/functions/_shared/play/grimlash';
import { konradRules, KONRAD_PROMPT_CONTEXT } from './konradRules';
import { evomorphRules, EVOMORPH_PROMPT_CONTEXT } from './evomorphRules';
import { creechRules,CREECH_PROMPT_CONTEXT } from './creechRules';
import { poltergeistRules, POLTERGEIST_PROMPT_CONTEXT } from './poltergeistRules';
import { grovesRules, GROVES_PROMPT_CONTEXT } from "./grovesRules";
import { inkanyambaRules, INKANYAMBA_PROMPT_CONTEXT } from "./inkanyambaRules";
import { mapleRules, MAPLE_PROMPT_CONTEXT } from './mapleRules';
import { carnivalRules, CARNIVAL_PROMPT_CONTEXT } from './carnivalRules';
import { frightRules, FRIGHT_PROMPT_CONTEXT } from './frightRules';
import { geppettoRules, GEPPETTO_PROMPT_CONTEXT } from './geppettoRules';
import { hansRules, campRules, HANS_PROMPT_CONTEXT, CAMP_PROMPT_CONTEXT } from './campRules';
import { RuleBlock, RuleSection, RuleChapter } from './types';
import { billyRules, buddylandRules, BILLY_PROMPT_CONTEXT, BUDDYLAND_PROMPT_CONTEXT } from './buddylandRules';

export interface EntityRuleModule {
  /** Entity name as it appears in FEATURE_FILMS (e.g. 'Grimlash', 'Storybook Woods') */
  entity: string;
  kind: 'killer' | 'location';
  /** Film ID that grants ownership of this module */
  filmId: string;
  /** Human-readable source attribution */
  source: string;
  /** Designer / artist credits printed on the official sheet */
  credits?: { design?: string; art?: string };
  /** Body of the SETUP sub-tab */
  setup: RuleBlock[];
  /** Body of the RULES sub-tab */
  rules: RuleBlock[];
  tags?: string[];
  seeAlso?: string[];
}

// ─── Grimlash (Killer) — A Rotten Harvest ──────────────────────────────────
const grimlash: EntityRuleModule = {
  entity: 'Grimlash',
  kind: 'killer',
  filmId: 's4-rotten-harvest',
  source: 'A Rotten Harvest — Killer Sheet',
  credits: { design: 'Ryan Jorjorian', art: 'Ondine Champetier de Ribes' },
  tags: ['grimlash', 'harvest madness', 'killer',...GRIMLASH_HARVEST.map(c=>c.name),...GRIMLASH_TERRORS.map(c=>c.name)],
  setup: [
    {
      type: 'list',
      items: [
        'Separate the Harvest Madness cards by level and shuffle each to create 3 separate decks.',
        'Place the Harvest Madness marker on the starting space on the Harvest Madness track (outlined in orange), located near the top of the Killer board.',
      ],
    },
  ],
  rules: [
    {type:'paragraph',text:'Standard board: Grimlash starts with 10 Health and Horror 4. Bloodlust has nine positions, 0–8. Its overflow discards the next Terror card. Harvest Madness positions 0–2 are Level 0; 3–4 Level 1; 5–6 Level 2; 7–9 Level 3; 10 is the fatal skull. These indices describe physical spaces, not printed numbers.'},
    {type:'table',modalLayout:'comparison',headers:['Bloodlust position','Attack','Movement','Entry icon'],rows:GRIMLASH_BLOODLUST.map((c,i)=>[String(i),String(c.attack),String(c.move),c.entry])},
    {type:'paragraph',text:'Photographed unnamed landscape action face: '+GRIMLASH_ACTIONS.base},
    {type:'table',headers:['Harvest ability','Level','Effect'],rows:GRIMLASH_HARVEST.map(c=>[c.name,String(c.level),c.effect])},
    {type:'table',headers:['Power / Finale / Minor','Effect'],rows:[...GRIMLASH_MINORS,...GRIMLASH_POWERS,...GRIMLASH_FINALES].map(c=>[c.name,c.effect])},
    {type:'table',modalLayout:'records',headers:['Terror','Copies','Action sequence','Effect'],rows:GRIMLASH_TERRORS.map(c=>[c.name,String(c.quantity),GRIMLASH_ACTIONS[c.id]??'Triggered Minor Dark Power',c.effect])},
    { type: 'heading', level: 3, text: 'Harvest Madness' },
    {
      type: 'paragraph',
      text: 'Increasing your Harvest Madness will give you additional abilities, but it may come at a price, possibly death!',
    },
    {
      type: 'paragraph',
      text: 'Whenever you see the Harvest Madness icon, move the Harvest Madness marker one space to the right on the track. When your Harvest Madness marker reaches a space corresponding to a new level, draw 2 cards from the Harvest Madness deck for that level and choose 1 to keep, discarding the other. The Harvest Madness card abilities remain in effect as long as your Harvest Madness remains at that level or above.',
    },
    {
      type: 'callout',
      variant: 'critical',
      title: 'Important!',
      text: 'If your Harvest Madness increases beyond Level 3 (indicated by the space with a skull), you immediately lose the game!',
    },
    {
      type: 'paragraph',
      text: 'When resolving a Heart, you may recover health as normal or reduce your Harvest Madness. If you choose to reduce your Harvest Madness, move the Harvest Madness marker 1 space to the left for each Heart. You must choose to either recover health or lower your Harvest Madness — you cannot do both.',
    },
    {
      type: 'paragraph',
      text: 'If your Harvest Madness drops to a lower level, you must discard the corresponding Harvest Madness card for the level you just left. If your Harvest Madness later returns to that level, you once again draw 2 cards from the appropriate Harvest Madness deck, choosing 1 to keep and discarding the other. When drawing Harvest Madness cards, if there are not enough in the deck, reshuffle the discard pile for that level and form a new deck.',
    },
    {
      type: 'paragraph',
      text: 'Some Harvest Madness once-per-turn effects require you to flip the Harvest Madness card facedown. During the Upkeep phase, flip them faceup. Their effects can be used again.',
    },
  ],
};

const storybookWoods: EntityRuleModule = {
  entity: WOODS,
  kind: "location",
  filmId: "s2-once-upon-full-moon",
  source: WOODS_SOURCE,
  credits: {design:"Julie Ahern",art:"Tyler Johnson"},
  tags: ["storybook woods","bridges","raft","troll bridge",
    ...WOODS_SPACES.map(space => space.name),...WOODS_SETUPS.map(card => card.name),
    ...WOODS_EVENTS.map(card => card.name),...WOODS_TERRORS.map(card => card.name),...WOODS_ITEMS.map(card => card.name)],
  setup: [
    {type:"paragraph",text:"Use normal setup. The board has three search spaces, two exits and three printed river bridges."},
    {type:"table",headers:["Setup","Printed placement"],rows:WOODS_SETUPS.map(card => [card.name,woodsSetupDescription(card)])},
  ],
  rules: [
    {type:"heading",level:3,text:"Crossing the river"},
    {type:"paragraph",text:"Only one Victim may follow across a printed bridge or the Toll Bridge. The Toll Bridge also costs Time as shown on its Event."},
    {type:"list",items:WOODS_BRIDGES.map(pair => pair.map(woodsSpaceName).join(" ↔ "))},
    {type:"paragraph",text:`Raft tokens go in four of these marked non-exit spaces: ${WOODS_SPACES.filter(space => "landing" in space).map(space => space.name).join(", ")}. Compass and bank labels identify unnamed printed spaces.`},
    {type:"table",headers:["Event","Effect"],rows:WOODS_EVENTS.map(card => [card.name,card.effect])},
    {type:"table",headers:["Terror","Effect"],rows:WOODS_TERRORS.map(card => [card.name,card.effect])},
    {type:"table",headers:["Item","Copies","Effect"],rows:WOODS_ITEMS.map(card => [card.name,String("quantity" in card ? card.quantity : 1),card.effect])},
  ],
};

// ─── Shady Acres (Location) — A Rotten Harvest ────────────────────────────
const shadyAcres: EntityRuleModule = {
  entity: 'Shady Acres',
  kind: 'location',
  filmId: 's4-rotten-harvest',
  source: 'A Rotten Harvest — Location Sheet',
  credits: { design: 'Ryan Jorjorian', art: 'Ondine Champetier de Ribes' },
  tags: ['shady acres', 'children', 'ancient curse', 'field', 'location',...SHADY_CURSES.map(c=>c.name),...SHADY_ITEMS.map(c=>c.name),...SHADY_EVENTS.map(c=>c.name),...SHADY_TERRORS.map(c=>c.name)],
  setup: [
    {
      type: 'list',
      items: [
        'Shuffle the Ancient Curse cards and make a facedown Ancient Curse deck.',
        'Place the Children card near the play area and place a Child meeple on the Altar of the Old Gods space. Place the other Children on the Children card.',
        'Place the Children Action token above any Minion or Killer Actions on the Finale card, indicating that the Children will act before any other Enemies.',
      ],
    },
  ],
  rules: [
    {type:'paragraph',text:'Three reusable Children: Health 1, Attack Value 1, Movement Value 1. Their action token targets the closest Final Girl or Victim, moves, then resolves Abduction. Returning a defeated Child to the card does not record a Victim casualty.'},
    {type:'table',headers:['Ancient Curse','Effect'],rows:SHADY_CURSES.map(c=>[c.name,c.effect])},
    {type:'table',headers:['Event','Effect'],rows:SHADY_EVENTS.map(c=>[c.name,c.effect])},
    {type:'table',headers:['Terror','Copies','Effect'],rows:SHADY_TERRORS.map(c=>[c.name,String(c.quantity),c.effect])},
    {type:'table',headers:['Item','Effect'],rows:SHADY_ITEMS.map(c=>[c.name,c.effect])},
    {type:'table',modalLayout:'placements',headers:['Setup','Final Girl','Killer','Victims (all unlisted spaces: 0)'],rows:SHADY_SETUPS.map(s=>[s.name,SHADY_SPACES.find(p=>p.id===s.girl)!.name,SHADY_SPACES.find(p=>p.id===s.killer)!.name,Object.entries(s.victims).map(([id,n])=>SHADY_SPACES.find(p=>p.id===id)!.name+': '+n).join('; ')])},
    {type:'paragraph',text:'Board-coordinate labels North/West/Southwest/South/Inner East/Outer East Field and West exit/Central/Southeast/East exit road identify unnamed spaces, not printed location names. Search spaces: Old Barn, McCoy Farmhouse, Ralph’s Garage.'},
    { type: 'heading', level: 3, text: 'Children' },
    {
      type: 'paragraph',
      text: "Children at Shady Acres have gone missing… it has been rumored that they've been doing some despicable things. The Children card has the Children's health, Attack Value, and Movement Value.",
    },
    {
      type: 'list',
      items: [
        'The Children are not Minions but are considered Enemies.',
        'Children have their own Action line on the Children Action token. The Children Action is performed at the beginning of the Killer phase, before the Minion Action (if applicable) and the Killer Action.',
        'Children DO NOT resolve Killer or Minion actions on Terror cards or anywhere else unless the card specifically states that the action is to be performed by the Children.',
        'Children are activated one at a time starting with the Child closest to the Altar of the Old Gods space and ending with the Child farthest from that space.',
        'During the Upkeep phase, spawn a Child by placing its meeple on the Altar of the Old Gods space. If all Children are already on the board OR if there are no Victims on the board, the spawn is ignored.',
        'Children may be attacked and killed. If a Child is killed, their meeple goes back onto the Children card, available to be spawned in the future.',
        'If you choose to attack the Children and there are more than one of them in the same space, you are attacking ALL of them and you may divide damage among the Children in the target space as you wish. Any leftover damage is lost.',
        'Victims will follow you into a space that contains Children unless that space also contains the Killer.',
        'During the Panic phase, Victims on a space with a Child will panic if at least one Victim was killed that turn.',
      ],
    },
    { type: 'heading', level: 3, text: 'Abducted Victims' },
    {
      type: 'paragraph',
      text: 'The Children appear to be under the control of ancient gods and abduct people to offer them as sacrifices. When the Children resolve the Abduction icon while on a space with a Victim, roll a die:',
    },
    {
      type: 'list',
      items: [
        'On a 1-2 the Victim has been abducted to the altar of the Old Gods and sacrificed (killed). Return the Child to the Altar of the Old Gods space. Then, increase Bloodlust as normal and place the Victim on the back of the top card of the Ancient Curse deck.',
        'On a 3-6 the Child failed to abduct the Victim and nothing happens.',
      ],
    },
    {
      type: 'paragraph',
      text: "If there are no Victims in a Child's space when trying to resolve the Abduction icon, treat Abduction as an Attack instead.",
    },
    { type: 'heading', level: 3, text: 'Ancient Curses' },
    {
      type: 'paragraph',
      text: "As soon as there are 3 sacrificed Victims on the back of the top card of the Ancient Curse deck, the Old Gods have been fed and they unleash a curse upon the children's enemies. Remove the Victims from the card and reveal the Ancient Curse card, putting it into play. There may be multiple Ancient Curse cards in play at the same time.",
    },
    { type: 'heading', level: 3, text: 'Field Spaces' },
    {
      type: 'paragraph',
      text: 'Bad things always seem to happen in the fields. Spaces with the Field icon are considered Field spaces. Several cards have effects that involve Field spaces.',
    },
  ],
};

// ─── Mort the Teenage Dirtbag (Killer) — Shriek ───────────────────────────
const mortTheTeenageDirtbag: EntityRuleModule = {
  entity: 'Mort the Teenage Dirtbag',
  kind: 'killer',
  filmId: 's4-shriek',
  source: 'Shriek — Killer Sheet',
  credits: { design: 'Evan Derrick', art: 'Tyler Johnson' },
  tags: ['mort', 'shriek', 'suspects', 'clues', 'informants', 'identity', 'killer'],
  setup: [
    { type: 'callout', variant: 'critical', title: 'Do Not Open', text: 'There is a special Finale Secret Envelope included with Mort. DO NOT OPEN it until you are instructed to! Otherwise, it will spoil the surprise.' },
    {
      type: 'list',
      items: [
        'Place the Basic Finale card on the Killer board. It will be used for the Killer Action until the Finale is revealed.',
        'Add the Interrogate and Coerce Action cards to the Action Tableau.',
        'Place the 10 Suspect cards in a row above the board with their attributes side showing. Place the 10 Suspect tokens in the Suspect bag.',
        'Mort does not start on the board. Instead, he is wearing one of 10 possible disguises. After placing the Victims and Final Girl on the Location board, take the 10 Suspect miniatures and randomly place each Suspect on an empty space until there are either no empty spaces left or no Suspects left to place. If there are no empty spaces and Suspects still need to be placed, place them in the furthest spaces from you that contain Victims, but only 1 Suspect per space.',
        'Randomly choose a Clue card and place it next to the board on whichever side you wish. This card determines who Mort will be disguised as. Place the Clue Viewer and the Reminder tokens, facedown, next to the Clue card.',
        'Place the Horror Track token on the Killer board in its designated space.',
      ],
    },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Suspects' },
    { type: 'paragraph', text: 'You are attempting to figure out who Mort is actually masquerading as, but until you have eliminated all Suspects but one, it could be anyone! There are 10 Suspects, each dressed up as a different Victim, Final Girl, Enemy, or the Killer. For gameplay purposes, Suspects are not considered the Killer, an Enemy, or a Victim. They will never be targeted and cannot be damaged.' },
    { type: 'paragraph', text: 'Suspects have 7 attributes, listed on their respective Suspect card. These attributes are what will help you determine who Mort is actually disguised as.' },
    { type: 'heading', level: 3, text: 'Revealing Clues' },
    { type: 'paragraph', text: 'There are two new Action cards: Interrogate and Coerce. These cards can be used to reveal clues to identify which of the Suspects Mort is disguised as.' },
    { type: 'list', ordered: true, items: ['Reveal one of the facedown Reminder tokens (numbered 1-5).', 'Use the Clue Viewer to look at the corresponding Clue on the Clue card. It will indicate an attribute that Mort does NOT possess.', 'Determine which Suspects cannot be Mort by looking at their attributes and discarding their Suspect cards from the lineup.', 'For each Suspect card discarded, remove that Suspect miniature from the board and replace it with an Informant meeple.', 'Keep the Reminder token faceup near the Clue card so that you remember which Clues you’ve already seen.'] },
    { type: 'paragraph', text: 'Revealing a Clue will ALWAYS eliminate at least one Suspect, and may eliminate more than one.' },
    { type: 'heading', level: 3, text: 'Interrogate & Coerce' },
    { type: 'paragraph', text: 'Interrogate can only be resolved while in a space with a Suspect. After successfully interrogating a Suspect, they will panic.' },
    { type: 'paragraph', text: 'Coerce can only be resolved while in a space with an Informant. After successfully coercing an Informant, you will remove them from the board.' },
    { type: 'heading', level: 3, text: 'Informants' },
    { type: 'paragraph', text: 'Informants are considered Victims for ALL gameplay purposes with three exceptions: when you save an Informant, after receiving the reward from your Final Girl card, you may either reduce Horror or, after increasing Bloodlust, you must increase Horror once; if an Informant is killed, after increasing Bloodlust you follow normal rules but if there are less prominent Victims over normal Victims, they are less prominent.' },
    { type: 'heading', level: 3, text: 'Suspects Temporarily Acting as Killers' },
    { type: 'paragraph', text: 'Whenever you see the mask icon, draw a token out of the Suspect bag. The token will correspond to one of the ten Suspects, who will then temporarily become the Killer. Mort is a master of disguise and could be impersonating ANYONE, if only for a moment. Place the token back into the bag after resolving the Killer Action(s). That Suspect could become the Active Killer again on the same or future turn.' },
    { type: 'paragraph', text: 'When drawing a token, if the indicated Suspect has already been proven to NOT be Mort, nothing happens and the Killer Action effect is ignored. Instead, discard the token.' },
    { type: 'paragraph', text: 'For each Location card that requires you to resolve an action as the Killer, draw a token from the bag as if there was a mask icon present on the card. As long as that Suspect is still in the lineup, they will become the Active Killer for resolving ALL Killer Actions/effects on that card.' },
    { type: 'heading', level: 3, text: 'Horror Track Token' },
    { type: 'paragraph', text: 'When Bloodlust reaches the highest space on the track, place the Horror Track token from the Killer board on top of the skull symbol at the end of the Horror Track on your Player board. From this point forward, if Horror exceeds its maximum level, instead of increasing Horror, you lose health instead.' },
    { type: 'heading', level: 3, text: 'Running Out of Terror Cards Before Revealing All Clues' },
    { type: 'paragraph', text: 'If the Finale is revealed normally when the Terror deck is exhausted, flip the Clue card over to its opposite side and reveal who Mort is disguised as. Replace that Suspect’s miniature with Mort’s miniature and flip their Suspect card over, replacing the Basic Finale card with the Suspect card. Then remove any remaining Suspects and Informant meeples from the Location board and discard their associated Suspect cards.' },
    { type: 'paragraph', text: 'If the Dark Power hasn’t been revealed, reveal it immediately and discard any Minor Dark Powers in play.' },
    { type: 'heading', level: 3, text: 'Panic Phase' },
    { type: 'paragraph', text: 'Until Mort is revealed, Victims do not panic during the Panic phase.' },
    { type: 'heading', level: 3, text: 'Mind Dark Powers' },
    { type: 'paragraph', text: 'Some Locations may have Minor Dark Powers that have spaces for Health markers on them. If one of these is drawn, do not place Health markers on it, as Mort cannot be attacked while he is disguised. Minor Dark Power cards that are drawn in this way may be discarded when you successfully resolve an Interrogate or a Coerce Action card with two successes.' },
  ],
};

// ─── MegaBGCon (Location) — Shriek ─────────────────────────────────────────
const megaBgCon: EntityRuleModule = {
  entity: 'MegaBGCon',
  kind: 'location',
  filmId: 's4-shriek',
  source: 'Shriek — Location Sheet',
  credits: { design: 'A.J. Porfirio', art: 'Tyler Johnson' },
  tags: ['megabgcon', 'shriek', 'booths', 'exhibit areas', 'food court', 'halways', 'convention', 'location'],
  setup: [
    { type: 'list', items: ['Shuffle the 12 Booth cards and make a facedown Booth deck.', 'Shuffle the 10 Booth Event cards and make a facedown Booth Event deck.', 'Add the 2 Create a Panic Action cards to the Action Tableau.', 'Place the Finale Reminder card underneath the Finale card facedown side facing up. It will only be used after the Finale is revealed.'] },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Definitions' },
    { type: 'list', items: ['Exhibit Areas: The yellow spaces marked with the booth icon are considered Exhibit Area spaces. Thematically, this is where the vendor booths are and where everyone wants to be!', 'Food Court: The Food Court is located in the bottom left-hand corner of the board.', 'General Areas: All remaining spaces not captured in the 2 areas above are considered the General Areas.'] },
    { type: 'heading', level: 3, text: 'Restricted Victim Following' },
    { type: 'paragraph', text: 'The Victims are having such a great time at the convention that they will not willingly follow you out of Exhibit Areas and into General Areas. You may not have ANY Victims follow you when moving from an Exhibit Area space to a General Area space. Instead, you will need to use the Create a Panic Action card to attempt to scare them from an Exhibit Area space to a General Area space. Victims could also panic and move from an Exhibit Area space per the normal rules during the Panic phase, or panicking from other effects.' },
    { type: 'heading', level: 3, text: 'Main Hallway' },
    { type: 'paragraph', text: 'When panicking someone from the Main Hallway, roll 2 dice instead of 1 to determine the direction they panic.' },
    { type: 'heading', level: 3, text: 'Searching' },
    { type: 'paragraph', text: 'At Mega Boardgame Con you can search in ANY space by resolving a Search Action card. The Item deck you draw from depends on the kind of space you are searching in: an Exhibit Area space, the Food Court space, or a General Area space.' },
    { type: 'callout', variant: 'critical', title: 'Rules on Game Ambiguity', text: 'Because all spaces can be searched, there are no search icons on the spaces. However, each space is considered a search space for the purpose of effects that reference them. If unsure what to do in certain instances, apply the Rules on Game Ambiguity.' },
    { type: 'heading', level: 3, text: 'Moving Through Hallways and Docks' },
    { type: 'paragraph', text: 'Hallways and docks are sparsely populated and you can move to other connected hallways and docks quickly. If you intend to move to a space connected by this icon, you get +1 movement, but the first space you move to MUST be an adjacent space connected with the hallway icon.' },
    { type: 'heading', level: 3, text: 'Booth Cards and Booth Events' },
    { type: 'paragraph', text: 'During each Upkeep phase you will draw a Booth card. If you need to draw a Booth card but the deck is empty, shuffle the discard pile to create a new deck.' },
    { type: 'list', items: ['1-3: Spawn a normal Victim in the space with the Booth. This represents a new attendee showing up to the convention.', '4-6: Draw a Booth Event card and apply its effects in the space with the Booth. Discard the Booth card after resolving it. Booth Event cards will instruct you as to whether or not the card should be discarded.'] },
  ],
};

// ─── Wingard Cottage (Location) — A Knock at the Door ─────────────────────
const wingardCottage: EntityRuleModule = {
  entity: WINGARD,
  kind: 'location',
  filmId: 's2-knock-at-door',
  source: 'A Knock at the Door — Location Sheet',
  credits: { design: 'Mike Martins', art: 'Heather Vaughan' },
  tags: ['wingard cottage', 'supply items', 'crafted items', 'house', 'indoors', 'outdoors', 'location'],
  setup: [
    {
      type: 'paragraph',
      text: 'Setup the game as normal, with the following changes when playing with Wingard Cottage:',
    },
    {
      type: 'list',
      items: [
        'Place the four Supply Item cards faceup in the play area.',
        'Shuffle the Crafted Item cards together and deal out four faceup cards in the play area.',
      ],
    },
    ...WINGARD_SETUPS.map(card=>({type:'example' as const,title:card.name,text:wingardSetupDescription(card)})),
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Definitions' },
    {
      type: 'list',
      items: [
        'HOUSE: Refers to all of the following spaces — Kitchen, Bedroom x2, Bathroom, Family Room, Foyer, Laundry Room, and Garage.',
        'INDOORS: Refers to all spaces inside the House as well as the Shed and the Boathouse.',
        'OUTDOOR SPACE: Refers to all spaces that are not considered Indoors.',
      ],
    },
    { type: 'heading', level: 3, text: 'Supply Items' },
    {
      type: 'paragraph',
      text: 'Some spaces on the board have Supply Item symbols corresponding to a specific type of Supply Item (Discarded Tools, Nails, Rope, Wood). While on one of these spaces, you may gain the corresponding Supply Item card at the cost of 1 Time (you cannot do this while moving through the space). Place it into a Backpack slot. When discarding a Supply Item card, it goes back in the play area faceup, available to be gained again.',
    },
    { type: 'heading', level: 3, text: 'Crafted Items' },
    {
      type: 'paragraph',
      text: 'Crafting allows you to gain an available Crafted Item card by discarding the Item cards and/or Supply Item cards listed on the Crafted Item card, as well as losing the required amount of Time. When you gain a Crafted Item card, either place it into a Hand or Backpack slot. When discarding a Crafted Item card, it goes back in the play area faceup, available to be Crafted again.',
    },
    {
      type: 'paragraph',
      text: 'When Items with limited uses are discarded to gain a Crafted Item card, those uses carry over to the Crafted Item. For example, if the Shotgun has one use left when it is discarded to craft the Sawed-off Shotgun, then the Sawed-off Shotgun will also have one use left. The same would apply if the Trashcan Lid is discarded to craft the Porcupine.',
    },
    {
      type: 'example',
      title: 'Crafting Example',
      text: 'Ava has a Wooden Bat and Nails. She spends 2 Time to craft the Nail Bat, taking it into her hand. Finally, she discards the Wooden Bat and returns the Nails faceup next to the other Supply Item cards.',
    },
    {type:'heading',level:3,text:'Supply pickup spaces'},
    {type:'list',items:WINGARD_SUPPLIES.map(card=>`${card.name} — ${card.spaces.join(' or ')}`)},
    {type:'heading',level:3,text:'Recipes'},
    ...WINGARD_CRAFTS.map(card=>({type:'example' as const,title:card.name,text:`${wingardIngredients(card).join(' + ')} · ${card.time} Time. ${card.effect}`})),
    {type:'heading',level:3,text:'Events'},
    ...WINGARD_EVENTS.map(card=>({type:'example' as const,title:card.name,text:card.effect})),
    {type:'heading',level:3,text:'Terror cards'},
    ...WINGARD_TERRORS.map(card=>({type:'example' as const,title:card.name,text:card.effect})),
    {type:'heading',level:3,text:'Standard Items'},
    ...WINGARD_STANDARD_ITEMS.map(card=>({type:'example' as const,title:card.count>1?`${card.name} ×${card.count}`:card.name,text:card.effect})),
  ],
};

// ─── Falconwood (Location) — The Falconwood Files ─────────────────────────
const falconwood: EntityRuleModule = {
  entity: 'Falconwood',
  kind: 'location',
  filmId: 's3-falconwood-files',
  source: FALCONWOOD_SOURCE,
  credits: { design: 'Mike Martins', art: 'Vincent Dutrait' },
  tags: ['falconwood', 'bridge', 'river crossing', 'mission', 'friends', 'd20', 'location'],
  setup: [
    {
      type: 'list',
      items: [
        'Set aside the "Survive the Hunt" Terror card, both Mission Item cards, and the Friend cards. They will only be used when instructed by the Mission rules.',
        'Before normal setup, randomly select a Mission and follow the setup instructions on that Mission sheet.',
      ],
    },
    { type:'table', headers:['Setup','Final Girl','Killer','Starting Victims'], modalLayout:'placements',
      rows:FALCONWOOD_SETUPS.map(setup=>[setup.name,setup.finalGirl,setup.killer,
        Object.entries(setup.victims).map(([space,count])=>`${space} ×${count}`).join(', ')]) },
  ],
  rules: [
    { type: 'heading', level: 3, text: 'Definitions' },
    {
      type: 'list',
      items: [
        'BRIDGE: Refers to the paths with roads that cross the river and the Bridge token (if it has been placed on the board).',
        'RIVER CROSSING: Refers to the paths with blue lines that cross the river.',
      ],
    },
    { type: 'heading', level: 3, text: 'River Crossings' },
    {
      type: 'paragraph',
      text: 'You will normally not be able to use River Crossings, but some effects will allow you to use them. Victims may follow you as normal. Enemies cannot use River Crossings. The spaces connected by a River Crossing are not considered adjacent nor connected for the purpose of determining range (or when resolving effects that refer to adjacent spaces).',
    },
    { type: 'heading', level: 3, text: 'Missions' },
    {
      type: 'paragraph',
      text: 'Each Mission sheet will have specific instructions on how to setup and complete the Mission. Completing the Mission is mandatory to win the game. The Killer can only lose their final health and reveal their Final Health token after the Mission is completed. Any damage that would reveal the Killer\u2019s Final Health token before the Mission is completed is ignored. If there is more than one Killer, this only applies to the last remaining Killer.',
    },
    {
      type: 'paragraph',
      text: 'Some cards will instruct you to Gain Progress or Lose Progress on the Mission. Refer to the Mission sheet for an explanation on how to resolve this and place a Tracking marker on the marked space as a reminder of the progress effect.',
    },
    { type: 'heading', level: 3, text: 'Friends' },
    {
      type: 'paragraph',
      text: 'When you complete a Mission, a Friend will join you to help you defeat the Killer. Friends are considered Special Victims but have three important differences:',
    },
    {
      type: 'list',
      items: [
        'Friends will follow you into the Killer\u2019s space.',
        'Other Victims in the same space as a Friend will be attacked before Friends are attacked.',
        'Friends will not panic if they are in your space.',
      ],
    },
    { type: 'heading', level: 3, text: 'Twenty-Sided Die' },
    {
      type: 'paragraph',
      text: 'Many cards will instruct you to roll the 20-sided die, or d20, as indicated by the d20 symbol.',
    },
    { type:'heading', level:3, text:'Mission sheets' },
    ...FALCONWOOD_MISSION_RULES.flatMap(mission => [
      { type:'heading' as const, level:3 as const, text:missionById(mission.id)!.name },
      { type:'list' as const, items:[mission.setup, mission.progress, mission.complete,
        `Gain progress · ${mission.gain}`, `Lose progress · ${mission.loss}`, `${missionById(mission.id)!.friend} · ${mission.friend}`] },
    ]),
    { type:'heading', level:3, text:'Mission token references' },
    { type:'list', items:FALCONWOOD_LEADS.map((space,index) => `Expose the Lab · ${index+1} · ${space}`) },
    { type:'table', modalLayout:'records', headers:['Missing Friend region','First A–Z','Last A–Z'], rows:[
      ['A1/B1 · East / North','Library','Shopping Mall'], ['A1/B2 · East / South','Community Pool','Town Fair'],
      ['A2/B1 · West / North','Best Friend’s House','School'], ['A2/B2 · West / South','Fanghorn Forest','Government Lab'],
    ] },
    { type:'heading', level:3, text:'Events' },
    { type:'list', items:FALCONWOOD_EVENTS.map(card=>`${card.name} · ${card.effect}`) },
    { type:'heading', level:3, text:'Terror cards' },
    { type:'list', items:FALCONWOOD_TERRORS.map(card=>`${card.name} · ${card.effect}`) },
    { type:'heading', level:3, text:'Items and Mission Items' },
    { type:'list', items:[...FALCONWOOD_ITEMS,...FALCONWOOD_MISSION_ITEMS].map(card=>`${card.name} · ${card.effect}`) },
  ],
};

export const ENTITY_RULE_MODULES: EntityRuleModule[] = [mallRules,hunterRules,tormentorRules,konradRules,evomorphRules,creechRules,poltergeistRules, grovesRules, inkanyambaRules, mapleRules, frightRules, carnivalRules, geppettoRules, hansRules, campRules, billyRules, buddylandRules, grimlash, storybookWoods, bigBadWolfRules, shadyAcres, mortTheTeenageDirtbag, megaBgCon, intruderRules, wingardCottage, falconwood, slayerRules, marrekRules];

export interface ModulePromptContext {
  narrativeGuidance: string;
  visualGuidance: string;
  rulesSummary: string;
}

const MODULE_PROMPT_CONTEXT: Record<string, ModulePromptContext> = {
 'Sunnydaze Mall':MALL_PROMPT_CONTEXT,
 'The Hunter': HUNTER_PROMPT_CONTEXT,
  Evomorph: EVOMORPH_PROMPT_CONTEXT,
  'USS Konrad':KONRAD_PROMPT_CONTEXT,
  'Creech Manor':CREECH_PROMPT_CONTEXT,
  Poltergeist:POLTERGEIST_PROMPT_CONTEXT,
  "Sacred Groves": GROVES_PROMPT_CONTEXT,
  Inkanyamba: INKANYAMBA_PROMPT_CONTEXT,
  "Maple Lane": MAPLE_PROMPT_CONTEXT,
  "Dr. Fright": FRIGHT_PROMPT_CONTEXT,
  "Carnival of Blood": CARNIVAL_PROMPT_CONTEXT,
  Geppetto: GEPPETTO_PROMPT_CONTEXT,
  Hans: HANS_PROMPT_CONTEXT,
  'Camp Happy Trails': CAMP_PROMPT_CONTEXT,
  'Billy the Bear': BILLY_PROMPT_CONTEXT,
  Buddyland: BUDDYLAND_PROMPT_CONTEXT,
  'Mort the Teenage Dirtbag': {
    narrativeGuidance: 'Mort is not openly present at first: he is hidden among ten costumed Suspects at MegaBGCon, and the story should emphasize paranoia, mistaken identity, clue-gathering, and convention attendees who might only be pretending to be victims, heroes, or killers. Do not reveal Mort’s true disguise in the opening unless the game state explicitly says he has been revealed.',
    visualGuidance: 'Use a convention-floor slasher look: a hooded Ghostface-like mask with one oversized eye, charcoal hoodie, red-and-black pants, crowds of costumed boardgame fans, suspect miniatures, clue cards, and fluorescent convention lighting. If final killer identity is known, show that specific disguised suspect or reveal moment rather than generic Mort.',
    rulesSummary: 'Mort begins disguised as one of ten Suspects. Players reveal clues through Interrogate and Coerce actions, eliminating Suspects and turning them into Informants. Suspects can temporarily act as the Killer when mask effects resolve. Mort is only truly revealed once enough clues are found or the Terror deck runs out.',
  },
  MegaBGCon: {
    narrativeGuidance: 'MegaBGCon is a busy boardgame convention where crowds resist leaving the fun. Exhibit Areas, the Food Court, booths, booth events, the Main Hallway, and sparse hallway/dock routes should shape the scene.',
    visualGuidance: 'Depict a crowded boardgame convention: vendor booths, demo tables, banners, dice, boardgame boxes, miniatures, food court signage, hallways/docks, fluorescent overhead lighting, cosplay costumes, and crowded exhibit aisles.',
    rulesSummary: 'Victims will not willingly follow from Exhibit Areas into General Areas and often need to be panicked out. Every space can be searched, with the item deck determined by area type. Booth cards and Booth Events trigger during Upkeep, and hallway/dock movement can be faster.',
  },
  'The Intruders': INTRUDER_PROMPT_CONTEXT,
  [WINGARD]: {
    narrativeGuidance:'A lakeside family retreat with a buried history. Use the selected scenario and recorded events. Scavenging or improvised equipment may enter the story when observed.',
    visualGuidance:WINGARD_VISUAL,
    rulesSummary:'Supply cards come from marked spaces. A completed craft exchanges the listed ingredients and Time for the item. Placed traps remain separate from their cards.',
  },
  Slayer: SLAYER_PROMPT_CONTEXT,
  Falconwood: {
    narrativeGuidance: 'Falconwood is a shrinking rural town (peak population 16,715) poisoned by a government lab: mysterious deaths, disappearances, families fleeing, and locals who either play dumb or are desperate to expose the truth. A river splits the town — bridges are the only reliable crossings, while river crossings are usually impassable. Use only the selected mission and preserve its reported status. Mission completion permits revealing the last remaining Killer’s Final Health token. A Friend or reward can enter the story when verified.',
    visualGuidance: 'Depict a small 1980s American town split by a river: a green Falconwood road sign, bridges, a shopping mall, a fenced government lab, woods and farmland. Use the relevant landmark and current scene lighting. Include the pizza van only when reported.',
    rulesSummary: 'Bridges cross the river; River Crossings normally cannot be used and do not count as adjacent. A randomly selected Mission must be completed to win — the Killer cannot lose its final health until then. Cards can grant or lose Mission Progress. Completing the Mission grants a Friend (a Special Victim who follows into the Killer\u2019s space, is attacked last, and never panics beside you). Some cards call for a 20-sided die roll.',
  },
  'Marrek Warehouse': MARREK_PROMPT_CONTEXT,
  'Big Bad Wolf': WOLF_PROMPT_CONTEXT,
  'The Tormentor': TORMENTOR_PROMPT_CONTEXT,
};

export function getEntityPromptContext(entity: string): ModulePromptContext | undefined {
  return MODULE_PROMPT_CONTEXT[entity];
}

export function getModulePromptContext(killer: string, location: string): ModulePromptContext | null {
  const contexts = [getEntityPromptContext(killer), getEntityPromptContext(location)].filter(Boolean) as ModulePromptContext[];
  if (contexts.length === 0) return null;
  return {
    narrativeGuidance: contexts.map((c) => c.narrativeGuidance).join('\n'),
    visualGuidance: contexts.map((c) => c.visualGuidance).join('\n'),
    rulesSummary: contexts.map((c) => c.rulesSummary).join('\n'),
  };
}

/**
 * Build synthetic RuleSections + a RuleChapter from an EntityRuleModule so it
 * can be rendered through the same RuleChapter / RuleSubTabs pipeline as core
 * rules. Returns the chapter plus the two sections it references.
 */
export function buildEntityChapter(
  mod: EntityRuleModule,
  number: string
): { chapter: RuleChapter; sections: RuleSection[] } {
  const baseId = `${mod.kind}-${mod.entity.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const setupId = `${baseId}-setup`;
  const rulesId = `${baseId}-rules`;

  const sections: RuleSection[] = [
    {
      id: setupId,
      title: 'Special Setup',
      order: 10,
      tags: mod.tags,
      source: mod.source,
      body: mod.setup,
    },
    {
      id: rulesId,
      title: 'Special Rules',
      order: 20,
      tags: mod.tags,
      source: mod.source,
      body: mod.rules,
      seeAlso: mod.seeAlso,
    },
  ];

  const chapter: RuleChapter = {
    id: `ch-${baseId}`,
    number,
    title: mod.entity,
    subtitle: mod.kind === 'killer' ? 'Killer · Special Rules' : 'Location · Special Rules',
    sectionIds: [setupId, rulesId],
    tags: mod.tags,
  };

  return { chapter, sections };
}
