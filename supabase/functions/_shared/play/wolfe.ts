import type { PlayEvent } from './events.ts';
import type { ModuleState } from './modules.ts';
import { PILL_COLORS, WOLFE, WOLFE_AMPED, WOLFE_EVENTS, WOLFE_MODULE, WOLFE_ONGOING, WOLFE_PEOPLE, WOLFE_RECIPES, type PillColor, type Pills } from './wolfeCatalog.ts';

export const emptyPills = ():Pills => ({yellow:0,blue:0,pink:0,wild:0});
export const pillKey = (color:PillColor) => 'pill.'+color;
export const validPillCount = (color:PillColor,count:unknown):count is number =>
  typeof count==='number' && Number.isInteger(count) && count>=0 && count<=(color==='wild'?1:3);
export const wolfeRiders = (value:unknown):value is 0|1|2 => value===0||value===1||value===2;
type Person = typeof WOLFE_PEOPLE[number];
type Status = 'present'|'saved'|'killed'|'left';
type Ongoing = typeof WOLFE_ONGOING[number];
const statuses:readonly Status[] = ['present','saved','killed','left'];
const activeKey = (id:string) => 'active.'+id;
export const ampKey = (id:string) => 'amped.'+id;
const count = (n:unknown,max:number):n is number=>typeof n==='number' && Number.isInteger(n) && n>=0 && n<=max;
const text = (s:unknown,max:number):s is string=>typeof s==='string' && s.trim()===s && s.length>0 && s.length<=max;

export type WolfeCommand =
  | {command:'inventory';pills:Pills}
  | {command:'pickup'|'remove-pill';color:PillColor}
  | {command:'spend';recipe:string;wildFor?:Exclude<PillColor,'wild'>}
  | {command:'eat';recipe:string;wildFor?:Exclude<PillColor,'wild'>;maxHealth?:number}
  | {command:'amped';id:string;active:boolean;enable?:true}
  | {command:'toggle-amped';active:boolean}
  | {command:'ultimate';name:string|null}
  | {command:'event';id:Ongoing;active:boolean}
  | {command:'person';id:Person;status:Status}
  | {command:'gurney';riders:number|null}
  | {command:'clear-gurney'}
  | {command:'ram';riders:number}
  | {command:'spent'}
  | {command:'stun';enemy:string;count:number}
  | {command:'clear-stun'};
export type WolfeAction = WolfeCommand & {parent:string};

export function wolfePills(state:ModuleState):Pills|undefined {
  const pills=emptyPills();
  for(const color of PILL_COLORS) {
    const value=state[pillKey(color)];
    if(!validPillCount(color,value)) return;
    pills[color]=value;
  }
  return pills;
}
export function wolfeHeld(state:ModuleState) {
  const pills=wolfePills(state);
  return pills?Object.values(pills).reduce((a,b)=>a+b,0):undefined;
}
export function wolfeRecipeOptions(pills:Pills,id:string) {
  const recipe=WOLFE_RECIPES.find(r=>r.id===id);
  if(!recipe) return [];
  return [undefined,...(pills.wild?recipe.colors:[])].filter(wildFor=>
    recipe.colors.every(color=>color===wildFor||pills[color]>0));
}
export const wolfeAmped = (state:ModuleState) =>
  state['amped.on'] === undefined ? WOLFE_AMPED.some(card=>state[ampKey(card.id)]) : state['amped.on'] === true;

export function wolfeSummary(state:ModuleState) {
  const held=wolfeHeld(state);
  const amped=WOLFE_AMPED.filter(card=>state[ampKey(card.id)]).length;
  return [held===undefined?(state.startingPill?'Starting pill unrecorded':'Held pills unrecorded'):`${held} held ${held===1?'pill':'pills'}`,
    ...(wolfeAmped(state)?[amped>1?`${amped} Amped`:'Amped']:[])].join(' · ');
}

