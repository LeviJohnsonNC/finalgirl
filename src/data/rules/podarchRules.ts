import { PODARCHS, PODARCH_FILM, PODARCH_SOURCE, PODARCH_POWERS, PODARCH_MINORS, PODARCH_FINALES, PODARCH_TERRORS, PODARCH_HOSTILE, PODARCH_MAX } from '../../../supabase/functions/_shared/play/podarchs';
import type { EntityRuleModule } from './moduleRules';

export const podarchRules: EntityRuleModule = {
  entity: PODARCHS, filmId: PODARCH_FILM, kind: 'killer', source: PODARCH_SOURCE, credits: {design:'Mike Martins', art:'Agnieszka Dąbrowiecka'},
  tags: ['Podarch Evolution', 'Assimilated', 'Joan', 'Persuade', 'Docile', 'Hostile', 'Plants', 'Pods', ...[...PODARCH_POWERS, ...PODARCH_MINORS, ...PODARCH_FINALES, ...PODARCH_TERRORS].map(c => c.name)],
  setup: [{type: 'list', items: [
    'Join the two Bloodlust cards, use the starting circle, and set Horror to 4. There is no killer board or shared killer Health.',
    'Remove Events featuring Special Victim meeples before setting up the Event deck. Place one Assimilated at the Killer start, and a Plant with the Victim furthest from you.',
    'Start Docile. Put both Persuade cards in the Action Tableau, and put the Podarchs reference and remaining tokens above the Finale.',
  ]}],
  rules: [
    {type:'heading',level:3,text:'Podarch Evolution · after Planning, before Killer'},
    {type:'list',items:[
      'If you share a Pod with no Victims, you are assimilated and lose immediately. Skip Final Health.',
      'Return Plants and Pods in spaces containing neither you nor any Victim to the pool.',
      'Each remaining Pod assimilates one Victim in its space. Return that Pod and put an Assimilated token on the person. They cease to be a Victim. Neither deaths nor Bloodlust increase.',
      'Flip all remaining Plants to Pods. People assimilated during Evolution skip only the first Minion Action of this Killer phase.',
    ]},
    {type:'heading',level:3,text:'Enemies and movement'},
    {type:'podarch-photos',photos:[{id:'flowers',label:'Plant'},{id:'pod',label:'Pod'},{id:'assimilation',label:'Assimilation'}]},
    {type:'paragraph',text:'There are five reversible Plant/Pod tokens and twelve reusable Assimilated tokens. At most one Plant or Pod occupies a space. If the Plant/Pod supply is empty, placement does nothing. If a required assimilation needs a thirteenth token, you lose. A spawn puts an Assimilated person directly in the specified space.'},
    {type:'paragraph',text:'Plants and Pods are stationary enemies with one Health. They never attack and are neither Killers nor Minions. Enemy-damaging location effects can destroy them. Surplus damage can pass between a Plant/Pod and eligible Assimilated in the same space. Each Assimilated is a one-Health Minion. Return its token when killed.'},
    {type:'paragraph',text:'Minion Actions resolve one Assimilated at a time, closest to you first. For a Killer Action on another card, use only the closest Assimilated. It also stands in for the Killer when an effect moves, places or measures relative to the Killer. Victims do not panic merely for sharing an Assimilated’s space.'},
    {type:'heading',level:3,text:'Docile, Hostile and Bloodlust'},
    {type:'paragraph',text:'Docile Assimilated ignore targets already sharing a Plant or Pod. With no eligible targets they do nothing. On an attack, place a Plant if sharing you or a Victim in a space without a Podarch token. You cannot attack or kill a Docile Assimilated, though an enemy-damaging location effect can.'},
    {type:'paragraph',text:`Start Docile. At Bloodlust ${PODARCH_HOSTILE} turn the reference to Hostile. Victims are still targeted for planting. The Final Girl becomes a valid target even with a Plant or Pod in her space. A Hostile Assimilated attacking in her space damages her regardless of its original target. She may attack Hostile Assimilated. Ignore red Bloodlust icons and Victim deaths. Increase Bloodlust for a killed Assimilated or a green Podarch Bloodlust icon. At the top of the track (${PODARCH_MAX}), overflow discards the next Terror card.`},
    {type:'table',headers:['Bloodlust','Attack','Move','Entry'],rows:[
      ['0–2 · Docile','—','1','Start at 0'],['3 · Docile','—','1','Reveal Dark Power'],
      ['4 · Hostile','1','1','Increase Horror'],['5','1','1','—'],['6','1','1','Increase Horror'],['7','1','1','—'],
      ['8','1','2','Increase Horror'],['9','2','2','—'],['10','3','2','Increase Horror'],
    ]},
    {type:'paragraph',text:'Before the Finale, resolve the printed green Bloodlust icon and then have the eligible Assimilated target the closest Final Girl or Victim, move and attack. Luxuriant Growth and Born Again direct them toward the Final Girl. During You’re Next!, also resolve the Leader’s separate Final Girl target, two movement icons and two attack icons.'},
    {type:'heading',level:3,text:'Persuading Victims'},
    {type:'paragraph',text:'Ordinary Victims will not follow or be saved until Persuaded. Play Persuade with a Victim in your space only if a Special Victim meeple is available. Two stars persuade two Victims in your space, one star persuades one and costs one Time. On failure a Victim there panics, increase Horror and lose two Time. The printed purchase cost is one Time. Mark each success with an available Special Victim meeple. Return it when that person is saved, killed or assimilated.'},
    {type:'heading',level:3,text:'Powers, Terror and the Finale'},
    {type:'table',headers:['Dark Power','Effect'],rows:PODARCH_POWERS.map(c=>[c.name,c.effect])},
    {type:'paragraph',text:'Minor Dark Powers apply to all Assimilated. Discard one per saved Victim, or discard them at Finale reveal. Location Minor Powers with Health spaces receive no Health markers. Ignore or replace incompatible Events and Items.'},
    {type:'table',headers:['Minor Power','Effect'],rows:PODARCH_MINORS.map(c=>[c.name,c.effect])},
    {type:'podarch-photos',photos:PODARCH_TERRORS.map(({id,name})=>({id,label:name}))},
    {type:'table',headers:['Terror','Copies','Effect'],rows:PODARCH_TERRORS.map(c=>[c.name,String(c.quantity),c.effect])},
    {type:'paragraph',text:'Before the Finale, win at the end of the Killer phase if no Plants, Pods or Assimilated remain. With no Victims remaining at the end of the Killer phase, discard the rest of the Terror deck. Reveal the Finale in Upkeep when the deck runs out. Use both matching Finale Rules cards.'},
    {type:'table',headers:['Finale','Objective'],rows:PODARCH_FINALES.map(c=>[c.name,c.effect])},
  ],
};
