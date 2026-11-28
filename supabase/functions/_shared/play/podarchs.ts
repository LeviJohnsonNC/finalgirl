export const PODARCHS = 'The Podarchs';
export const PODARCH_MODULE = 'podarchs';
export const PODARCH_FILM = 's4-terror-from-beyond';
export const PODARCH_SOURCE = 'Terror From Beyond, standard vignette booklet and cards (IMG_9646–IMG_9650).';
export const PODARCH_VISUAL = 'Ordinary people with the faces and memories of the people they replaced. Alien plants and leathery pods conceal among everyday surroundings. Keep the selected location and Final Girl.';
export const PODARCH_STORY = 'The Assimilated initially seek to replace people. Assimilation is neither a rescue nor a death. Hostile Assimilated attack the Final Girl and continue trying to replace Victims. Only the explicitly reported outcome establishes how the invasion ended.';

// Start circle, three Docile rows and seven Hostile rows on the joined track.
export const PODARCH_HOSTILE = 4;
export const PODARCH_MAX = 10;
export function podarchBehavior(bloodlust?: number) {
  if (bloodlust === undefined) return 'Behavior unrecorded';
  return bloodlust >= PODARCH_HOSTILE ? 'Hostile' : 'Docile';
}

export const PODARCH_POWERS = [
  { id: 'mob', name: 'Hunted by the Mob', effect: 'If one or more Victims were saved during the Action phase, all Assimilated target the Final Girl and move at the end of that phase.' },
  { id: 'obstinate', name: 'Obstinate Victims', effect: 'Persuade can only be played on a Victim with a Podarch token in their space or an adjacent space.' },
  { id: 'hysteria', name: 'Mass Hysteria', effect: 'When you attack one or more Assimilated, increase Podarch Bloodlust.' },
];
export const PODARCH_MINORS = [
  { id: 'targeted', name: 'Targeted Growth', effect: 'A Plant placed in your space immediately evolves into a Pod.' },
  { id: 'urgency', name: 'Sense of Urgency', effect: 'Assimilated move one additional space for each movement icon.' },
];
export const PODARCH_FINALES = [
  { id: 'greenhouse', name: 'Luxuriant Growth', effect: 'Put the Greenhouse in the space furthest from you and spawn two Assimilated there. Put a Health marker on each of the six hearts. You may attack the Greenhouse as if it were an enemy. Leftover damage cannot pass between it and other enemies. Each time you attack it, spawn one Assimilated on the closest exit. Destroy it and reach an exit with no Assimilated there to win.' },
  { id: 'countdown', name: 'Born Again', effect: 'Start the Countdown at 6. Remove existing Plant/Pod tokens and remove the Podarch card from the game. Draw a Setup card and place all five Pods, one per space, by the printed priority: Final Girl start, Killer start, exits, then search spaces furthest from you. Assimilated stop placing Plants with Victims and Victims can no longer become Assimilated. Pods remain until destroyed. At the end of each Killer phase, decrease the Countdown by one and spawn an Assimilated at the furthest Pod. Destroy all Pods to win. At the start of the Killer phase, lose if the Countdown is zero or if you share a Pod, even with Victims present.' },
  { id: 'leader', name: "You’re Next!", effect: 'Draw a Setup card and place the Leader at its Killer start. Place five Health markers and a Final Health token on the Leader card. The Leader is a Killer with its own action and the Bloodlust track’s movement and attack values. Defeat the Leader to win.' },
];
export const PODARCH_TERRORS = [
  { id: 'flowers', name: 'Someone Sent Me Flowers!', quantity: 3, effect: 'If there are no Victims or every Victim already shares a space with a Podarch token, discard and draw again. Otherwise place a Plant with the furthest eligible Victim.' },
  { id: 'lifeform', name: "You’re Evolving Into a New Lifeform!", quantity: 2, effect: 'If there is already a Pod in your space, discard and draw again. Otherwise place a Plant there, or flip the Plant already there to a Pod. Increase Horror.' },
  { id: 'mutation', name: 'A Mutation of Some Kind!', quantity: 2, effect: 'If there are no Plants, discard and draw again. Otherwise flip all Plants to Pods. Increase Horror.' },
  { id: 'possessed', name: 'Something Evil Has Possessed This Town!', quantity: 3, effect: 'If no Victim shares a Pod, discard and draw again. Otherwise assimilate the closest Victim sharing a Pod. Only this newly Assimilated targets the Final Girl, moves and attacks.' },
  { id: 'less-human', name: 'People Are Becoming Less Human!', quantity: 4, effect: 'If there are no Assimilated on the board, spawn one in your space. Only the closest Assimilated targets the nearest Final Girl or Victim, moves and attacks. Increase Horror.' },
];

