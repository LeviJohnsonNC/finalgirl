import { getFinalGirlHealth } from '@/data/finalGirlHealth';
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
  const killerHealth: Record<string, number> = {
    Inkanyamba: 9,
    "Billy the Bear": 8,
    Hans: 12,
    Geppetto: 8,
    'Dr. Fright': 9,
  };
  return {
    finalGirlHealth: getFinalGirlHealth(finalGirl),
    killerHealth: killerHealth[killer] ?? 10,
    finalHorrorLevel: 4,
    bloodlust: 0,
  };
}
