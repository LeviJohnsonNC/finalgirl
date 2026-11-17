import { describe, expect, it } from 'vitest';
import {
  HOLD_HER_DOWN, RATCHET_HEALTH_STORAGE_MAX, RATCHET_INITIAL, RATCHET_LADY,
  RATCHET_MODULE, RATCHET_TERRORS, ratchetFacts, ratchetLogBelongsTo, ratchetParent,
  resolveRatchetAction, type RatchetCommand,
} from '../../../supabase/functions/_shared/play/ratchetLady';
import { deathFacts } from './death';
import { isPlayEvent, newPlayEvent, summarizePlay, validPlayLog, type PlayEvent } from './events';
import { moduleState } from './modules';

const fields = (log: PlayEvent[]) => moduleState(summarizePlay(log).entries, RATCHET_MODULE);
const record = (command: RatchetCommand, log: PlayEvent[]) => {
  const entries = summarizePlay(log).entries;
  const action = { ...command, parent: ratchetParent(entries) };
  const changes = resolveRatchetAction(action, fields(log), entries);
  if (!changes) throw new Error('Expected a legal Ratchet Lady action');
  return newPlayEvent({ kind:'module', ratchetAction:action, moduleData:{ module:RATCHET_MODULE, changes } });
};
const setup = () => [
  newPlayEvent({kind:'start',saved:0,killed:0,round:1}),
  newPlayEvent({kind:'module',moduleData:{module:RATCHET_MODULE,changes:RATCHET_INITIAL}}),
];

describe('Ratchet Lady', () => {
  it('reconciles sixteen physical faces in the killer Terror deck', () => {
    expect(RATCHET_TERRORS.reduce((total, card) => total + card.quantity, 0)).toBe(16);
    expect(RATCHET_TERRORS.filter(card => card.death)).toHaveLength(5);
  });

  it('records an unknown post-reveal count and restores linked state on Undo', () => {
    const reveal = newPlayEvent({kind:'moment',momentType:'finale',text:'Finale revealed',killerCard:HOLD_HER_DOWN,permanent:true});
    const log = [...setup(), reveal];
    const hold = record({command:'hold',count:null,reveal:reveal.id}, log);
    expect(validPlayLog([...log, hold])).toBe(true);
    expect(fields([...log, hold])).toEqual({calmRemoved:true});
    expect(validPlayLog([...log, hold, {...hold,id:crypto.randomUUID()}])).toBe(false);
    expect(fields([...log,hold,newPlayEvent({kind:'undo',target:hold.id})])).toEqual({maniacs:2});
    expect(summarizePlay([...log,hold]).killed).toBe(0);
  });

  it('preserves the event-time Maniac count for a death through later count edits', () => {
    const scene = { killer:RATCHET_LADY, location:'Falconwood', finalGirl:'Heather' };
    const death = newPlayEvent({kind:'killed',quantity:1,cause:'minion',attacker:'Maniac',ratchetReference:true});
    const log = [...setup(),death];
    const updated = [...log,record({command:'count',count:6},log)];
    const facts = deathFacts(scene, log, death.id);
    expect(facts?.moduleContext?.[RATCHET_MODULE]?.facts).toContain('Maniacs on board: 2.');
    expect(deathFacts(scene, updated, death.id)).toEqual(facts);
    expect(deathFacts({...scene,killer:'Hans'}, updated, death.id)).toBeNull();
    expect(ratchetFacts(fields(updated),0)).toContain('Maniacs on board: 0.');
    expect(ratchetFacts(fields(updated),null)).toContain('Current Maniac count unrecorded.');
  });

  it('allows elevated Health only with Ratchet Lady provenance and storage-safe values', () => {
    const event = newPlayEvent({kind:'state',field:'killerHealth',value:100,ratchetHealth:true});
    expect(validPlayLog([event])).toBe(true);
    expect(ratchetLogBelongsTo(RATCHET_LADY,[event])).toBe(true);
    expect(ratchetLogBelongsTo('Hans',[event])).toBe(false);
    expect(isPlayEvent({...event,ratchetHealth:undefined})).toBe(false);
    expect(isPlayEvent({...event,value:RATCHET_HEALTH_STORAGE_MAX})).toBe(true);
    expect(isPlayEvent({...event,value:RATCHET_HEALTH_STORAGE_MAX+1})).toBe(false);
  });
});
