export const ORGANISM = 'The Organism';
export const ORGANISM_MODULE = 'organism';
export const ORGANISM_SOURCE = 'Panic at Station 2891 · The Organism killer sheet and cards';
export const ORGANISM_SETUP = {finalHorrorLevel:5, bloodlust:0} as const;
export const ORGANISM_MAX_BLOODLUST = 7;
export const ORGANISM_COLORS = ['red','black','grey'] as const;
export type OrganismColor = typeof ORGANISM_COLORS[number];
export const ORGANISM_OPENING = 'The threat is hidden among ordinary people. Keep every person visibly human. Build suspicion through faces, behavior and the selected location. No visible mutation, identified host, test result or invented casualty. On a reshoot this takes precedence over inherited creature imagery and continuity.';

const chase = 'Target the closest Final Girl or eligible Victim, move, then attack.';
const victimMove = 'Target the closest eligible Victim and move.';
const victimAttack = 'Target the closest eligible Victim and attack.';
const horror = 'Increase Horror by one.';
const heal = 'Recover one Health.';
const event = 'Draw an Event.';
const panic = 'This killer panics.';
export const ORGANISM_FORMS = [
  {id:'tough',name:'Tough',hp:7,visual:'Tall, asymmetrical torso maw and amber shoulder nodules with wiry tendrils.',
    killerAction:heal, finaleAction:chase, attack:[1,1,1,1,2,2,2,3], move:[1,1,2,2,2,2,2,2], effects:['',victimMove,victimMove,event,horror,heal,horror,chase]},
  {id:'six',name:'6-HP form',hp:6,visual:'Heavy shoulders, hooked arms and a compact skull-like face.',
    killerAction:victimAttack, finaleAction:chase, attack:[1,1,1,2,2,2,3,4], move:[1,1,1,1,1,2,2,2], effects:['',victimMove,horror,victimAttack,horror,heal,event,chase]},
  {id:'five',name:'5-HP form',hp:5,visual:'Low, splayed silhouette with long bent limbs and eyes stacked over a low jaw.',
    killerAction:panic, finaleAction:'Target the closest Final Girl or eligible Victim, move twice, then attack.', attack:[1,1,1,1,2,2,2,2], move:[1,2,2,2,2,3,3,3], effects:['',panic,panic,victimAttack,panic,event,heal,chase]},
] as const;
export type OrganismForm = typeof ORGANISM_FORMS[number]['id'];
export const ORGANISM_FINALES = [
  {id:'reductive',name:'Reductive Assimilation',effect:'Immediately assimilate the remaining Exposed Victims. If there is just one mutation and the Final Girl shares its space at the start of the Killer phase, she is assimilated and loses.'},
  {id:'cognitive',name:'Cognitive Assimilation',effect:'Immediately assimilate the remaining Exposed Victims. If just one mutation remains, discard two Action cards at the start of the Killer phase. If unable to discard both, the Final Girl is assimilated and loses.'},
  {id:'regenerative',name:'Regenerative Assimilation',effect:'Immediately assimilate the remaining Exposed Victims. If just one mutation remains, increase Horror twice at the start of the Killer phase. If Horror ever exceeds 6 under this Finale, the Final Girl is assimilated and loses.'},
] as const;
export const ORGANISM_MINORS = [
  {id:'acidic',name:'Acidic Body Fluids',health:1,effect:'When the Final Girl deals one or more damage to this mutation, she loses one Health. This card’s heart is lost after all other normal Health.'},
  {id:'legs',name:'Extra Legs',health:2,effect:'This mutation adds one to its Movement value.'},
  {id:'skin',name:'Thick Skin',health:3,effect:'This mutation gains the three hearts on this card.'},
] as const;
export const ORGANISM_ITEM = {name:'Test Kit',effect:'Discard to test an Exposed Victim sharing your space. The test is free. At the Lab, test without discarding a kit.'};
const noMutation = 'If no Mutated Organism is in play, ';
const discard = 'Discard this card and draw the next Terror card.';
export const ORGANISM_TERRORS = [
  {id:'absorbed',name:'It Just… Absorbed Them!',quantity:1,death:true,effect:noMutation+'panic all Exposed Victims and increase Horror by one. Target the closest eligible Victim, move and attack twice. If a Victim died, '+heal.toLowerCase()},
  {id:'hit-run',name:'Hit and Run',quantity:2,death:true,effect:noMutation+'increase Horror by one and discard a random Action card. '+chase+' Then target the closest eligible Victim and move twice.'},
  {id:'trust',name:'Who Can We Trust?',quantity:1,death:true,effect:noMutation+'panic each Exposed Victim and increase Horror twice. '+chase},
  {id:'destroying-tests',name:'Someone Is Destroying the Tests!',quantity:2,death:true,effect:'Discard the Test Kit at the nearest Search space. Kill one normal Victim within two spaces of that Search space. Target the closest eligible Victim and move twice.'},
  {id:'must-be-you',name:'It Must Be You!',quantity:1,death:true,effect:'If no Victims are on the board, '+discard.toLowerCase()+' Otherwise, take one damage per Victim in your space (you may defend). In each space with at least two Victims and one normal Victim, kill one normal Victim. '+victimMove},
  {id:'survive',name:'Survive at All Costs',quantity:2,death:true,effect:noMutation+'increase Bloodlust by one. '+chase+' If a Victim died, draw and resolve the next Terror card.'},
  {id:'disgusting',name:'Have You Seen How Disgusting It Is?',quantity:1,death:false,effect:noMutation+discard.toLowerCase()+' Increase Horror twice, and once more if multiple mutations are in play.'},
  {id:'vulnerable',name:'It Senses We Are Vulnerable!',quantity:1,death:true,effect:noMutation+'panic every Victim in or adjacent to a Search space. Perform the following twice: '+chase},
  {id:'alone',name:'Are We Alone?',quantity:1,death:true,effect:'If no Exposed Victim is in your space or with a normal Victim, '+discard.toLowerCase()+' Otherwise test those Exposed Victims one at a time. Safe leaves them Exposed and is shuffled back. On Assimilated, reveal a mutation and stop testing. Target the closest Final Girl or eligible Victim and attack.'},
  {id:'anywhere',name:'It Could Be Anywhere. Or Anyone!',quantity:1,death:true,effect:'If no Exposed Victims remain, '+discard.toLowerCase()+' Otherwise roll for each normal Victim. On a 1, swap its space with the farthest Exposed Victim. Mark normal Victims as you roll. '+chase},
] as const;

