/** Owner-verified standard-mode references: IMG_9333–IMG_9337 and the supplied
 * Finale-back screenshot (2026-10-22 17:48). Summaries, not a rules engine. */
import type { ModuleState, ModuleValue } from "./modules.ts";
export const GEPPETTO_SOURCE =
  "Owner photos IMG_9333–IMG_9337; Finale-back screenshot 2026-10-22 17:48";
export const GEPPETTO_VISUAL =
  "Geppetto is a tall, extremely gaunt pale human puppeteer with hollow dark eyes, a sinister narrow grin, a battered tall black top hat with a brass band, a distressed long dark ringmaster coat, red waistcoat and tarnished gold trim. His long bony hands hold wooden marionette crossbars with visible strings. His puppets are shabby sinister humanlike marionettes, never Buddyland animatronics or cute robots. He is theatrical and deliberate. Preserve this identity in the selected location; a carnival backdrop is not required. Do not invent teleportation or depict the Final Girl as a puppet unless recorded.";
export const GEPPETTO_PUPPETS = [
  { id: "1", name: "Puppet 1" },
  { id: "2", name: "Puppet 2" },
  { id: "3", name: "Puppet 3" },
] as const;
export const PUPPET_STATUSES = ["ready", "on-board", "exhausted"] as const;
export type PuppetStatus = (typeof PUPPET_STATUSES)[number];
export const GEPPETTO_POWERS = [
  {
    id: "weapons-graft",
    name: "Weapons Graft",
    effect: "Puppets now deal two damage when attacking.",
  },
  {
    id: "massive-abominations",
    name: "Massive Abominations",
    effect:
      "Each Puppet ignores the first damage dealt to it each turn. This is damage prevention, not extra Health.",
  },
  {
    id: "immortal-master",
    name: "Immortal Master",
    effect:
      "While all three Puppets are on the board, Geppetto cannot be killed: ignore damage that would remove his Final Health token. Ordinary Health can still be damaged.",
  },
  {
    id: "join-the-family",
    name: "Join the Family",
    epic: true,
    effect:
      "Epic Dark Power. During the Killer phase, if all three Puppets share the Final Girl’s space, she loses all remaining Health. Resolve her Final Health token normally. Three Puppets on the board alone does not establish this condition.",
  },
] as const;
export const GEPPETTO_MINOR_POWERS = [
  {
    id: "am-i-a-puppet",
    name: "Am I a Puppet?",
    health: 2,
    effect:
      "If the Final Girl starts her turn more than two spaces from Geppetto, she loses Health equal to his current Attack value.",
  },
  {
    id: "puppets-everywhere",
    name: "Puppets Everywhere",
    health: 2,
    effect:
      "Whenever a Victim is killed in the Final Girl’s space or an adjacent space, increase Horror by one.",
  },
] as const;
export const GEPPETTO_FINALES = [
  {
    id: "remember-them",
    name: "Remember Them?",
    effect:
      "When revealed, spawn all remaining Puppets to the board. Puppets move one fewer space than normal. Minion Action: target the closest Final Girl or Victim, move and attack. Killer Action: target the Final Girl, move and attack twice.",
  },
  {
    id: "i-made-your-friends",
    name: "I Made Your Friends",
    effect:
      "During the Killer phase, Victims act as Puppets. At all other times they remain normal Victims. The Final Girl may attack and kill Victims, increasing Bloodlust as normal. This does not add physical Puppet tokens to the three-token pool. Minion and Killer Actions: target the closest Final Girl or Victim, move and attack.",
  },
  {
    id: "no-strings-attached",
    name: "No Strings Attached",
    effect:
      "Puppets are no longer bound to Geppetto and may move without the normal string-distance restriction. Puppets move one additional space. Minion and Killer Actions: target the closest Final Girl or Victim, move and attack.",
  },
] as const;
const terrors = [
  ...GEPPETTO_MINOR_POWERS.map((c) => ({
    name: c.name,
    effect: `Minor Dark Power with two separate Health markers. ${c.effect}`,
  })),
  {
    name: "Endless Maddening Laughter",
    effect:
      "Panic Victims in spaces adjacent to the Final Girl. Kill Victims sharing a space with an Enemy. If the Final Girl is in or adjacent to Geppetto’s space, she loses Health equal to his Attack. If no Victims were killed and she took no damage, resolve the next Terror card.",
  },
  {
    name: "Bring Her to Me!",
    effect:
      "The Puppet closest to the Final Girl targets her, moves and attacks. If it damaged her, move her one space closer to Geppetto. Discard this card if she is in Geppetto’s space or no Puppets share her space; otherwise repeat the entire card.",
  },
  {
    name: "You’ll Make a Fun New Toy...",
    effect:
      "Increase Horror by two. Target the closest Final Girl or Victim, move and attack.",
  },
  {
    name: "Master Showman",
    effect:
      "Place Geppetto in the Final Girl’s space. Place a Puppet in each adjacent space if able. Target the closest Final Girl or Victim and attack.",
  },
  {
    name: "Replacement Parts",
    effect:
      "Place two new Victims at Geppetto’s starting location, then place Geppetto with the closest Victim. Target a Victim and attack. For each Victim killed, increase Bloodlust by one and Geppetto recovers one Health.",
  },
  {
    name: "They’re Gaining on Me!",
    effect:
      "Roll a die. If below the Horror level, lose Time equal to the Horror level. Puppets only: target the Final Girl and move.",
  },
  {
    name: "They Have Us Completely Surrounded!",
    effect:
      "With no Victims, discard and resolve the next Terror card. Otherwise increase Horror by one, then target a Victim, move and attack.",
  },
  {
    name: "They’re Coming from Everywhere!",
    effect:
      "Roll a die. If below the Horror level, spawn all remaining Puppets, regardless of Ready or Exhausted status, in Geppetto’s space. Puppets only: target the Final Girl, move and attack.",
  },
  {
    name: "Dear Lord, Are Those Our Friends?",
    effect:
      "Target a Victim, move and attack. Roll for each Victim with or adjacent to a Puppet: on 1–5 move that Victim toward the Puppet; on 6 move the Victim one space in any direction. Then target a Victim, move and attack again.",
  },
  {
    name: "There Is No Escape",
    effect:
      "Increase Horror by one. Distribute Geppetto and each Puppet evenly among exit spaces. Target a Victim, move and attack.",
  },
  {
    name: "Dance Puppet!",
    effect:
      "Make a Horror roll. On success, move all Puppets one space toward the Final Girl or the nearest Victim, your choice. On failure, kill a Victim in the Final Girl’s space; if there are none, increase Horror by two.",
  },
  {
    name: "Razor Puppet Strings",
    effect:
      "Kill Victims in or adjacent to Geppetto’s space. If the Final Girl is there or adjacent, she loses two Health, reduced by one for each Walk or Sprint card discarded. If no Victims were killed and she took no damage, resolve the next Terror card.",
  },
  {
    name: "Boxed In With Nowhere to Go",
    effect:
      "With no Victims, discard and resolve the next Terror card. Otherwise increase Horror by two, then panic Victims with or adjacent to Puppets. A Victim panicking into a Puppet’s space is killed immediately.",
  },
  {
    name: "Make or Break",
    effect:
      "Roll a die. The Final Girl must lose Health equal to half the result, rounded up, or kill that many Victims instead.",
  },
] as const;
export const GEPPETTO_TERRORS = terrors.map((c) => ({
  ...c,
  killer: "Geppetto",
  source: GEPPETTO_SOURCE,
}));

