import type { ModuleState, ModuleValue } from './modules.ts';

/** Owner edition: evo1–evo6.jpeg. Scan equivalence confirmed by Levi 2026-10-28. */
export const EVOMORPH_SOURCE = 'Owner photos evo1–evo6.jpeg, standard mode; three identical Scan cards confirmed by owner (2026-10-28)';
export const EVOMORPH_STAGES = ['hatchling', 'youngling', 'adult'] as const;
export type EvolutionStage = typeof EVOMORPH_STAGES[number];
export const EVOMORPH_VISUAL = 'The Adult is an eyeless red-and-ivory alien predator with a ridged head, exposed toothed mouth, sinewy clawed limbs and a long scythe-tipped tail. Hatchling is a small low larval creature; Youngling has the compact hunched silhouette shown on the Evolution card, not the full Adult body. Preserve the recorded stage and the selected Location. If stage is unknown, leave the creature out of frame rather than inventing an Adult encounter. A reference background or decorative photograph establishes no injuries, weather, casualties or location.';
const returnText = 'When revealed, place Evomorph in the closest space to you without a Scan token, then remove all Scan tokens.';
export const EVOMORPH_POWERS = [
  { id: 'symbiotic-camouflage', name: 'Symbiotic Camouflage', effect: `${returnText} When drawing Ambush cards, draw one extra and choose the highest Danger.` },
  { id: 'acid-blood', name: 'Acid Blood', effect: `${returnText} Whenever you damage Evomorph in your space, lose 1 Health.` },
  { id: 'razor-claws', name: 'Razor Claws', effect: `${returnText} Whenever Evomorph damages you, randomly discard one Action card.` },
  { id: 'razor-tail', name: 'Razor Tail', epic: true, effect: 'Epic Dark Power. When revealed, place Evomorph in the space with the most Victims without a Scan token and kill every Victim there. Then remove all Scan tokens. Whenever Evomorph attacks at least once, attack an additional time in each adjacent space.' },
] as const;
export const EVOMORPH_FINALES = [
  { id: 'perfect-organism', name: 'The Perfect Organism', effect: 'Target the closest Final Girl or Victim, move and attack twice.' },
  { id: 'blitz-of-death', name: 'Blitz of Death', effect: 'Target the closest Final Girl or Victim, move and attack twice; then target the closest Final Girl or Victim, move and attack.' },
  { id: 'death-in-the-dark', name: 'Death in the Dark', effect: 'Target the closest Final Girl or Victim, move, attack, then Vanish. When drawing Ambush cards, draw one extra and choose the highest Danger.' },
] as const;
export const EVOMORPH_MINORS = [
  { id: 'sideswipe', name: 'Sideswipe', health: 3, effect: 'Whenever Evomorph Vanishes, first target the closest Final Girl or Victim and attack, before it disappears.' },
  { id: 'shadow-dread', name: 'Shadow Dread', health: 2, effect: 'Whenever you draw an Ambush card with Danger 2 or less, discard it and draw another.' },
  { id: 'dead-silence', name: 'Dead Silence', health: 2, effect: 'Roll one fewer die, minimum one, when resolving Scan.' },
] as const;
const notHatchling = 'If Evomorph is a Hatchling, discard this Terror and draw the next instead. Otherwise: ';
const hunt = 'Target the closest Final Girl or Victim, move and attack';
export const EVOMORPH_TERRORS = [
  ...EVOMORPH_MINORS.map(p => ({name:p.name, quantity:1, effect:`Minor Dark Power, ${p.health} Health. ${p.effect}`})),
  {name:'"Oh God, Where Did It Go!?"',quantity:1,effect:notHatchling+'Increase Horror by 3, then Vanish.'},
  {name:'Shadow Blitz',quantity:2,effect:notHatchling+'Vanish, then immediately draw the next Ambush card.'},
  {name:'"Game Over, Man! Game Over!"',quantity:3,effect:'If no Victims remain on the board, discard and draw the next Terror. Otherwise increase Horror by 1, target the closest Victim, move and attack.'},
  {name:'Skull Burster',quantity:1,effect:notHatchling+'Double the Attack Value, then target the closest Final Girl or Victim and attack. If a Victim was killed, increase Horror by 1 for each additional Victim in Evomorph’s space or an adjacent space. Then Vanish.'},
  {name:'Acid Spray',quantity:1,effect:notHatchling+'Target the Final Girl, move and attack. If Evomorph damages you, discard a random Item; if you have no Items, lose 2 Health instead. Then Vanish.'},
  {name:'"It Came Out of the Shadows!"',quantity:2,effect:notHatchling+`${hunt} twice, then Vanish.`},
  {name:'Scratches in the Dark',quantity:1,effect:'Target the closest Final Girl or Victim and move twice. Increase Horror by 1 for each space passed through containing at least one Victim, including the starting and ending spaces.'},
  {name:'Exo-Skeleton',quantity:1,effect:'Place a black Final Health token from the reserve on top of Evomorph’s current Final Health token. This does not increase its Health. When revealing the Final Health token, reveal both together. Increase Horror by 1.'},
  {name:'Toying with the Prey',quantity:1,effect:notHatchling+'Target the Final Girl and move twice. If Evomorph is in your space during the next Action phase, roll one fewer die for all Horror Rolls, minimum one. Then Vanish.'},
].map(c=>({...c,killer:'Evomorph',source:EVOMORPH_SOURCE}));
export const EVOMORPH_SCAN = 'Scan (3 identical copies, cost 1 Time): only while Evomorph has Vanished. Three or more successes: place Evomorph in your space, skip the next Killer phase, and remove this Scan card from the game. Two successes: place a Scan token in your space, then reduce Horror by 1. One success: place a Scan token in your space, then lose 1 Time. Failure: increase Horror by 1, lose 1 Time, then end the Action phase. Resolve costs, rolls and free actions with the physical cards.';
const returnClosest = 'Place Evomorph in the closest space to you without a Scan token, then remove all Scan tokens.';
const evolveNext = 'Move Bloodlust up to the next space with Evolve in its Special Effect column.';
/** IDs follow the physical card's Youngling face; Adult Danger is different. */
export const EVOMORPH_AMBUSH = [
  {id:'ambush-y1',youngling:1,adult:9,younglingEffect:'Discovered shed skin: place a Scan token in the closest space to you without one.',adultEffect:`${returnClosest} Target the Final Girl and attack.`},
  {id:'ambush-y2',youngling:2,adult:6,younglingEffect:'Make a Horror Roll: two successes, place a Scan token in the closest space to you without one; one success, no effect; failure, increase Bloodlust by 1.',adultEffect:`${returnClosest} Increase Horror by 1.`},
  {id:'ambush-y3',youngling:3,adult:5,younglingEffect:'Increase Bloodlust by 1.',adultEffect:returnClosest},
  {id:'ambush-y4',youngling:4,adult:7,younglingEffect:'Increase Bloodlust by 2.',adultEffect:`${returnClosest} If Finale is revealed, trigger the Killer Action; otherwise immediately draw the next Terror card.`},
  {id:'ambush-y5',youngling:5,adult:10,younglingEffect:'Increase Horror by 1, then Bloodlust by 1.',adultEffect:`${returnClosest} Target the Final Girl and attack twice.`},
  {id:'ambush-y6',youngling:6,adult:4,younglingEffect:'Increase Horror by 1, then Bloodlust by 2.',adultEffect:'Increase Horror by 1, then lose 2 Time.'},
  {id:'ambush-y7',youngling:7,adult:8,younglingEffect:'Increase Horror by 2, then Bloodlust by 2.',adultEffect:'If there are no Victims on the board, discard and draw the next Ambush. Otherwise place Evomorph with the Victim farthest from you without a Scan token in their space and remove all Scan tokens; target a Victim and attack.'},
  {id:'ambush-y8',youngling:8,adult:2,younglingEffect:evolveNext,adultEffect:'Make a Horror Roll: two successes, place a Scan token in the closest space to you without one; one success, gain 1 Time; failure, increase Horror by 1.'},
  {id:'ambush-y9',youngling:9,adult:3,younglingEffect:`Increase Horror by 2, then ${evolveNext}`,adultEffect:'Increase Horror by 1.'},
  {id:'ambush-y10',youngling:10,adult:1,younglingEffect:`${evolveNext} Then target the closest Final Girl or Victim and attack.`,adultEffect:'Gain 2 Time.'},
] as const;
export const EVOMORPH_BLOODLUST = [
  {attack:10,move:1},{attack:1,move:5,evolve:true},{attack:1,move:5},{attack:1,move:5,horror:1},{attack:1,move:5},
  {attack:2,move:2,evolve:true},{attack:3,move:2},{attack:3,move:3,horror:1},{attack:3,move:3},{attack:4,move:3,horror:2},{attack:4,move:4},
] as const;
export const EVOMORPH_OVERFLOW = 'Beyond the top Bloodlust space: gain 2 Time, then discard the next Terror card.';
export const initialEvomorph = (): Record<string,ModuleValue> => ({initialized:true,stage:'hatchling',presence:'on-board',scansKnown:true,...Object.fromEntries(Array.from({length:6},(_,i)=>[`scan.${i+1}`,null])),scanRemoved:0,skipPhase:false,extraHealthToken:false,toying:false});
type Entry = { id?:string;kind:string;moduleData?:{module:string;changes:Record<string,ModuleValue>};momentType?:string;killerCard?:string };
export function evomorphParent(entries:readonly Entry[]) {return [...entries].reverse().find(e=>e.kind==='module'&&e.moduleData?.module==='evomorph')?.id??'root';}
export function evomorphPower(entries:readonly Entry[]) {
  const reveal=entries.find(e=>e.kind==='moment'&&e.momentType==='dark-power');
  return {revealed:Boolean(reveal),card:EVOMORPH_POWERS.find(c=>c.name===reveal?.killerCard)};
}
const integer=(v:unknown,max:number):v is number=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=max;
const text=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=120&&[...v].every(c=>c.charCodeAt(0)>=32&&c!=='<'&&c!=='>');
const stages=(v:unknown):v is EvolutionStage=>EVOMORPH_STAGES.includes(v as EvolutionStage);
export function validEvomorphField(key:string,value:unknown):boolean {
  if(value===null)return key!=='initialized'&&validEvomorphField(key, key==='stage'?'hatchling':key==='presence'?'on-board':/^scan\.[1-6]$/.test(key)?'Space':key==='scanRemoved'||key.startsWith('minor.')?0:key==='ambushFace'?'youngling':key==='ambushId'?'ambush-y1':key==='room'?'Space':false);
  if(key==='initialized')return value===true;
  if(key==='stage')return stages(value);
  if(key==='presence')return value==='on-board'||value==='vanished';
  if(['scansKnown','skipPhase','extraHealthToken','toying','powerResolved'].includes(key))return typeof value==='boolean';
  if(/^scan\.[1-6]$/.test(key)||key==='room')return text(value);
  if(key==='scanRemoved')return integer(value,3);
  if(key==='ambushFace')return value==='youngling'||value==='adult';
  if(key==='ambushId')return EVOMORPH_AMBUSH.some(c=>c.id===value);
  const minor=EVOMORPH_MINORS.find(p=>key===`minor.${p.id}.health`);
  return Boolean(minor&&integer(value,minor.health));
}
export const EVOMORPH_COMMANDS=['evolve','vanish','return','scan-place','scan-remove','scan-clear','scan-success','skip-consumed','ambush','power-resolve','minor','extra-health','toying','correct'] as const;
export interface EvomorphAction {
  parent:string;command:typeof EVOMORPH_COMMANDS[number];key?:string;value?:ModuleValue;slot?:number;space?:string;face?:'youngling'|'adult';
}
export function validEvomorphAction(value:unknown):value is EvomorphAction {
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const a=value as EvomorphAction;
  if(!/^(root|[0-9a-f]{8}-[0-9a-f-]{27})$/.test(a.parent)||!EVOMORPH_COMMANDS.includes(a.command)||Object.keys(a).some(k=>!['parent','command','key','value','slot','space','face'].includes(k)))return false;
  if(a.slot!==undefined&&(!integer(a.slot,6)||a.slot<1))return false;
  if(a.space!==undefined&&!text(a.space))return false;
  if(a.face!==undefined&&!['youngling','adult'].includes(a.face))return false;
  if(a.command==='correct')return typeof a.key==='string'&&a.key!=='initialized'&&validEvomorphField(a.key,a.value);
  if(a.command==='minor')return EVOMORPH_MINORS.some(p=>p.id===a.key&&(a.value===null||integer(a.value,p.health)));
  if(a.command==='ambush')return EVOMORPH_AMBUSH.some(c=>c.id===a.key)&&a.face!==undefined;
  if(a.command==='scan-place')return a.slot!==undefined&&a.space!==undefined;
  if(a.command==='scan-remove')return a.slot!==undefined;
  if(['return','power-resolve','scan-success'].includes(a.command))return a.space!==undefined;
  if(['extra-health','toying'].includes(a.command))return typeof a.value==='boolean';
  return a.key===undefined&&a.value===undefined&&a.slot===undefined&&a.space===undefined&&a.face===undefined;
}
export function evomorphScans(state:ModuleState) {return Array.from({length:6},(_,i)=>({slot:i+1,space:state[`scan.${i+1}`]})).filter((s):s is {slot:number;space:string}=>typeof s.space==='string');}
export function resolveEvomorphAction(a:EvomorphAction,state:ModuleState,entries:readonly Entry[]):Record<string,ModuleValue>|null {
  if(!validEvomorphAction(a)||a.parent!==evomorphParent(entries))return null;
  const clearScans=()=>({scansKnown:true,...Object.fromEntries(Array.from({length:6},(_,i)=>[`scan.${i+1}`,null]))});
  let changes:Record<string,ModuleValue>;
  switch(a.command) {
    case 'evolve':
      if(state.stage==='hatchling')changes={stage:'youngling',presence:'vanished',room:null};
      else if(state.stage==='youngling')changes={stage:'adult'};
      else return null;
      break;
    case 'vanish':if(!['youngling','adult'].includes(String(state.stage))||state.presence==='vanished')return null;changes={presence:'vanished',room:null};break;
    case 'return':changes={...(a.value===true?clearScans():{}),presence:'on-board',room:a.space!};break;
    case 'scan-place': {
      const label=a.space!.trim();
      if(evomorphScans(state).some(s=>s.slot!==a.slot&&s.space.normalize('NFKC').toLowerCase()===label.normalize('NFKC').toLowerCase()))return null;
      changes={[`scan.${a.slot}`]:label};break;
    }
    case 'scan-remove':changes={[`scan.${a.slot}`]:null};break;
    case 'scan-clear':changes=clearScans();break;
    case 'scan-success':
      if(state.presence!=='vanished'||!integer(state.scanRemoved,3)||state.scanRemoved>=3||state.skipPhase===true)return null;
      changes={presence:'on-board',room:a.space!,scanRemoved:state.scanRemoved+1,skipPhase:true};break;
    case 'skip-consumed':if(state.skipPhase!==true)return null;changes={skipPhase:false};break;
    case 'power-resolve': {
      const power=evomorphPower(entries);
      if(!power.card||state.powerResolved===true)return null;
      changes={...clearScans(),presence:'on-board',room:a.space!,powerResolved:true};break;
    }
    case 'ambush':
      if(state.presence!=='vanished'||state.stage!==a.face)return null;
      changes={ambushId:a.key!,ambushFace:a.face!};break;
    case 'minor':changes={[`minor.${a.key}.health`]:a.value!};break;
    case 'extra-health':changes={extraHealthToken:a.value!};break;
    case 'toying':changes={toying:a.value!};break;
    case 'correct':changes={[a.key!]:a.value!};break;
  }
  return Object.entries(changes).every(([k,v])=>v===null?state[k]===undefined:state[k]===v)?null:changes;
}
export function validEvomorphObservation(action:unknown,changes:Record<string,ModuleValue>):boolean {
  if(!changes||Object.keys(changes).length===0||Object.keys(changes).length>20||!Object.entries(changes).every(([k,v])=>validEvomorphField(k,v)))return false;
  if(action===undefined)return JSON.stringify(Object.entries(changes).sort())===JSON.stringify(Object.entries(initialEvomorph()).sort());
  return validEvomorphAction(action);
}
/** Public projections deliberately omit revision/initialization and unobserved decks. */
export function evomorphFacts(state:ModuleState,entries:readonly Entry[]=[]):string {
  const facts=[`Evomorph stage: ${state.stage??'not recorded'}; presence: ${state.presence??'not recorded'}.`];
  if(state.room)facts.push(`Last reported return space: ${state.room}; subsequent movement is not tracked.`);
  if(state.stage==='hatchling')facts.push('Bloodlust increases only for a Victim killed by Hatchling itself; other increases become Time.');
  if(state.stage==='adult')facts.push('Adult maximum Health is 10; evolution recovery does not establish current Health after later play.');
  const ambush=EVOMORPH_AMBUSH.find(c=>c.id===state.ambushId);
  if(ambush&&(state.ambushFace==='youngling'||state.ambushFace==='adult'))facts.push(`Last recorded Ambush: ${state.ambushFace}, Danger ${ambush[state.ambushFace]}. This is the face drawn, even if evolution followed. ${state.ambushFace==='youngling'?ambush.younglingEffect:ambush.adultEffect} Its reference text does not establish resolved outcomes.`);
  if(state.skipPhase===true)facts.push('The next Killer phase is recorded skipped; no attack or casualty is implied.');
  if(state.toying===true)facts.push('Toying with the Prey is recorded for the next Action phase; its condition still applies.');
  if(state.extraHealthToken===true)facts.push('An additional concealed Final Health token is recorded; its value is unknown.');
  const observedPower=EVOMORPH_POWERS.find(c=>c.id===state.power);
  const power=entries.length?evomorphPower(entries):{revealed:state.powerRevealed===true,card:observedPower};
  if(power.revealed)facts.push(`Dark Power ${power.card?.name??'name unknown'}; entry effects ${state.powerResolved===true?'recorded resolved':'not confirmed'}.`);
  const finale=EVOMORPH_FINALES.find(c=>c.id===state.finale);if(finale)facts.push(`Finale ${finale.name}: ${finale.effect} Reference only; do not infer resolved attacks.`);
  for(const p of EVOMORPH_MINORS) {const h=state[`minor.${p.id}.health`];if(typeof h==='number')facts.push(`${p.name} ${h}/${p.health}${h===0?' removed':': '+p.effect}.`);}
  return facts.join(' ');
}
export function evomorphOpeningGuidance(stage:unknown,fresh:boolean):string {
  const observed=stages(stage)?stage:fresh?'hatchling':undefined;
  return `Evomorph stage for this scene: ${observed??'unknown'}. ${observed==='hatchling'?'It has not evolved; do not show a Youngling or Adult or invent its first kill.':!observed?'Do not infer Adult anatomy, evolution or prior kills from a generic portrait or an empty legacy log.':''} Preserve the selected Location and Final Girl. An offscreen threat is valid. ${EVOMORPH_VISUAL}`;
}
