/** Rules and card faces from the owner's Once Upon a Full Moon photos, W1–W6. */
export const WOLF = "Big Bad Wolf";
export const WOLF_SOURCE = "Once Upon a Full Moon — Big Bad Wolf board, killer sheet and cards (owner photos W1–W6)";
export const WOLF_SETUP = { killerHealth: 9, finalHorrorLevel: 5, bloodlust: 0 } as const;
export const WOLF_VISUAL = "A massive gray wolf with coarse matted fur, a pale muzzle, red eyes and weathered wooden arrows embedded across its shoulders and back. Keep its recognizable face and animal anatomy even when it rears. Use the selected location and believable available light. The arrows are an identity detail, not a newly observed injury.";

export const WOLF_MODES = { track: "Track", slay: "Slay", both: "Track + Slay" } as const;
export type WolfMode = keyof typeof WOLF_MODES;
export function isWolfMode(value: unknown): value is WolfMode {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(WOLF_MODES, value);
}

export const WOLF_STARTING_ACTION = "Track: target the closest Victim or the Final Girl if closer, then move. Slay: target the closest Victim or the Final Girl if closer, then attack.";
export const WOLF_TIMING = "Resolve mode-specific Terror effects using the mode at the start of the Killer phase. When Track changes to Slay during that phase, use Track for the rest of it. Resolve effects with no mode symbol in either mode.";
export const WOLF_BLOODLUST = [
  { attack: 1, move: 3, entry: "Start" },
  { attack: 1, move: 3, entry: "Increase Horror by 1" },
  { attack: 1, move: 3, entry: "Reveal Dark Power" },
  { attack: 2, move: 3, entry: "" },
  { attack: 2, move: 3, entry: "Panic adjacent Victims" },
  { attack: 2, move: 3, entry: "Increase Horror by 2" },
  { attack: 3, move: 4, entry: "Recover 1 Killer Health" },
  { attack: 3, move: 4, entry: "Panic adjacent Victims" },
  { attack: 3, move: 4, entry: "Increase Horror by 1" },
  { attack: 3, move: 5, entry: "Recover 1 Killer Health" },
  { attack: 4, move: 6, entry: "" },
] as const;
export const WOLF_OVERFLOW = "At maximum Bloodlust, further increases recover 1 Killer Health per increase.";

export const WOLF_MINORS = [
  { id: "eyes", name: "What Big Eyes You Have!", health: 2, effect: "When you enter or begin your turn in the Wolf's space, discard a random Action card if able." },
  { id: "ears", name: "What Big Ears You Have!", health: 2, effect: "When you enter or begin your turn in the Wolf's space, lose 1 Health." },
  { id: "teeth", name: "What Big Teeth You Have!", health: 2, effect: "If the Wolf attacks you and you prevent all the damage, lose 1 Health." },
] as const;

export const WOLF_POWERS = [
  { id: "destructive-roar", name: "Destructive Roar", epic: false, effect: "Slay. On reveal and once each Upkeep, remove the top Item card of the Item deck closest to the Wolf from the game." },
  { id: "ravenous-hunger", name: "Ravenous Hunger", epic: false, effect: "Slay. On reveal, place the Wolf in the space with the most Victims and kill all Victims in that space." },
  { id: "sixth-sense", name: "Sixth Sense", epic: false, effect: "Slay. The Wolf ignores damage effects from Reaction cards such as Retaliate." },
  { id: "a-killing-machine", name: "A Killing Machine", epic: true, effect: "Epic. Resolve both the Track and Slay Killer actions for the rest of the game." },
] as const;

const closest = "Target the closest Victim or the Final Girl if closer";
const victim = "Target the closest Victim";
const noVictims = "If there are no Victims on the board, discard this card and draw the next Terror card.";
export const WOLF_FINALES = [
  { id: "tasty-treats", name: "Tasty Treats", effect: `${closest}, move, then attack twice. On reveal, recover 1 Killer Health per dead Victim.` },
  { id: "rampant-growth", name: "Rampant Growth", effect: `${closest}, move, then attack twice. Each time the Wolf attacks you, increase Horror by 1.` },
  { id: "thrill-of-the-hunt", name: "Thrill of the Hunt", effect: `${closest}, move and attack. Then target again and move. Each time the Wolf moves at least one space, recover 1 Killer Health.` },
] as const;

