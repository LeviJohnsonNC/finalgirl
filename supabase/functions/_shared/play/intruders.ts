export const INTRUDERS = 'The Intruders';
export const INTRUDER_MODULE = 'intruders';
export const INTRUDER_SOURCE = 'A Knock at the Door — photographed killer board, booklet and cards (I1–I6)';
export const INTRUDER_ROSTER = [
  {id:'trish', name:'Trish', color:'Red'},
  {id:'baghead', name:'Baghead', color:'Gray'},
  {id:'zeke', name:'Zeke', color:'Black'},
] as const;
export type IntruderId = typeof INTRUDER_ROSTER[number]['id'];
export const INTRUDER_HEALTH = 6;
export const INTRUDER_HORROR = 3;
export const INTRUDER_BLOODLUST = [
  [1,1,'Start'], [1,1,'Increase Horror by 2'], [1,2,''], [1,2,''],
  [2,2,'Increase Horror by 1'], [2,2,'Reveal Dark Power'], [2,2,'Increase Horror by 1'],
  [2,3,''], [3,3,''], [3,3,'Increase Horror by 2'], [3,3,''],
] as const;
export const INTRUDER_OVERFLOW = 'At maximum Bloodlust, discard the next Terror card for each further increase.';
export const INTRUDER_VISUAL = 'Three distinct masked adults in practical costumes. Trish wears a long antlered deer-skull mask with long dark hair. Baghead wears a rope-tied burlap sack with uneven eye holes and plaid flannel. Zeke wears an angular pale mask with a black sawtooth grin and a denim jacket. Keep their masks and silhouettes distinct. Use the selected location and show only the people the shot calls for.';
const closest = 'Target whoever is closest, Victim or Final Girl';
const chase = closest + ', move, then attack';
const longChase = closest + ', move up to twice the Movement value, then attack';
const victim = 'Target the closest Victim, move, then attack';
const noVictims = 'If no Victims are on the board, discard this and draw the next Terror card.';
const up = 'Shift Active Killer up';
const down = 'Shift Active Killer down';
export const INTRUDER_STARTING_ACTION = 'All living Intruders, from top to bottom: ' + closest.toLowerCase() + ', then attack.';
export const INTRUDER_POWERS = [
  {id:'strength-in-numbers',name:'Strength in Numbers',epic:false,effect:'Each attack deals one additional damage for each other Killer in the same or an adjacent space.'},
  {id:'no-remorse',name:'No Remorse',epic:false,effect:'At the start of Upkeep, roll a die. Increase Bloodlust by one if the result exceeds the number of Killers.'},
  {id:'maskaphobia',name:'Maskaphobia',epic:false,effect:'Once per turn, increase Horror by one when a Killer moves into your space. While a Killer is in your space, you cannot purchase Focus.'},
  {id:'wont-stay-down',name:'Won’t Stay Down',epic:true,effect:'When a Killer dies, immediately give that Killer two normal Health and a random black Final Health token, then remove this card from the game.'},
] as const;
export const INTRUDER_EPIC = INTRUDER_POWERS[3];
export const INTRUDER_FINALES = [
  {id:'hunt-sweet-hunt',name:'Hunt Sweet Hunt',effect:longChase + '. Then shift the Active Killer up. Each attack deals one additional damage.'},
  {id:'release-the-beast',name:'Release the Beast',effect:'All living Killers are active for the rest of the game. From the top of the board down, each targets whoever is closest, Victim or Final Girl, moves, and attacks.'},
  {id:'youre-gonna-die',name:'You’re Gonna Die',effect:chase + '. ' + down + '. ' + chase + '.'},
] as const;
export const INTRUDER_ALL = INTRUDER_FINALES[1].name;
export const INTRUDER_MINORS = [
  {id:'amphetamines',name:'Amphetamines',health:2,effect:'At the start of the Killer phase, the Killer with the lowest Health recovers two Health.'},
  {id:'coordinated-attack',name:'Coordinated Attack',health:2,effect:'At the end of the Killer phase, shift the Active Killer up. ' + chase + '.'},
] as const;
export const INTRUDER_TERRORS = [
  {id:'they-will-hunt-you',name:'They Will Hunt You',quantity:2,effect:'Place the Active Killer in your space. Target the Final Girl and attack. Twice in sequence, shift the Active Killer down, target the Final Girl, and move.'},
  {id:'it-was-wearing-a-mask',name:'It Was Wearing a Mask',quantity:2,effect:'Increase Horror by one. ' + noVictims + ' Otherwise, shift the Active Killer down, then ' + victim.toLowerCase() + '.'},
  {id:'through-the-night',name:'We’re Not Going to Make It Through the Night!',quantity:2,effect:chase + '. ' + up + '. ' + chase + '. Increase Horror by one.'},
  {id:'theyre-everywhere',name:'They’re Everywhere!',quantity:1,effect:chase + '. ' + up + ', target the Final Girl, move and attack. ' + up + ', target the closest Victim and move.'},
  {id:'why-are-they',name:'Why Are They Doing This to Us?',quantity:2,effect:noVictims + ' Otherwise, shift the Active Killer up, then ' + victim.toLowerCase() + '. Increase Horror by one.'},
  {id:'where-are-they',name:'Where Are They Coming From?',quantity:1,effect:longChase + '. ' + up + '. If Victims remain on the board, place the Active Killer with the farthest Victim, target the closest Victim and attack.'},
  {id:'blood-everywhere',name:'There’s Blood Everywhere',quantity:2,effect:down + '. ' + chase + '. Increase Horror by one.'},
  {id:'go-away',name:'Go Away!!!',quantity:1,effect:'Each Killer in your space or a space with a Victim takes one damage. Each Killer damaged this way targets whoever is closest, Victim or Final Girl, then attacks. Draw the next Event.'},
  {id:'all-going-to-die',name:'We’re All Going to Die!',quantity:1,effect:noVictims + ' Otherwise, ' + victim.toLowerCase() + '. ' + down + '. ' + victim + '.'},
] as const;