type Observation = Record<string, string | number | boolean | null>;
type Entry = {id?:string;kind:string;momentType?:string;killerCard?:string;moduleData?:{module:string;changes:Observation}};
type Token = 'black' | 'white' | 'pending-black' | 'pending-white' | 'pending-unknown' | 'defeated';
type Status = 'exposed' | 'safe' | 'casualty' | 'mutated';
type Minor = typeof ORGANISM_MINORS[number]['id'];
type TestSource = 'ordinary' | 'forced' | 'alone';
export type OrganismAssignment = {who:OrganismColor;form:OrganismForm};
export type OrganismAction = {parent:string} & (
  | {command:'safe';who:OrganismColor;source:TestSource;alreadyCounted?:true}
  | {command:'assimilate';who:OrganismColor;source:TestSource;form:OrganismForm}
  | {command:'finale';reveal:string;assignments:OrganismAssignment[]}
  | {command:'health';who:OrganismColor;value:number}
  | {command:'token-loss';who:OrganismColor}
  | {command:'token-result';who:OrganismColor;value:number}
  | {command:'observe';who:OrganismColor;status:Exclude<Status,'mutated'>}
  | {command:'observe-form';who:OrganismColor;form:OrganismForm;token:Token|null;health:number|null}
  | {command:'minor';card:Minor;owner:OrganismColor|'waiting'|null;health:number|null}
);
export type OrganismCommand = OrganismAction extends infer A ? A extends OrganismAction ? Omit<A,'parent'> : never : never;
const statusKey = (who:OrganismColor) => `${who}.status`;
const formKey = (who:OrganismColor) => `${who}.form`;
const orderKey = (who:OrganismColor) => `${who}.order`;
const tokenKey = (who:OrganismColor) => `${who}.token`;
const healthKey = (who:OrganismColor) => `${who}.health`;
export const minorOwnerKey = (card:Minor) => `minor.${card}.owner`;
export const minorHealthKey = (card:Minor) => `minor.${card}.health`;
const tokens:readonly Token[] = ['black','white','pending-black','pending-white','pending-unknown','defeated'];
const statuses:readonly Status[] = ['exposed','safe','casualty','mutated'];
const isColor = (value:unknown):value is OrganismColor => ORGANISM_COLORS.some(color=>color===value);
const formById = (value:unknown) => ORGANISM_FORMS.find(form=>form.id===value);
const validInt = (value:unknown,min:number,max:number):value is number =>
  typeof value==='number' && Number.isInteger(value) && value>=min && value<=max;
