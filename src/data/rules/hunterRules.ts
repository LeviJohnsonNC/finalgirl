import { HUNTER, HUNTER_SOURCE, HUNTER_VISUAL, HUNTER_POWERS, HUNTER_FINALES, HUNTER_MINORS, HUNTER_TERRORS, HUNTER_BLOODLUST, HUNTER_ACTIONS } from '@/lib/play/hunter';
import type { EntityRuleModule, ModulePromptContext } from './moduleRules';
export const hunterRules:EntityRuleModule={entity:HUNTER,kind:'killer',filmId:'s3-killer-from-tomorrow',source:HUNTER_SOURCE,credits:{design:'Evan Derrick',art:'Tyler Johnson'},tags:['hunter','mark v','mark x','ally','cybernetic','parts','countdown','repair','system reboot'],
 setup:[{type:'list',items:[
 'Start with Mark V as Active Killer at the chosen Setup’s Killer starting space. Mark X waits off board. Horror 5, Bloodlust 0; the board’s 15 Health and Final Health tokens belong to Mark X, not Mark V.',
 'Put two Countdown tokens on the back of the Finale. Randomly place three unseen Cybernetic Part tokens face down above them, making a five-token stack.',
 'Build the Terror deck normally, then shuffle its bottom two cards with Hunter Mark X and put those three at the bottom. Set aside the Mark V Ally card and four Action cubes.',
 ]}],rules:[
 {type:'heading',level:3,text:'Active Killer and Bloodlust'},
 {type:'paragraph',text:'Instructions for the Hunter apply to the Active model. Before the Finale, target the Final Girl, move and attack. Victim deaths do not increase Bloodlust. Damage the Hunter deals to the Final Girl or an Ally, or damage it receives, increases Bloodlust once per phase. Multiple exchanges in that phase do not increase it again. During Panic, also panic Victims in the Hunter’s space if Bloodlust increased that turn.'},
 {type:'table',headers:['Bloodlust','Attack','Move','Entry effect'],rows:HUNTER_BLOODLUST.map(([attack,move,effect],level)=>[String(level),String(attack),String(move),effect])},
 {type:'paragraph',text:'At maximum Bloodlust discard the next Terror card for each further increase.'},
 {type:'heading',level:3,text:'Defeating Mark V'},
 {type:'paragraph',text:'Damage Cybernetic Parts instead of ordinary Health; Mark V has no Final Health token. Each Part takes 2 damage (3 with Titanium-Laced Bio Tissue). Combine attacks within one phase; unfinished damage is lost when that phase ends. Each destroyed Part removes the top Part from the Finale stack. Roll a die and put that Part in or adjacent to Mark V’s space according to the die and Panic numbers. Removing the last Part immediately shuts Mark V down. Leave its meeple in place, reveal its Dark Power if still facedown and move it beneath the Ally card. If defeated during the Action phase, continue your turn; otherwise the current phase immediately ends. Minor Powers remain and apply to Mark X. It is no longer a Killer or Enemy.'},
 {type:'heading',level:3,text:'Countdown and Hunter Mark X'},
 {type:'paragraph',text:'Once only Countdown tokens remain, ignore the back-of-Finale Killer action and draw no Terror. Remove one Countdown token and increase Bloodlust by 1 at the beginning of each Killer phase. When the second is removed, draw a new Setup and place Mark X in that card’s Killer starting space. Leave the special Hunter Mark X card in the Terror deck until it is drawn or an effect would discard it. Mark X is Active; the following turn resolves the Killer phase normally. This natural arrival does not reveal the Finale.'},
 {type:'paragraph',text:'Hunter Mark X Terror is a separate forced transition. If Mark V is still active, shut it down immediately, put Bloodlust at the top of its track, drop remaining Parts in its space and transfer the Power/Minor cards as above. If Mark X is absent, discard remaining Countdown tokens, draw a new Setup and place Mark X at the new Killer starting space. Discard remaining Terror cards and reveal the Finale.'},
 {type:'heading',level:3,text:'Retrieving and repairing Parts'},
 {type:'paragraph',text:'During the Action phase, spend 1 Time per Part in your space to retrieve it; you cannot retrieve while moving through. Put it face down in your Backpack. Once Mark V is defeated, spend 1 Time in its space per Part to flip and install it, adding its printed Health to the Ally card. Apply the Bio Tissue bonus when applicable. A blank token is still installed but does not activate Mark V unless a repair bonus grants Health. The first repair that grants Health activates the Ally and makes four cubes available. Later repairs add Health without resetting occupied cubes. Once the Ally loses all Health it is permanently destroyed; it cannot be repaired again. Token values are recorded when revealed, not guessed by the app.'},
 {type:'heading',level:3,text:'Allies and Action cubes'},
 {type:'list',items:[
 'Allies are not Victims. They cannot follow you, carry/use Items, save Victims or lead Victims unless an effect says otherwise.',
 'When you share an Ally’s space and one is attacked, choose which of you receives the attack. Closest-person targeting can target Allies; Victims in their space are targeted first unless an Ally is specifically targeted.',
 'Actions are Action-phase only. The blue Reaction can be used in any phase in response to an attack. Put a cube at the left of that row; an occupied row cannot be used. At Upkeep move each cube right once, returning it when it leaves the last space.',
 ...HUNTER_ACTIONS.map(a=>`${a.name}: ${a.cooldown} cube space${a.cooldown===1?'':'s'}.`),
 'Effects damaging the Final Girl or affecting her movement usually also affect Allies. Use the physical game’s ambiguity rule for exceptions.',
 ]},
 {type:'heading',level:3,text:'Minor Dark Powers'},
 {type:'list',items:HUNTER_MINORS.map(c=>`${c.name} (${c.health} Health) — ${c.effect}`)},
 {type:'heading',level:3,text:'Dark Powers · Mark V / Ally'},
 {type:'list',items:HUNTER_POWERS.map(c=>`${c.name}${c.epic?' (Epic)':''} — ${c.effect}`)},
 {type:'heading',level:3,text:'Finales'},
 {type:'list',items:HUNTER_FINALES.map(c=>`${c.name} — ${c.effect}`)},
 {type:'heading',level:3,text:'Terror cards'},
 {type:'list',items:HUNTER_TERRORS.map(c=>`${c.name}${c.quantity>1?` (×${c.quantity})`:''} — ${c.effect}`)},
 ]};
export const HUNTER_PROMPT_CONTEXT:ModulePromptContext={narrativeGuidance:'Mark V begins as the pursuer. Mark X is a different female android. Only recorded transitions establish shutdown, arrival or repair. Parts, repair and cooldown controls are game metadata, never automatic story events or literal board props. A permanently destroyed Mark V cannot return as an Ally.',visualGuidance:HUNTER_VISUAL+' Mark X has a pale female face, straight dark bob with bangs, black fitted clothing and black boots. Keep her distinct from the hooded Mark V.',rulesSummary:'Mark V loses Cybernetic Parts, not Health. Two Countdown tokens precede the natural Mark X arrival, which leaves Finale unrevealed. The special Terror forces arrival and Finale. Retrieved Parts repair Mark V as an Ally; its four actions have independent cooldowns.'};
