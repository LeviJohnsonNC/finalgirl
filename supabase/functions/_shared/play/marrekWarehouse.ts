/** Standard-mode source photographs IMG_9439–IMG_9444; docs/imports/marrek-warehouse.md. */
import type {ModuleState, ModuleValue} from './modules.ts';
export const MARREK_SOURCE='Owner photographs IMG_9439–IMG_9444, standard mode, November 1 2026';
export const MARREK_VISUAL='A shipping/fulfillment warehouse with tangible steel pallet racks, ordinary concrete floor, cardboard cartons, a parked forklift and timed security exits. The Pit is the central working-floor area, not a literal hole or sunken excavation. Do not invent active conveyors, steam machinery, centuries of abandonment or a required Tormentor appearance.';
export const MARREK_EXITS=[{id:'main',name:'Main Entrance'},{id:'dock-a',name:'Loading Dock A'},{id:'dock-b',name:'Loading Dock B'}] as const;
export const MARREK_RACKS=[{id:'rack-nw',name:'Upper-left Rack'},{id:'rack-ne',name:'Upper-right Rack'},{id:'rack-sw',name:'Lower-left Rack'},{id:'rack-se',name:'Lower-right Rack'}] as const;
/** Coordinates describe unnamed regions on W1 in its landscape orientation; not official room names. */
export const MARREK_SPACES=[
 ...MARREK_EXITS.map(s=>({...s,type:'exit'})),
 {id:'supply',name:'Supply Cage',type:'search'},{id:'receiving',name:'Receiving Area',type:'search'},{id:'office',name:"Manager's Office",type:'search'},
 {id:'pit',name:'The Pit',type:'floor'},...MARREK_RACKS.map(s=>({...s,type:'rack'})),
 ...[['north-west','North-west aisle'],['north-center','Aisle below Main Entrance'],['north-east','North-east aisle'],['west-outer','Outer west aisle'],['west-inner','Aisle between left Racks'],['east-inner','Aisle between right Racks'],['east-outer','Outer east aisle'],['south-west','South-west aisle'],['south-center','Aisle above Receiving Area'],['south-east','South-east aisle']].map(([id,name])=>({id,name,type:'floor'})),
];
export const MARREK_SETUPS=[
 {name:'Unloading',girl:'rack-ne',killer:'rack-sw',victims:{'rack-nw':1,'north-center':1,'west-inner':1,pit:1,'east-inner':1,'south-west':2,'south-east':2,'dock-a':1,receiving:1,'dock-b':1}},
 {name:'Daily Huddle',girl:'south-center',killer:'north-center',victims:{supply:2,'west-outer':1,'west-inner':1,pit:6,'east-inner':1,'east-outer':1}},
 {name:'Shift Change',girl:'west-outer',killer:'east-outer',victims:{'north-west':1,main:1,'north-east':1,office:1,'north-center':2,'east-inner':1,'rack-sw':1,pit:1,'south-center':2,receiving:1}},
 {name:"You're Fired",girl:'north-east',killer:'pit',victims:{'north-west':1,'north-center':1,office:1,'rack-nw':1,'west-inner':2,'east-inner':2,'rack-se':1,'south-center':1,'south-east':1,'dock-a':1}},
 {name:'Units Per Hour',girl:'west-inner',killer:'east-inner',victims:{'north-west':1,'north-center':1,'north-east':1,office:1,'west-outer':2,'east-outer':2,'rack-sw':1,'rack-se':1,'south-center':2}},
] as const;
export const MARREK_PEOPLE=[{id:'zipp',name:'Good Ole Zipp'},{id:'friend',name:'Heroic Best Friend'},{id:'supervisor',name:'The Supervisor'}] as const;
export const MARREK_EVENTS=[
 {id:'racks',name:'Help on the Racks',effect:'Panic all Victims adjacent to Racks, moving only those whose result enters a Rack. Repeat until at least two Victims have entered Racks or none remain adjacent. Discard.'},
 {id:'zipp',name:'Good Ole Zipp',effect:'Replace the Victim farthest from the Killer with Zipp. While he is with you, you may treat Exits as Unlocked. If he is killed, increase Bloodlust once. Discard when he leaves play. Permission is not a recorded physical unlock.'},
 {id:'scatter',name:'Scatter!',effect:'Panic all Victims. Discard.'},
 {id:'days',name:'“It Has Been 0 Days Since…”',effect:'Whenever a Victim in a Rack panics to a normal space, it is killed. Rack-to-Rack movement is different. Ongoing.'},
 {id:'relock',name:'“You Aren’t Going Anywhere”',effect:'Lock all Unlocked Exits again. Return all Click! cards from the discard pile to the Terror deck and shuffle. Discard.'},
 {id:'friend',name:'Heroic Best Friend',effect:'Replace a chosen Victim. Best Friend cannot be saved while other Victims remain. If you would take damage while they are in your space or adjacent, they move to your space and take it instead. Discard when they leave play.'},
 {id:'heads',name:'Tumbling Boxes',effect:'Place four Severed Heads in four different mutually non-adjacent non-Rack spaces. When you enter a space with a token, increase Horror once and remove it. Discard after the last token leaves.'},
 {id:'supervisor',name:'The Supervisor',effect:'Place Supervisor and two new ordinary Victims in Supply Cage. When panicking Victims in Supervisor’s space, roll one die and move all Victims there, including Supervisor, using that result. Discard when Supervisor leaves.'},
 {id:'smarter',name:'Smarter Than They Look',effect:'When an Exit becomes Unlocked, you may save Victims there even remotely. Take Victim Saved benefits at the start of the next Action phase. Ongoing.'},
 {id:'trucks',name:'Trucks Are Here!',effect:'Place one new Victim at each Loading Dock. At a Locked Dock, keep that Victim out of play until the Dock becomes Unlocked. Discard after both enter play. Relocking never returns an entered Victim off-board.'},
] as const;
export const MARREK_TERRORS=[
 {id:'could-be-anywhere',name:'“The Killer Could Be Anywhere…”',effect:'Increase Horror for each intervening space between you and the Killer, maximum three; do not count your space or the Killer’s space. Then Killer targets Final Girl, moves and attacks.'},
 {id:'safer-up-there',name:'“We’ll Be Safer Up There!”',effect:'Panic all Victims adjacent to Rack spaces. Then Killer targets closest Final Girl or Victim, moves and attacks.'},
 {id:'saw-the-killer',name:'“I Think I Saw the Killer…”',effect:'Increase Horror once. Then Killer targets closest Victim, moves and attacks. The mask icon is Horror +1, not a Horror roll.'},
 {id:'open-boxes',name:'“Let’s Open Some of These Boxes!”',effect:'You may roll for each unused Item set aside during setup, losing one Time for each chosen card. 1–4: do not reveal it; it stays out of the game. 5–6: reveal and take it.'},
 {id:'pushed',name:'“Were They Pushed?”',effect:'First Killer targets closest Final Girl or Victim, moves and attacks. Then panic all Victims in Racks. Those no longer in a Rack after panicking fall to their death and are killed.'},
 ...MARREK_EXITS.map(e=>({id:'click-'+e.id,name:'Click! — '+e.name,printedName:'Click!',effect:`Unlock ${e.name}. ${e.id==='main'?'':'Draw an Event, then '}draw the next Terror card. If discarded by an effect, unlock this Exit but do not apply any other effects.`})),
].map(c=>({...c,location:'Marrek Warehouse',source:MARREK_SOURCE}));
export const MARREK_ACTIONS=[
 {name:'Climb',effect:'Only adjacent to a Rack. Two successes: move to adjacent Rack, lose one Time. One success: same movement, lose two Time. Failure: lose one Health and return this card to hand. Victims may follow. Leave a Rack using normal movement, not Climb.'},
 {name:'Leap',effect:'Only while in a Rack. Two successes: move directly to another Rack, lose one Time. One success: same movement, lose two Time. Failure: MUST move one space and lose two Health. Following Victims climb down without damage.'},
];
export const MARREK_ITEMS=[
 {name:'Trashcan Lid',effect:'One hand, three uses. Ignore one damage.'},
 {name:'Forklift Keys',effect:'You may use the Forklift. It may move with you but cannot enter Search or Rack spaces. While together, spend one Time to safely move a Victim from an adjacent Rack to your space.'},
 {name:'Odds and Ends',effect:'Three uses. During Action phase place a Booby Trap in your space, one per space. An Enemy entering that space discards the token and takes two damage. Finding this Item does not place a trap.'},
 {name:'Plank',effect:'Place the Plank touching two different Rack spaces. They count as adjacent; Victims panicking from either always move to the other.'},
 {name:'Hard Hat',effect:'Place a random Final Health token on this card. When your Final Health is revealed, you may reveal this token and choose one to resolve. Not considered in your Backpack. Does not bypass a terminal Tormentor trap forbidding Final Health revelation.'},
 {name:'Knife',effect:'Range zero, one extra damage, one hand.'},
 {name:'Whip',effect:'Range zero–one, one extra damage, one hand. When you damage an Enemy with it, you may move that Enemy one space.'},
 {name:'Chainsaw',effect:'Range zero, three extra damage, two hands, two uses. Cannot modify Reaction cards. Append the end-Action-phase effect to an Action card result when used.'},
 {name:'A List of Things in the…',effect:'Immediately roll: 1–2 Supply Cage, 3–4 Receiving Area, 5–6 Manager’s Office. Reveal all Items in that deck without changing their order. Discard.'},
 {name:'.44 Magnum',effect:'Range one–two, one extra damage, one hand. Cannot modify Weak Attack.'},
 {name:'Megaphone',effect:'One hand. Once per Action phase move any Victim one space. Then all Enemies target the Final Girl and move.'},
 {name:'Power Drill',effect:'Range zero, one extra damage, one hand. You may discard it to unlock your current Exit.'},
 {name:'Bowling Ball',effect:'Two hands. Discard during Action phase while in a Rack to deal three damage to an Enemy in an adjacent space.'},
 {name:'First Aid Kit',effect:'One hand. Each Action card used to recover Health recovers one additional Health.'},
 {name:'Two-Way Radio',effect:'One hand, four uses. Spend one Time to move a Victim one space. May not be used on the same Victim more than once in a turn.'},
 {name:'Bolt Cutters',effect:'Two hands, two uses. Ignore one damage OR unlock your current Exit.'},
];
export type MarrekOpening='fresh-v1'|'legacy-unknown';
export type ExitId=typeof MARREK_EXITS[number]['id'];
export type PersonId=typeof MARREK_PEOPLE[number]['id'];
export type PersonStatus='in-play'|'saved'|'killed'|'left'|'not-in-play';
export type Delivery='waiting'|'entered'|null;
export interface MarrekSnapshot {initialized?:true;exits:Partial<Record<ExitId,boolean|null>>;people:Partial<Record<PersonId,PersonStatus>>;withZipp:boolean|null;forklift:boolean|null;plank:readonly [string,string]|false|null;smarter:boolean|null;days:boolean|null;heads:number|null;trucks:{a:Delivery;b:Delivery}|null;traps:string[]|null}
export interface MarrekEntry {id?:string;kind:string;moduleData?:{module:string;changes:ModuleState}}
export type MarrekCommand=
 |{command:'exit';id:ExitId;locked:boolean;intent:'resolve'}
 |{command:'correct-exit';id:ExitId;locked:boolean|null;delivery?:Delivery}
 |{command:'person';id:PersonId;status:PersonStatus|null}
 |{command:'zipp';value:boolean|null}
 |{command:'forklift';value:boolean|null}
 |{command:'plank';value:readonly [string,string]|false|null}
 |{command:'ongoing';id:'days'|'smarter';value:boolean|null}
 |{command:'heads';value:number|null}
 |{command:'trucks';intent:'resolve'}
 |{command:'delivery';id:'a'|'b';value:Delivery}
 |{command:'clear-trucks'}
 |{command:'trap';space:string;present:boolean};
