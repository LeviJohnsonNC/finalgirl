import type { ModuleState } from "./modules.ts";

export const WOODS = "Storybook Woods";
export const WOODS_MODULE = "storybook-woods";
export const WOODS_SOURCE = "Once Upon a Full Moon — supplied Storybook Woods components";
export const WOODS_VISUAL = "An old timber-and-stone hamlet in dense, mossy woodland, with a winding river, narrow plank bridges and muddy paths. Separate landmarks include the Village, the Gingerbread House with baked trim, and Grandma’s secluded cottage. The Clearing, Dell, Glen and Meadow are distinct. Show specific landmarks only when the scene warrants them.";

export const WOODS_EVENTS = [
  {id:"primrose",name:"Primrose Flowers",effect:"While active, Victims immediately panic on entering the Meadow or Glen."},
  {id:"woodsman",name:"The Woodsman",effect:"The closest Victim becomes the Woodsman. He follows into the Killer’s space and adds one die per 3 Killer Health when you attack the Killer. Saving him doubles the save bonus. If he dies in your space, lose 3 Time. Discard when he leaves play."},
  {id:"piper",name:"Pied Piper",effect:"Place the Pied Piper in the Village. Other Victims sharing his space now or later are killed. Discard when he leaves play."},
  {id:"breadcrumb",name:"Breadcrumb Path",effect:"Choose two of Dell, Meadow and Clearing and place a Breadcrumb Path token in each. Treat the two as adjacent for your movement only. Victims cannot follow across the shortcut."},
  {id:"travelers",name:"Travelers",effect:"Add two Victims each to the Dell, Meadow and Clearing. Discard this Event."},
  {id:"toll",name:"Toll Bridge",effect:"Place the bridge so it touches two spaces across the river. They are adjacent. Spend 1 Time to cross and 1 additional Time if a Victim follows. At most one Victim may follow."},
  {id:"old-woman",name:"Harmless Old Woman",effect:"Move all Victims adjacent to the Killer into the Killer’s space. Discard this Event."},
  {id:"hansel",name:"Hansel",effect:"The closest Victim becomes Hansel. Once per turn, move one extra space when moving at least one space if he accompanies you throughout. At the Gingerbread House you may replace him with a normal Victim to take any one Item from that deck. If he dies in your space, increase Bloodlust twice. Discard when he leaves play."},
  {id:"friends",name:"Furry Friends",effect:"The Killer moves one space closer to you. If now in or adjacent to your space, increase Bloodlust once. Discard this Event."},
  {id:"fairy-ring",name:"Fairy Ring",effect:"Remove all Victims at the Glen from the game. They disappear without a kill or Bloodlust increase. Discard this Event."},
] as const;

export const WOODS_TERRORS = [
  {id:"sweets",name:"Have Some Sweets",effect:"Add two Victims to the Gingerbread House. At a search space you may spend 2 Time to take its top Item. Draw an Event."},
  {id:"rag-doll",name:"I Was Carried Like a Rag Doll!",effect:"Move the Killer three spaces toward Grandma’s House, carrying one Victim if able. Draw an Event."},
  {id:"treats",name:"Getting Treats for Grandmother",effect:"Take the Village deck’s top Item. The Killer targets the Final Girl, moves and attacks.",death:true},
  {id:"once",name:"Once Upon a Time",effect:"Add two Victims to Grandma’s House. The Killer recovers 1 Health. Draw an Event."},
  {id:"full-moon",name:"The Full Moon Is Out",effect:"Roll and place the Killer in Clearing (1–2), Meadow (3–4), or Glen (5–6). Kill all Victims in that space. If none was killed, draw and resolve the next Terror.",death:true},
  {id:"trees",name:"There’s Something in the Trees!",effect:"Move the Killer up to twice its Movement toward the closest target. Increase Bloodlust once if a Victim is in the Killer’s space."},
  {id:"out",name:"Out of the Woods",effect:"If no Victims remain on the board, discard and draw the next Terror. Otherwise move every Victim outside your space one space toward the Village. The Killer targets the Final Girl, moves and attacks.",death:true},
  {id:"helpless",name:"It Picked Me Up and I Was Helpless!",effect:"Move the Killer two spaces toward Grandma’s House, carrying one Victim if able. Draw an Event."},
] as const;

