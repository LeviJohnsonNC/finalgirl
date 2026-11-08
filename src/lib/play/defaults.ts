import { SLAYER, SLAYER_SETUP } from "./slayer";
import { INTRUDERS, INTRUDER_HORROR } from "./intruders";
import { WOLF, WOLF_SETUP } from './bigBadWolf';
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
): Record<Exclude<StateField,'killerHealth'>, number> & {killerHealth?:number} {
  const killerHealth: Record<string, number> = {
    Grimlash: 10,
    Evomorph: 4,
    Inkanyamba: 9,
    "Billy the Bear": 8,
    Hans: 12,
    Geppetto: 8,
    'Dr. Fright': 9,
  };
  if (killer === SLAYER) return {finalGirlHealth: getFinalGirlHealth(finalGirl), ...SLAYER_SETUP};
  if (killer === INTRUDERS) return {finalGirlHealth:getFinalGirlHealth(finalGirl),finalHorrorLevel:INTRUDER_HORROR,bloodlust:0};
  if (killer === WOLF) return { finalGirlHealth: getFinalGirlHealth(finalGirl), ...WOLF_SETUP };
  if(killer==='The Hunter')return {finalGirlHealth:getFinalGirlHealth(finalGirl),killerHealth:15,finalHorrorLevel:5,bloodlust:0};
  if(killer==='The Tormentor')return {finalGirlHealth:getFinalGirlHealth(finalGirl),killerHealth:7,finalHorrorLevel:3,bloodlust:0};
  return {
    finalGirlHealth: getFinalGirlHealth(finalGirl),
    ...(killer!=='Poltergeist'&&{killerHealth:killerHealth[killer]??10}),
    finalHorrorLevel: killer === 'Poltergeist' ? 3 : 4,
    bloodlust: 0,
  };
}