export function initialWolfe(startingEvent?:string|null):ModuleState {
  const name=startingEvent?.toLowerCase().replace(/[^a-z0-9]/g,'');
  const id=WOLFE_EVENTS.find(e=>e.name.toLowerCase().replace(/[^a-z0-9]/g,'')===name)?.id;
  const state:ModuleState={startingPill:true};
  if(WOLFE_ONGOING.some(event=>event===id)) state[activeKey(id!)]=true;
  if(WOLFE_PEOPLE.some(person=>person===id)) state['person.'+id]='present';
  if(id==='gurney') state.gurney=0;
  return state;
}
export function isInitialWolfe(state:ModuleState) {
  return [undefined,...WOLFE_EVENTS.map(e=>e.name)].some(event=>sameWolfe(state,initialWolfe(event)));
}
export function validWolfeField(key:string,value:unknown) {
  if(key==='startingPill'||key==='amped.on') return typeof value==='boolean';
  if(key==='gurney') return value===null||value==='spent'||value==='unknown'||wolfeRiders(value);
  if(key==='secondUltimate') return value===null||text(value,70);
  if(key.startsWith('stun.')&&text(key.slice(5),60)) return value===null||count(value,8);
  if(PILL_COLORS.some(color=>pillKey(color)===key&&validPillCount(color,value))) return true;
  if([...WOLFE_ONGOING.map(activeKey),...WOLFE_AMPED.map(card=>ampKey(card.id))].includes(key)) return typeof value==='boolean';
  return WOLFE_PEOPLE.some(id=>'person.'+id===key)&&statuses.some(status=>status===value);
}
export function validWolfeAction(action:unknown):action is WolfeAction {
  if(!action||typeof action!=='object') return false;
  const a=action as WolfeAction;
  if(!text(a.parent,50)) return false;
  switch(a.command) {
    case 'inventory': return !!a.pills && PILL_COLORS.every(color=>validPillCount(color,a.pills[color]));
    case 'pickup':
    case 'remove-pill': return PILL_COLORS.includes(a.color);
    case 'eat':
    case 'spend':
      if(a.command==='eat'&&a.maxHealth!==undefined&&(!['yellow','yellow-blue'].includes(a.recipe)||!count(a.maxHealth,99)||a.maxHealth===0)) return false;
      return WOLFE_RECIPES.some(r=>r.id===a.recipe&&(a.wildFor===undefined||r.colors.some(c=>c===a.wildFor)));
    case 'toggle-amped': return typeof a.active==='boolean';
    case 'amped': return WOLFE_AMPED.some(card=>card.id===a.id)&&typeof a.active==='boolean'&&(a.enable===undefined||a.enable===true&&a.active);
    case 'ultimate': return a.name===null||text(a.name,70);
    case 'event': return WOLFE_ONGOING.includes(a.id)&&typeof a.active==='boolean';
    case 'person': return WOLFE_PEOPLE.includes(a.id)&&statuses.includes(a.status);
    case 'gurney': return a.riders===null||wolfeRiders(a.riders);
    case 'ram': return wolfeRiders(a.riders);
    case 'stun': return text(a.enemy,60)&&/^[a-z0-9.-]+$/.test(a.enemy)&&count(a.count,8);
    case 'clear-gurney':
    case 'spent':
    case 'clear-stun': return true;
    default: return false;
  }
}

