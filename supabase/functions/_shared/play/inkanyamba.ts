/** Standard mode, verified against Levi's physical components, 2026-10-25.
 * IMG_9363 board; IMG_9364–65 rules; IMG_9366 Wrath/Powers/Finales;
 * IMG_9367 Terror deck and pre-Finale face. Not a physical rules simulator. */
import type { ModuleState } from "./modules.ts";
export const INKANYAMBA_SOURCE =
  "Owner photos IMG_9363–IMG_9367 (2026-10-25), standard mode";
export const INKANYAMBA_VISUAL =
  "Inkanyamba the Avenger is a muscular dark-skinned human-shaped killer, not a serpent or weather creature. He wears an angular bone-white skull-like mask with pointed cheek contours, a tall swept-back black feather crest, grey-white fur and feather mantle, curved tusk/bone ornaments, dark skirt and skull buckle. Both hands carry matching curved axe-like scythes. Keep this masked silhouette and paired weapons consistent in the selected Location. Do not invent weather-controlled movement or a Sacred Groves setting.";
export const INKANYAMBA_POWERS = [
  {
    id: "rising-dread",
    name: "Rising Dread",
    effect: "Whenever Killer Wrath increases, increase Horror by 1.",
  },
  {
    id: "volatile-temper",
    name: "Volatile Temper",
    effect:
      "At the end of Upkeep, make a Horror roll. With at least one success, no effect; with no successes, Unleash Killer Wrath.",
  },
  {
    id: "feast-of-anger",
    name: "Feast of Anger",
    effect: "Whenever Killer Wrath increases, Inkanyamba recovers 1 Health.",
  },
  {
    id: "dark-lightning",
    name: "Dark Lightning",
    epic: true,
    effect:
      "Epic Dark Power. Whenever Inkanyamba kills a Victim, kill a second Victim in the same or an adjacent space if able.",
  },
] as const;
export const INKANYAMBA_MINOR_POWERS = [
  {
    id: "boiling-anger",
    name: "Boiling Anger",
    health: 3,
    effect:
      "Once during each Upkeep, make a Horror roll. With at least one success, no effect; with no successes, increase Killer Wrath by 1.",
  },
  {
    id: "outrageholic",
    name: "Outrageholic",
    health: 3,
    effect:
      "Every time Killer Wrath is increased, increase it by an additional 1.",
  },
] as const;
export const INKANYAMBA_PRE_FINALE =
  "If Killer Wrath is 1–2, increase it by 1. Then target the closest Final Girl or Victim and attack.";
export const INKANYAMBA_FINALES = [
  {
    id: "violent-tantrum",
    name: "Violent Tantrum",
    effect:
      "Killer Action, in order: Unleash Killer Wrath; increase Killer Wrath by 3; target the closest Final Girl or Victim; move; attack.",
  },
  {
    id: "we-need-a-miracle",
    name: "We Need a Miracle",
    effect:
      "When revealed, increase Killer Wrath to 10, then take up to 6 Time worth of Action cards into your hand. Killer Action: Unleash Killer Wrath, then target the closest Final Girl or Victim, move and attack.",
  },
  {
    id: "savage-whirlwind",
    name: "Savage Whirlwind",
    effect:
      "Killer Action, in order: Unleash Killer Wrath; increase Killer Wrath by 1; target the closest Final Girl or Victim; move; attack twice.",
  },
] as const;
/** Every row is the printed ordered Unleash line, not effects on increasing Wrath. */
export const INKANYAMBA_UNLEASH = [
  "Increase Killer Wrath by 1.",
  "Increase Killer Wrath by 2.",
  "Increase Horror by 1.",
  "Increase Horror by 1; target the closest Final Girl or Victim; move.",
  "Increase Horror by 2.",
  "Target the closest Final Girl or Victim; move; attack.",
  "Recover 1 killer Health; target the closest Final Girl or Victim; move; attack.",
  "Recover 1 killer Health; increase Horror by 1; target the closest Final Girl or Victim; move; attack.",
  "Recover 2 killer Health; increase Horror by 1; target the closest Final Girl or Victim; move; attack.",
  "Recover 3 killer Health; increase Horror by 1; target the closest Final Girl or Victim; move; attack twice.",
] as const;
export const INKANYAMBA_BLOODLUST = [
  { attack: 1, move: 2 },
  { attack: 1, move: 2 },
  { attack: 1, move: 3 },
  { attack: 2, move: 3, darkPower: true },
  { attack: 2, move: 3 },
  { attack: 2, move: 3 },
  { attack: 2, move: 4 },
  { attack: 2, move: 4 },
  { attack: 3, move: 5 },
] as const;
export const INKANYAMBA_ATONEMENT =
  "Include both identical Atonement Action cards in the tableau; each costs 2 Time. Choose Killer Wrath or Divine Wrath: with 3+ successes decrease the chosen track to 1; with 2 successes decrease it by half, rounding the reduction up; with 1 success decrease it by 1. With no successes, increase Horror by 1 and lose 2 Time. Divine Wrath belongs to Sacred Groves and Killer Wrath belongs to Inkanyamba. Only choose a track used by the selected Killer and Location.";