export type MarrekAction=MarrekCommand&{parent:string};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const bool=(v:unknown)=>v===null||typeof v==='boolean';
const exact=(v:Record<string,unknown>,keys:string[])=>Object.keys(v).sort().join()===keys.sort().join();
const person=(v:unknown)=>['in-play','saved','killed','left','not-in-play'].includes(String(v));
const delivery=(v:unknown)=>v===null||v==='waiting'||v==='entered';
const plank=(v:unknown)=>v===null||v===false||Array.isArray(v)&&v.length===2&&v[0]!==v[1]&&v.every(x=>MARREK_RACKS.some(r=>r.id===x));
export function emptyMarrek():MarrekSnapshot{return {exits:{},people:{},withZipp:null,forklift:null,plank:null,smarter:null,days:null,heads:null,trucks:null,traps:null};}
export function parseMarrek(v:unknown):MarrekSnapshot|null {
 if(typeof v!=='string'||v.length>6000)return null;
 try {const s=JSON.parse(v);if(!object(s)||!exact(s,['exits','people','withZipp','forklift','plank','smarter','days','heads','trucks','traps',...('initialized' in s?['initialized']:[])])||('initialized' in s&&s.initialized!==true))return null;
 if(!object(s.exits)||!Object.entries(s.exits).every(([id,v])=>MARREK_EXITS.some(e=>e.id===id)&&bool(v))||!object(s.people)||!Object.entries(s.people).every(([id,v])=>MARREK_PEOPLE.some(p=>p.id===id)&&person(v)))return null;
 if(![s.withZipp,s.forklift,s.smarter,s.days].every(bool)||!plank(s.plank)||!(s.heads===null||Number.isInteger(s.heads)&&Number(s.heads)>=0&&Number(s.heads)<=4))return null;
 if(s.withZipp===true&&s.people.zipp!=='in-play')return null;
 if(s.trucks!==null&&(!object(s.trucks)||!exact(s.trucks,['a','b'])||!delivery(s.trucks.a)||!delivery(s.trucks.b)))return null;
 if(s.traps!==null&&(!Array.isArray(s.traps)||s.traps.length>MARREK_SPACES.length||new Set(s.traps).size!==s.traps.length||!s.traps.every(id=>MARREK_SPACES.some(x=>x.id===id))))return null;
 return s as unknown as MarrekSnapshot;}catch{return null;}
}
export function marrekState(state:ModuleState):MarrekSnapshot{return parseMarrek(state.snapshot)??emptyMarrek();}
export function validMarrekField(key:string,value:unknown){return key==='snapshot'&&!!parseMarrek(value);}
export function initialMarrek(event?:string|null):Record<string,ModuleValue>{const s=emptyMarrek();s.initialized=true;s.exits={main:true,'dock-a':true,'dock-b':true};s.people={zipp:'not-in-play',friend:'not-in-play',supervisor:'not-in-play'};s.withZipp=false;s.forklift=false;s.plank=false;s.smarter=false;s.days=false;s.heads=0;s.traps=[];const e=MARREK_EVENTS.find(e=>e.name===event||e.name.replace(/[“”]/g,'')===event?.replace(/["“”]/g,''));if(e){if(['zipp','friend','supervisor'].includes(e.id))s.people[e.id as PersonId]='in-play';if(e.id==='days')s.days=true;if(e.id==='smarter')s.smarter=true;if(e.id==='heads')s.heads=4;if(e.id==='trucks')s.trucks={a:'waiting',b:'waiting'};}return {snapshot:JSON.stringify(s)};}
export function isInitialMarrek(changes:ModuleState){const s=parseMarrek(changes.snapshot);return !!s&&MARREK_EVENTS.concat([]).map(e=>e.name as string).concat(['']).some(name=>initialMarrek(name).snapshot===changes.snapshot)&&Object.keys(changes).length===1;}
/** Relevant owner revision includes legacy Tormentor lock snapshots, without coupling ordinary victim totals. */
export function marrekParent(entries:readonly MarrekEntry[]){return [...entries].reverse().find(e=>['marrek','tormentor'].includes(e.moduleData?.module??''))?.id??'root';}
/** Canonical explicit null takes precedence over old aliases. No changes to historical serialized records. */
export function marrekExits(s:MarrekSnapshot,entries:readonly MarrekEntry[]=[]):Record<ExitId,boolean|null>{
 const result={main:null,'dock-a':null,'dock-b':null} as Record<ExitId,boolean|null>;
 let old:Record<string,unknown>={};for(const e of entries)if(e.moduleData?.module==='tormentor'){try{old=JSON.parse(String(e.moduleData.changes.snapshot)).exits??{};}catch{/* Unknown malformed legacy observation. */}}
 const normalize=(v:string)=>v.toLowerCase().trim().replace(/[’']/g,'').replace(/\s+/g,' ');
 for(const e of MARREK_EXITS){if(Object.prototype.hasOwnProperty.call(s.exits,e.id)){result[e.id]=s.exits[e.id]??null;continue;}const aliases=[normalize(e.name),e.id,...(e.id==='main'?['main entrance']:['dock '+e.id.slice(-1)])];const values=Object.entries(old).filter(([k])=>aliases.includes(normalize(k))).map(([,v])=>v);if(values.length&&values.every(v=>typeof v==='boolean'&&v===values[0]))result[e.id]=values[0] as boolean;}
 return result;
}
export function validMarrekAction(v:unknown):v is MarrekAction {
 if(!object(v)||typeof v.parent!=='string'||!/^(root|[0-9a-f-]{36})$/i.test(v.parent)||typeof v.command!=='string')return false;
 const fields:Record<string,string[]>={exit:['id','locked','intent'],'correct-exit':['id','locked',...('delivery' in v?['delivery']:[])],person:['id','status'],zipp:['value'],forklift:['value'],plank:['value'],ongoing:['id','value'],heads:['value'],trucks:['intent'],delivery:['id','value'],'clear-trucks':[],trap:['space','present']};
 if(!fields[v.command]||!exact(v,['command','parent',...fields[v.command]]))return false;
 switch(v.command){case 'exit':return MARREK_EXITS.some(e=>e.id===v.id)&&typeof v.locked==='boolean'&&v.intent==='resolve';case 'correct-exit':return MARREK_EXITS.some(e=>e.id===v.id)&&bool(v.locked)&&(!('delivery' in v)||v.id!=='main'&&delivery(v.delivery));case 'person':return MARREK_PEOPLE.some(p=>p.id===v.id)&&(v.status===null||person(v.status));case 'zipp':case 'forklift':return bool(v.value);case 'plank':return plank(v.value);case 'ongoing':return ['days','smarter'].includes(String(v.id))&&bool(v.value);case 'heads':return v.value===null||typeof v.value==='number'&&Number.isInteger(v.value)&&v.value>=0&&v.value<=4;case 'trucks':return v.intent==='resolve';case 'delivery':return ['a','b'].includes(String(v.id))&&delivery(v.value);case 'clear-trucks':return true;case 'trap':return MARREK_SPACES.some(s=>s.id===v.space)&&typeof v.present==='boolean';default:return false;}
}
export function resolveMarrekAction(a:MarrekAction,state:ModuleState,entries:readonly MarrekEntry[]):Record<string,ModuleValue>|null {
 if(!validMarrekAction(a)||a.parent!==marrekParent(entries))return null;
 const s=marrekState(state),before=JSON.stringify(s),exits=marrekExits(s,entries);
 switch(a.command){
 case 'exit':if(exits[a.id]===a.locked)return null;s.exits[a.id]=a.locked;if(!a.locked&&s.trucks&&a.id!=='main'){const key=a.id==='dock-a'?'a':'b';if(s.trucks[key]==='waiting')s.trucks[key]='entered';}break;
 case 'correct-exit':s.exits[a.id]=a.locked;if('delivery' in a){if(!s.trucks)return null;s.trucks[a.id==='dock-a'?'a':'b']=a.delivery??null;}break;
 case 'person':if(a.status===null)delete s.people[a.id];else s.people[a.id]=a.status;if(a.id==='zipp'&&a.status!=='in-play')s.withZipp=false;break;
 case 'zipp':if(a.value===true&&s.people.zipp!=='in-play')return null;s.withZipp=a.value;break;
 case 'forklift':s.forklift=a.value;break;
 case 'plank':s.plank=a.value;break;
 case 'ongoing':s[a.id]=a.value;break;
 case 'heads':s.heads=a.value;break;
 case 'trucks':if(s.trucks)return null;s.trucks={a:exits['dock-a']===null?null:exits['dock-a']?'waiting':'entered',b:exits['dock-b']===null?null:exits['dock-b']?'waiting':'entered'};break;
 case 'delivery':if(!s.trucks)s.trucks={a:null,b:null};s.trucks[a.id]=a.value;break;
 case 'clear-trucks':s.trucks=null;break;
 case 'trap':{const traps=s.traps??[];if(a.present&&traps.includes(a.space)||!a.present&&!traps.includes(a.space))return null;s.traps=a.present?[...traps,a.space]:traps.filter(x=>x!==a.space);break;}
 }
 const next=JSON.stringify(s);return next===before||!parseMarrek(next)?null:{snapshot:next};
}
export function trucksActive(s:MarrekSnapshot){return !!s.trucks&&(s.trucks.a!=='entered'||s.trucks.b!=='entered');}
export function marrekFacts(s:MarrekSnapshot,entries:readonly MarrekEntry[]=[]):string[]{
 const locks=marrekExits(s,entries),parts=[`Warehouse physical exits: ${MARREK_EXITS.map(e=>`${e.name} ${locks[e.id]===null?'unknown':locks[e.id]?'Locked':'Unlocked'}`).join(', ')}.`];
 if(s.withZipp===true)parts.push('Zipp is with the Final Girl: may treat Exits as Unlocked; physical locks are unchanged.');
 if(s.trucks)parts.push(`Truck arrivals: Dock A ${s.trucks.a??'unknown'}, Dock B ${s.trucks.b??'unknown'}; waiting Victims are off-board, not saved.`);
 for(const p of MARREK_PEOPLE)if(s.people[p.id]&&s.people[p.id]!=='not-in-play')parts.push(`${p.name}: ${s.people[p.id]}.`);
 if(s.plank)parts.push(`Plank joins ${s.plank.map(id=>MARREK_RACKS.find(r=>r.id===id)!.name).join(' and ')}.`);
 if(s.heads!==null&&s.heads>0)parts.push(`${s.heads} Severed Head tokens remain; no new casualty is inferred.`);
 if(s.days)parts.push('0 Days is active: Rack-to-normal-space Panic is lethal.');if(s.smarter)parts.push('Smarter Than They Look is active; no rescue is inferred.');if(s.forklift)parts.push('Forklift access recorded; current vehicle position and movement are unrecorded.');
 if(s.traps?.length)parts.push(`Placed Booby Traps: ${s.traps.map(id=>MARREK_SPACES.find(x=>x.id===id)!.name).join(', ')}; target Enemies, no damage inferred.`);
 return parts;
}
export function marrekOpeningGuidance(v:MarrekOpening){return MARREK_VISUAL+' '+(v==='fresh-v1'?'Verified original fresh setup: all three physical Exits start Locked; Forklift starts in The Pit and requires its Keys. Apply only the chosen starting Event and exact Setup facts. Random choices and resulting movement/casualties remain unknown.':'Original Warehouse setup and physical locks were not recorded. Do not borrow current Play locks, deliveries, people or props into the original opening.');}