export const WOLF_TERRORS = [
  { id: "come-closer", name: "Come Closer, My Pretty", quantity: 1, effect: `Either mode: move yourself and all Victims one space toward the Wolf. ${closest} and attack three times. Recover 1 Killer Health for each Victim killed.` },
  { id: "claws-that-scratch", name: "The Claws That Scratch", quantity: 2, effect: `Either mode: ${closest.toLowerCase()} and move. Track: add 1 Bloodlust for yourself and each Victim in the Wolf's space, up to 3 total. Slay: divide its attack damage one at a time among as many Victims in its space as possible, then apply leftover damage to the Final Girl if she is there.` },
  { id: "grandma", name: "Grandma, Is That You?", quantity: 1, effect: `${noVictims} Track: all Victims move one space toward the Wolf. Slay: increase Horror by 1 per Victim in or adjacent to the Wolf's space.` },
  { id: "huff-and-puff", name: "I'll Huff and I'll Puff", quantity: 2, effect: `Track: ${closest.toLowerCase()}, move, increase Horror by 2. Slay: ${closest.toLowerCase()}, move, attack twice.` },
  { id: "red-glowing-eyes", name: "It Snarled with Red Glowing Eyes", quantity: 1, effect: `${noVictims} Track: ${victim.toLowerCase()}, move, increase Horror and Bloodlust by 1 each. Slay: ${closest.toLowerCase()}, move and attack.` },
  { id: "jaws-that-bite", name: "The Jaws That Bite", quantity: 3, effect: `${noVictims} Track: ${victim.toLowerCase()}, move, increase Horror and Bloodlust by 1 each. Slay: ${victim.toLowerCase()}, move and attack.` },
  { id: "going-for-a-walk", name: "Going for a Walk Today?", quantity: 1, effect: `${noVictims} Either mode: place the Wolf with the closest Victim. Track: increase Bloodlust by 1. Slay: ${victim.toLowerCase()} and attack.` },
  { id: "better-to-eat-you", name: "All the Better to Eat You", quantity: 1, effect: `Either mode: ${closest.toLowerCase()}, move and attack twice. Recover 1 Killer Health for each Victim killed.` },
  { id: "on-the-hunt", name: "On the Hunt", quantity: 1, effect: `Track: ${closest.toLowerCase()}, move twice and increase Bloodlust by 1. Slay: ${closest.toLowerCase()}, move twice and attack.` },
] as const;

export const wolfMinorField = (id: string) => `minor.${id}.health`;
export function validWolfField(key: string, value: unknown): boolean {
  if (key === "mode") return value === null || isWolfMode(value);
  return WOLF_MINORS.some(card => key === wolfMinorField(card.id) &&
    (value === null || (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= card.health)));
}

export function wolfPowerMode(name: string): WolfMode | undefined {
  const power = WOLF_POWERS.find(card => card.name === name);
  return power ? (power.epic ? "both" : "slay") : undefined;
}

export function wolfModeLabel(mode: unknown, revealed?: unknown): string {
  if (isWolfMode(mode)) return WOLF_MODES[mode];
  return revealed ? "Power revealed · mode unconfirmed" : "Mode unrecorded";
}

export function wolfFacts(state: Record<string, unknown>): string {
  const minors = WOLF_MINORS.flatMap(card => {
    const hp = state[wolfMinorField(card.id)];
    return typeof hp === "number" ? [`${card.name} ${hp}/2${hp === 0 ? " (removed)" : ""}`] : [];
  });
  return [
    `Big Bad Wolf recorded mode: ${wolfModeLabel(state.mode, state.powerRevealed)}.`,
    typeof state.power === "string" ? `Dark Power named: ${state.power}.` : "",
    typeof state.finale === "string" ? `Finale named: ${state.finale}.` : "",
    minors.length ? `Minor Powers: ${minors.join(", ")}.` : "",
    "Recorded cards and mode establish no attack, healing or casualties.",
  ].filter(Boolean).join(" ");
}