const uuid = /^[a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
const sourceIsValid = (value:unknown) => value==='ordinary'||value==='forced'||value==='alone';
const isToken = (value:unknown):value is Token => tokens.some(token=>token===value);

export const initialOrganism = ():Observation => Object.fromEntries(ORGANISM_COLORS.map(who=>[statusKey(who),'exposed']));
export const organismParent = (entries:readonly Entry[]) => [...entries].reverse().find(e=>e.moduleData?.module===ORGANISM_MODULE)?.id ?? 'root';
export const organismFinale = (entries:readonly Entry[]) => entries.find(e=>e.kind==='moment'&&e.momentType==='finale');
export const sameOrganismChanges = (a:Observation,b:Observation) => Object.keys(a).length===Object.keys(b).length && Object.entries(a).every(([key,value])=>b[key]===value);
export const isInitialOrganism = (changes:Observation) => sameOrganismChanges(initialOrganism(),changes);
export const isOrganismCasualty = (action:OrganismAction) => action.command==='safe'&&action.source==='forced'&&!action.alreadyCounted;

export function organismFigure(state:Observation,who:OrganismColor) {
  const health = state[healthKey(who)];
  const order = state[orderKey(who)];
  const token = state[tokenKey(who)];
  return {who,status:state[statusKey(who)] as Status|undefined,form:formById(state[formKey(who)]),
    health:typeof health==='number'?health:undefined,order:typeof order==='number'?order:undefined,
    token:isToken(token)?token:undefined,pending:typeof token==='string'&&token.startsWith('pending-')};
}
export const organismRoster = (state:Observation) => ORGANISM_COLORS.map(who=>organismFigure(state,who));
export const organismLiving = (state:Observation) => organismRoster(state).filter(figure=>figure.status==='mutated'&&!figure.pending&&figure.token!=='defeated');
export const organismBonus = (state:Observation) => organismLiving(state).some(figure=>figure.health===1&&(figure.token==='black'||figure.token==='white'));
export const organismRevealEffects = (form:OrganismForm,bloodlust:number|undefined) =>
  validInt(bloodlust,0,ORGANISM_MAX_BLOODLUST)?formById(form)?.effects.slice(1,bloodlust+1):undefined;

export function validOrganismField(key:string,value:unknown) {
  if(key==='finaleRecorded') return value===true;
  return ORGANISM_COLORS.some(who=>
    key===statusKey(who)&&statuses.some(status=>status===value) ||
    key===formKey(who)&&(value===null||!!formById(value)) ||
    key===orderKey(who)&&(value===null||validInt(value,1,3)) ||
    key===tokenKey(who)&&(value===null||isToken(value)) ||
    key===healthKey(who)&&(value===null||validInt(value,0,7))) ||
    ORGANISM_MINORS.some(card=>key===minorOwnerKey(card.id)&&(value===null||isColor(value)||value==='waiting') ||
      key===minorHealthKey(card.id)&&(value===null||validInt(value,0,card.health)));
}
export function validOrganismAction(input:unknown):input is OrganismAction {
  if(!input||typeof input!=='object') return false;
  const a=input as Record<string,unknown>;
  if(typeof a.parent!=='string'||(a.parent!=='root'&&!uuid.test(a.parent))) return false;
  if(a.command==='finale') return typeof a.reveal==='string'&&uuid.test(a.reveal)&&Array.isArray(a.assignments)&&
    a.assignments.length>=1&&a.assignments.length<=3&&a.assignments.every(item=>item&&isColor(item.who)&&formById(item.form));
  if(a.command==='minor') return ORGANISM_MINORS.some(card=>card.id===a.card&&(a.health===null||validInt(a.health,0,card.health)))&&
    (a.owner===null||a.owner==='waiting'||isColor(a.owner));
  if(!isColor(a.who)) return false;
  switch(a.command) {
    case 'safe': return sourceIsValid(a.source)&&(a.alreadyCounted===undefined||a.source==='forced'&&a.alreadyCounted===true);
    case 'assimilate': return sourceIsValid(a.source)&&!!formById(a.form);
    case 'health': return validInt(a.value,1,7);
    case 'token-loss': return true;
    case 'token-result': return validInt(a.value,0,3);
    case 'observe': return a.status==='exposed'||a.status==='safe'||a.status==='casualty';
    case 'observe-form': return !!formById(a.form)&&(a.token===null||isToken(a.token))&&(a.health===null||validInt(a.health,0,7));
    default: return false;
  }
}
function assignForm(state:Observation,who:OrganismColor,form:OrganismForm):Observation|undefined {
  const card = formById(form);
  const roster = organismRoster(state);
  if(!card||roster.some(figure=>figure.form?.id===form)) return;
  const nextOrder = Math.max(0,...roster.map(figure=>figure.order??0))+1;
  if(nextOrder>3) return;
  const changes:Observation = {[statusKey(who)]:'mutated',[formKey(who)]:form,[orderKey(who)]:nextOrder,
    [tokenKey(who)]:'black',[healthKey(who)]:card.hp};
  for(const minor of ORGANISM_MINORS) {
    const key=minorOwnerKey(minor.id);
    if(state[key]==='waiting') changes[key]=who;
  }
  return changes;
}

export function resolveOrganismAction(action:OrganismAction,state:Observation,entries:readonly Entry[]):Observation|undefined {
  if(action.parent!==organismParent(entries)) return;
  if(action.command==='finale') {
    const exposed=organismRoster(state).filter(figure=>figure.status==='exposed');
    if(state.finaleRecorded||organismFinale(entries)?.id!==action.reveal||!exposed.length||
      organismRoster(state).some(figure=>!figure.status)||action.assignments.length!==exposed.length||
      new Set(action.assignments.map(item=>item.who)).size!==exposed.length) return;
    const changes:Observation = {finaleRecorded:true};
    for(const {who,form} of action.assignments) {
      if(state[statusKey(who)]!=='exposed') return;
      const assignment=assignForm({...state,...changes},who,form);
      if(!assignment) return;
      Object.assign(changes,assignment);
    }
    return changes;
  }
  if(action.command==='minor') {
    const ownerKey=minorOwnerKey(action.card);
    const hpKey=minorHealthKey(action.card);
    const owner=state[ownerKey]??null;
    if(action.health===null) return owner===null||action.owner!==null?undefined:{[ownerKey]:null,[hpKey]:null};
    if(action.owner===null||owner!==null&&owner!==action.owner) return;
    if(owner===null&&(action.owner==='waiting'?organismLiving(state).length>0:!organismLiving(state).some(figure=>figure.who===action.owner))) return;
    if(action.card==='acidic'&&action.health===0&&isColor(action.owner)) {
      const figure=organismFigure(state,action.owner);
      if(figure.health!==undefined&&figure.health>1) return;
      if(ORGANISM_MINORS.some(minor=>minor.id!=='acidic'&&state[minorOwnerKey(minor.id)]===action.owner&&Number(state[minorHealthKey(minor.id)])>0)) return;
    }
    return state[hpKey]===action.health&&owner===action.owner?undefined:{[ownerKey]:action.owner,[hpKey]:action.health};
  }

  const {who}=action;
  const figure=organismFigure(state,who);
  if(action.command==='safe') {
    if(figure.status!=='exposed'||action.source==='alone') return;
    return {[statusKey(who)]:action.source==='forced'?'casualty':'safe'};
  }
  if(action.command==='assimilate') return figure.status==='exposed'?assignForm(state,who,action.form):undefined;
  if(action.command==='observe') {
    if(figure.status===action.status||figure.form) return;
    return {[statusKey(who)]:action.status};
  }
  if(action.command==='observe-form') {
    const card=formById(action.form);
    const out=action.token==='defeated'||action.token?.startsWith('pending-');
    if(!card||organismRoster(state).some(item=>item.who!==who&&item.form?.id===card.id)||
      (out?action.health!==0:action.health!==null&&(action.health<1||action.health>card.hp))) return;
    const changes:Observation = {[statusKey(who)]:'mutated',[formKey(who)]:card.id,
      [tokenKey(who)]:action.token,[healthKey(who)]:action.health};
    return Object.entries(changes).some(([key,value])=>(state[key]??null)!==value)?changes:undefined;
  }
  if(figure.status!=='mutated'||!figure.form||figure.token==='defeated') return;
  if(action.command==='health') {
    if(figure.pending||action.value>figure.form.hp||action.value===figure.health) return;
    return {[healthKey(who)]:action.value};
  }
  if(action.command==='token-loss') {
    if(figure.pending||figure.health!==1||ORGANISM_MINORS.some(card=>
      state[minorOwnerKey(card.id)]===who&&Number(state[minorHealthKey(card.id)])>0)) return;
    return {[tokenKey(who)]:figure.token==='black'?'pending-black':figure.token==='white'?'pending-white':'pending-unknown',[healthKey(who)]:0};
  }
  if(!figure.pending||figure.token==='pending-white'&&action.value!==0) return;
  return {[tokenKey(who)]:action.value?'white':'defeated',[healthKey(who)]:action.value};
}

export const organismColorLabel = (who:OrganismColor) => who[0].toUpperCase()+who.slice(1);
export function organismFacts(state:Observation,entries:readonly Entry[] = []) {
  const roster = organismRoster(state).filter(figure=>figure.status).map(figure=>{
    const who=organismColorLabel(figure.who);
    if(figure.form) {
      const condition=figure.pending?'Final Health unresolved':figure.token==='defeated'?'defeated':figure.health===undefined?'Health unrecorded':`${figure.health} HP`;
      return `${who}: ${figure.form.name} (${condition})`;
    }
    return `${who}: ${figure.status==='casualty'?'confirmed casualty':figure.status==='safe'?'Safe test': 'Exposed'}`;
  });
  const finale=organismFinale(entries);
  const known=ORGANISM_FINALES.find(card=>card.name===finale?.killerCard);
  return [roster.length?`Organism roster: ${roster.join(', ')}.`:'',known?`Finale: ${known.name}.`:finale?'Finale revealed, name unrecorded.':'',
    state.finaleRecorded?'Remaining Exposed Victims were recorded as assimilated.':''].filter(Boolean).join(' ');
}
