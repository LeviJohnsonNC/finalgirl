import type { StateField } from "./events";

/** Printed starting values where verified. Other casts get editable suggestions,
 * never automatic rules resolution. Existing observations always take priority.
 * Rena/Gwynn: owner photo IMG_9308.jpg. Billy: photographed Killer board,
 * https://dudetakeyourturn.ca/2026/03/25/cuddle-bears-of-death-final-girl-bad-times-at-buddyland-review/
 * Hans/Laurie: published core rulebook, setup examples.
 */
export function playStartingValues(
  killer: string,
  finalGirl: string,
): Record<StateField, number> {
  const girlHealth: Record<string, number> = { Rena: 6, Gwynn: 5, Laurie: 5 };
  const killerHealth: Record<string, number> = {
    "Billy the Bear": 8,
    Hans: 12,
  };
  return {
    finalGirlHealth: girlHealth[finalGirl] ?? 5,
    killerHealth: killerHealth[killer] ?? 10,
    finalHorrorLevel: 4,
    bloodlust: 0,
  };
}
