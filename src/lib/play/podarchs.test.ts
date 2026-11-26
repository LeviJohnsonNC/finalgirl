import { describe, expect, it } from 'vitest';
import { PODARCHS, PODARCH_FINALES, PODARCH_TERRORS, podarchBehavior, podarchOwnsLog } from '../../../supabase/functions/_shared/play/podarchs';
import { eligibleStartingEvent } from '../../../supabase/functions/_shared/play/podarchEvents';
import { newPlayEvent, summarizePlay, validPlayLog } from './events';
import { moduleState, moduleStoryBeats } from './modules';
import { playStartingValues } from './defaults';

describe('Terror From Beyond',()=>{
  it('seeds a healthless killer and preserves Joan across mixed casts',()=>{
    expect(playStartingValues(PODARCHS,'Joan')).toEqual({finalGirlHealth:5,bloodlust:0,finalHorrorLevel:4});
    expect(playStartingValues('Hans','Joan').killerHealth).toBe(12);
    expect([undefined,3,4,10].map(podarchBehavior)).toEqual(['Behavior unrecorded','Docile','Hostile','Hostile']);
    expect(PODARCH_TERRORS.reduce((total,c)=>total+c.quantity,2)).toBe(16);
  });
  it('uses the selected killer and location to identify incompatible Events',()=>{
    expect(eligibleStartingEvent(PODARCHS,'Buddyland','Pizza Delivery')).toBe(false);
    expect(eligibleStartingEvent(PODARCHS,'Falconwood','Pizza Delivery')).toBe(true);
    expect(eligibleStartingEvent('Hans','Buddyland','Pizza Delivery')).toBe(true);
  });
  const start = () => newPlayEvent({kind:'start',round:1,saved:0,killed:0});
  it('records a rescue and a single Minor discard together, restoring both on Undo',()=>{
    const log = [start(), ...['targeted','urgency'].map(id=>newPlayEvent({kind:'module',moduleData:{module:'podarchs',changes:{[id]:'active'}}}))];
    const save=newPlayEvent({kind:'saved',quantity:1,moduleData:{module:'podarchs',changes:{targeted:'removed'}}});
    expect(validPlayLog([...log,save])).toBe(true);
    const resolved = summarizePlay([...log,save]);
    expect(resolved.saved).toBe(1);
    expect(moduleState(resolved.entries,'podarchs')).toEqual({targeted:'removed',urgency:'active'});
    const undone=summarizePlay([...log,save,newPlayEvent({kind:'undo',target:save.id})]);
    expect(moduleState(undone.entries,'podarchs').targeted).toBe('active');
    const reveal=newPlayEvent({kind:'moment',momentType:'finale',killerCard:PODARCH_FINALES[0].name,permanent:true,text:'Finale revealed'});
    expect(moduleState(summarizePlay([...log,reveal]).entries,'podarchs')).toEqual({targeted:'removed',urgency:'removed'});
  });
  it('keeps remembered assimilation separate from casualties and rejects cross-owner logs',()=>{
    const event=newPlayEvent({kind:'module',moduleData:{module:'podarchs',changes:{assimilated:true}}});
    const summary=summarizePlay([start(),event]);
    expect(summary.killed ?? 0).toBe(0);
    expect(summary.saved ?? 0).toBe(0);
    expect(summary.bloodlust).toBeUndefined();
    expect(moduleStoryBeats({killer:PODARCHS,location:'Camp Happy Trails'},summary.entries)).toContain('A Victim was assimilated');
    expect(podarchOwnsLog('Hans',[event])).toBe(false);
    expect(validPlayLog([{...event,moduleData:{module:'podarchs',changes:{countdown:7}}}])).toBe(false);
  });
});
