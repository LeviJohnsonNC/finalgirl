/** Standard-mode owner photos grim6/grim4/grim3/grim2/grim1.jpeg.
 * Persistent source ledger: docs/imports/grimlash.md. Observations, never a rules engine. */
import type { ModuleState, ModuleValue } from './modules.ts';
export const GRIMLASH_SOURCE = 'Owner photographs grim1–grim6 and grim15.jpeg, 2026-10-30, standard mode';
export const GRIMLASH_VISUAL = 'An ancient harvest entity with a charred hollow gourd-like crown burning around its open rim, a dark obscured face and root-like tendrils wrapping a gaunt neck and torso, ragged dark weathered clothing, long root-like fingers and fire at its hand. Preserve this silhouette with tangible scorched organic materials and coherent firelight. Not a cheerful orange Halloween pumpkin mask. Use the selected Location, never assume Shady Acres or Children.';
export const GRIMLASH_POWERS = [
 {id:'rite-of-the-corrupted',name:'Rite of the Corrupted',effect:'During Upkeep, increase Harvest Madness once if it did not increase this turn.'},
 {id:'root-bound-curse',name:'Root-Bound Curse',effect:'Whenever healing icons are resolved for healing or reducing Harvest Madness, Grimlash recovers half that much Health, rounded up.'},
 {id:'rite-of-the-old-one',name:'Rite of the Old One',effect:'Whenever Harvest Madness increases to a new level, discard the next Terror card.'},
 {id:'fields-of-madness',name:'Fields of Madness',epic:true,effect:'Epic Dark Power. Modify Horror Roll dice by Madness level: Level 0/1 −1 die, minimum 1; Level 2 unchanged; Level 3 +1 die.'},
] as const;
export const GRIMLASH_FINALES = [
 {id:'hunger-of-the-old-gods',name:'Hunger of the Old Gods',effect:'Target the closest Final Girl or Victim; move twice; attack twice. At the end of the Killer phase, all Victims move 1 space towards Grimlash.'},
 {id:'ancient-abomination',name:'Ancient Abomination',effect:'Target the closest Final Girl or Victim; move twice; attack. Whenever Grimlash attacks, add the Harvest Madness level (not position) to his Attack Value.'},
 {id:'withered-harbinger',name:'Withered Harbinger',effect:'Target the Final Girl; move; attack twice. Lose 1 Time for every space Grimlash moves during the Killer phase.'},
 {id:'god-of-blood-and-grain',name:'God of Blood and Grain',epic:true,effect:'Epic Finale. When revealed, kill all Victims. Target the Final Girl; move; attack twice. Recording a reveal never records casualties.'},
] as const;
export const GRIMLASH_MINORS = [
 {id:'flaming-eyes',name:'Flaming Eyes',health:1,effect:'Whenever Grimlash enters your space, increase Harvest Madness twice.'},
 {id:'burning-sickle',name:'Burning Sickle',health:2,effect:'Whenever Grimlash deals you damage, also deal 1 damage to every Victim in your space.'},
] as const;
export const GRIMLASH_HARVEST = [
 {id:'decaying-humanity',name:'Decaying Humanity',level:1,flip:true,effect:'Flip to convert a partial-success die by discarding 1 Action card instead of 2.'},
 {id:'vile-prowess',name:'Vile Prowess',level:1,flip:true,effect:'Flip when you roll 2 unmodified successes to gain 4 Time.'},
 {id:'thorn-choked-veins',name:'Thorn-Choked Veins',level:1,flip:false,effect:'Increase maximum Health by 1 and recover 1 Health. On discard, reduce maximum by 1; any Health above maximum is lost.'},
 {id:'blooming-pestilence',name:'Blooming Pestilence',level:1,flip:true,effect:'Flip while on a Search or Exit space to recover 1 Health.'},
 {id:'hollow-soul',name:'Hollow Soul',level:1,flip:true,effect:'Flip during a Horror Roll to reroll 1 blank die.'},
 {id:'vulgar-regrowth',name:'Vulgar Regrowth',level:2,flip:true,effect:'Flip to ignore 1 damage.'},
 {id:'all-consuming-energy',name:'All-Consuming Energy',level:2,flip:true,effect:'Flip during a Horror Roll and increase Horror once to change 1 partial success to a success.'},
 {id:'visions-of-the-beyond',name:'Visions of the Beyond',level:2,flip:false,effect:'Gain 2 Time each time you increase Horror.'},
 {id:'blood-of-the-reaper',name:'Blood of the Reaper',level:2,flip:true,effect:'Flip during a Horror Roll and lose 1 Health to reroll all partial-success dice. Health loss is not damage.'},
 {id:'primal-awareness',name:'Primal Awareness',level:2,flip:true,effect:'Flip during Action to resolve an Action costing 3 Time or less from the Tableau as though played from your hand.'},
 {id:'entangled-fates',name:'Entangled Fates',level:3,flip:false,effect:'Whenever drawing a Terror, draw 2 and resolve 1, placing the other on the deck bottom.'},
 {id:'fiendish-vitality',name:'Fiendish Vitality',level:3,flip:false,effect:'When you flip your black Final Health token, recover 2 Health if blank.'},
 {id:'one-with-the-land',name:'One With the Land',level:3,flip:false,effect:'Increase maximum Health by 3 and recover 3 Health. On discard, reduce maximum by 3; any Health above maximum is lost.'},
 {id:'unnatural-possibilities',name:'Unnatural Possibilities',level:3,flip:false,effect:'Action cards cost 1 Time less.'},
 {id:'telluric-visions',name:'Telluric Visions',level:3,flip:false,effect:'Always roll 3 dice for a Horror Roll regardless of Horror. If Bloodlust is at maximum and increases because Horror is raised, immediately lose.'},
] as const;
export const GRIMLASH_TERRORS = [
 {id:'scarecrow',name:'“Was That Scarecrow There Before?”',quantity:2,effect:'Target the Final Girl; move; increase Horror twice.'},
 {id:'consumes-all',name:'“It Consumes All!”',quantity:1,effect:'First resolve the block for the current Madness level: Level 0/1 targets the Final Girl, moves and attacks; Level 2/3 targets the closest Final Girl or Victim, moves and attacks. Then at every level, target the Final Girl, move and attack.'},
 {id:'death-followed',name:'“…And Death Followed With Him.”',quantity:2,effect:'Target the closest Final Girl or Victim; move; attack. At Madness Level 1 or higher, choose lose 1 Health or increase Bloodlust once.'},
 {id:'bleed-upon-the-earth',name:'Bleed Upon the Earth',quantity:1,effect:'Target the closest Final Girl or Victim; move; attack. Increase Horror 0/1/2/3 times at Madness Level 0/1/2/3 respectively.'},
 {id:'bad-moon',name:'A Bad Moon Rises',quantity:2,effect:'Increase Madness once; target the closest Final Girl or Victim; move; attack.'},
 {id:'shadows',name:'Shadows in the Fields',quantity:1,effect:'Panic all Victims in your space; increase Madness twice.'},
 {id:'water-the-earth',name:'To Water the Earth in Blood',quantity:2,effect:'With no Victims on the board, discard and draw the next Terror. Otherwise target a Victim; move; attack.'},
 {id:'roots-of-insanity',name:'Roots of Insanity',quantity:1,effect:'If Horror is 5 or higher, increase Madness twice and discard this card. Otherwise increase Horror twice.'},
 {id:'violent-growth',name:'Violent Growth',quantity:1,effect:'With no Victims on the board, discard and draw the next Terror. Otherwise target a Victim; move; attack; increase Horror twice.'},
 {id:'always-here',name:'“It Has Always Been Here!”',quantity:1,effect:'At Madness Level 3, increase Horror twice and discard this card. Otherwise increase Madness twice.'},
 ...GRIMLASH_MINORS.map(p=>({...p,quantity:1,effect:`Minor Dark Power, ${p.health} separate Health. ${p.effect}`})),
].map(c=>({...c,killer:'Grimlash',source:GRIMLASH_SOURCE}));
export const harvestLevel = (position:unknown):number|undefined => typeof position!=='number'||!Number.isInteger(position)||position<0||position>10 ? undefined : position<3?0:position<5?1:position<7?2:position<10?3:4;
export type GrimlashLoss = 'none'|'skull'|'telluric'|'unknown';
export interface GrimlashEntry {id?:string;kind:string;target?:string;grimlashAction?:GrimlashAction;moduleData?:{module:string;changes:Record<string,ModuleValue>};momentType?:string;killerCard?:string}
export interface GrimlashAction {parent:string;command:'position'|'card'|'face'|'upkeep'|'loss'|'minor';value?:ModuleValue;level?:number;id?:string;correction?:boolean}
export const initialGrimlash = ():ModuleState => ({initialized:true,position:0,peak:0,loss:'none','kept.1':'none','kept.2':'none','kept.3':'none'});
export function grimlashParent(entries:readonly GrimlashEntry[]) {return [...entries].reverse().find(e=>e.kind==='module'&&e.moduleData?.module==='grimlash')?.id??'root';}
export function grimlashState(entries:readonly GrimlashEntry[]):ModuleState {const s:ModuleState={};for(const e of entries)if(e.kind==='module'&&e.moduleData?.module==='grimlash')for(const[k,v]of Object.entries(e.moduleData.changes)){if(v===null)delete s[k];else s[k]=v;}return s;}
export function validGrimlashField(key:string,v:unknown):boolean {
 if(key==='initialized')return v===true;
 if(key==='position'||key==='peak')return v===null||(typeof v==='number'&&harvestLevel(v)!==undefined);
 if(key==='loss')return ['none','skull','telluric','unknown'].includes(String(v));
 const m=/^(kept|face)\.([123])$/.exec(key);
 if(m)return v===null||(m[1]==='face'?['ready','spent','unknown'].includes(String(v)):v==='none'||GRIMLASH_HARVEST.some(c=>c.level===Number(m[2])&&c.id===v));
 const p=GRIMLASH_MINORS.find(p=>key===`minor.${p.id}.health`);return !!p&&(v===null||(typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=p.health));
}
export function validGrimlashAction(input:unknown):input is GrimlashAction {
 if(!input||typeof input!=='object'||Array.isArray(input))return false;
 const a=input as GrimlashAction;if(typeof a.parent!=='string'||a.parent.length>80||!['position','card','face','upkeep','loss','minor'].includes(a.command))return false;
 if(Object.keys(a).some(k=>!['parent','command','value','level','id','correction'].includes(k))||(a.correction!==undefined&&typeof a.correction!=='boolean'))return false;
 if(a.command==='upkeep')return a.value===undefined&&a.level===undefined&&a.id===undefined;
 if(a.command==='position')return a.level===undefined&&a.id===undefined&&validGrimlashField('position',a.value);
 if(a.command==='loss')return a.level===undefined&&a.id===undefined&&validGrimlashField('loss',a.value);
 if(a.command==='minor')return a.level===undefined&&typeof a.id==='string'&&validGrimlashField(`minor.${a.id}.health`,a.value);
 return [1,2,3].includes(a.level!)&&a.id===undefined&&validGrimlashField(`${a.command==='card'?'kept':'face'}.${a.level}`,a.value);
}
export function resolveGrimlashAction(a:GrimlashAction,s:ModuleState,entries:readonly GrimlashEntry[]):ModuleState|null {
 if(!validGrimlashAction(a)||a.parent!==grimlashParent(entries))return null;
 const changes:ModuleState={};
 if(a.command==='position') {
  if(a.value===s.position||(a.value===null&&s.position===undefined))return null;
  changes.position=a.value!;
  const before=harvestLevel(s.position),after=harvestLevel(a.value);
  if(!a.correction&&typeof a.value==='number')changes.peak=Math.max(typeof s.peak==='number'?s.peak:0,a.value);
  for(const level of [1,2,3]) {
   if(after!==undefined&&after<level){changes[`kept.${level}`]='none';changes[`face.${level}`]=null;}
   else if(after!==undefined&&before!==undefined&&before<level&&after>=level){changes[`kept.${level}`]=null;changes[`face.${level}`]=null;}
  }
  if(a.value===10)changes.loss='skull';
 } else if(a.command==='card') {
  const level=harvestLevel(s.position);if(level!==undefined&&level<a.level!)return null;
  const key=`kept.${a.level}`;if(s[key]===a.value||(a.value===null&&s[key]===undefined))return null;
  changes[key]=a.value!;
  const c=GRIMLASH_HARVEST.find(c=>c.id===a.value);
  if(a.value!==null||!a.correction)changes[`face.${a.level}`]=c?.flip?(a.correction?(s[`face.${a.level}`]??'unknown'):'ready'):null;
 } else if(a.command==='face') {
  const c=GRIMLASH_HARVEST.find(c=>c.id===s[`kept.${a.level}`]);if(!c?.flip||a.value===s[`face.${a.level}`])return null;changes[`face.${a.level}`]=a.value!;
 } else if(a.command==='upkeep') {
  for(const c of GRIMLASH_HARVEST)if(c.flip&&s[`kept.${c.level}`]===c.id&&s[`face.${c.level}`]==='spent')changes[`face.${c.level}`]='ready';
 } else if(a.command==='minor') {const key=`minor.${a.id}.health`;if(a.value===s[key]||(a.value===null&&s[key]===undefined))return null;changes[key]=a.value!;
 } else {
  if(a.value===s.loss)return null;
  if(a.value==='telluric'&&s['kept.3']!=='telluric-visions'&&!a.correction)return null;
  if((a.value==='none'||a.value==='unknown')&&!a.correction)return null;
  changes.loss=a.value!;
  if(a.correction&&(a.value==='none'||a.value==='unknown')&&s.position===10){changes.position=null;if(s.peak===10)changes.peak=null;}
 }
 return Object.keys(changes).length?changes:null;
}
export function isInitialGrimlash(changes:ModuleState) {return JSON.stringify(Object.entries(changes).sort())===JSON.stringify(Object.entries(initialGrimlash()).sort());}
export function grimlashFatal(state:ModuleState) {return state.loss==='skull'||state.loss==='telluric';}
export function grimlashHealthBonus(state:ModuleState) {return (state['kept.1']==='thorn-choked-veins'?1:0)+(state['kept.3']==='one-with-the-land'?3:0);}
export function grimlashFacts(s:ModuleState) {
 const level=harvestLevel(s.position);
 const parts=[`Harvest Madness ${typeof s.position==='number'?`position ${s.position}, ${level===4?'skull':`Level ${level}`}`:'not recorded'}.`];
 if(grimlashFatal(s))parts.push(`Explicit game loss: ${s.loss}. This does not itself establish zero Health or a physical death.`);
 for(const l of [1,2,3]){const c=GRIMLASH_HARVEST.find(c=>c.id===s[`kept.${l}`]);if(c)parts.push(`${c.name}${c.flip?` (${s[`face.${l}`]??'face not recorded'})`:''}: ${c.effect}`);}

 return parts.join(' ')+' Physical dice, costs, healing, movements and casualties are player-resolved; no unrecorded effects are implied. Children belong only to Shady Acres.';
}

