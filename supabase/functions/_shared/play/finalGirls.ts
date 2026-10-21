/** Owner photographs IMG_9327 (starting faces) and IMG_9326 (Ultimate faces),
 * verified 2026-10-21. Factual paraphrases; secret items deliberately live only
 * in the protected database, never in this shared/public catalog.
 * Rescue rewards are listed in printed reading order, not an enforced sequence.
 */
export interface FinalGirlReference {
  name: string;
  startingHealth: number;
  ultimateHealth: number;
  rescueRewards: readonly string[];
  startingRule?: string;
  ultimate: string;
  additionalReward: string;
}
const horror = 'Reduce Horror by 1';
const health = 'Recover 1 health';
const time = 'Gain 1 Time';
const move = 'Move 1 space';
const twoTime = 'Gain 2 Time';
const topItem = 'Take any top Item card';
const cheapAction = 'Take an Action card costing at most 2 Time';
const guard = 'Take a Guard card';
const twoMove = 'Move up to 2 spaces';
const keepVictim = 'Place the saved Victim on this card.';
export const FINAL_GIRL_REFERENCES: readonly FinalGirlReference[] = [
  { name: 'Rena', startingHealth: 6, ultimateHealth: 6, rescueRewards: [guard,topItem,health,horror,move], ultimate: 'Once per Action phase, take one Action card costing 0 Time from your discard pile.', additionalReward: time },
  { name: 'Gwynn', startingHealth: 5, ultimateHealth: 5, rescueRewards: [horror,horror,horror,horror], ultimate: 'Once per turn, reduce Horror by 1 when you make a Horror Roll with only 1 die. You may choose to roll only 1 die regardless of the Horror level.', additionalReward: horror },
  { name: 'Janelle', startingHealth: 5, ultimateHealth: 5, rescueRewards: [horror,move,guard,health], ultimate: 'Place a Tracking marker on 0. After resolving a failure result on a Horror Roll OR saving a Victim, advance it one space to the right. When resolving an Action card that deals damage, you may increase the damage by the marked number, then return the marker to 0. Track values: 0, +1, +2, +3, +5.', additionalReward: horror },
  { name: 'Octavia', startingHealth: 5, ultimateHealth: 5, rescueRewards: [move,move,horror,cheapAction], ultimate: 'Place a Tracking marker on 0. After resolving a failure result on a Horror Roll OR saving a Victim, advance it one space to the right. When you are about to receive damage, you may reduce it by the marked number, then return the marker to 0. Track values: 0, 1, 3, 5, 7.', additionalReward: horror },
  { name: 'Alice', startingHealth: 4, ultimateHealth: 4, rescueRewards: [twoTime,health,health,cheapAction,twoMove,move], ultimate: 'Choose one named Action card. For the rest of the game, whenever you play that named card, always roll exactly 5 dice regardless of Horror level or other modifiers.', additionalReward: health },
  { name: 'Ava', startingHealth: 5, ultimateHealth: 5, rescueRewards: [horror,move,health,move,health], ultimate: 'When making a Horror Roll, you may reroll all results showing 1.', additionalReward: horror },
  { name: 'Tali', startingHealth: 6, ultimateHealth: 6, rescueRewards: [guard,move,'Take a Retaliate card',topItem], ultimate: 'When this card is flipped, immediately take a Reaction card into your hand. All Reaction cards now cost 1 less Time.', additionalReward: health },
  { name: 'Gretel', startingHealth: 6, ultimateHealth: 6, rescueRewards: [twoTime,'Take the Long Rest Action card',health,twoMove,'Reduce Horror by 2'], ultimate: 'You may convert a partial-success die result into a success by discarding 3 Action cards.', additionalReward: health },
  { name: 'Ginny', startingHealth: 6, ultimateHealth: 6, rescueRewards: [horror,twoTime,guard,move,health,horror], ultimate: 'Choose 2 bonuses for the rest of the game, applying to all results of those Actions: move +1 space with Walk; recover +1 health with Short Rest; deal +1 damage with Weak Attack; reduce Horror by 1 more with Focus.', additionalReward: time },
  { name: 'Veronica', startingHealth: 5, ultimateHealth: 5, rescueRewards: [time,twoTime,twoTime,'Gain 3 Time','Gain 3 Time'], ultimate: 'For the rest of the game, reset Time to 7 at the end of the Planning phase, or 16 in Extreme Horror Mode.', additionalReward: 'Gain 3 Time' },
  { name: 'Heather', startingHealth: 5, ultimateHealth: 5, rescueRewards: [twoTime,health,health,move,horror,horror], ultimate: 'When attacking, for each 5 or 6 on your initial Horror Roll, you may reroll one other die. Add 1 damage to your attack for each success in the final result.', additionalReward: time },
  { name: 'Selena', startingHealth: 6, ultimateHealth: 6, rescueRewards: [twoTime,move,'Take a Search Action card','Reduce Horror by 2'], ultimate: 'Roll 2 additional dice when resolving a Search Action card.', additionalReward: twoTime },
  { name: 'Charlie', startingHealth: 7, ultimateHealth: 7, rescueRewards: [horror,move,move,twoTime,horror,horror], ultimate: 'During the Action phase, you may lose 3 health to take the Critical Blow Action card directly into your hand.', additionalReward: twoTime },
  { name: 'Maureen', startingHealth: 5, ultimateHealth: 5, rescueRewards: [], startingRule: 'Each time you save a Victim, gain 1 Time, place the Victim on this card, and roll a die. If the result is LOWER than the number of Victims on the card, you may flip it. Keep the Victims on it after flipping.', ultimate: 'Once per Action phase, discard 1 or 2 Victims from this card to resolve any ONE Action card from the Action Tableau as though played from your hand. If you discarded only 1 Victim, remove that Action card from the game after resolving it.', additionalReward: keepVictim },
  { name: 'Red', startingHealth: 5, ultimateHealth: 5, rescueRewards: [time,topItem,twoTime,cheapAction,health,twoMove], ultimate: 'Once per Action phase, if an Enemy is within 2 spaces, you may move 1 space for free.', additionalReward: health },
  { name: 'Sheila', startingHealth: 6, ultimateHealth: 6, rescueRewards: ['Take an Improvise Action card','Take the Long Rest Action card',horror,twoTime,move,'Recover 2 health'], ultimate: 'Gain 2 Time instead of 1 when discarding Action cards face down for Time.', additionalReward: horror },
  { name: 'Adrianne', startingHealth: 6, ultimateHealth: 6, rescueRewards: [], startingRule: 'Each time you save a Victim, gain 1 Time, place the Victim on this card, and roll a die. If the result is LOWER than the number of Victims on the card, you may flip it. Keep the Victims on it after flipping.', ultimate: 'Discard 1 Victim from this card for one of: gain 2 Time, recover 1 health, or move 1 space. OR discard 2 Victims for one of: reduce Horror by 1, +1 damage on your next attack, or +1 die on your next Horror Roll.', additionalReward: keepVictim },
  { name: 'Vicky', startingHealth: 5, ultimateHealth: 5, rescueRewards: [health,health,move,time,time], ultimate: 'When resolving a Walk or Sprint Action card, each success in the final result lets you spend 1 Time to move an additional space.', additionalReward: health },
  { name: 'Adelaide', startingHealth: 6, ultimateHealth: 6, rescueRewards: [twoTime,horror,horror,twoTime,move], ultimate: 'Choose one immediate effect: decrease or increase Wrath by 1; recover 2 health; or take up to 6 Time worth of Action cards into your hand.', additionalReward: horror },
  { name: 'Joy', startingHealth: 6, ultimateHealth: 6, rescueRewards: [time,time,move,horror,horror,horror], ultimate: 'Once per turn, you may ignore a single damage OR Horror increase.', additionalReward: horror },
  { name: 'Nancy', startingHealth: 4, ultimateHealth: 4, rescueRewards: ['Recover 2 health','Move 2 spaces',twoTime,'Take the Long Rest Action card','Take the Planning Action card'], ultimate: 'Whenever you lose normal health, you may reveal a black Final Health token from the general pool and swap it with your own black Final Health token. If you do not swap, remove the revealed token from the game. You cannot do this with a white Final Health token.', additionalReward: health },
  { name: 'Mandy', startingHealth: 6, ultimateHealth: 6, rescueRewards: [health,time,horror,move,move], ultimate: 'Add 2 damage to attacks made without a weapon or Item. This ability cannot be used with Reaction cards.', additionalReward: time },
  { name: 'Cassie', startingHealth: 5, ultimateHealth: 5, rescueRewards: ['Take a Sprint card',move,health,'Take a Distraction card',move,horror], ultimate: 'You may spend 6 Time to double the damage from your next attack, including Weapon Modifiers. This cannot be used with Reaction cards and is valid even if it takes Time below zero.', additionalReward: time },
  { name: 'Barbara', startingHealth: 7, ultimateHealth: 7, rescueRewards: [horror,twoTime,health,topItem,move], ultimate: 'Victims will move into the Killer\'s space with you. When you damage an Enemy in your space, you may deal +1 damage for each Victim present. Kill 1 Victim for each additional damage dealt this way; do NOT increase Bloodlust for those deaths.', additionalReward: time },
  { name: 'Ellen', startingHealth: 4, ultimateHealth: 4, rescueRewards: [horror,twoTime,twoTime,'Take a Search card',health,move], ultimate: 'When you successfully resolve a Search Action card, you may look through all of the Location\'s unused Item cards instead of the space\'s Item deck.', additionalReward: time },
  { name: 'Jenette', startingHealth: 7, ultimateHealth: 7, rescueRewards: [horror,move,'Take a Search card',topItem], ultimate: 'You have an additional hand for holding and using Item cards. Place 2 Tracking markers on this card. When using an Item with limited uses, you may use one of these markers instead.', additionalReward: health },
  { name: 'Kat', startingHealth: 4, ultimateHealth: 4, rescueRewards: [horror,twoTime,move,guard,'Recover 2 health',twoMove], ultimate: 'When you inflict damage on an Enemy with a gun, deal 2 additional damage.', additionalReward: time },
  { name: 'Reiko', startingHealth: 6, ultimateHealth: 6, rescueRewards: [twoTime,health,'Take the Planning Action card',move,move], ultimate: 'Once per Action phase, if an Enemy is within 2 spaces, you may move to that Enemy\'s space for free.', additionalReward: time },
  { name: 'Laurie', startingHealth: 5, ultimateHealth: 5, rescueRewards: [horror,twoTime,health,twoTime,cheapAction,move], ultimate: 'When you are in the same space as an Enemy and inflict damage, deal 1 additional damage.', additionalReward: time },
  { name: 'Uki', startingHealth: 6, ultimateHealth: 6, rescueRewards: [move,health,'Take Furious Strike',twoTime], ultimate: 'Once per turn, you may play a copy of the Guard card as though it were in your hand.', additionalReward: horror },
  { name: 'Asami', startingHealth: 5, ultimateHealth: 5, rescueRewards: ['Take a Search Action card',health,move,'Reduce Horror by 2'], ultimate: 'Whenever you draw at least 1 Item card, draw 1 extra and choose one. You are immune to Item Trap cards.', additionalReward: health },
  { name: 'Kate', startingHealth: 4, ultimateHealth: 7, rescueRewards: ['Take Retaliate',move,health,'Recover 2 health',guard,guard], ultimate: 'Your maximum health becomes 7. Immediately recover all health. While at full health, roll +1 die for Horror Rolls.', additionalReward: 'Recover 2 health' },
];
export const getFinalGirlReference = (name: string) => FINAL_GIRL_REFERENCES.find(girl => girl.name === name);

/** Observation only: never flips a card, spends a reward, or heals the player. */
export function observedFinalGirlMaxHealth(name: string, events: readonly { kind: string; momentType?: string; id: string; target?: string }[] = [], startingHealth?: number): number | undefined {
  if (startingHealth === undefined) return undefined; // preserve legacy session interpretation
  const undone = new Set<string>();
  for (const event of events) {
    if (event.kind === 'undo' && event.target) undone.add(event.target);
    if (event.kind === 'restore' && event.target) undone.delete(event.target);
  }
  const flipped = events.some(event => event.kind === 'moment' && event.momentType === 'ultimate-unlocked' && !undone.has(event.id));
  return flipped ? getFinalGirlReference(name)?.ultimateHealth ?? startingHealth : startingHealth;
}