const victimAction =
  "Target a Victim, move and attack; if no Victims remain, target the Final Girl instead.";
export const INKANYAMBA_TERRORS = [
  ...INKANYAMBA_MINOR_POWERS.map((p) => ({
    name: p.name,
    quantity: 1,
    effect: `Minor Dark Power with 3 separate Health. ${p.effect}`,
  })),
  {
    name: "Fickle Temper",
    quantity: 2,
    effect: `Make a Horror roll. With 2+ successes, choose Killer or Divine Wrath and decrease it by half, rounding the reduction up. With 1 success, decrease the chosen track by 1. With no successes, Unleash Killer Wrath, then roll a die and increase Killer Wrath by the number rolled. ${victimAction}`,
  },
  {
    name: "He's Coming and There's Nothing We Can Do!",
    quantity: 4,
    effect:
      "With no Victims on the board, discard this and draw the next Terror card. Otherwise increase Horror by 1, then target a Victim, move and attack.",
  },
  {
    name: "I Don't Know How, But I've Angered Him!",
    quantity: 1,
    effect:
      "Target the Final Girl, move and attack twice. Then increase Killer Wrath by the amount of damage inflicted.",
  },
  {
    name: "Wrath of Opportunity",
    quantity: 1,
    effect: `Unleash Killer Wrath; increase Killer Wrath by the number of Action cards in hand. ${victimAction}`,
  },
  {
    name: "Wrath of Blood",
    quantity: 1,
    effect: `Unleash Killer Wrath; increase Killer Wrath by the Bloodlust level. ${victimAction}`,
  },
  {
    name: "Punishment or Mercy",
    quantity: 1,
    effect:
      "Use the current Killer Wrath: at 0–3, increase it by 2 then Unleash it; at 4–5 increase it by 2; at 6–9 decrease it by half, rounding the reduction up; at 10 decrease it to 1. The printed 0–3 branch does not make 0 a legal track level.",
  },
  {
    name: "Wrath of Horror",
    quantity: 1,
    effect: `Unleash Killer Wrath; increase Killer Wrath by the Horror level. ${victimAction}`,
  },
  {
    name: "Wrath of Defilers",
    quantity: 1,
    effect: `Unleash Killer Wrath; increase Killer Wrath by the number of saved Victims. ${victimAction}`,
  },
  {
    name: "Wrath of Death",
    quantity: 1,
    effect: `Unleash Killer Wrath; increase Killer Wrath by your current Health. ${victimAction}`,
  },
  {
    name: "They Disrespected Him, and Now He Wants Their Blood!",
    quantity: 1,
    effect:
      "With no Victims on the board, discard this and draw the next Terror card. Otherwise target a Victim, move and attack twice, then increase Killer Wrath by the number of Victims killed this turn.",
  },
].map((c) => ({ ...c, killer: "Inkanyamba", source: INKANYAMBA_SOURCE }));

export function validInkanyambaField(key: string, value: unknown) {
  if (key === "wrath")
    return (
      value === null ||
      (Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 10)
    );
  if (key === "miracleResolved") return value === null || value === true;
  return (
    INKANYAMBA_MINOR_POWERS.some((p) => key === `minor.${p.id}.health`) &&
    (value === null ||
      (Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 3))
  );
}
export function atonementWrath(level: number, successes: number): number {
  return Math.max(
    1,
    successes >= 3
      ? 1
      : successes === 2
        ? level - Math.ceil(level / 2)
        : successes === 1
          ? level - 1
          : level,
  );
}
export function inkanyambaFacts(state: ModuleState): string[] {
  const facts: string[] = [];
  if (typeof state.wrath === "number")
    facts.push(`Killer Wrath ${state.wrath}/10.`);
  const power = INKANYAMBA_POWERS.find((p) => p.id === state.power);
  const finale = INKANYAMBA_FINALES.find((p) => p.id === state.finale);
  if (state.powerRevealed)
    facts.push(`Dark Power revealed: ${power?.name ?? "name not recorded"}.`);
  if (state.finaleRevealed)
    facts.push(`Finale revealed: ${finale?.name ?? "name not recorded"}.`);
  for (const p of INKANYAMBA_MINOR_POWERS) {
    const h = state[`minor.${p.id}.health`];
    if (typeof h === "number")
      facts.push(`${p.name}: ${h}/3${h === 0 ? " removed" : ""}.`);
  }
  return facts;
}
