/**
 * Killer health (HP) data for Final Girl.
 * Maps each killer to their maximum health card count based on official game data.
 *
 * Vignette killers (Birds, Zombies, Destiny) have no HP — they cannot be killed.
 * Poltergeist is unkillable and also has no HP.
 *
 * Values are approximate based on standard difficulty. Some killers have variable
 * HP depending on included health cards.
 */

/** Killers that have no HP and cannot be killed via combat. */
const UNKILLABLE_KILLERS = new Set([
  'Poltergeist',
  'Birds',
  'Zombies',
  'Destiny',
]);

/** Per-killer max HP for killers that can be defeated in combat. */
const KILLER_MAX_HP: Record<string, number> = {
  // Season 1
  'Hans': 12,
  'Inkanyamba': 8,
  'Geppetto': 8,
  'Dr. Fright': 8,

  // Season 2
  'Evomorph': 10,
  'The Organism': 10,
  'Ratchet Lady': 8,
  'Big Bad Wolf': 9,
  'The Intruders': 9,

  // Season 3
  'Slayer': 9,
  'The Hunter': 8,
  'Razorface': 9,
  'The Tormentor': 8,
  'The Eyeless': 8,

  // Season 4
  'Grimlash': 9,
  'Billy the Bear': 8,
};

/**
 * Returns true if this killer cannot be killed by the Final Girl in combat.
 * (Poltergeist, vignette killers)
 */
export function isKillerUnkillable(name: string): boolean {
  return UNKILLABLE_KILLERS.has(name);
}

/**
 * Get the max HP for a killer.
 * Returns 0 for unkillable killers, and a reasonable default (9) for unknown killers.
 */
export function getKillerMaxHealth(name: string): number {
  if (UNKILLABLE_KILLERS.has(name)) return 0;
  return KILLER_MAX_HP[name] ?? 9;
}
