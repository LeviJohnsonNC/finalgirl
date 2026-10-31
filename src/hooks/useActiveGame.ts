import { grimlashParent, resolveGrimlashAction } from '@/lib/play/grimlash';
import { konradParent, resolveKonradAction } from '../../supabase/functions/_shared/play/konrad';
import { evomorphParent, resolveEvomorphAction } from '../../supabase/functions/_shared/play/evomorph';
import { poltergeistParent, resolvePoltergeistAction } from '../../supabase/functions/_shared/play/poltergeist';
import { resolveGrovesAction } from "../../supabase/functions/_shared/play/groves";
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { readStoredValue, useLocalStorage } from './useLocalStorage';
import { validPlayLog, canUndoGrimlash, canUndoKonrad, canUndoEvomorph, canChangeDeathCount, isPlayEvent, isPermanentMoment, newPlayEvent, summarizePlay, type PlayEvent } from '@/lib/play/events';
import { ActiveGame, isActiveGame } from '@/lib/activeGame';
import { resolveCreechAction } from '../../supabase/functions/_shared/play/creech';
import { mapleLinkedChange } from '../../supabase/functions/_shared/play/maple';
import { initialModuleObservations, moduleState } from '@/lib/play/modules';
import { frightState, parseFright, initialFright, validFrightSuccessor } from '../../supabase/functions/_shared/play/fright';
import { discardedGamesKey, isGameDiscarded } from '@/lib/discardedGames';