export const PODARCH_OUTCOMES = {
  won: ['Cleared every Plant, Pod and Assimilated before the Finale', 'Destroyed the Greenhouse and escaped', 'Destroyed every Pod during Born Again', 'Defeated the Leader'],
  lost: ['The Final Girl was assimilated', 'No Assimilated token was available for a required assimilation', 'The Final Girl died', 'The Countdown expired', 'Shared a Pod at the start of the Killer phase during Born Again'],
};

export function podarchFinishOptions(won: boolean, finale?: { killerCard?: string }) {
  const outcomes = won ? PODARCH_OUTCOMES.won : PODARCH_OUTCOMES.lost;
  if (!finale) return outcomes;
  const branch = PODARCH_FINALES.findIndex(card => card.name === finale.killerCard);
  if (won) return branch < 0 ? outcomes.slice(1) : [outcomes[branch + 1]];
  if (branch < 0) return outcomes;
  // Born Again removes the Evolution card and prevents further Victim assimilation.
  return branch === 1 ? outcomes.slice(2) : outcomes.slice(0, 3);
}

export const podarchMinorNames: Record<string,string> = {targeted: 'Targeted Growth', urgency: 'Sense of Urgency', slippery: 'Slippery', bond: 'Twisted Bond', rivermaster: 'Rivermaster'};
export function validPodarchField(key: string, value: unknown) {
  if (key === 'assimilated') return value === true;
  if (Object.prototype.hasOwnProperty.call(podarchMinorNames, key)) return value === null || ['active','removed','inactive'].includes(String(value));
  if (key === 'leaderFinal') return value === null || ['unresolved', 'recovered', 'defeated'].includes(String(value));
  return ['greenhouse','countdown','leader'].includes(key) && (value === null ||
    (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= (key === 'leader' ? 5 : 6)));
}

export function podarchOwnsLog(killer: string, entries: readonly {moduleData?: {module: string; changes?: Record<string, unknown>}}[], location?: string) {
  return entries.every(({moduleData}) => {
    if (moduleData?.module !== PODARCH_MODULE) return true;
    if (killer !== PODARCHS) return false;
    if ('slippery' in (moduleData.changes ?? {})) return location === 'USS Konrad';
    if ('rivermaster' in (moduleData.changes ?? {})) return location === 'Pesadilla Verde';
    if ('bond' in (moduleData.changes ?? {})) return location === 'Sunnydaze Mall';
    return true;
  });
}

export function podarchFacts(state: Record<string,unknown>, finale?: string) {
  const facts: string[] = [];
  if (state.assimilated) facts.push('A Victim was assimilated, a replacement rather than a death.');
  for (const [id,name] of Object.entries(podarchMinorNames)) {
    if (state[id] === 'active') facts.push(name + ' is active.');
  }
  const objective = PODARCH_FINALES.find(card=>card.name===finale);
  if (objective) {
    facts.push('Finale revealed: ' + objective.name + '.');
    const value = state[objective.id];
    if (typeof value === 'number') {
      facts.push(objective.id === 'countdown' ? 'Countdown remaining: ' + value + '.' :
        objective.id === 'greenhouse' && value === 0 ? 'The Greenhouse was destroyed; escape requires separate confirmation.' :
        (objective.id === 'leader' ? 'Leader' : 'Greenhouse') + ' Health: ' + value + '.');
    }
    if (objective.id === 'leader' && state.leaderFinal) facts.push('Leader Final Health: ' + state.leaderFinal + '.');
  }
  return facts.join(' ');
}