export const WOODS_ITEMS = [
  {name:"Lucky Rabbit’s Foot",effect:"Discard in the Action phase for a Horror roll. Per success choose +2 Time, recover 1 Health, reduce Horror by one, or move one space."},
  {name:"Thorny Vines",effect:"Spend 1 Time to place in your space. If the Killer enters, discard the token, deal 2 damage to the Killer and immediately end the Killer phase."},
  {name:"Slingshot",effect:"Range 1, 2 damage, two hands, two uses. Use without an Action card, once per round. Keep after depletion. Remove a Search card from hand from the game to replenish its uses."},
  {name:"Bread",effect:"Discard in the Action phase for +3 Time or move up to two spaces."},
  {name:"Songbirds",effect:"If the Killer is within two spaces, spend 3 Time to deal 3 damage to the Killer, then discard."},
  {name:"Knife",quantity:2,effect:"Range 0, 1 damage, one hand. You can attack with both if you have one in each hand."},
  {name:"Hatchet",effect:"Range 0 (or adjacent as below), 1 damage, one hand. On an adjacent attack, place its token in the target space and set the card aside. Discard Search there to retrieve it."},
  {name:"Chicken Bones",effect:"Three printed uses. Spend 1 Time to place a token in your space. When an Enemy enters, discard that token and deal 1 damage to the Enemy."},
  {name:"Archery Bow",effect:"Range 1–2, 1 damage, two hands, three printed uses. Use without an Action card. Spend 2 Time per arrow."},
  {name:"Flowers",effect:"Three printed uses. Once per Action phase, when Horror is at least 2, reduce Horror by one."},
  {name:"Raft",effect:"Place four tokens on distinct marked non-exit spaces touching the river. Use one movement to move from one marked landing with a token to another with a token, spending 1 Time per token passed, including both ends."},
  {name:"Red Cape",effect:"When the Killer’s targeting is tied between you and a Victim, the Killer targets you."},
  {name:"Pitchfork",effect:"Range 0, 1 damage, two hands. Discard at any time to prevent all damage from one attack."},
  {name:"Map",effect:"Discard in the Action phase. For each Item deck, reveal the top card if facedown, or optionally remove the faceup top card from the game and reveal the next."},
  {name:"Candy",effect:"Discard in the Action phase for a five-die Horror roll. Per success choose recover 2 Health, +2 Time, or move one space."},
  {name:"Basket",effect:"Shuffle unused Item cards and draw three. Keep the Items that are not weapons."},
  {name:"Cage",effect:"Discard to retrieve Songbirds from the Item discard pile or unused Items."},
] as const;

