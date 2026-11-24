export const HELLSCAPE = "Hellscape";
export const HELLSCAPE_MODULE = "hellscape";
export const HELLSCAPE_SOURCE = "Hell to Pay · Hellscape board, rules and location cards (owner photos IMG_9629–9635)";
export const HELLSCAPE_SPACES = ["The Nexus", "House of Mutilation", "Sepulchre of Blood"] as const;
export const HELLSCAPE_VISUAL = "A shifting underground labyrinth of worn limestone chambers, iron gates and stairs, with soot-red light spilling into dark passages. The Nexus is a central crossing with four stair approaches. The House of Mutilation and Sepulchre of Blood are separate chambers. Use physical stone, iron and practical lighting. Keep the specific layout, gate positions and people unspecified unless recorded.";

export const HELLSCAPE_PEOPLE = [
  {
    id: "peon", name: "Masochistic Peon", color: "ivory",
    reminder: "End of Action together? You may take 1 Health from the Peon.",
    effect: "Replace the closest Victim with the Peon and give the Event card 4 Health. At the end of Action, if the Peon shares your space, you may transfer 1 of that Health to yourself. Attacks also reduce its Health. The Peon dies when its last Health marker is gone. Discard the Event when the Peon leaves play.",
  },
  {
    id: "wretch", name: "Curious Wretch", color: "blue",
    reminder: "Moves at least one space: lose 1 Time. Saved: lower Horror by 1 and recover 1 Health.",
    effect: "Replace the closest Victim with the Wretch. When the Wretch moves at least one space, lose 1 Time. On rescue, decrease Horror by 1 and recover 1 Health. Discard the Event when the Wretch leaves play.",
  },
  {
    id: "seeker", name: "Sadistic Seeker", color: "orange",
    reminder: "Shares your space in Upkeep: lose 1 Health. Dies in your space: lower Horror by 4.",
    effect: "Replace the closest Victim with the Seeker. If the Seeker shares your space during Upkeep, lose 1 Health. If the Seeker dies in your space, decrease Horror by 4. Discard the Event when the Seeker leaves play.",
  },
] as const;

export const HELLSCAPE_EVENTS = [
  ...HELLSCAPE_PEOPLE.map(({ id, name, effect }) => ({ id, name, effect })),
  { id: "lost-in-excess", name: "Lost in Excess", effect: "Horror changes beyond either end of the track do not trigger the usual Bloodlust or Time increase." },
  { id: "endless-suffering", name: "Endless Suffering", effect: "Lose 1 Health whenever you Search in the House of Mutilation." },
  { id: "delight-in-pain", name: "Delight in Pain", effect: "Recover 1 Health whenever you Search in the Sepulchre of Blood." },
  { id: "chaotic-transference", name: "Chaotic Transference", effect: "Exchange the entire Item decks at the Sepulchre of Blood and House of Mutilation, then discard this Event." },
  { id: "barrier-of-blood", name: "Barrier of Blood", effect: "Choose which function of The Nexus to cover with the token. Its remaining function is either Exit or Search." },
  { id: "stare-into-the-abyss", name: "Stare into the Abyss...", effect: "Lose 1 Time whenever you move to a Hellscape tile." },
  { id: "torture-chambers", name: "Torture Chambers", effect: "Roll both Hellscape dice. For each die, put one Chamber token on a space of your choice on the matching tile. Increase Horror by 1 when a Victim dies in either marked space." },
] as const;

export const HELLSCAPE_TERRORS = [
  { name: "Spiral of Horrors", effect: "Shift every tile one slot clockwise. Place a new Victim on the wheel tile and another on the striped tile, in spaces of your choice. Draw an Event.", death: false },
  { name: "Spiral of Death", effect: "Shift every tile one slot counterclockwise. Place a new Victim on the star tile and another on the square tile, in spaces of your choice. Target the closest Victim or Final Girl, move and attack.", death: true },
  { name: "Planes of Torment", effect: "Increase Horror by 1 if the Final Girl or Killer occupies a Hellscape tile. Target the closest Victim or Final Girl, move and attack.", death: true },
  { name: "Death Labyrinth", effect: "Discard and redraw if there are no Victims on the board. Otherwise, all Victims Panic. Kill the Victims who enter the Killer’s space this way, then draw an Event.", death: true },
  { name: "Home to Endless Appetites", effect: "Add a Victim to each of the three named spaces, then draw two Events.", death: false },
  { name: "Devoid of Life", effect: "Discard and redraw if there are no Victims in your space. Otherwise, choose to kill one Victim there or lose 1 Health. Increase Horror by 1 after that choice.", death: true },
  { name: "Seductive Hellpit", effect: "Discard and redraw if there are no Victims on the board. Otherwise, move each Victim adjacent to a named space into that named space. Target the closest Victim, move and attack.", death: true },
  { name: "Hunger for Suffering", effect: "Roll both Hellscape dice. For each die, add one Victim to a space of your choice on the indicated tile. Target the closest Victim or Final Girl, move and attack.", death: true },
] as const;

