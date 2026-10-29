import type { ModuleState, ModuleValue } from './modules.ts';
import { KONRAD_EVENTS, KONRAD_FUNCTIONS, KONRAD_SPACES, KONRAD_SHAFTS, KONRAD_SETUPS, KONRAD_EXITS } from './konradCatalog.ts';
export * from './konradCatalog.ts';
export const KONRAD_DESTINATIONS = [...KONRAD_SPACES.map((_,i)=>`space:${i}`),...KONRAD_SHAFTS.map(s=>`shaft:${s}`),...KONRAD_FUNCTIONS.map(f=>`function:${f.id}`)];
export type KonradFate = 'unknown'|'survived'|'airlock-loss'|'explosion-loss';
export interface KonradSnapshot {
 tokens: Record<string,number>;
 held: number|null;
 systems: Record<string,{paid:number;override:boolean;captainBridge:boolean}>;
 airlock: 'unknown'|'inactive'|'armed'|'released';
 countdown: 'unknown'|'inactive'|'start'|'middle'|'explosion';
 events: Record<string,'active'|'ended'>;
 people: Record<string,'in-play'|'saved'|'killed'|'left'>;
 captainSpace: string|null;
 jonasSpace: string|null;
 orphanTogether: boolean|null;
 slippery: number|null;
 temporaryShafts: boolean|null;
 loader: 'unknown'|'parked'|'powered'|'equipped'|'lost';
 loaderSpace: string|null;
 beaconSpace: string|null;
 beacon: 'unknown'|'absent'|'placed';
 breach: string|null;
 fate: KonradFate;
}
type Primitive = string|number|boolean|null;
export type KonradAction = {parent:string} & (
 | {command:'token';destination:string;count:number|null}
 | {command:'held';count:number|null}
 | {command:'pickup';source:string}
 | {command:'place';destination:string}
 | {command:'remote';from:string;to:string}
 | {command:'activate';system:string;atStation:true;override:boolean;captainBridge:boolean;useHeld:boolean}
 | {command:'cancel';system:string}
 | {command:'reboot'}
 | {command:'solar';counts:Record<string,number>;complete:boolean}
 | {command:'airlock';position:'inside'|'adjacent';fate:'unknown'|'survived'|'airlock-loss';loaderInHangar:boolean}
 | {command:'upkeep';atExit:boolean|null}
 | {command:'event';id:string;active:boolean}
 | {command:'person';id:string;status:'in-play'|'saved'|'killed'|'left'|null}
 | {command:'observe';key:'jonasSpace'|'captainSpace'|'orphanTogether'|'slippery'|'temporaryShafts'|'loader'|'loaderSpace'|'beaconSpace'|'beacon'|'breach'|'fate'|'airlock'|'countdown';value:Primitive}
);
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const count=(x:unknown):x is number=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=0&&x<=99;
const space=(x:unknown)=>x===null||KONRAD_SPACES.includes(x as typeof KONRAD_SPACES[number]);
const one=(x:unknown,list:readonly unknown[])=>list.includes(x);
const same=(a:unknown,b:unknown):boolean=>JSON.stringify(sort(a))===JSON.stringify(sort(b));
function sort(x:unknown):unknown {return Array.isArray(x)?x.map(sort):object(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;}
export function emptyKonrad():KonradSnapshot {return {tokens:{},held:null,systems:{},airlock:'unknown',countdown:'unknown',events:{},people:{},captainSpace:null,jonasSpace:null,orphanTogether:null,slippery:null,temporaryShafts:null,loader:'unknown',loaderSpace:null,beaconSpace:null,beacon:'unknown',breach:null,fate:'unknown'};}
export function initialKonrad(setup?:string|null,startingEvent?:string|null):Record<string,ModuleValue> {
 const s=emptyKonrad();s.tokens=Object.fromEntries(KONRAD_DESTINATIONS.map(k=>[k,0]));s.held=1;s.airlock='inactive';s.countdown='inactive';s.loader='parked';s.loaderSpace='Hangar';s.beacon='absent';s.temporaryShafts=false;
 const diagram=KONRAD_SETUPS.find(x=>x.name===setup);
 // An unselected setup establishes no loose-card placements.
 if(diagram)for(const i of diagram.keycards)s.tokens[`space:${i}`]++;
 else for(let i=0;i<KONRAD_SPACES.length;i++)delete s.tokens[`space:${i}`];
 const e=KONRAD_EVENTS.find(x=>x.name===startingEvent);
 if(e?.kind==='ongoing')s.events[e.id]='active';
 if(e?.kind==='person'){s.events[e.id]='active';s.people[e.id]='in-play';if(e.id==='captain')s.captainSpace='Bridge';}
 return {snapshot:JSON.stringify(s)};
}
export function parseKonrad(value:unknown):KonradSnapshot|null {
 if(typeof value!=='string'||value.length>9000)return null;
 try {
 const s=JSON.parse(value);if(!object(s)||!same(Object.keys(s).sort(),Object.keys(emptyKonrad()).sort()))return null;
 if(!object(s.tokens)||!Object.entries(s.tokens).every(([k,v])=>KONRAD_DESTINATIONS.includes(k)&&count(v)))return null;
 if(!(s.held===null||count(s.held))||!object(s.systems)||!Object.entries(s.systems).every(([k,v])=>KONRAD_FUNCTIONS.some(f=>f.id===k)&&object(v)&&same(Object.keys(v).sort(),['captainBridge','override','paid'])&&count(v.paid)&&typeof v.override==='boolean'&&typeof v.captainBridge==='boolean'))return null;
 if(!one(s.airlock,['unknown','inactive','armed','released'])||!one(s.countdown,['unknown','inactive','start','middle','explosion']))return null;
 if(!object(s.events)||!Object.entries(s.events).every(([k,v])=>KONRAD_EVENTS.some(e=>e.id===k&&e.kind!=='instant')&&one(v,['active','ended'])))return null;
 if(!object(s.people)||!Object.entries(s.people).every(([k,v])=>['captain','jonas','orphan'].includes(k)&&one(v,['in-play','saved','killed','left'])))return null;
 if(!space(s.jonasSpace)||!space(s.captainSpace)||!space(s.loaderSpace)||!space(s.beaconSpace)||!(s.breach===null||KONRAD_EXITS.includes(s.breach as string)))return null;
 if(!(s.orphanTogether===null||typeof s.orphanTogether==='boolean')||!(s.temporaryShafts===null||typeof s.temporaryShafts==='boolean')||!(s.slippery===null||count(s.slippery)&&s.slippery<=2))return null;
 if(!one(s.loader,['unknown','parked','powered','equipped','lost'])||!one(s.beacon,['unknown','absent','placed'])||!one(s.fate,['unknown','survived','airlock-loss','explosion-loss']))return null;
 return s as unknown as KonradSnapshot;
 }catch{return null;}
}
export function validKonradField(key:string,value:unknown){return key==='snapshot'&&!!parseKonrad(value);}
export function konradState(state:ModuleState):KonradSnapshot {return parseKonrad(state.snapshot)??emptyKonrad();}
type Entry={id?:string;kind:string;moduleData?:{module:string;changes:Record<string,ModuleValue>}};
export function konradParent(entries:readonly Entry[]){return [...entries].reverse().find(e=>e.moduleData?.module==='konrad')?.id??'root';}
export function validKonradAction(value:unknown):value is KonradAction {
 if(!object(value)||typeof value.parent!=='string'||!(/^(root|[0-9a-f-]{36})$/i.test(value.parent))||typeof value.command!=='string')return false;
 const a=value;const shapes:Record<string,string[]>={token:['destination','count'],held:['count'],pickup:['source'],place:['destination'],remote:['from','to'],activate:['system','atStation','override','captainBridge','useHeld'],cancel:['system'],reboot:[],solar:['counts','complete'],airlock:['position','fate','loaderInHangar'],upkeep:['atExit'],event:['id','active'],person:['id','status'],observe:['key','value']};
 if(!shapes[a.command as string]||!same(Object.keys(a).sort(),['parent','command',...shapes[a.command as string]].sort()))return false;
 const s=emptyKonrad();
 switch(a.command){
 case 'token':return KONRAD_DESTINATIONS.includes(a.destination as string)&&(a.count===null||count(a.count));
 case 'held':return a.count===null||count(a.count);
 case 'pickup':return typeof a.source==='string'&&KONRAD_DESTINATIONS.includes(a.source)&&a.source.startsWith('space:');
 case 'place':return KONRAD_DESTINATIONS.includes(a.destination as string)&&!(a.destination as string).startsWith('space:');
 case 'remote':return typeof a.from==='string'&&KONRAD_DESTINATIONS.includes(a.from)&&!a.from.startsWith('function:')&&typeof a.to==='string'&&KONRAD_DESTINATIONS.includes(a.to)&&!a.to.startsWith('space:')&&a.to!==a.from;
 case 'activate':return KONRAD_FUNCTIONS.some(f=>f.id===a.system)&&a.atStation===true&&['override','captainBridge','useHeld'].every(k=>typeof a[k]==='boolean');
 case 'cancel':return KONRAD_FUNCTIONS.some(f=>f.id===a.system);
 case 'reboot':return true;
 case 'solar':return typeof a.complete==='boolean'&&object(a.counts)&&Object.entries(a.counts).every(([k,v])=>['shaft:upper-left','function:crusher','shaft:upper-right','shaft:lower-right','function:incinerator','shaft:lower-left'].includes(k)&&count(v));
 case 'airlock':return one(a.position,['inside','adjacent'])&&one(a.fate,['unknown','survived','airlock-loss'])&&typeof a.loaderInHangar==='boolean'&&(a.position==='inside'||a.fate==='survived');
 case 'upkeep':return a.atExit===null||typeof a.atExit==='boolean';
 case 'event':return KONRAD_EVENTS.some(e=>e.id===a.id&&e.kind==='ongoing')&&typeof a.active==='boolean';
 case 'person':return one(a.id,['captain','jonas','orphan'])&&one(a.status,[null,'in-play','saved','killed','left']);
 case 'observe':if(typeof a.key!=='string'||!['jonasSpace','captainSpace','orphanTogether','slippery','temporaryShafts','loader','loaderSpace','beaconSpace','beacon','breach','fate','airlock','countdown'].includes(a.key))return false;return !!parseKonrad(JSON.stringify({...s,[a.key]:a.value}));
 default:return false;
 }
}
function cancel(s:KonradSnapshot,id:string){delete s.systems[id];if(id==='airlock')s.airlock='inactive';if(id==='self-destruct')s.countdown='inactive';}
function remove(s:KonradSnapshot,key:string){if(key.startsWith('function:')&&s.systems[key.slice(9)])cancel(s,key.slice(9));}
export function konradCost(id:string,override:boolean,captainBridge:boolean){const f=KONRAD_FUNCTIONS.find(f=>f.id===id)!;return f.cost-(override&&id!=='crusher'?1:0)-(captainBridge&&id==='self-destruct'?1:0);}
export function resolveKonradAction(a:KonradAction,state:ModuleState,entries:readonly Entry[]):Record<string,ModuleValue>|null {
 if(!validKonradAction(a)||a.parent!==konradParent(entries))return null;
 const s=konradState(state),before=JSON.stringify(s);
 switch(a.command){
 case 'token':{const old=s.tokens[a.destination];if(a.count===null){remove(s,a.destination);delete s.tokens[a.destination];}else{if(old===undefined||a.count<old)remove(s,a.destination);s.tokens[a.destination]=a.count;}break;}
 case 'held':s.held=a.count;break;
 case 'pickup':if(!s.tokens[a.source]||s.held===99)return null;s.tokens[a.source]--;if(s.held!==null)s.held++;break;
 case 'place':if(s.held===null||s.held<1||s.tokens[a.destination]===undefined)return null;s.held--;s.tokens[a.destination]++;break;
 case 'remote':if(!s.tokens[a.from]||s.tokens[a.to]===undefined)return null;s.tokens[a.from]--;s.tokens[a.to]++;break;
 case 'activate':{
 if(s.systems[a.system])return null;
 if(a.override!==(s.events['emergency-override']==='active')||a.captainBridge!==(s.people.captain==='in-play'&&s.captainSpace==='Bridge'))return null;
 const paid=konradCost(a.system,a.override,a.captainBridge),key=`function:${a.system}`;
 if(a.useHeld){if(s.held===null||s.held<paid||s.tokens[key]===undefined)return null;s.held-=paid;s.tokens[key]+=paid;}
 else if(s.tokens[key]===undefined||s.tokens[key]<paid)return null;
 s.systems[a.system]={paid,override:a.override,captainBridge:a.captainBridge};if(a.system==='airlock')s.airlock='armed';if(a.system==='self-destruct')s.countdown='start';break;}
 case 'cancel':cancel(s,a.system);break;
 case 'reboot':s.tokens=Object.fromEntries(KONRAD_DESTINATIONS.map(k=>[k,0]));for(const f of KONRAD_FUNCTIONS)cancel(s,f.id);break;
 case 'solar':{
 const known=Object.values(s.tokens).reduce((n,v)=>n+v,0),total=Object.values(a.counts).reduce((n,v)=>n+v,0),complete=KONRAD_DESTINATIONS.every(k=>s.tokens[k]!==undefined);
 if(complete&&(!a.complete||total!==known)||!complete&&total<known)return null;
 s.tokens=a.complete?Object.fromEntries(KONRAD_DESTINATIONS.map(k=>[k,0])):{};Object.assign(s.tokens,a.counts);for(const f of KONRAD_FUNCTIONS)cancel(s,f.id);break;}
 case 'airlock':if(s.airlock!=='armed')return null;s.airlock='released';if(a.loaderInHangar){s.loader='lost';s.loaderSpace=null;}s.fate=a.fate;break;
 case 'upkeep':if(s.countdown==='start')s.countdown='middle';else if(s.countdown==='middle'){s.countdown='explosion';s.fate=a.atExit===false?'explosion-loss':a.atExit===true?'survived':'unknown';}else return null;break;
 case 'event':s.events[a.id]=a.active?'active':'ended';break;
 case 'person':if(a.status===null){delete s.people[a.id];delete s.events[a.id];}else{s.people[a.id]=a.status;s.events[a.id]=a.status==='in-play'?'active':'ended';}if(a.id==='captain')s.captainSpace=a.status==='in-play'?'Bridge':null;if(a.id==='orphan')s.orphanTogether=null;if(a.id==='jonas')s.jonasSpace=null;break;
 case 'observe':Object.assign(s,{[a.key]:a.value});if(a.key==='airlock'&&a.value==='inactive')delete s.systems.airlock;if(a.key==='countdown'&&a.value==='inactive')delete s.systems['self-destruct'];if(a.key==='loader'&&a.value==='lost')s.loaderSpace=null;if(a.key==='beacon'&&a.value==='absent')s.beaconSpace=null;break;
 }
 return JSON.stringify(s)===before?null:{snapshot:JSON.stringify(s)};
}
export function validKonradObservation(action:unknown,changes:Record<string,ModuleValue>){return Object.keys(changes).join()==='snapshot'&&!!parseKonrad(changes.snapshot)&&(action===undefined||validKonradAction(action));}
export function isInitialKonrad(changes:Record<string,ModuleValue>){return [null,...KONRAD_SETUPS.map(s=>s.name)].some(setup=>[null,...KONRAD_EVENTS.map(e=>e.name)].some(event=>same(parseKonrad(initialKonrad(setup,event).snapshot),parseKonrad(changes.snapshot))));}
export function konradFatal(state:ModuleState){return ['airlock-loss','explosion-loss'].includes(konradState(state).fate);}
export function konradFacts(state:ModuleState):string[]{
 const s=konradState(state),facts:string[]=[];
 if(s.fate==='airlock-loss')facts.push('Final Girl explicitly lost to the Airlock without a Final Health reveal. Recorded Health does not establish survival.');
 if(s.fate==='explosion-loss')facts.push('Final Girl explicitly died outside an Exit in Self Destruct; this is a loss even if Killer also died. Recorded Health does not establish survival.');
 if(s.fate==='survived')facts.push('Final Girl survived the recorded ship hazard. This alone establishes neither victory nor Killer death.');
 if(s.breach)facts.push(`Hull breach at ${s.breach}: anyone there or entering is instantly killed; no unrecorded casualties are implied.`);
 if(s.countdown!=='unknown'&&s.countdown!=='inactive')facts.push(`Self Destruct ${s.countdown}; advance only on explicit physical Upkeep resolution.`);
 if(s.airlock==='armed'||s.airlock==='released')facts.push(`Airlock ${s.airlock}; released marker cannot fire again without rearming.`);
 for(const [id,activation] of Object.entries(s.systems))facts.push(`${KONRAD_FUNCTIONS.find(f=>f.id===id)?.name} activation recorded, paid ${activation.paid} Keycards; current discounts do not rewrite that payment.`);
 for(const id of KONRAD_SHAFTS){const n=s.tokens[`shaft:${id}`];if(n!==undefined)facts.push(`${id} shaft ${n>0?'open':'inactive'} (${n} Keycard tokens). Enemies need specific permission.`);}
 if(s.slippery!==null)facts.push(`Slippery ${s.slippery}/2 Health${s.slippery>0?': Killer may use all shafts':': removed'}.`);
 if(s.temporaryShafts===true)facts.push('This turn all Enemies may use all shafts; distinct from Slippery.');
 for(const [id,status]of Object.entries(s.people))facts.push(`${KONRAD_EVENTS.find(e=>e.id===id)?.name}: ${status}${id==='captain'&&status==='in-play'?`, location ${s.captainSpace??'unknown'}`:''}. Status correction does not add Victim totals or damage.`);
 if(s.orphanTogether!==null)facts.push(`Orphan Girl ${s.orphanTogether?'with':'apart from'} Final Girl.`);
 if(s.loader!=='unknown')facts.push(`Super Loader ${s.loader}${s.loaderSpace?` at ${s.loaderSpace}`:''}; not inferred from a Key find.`);
 if(s.beacon==='placed')facts.push(`Remote Beacon placed${s.beaconSpace?` at ${s.beaconSpace}`:' at unknown location'}.`);
 for(const [id,status]of Object.entries(s.events))if(status==='active'&&KONRAD_EVENTS.find(e=>e.id===id)?.kind==='ongoing')facts.push(`${KONRAD_EVENTS.find(e=>e.id===id)!.name} active: ${KONRAD_EVENTS.find(e=>e.id===id)!.effect}`);
 return facts;
}
