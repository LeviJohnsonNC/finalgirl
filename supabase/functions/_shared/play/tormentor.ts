import type { ModuleState, ModuleValue } from './modules.ts';

export const TORMENTOR_SOURCE = 'Owner photographs IMG_9432–IMG_9438, standard mode (November 1, 2026)';
export const TORMENTOR_VISUAL = 'A lean adult woman wearing a deep red sleeveless hood over black clothing, a fitted dark leather waist and belts, wrist wraps, and a tangible smooth oval white mask with round dark eye openings and a red streak at one eye. Her practical industrial drill is a verified identity prop. Preserve the mask, hood and human proportions. The chosen scene determines light and location; reference stains do not establish fresh injuries or prior casualties. She is not Jigsaw, a puppet or a pig-masked man.';
export type TormentorLoss = 'unknown'|'none'|'trap-terminal'|'no-escape'|'endless-traps';
export type TormentorOpening = 'fresh-v1'|'legacy-unknown';
export interface TrapCard { id:string; name:string; deck:'victim'|'girl'; tasks:readonly string[]; checkpoints:readonly string[]; fail:string }
export const TORMENTOR_TRAPS:readonly TrapCard[] = [
 {id:'infestation-box',name:'Infestation Box',deck:'victim',tasks:['Deal 2 damage','Spend 3 Time','Use Move 1 space'],checkpoints:['Start','Horror +1','Horror +1','Horror +2','Killed'],fail:'Increase Horror by 2.'},
 {id:'razor-maze',name:'Razor Maze',deck:'girl',tasks:['Use Move 1 space','Use Move 2 spaces','Use Move 1 space'],checkpoints:['Start','Lose 1 Health','Lose 1 Health','Lose 1 Health','Killed'],fail:'Final Girl dies and loses immediately; do not reveal Final Health.'},
 {id:'super-saw',name:'Super Saw',deck:'girl',tasks:['Spend 5 Time','Use Move 1 space AND lose 1 Health'],checkpoints:['Start','Lose 2 Health','Lose 1 Health','Killed'],fail:'Final Girl dies and loses immediately; do not reveal Final Health.'},
 {id:'electric-cage',name:'Electric Cage',deck:'girl',tasks:['Spend 2 Time','Deal 1 damage','Deal 2 damage'],checkpoints:['Start','Lose 1 Health','Lose 1 Health','Lose 1 Health','Killed'],fail:'Final Girl dies and loses immediately; do not reveal Final Health.'},
 {id:'swinging-blades',name:'Swinging Blades',deck:'victim',tasks:['Spend 5 Time','Deal 2 damage','Use Move 2 spaces'],checkpoints:['Start','Horror +1','Lose 1 Time','Horror +1','Lose 1 Time','Killed'],fail:'Increase Horror by 1.'},
 {id:'temple-drills',name:'Temple Drills',deck:'victim',tasks:['Spend 4 Time','Deal 2 damage AND use Move 1 space'],checkpoints:['Start','Horror +1','Lose 1 Time','Horror +1','Lose 1 Time','Killed'],fail:'Increase Horror by 2.'},
 {id:'the-slicer',name:'The Slicer',deck:'girl',tasks:['Lose 1 Health','Use Move 1 space AND lose 1 Health'],checkpoints:['Start','Lose 1 Health','Lose 2 Health','Killed'],fail:'Final Girl dies and loses immediately; do not reveal Final Health.'},
 {id:'reverse-bear-trap',name:'Reverse Bear Trap',deck:'victim',tasks:['Spend 4 Time','Spend 4 Time'],checkpoints:['Start','Horror +1','Horror +2','Killed'],fail:'Increase Horror by 1.'},
 {id:'guillotine',name:'Guillotine',deck:'victim',tasks:['Spend 3 Time','Deal 2 damage AND use Move 2 spaces'],checkpoints:['Start','Horror +1','Horror +1','Horror +2','Killed'],fail:'Discard 1 Action card.'},
 {id:'fireworks-target',name:'Fireworks Target',deck:'victim',tasks:['Spend 4 Time','Deal 2 damage','Spend 2 Time'],checkpoints:['Start','Lose 1 Time','Lose 1 Time','Lose 1 Time','Killed'],fail:'Increase Horror by 1.'},
 {id:'drowning-tank',name:'Drowning Tank',deck:'victim',tasks:['Spend 5 Time','Use Move 1 space AND spend 2 Time'],checkpoints:['Start','Lose 1 Time','Lose 2 Time','Lose 3 Time','Killed'],fail:'Increase Horror by 1.'},
];
export const TORMENTOR_POWERS = [
 {id:'unfair-traps',name:'Unfair Traps',effect:'For all Death Traps, increase every Escape Task requirement by 1.'},
 {id:'horrifying-traps',name:'Horrifying Traps',effect:'When a Victim is killed by a Death Trap, increase Horror by 1; if you are in the same space, increase Horror by 2 instead.'},
 {id:'overkill-traps',name:'Overkill Traps',effect:'When a Victim is killed by a Death Trap, you and each Victim in that space take 1 damage.'},
 {id:'endless-traps',name:'Endless Traps',epic:true,effect:'Each time a Victim is freed from a Death Trap, resolve a new Victim Death Trap on the farthest Victim. You lose if there are no Victim Death Trap cards to resolve.'},
] as const;
export const TORMENTOR_FINALES = [
 {id:'no-escape',name:'No Escape!',effect:'Advance Death Traps, target the closest unlocked Exit, then move. When Tormentor ends movement on an unlocked Exit, lock it. At the start of the Killer phase, if all Exit spaces are locked, you lose. Locked Exits cannot save Victims; an effect may unlock them again.'},
 {id:'the-ultimate-trap',name:'The Ultimate Trap',effect:'When revealed, resolve a Final Girl Death Trap if you are not already trapped. Tormentor may target and attack you even while you are in a Death Trap. Killer actions: advance Death Traps, target closest Victim, move, attack twice.'},
 {id:'game-over',name:'Game Over!',effect:'Killer actions: advance Death Traps twice; target closest Victim, move, attack; target closest Victim, move, attack.'},
] as const;
const searchPriority = 'Trap one Victim using the first applicable condition: in the Search space farthest from you; in a Search space; adjacent to a Search space; in the space farthest from you.';
const exitPriority = 'Trap one Victim using the first applicable condition: in the Exit space farthest from you; in an Exit space; adjacent to an Exit space; in the space farthest from you.';
export const TORMENTOR_TERRORS = [
 {id:'we-have-to-help',name:'“We Have to Help!”',quantity:2,effect:'If there are no Victims, discard and draw the next Terror. Otherwise all Victims move 1 space toward the nearest Death Trap. If no Death Traps are in play, increase Horror by 1.'},
 {id:'help-im-trapped',name:'“Help! I’m Trapped!”',quantity:3,effect:'If you are trapped, discard and draw the next Terror. Otherwise you are trapped: resolve a Final Girl Death Trap.'},
 {id:'you-dont-deserve-to-live',name:'You Don’t Deserve to Live',quantity:2,effect:'If no Victims, discard and draw the next Terror. Otherwise '+exitPriority+' Resolve a Victim Death Trap.'},
 {id:'lets-play-a-game',name:'Let’s Play a Game',quantity:2,effect:'If no Victims, discard and draw the next Terror. Otherwise '+searchPriority+' Resolve a Victim Death Trap.'},
 {id:'live-or-die',name:'Live or Die?',quantity:2,effect:'If no Victims, discard and draw the next Terror. Otherwise trap a Victim in the space with the most Victims (tie: farthest from you). Resolve a Victim Death Trap.'},
 {id:'tick-tock',name:'Tick Tock, Speed Up the Clock',quantity:2,effect:'If no Victims are trapped, bottom this card and draw the next Terror. Otherwise advance all active Death Traps.'},
 {id:'no-respect-for-life',name:'You Have No Respect for Life',quantity:1,effect:'If no Victims are trapped, bottom this card and draw the next Terror. Otherwise panic all untrapped Victims in Death Trap spaces. If you share a space with a trapped Victim, panic and lose 1 Health. If nobody panicked, increase Bloodlust by 1.'},
 {id:'faulty-construction',name:'Faulty Construction',quantity:2,effect:'If nobody is trapped, bottom this card and draw the next Terror. Otherwise choose a Death Trap in play and mark its next Escape Task completed without fulfilling the requirements. Increase Bloodlust by 1.'},
] as const;
export const TORMENTOR_BLOODLUST = [
 {attack:1,move:1,entry:'Start'}, {attack:1,move:1,entry:'Discard a random Action card'}, {attack:1,move:1,entry:'No additional entry effect'},
 {attack:2,move:1,entry:'Reveal Dark Power'}, {attack:2,move:1,entry:'No additional entry effect'}, {attack:2,move:2,entry:'Discard a random Action card'}, {attack:3,move:2,entry:'No additional entry effect'},
] as const;
export const TORMENTOR_OVERFLOW = 'Advance all active Death Traps, then discard a random Action card. Before Finale the printed Killer action is advance Death Traps.';
export interface TrapRecord {subject:string;space:string|null;timer:number|null;tasks:number|null;status:'active'|'escaped'|'spent'|'removed'}
export interface TormentorSnapshot { initialized:boolean;known:boolean;pendingSetup:boolean|null;presence:'unknown'|'off-board'|'on-board';traps:Record<string,TrapRecord>;exits:Record<string,boolean|null>;replacement:number;loss:TormentorLoss }
type Entry={id?:string;kind:string;moduleData?:{module:string;changes:Record<string,ModuleValue>};momentType?:string;killerCard?:string};
export type TormentorAction = {parent:string} & (
 |{command:'add';id:string;subject:string;space:string|null}
 |{command:'task';id:string}
 |{command:'advance'}
 |{command:'correct';id:string;timer:number|null;tasks:number|null;status:TrapRecord['status'];subject:string;space:string|null}
 |{command:'clear';id:string}
 |{command:'cleanup'}
 |{command:'presence';value:TormentorSnapshot['presence']}
 |{command:'arrive'}
 |{command:'exit';name:string;locked:boolean|null}
 |{command:'clear-exit';name:string}
 |{command:'loss';value:TormentorLoss}
 |{command:'empty'}
 |{command:'complete-list'}
 |{command:'clear-replacements'}
);
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const label=(v:unknown):v is string=>typeof v==='string'&&v.length<=120&&![...v].some(c=>c.charCodeAt(0)<32);
const room=(v:unknown)=>v===null||label(v);
const integer=(v:unknown,max:number)=>Number.isInteger(v)&&Number(v)>=0&&Number(v)<=max;
const losses:readonly TormentorLoss[]=['unknown','none','trap-terminal','no-escape','endless-traps'];
function canonical(v:unknown):unknown {return Array.isArray(v)?v.map(canonical):object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;}
export const serializeTormentor=(s:TormentorSnapshot)=>JSON.stringify(canonical(s));
export function emptyTormentor():TormentorSnapshot {return {initialized:false,known:false,pendingSetup:null,presence:'unknown',traps:{},exits:{},replacement:0,loss:'unknown'};}
export function initialTormentor():Record<string,ModuleValue> {return {snapshot:serializeTormentor({...emptyTormentor(),initialized:true,known:true,pendingSetup:true,presence:'off-board',loss:'none'})};}
export function parseTormentor(value:unknown):TormentorSnapshot|null {
 if(typeof value!=='string'||value.length>16000)return null;
 try {
 const s=JSON.parse(value);if(!object(s)||Object.keys(s).sort().join()!==Object.keys(emptyTormentor()).sort().join())return null;
 if(typeof s.initialized!=='boolean'||typeof s.known!=='boolean'||!(s.pendingSetup===null||typeof s.pendingSetup==='boolean')||!['unknown','off-board','on-board'].includes(String(s.presence))||!losses.includes(s.loss as TormentorLoss)||!integer(s.replacement,7))return null;
 if(!object(s.traps)||Object.keys(s.traps).length>11||!object(s.exits)||Object.keys(s.exits).length>32||!Object.entries(s.exits).every(([k,v])=>label(k)&&k.trim()&&k!=='__proto__'&&(v===null||typeof v==='boolean')))return null;
 let girls=0;
 for(const [id,t] of Object.entries(s.traps)) {
  const c=TORMENTOR_TRAPS.find(c=>c.id===id);if(!c||!object(t)||Object.keys(t).sort().join()!=='space,status,subject,tasks,timer'||!label(t.subject)||!room(t.space)||!['active','escaped','spent','removed'].includes(String(t.status))||!(t.timer===null||integer(t.timer,c.checkpoints.length-1))||!(t.tasks===null||integer(t.tasks,c.tasks.length)))return null;
  if(t.status==='active'&&c.deck==='girl')girls++;
  if(t.status==='active'&&t.tasks===c.tasks.length||t.status==='escaped'&&t.tasks!==c.tasks.length)return null;
 }
 if(girls>1)return null;
 return s as unknown as TormentorSnapshot;
 }catch{return null;}
}
export const tormentorState=(state:ModuleState)=>parseTormentor(state.snapshot)??emptyTormentor();
export const validTormentorField=(key:string,value:unknown)=>key==='snapshot'&&!!parseTormentor(value);
export const isInitialTormentor=(changes:Record<string,ModuleValue>)=>Object.keys(changes).join()==='snapshot'&&changes.snapshot===initialTormentor().snapshot;
export const tormentorParent=(entries:readonly Entry[])=>[...entries].reverse().find(e=>e.moduleData?.module==='tormentor')?.id??'root';
export const tormentorFatal=(s:TormentorSnapshot)=>!['none','unknown'].includes(s.loss);
export const tormentorCard=(entries:readonly Entry[],kind:'dark-power'|'finale')=>entries.find(e=>e.kind==='moment'&&e.momentType===kind)?.killerCard;
export function tormentorPresence(s:TormentorSnapshot,entries:readonly Entry[]){return s.presence==='off-board'&&entries.some(e=>e.kind==='moment'&&e.momentType==='finale')?'arrival-pending':s.presence;}
export function validTormentorAction(v:unknown):v is TormentorAction {
 if(!object(v)||typeof v.parent!=='string'||!/^(root|[0-9a-f-]{36})$/i.test(v.parent)||typeof v.command!=='string')return false;
 const fields:Record<string,string[]>={add:['id','subject','space'],task:['id'],advance:[],correct:['id','timer','tasks','status','subject','space'],clear:['id'],cleanup:[],presence:['value'],arrive:[],exit:['name','locked'],'clear-exit':['name'],loss:['value'],empty:[],'complete-list':[],'clear-replacements':[]};
 if(!fields[v.command]||Object.keys(v).sort().join()!==['parent','command',...fields[v.command]].sort().join())return false;
 const c=TORMENTOR_TRAPS.find(c=>c.id===v.id);
 switch(v.command){
 case 'add':return !!c&&label(v.subject)&&room(v.space);
 case 'task':case 'clear':return !!c;
 case 'correct':return !!c&&label(v.subject)&&room(v.space)&&['active','escaped','spent','removed'].includes(String(v.status))&&(v.timer===null||integer(v.timer,c.checkpoints.length-1))&&(v.tasks===null||integer(v.tasks,c.tasks.length));
 case 'presence':return ['unknown','off-board','on-board'].includes(String(v.value));
 case 'clear-exit':return label(v.name)&&!!v.name.trim()&&v.name!=='__proto__';
 case 'exit':return label(v.name)&&!!v.name.trim()&&v.name!=='__proto__'&&(v.locked===null||typeof v.locked==='boolean');
 case 'loss':return losses.includes(v.value as TormentorLoss);
 default:return true;
 }
}
export function resolveTormentorAction(a:TormentorAction,state:ModuleState,entries:readonly Entry[]):Record<string,ModuleValue>|null {
 if(!validTormentorAction(a)||a.parent!==tormentorParent(entries))return null;
 const s=tormentorState(state),before=serializeTormentor(s);
 switch(a.command){
 case 'add':{
  const c=TORMENTOR_TRAPS.find(c=>c.id===a.id)!;
  if(s.traps[a.id]||c.deck==='girl'&&Object.entries(s.traps).some(([id,t])=>t.status==='active'&&TORMENTOR_TRAPS.find(c=>c.id===id)?.deck==='girl'))return null;
  s.traps[a.id]={subject:a.subject,space:a.space,timer:0,tasks:0,status:'active'};
  if(c.deck==='victim'){if(s.pendingSetup===true)s.pendingSetup=false;if(s.replacement)s.replacement--;}
  break;
 }
 case 'task':{
  const t=s.traps[a.id],c=TORMENTOR_TRAPS.find(c=>c.id===a.id)!;
  if(!t||t.status!=='active'||t.tasks===null||t.tasks>=c.tasks.length)return null;
  t.tasks++;
  if(t.tasks===c.tasks.length){t.status='escaped';if(c.deck==='victim'&&tormentorCard(entries,'dark-power')==='Endless Traps')s.replacement=Math.min(7,s.replacement+1);}
  break;
 }
 case 'advance':{
  const active=Object.entries(s.traps).filter(([,t])=>t.status==='active');
  // Partial/unknown timer knowledge cannot honestly be recorded as an all-trap step.
  if(!active.length||!s.known||s.pendingSetup===true||s.replacement>0||active.some(([,t])=>t.timer===null))return null;
  for(const [id,t] of active){const c=TORMENTOR_TRAPS.find(c=>c.id===id)!;if(t.timer!>=c.checkpoints.length-1)return null;t.timer!++;if(t.timer===c.checkpoints.length-1){t.status='spent';if(c.deck==='girl')s.loss='trap-terminal';}}
  break;
 }
 case 'correct':{
  if(!s.traps[a.id])return null;
  const c=TORMENTOR_TRAPS.find(c=>c.id===a.id)!;
  const terminal=a.timer===c.checkpoints.length-1&&a.status!=='escaped';
  s.traps[a.id]={subject:a.subject,space:a.space,timer:a.timer,tasks:a.tasks,status:terminal&&a.status==='active'?'spent':a.status};
  if(terminal&&c.deck==='girl')s.loss='trap-terminal';
  break;
 }
 case 'clear':if(!s.traps[a.id])return null;delete s.traps[a.id];s.known=false;break;
 case 'cleanup':for(const t of Object.values(s.traps))if(t.status==='spent')t.status='removed';break;
 case 'presence':s.presence=a.value;break;
 case 'arrive':if(!entries.some(e=>e.kind==='moment'&&e.momentType==='finale')||s.presence==='on-board')return null;s.presence='on-board';break;
 case 'exit':s.exits[a.name]=a.locked;break;
 case 'clear-exit':if(!(a.name in s.exits))return null;delete s.exits[a.name];break;
 case 'loss':s.loss=a.value;if(a.value==='none'||a.value==='unknown')for(const [id,t] of Object.entries(s.traps)){const c=TORMENTOR_TRAPS.find(c=>c.id===id)!;if(c.deck==='girl'&&t.timer===c.checkpoints.length-1){t.timer=null;if(t.status==='spent'&&!Object.entries(s.traps).some(([otherId,other])=>otherId!==id&&other.status==='active'&&TORMENTOR_TRAPS.find(c=>c.id===otherId)?.deck==='girl'))t.status='active';}}break;
 case 'empty':if(Object.values(s.traps).some(t=>t.status==='active'))return null;s.known=true;s.pendingSetup=false;s.replacement=0;break;
 case 'complete-list':s.known=true;s.pendingSetup=false;break;
 case 'clear-replacements':if(!s.replacement)return null;s.replacement=0;s.known=false;break;
 }
 const next=serializeTormentor(s);return next===before||!parseTormentor(next)?null:{snapshot:next};
}
export function tormentorFacts(s:TormentorSnapshot,entries:readonly Entry[]=[]):string {
 const parts:string[]=[];
 if(tormentorFatal(s))parts.push(`Tormentor loss: ${s.loss}${s.loss==='trap-terminal'?'; Final Girl died, regardless of recorded Health':'; physical death not established'}.`);
 if(s.loss==='trap-terminal'){const terminal=Object.entries(s.traps).find(([id,t])=>{const c=TORMENTOR_TRAPS.find(c=>c.id===id)!;return c.deck==='girl'&&t.timer===c.checkpoints.length-1&&t.status!=='escaped';});if(terminal)parts.push(`Terminal trap: ${TORMENTOR_TRAPS.find(c=>c.id===terminal[0])!.name}, Killed.`);}
 const girl=Object.entries(s.traps).find(([id,t])=>TORMENTOR_TRAPS.find(c=>c.id===id)?.deck==='girl'&&t.status==='active');
 if(girl){const c=TORMENTOR_TRAPS.find(c=>c.id===girl[0])!;parts.push(`Final Girl trapped: ${c.name}, position ${girl[1].timer??'unknown'}.`);}
 parts.push(`Tormentor presence: ${tormentorPresence(s,entries)}.`);
 const n=Object.entries(s.traps).filter(([id,t])=>t.status==='active'&&TORMENTOR_TRAPS.find(c=>c.id===id)?.deck==='victim').length;
 parts.push(`${n} recorded active Victim traps${!s.known||s.pendingSetup?' (incomplete knowledge)':''}.`);
 return parts.join(' ');
}
export function tormentorOpeningGuidance(provenance:TormentorOpening):string {return provenance==='fresh-v1'?'Verified fresh Tormentor setup: she is off the board and must remain unseen/off-frame. A Victim is trapped at the selected Setup killer-start space; actual trap identity/position is unknown until recorded. Do not stage a direct confrontation, attack, new casualty or infer the warehouse location.':'Tormentor original opening presence/setup is unrecorded. Keep the threat off-frame without asserting a physical position, arrival or named trap. Do not infer current Play state into this original opening.';}
