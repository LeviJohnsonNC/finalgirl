/**
 * Falconwood Missions (The Falconwood Files).
 *
 * Falconwood is the first location whose rules add a mandatory objective: a
 * Mission is drawn at random during setup and must be completed before the
 * Killer can lose its final health. The Mission is chosen in the Casting Room
 * and fed to the story AI so the opening scene is written around it.
 */

export interface FalconwoodMission {
  name: string;
  description: string;
}

export const FALCONWOOD_MISSIONS: FalconwoodMission[] = [
  {
    name: 'Save Your Father',
    description:
      "Government officials have imprisoned your father to keep him quiet. Help him escape before he's transported to another prison.",
  },
  {
    name: 'Missing Friend',
    description:
      "They say your friend died, but it's a lie. Look for clues to find your friend.",
  },
  {
    name: 'Survive the Hunt',
    description:
      'Secret agents have arrived in Falconwood with one mission: eliminate you. Eliminate them before they get you.',
  },
  {
    name: 'Expose the Lab',
    description:
      "The lab is performing experiments that are endangering Falconwood. It's time to expose what they're doing.",
  },
  {
    name: 'Crack the Code',
    description:
      'Spies are in Falconwood and communicating in code. Crack the code to foil their plan.',
  },
];

export const FALCONWOOD_LOCATION_NAME = 'Falconwood';

export const locationHasMissions = (location: string | null | undefined) =>
  (location ?? '').toLowerCase() === FALCONWOOD_LOCATION_NAME.toLowerCase();

export const getMissionByName = (name: string | null | undefined) =>
  name ? FALCONWOOD_MISSIONS.find((m) => m.name === name) : undefined;

export const getRandomMission = () =>
  FALCONWOOD_MISSIONS[Math.floor(Math.random() * FALCONWOOD_MISSIONS.length)];
