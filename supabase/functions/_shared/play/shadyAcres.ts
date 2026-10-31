/** Standard-mode owner photographs corn1–corn6.jpeg; see docs/imports/shady-acres.md. */
import type { ModuleState } from './modules.ts';
export const SHADY_SOURCE = 'Owner photographs corn1–corn6.jpeg, 2026-10-31, standard mode; publisher Shady Acres rules';
export const SHADY_RULES_URL = 'https://cdn.shopify.com/s/files/1/0593/6984/8897/files/FG_FF17_ShadyAcres_Rules.pdf?v=1752170949';
export const SHADY_CURSES = [
 {id:'omen-of-plague',name:'Omen of Plague',effect:'During Upkeep, choose a space with at least 2 Victims and kill 1 Victim there.'},
 {id:'decaying-earth',name:'Decaying Earth',effect:'Whenever you enter a Field space, lose 1 Health. This is Health loss, not attack damage.'},
 {id:'dark-fields',name:'Dark Fields',effect:'Children treat Field spaces as adjacent to one another.'},
 {id:'omen-of-death',name:'Omen of Death',effect:'Whenever the Killer kills a Victim, the Killer recovers 1 Health.'},
 {id:'malevolent-aura',name:'Malevolent Aura',effect:'Whenever you enter a space with one or more Children, increase Horror once.'},
 {id:'chthonic-possession',name:'Chthonic Possession',effect:'Children have a Movement Value of 2.'},
 {id:'omen-of-blood',name:'Omen of Blood',effect:'Once per Killer phase, when the Killer kills a Victim, lose 1 Health.'},
 {id:'gnarled-stalks',name:'Gnarled Stalks',effect:'Lose 2 Time when moving into a Field space.'},
] as const;
export const SHADY_PEOPLE = [
 {id:'sally',name:'Sally McCoy'}, {id:'ralph',name:'Ralph the Mechanic'}, {id:'cultist',name:'Harvest Cultist'},
] as const;
export const SHADY_EVENTS = [
 {id:'hungers',name:'It Hungers for Us',effect:'Panic all Victims. Increase Horror once for each Victim in the Killer’s space or an adjacent space, maximum 3. Discard.'},
 {id:'cultist',name:'Harvest Cultist',effect:'The closest existing Victim becomes the Harvest Cultist. During Upkeep move them 1 space towards you; if in your space, both move 1 space towards the Killer. Saving them reduces Horror twice. Discard when they leave play.'},
 {id:'sally',name:'Sally McCoy',effect:'Place Sally in McCoy Farmhouse. Saving her finds Combine Keys, reshuffling Item decks if needed. If you already have the keys, gain 1 Time instead. Discard when she leaves play.'},
 {id:'ralph',name:'Ralph the Mechanic',effect:'Place Ralph in Ralph’s Garage. While together, taking an Item with limited uses adds one extra Tracking marker, even beyond its printed circles. Discard when he leaves play.'},
 {id:'festering',name:'Festering Rot',effect:'Whenever a Victim is killed in a Field space, increase Horror once.'},
 {id:'shadow',name:'Umbral Evocation',effect:'Place the Harvest Shadow token in the Killer’s current space. Each time you or a Victim enters that space, increase Bloodlust once.'},
 {id:'ravens',name:'The Ravens Are Circling',effect:'Each Child moves 2 spaces towards the Killer. Place Health markers on this card equal to the number of Children in its space. When the Killer takes damage, remove the Health markers from this card. Discard when no markers remain. Record physically resolved markers; do not infer damage prevention.'},
 {id:'fields',name:'“The Fields Are Moving...”',effect:'Place a Field token in both Hayfield and Cow Pasture. Those spaces are now Field spaces.'},
 {id:'hatred',name:'Acres of Hatred',effect:'For each Field space containing at least 1 Victim, increase Bloodlust once, maximum 2. Discard.'},
 {id:'lurks',name:'It Lurks Between the Rows',effect:'Panic every Victim in a Field space. Victims that panic into the Killer’s space are killed. Discard.'},
] as const;
export const SHADY_TERRORS = [
 {id:'kids',name:'“Something’s Wrong with the Kids!”',quantity:2,effect:'For this card Children treat all Field spaces as adjacent. Children only: target the closest Final Girl or Victim; move; abduct. Then increase Horror once.'},
 {id:'chow',name:'Chow Time',quantity:1,effect:'Place 2 new Victims in Old Barn and 2 in Cow Pasture. Draw and resolve an Event.'},
 {id:'knows',name:'“It Knows I’m Here!”',quantity:1,effect:'For this card the Killer treats Field spaces as adjacent. Killer: target the Final Girl; move; attack. Then increase Horror once.'},
 {id:'rows',name:'Never Ending Rows',quantity:1,effect:'For this card the Killer treats Field spaces as adjacent. Killer: target the closest Final Girl or Victim; move; attack. Draw and resolve an Event.'},
 {id:'gas',name:'Out of Gas',quantity:1,effect:'Place 3 new Victims in the road space connected to Hayfield (Central road). Draw and resolve an Event.'},
 {id:'belong',name:'“You Belong to the Fields Now!”',quantity:1,effect:'If you are in a Field space, place the Killer in your space. Killer: target the closest Final Girl or Victim; move; attack.'},
 {id:'nobody',name:'“Nobody Knows Where They Take Them...”',quantity:1,effect:'If neither Victims nor Children remain on the board, discard and draw the next Terror. Otherwise panic all Victims sharing a space with a Child. For each Child sharing a space with a Victim, resolve Abduction as though a 1 was rolled.'},
].map(c=>({...c,location:'Shady Acres',source:SHADY_SOURCE}));
export const SHADY_ITEMS = [
 {name:'Children’s Toys',effect:'2 uses. Replace a Child in your space with a normal Victim. Recording a find does not resolve the replacement.'},
 {name:'Cornhusk Effigy',effect:'Discard to remove an active Ancient Curse from the game.'},
 {name:'Moonshine Jug',effect:'Discard to recover 4 Health.'},
 {name:'Bag of Feed',effect:'Discard to move up to 4 spaces.'},
 {name:'Locus of Insanity',effect:'3 uses. Once per turn, increase Horror once to place yourself in any Field space.'},
 {name:'Mechanic’s Toolbox',effect:'Discard to return 1 discarded Item to your inventory, restoring all its uses if applicable.'},
 {name:'Pilgrim’s Hat',effect:'Move an additional space when starting your movement in a Field space.'},
 {name:'Pilgrim’s Musket',effect:'Range 1, 2 extra damage, 2 hands, 2 uses. Cannot attack Enemies in a Field space.'},
 {name:'Farmer’s Almanac',effect:'2 uses. After drawing a Terror but before resolving it, place it on the deck bottom and draw the next Terror.'},
 {name:'Sickle',effect:'Range 0, 1 extra damage, 1 hand.'},
 {name:'Corn Cob Pipe',effect:'Discard to reduce Horror three times.'},
 {name:'Cowboy Boots',effect:'2 uses. Use to move up to 2 spaces.'},
 {name:'Scythe',effect:'Range 0–1, 1 extra damage, 2 hands. When attacking Enemies in a Field, distribute damage among those Enemies, then place a Harvested token there; it is no longer a Field.'},
 {name:'Rusty Pitchfork',effect:'Range 0, 2 extra damage, 2 hands. If the final Horror Roll has no successes, discard this weapon.'},
 {name:'Combine Keys',effect:'Place the Combine in your space. A Walk while moving with it allows 1 additional space. When entering a Field with it, place a Harvested token there; it is no longer a Field.'},
 {name:'Decrepit Plow',effect:'Range 0, 2 extra damage, 1 hand, 2 uses.'},
] as const;
export const SHADY_SPACES = [
 {id:'farmhouse',name:'McCoy Farmhouse',type:'search'}, {id:'pasture',name:'Cow Pasture',type:'terrain'},
 {id:'altar',name:'Altar of the Old Gods',type:'altar'}, {id:'barn',name:'Old Barn',type:'search'},
 {id:'hayfield',name:'Hayfield',type:'terrain'}, {id:'garage',name:'Ralph’s Garage',type:'search'},
 {id:'field-west',name:'West Field',type:'field'}, {id:'field-southwest',name:'Southwest Field',type:'field'},
 {id:'field-south',name:'South Field',type:'field'}, {id:'field-north',name:'North Field',type:'field'},
 {id:'field-inner-east',name:'Inner East Field',type:'field'}, {id:'field-outer-east',name:'Outer East Field',type:'field'},
 {id:'road-west',name:'West exit road',type:'road'}, {id:'road-centre',name:'Central road',type:'road'},
 {id:'road-southeast',name:'Southeast road',type:'road'}, {id:'road-east',name:'East exit road',type:'road'},
] as const;
export const SHADY_TERRAIN = SHADY_SPACES.filter(s=>s.type==='field'||s.type==='terrain');
/** Coordinate labels for unnamed board spaces are descriptive, not invented place names. */
export const SHADY_SETUPS = [
 {name:'Harvest Season',girl:'field-south',killer:'altar',victims:{farmhouse:1,pasture:2,'field-west':1,barn:2,'field-southwest':1,'field-inner-east':2,hayfield:2,garage:1,'road-centre':1,'road-southeast':1}},
 {name:'Demands of the Earth',girl:'field-southwest',killer:'pasture',victims:{'field-west':2,barn:1,'field-south':1,hayfield:4,'field-inner-east':2,'road-centre':2,'road-southeast':2}},
 {name:'Final Crop',girl:'field-inner-east',killer:'field-southwest',victims:{farmhouse:2,pasture:3,'field-west':2,hayfield:3,garage:2,'road-centre':1,'road-southeast':1}},
 {name:'Reap What You Sow',girl:'altar',killer:'barn',victims:{farmhouse:1,pasture:3,'road-west':1,'field-west':1,'field-southwest':1,'field-south':1,'field-inner-east':3,hayfield:1,garage:1,'road-southeast':1}},
 {name:'Dusk Sacrifice',girl:'road-west',killer:'road-east',victims:{pasture:2,'field-west':2,barn:1,'field-southwest':2,'field-south':1,'field-inner-east':2,hayfield:2,'road-centre':1,'road-southeast':1}},
] as const;
export type ChildStatus='on-board'|'on-card';
export type PersonStatus='in-play'|'saved'|'killed'|'left'|'not-in-play';
export interface CurseRecord {id:string;card:string|null;status:'active'|'removed'}
export interface TerrainObservation {field:boolean|null;harvested:boolean|null;added:boolean|null}
export interface ShadySnapshot {
 initialized?:true;
 children:Partial<Record<'1'|'2'|'3',ChildStatus>>;
 sacrifices:number|null;
 curses:CurseRecord[];
 people:Partial<Record<'sally'|'ralph'|'cultist',PersonStatus>>;
 rot?:boolean;
 ravens?:boolean; ravenHealth?:number|null;
 shadow?:boolean; shadowSpace?:string|null;
 combine?:boolean; combineSpace?:string|null;
 fields:Record<string,TerrainObservation>;
 finishChildren?:number|null;
}
export type ShadyCommand =
 | {command:'child';id:'1'|'2'|'3';status:ChildStatus|null}
 | {command:'sacrifices';value:number|null}
 | {command:'reveal';id:string;card:string|null;reset:boolean}
 | {command:'curse';id:string;card?:string|null;status?:'active'|'removed';correction?:boolean}
 | {command:'person';id:'sally'|'ralph'|'cultist';status:PersonStatus|null}
 | {command:'rot';active:boolean}
 | {command:'ravens';active:boolean;health:number|null}
 | {command:'shadow';active:boolean;space:string|null}
 | {command:'combine';active:boolean;space:string|null;harvested?:string[]}
 | {command:'terrain';id:string;value:TerrainObservation}
 | {command:'fields'}
 | {command:'finish';value:number|null};