/** Printed board entry icons, not effects run by companion tracking. */
export const GRIMLASH_BLOODLUST = [
 {attack:1,move:1,entry:'Starting position'},
 {attack:1,move:1,entry:'Increase Harvest Madness once'},
 {attack:1,move:1,entry:'No additional entry icon'},
 {attack:2,move:1,entry:'No additional entry icon'},
 {attack:2,move:2,entry:'Reveal Dark Power'},
 {attack:3,move:2,entry:'Recover 2 killer Health'},
 {attack:3,move:2,entry:'Increase Harvest Madness once'},
 {attack:4,move:3,entry:'Increase Horror once'},
 {attack:4,move:3,entry:'Recover 2 killer Health'},
] as const;
/** Icon sequences kept separate from triggered/conditional card prose. */
export const GRIMLASH_ACTIONS:Record<string,string>={
 base:'Closest Final Girl or Victim → move exactly 1 space → attack → if a Victim was killed, increase Madness once. The photographed landscape face is unnamed; its exact reverse identity is unverified.',
 'hunger-of-the-old-gods':'Closest Final Girl or Victim → move → move → attack → attack',
 'ancient-abomination':'Closest Final Girl or Victim → move → move → attack',
 'withered-harbinger':'Final Girl → move → attack → attack',
 'god-of-blood-and-grain':'Final Girl → move → attack → attack',
 scarecrow:'Final Girl → move; then Horror +2',
 'consumes-all':'First: Level 0/1 Final Girl → move → attack, OR Level 2/3 closest Final Girl or Victim → move → attack. Then ALWAYS: Final Girl → move → attack.',
 'death-followed':'Closest Final Girl or Victim → move → attack; then level-dependent choice',
 'bleed-upon-the-earth':'Closest Final Girl or Victim → move → attack; then level-dependent Horror',
 'bad-moon':'Madness +1; then closest Final Girl or Victim → move → attack',
 shadows:'Panic all Victims in your space; then Madness +2',
 'water-the-earth':'No Victims: discard/redraw. Otherwise Victim → move → attack',
 'roots-of-insanity':'Horror 5+: Madness +2 and discard. Otherwise Horror +2',
 'violent-growth':'No Victims: discard/redraw. Otherwise Victim → move → attack; then Horror +2',
 'always-here':'Level 3: Horror +2 and discard. Otherwise Madness +2',
};
