/** Fictional archive shared by the stats interaction tests and visual review.
 * No provider or production data is used. Totals: 56 sessions, 30 wins,
 * 26 losses, 200 saved, 299 killed. */
export const statsHistory = () => {
  const girls = ['Ava', 'Uki', 'Alice', 'Laurie', 'Barbara', 'Veronica', 'Kate', 'Janelle', 'Tali', 'Gretel'];
  const killers = ['Hans', 'Poltergeist', 'The Organism', 'Billy the Bear'];
  const locations = ['Camp Happy Trails', 'Creech Manor', 'Station 2891', 'Buddyland'];
  const weapons = ['Pitchfork', 'Axe', 'Aluminum Bat', 'Machete', 'Knife', 'Bow', 'Hammer', 'Rifle', 'Sledgehammer'];
  const wins = new Set([0, 1, 4, 5, 6, 8, 11, 13, 14, 16, 18, 19, 22, 23, 24, 25, 28, 30, 31, 33, 35, 37, 38, 40, 42, 44, 47, 49, 52, 54]);
  return Array.from({ length: 56 }, (_, i) => ({
    id: String(i + 1).padStart(8, '0') + '-1111-4111-8111-111111111111',
    timestamp: Date.now() - i * 86400000,
    outcome: wins.has(i) ? 'won' : 'lost',
    final_girl: girls[i % girls.length], killer: killers[i % killers.length], location: locations[i % locations.length],
    victims_saved: 3 + (i < 32 ? 1 : 0), victims_killed: 5 + (i < 19 ? 1 : 0),
    final_horror_level: 1 + (i % 7), final_girl_health: wins.has(i) ? 2 : 0,
    rounds_played: 4 + (i % 8), weapon_used: weapons[i % weapons.length],
    intro_story: `Case ${i + 1}: the lights across the lake went dark.`,
    ending_narration: `Case ${i + 1}: only the tape made it back.`,
  }));
};
