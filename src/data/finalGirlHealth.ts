/**
 * Final Girl Health Data
 * Maps each Final Girl to her starting health value based on official game data.
 * Most characters have either 5 or 6 HP.
 */

// Characters with 5 HP
const FIVE_HP_GIRLS = new Set([
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
  'Laurie',
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
 * Get the starting/max health for a Final Girl
 * @param name - The Final Girl's name
 * @returns The character's max health (5 or 6, defaults to 5 for unknown characters)
 */
export function getFinalGirlHealth(name: string): number {
  if (SIX_HP_GIRLS.has(name)) return 6;
  if (FIVE_HP_GIRLS.has(name)) return 5;
  // Default to 5 for unknown characters (more common value)
  return 5;
}

/**
 * Alias for getFinalGirlHealth for clarity in UI contexts
 */
export const getFinalGirlMaxHealth = getFinalGirlHealth;

/**
 * Check if a Final Girl is known in our data
 */
export function isKnownFinalGirl(name: string): boolean {
  return FIVE_HP_GIRLS.has(name) || SIX_HP_GIRLS.has(name);
}