type Observation = Record<string, string | number | boolean | null>;
type Token = 'black' | 'white' | 'pending' | 'dead';
type Entry = {id?:string; kind:string; momentType?:string; killerCard?:string; intruderFinale?:string; intruderPower?:string; moduleData?:{module:string;changes:Observation}};
export type IntruderAction = {parent:string} & (
  | {command:'activate' | 'down' | 'dead' | 'epic'; who:IntruderId}
  | {command:'shift'; direction:'up' | 'down'}
  | {command:'health' | 'return'; who:IntruderId; value:number}
  | {command:'token'; who:IntruderId; value:'black' | 'white' | null}
  | {command:'minor'; card:typeof INTRUDER_MINORS[number]['id']; value:number|null}
);
export const intruderMinorField = (id:string) => `minor.${id}`;
const hpKey = (id:IntruderId) => `${id}.health`;
const tokenKey = (id:IntruderId) => `${id}.token`;
export const intruderId = (value:unknown): value is IntruderId => INTRUDER_ROSTER.some(person=>person.id===value);
const healthValue = (value:unknown, min=0, max=INTRUDER_HEALTH): value is number =>
  typeof value==='number' && Number.isInteger(value) && value>=min && value<=max;
const tokens = ['black','white','pending','dead'] as const;
export function initialIntruders(): Observation {
  return Object.fromEntries([
    ['active','trish'],
    ...INTRUDER_ROSTER.flatMap(({id})=>[[hpKey(id),INTRUDER_HEALTH],[tokenKey(id),'black']]),
  ]);
}
export function sameIntruderChanges(left:Observation,right:Observation) {
  return Object.keys(left).length===Object.keys(right).length && Object.entries(left).every(([key,value])=>right[key]===value);
}
export function validIntruderField(key:string,value:unknown) {
  if(key==='active') return value===null || value==='none' || intruderId(value);
  if(key==='spent') return value===true;
  return INTRUDER_ROSTER.some(({id})=>
    key===hpKey(id) && healthValue(value) ||
    key===tokenKey(id) && (value===null || tokens.includes(value as Token))) ||
    INTRUDER_MINORS.some(card=>key===intruderMinorField(card.id) && (value===null || healthValue(value,0,card.health)));
}
export function validIntruderAction(input:unknown):input is IntruderAction {
  if (!input || typeof input !== 'object') return false;
  const a=input as Record<string,unknown>;
  if (typeof a.parent!=='string'||! /^(root|[\da-f-]{36})$/i.test(a.parent)) return false;
  if (a.command==='shift') return a.direction==='up'||a.direction==='down';
  if (a.command==='minor') return INTRUDER_MINORS.some(c=>c.id===a.card)&&(a.value===null||healthValue(a.value,0,2));
  if (!intruderId(a.who)) return false;
  if (a.command==='health') return healthValue(a.value,1);
  if (a.command==='return') return healthValue(a.value,1,3);
  if (a.command==='token') return a.value===null||a.value==='black'||a.value==='white';
  return ['activate','down','dead','epic'].includes(String(a.command));
}
export const intruderParent = (entries:readonly Entry[]) => [...entries].reverse().find(e=>e.moduleData?.module===INTRUDER_MODULE)?.id ?? 'root';
export function intruderFigure(state:Observation,id:IntruderId) {
  const health=state[hpKey(id)];
  const token=state[tokenKey(id)] as Token | undefined;
  return {health:typeof health==='number'?health:undefined,token};
}
export function intruderMode(entries:readonly Entry[]) {
  const finale=entries.find(e=>e.kind==='moment'&&e.momentType==='finale');
  const name=finale?.intruderFinale ?? finale?.killerCard;
  return !finale?'single':name===INTRUDER_ALL?'all':INTRUDER_FINALES.some(c=>c.name===name)?'single':'unknown';
}
export function intruderEpicReady(state:Observation,entries:readonly Entry[]) {
  const power=entries.find(e=>e.kind==='moment'&&e.momentType==='dark-power');
  return !state.spent && (power?.intruderPower ?? power?.killerCard)===INTRUDER_EPIC.name;
}
const isOut = (token?:Token) => token==='pending'||token==='dead';
export function resolveIntruderAction(action:IntruderAction,state:Observation,entries:readonly Entry[]):Observation|undefined {
  if (action.parent!==intruderParent(entries)) return;
  if (action.command==='minor') {
    const key=intruderMinorField(action.card);
    return (state[key]??null)===action.value?undefined:{[key]:action.value};
  }
  if (action.command==='shift') {
    if (intruderMode(entries)!=='single'||!intruderId(state.active)) return;
    const ids=INTRUDER_ROSTER.map(p=>p.id);
    const from=ids.indexOf(state.active);
    const step=action.direction==='up'?-1:1;
    for (let offset=1;offset<ids.length;offset++) {
      const candidate=ids[(from+step*offset+ids.length)%ids.length];
      const {token,health}=intruderFigure(state,candidate);
      if (isOut(token)) continue;
      if (token===undefined && health===undefined) return;
      return {active:candidate};
    }
    return;
  }
  const {who}=action;
  const hp=hpKey(who);
  const status=tokenKey(who);
  const {health,token}=intruderFigure(state,who);
  if (action.command==='activate') {
    if (intruderMode(entries)==='all'||isOut(token)||state.active===who) return;
    return {active:who};
  }
  if (action.command==='health') {
    if (isOut(token)||health===action.value) return;
    return {[hp]:action.value};
  }
  if (action.command==='token') {
    if ((token??null)===action.value || (isOut(token)&&action.value===null)) return;
    // Reinstating a wrongly removed figure establishes its last token only.
    return {[status]:action.value,...(isOut(token)&&{[hp]:1})};
  }
  if (action.command==='return') {
    if (token!=='pending') return;
    return {[hp]:action.value,[status]:'white'};
  }
  if (token==='dead') return;
  const handoff:Observation={};
  if (state.active===who) {
    const possible=INTRUDER_ROSTER.filter(p=>p.id!==who&&!isOut(intruderFigure(state,p.id).token));
    const first=possible[0] && intruderFigure(state,possible[0].id);
    handoff.active=first ? first.token || first.health!==undefined ? possible[0].id : null : 'none';
  }
  if (action.command==='down') {
    if (token==='pending'||token==='white') return;
    return {[hp]:0,[status]:'pending',...handoff};
  }
  if (token!=='pending'&&token!=='white'&&token!==undefined) return;
  const epicReady=intruderEpicReady(state,entries);
  if (action.command==='epic') {
    if (!epicReady) return;
    return {[hp]:3,[status]:'black',spent:true,...handoff};
  }
  if (!epicReady) return {[hp]:0,[status]:'dead',...handoff};
}
export function intruderFacts(state:Observation) {
  const roster=INTRUDER_ROSTER.map(({id,name})=>{
    const {health,token}=intruderFigure(state,id);
    if (token==='pending') return `${name} down, Final Health unresolved`;
    if (token==='dead') return `${name} confirmed dead`;
    return `${name} ${health===undefined?'health unrecorded':health+' HP'}`;
  });
  const active=INTRUDER_ROSTER.find(p=>p.id===state.active);
  const mode=state.mode==='all'?'All living Intruders active':state.mode==='unknown'?'Finale mode unconfirmed':active?`${active.name} holds the Active Killer marker`:state.active==='none'?'No Active Killer marker':'Active Killer unrecorded';
  const minors=INTRUDER_MINORS.flatMap(card=>{
    const health=state[intruderMinorField(card.id)];
    return typeof health==='number' ? [`${card.name} ${health===0?'removed':health+' HP'}`] : [];
  });
  return [`Intruders: ${roster.join('; ')}.`, `${mode}.`, state.spent?'Won’t Stay Down was used.':'', typeof state.finale==='string'?`Finale: ${state.finale}.`:'',typeof state.power==='string'?`Dark Power: ${state.power}.`:'', minors.length?`Minor Powers: ${minors.join(', ')}.`:''].filter(Boolean).join(' ');
}