export const HELLSCAPE_ITEMS = [
  { name: "Pins of Pain & Pleasure", effect: "Three uses. Once per Action phase while sharing the Killer’s space, let the Killer recover 1 Health, then gain 3 Time." },
  { name: "Haladie", effect: "Weapon, range 0, +1 damage, two hands. Deal 1 additional damage if the target is on a Hellscape tile." },
  { name: "Ancient Sword", effect: "Weapon, range 0, +1 damage, two hands. Whenever you damage the Killer, decrease Horror by 1." },
  { name: "Nexus Controller", effect: "Two uses. Rearrange the four Hellscape tiles in any order with their current faces up." },
  { name: "Goblet of Blood", effect: "Two uses. Recover 2 Health per use." },
  { name: "Book of Ecstasy", effect: "Three uses. Prevent one increase of 1 Horror per use." },
  { name: "Gambler’s Cube", effect: "Discard in the Action phase and roll a die. On 1–2 lose 1 Health and roll again. On 3–4 gain 2 Time or roll again. On 5 take any top Item card. On 6 take any Action card." },
  { name: "Rusty Flesh Hook", effect: "Weapon, range 0, +1 damage, one hand." },
  { name: "Discipline of Courage", effect: "Once per Action phase, you may lose 1 Health to decrease Horror by 1." },
  { name: "Discipline of Choices", effect: "Once per Action phase, you may lose 1 Health to gain 2 Time." },
  { name: "Discipline of Cruelty", effect: "Once per Action phase, you may lose 2 Health to deal 1 damage to any Enemy on the board." },
  { name: "Bone Key", effect: "Put the Bone Chariot in the closest tile space. Once per Action phase while with it, spend 2 Time to move with it to any Hellscape tile space. It can travel with you during normal movement between tile spaces and must stay on Hellscape tiles." },
  { name: "Spiked Whip", effect: "Weapon, range 0–1, +1 damage, one hand. When it damages an Enemy, you may move that Enemy one space." },
  { name: "Control Node", effect: "Two uses, two hands. Immediately place yourself and up to one Victim from your space on any Exit space." },
  { name: "Seething Orb", effect: "Weapon, range 2, +2 damage, two hands, two uses." },
  { name: "Amulet of Hell", effect: "Gain 1 Time whenever you end your movement on a Hellscape tile." },
  { name: "Miracle of Faith", effect: "Discard during the Action phase. Choose to recover all Health or lower Horror to the minimum." },
  { name: "Hellish Contract", effect: "Spend 1 Time to put a Contract token in your space. Whenever the Killer enters a space with a Contract, you may lose 1 Health to decrease Horror by 3. Two tokens are supplied." },
] as const;

const [nexus, house, sepulchre] = HELLSCAPE_SPACES;
const approaches = {
  nw: "House of Mutilation approach (top left)",
  ne: "Top-right Exit approach",
  sw: "Bottom-left Exit approach",
  se: "Sepulchre of Blood approach (bottom right)",
} as const;
export const HELLSCAPE_SETUPS = [
  { name: "Depravity", girl: approaches.ne, killer: approaches.sw, victims: [[2, approaches.nw], [1, nexus], [1, approaches.se]] },
  { name: "Rapture", girl: approaches.se, killer: approaches.nw, victims: [[2, approaches.sw], [1, house], [1, sepulchre]] },
  { name: "Revelation", girl: approaches.sw, killer: nexus, victims: [[2, house], [2, sepulchre]] },
  { name: "Ecstasy", girl: nexus, killer: "Top-right Exit", victims: [[1, approaches.sw], [1, approaches.se], [2, approaches.ne]] },
  { name: "Sensation", girl: approaches.nw, killer: approaches.se, victims: [[2, approaches.sw], [2, approaches.ne]] },
] as const;
export const HELLSCAPE_SETUP = [
  "Shuffle the four double-sided tiles and deal them into the empty slots. Keep each symbol at the top left with its Panic numbers upright.",
  "Put one Victim in every tile space, eight across the four tiles. Reveal a Setup card and add the card’s four Victims and starting positions.",
  "Put Hellshift into the Action tableau.",
] as const;
export const HELLSCAPE_UPKEEP = [
  "Matching symbols: flip the indicated tile. Put every piece and token back on its corresponding colored space.",
  "Different symbols: swap those two tiles. Keep their current faces, orientation and all pieces on them.",
] as const;
export const HELLSHIFT = {
  name: "Hellshift", cost: 2,
  outcomes: [
    ["2+ successes", "Rearrange the four tiles as you choose, keeping their current faces."],
    ["1 success", "Swap two tiles of your choice, then lose 1 Time."],
    ["0 successes", "Lose 2 Time."],
  ],
} as const;

export const HELLSCAPE_STATUSES = [
  { value: "in-play", label: "In play" }, { value: "saved", label: "Saved" },
  { value: "killed", label: "Killed" }, { value: "left-play", label: "Left play" },
] as const;
export type HellscapePerson = (typeof HELLSCAPE_PEOPLE)[number]["id"];
export type HellscapeStatus = (typeof HELLSCAPE_STATUSES)[number]["value"];
export const hellscapePersonKey = (id: HellscapePerson) => `person.${id}`;
export const hellscapePerson = (key: string) => HELLSCAPE_PEOPLE.find(person => hellscapePersonKey(person.id) === key);
export function validHellscapeObservation(changes: Record<string, unknown>) {
  const fields = Object.entries(changes);
  return fields.length === 1 && fields.every(([key, value]) =>
    !!hellscapePerson(key) && (value === null || HELLSCAPE_STATUSES.some(status => status.value === value)));
}
export function hellscapeFacts(state: Record<string, unknown>) {
  return HELLSCAPE_PEOPLE.flatMap(person => {
    const status = HELLSCAPE_STATUSES.find(item => item.value === state[hellscapePersonKey(person.id)]);
    return status ? [`${person.name}: ${status.label.toLowerCase()}.`] : [];
  }).join(" ");
}