export function useActiveGame() {
  const { user, isAuthReady } = useAuth();
  const key = `final-girl-active-game-v1:${user?.id ?? 'guest'}`;
  const owner = user?.id ?? 'guest';
  useLocalStorage(discardedGamesKey(owner), {});
  const [stored, setStored] = useLocalStorage<ActiveGame | null>(key, null);
  const activeGame = isAuthReady && isActiveGame(stored) && !isGameDiscarded(owner, stored.id) ? stored : null;
  const save = useCallback((game: ActiveGame | null) => {
    if (game && isGameDiscarded(owner, game.id)) return false;
    const ok = setStored(game);
    if (!ok) toast.error('This device could not save your game progress. Free browser storage and try again.');
    return ok;
  }, [setStored, owner]);
  const checkpoint = useCallback((id: string, updates: Partial<ActiveGame>) => {
    if (isGameDiscarded(owner, id)) return false;
    const ok = setStored(previous => previous?.id === id ? { ...previous, ...updates, ...(updates.playDrafts && {playDrafts: {...previous.playDrafts, ...updates.playDrafts}}), id, version: 1 } : previous);
    if (!ok) toast.error('Your latest progress could not be saved on this device. Please keep this page open.');
    return ok;
  }, [setStored, owner]);
  const updateFormDraft = useCallback((id: string, fields: Record<string, unknown>) => {
    if (isGameDiscarded(owner, id)) return false;
    const ok = setStored(previous => previous?.id === id ? { ...previous, formDraft: { ...previous.formDraft, ...fields } } : previous);
    if (!ok) toast.error('This device could not save the form. Free browser storage and try again.');
    return ok;
  }, [setStored, owner]);
  const appendPlayEvent = useCallback((id: string, event: PlayEvent) => {
    if (isGameDiscarded(owner, id)) return false;
    if (!isPlayEvent(event)) return false;
    let applied = false;
    const ok = setStored(previous => {
      if (previous?.id !== id || (previous.playEvents?.length ?? 0) >= 1000 || previous.playEvents?.some(e => e.id === event.id)) return previous;
      if (event.kind === 'start' && summarizePlay(previous.playEvents).tracked) return previous;
      // Shared reveal controls can be reached from two places. The durable log
      // owns uniqueness, including two taps arriving before React renders.
      if (isPermanentMoment(event) && summarizePlay(previous.playEvents).entries.some(entry => entry.kind === 'moment' && entry.momentType === event.momentType)) return previous;
      const log = previous.playEvents ?? [];
      if(event.kind==='undo'&&!canUndoGrimlash(log,event.target!))return previous;
      if(event.moduleData?.module==='grimlash'&&(previous.selection.killer!=='Grimlash'||!event.grimlashAction))return previous;
      if(event.kind==='undo'&&!canUndoKonrad(log,event.target!))return previous;
      if(event.moduleData?.module==='konrad'&&(previous.selection.location!=='USS Konrad'||!event.konradAction))return previous;
      if(event.kind==='undo'&&!canUndoEvomorph(log,event.target!))return previous;
      if (event.kind === 'death-count' && !canChangeDeathCount(log, event)) return previous;
      let accepted = event;
      if(previous.selection.killer==='Poltergeist' && ((event.kind==='state'&&event.field==='killerHealth') || (event.kind==='moment'&&event.momentType==='killer-revived'))) return previous;
      if (event.moduleData?.module === 'groves' && previous.selection.location !== 'Sacred Groves') return previous;
      if (event.linkedModule && !(event.moduleData?.module==='groves'&&previous.selection.location==='Sacred Groves'&&previous.selection.killer==='Inkanyamba') && !(event.moduleData?.module==='creech'&&previous.selection.location==='Creech Manor'&&previous.selection.killer==='Poltergeist')) return previous;
      if(event.moduleData?.module==='creech'&&(previous.selection.location!=='Creech Manor'||!event.creechAction||event.creechAction.parent!==(log[log.length-1]?.id??'root')))return previous;
      if (event.grovesAction && event.grovesAction.parent !== (log[log.length-1]?.id ?? 'root')) return previous;
      if (previous.selection.location === 'Sacred Groves' && event.kind === 'moment' && event.momentType === 'finale') accepted = {...accepted, grovesReference:true};
      if (previous.selection.killer === "Inkanyamba" && event.kind === "moment" && ["dark-power", "finale"].includes(event.momentType!)) accepted = {...accepted, inkanyambaReference:true};
      if (event.moduleData?.module === 'inkanyamba') {
        if (previous.selection.killer !== 'Inkanyamba') return previous;
        const state = moduleState(summarizePlay(log).entries, 'inkanyamba');
        const changes = event.moduleData.changes;
        if (changes.miracleResolved === true && (state.miracleResolved === true || state.finale !== 'we-need-a-miracle' || changes.wrath !== 10)) return previous;
        if (Object.entries(changes).every(([key,value]) => value === null ? state[key] === undefined : state[key] === value)) return previous;
      }
      if (event.moduleData?.module === 'maple' && previous.selection.location !== 'Maple Lane') return previous;
      if (event.moduleData?.module === 'fright') {
        const snapshot=parseFright(event.moduleData.changes.snapshot);
        if (previous.selection.killer !== 'Dr. Fright' || !snapshot || snapshot.parent !== (frightState(summarizePlay(log).entries)?.eventId ?? 'root') || !validFrightSuccessor(snapshot,log,summarizePlay(log).entries)) return previous;
      }
      // A tap arriving before the entry effect still gets a durable baseline.
      const baseline = event.kind !== 'start' && !summarizePlay(log).tracked
        ? [newPlayEvent({ kind: 'start', saved: 0, killed: 0, round: 1 })] : [];
      // Persist setup and the first tap together. Never backfill an existing log:
      // a player may already have resolved, cleared or undone the starting state.
      const setup = log.length === 0
        ? initialModuleObservations(previous.selection, previous.geppettoSetupVersion === 1, previous.carnivalSetupVersion === 1, previous.billySetupVersion === 1, previous.mapleSetupVersion === 1, previous.inkanyambaSetupVersion === 1, previous.grovesSetupVersion === 1, previous.poltergeistSetupVersion === 1, previous.creechSetupVersion === 1, previous.evomorphSetupVersion === 1, previous.konradSetupVersion === 1, previous.grimlashSetupVersion === 1).map(moduleData => newPlayEvent({ kind: 'module', moduleData }))
        : [];
      if (log.length === 0 && previous.frightSetupVersion === 1 && previous.selection.killer === 'Dr. Fright' && event.moduleData?.module !== 'fright') setup.unshift(newPlayEvent({kind:'module',moduleData:{module:'fright',changes:{snapshot:JSON.stringify(initialFright())}}}));
      if (event.moduleData?.module === 'maple') {
        if (previous.selection.location !== 'Maple Lane') return previous;
        const current=moduleState(summarizePlay([...log,...baseline,...setup]).entries,'maple');
        const changes=mapleLinkedChange(current,event.moduleData.changes);
        if(Object.entries(changes).every(([key,value])=>value === null ? current[key] === undefined : current[key] === value)) return previous;
        accepted={...event,moduleData:{module:'maple',changes}};
        if (!isPlayEvent(accepted)) return previous;
      }
      if (event.grovesAction) {
        const entries=summarizePlay([...log,...baseline,...setup]).entries;
        const result=resolveGrovesAction(event.grovesAction,moduleState(entries,'groves'),moduleState(entries,'inkanyamba'),previous.selection.killer);
        if(!result) return previous;
        accepted={...event,moduleData:{module:'groves',changes:result.changes},...(result.linkedModule ? {linkedModule:result.linkedModule} : {})};
        if(!result.linkedModule) delete accepted.linkedModule;
        if(!isPlayEvent(accepted)) return previous;
      }
      if(event.moduleData?.module === 'groves' && !event.grovesAction) {
        const current=moduleState(summarizePlay([...log,...baseline,...setup]).entries,'groves');
        if(Object.entries(event.moduleData.changes).every(([k,v])=>v === null ? current[k] === undefined : current[k] === v)) return previous;
      }
      if(event.creechAction) {
        const entries=summarizePlay([...log,...baseline,...setup]).entries;
        const result=resolveCreechAction(event.creechAction,moduleState(entries,'creech'),moduleState(entries,'poltergeist'),previous.selection.killer);
        if(!result)return previous;
        accepted={...event,moduleData:{module:'creech',changes:result.changes},...(result.linkedModule?{linkedModule:result.linkedModule}:{})};
        if(!result.linkedModule)delete accepted.linkedModule;
        if(!isPlayEvent(accepted))return previous;
      }
      if(event.moduleData?.module==='poltergeist') {
        if(previous.selection.killer!=='Poltergeist'||!event.poltergeistAction)return previous;
        const entries=summarizePlay([...log,...baseline,...setup]).entries;
        const request=log.length===0 && event.poltergeistAction.parent==='root' ? {...event.poltergeistAction,parent:poltergeistParent(entries)} : event.poltergeistAction;
        const changes=resolvePoltergeistAction(request,moduleState(entries,'poltergeist'),entries);
        if(!changes)return previous;
        accepted={...event,poltergeistAction:request,moduleData:{module:'poltergeist',changes}};
      }
      if(event.konradAction) {
        const entries=summarizePlay([...log,...baseline,...setup]).entries;
        const request=log.length===0&&event.konradAction.parent==='root'?{...event.konradAction,parent:konradParent(entries)}:event.konradAction;
        const changes=resolveKonradAction(request,moduleState(entries,'konrad'),entries);
        if(!changes)return previous;
        accepted={...event,konradAction:request,moduleData:{module:'konrad',changes}};
      }
      if(event.grimlashAction) {const entries=summarizePlay([...log,...baseline,...setup]).entries;const request=log.length===0&&event.grimlashAction.parent==='root'?{...event.grimlashAction,parent:grimlashParent(entries)}:event.grimlashAction;const changes=resolveGrimlashAction(request,moduleState(entries,'grimlash'),entries);if(!changes)return previous;accepted={...event,grimlashAction:request,moduleData:{module:'grimlash',changes}};}
      const reveal:PlayEvent[]=[];
      if(event.moduleData?.module==='evomorph') {
        if(previous.selection.killer!=='Evomorph'||!event.evomorphAction)return previous;
        const entries=summarizePlay([...log,...baseline,...setup]).entries;
        const request=log.length===0 && event.evomorphAction.parent==='root' ? {...event.evomorphAction,parent:evomorphParent(entries)} : event.evomorphAction;
        const changes=resolveEvomorphAction(request,moduleState(entries,'evomorph'),entries);
        if(!changes)return previous;
        accepted={...event,evomorphAction:request,moduleData:{module:'evomorph',changes}};
        if(request.command==='evolve'&&changes.stage==='adult'&&!entries.some(e=>e.kind==='moment'&&e.momentType==='dark-power'))reveal.push(newPlayEvent({kind:'moment',momentType:'dark-power',permanent:true,text:'Dark Power revealed'}));
      }
      const additions = event.kind === 'start' ? [accepted, ...setup] : [...baseline, ...setup, ...reveal, accepted];
      if (log.length + additions.length > 1000) return previous;
      if([...log,...additions].some(e=>e.moduleData?.module==='grimlash')&&!validPlayLog([...log,...additions]))return previous;
      if((event.konradAction||event.kind==='undo'||event.kind==='restore')&&[...log,...additions].some(e=>e.moduleData?.module==='konrad')&&!validPlayLog([...log,...additions]))return previous;
      applied = true;
      return { ...previous, playEvents: [...log, ...additions] };
    });
    if (!ok) toast.error('This change could not be saved. Free device storage and try again.');
    return ok && applied;
  }, [setStored, owner]);
  const getCurrentGame = useCallback(() => {
    const current = readStoredValue<ActiveGame | null>(key, null);
    return isActiveGame(current) && !isGameDiscarded(owner, current.id) ? current : null;
  }, [key, owner]);
  return { activeGame, save, checkpoint, updateFormDraft, appendPlayEvent, getCurrentGame };
}
