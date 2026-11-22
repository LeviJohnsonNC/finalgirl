import { describe, expect, it } from 'vitest';
import {
  BIRDS_MODULE, BIRDS_TERRORS, birdsParent, birdsResult, birdsState, initialBirds, resolveBirdsAction,
  type BirdsAction,
} from '../../../supabase/functions/_shared/play/birds';
import { endingFacts } from '../../../supabase/functions/_shared/storyFacts';
import { deathFacts } from './death';
import { decrementPlay, newPlayEvent, summarizePlay, validPlayLog, type PlayEvent } from './events';

const cast={killer:'Birds',location:'Camp Happy Trails',finalGirl:'Melanie'};
const seed=()=>[
  newPlayEvent({kind:'start',saved:0,killed:0,round:1}),
  newPlayEvent({kind:'module',moduleData:{module:BIRDS_MODULE,changes:initialBirds(2)}}),
];
function action(log:PlayEvent[], command:BirdsAction) {
  const entries=summarizePlay(log).entries;
  const changes=resolveBirdsAction({...command,parent:birdsParent(entries,command.command)},entries)!;
  return newPlayEvent({
    ...(command.command==='save'?{kind:'saved' as const,quantity:1}:{kind:'module' as const}),
    birdsAction:{...command,parent:birdsParent(entries,command.command)},moduleData:{module:BIRDS_MODULE,changes},
  });
}

describe('Terror From Above',()=>{
  it('reconciles the 17 supplied Terror cards including Bird Wall',()=>{
    expect(BIRDS_TERRORS.reduce((count,card)=>count+card.quantity,0)).toBe(17);
  });

  it('saves once, rejects stale or forged observations and undoes both projections',()=>{
    const log=seed();
    log.push(action(log,{parent:'root',command:'arrive',trigger:'ultimate'}));
    const saved=action(log,{parent:'root',command:'save'});
    log.push(saved);
    expect(validPlayLog(log)).toBe(true);
    expect(summarizePlay(log).saved).toBe(1);
    expect(birdsState(summarizePlay(log).entries).rescued).toBe(1);
    expect(validPlayLog([...log,{...saved,id:crypto.randomUUID()}])).toBe(false);
    expect(validPlayLog([...log.slice(0,-1),{...saved,moduleData:{module:BIRDS_MODULE,changes:{rescued:2}}}])).toBe(false);
    const undo=decrementPlay(log,'saved')!;
    log.push(newPlayEvent(undo));
    expect(validPlayLog(log)).toBe(true);
    expect(summarizePlay(log).saved).toBe(0);
    expect(birdsState(summarizePlay(log).entries).rescued).toBe(0);
  });

  it('recovers an objective without adding historical saves',()=>{
    const log=seed();
    log.push(action(log,{parent:'root',command:'correct',required:2,rescued:1,arrival:'observed'}));
    expect(validPlayLog(log)).toBe(true);
    expect(birdsState(summarizePlay(log).entries).rescued).toBe(1);
    expect(summarizePlay(log).saved).toBe(0);
  });

  it('removes Bird Wall on the fifth kill and preserves historical death context',()=>{
    const log=seed();
    log.push(action(log,{parent:'root',command:'add-wall'}));
    const deceased=newPlayEvent({kind:'killed',quantity:1,cause:'minion'});
    log.push(deceased);
    for(let i=0;i<5;i++) log.push(action(log,{parent:'root',command:'count-wall'}));
    expect(validPlayLog(log)).toBe(true);
    expect(birdsState(summarizePlay(log).entries).wall).toBe(5);
    expect(deathFacts(cast,log,deceased.id)?.moduleContext?.birds.wall).toBe(0);
    expect(deathFacts({...cast,killer:'Hans'},log,deceased.id)).toBeNull();
    log.push(newPlayEvent({kind:'undo',target:log[log.length-1].id}));
    expect(validPlayLog(log)).toBe(true);
    expect(birdsState(summarizePlay(log).entries).wall).toBe(4);
  });

  it('records off-app outcomes without starting the log and separates overrun from death',()=>{
    const review=birdsResult([],'rescued');
    const log=[action([],{parent:'root',command:'review',review})];
    expect(validPlayLog(log)).toBe(true);
    expect(summarizePlay(log).saved).toBeNull();
    for(const [reason,fate] of [['overrun','unknown'],['overrun-alive','survived'],['died','died']] as const) {
      expect(endingFacts({killer:'Birds',outcome:'lost',finalGirlHealth:0,birdsReview:birdsResult([],reason)}))
        .toContain(`Final Girl fate: ${fate}`);
    }
  });
});