export type ShadyAction=ShadyCommand&{parent:string};
export interface ShadyEntry {id?:string;kind:string;target?:string;shadyAction?:ShadyAction;moduleData?:{module:string;changes:ModuleState}}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const only=(v:Record<string,unknown>,keys:readonly string[])=>Object.keys(v).every(k=>keys.includes(k));
const count=(v:unknown)=>v===null||typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=3;
const bool=(v:unknown)=>v===null||typeof v==='boolean';
const space=(v:unknown)=>v===null||SHADY_SPACES.some(s=>s.id===v);
const card=(v:unknown)=>v===null||SHADY_CURSES.some(c=>c.id===v);
const recordId=(v:unknown)=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(v);
const terrain=(v:unknown):v is TerrainObservation=>object(v)&&only(v,['field','harvested','added'])&&Object.keys(v).length===3&&bool(v.field)&&bool(v.harvested)&&bool(v.added);
export const emptyShady=():ShadySnapshot=>({children:{},sacrifices:null,curses:[],people:{},fields:{}});
export function parseShady(v:unknown):ShadySnapshot|null {
 if(typeof v!=='string'||v.length>9000)return null;
 try {const s:unknown=JSON.parse(v);if(!object(s)||!only(s,['initialized','children','sacrifices','curses','people','rot','ravens','ravenHealth','shadow','shadowSpace','combine','combineSpace','fields','finishChildren']))return null;
  if(s.initialized!==undefined&&s.initialized!==true||!object(s.children)||!Object.entries(s.children).every(([k,v])=>['1','2','3'].includes(k)&&['on-board','on-card'].includes(String(v)))||!count(s.sacrifices))return null;
  if(!Array.isArray(s.curses)||s.curses.length>8||!s.curses.every(c=>object(c)&&only(c,['id','card','status'])&&recordId(c.id)&&card(c.card)&&['active','removed'].includes(String(c.status))))return null;
  if(new Set(s.curses.map(c=>c.id)).size!==s.curses.length||new Set(s.curses.filter(c=>c.card!==null).map(c=>c.card)).size!==s.curses.filter(c=>c.card!==null).length)return null;
  if(!object(s.people)||!Object.entries(s.people).every(([k,v])=>SHADY_PEOPLE.some(p=>p.id===k)&&['in-play','saved','killed','left','not-in-play'].includes(String(v))))return null;
  if(!object(s.fields)||!Object.entries(s.fields).every(([k,v])=>SHADY_TERRAIN.some(f=>f.id===k)&&terrain(v)))return null;
  if(['rot','ravens','shadow','combine'].some(k=>s[k]!==undefined&&typeof s[k]!=='boolean')||s.ravenHealth!==undefined&&!count(s.ravenHealth)||s.finishChildren!==undefined&&!count(s.finishChildren)||['shadowSpace','combineSpace'].some(k=>s[k]!==undefined&&!space(s[k])))return null;
  if(s.ravens===false&&typeof s.ravenHealth==='number'&&s.ravenHealth>0||s.shadow===false&&s.shadowSpace!=null||s.combine===false&&s.combineSpace!=null)return null;
  return s as unknown as ShadySnapshot;
 }catch{return null;}
}
export function shadyState(state:ModuleState):ShadySnapshot{return parseShady(state.snapshot)??emptyShady();}
export function initialShady(startingEvent?:string|null):ModuleState {
 const s=emptyShady();s.initialized=true;s.children={'1':'on-board','2':'on-card','3':'on-card'};s.sacrifices=0;s.rot=false;s.ravens=false;s.shadow=false;s.combine=false;
 for(const p of SHADY_PEOPLE)s.people[p.id]=startingEvent===p.name?'in-play':'not-in-play';
 for(const f of SHADY_TERRAIN)s.fields[f.id]={field:f.type==='field',harvested:false,added:false};
 if(startingEvent===SHADY_EVENTS.find(e=>e.id==='fields')!.name){for(const id of ['pasture','hayfield'])s.fields[id]={field:true,harvested:false,added:true};}
 if(startingEvent===SHADY_EVENTS.find(e=>e.id==='shadow')!.name){s.shadow=true;s.shadowSpace=null;}
 if(startingEvent==='Festering Rot')s.rot=true;
 if(startingEvent===SHADY_EVENTS.find(e=>e.id==='ravens')!.name){s.ravens=true;s.ravenHealth=null;}
 return {snapshot:JSON.stringify(s)};
}
export function isInitialShady(changes:ModuleState){return Object.keys(changes).join()==='snapshot'&&[null,...SHADY_EVENTS.map(e=>e.name)].some(e=>JSON.stringify(parseShady(changes.snapshot))===JSON.stringify(parseShady(initialShady(e).snapshot)));}
export function validShadyField(key:string,value:unknown){return key==='snapshot'&&parseShady(value)!==null;}
export function shadyParent(entries:readonly ShadyEntry[]){return [...entries].reverse().find(e=>e.kind==='module'&&e.moduleData?.module==='shady-acres')?.id??'root';}
export function validShadyAction(input:unknown):input is ShadyAction {
 if(!object(input)||typeof input.parent!=='string'||input.parent.length>80||typeof input.command!=='string')return false;
 const a=input,keys=(extra:string[])=>only(a,['parent','command',...extra]);
 switch(a.command){
 case 'child':return keys(['id','status'])&&['1','2','3'].includes(String(a.id))&&[null,'on-board','on-card'].includes(a.status as null);
 case 'sacrifices':case 'finish':return keys(['value'])&&count(a.value);
 case 'reveal':return keys(['id','card','reset'])&&recordId(a.id)&&card(a.card)&&typeof a.reset==='boolean';
 case 'curse':return keys(['id','card','status','correction'])&&recordId(a.id)&&(a.card===undefined||card(a.card))&&(a.status===undefined||['active','removed'].includes(String(a.status)))&&(a.correction===undefined||typeof a.correction==='boolean')&&(a.card!==undefined||a.status!==undefined);
 case 'person':return keys(['id','status'])&&SHADY_PEOPLE.some(p=>p.id===a.id)&&[null,'in-play','saved','killed','left','not-in-play'].includes(a.status as null);
 case 'rot':return keys(['active'])&&typeof a.active==='boolean';
 case 'ravens':return keys(['active','health'])&&typeof a.active==='boolean'&&count(a.health)&&!(a.active===false&&typeof a.health==='number'&&a.health>0);
 case 'shadow':return keys(['active','space'])&&typeof a.active==='boolean'&&space(a.space)&&(a.active||a.space===null);
 case 'combine':return keys(['active','space','harvested'])&&typeof a.active==='boolean'&&space(a.space)&&(a.active||a.space===null)&&(a.harvested===undefined||Array.isArray(a.harvested)&&a.harvested.length<=8&&new Set(a.harvested).size===a.harvested.length&&a.harvested.every(id=>SHADY_TERRAIN.some(f=>f.id===id))&&a.active===true);
 case 'terrain':return keys(['id','value'])&&SHADY_TERRAIN.some(f=>f.id===a.id)&&terrain(a.value);
 case 'fields':return keys([]);
 default:return false;
 }
}
export function resolveShadyAction(a:ShadyAction,state:ModuleState,entries:readonly ShadyEntry[]):ModuleState|null {
 if(!validShadyAction(a)||a.parent!==shadyParent(entries))return null;
 const s=shadyState(state),before=JSON.stringify(s);
 switch(a.command){
 case 'child':if(a.status===null)delete s.children[a.id];else s.children[a.id]=a.status;break;
 case 'sacrifices':s.sacrifices=a.value;break;
 case 'reveal':if(s.curses.length===8||s.curses.some(c=>c.id===a.id||a.card!==null&&c.card===a.card))return null;s.curses.push({id:a.id,card:a.card,status:'active'});if(a.reset)s.sacrifices=0;break;
 case 'curse':{const c=s.curses.find(c=>c.id===a.id);if(!c||c.status==='removed'&&a.status==='active'&&!a.correction||a.card!==undefined&&a.card!==null&&s.curses.some(other=>other.id!==a.id&&other.card===a.card))return null;if(a.card!==undefined)c.card=a.card;if(a.status!==undefined)c.status=a.status;break;}
 case 'person':if(a.status===null)delete s.people[a.id];else {if(a.status==='in-play'&&(s.people[a.id]==='saved'||s.people[a.id]==='killed'))return null;s.people[a.id]=a.status;}break;
 case 'rot':s.rot=a.active;break;
 case 'ravens':s.ravens=a.active;s.ravenHealth=a.health;break;
 case 'shadow':s.shadow=a.active;s.shadowSpace=a.space;break;
 case 'combine':s.combine=a.active;s.combineSpace=a.space;for(const id of a.harvested??[])s.fields[id]={...(s.fields[id]??{field:null,harvested:null,added:null}),field:false,harvested:true};break;
 case 'terrain':s.fields[a.id]={...a.value};break;
 case 'fields':for(const id of ['pasture','hayfield']){const old=s.fields[id];s.fields[id]={field:old?.harvested===true?null:true,harvested:old?.harvested??null,added:true};}break;
 case 'finish':s.finishChildren=a.value;break;
 }
 const snapshot=JSON.stringify(s);return snapshot===before||!parseShady(snapshot)?null:{snapshot};
}
export function shadyChildrenCount(s:ShadySnapshot):number|null{return ['1','2','3'].every(id=>s.children[id as '1']!==undefined)?Object.values(s.children).filter(v=>v==='on-board').length:null;}
export function shadyFacts(s:ShadySnapshot):string[] {
 const facts:string[]=[];const n=shadyChildrenCount(s);if(s.finishChildren===undefined&&n!==null)facts.push(`${n} Children on board; reusable Enemies, not Minions or Victim casualties.`);
 if(s.finishChildren!==undefined&&s.finishChildren!==null)facts.push(`Children on board at finish: ${s.finishChildren}; this is not a survival/death count.`);
 if(s.sacrifices!==null)facts.push(`${s.sacrifices}/3 observed sacrifice markers towards the next Curse; marker counts do not establish additional casualties.`);
 for(const c of s.curses){const card=SHADY_CURSES.find(x=>x.id===c.card);facts.push(`${card?.name??'Unnamed Ancient Curse'} ${c.status==='active'?'in play':'removed from the game'}.`);}
 for(const p of SHADY_PEOPLE){const status=s.people[p.id];if(status&&status!=='not-in-play')facts.push(`${p.name}: ${status.replace('-',' ')}; status alone does not establish a reward or casualty total.`);}
 if(s.rot)facts.push('Festering Rot active; its presence does not establish unrecorded Horror changes or casualties.');
 if(s.shadow)facts.push(`Harvest Shadow present${s.shadowSpace?` at ${SHADY_SPACES.find(p=>p.id===s.shadowSpace)!.name}`:'; placement not recorded'}.`);
 if(s.ravens)facts.push(`The Ravens Are Circling active; markers ${s.ravenHealth??'not recorded'}; no unrecorded damage prevention.`);
 if(s.combine)facts.push(`Combine present${s.combineSpace?` at ${SHADY_SPACES.find(p=>p.id===s.combineSpace)!.name}`:'; placement not recorded'}; keys found alone do not prove use.`);
 for(const f of SHADY_TERRAIN){const o=s.fields[f.id];if(o?.harvested===true||o?.added===true)facts.push(`${f.name}: ${o.harvested?'harvested token recorded; ':''}${o.added?'added Field token recorded; ':''}effective Field status ${o.field===null?'not recorded':o.field?'Field':'not Field'}.`);}
 return facts;
}