export const initialGeppettoPuppets = (): Record<string, ModuleValue> =>
  Object.fromEntries(
    GEPPETTO_PUPPETS.map((p) => [`puppet.${p.id}.status`, "ready"]),
  );
export function geppettoPuppetCounts(state: ModuleState) {
  const statuses = GEPPETTO_PUPPETS.map((p) => state[`puppet.${p.id}.status`]);
  return {
    recorded: statuses.every((s) =>
      PUPPET_STATUSES.includes(s as PuppetStatus),
    ),
    ready: statuses.filter((s) => s === "ready").length,
    onBoard: statuses.filter((s) => s === "on-board").length,
    exhausted: statuses.filter((s) => s === "exhausted").length,
  };
}
export function validGeppettoField(key: string, value: unknown) {
  if (/^puppet\.[1-3]\.status$/.test(key))
    return value === null || PUPPET_STATUSES.includes(value as PuppetStatus);
  if (/^puppet\.[1-3]\.protectionUsed$/.test(key))
    return value === null || typeof value === "boolean";
  const minor = GEPPETTO_MINOR_POWERS.find(
    (p) => key === `minor.${p.id}.health`,
  );
  return (
    !!minor &&
    (value === null ||
      (Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 2))
  );
}
/** One observation contains every affected token. Normal spawning deliberately
 * chooses Ready BEFORE returning Exhausted tokens; no movement or damage is resolved. */
export function geppettoSpawnChanges(
  state: ModuleState,
  kind: "normal" | "one" | "all",
): Record<string, ModuleValue> | null {
  if (
    !geppettoPuppetCounts(state).recorded ||
    (kind === "normal" && state.finaleRevealed)
  )
    return null;
  const next = Object.fromEntries(
    GEPPETTO_PUPPETS.map((p) => [
      `puppet.${p.id}.status`,
      state[`puppet.${p.id}.status`],
    ]),
  );
  const ready = GEPPETTO_PUPPETS.find(
    (p) => next[`puppet.${p.id}.status`] === "ready",
  );
  if (kind === "all")
    for (const p of GEPPETTO_PUPPETS)
      next[`puppet.${p.id}.status`] = "on-board";
  else if (ready) next[`puppet.${ready.id}.status`] = "on-board";
  if (kind === "normal")
    for (const p of GEPPETTO_PUPPETS)
      if (next[`puppet.${p.id}.status`] === "exhausted")
        next[`puppet.${p.id}.status`] = "ready";
  return Object.keys(next).some((k) => next[k] !== state[k]) ? next : null;
}