export function wolfeParent(entries:readonly PlayEvent[]) {
  return [...entries].reverse().find(event=>event.moduleData?.module===WOLFE_MODULE)?.id??'root';
}
export function lastWolfeGurneyObservation(entries:readonly PlayEvent[]) {
  return [...entries].reverse().find(event=>
    event.moduleData?.module===WOLFE_MODULE&&event.moduleData.changes.gurney!==undefined);
}
export function sameWolfe(a:ModuleState,b:ModuleState) {
  return Object.keys(a).length===Object.keys(b).length && Object.keys(a).every(key=>a[key]===b[key]);
}
export function resolveWolfe(a:WolfeAction,state:ModuleState,entries:readonly PlayEvent[]):ModuleState|null {
  if(!validWolfeAction(a)||a.parent!==wolfeParent(entries)) return null;
  switch(a.command) {
    case 'inventory':
      return {...Object.fromEntries(PILL_COLORS.map(color=>[pillKey(color),a.pills[color]])),startingPill:false};
    case 'pickup':
    case 'remove-pill': {
      const held=wolfePills(state);
      if(!held) return null;
      const next=held[a.color]+(a.command==='pickup'?1:-1);
      return validPillCount(a.color,next)?{[pillKey(a.color)]:next}:null;
    }
    case 'eat':
    case 'spend': {
      const held=wolfePills(state);
      const recipe=WOLFE_RECIPES.find(r=>r.id===a.recipe);
      if(!held||!recipe||!wolfeRecipeOptions(held,a.recipe).includes(a.wildFor)) return null;
      return Object.fromEntries(recipe.colors.map(color=>{
        const token=color===a.wildFor?'wild':color;
        return [pillKey(token),held[token]-1];
      }));
    }
    case 'toggle-amped':
      return a.active===wolfeAmped(state)?null:{'amped.on':a.active};
    case 'amped': {
      const enable=a.enable&&!wolfeAmped(state);
      if(!enable&&Boolean(state[ampKey(a.id)])===a.active) return null;
      return {[ampKey(a.id)]:a.active,...(enable&&{'amped.on':true}),
        ...(a.id==='final-girl-2'&&!a.active&&{secondUltimate:null})};
    }
    case 'ultimate': return state[ampKey('final-girl-2')]?{secondUltimate:a.name}:null;
    case 'event': return state[activeKey(a.id)]===a.active?null:{[activeKey(a.id)]:a.active};
    case 'person': return state['person.'+a.id]===a.status?null:{['person.'+a.id]:a.status};
    case 'gurney': return state.gurney==='spent'?null:{gurney:a.riders??'unknown'};
    case 'clear-gurney': return wolfeRiders(state.gurney)||state.gurney==='unknown'?{gurney:null}:null;
    case 'ram': return state.gurney===a.riders?{gurney:'spent'}:null;
    case 'spent': return state.gurney==='spent'?null:{gurney:'spent'};
    case 'stun': return {['stun.'+a.enemy]:a.count||null};
    case 'clear-stun': {
      const keys=Object.keys(state).filter(key=>key.startsWith('stun.')&&state[key]);
      return keys.length?Object.fromEntries(keys.map(key=>[key,null])):null;
    }
  }
}
export const wolfePillHorrorReduction = (recipe:string) => recipe==='pink'?1:recipe==='blue-pink'?3:0;

/** Replay only the new linked actions. Legacy spends already resolved benefits on the table. */
export function wolfePillTrackers(action:WolfeAction, current:{finalGirlHealth?:number;finalHorrorLevel?:number}) {
  if(action.command!=='eat') return {};
  const {recipe,maxHealth}=action;
  const {finalGirlHealth:health,finalHorrorLevel:horror}=current;
  if(maxHealth!==undefined) {
    if(recipe==='yellow-blue') return {finalGirlHealth:Math.max(health??0,maxHealth)};
    if(recipe==='yellow'&&health!==undefined&&health<maxHealth) return {finalGirlHealth:health+1};
  }
  const reduction=wolfePillHorrorReduction(recipe);
  if(horror!==undefined&&reduction) return {finalHorrorLevel:Math.max(0,horror-reduction)};
  return {};
}
export const wolfeCasualties = (action:WolfeAction|undefined) => action?.command==='ram'?action.riders:0;
export function wolfeOwnsLog(location:string|undefined,events:readonly PlayEvent[]) {
  return location===WOLFE || events.every(e=>e?.moduleData?.module!==WOLFE_MODULE && !e?.wolfeAction && !e?.wolfeReference);
}
export function wolfeFacts(state:ModuleState) {
  const held=wolfePills(state);
  const facts=held?[('Recorded held pills: '+PILL_COLORS.filter(c=>held[c]).map(c=>held[c]+' '+c).join(', ')).replace(/: $/,': none')+'.']:[];
  if(wolfeAmped(state)) {
    for(const card of WOLFE_AMPED) if(state[ampKey(card.id)]) facts.push('Confirmed Amped card: '+card.name+'.');
    if(state.secondUltimate) facts.push('Second Ultimate is from '+state.secondUltimate+'. The lead actor is unchanged.');
  }
  for(const card of WOLFE_EVENTS) {
    if(state[activeKey(card.id)]) facts.push(card.name+' is recorded active. Its presence alone establishes no outcome.');
    if(state['person.'+card.id]) facts.push(card.name+' last recorded status: '+state['person.'+card.id]+'.');
  }
  if(state.gurney==='spent') facts.push('The Hospital Gurney is recorded spent. This status alone does not establish a rider death or damage.');
  return facts.join(' ');
}
