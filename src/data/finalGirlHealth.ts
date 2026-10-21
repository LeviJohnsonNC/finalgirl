import { getFinalGirlReference } from './finalGirlReferences';

/**
 * Final Girl Health Data
 * Corrected starting health comes from the photographed card catalog.
 * The legacy 5/6 map remains only for interpreting pre-reference game records.
 */

// Characters with 5 HP
const FIVE_HP_GIRLS = new Set([
  'Laurie',
  'Reiko',
  'Alice',
  'Barbara',
  'Asami',
  'Nancy',
  'Jenette',    // Also known as Jeanette
  'Uki',
  'Ava',
  'Red',
  'Veronica',
  'Traci',
  'Riley',
  'Kirsty',
  'Nora',
  'Cindy',
  'Gwynn',
  'Vicky',
  'Rita',
  'Alois',
  'Meghan',
  'Cassie',
  'Octavia',
  'Julie',
  'Kat',
  'Kenzie',
  'Tali',
]);

// Characters with 6 HP
const SIX_HP_GIRLS = new Set([
  'Selena',
  'Adelaide',
  'Charlie',
  'Sheila',
  'Ellen',
  'Kate',
  'Ginny',
  'Gretel',
  'Heather',
  'Danielle',
  'Mia',
  'Julia',
  'Noel',
  'Rena',
  'Joy',
  'Lindi',
  'Dakota',
  'Ronda',
  'Mandy',
  'Janelle',
  'Hans',
]);

/**
 * Historical health reference for records without a per-session snapshot
 * @param name - The Final Girl's name
 * @returns The original app denominator; never use for a new photographed cast
 */
export function getLegacyFinalGirlHealth(name: string): number {
  if (SIX_HP_GIRLS.has(name)) return 6;
  if (FIVE_HP_GIRLS.has(name)) return 5;
  // Default to 5 for unknown characters (more common value)
  return 5;
}

/**
 * Alias for getFinalGirlHealth for clarity in UI contexts
 */
export function getFinalGirlHealth(name: string): number {
  return getFinalGirlReference(name)?.startingHealth ?? getLegacyFinalGirlHealth(name);
}
export const getFinalGirlMaxHealth = getFinalGirlHealth;

/**
 * Check if a Final Girl is known in our data
 */
export function isKnownFinalGirl(name: string): boolean {
  return FIVE_HP_GIRLS.has(name) || SIX_HP_GIRLS.has(name);
}
