import { describe,it,expect } from 'vitest';
import { FINAL_GIRL_REFERENCES,getFinalGirlReference,observedFinalGirlMaxHealth } from './finalGirlReferences';
import { getFinalGirlHealth,getLegacyFinalGirlHealth } from './finalGirlHealth';
import { playStartingValues } from '@/lib/play/defaults';
import { newPlayEvent,summarizePlay } from '@/lib/play/events';
describe('photographed character references',()=>{
  it('retains all 32 verified characters and the printed health exceptions without card images',()=>{
    expect(FINAL_GIRL_REFERENCES).toHaveLength(32);
    expect(new Set(FINAL_GIRL_REFERENCES.map(g=>g.name)).size).toBe(32);
    for(const girl of FINAL_GIRL_REFERENCES){
      expect(girl.ultimate.length).toBeGreaterThan(30);
      expect(girl.additionalReward).toBeTruthy();
      expect(playStartingValues('Hans',girl.name).finalGirlHealth).toBe(girl.startingHealth);
    }
    expect(['Alice','Nancy','Ellen','Kat','Kate'].map(getFinalGirlHealth)).toEqual([4,4,4,4,4]);
    expect(['Charlie','Barbara','Jenette'].map(getFinalGirlHealth)).toEqual([7,7,7]);
    expect(getFinalGirlReference('Adrianne')?.startingRule).toContain('LOWER');
    expect(getFinalGirlReference('Maureen')?.rescueRewards).toEqual([]);
  });
  it('preserves the visually audited reward and ability exceptions',()=>{
    expect(getFinalGirlReference('Gretel')).toMatchObject({additionalReward:'Reduce Horror by 1'});
    expect(getFinalGirlReference('Gretel')?.ultimate).toContain('blank die');
    expect(getFinalGirlReference('Ava')?.ultimate).toContain('blank die');
    expect(getFinalGirlReference('Red')?.additionalReward).toBe('Recover 2 health');
    expect(getFinalGirlReference('Charlie')?.additionalReward).toBe('Gain 1 Time');
    expect(getFinalGirlReference('Adelaide')?.ultimate).toContain('decrease one type of Wrath to 1; recover all health');
    expect(getFinalGirlReference('Joy')?.ultimate).toContain('health loss');
    expect(getFinalGirlReference('Cassie')?.ultimate).toContain('cannot be used with Reaction cards or if it would take Time below zero');
  });
  it('keeps starting health separate from the observed flip, without healing or changing totals',()=>{
    const start=newPlayEvent({kind:'start',saved:0,killed:0,round:1});
    const health=newPlayEvent({kind:'state',field:'finalGirlHealth',value:1});
    const flip=newPlayEvent({kind:'moment',momentType:'ultimate-unlocked',text:'Ultimate unlocked',permanent:true});
    const log=[start,health,flip];
    expect(observedFinalGirlMaxHealth('Kate',log,4)).toBe(7);
    expect(summarizePlay(log)).toMatchObject({finalGirlHealth:1,saved:0,killed:0});
    expect(observedFinalGirlMaxHealth('Kate',[],4)).toBe(4);
    expect(observedFinalGirlMaxHealth('Kate',log)).toBeUndefined();
    expect(getLegacyFinalGirlHealth('Alice')).toBe(5);
    expect(getLegacyFinalGirlHealth('Kate')).toBe(6);
  });
});
