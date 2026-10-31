import type {KonradFate} from './play/konrad.ts';
export function reviewedCharacterFate(health:number|undefined,review?:{fate:KonradFate}):'survived'|'died'|'unknown' {
 if(review?.fate==='airlock-loss'||review?.fate==='explosion-loss')return 'died';
 if(review?.fate==='survived')return 'survived';
 return characterFate(health);
}
/** Result and survival are separate facts: a simultaneous death can win. */
export function characterFate(health?: number): 'survived' | 'died' | 'unknown' {
  return health === undefined ? 'unknown' : health === 0 ? 'died' : 'survived';
}

export function endingFacts(facts: {
  grimlashReview?:{loss:'none'|'unknown'|'skull'|'telluric'}; konradReview?: {fate:KonradFate}; outcome?: 'won' | 'lost'; finalGirlHealth?: number; killerHealth?: number; killer?: {name?:string}|string; poltergeistReview?:{carolynRescued:true|null;floppyAtEscape:true|null;epicRequired:boolean|null;escapeRoute?:'exit'|'helicopter'|null};
}): string {
  const healthless=(typeof facts.killer==='string'?facts.killer:facts.killer?.name)==='Poltergeist';
  return [
    ...(facts.grimlashReview?[`Grimlash Madness loss record: ${facts.grimlashReview.loss}. Skull or Telluric means a game loss, not necessarily physical death, zero Health or a Victim casualty. Unknown is not a loss. Do not invent Children outside Shady Acres.`]:[]),
    ...(facts.konradReview?[`Reviewed USS Konrad ship fate: ${facts.konradReview.fate}. Airlock-loss and explosion-loss mean the Final Girl died and lost regardless of stale positive Health or Killer death. Survived means survival of this hazard only, not victory, escape or Killer death. Unknown establishes no ship fate.`]:[]),
    `Game result: ${facts.outcome ?? 'unrecorded'}. This is an objective result, not proof of anyone's survival.`,
    `Final Girl fate: ${reviewedCharacterFate(facts.finalGirlHealth,facts.konradReview)} (reviewed health ${facts.finalGirlHealth ?? 'unrecorded'}).`,
    healthless?'Poltergeist has no Health and cannot be killed. Historical numerical Health inputs are inapplicable.':`Killer health remaining: ${facts.killerHealth ?? 'unrecorded'}; maximum health is unknown.`,
    'A win at zero Final Girl health is a sacrifice, not a living survivor. A loss with positive health does not mean she died. With unrecorded health, leave her ultimate survival open.',
    'Positive health establishes life at the recorded instant, not escape, safety or freedom from assimilation. An explicitly recorded unique module ending (such as assimilation) takes priority over a generic survival/death inference.',
    ...(healthless&&facts.poltergeistReview?[`Final reviewed rescue (takes precedence over earlier observations): Carolyn escape ${facts.poltergeistReview.carolynRescued===true?'confirmed':'unconfirmed'}; Mr. Floppy at escape ${facts.poltergeistReview.floppyAtEscape===true?'confirmed':'unconfirmed'}; Epic requirement ${facts.poltergeistReview.epicRequired===null?'unknown':facts.poltergeistReview.epicRequired?'required':'not required'}. Unconfirmed means unknown, not failure. Do not infer an additional rescue, loss or death.`]:[]),
    ...(facts.poltergeistReview?.escapeRoute?[`Reviewed Carolyn rescue route: ${facts.poltergeistReview.escapeRoute}. Helicopter is not an Exit. Preserve the reported game result separately; do not adjudicate the unresolved Epic interaction.`]:[]),
    'Respect the supplied module victory conditions: an escape or rescue does not destroy an unkillable threat. Zero killer health is not proof that a supernatural threat is permanently eradicated.',
  ].join('\n');
}
