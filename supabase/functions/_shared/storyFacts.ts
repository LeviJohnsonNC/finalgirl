/** Result and survival are separate facts: a simultaneous death can win. */
export function characterFate(health?: number): 'survived' | 'died' | 'unknown' {
  return health === undefined ? 'unknown' : health === 0 ? 'died' : 'survived';
}

export function endingFacts(facts: {
  outcome?: 'won' | 'lost'; finalGirlHealth?: number; killerHealth?: number;
}): string {
  return [
    `Game result: ${facts.outcome ?? 'unrecorded'}. This is an objective result, not proof of anyone's survival.`,
    `Final Girl fate: ${characterFate(facts.finalGirlHealth)} (reviewed health ${facts.finalGirlHealth ?? 'unrecorded'}).`,
    `Killer health remaining: ${facts.killerHealth ?? 'unrecorded'}; maximum health is unknown.`,
    'A win at zero Final Girl health is a sacrifice, not a living survivor. A loss with positive health does not mean she died. With unrecorded health, leave her ultimate survival open.',
    'Positive health establishes life at the recorded instant, not escape, safety or freedom from assimilation. An explicitly recorded unique module ending (such as assimilation) takes priority over a generic survival/death inference.',
    'Respect the supplied module victory conditions: an escape or rescue does not destroy an unkillable threat. Zero killer health is not proof that a supernatural threat is permanently eradicated.',
  ].join('\n');
}