export const WOODS_SPACES = [
  {id:"village",name:"Village",search:true},
  {id:"village-bank",name:"Village approach",landing:true},
  {id:"dell",name:"Dell",landing:true},
  {id:"southwest-bank",name:"Southwest bank",landing:true},
  {id:"west-exit",name:"Southwest exit",exit:true},
  {id:"glen",name:"Glen",landing:true},
  {id:"clearing",name:"Clearing",landing:true},
  {id:"center-bank",name:"Central bank",landing:true},
  {id:"gingerbread",name:"Gingerbread House",search:true},
  {id:"northeast-bank",name:"Northeast bank",landing:true},
  {id:"east-exit",name:"Northeast exit",exit:true},
  {id:"east-bank",name:"East river bend",landing:true},
  {id:"grandma",name:"Grandma’s House",search:true,landing:true},
  {id:"meadow",name:"Meadow",landing:true},
  {id:"southeast-bank",name:"Southeast bank",landing:true},
] as const;
export const WOODS_BRIDGES = [
  ["village-bank","glen"], ["dell","glen"], ["northeast-bank","east-exit"],
] as const;
export type WoodsSpace = typeof WOODS_SPACES[number]["id"];
export const woodsSpaceName = (id: WoodsSpace) => WOODS_SPACES.find(space => space.id === id)!.name;
const normalize = (name: string) => name.toLowerCase().replace(/[’']/g, "").trim();
export function woodsRoom(name: string) {
  const normalized = normalize(name);
  if (normalized === "grandmothers house") return "grandma";
  return WOODS_SPACES.find(space => normalize(space.name) === normalized)?.id;
}
export function woodsMoonSpace(name: string) {
  const id = woodsRoom(name);
  return id === "clearing" || id === "meadow" || id === "glen" ? id : undefined;
}

export const WOODS_PEOPLE = [
  {id:"hansel",name:"Hansel"}, {id:"woodsman",name:"The Woodsman"}, {id:"piper",name:"Pied Piper"},
] as const;
export const WOODS_PAIRS = [
  {id:"dell-meadow",label:"Dell ↔ Meadow"},
  {id:"dell-clearing",label:"Dell ↔ Clearing"},
  {id:"meadow-clearing",label:"Meadow ↔ Clearing"},
] as const;
type Person = typeof WOODS_PEOPLE[number]["id"];
type Pair = typeof WOODS_PAIRS[number]["id"];
export type WoodsPersonStatus = "absent" | "in-play" | "saved" | "killed" | "left" | "replaced";
type Toggle = "toll" | "raft" | "primrose";
const toggles = ["toll", "raft", "primrose"] as const;
const statuses = ["absent", "in-play", "saved", "killed", "left", "replaced"] as const;
type Breadcrumb = Pair | "unrecorded-pair" | "absent";
type WoodsValue = boolean | WoodsPersonStatus | Breadcrumb;
type WoodsSnapshot = Partial<Record<Toggle, boolean> & Record<Person, WoodsPersonStatus> & { breadcrumb: Breadcrumb }>;
export type WoodsCommand =
  | { field: Toggle; value: boolean }
  | { field: Person; value: WoodsPersonStatus }
  | { field: "breadcrumb"; value: Breadcrumb };
export type WoodsAction = WoodsCommand & { parent: string };
export interface WoodsEntry { id: string; kind: string; moduleData?: { module: string; changes: ModuleState } }

function validField(field: string, value: unknown): value is WoodsValue {
  if (toggles.some(toggle => toggle === field)) return typeof value === "boolean";
  if (field === "breadcrumb")
    return value === "absent" || value === "unrecorded-pair" || WOODS_PAIRS.some(pair => pair.id === value);
  return WOODS_PEOPLE.some(person => person.id === field) &&
    statuses.some(status => status === value) && (value !== "replaced" || field === "hansel");
}

const fields = [...toggles, "breadcrumb", ...WOODS_PEOPLE.map(person => person.id)] as const;
function serialize(state: WoodsSnapshot) {
  return JSON.stringify(Object.fromEntries(fields.filter(field => state[field] !== undefined).map(field => [field, state[field]])));
}

export function parseWoods(value: unknown): WoodsSnapshot | null {
  if (typeof value !== "string" || value.length > 512) return null;
  try {
    const state: unknown = JSON.parse(value);
    if (!state || typeof state !== "object" || Array.isArray(state) ||
      !Object.entries(state).every(([field, value]) => validField(field, value))) return null;
    return state;
  } catch {
    return null;
  }
}
export const woodsState = (state: ModuleState): WoodsSnapshot => parseWoods(state.snapshot) ?? {};

export function initialWoods(event?: string | null): ModuleState | undefined {
  const card = WOODS_EVENTS.find(card => normalize(card.name) === normalize(event ?? "") ||
    card.id === "toll" && normalize(event ?? "") === "troll bridge");
  if (!card) return;
  const state: WoodsSnapshot = { toll:false, raft:false, primrose:false, breadcrumb:"absent", hansel:"absent", woodsman:"absent", piper:"absent" };
  if (card.id === "toll" || card.id === "primrose") state[card.id] = true;
  if (card.id === "breadcrumb") state.breadcrumb = "unrecorded-pair";
  if (card.id === "hansel" || card.id === "woodsman" || card.id === "piper") state[card.id] = "in-play";
  return { snapshot: serialize(state) };
}

export function isInitialWoods(changes: ModuleState) {
  return Object.keys(changes).length === 1 &&
    WOODS_EVENTS.some(card => initialWoods(card.name)?.snapshot === changes.snapshot);
}

export const woodsParent = (entries: readonly WoodsEntry[]) =>
  [...entries].reverse().find(event => event.kind === "module" && event.moduleData?.module === WOODS_MODULE)?.id ?? "root";

export function validWoodsAction(input: unknown): input is WoodsAction {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const {parent, field, value} = input as Partial<WoodsAction>;
  return Object.keys(input).length === 3 && typeof parent === "string" && parent.length > 0 &&
    parent.length <= 80 && typeof field === "string" && validField(field, value);
}

export function resolveWoodsAction(action: WoodsAction, state: ModuleState, entries: readonly WoodsEntry[]): ModuleState | null {
  if (!validWoodsAction(action) || action.parent !== woodsParent(entries)) return null;
  const current = woodsState(state);
  if (current[action.field] === action.value) return null;
  return {snapshot: serialize({...current, [action.field]: action.value})};
}

export const woodsBreadcrumbLabel = (value?: Breadcrumb) =>
  WOODS_PAIRS.find(pair => pair.id === value)?.label ??
  (value === "absent" ? "Not placed" : value === "unrecorded-pair" ? "Placed · Pair not recorded" : "Not recorded");

export function describeWoodsAction(action: WoodsAction) {
  switch (action.field) {
    case "toll": return `Toll Bridge: ${action.value ? "placed" : "not placed"}`;
    case "raft": return `Raft landings: ${action.value ? "placed" : "not placed"}`;
    case "primrose": return `Primrose Flowers: ${action.value ? "active" : "inactive"}`;
    case "breadcrumb": return `Breadcrumb Path: ${woodsBreadcrumbLabel(action.value)}`;
    default: {
      const name = WOODS_PEOPLE.find(person => person.id === action.field)!.name;
      return `${name}: ${action.value === "replaced" ? "replaced at Gingerbread House" : action.value.replace("-", " ")}`;
    }
  }
}

export function woodsFacts(state: WoodsSnapshot) {
  const facts: string[] = [];
  if (state.toll) facts.push("Toll Bridge placed; endpoints unrecorded.");
  if (state.raft) facts.push("Raft landings placed; positions unrecorded.");
  if (state.breadcrumb && state.breadcrumb !== "absent") facts.push(`Breadcrumb Path: ${woodsBreadcrumbLabel(state.breadcrumb)}.`);
  if (state.primrose) facts.push("Primrose Flowers active in Meadow and Glen.");
  for (const person of WOODS_PEOPLE) {
    const status = state[person.id];
    if (!status || status === "absent") continue;
    facts.push(`${person.name}: ${status === "replaced" ? "replaced at Gingerbread House" : status.replace("-", " ")}.`);
  }
  return facts;
}

export const WOODS_SETUPS: readonly {name:string; girl:WoodsSpace; killer:WoodsSpace; victims:Partial<Record<WoodsSpace,number>>}[] = [
  {name:"Breadcrumb Trail",girl:"center-bank",killer:"east-bank",victims:{"village-bank":1,dell:1,glen:5,gingerbread:2,"northeast-bank":1,meadow:1,"southeast-bank":1}},
  {name:"Picnic",girl:"dell",killer:"glen",victims:{"village-bank":1,"southwest-bank":1,clearing:2,"center-bank":2,gingerbread:2,"east-bank":1,meadow:2,"southeast-bank":1}},
  {name:"Family Visit",girl:"grandma",killer:"village",victims:{"village-bank":1,dell:2,glen:1,clearing:2,"northeast-bank":2,meadow:3,"southeast-bank":1}},
  {name:"Scatter!",girl:"center-bank",killer:"east-exit",victims:{village:1,"village-bank":1,dell:1,"southwest-bank":1,glen:1,clearing:1,gingerbread:1,"northeast-bank":1,"east-bank":1,grandma:1,meadow:1,"southeast-bank":1}},
  {name:"Forest Dwellers",girl:"gingerbread",killer:"glen",victims:{village:2,"southwest-bank":2,clearing:2,"center-bank":1,"east-bank":1,grandma:1,meadow:2,"southeast-bank":1}},
];
export function woodsSetupDescription(setup: typeof WOODS_SETUPS[number]) {
  const placement = WOODS_SPACES.flatMap(space => {
    const count = setup.victims[space.id];
    return count ? [`${count} at ${space.name}`] : [];
  });
  return `Final Girl: ${woodsSpaceName(setup.girl)}. Killer: ${woodsSpaceName(setup.killer)} (apply killer-specific setup). Victims: ${placement.join(", ")}.`;
}
