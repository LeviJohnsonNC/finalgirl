import {MALL,MALL_MODULE,initialMall,resolveMallAction,mallParent} from '@/lib/play/sunnydaze';
import { FALCONWOOD, FALCONWOOD_MODULE, initialFalconwood, falconwoodParent, missionByName, resolveFalconwoodAction } from "../../supabase/functions/_shared/play/falconwood";
import { ORGANISM, ORGANISM_MODULE, ORGANISM_MAX_BLOODLUST, initialOrganism, organismParent, resolveOrganismAction, sameOrganismChanges } from "@/lib/play/organism";
import { SLAYER, SLAYER_MODULE, initialSlayer, resolveSlayerAction, slayerParent } from "@/lib/play/slayer";
import { HUNTER, HUNTER_MODULE, initialHunter, resolveHunterAction, hunterParent, hunterState } from '@/lib/play/hunter';
import { canUndoHunter, sameHunterChanges } from '@/lib/play/events';
import { WINGARD, WINGARD_MODULE } from '../../supabase/functions/_shared/play/wingardCatalog';
import { initialWingard, resolveWingardAction, wingardParent } from '../../supabase/functions/_shared/play/wingardCottage';
import { WOODS, WOODS_MODULE, initialWoods, resolveWoodsAction, woodsParent } from "../../supabase/functions/_shared/play/storybookWoods";
import { INTRUDERS, INTRUDER_MODULE, initialIntruders, intruderParent, resolveIntruderAction, sameIntruderChanges } from "@/lib/play/intruders";
import { canUndoIntruder, validIntruderHistory } from "@/lib/play/events";
import { WOLF } from '@/lib/play/bigBadWolf';
import {marrekParent,resolveMarrekAction} from '@/lib/play/marrekWarehouse';
import {tormentorParent,resolveTormentorAction} from '@/lib/play/tormentor';
import {shadyParent,resolveShadyAction} from '@/lib/play/shadyAcres';
import { grimlashParent, resolveGrimlashAction } from '@/lib/play/grimlash';
import { konradParent, resolveKonradAction } from '../../supabase/functions/_shared/play/konrad';
import { evomorphParent, resolveEvomorphAction } from '../../supabase/functions/_shared/play/evomorph';
import { poltergeistParent, resolvePoltergeistAction } from '../../supabase/functions/_shared/play/poltergeist';
import { resolveGrovesAction } from "../../supabase/functions/_shared/play/groves";
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { readStoredValue, useLocalStorage } from './useLocalStorage';
import { validPlayLog, canUndoFalconwood, canUndoWingard, canUndoMarrek, canUndoTormentor, canUndoShady, canUndoGrimlash, canUndoKonrad, canUndoEvomorph, canChangeDeathCount, isPlayEvent, isPermanentMoment, newPlayEvent, summarizePlay, type PlayEvent } from '@/lib/play/events';
import { ActiveGame, isActiveGame } from '@/lib/activeGame';
import { resolveCreechAction } from '../../supabase/functions/_shared/play/creech';
import { mapleLinkedChange } from '../../supabase/functions/_shared/play/maple';
import { initialModuleObservations, moduleState } from '@/lib/play/modules';
import { frightState, parseFright, initialFright, validFrightSuccessor } from '../../supabase/functions/_shared/play/fright';
import { discardedGamesKey, isGameDiscarded } from '@/lib/discardedGames';
import { playStartingValues } from '@/lib/play/defaults';

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
      if(event.kind==='undo'&&!canUndoWingard(log,event.target!))return previous;
      if((event.moduleData?.module===MALL_MODULE&&(!event.mallAction||previous.selection.location!==MALL))||(event.mallReference&&previous.selection.location!==MALL))return previous;
      const isFalconwood = previous.selection.location === FALCONWOOD;
      if (event.moduleData?.module === FALCONWOOD_MODULE && (!isFalconwood || !event.falconwoodAction) || event.falconwoodReference && !isFalconwood) return previous;
      if (event.falconwoodAction && missionByName(previous.selection.mission) && event.falconwoodAction.mission !== missionByName(previous.selection.mission)?.id) return previous;
      if (event.kind === "undo" && !canUndoFalconwood(log, event.target!)) return previous;
      if(event.moduleData?.module===WINGARD_MODULE && (previous.selection.location!==WINGARD || !event.wingardAction))return previous;
      if(event.wingardReference && previous.selection.location!==WINGARD)return previous;
      if(event.kind==='undo'&&!canUndoMarrek(log,event.target!))return previous;
      if (event.moduleData?.module === WOODS_MODULE && (previous.selection.location !== WOODS || !event.woodsAction)) return previous;
      if (event.woodsReference && previous.selection.location !== WOODS) return previous;
      if(event.moduleData?.module==='marrek'&&(previous.selection.location!=='Marrek Warehouse'||!event.marrekAction))return previous;
      if(previous.selection.location==='Marrek Warehouse'&&event.tormentorAction&&['exit','clear-exit'].includes(event.tormentorAction.command))return previous;
      if(event.kind==='undo'&&!canUndoTormentor(log,event.target!))return previous;
      if(event.moduleData?.module==='tormentor'&&(previous.selection.killer!=='The Tormentor'||!event.tormentorAction))return previous;
      if(event.kind==='undo'&&!canUndoShady(log,event.target!))return previous;
      if(event.moduleData?.module==='shady-acres'&&(previous.selection.location!=='Shady Acres'||!event.shadyAction))return previous;
      if(event.kind==='undo'&&!canUndoGrimlash(log,event.target!))return previous;
      if(event.moduleData?.module==='grimlash'&&(previous.selection.killer!=='Grimlash'||!event.grimlashAction))return previous;
      if(event.kind==='undo'&&!canUndoKonrad(log,event.target!))return previous;
      if(event.moduleData?.module==='konrad'&&(previous.selection.location!=='USS Konrad'||!event.konradAction))return previous;
      if(event.kind==='undo'&&!canUndoEvomorph(log,event.target!))return previous;
      if (event.kind === 'death-count' && !canChangeDeathCount(log, event)) return previous;
      const isOrganism = previous.selection.killer===ORGANISM;
      if((event.moduleData?.module===ORGANISM_MODULE&&(!isOrganism||!event.organismAction))||(event.organismReference&&!isOrganism)) return previous;
      if(isOrganism&&((event.kind==="state"&&(event.field==="killerHealth"||event.field==="bloodlust"&&typeof event.value==="number"&&event.value>ORGANISM_MAX_BLOODLUST))||
        event.kind==="moment"&&["killer-revived","dark-power"].includes(event.momentType??""))) return previous;
      const isSlayer = previous.selection.killer === SLAYER;
      if ((event.moduleData?.module === SLAYER_MODULE && (!isSlayer || !event.slayerAction)) || (event.slayerReference && !isSlayer)) return previous;
      const isHunter=previous.selection.killer===HUNTER;
      if(event.moduleData?.module===HUNTER_MODULE&&(!isHunter||!event.hunterAction))return previous;
      if(event.hunterReference&&!isHunter)return previous;
      if(isHunter&&['mark-v','countdown'].includes(hunterState(moduleState(summarizePlay(log).entries,HUNTER_MODULE)).phase)&&((event.kind==='state'&&event.field==='killerHealth')||(event.kind==='moment'&&event.momentType==='killer-revived')))return previous;
      if(event.kind==='undo'&&!canUndoHunter(log,event.target!))return previous;
      const isIntruders=previous.selection.killer===INTRUDERS;
      if (event.intruderReference && !isIntruders) return previous;
      if (event.moduleData?.module===INTRUDER_MODULE && (!isIntruders || !event.intruderAction)) return previous;
      if (isIntruders && event.kind==='undo' && !canUndoIntruder(log,event.target!)) return previous;
      if (isIntruders && (event.kind==='state' && event.field==='killerHealth' ||
          event.kind==='moment' && event.momentType==='killer-revived')) return previous;
      if (isIntruders && event.kind==='state' && event.field==='bloodlust' && typeof event.value==='number' && event.value>10) return previous;
      const isWolf = previous.selection.killer === WOLF;
      if (!isWolf && (event.moduleData?.module === "big-bad-wolf" || event.wolfReference)) return previous;
      if (event.moduleData?.module === "big-bad-wolf") {
        const state = moduleState(summarizePlay(log).entries, "big-bad-wolf");
        const changes = event.moduleData.changes;
        if (changes.mode === "track" && state.powerRevealed) return previous;
        if (Object.entries(changes).every(([key, value]) => state[key] === (value ?? undefined))) return previous;
      }
      let accepted = event.kind === "killed"
        ? {...event,...(isOrganism && {organismReference:true as const}),...(isSlayer && {slayerReference:true as const}),...(isHunter && {hunterReference:true as const}),...(isIntruders && {intruderReference:true as const}),...(isWolf && {wolfReference:true as const}),...(previous.selection.location === WOODS && {woodsReference:true as const})}
        : event;
      if(event.kind==='killed'&&previous.selection.location===MALL)accepted={...accepted,mallReference:true};
      if (event.kind === "killed" && isFalconwood) accepted = {...accepted, falconwoodReference: true};
      if(event.kind==='killed' && previous.selection.location===WINGARD)accepted={...accepted,wingardReference:true};
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
        ? initialModuleObservations(previous.selection, previous.geppettoSetupVersion === 1, previous.carnivalSetupVersion === 1, previous.billySetupVersion === 1, previous.mapleSetupVersion === 1, previous.inkanyambaSetupVersion === 1, previous.grovesSetupVersion === 1, previous.poltergeistSetupVersion === 1, previous.creechSetupVersion === 1, previous.evomorphSetupVersion === 1, previous.konradSetupVersion === 1, previous.grimlashSetupVersion === 1, previous.shadySetupVersion === 1, previous.tormentorSetupVersion === 1, previous.marrekSetupVersion === 1).map(moduleData => newPlayEvent({ kind: 'module', moduleData }))
        : [];
      if (log.length === 0 && previous.woodsSetupVersion === 1 && previous.selection.location === WOODS) {
        const changes = initialWoods(previous.selection.startingEvent);
        if (changes) setup.push(newPlayEvent({kind:"module",moduleData:{module:WOODS_MODULE,changes}}));
      }
      if(log.length===0 && previous.wingardSetupVersion===1 && previous.selection.location===WINGARD) {
        setup.push(newPlayEvent({kind:'module',moduleData:{module:WINGARD_MODULE,changes:initialWingard(previous.selection.startingEvent)}}));
      }
      // Only genuinely new sessions get starting tracker observations. Include
      // them in the first durable write; legacy unknowns and Undo stay unknown.
      const freshWolf = isWolf && previous.wolfSetupVersion === 1;
      if (log.length === 0 && freshWolf) {
        setup.push(newPlayEvent({ kind: "module", moduleData: { module: "big-bad-wolf", changes: { mode: "track" } } }));
      }
      if(!log.length&&previous.mallSetupVersion===1&&previous.selection.location===MALL)setup.push(newPlayEvent({kind:'module',moduleData:{module:MALL_MODULE,changes:initialMall(previous.selection.startingEvent)}}));
      const freshFalconwood = isFalconwood && previous.falconwoodSetupVersion === 1;
      const falconwoodSetup = !log.length && freshFalconwood && initialFalconwood(previous.selection.mission, previous.selection.startingEvent);
      if (falconwoodSetup) setup.push(newPlayEvent({kind:"module", moduleData:{module:FALCONWOOD_MODULE, changes:falconwoodSetup}}));
      const freshSlayer = isSlayer && previous.slayerSetupVersion === 1;
      if (!log.length && freshSlayer) setup.push(newPlayEvent({kind:"module", moduleData:{module:SLAYER_MODULE, changes:initialSlayer()}}));
      const freshHunter=isHunter&&previous.hunterSetupVersion===1;
      if(!log.length&&freshHunter)setup.push(newPlayEvent({kind:'module',moduleData:{module:HUNTER_MODULE,changes:initialHunter()}}));
      const freshOrganism=isOrganism&&previous.organismSetupVersion===1;
      if(!log.length&&freshOrganism) setup.push(newPlayEvent({kind:"module",moduleData:{module:ORGANISM_MODULE,changes:initialOrganism()}}));
      const freshIntruders=isIntruders && previous.intrudersSetupVersion===1;
      if (!log.length && freshIntruders) setup.push(newPlayEvent({kind:'module',moduleData:{module:INTRUDER_MODULE,changes:initialIntruders()}}));
      if (log.length === 0 && (!isIntruders||freshIntruders) && (!isOrganism||freshOrganism) && previous.coreTrackersVersion === 1 && (!isWolf || freshWolf) && (!isHunter || freshHunter) && (!isSlayer || freshSlayer)) {
        const values = playStartingValues(previous.selection.killer, previous.selection.finalGirl);
        values.finalGirlHealth = previous.selection.finalGirlStartingHealth ?? values.finalGirlHealth;
        for (const field of ['finalGirlHealth', 'killerHealth', 'bloodlust', 'finalHorrorLevel'] as const) {
          const value = values[field];
          if (value !== undefined) setup.unshift(newPlayEvent({kind:'state',field,value}));
        }
      }
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
      if (event.woodsAction) {
        const entries = summarizePlay([...log,...baseline,...setup]).entries;
        const action = log.length === 0 && event.woodsAction.parent === "root"
          ? {...event.woodsAction,parent:woodsParent(entries)} : event.woodsAction;
        const changes = resolveWoodsAction(action,moduleState(entries,WOODS_MODULE),entries);
        if (!changes) return previous;
        accepted = {...event,woodsAction:action,moduleData:{module:WOODS_MODULE,changes}};
      }
      if(event.wingardAction) {
        const entries=summarizePlay([...log,...baseline,...setup]).entries;
        const action=log.length===0 && event.wingardAction.parent==='root' ? {...event.wingardAction,parent:wingardParent(entries)} : event.wingardAction;
        const changes=resolveWingardAction(action,moduleState(entries,WINGARD_MODULE),entries);
        if(!changes)return previous;
        accepted={...event,wingardAction:action,moduleData:{module:WINGARD_MODULE,changes}};
      }
      if(event.marrekAction){const entries=summarizePlay([...log,...baseline,...setup]).entries;const request=log.length===0&&event.marrekAction.parent==='root'?{...event.marrekAction,parent:marrekParent(entries)}:event.marrekAction;const changes=resolveMarrekAction(request,moduleState(entries,'marrek'),entries);if(!changes)return previous;accepted={...event,marrekAction:request,moduleData:{module:'marrek',changes}};}
      if(event.shadyAction){const entries=summarizePlay([...log,...baseline,...setup]).entries;const request=log.length===0&&event.shadyAction.parent==='root'?{...event.shadyAction,parent:shadyParent(entries)}:event.shadyAction;const changes=resolveShadyAction(request,moduleState(entries,'shady-acres'),entries);if(!changes)return previous;accepted={...event,shadyAction:request,moduleData:{module:'shady-acres',changes}};}
      if(event.grimlashAction) {const entries=summarizePlay([...log,...baseline,...setup]).entries;const request=log.length===0&&event.grimlashAction.parent==='root'?{...event.grimlashAction,parent:grimlashParent(entries)}:event.grimlashAction;const changes=resolveGrimlashAction(request,moduleState(entries,'grimlash'),entries);if(!changes)return previous;accepted={...event,grimlashAction:request,moduleData:{module:'grimlash',changes}};}
      if(event.tormentorAction){const entries=summarizePlay([...log,...baseline,...setup]).entries;const request=log.length===0&&event.tormentorAction.parent==='root'?{...event.tormentorAction,parent:tormentorParent(entries)}:event.tormentorAction;const changes=resolveTormentorAction(request,moduleState(entries,'tormentor'),entries);if(!changes)return previous;accepted={...event,tormentorAction:request,moduleData:{module:'tormentor',changes}};}
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
      if(event.mallAction){const entries=summarizePlay([...log,...baseline,...setup]).entries;const action=!log.length&&previous.mallSetupVersion===1&&event.mallAction.parent==='root'?{...event.mallAction,parent:mallParent(entries)}:event.mallAction;const changes=resolveMallAction(action,moduleState(entries,MALL_MODULE),entries);if(!changes||(log.length&&!sameHunterChanges(changes,event.moduleData!.changes)))return previous;accepted={...event,mallAction:action,moduleData:{module:MALL_MODULE,changes}};}
      if (event.falconwoodAction) {
        const entries = summarizePlay([...log, ...baseline, ...setup]).entries;
        const action = falconwoodSetup && event.falconwoodAction.parent === "root"
          ? {...event.falconwoodAction, parent:falconwoodParent(entries)} : event.falconwoodAction;
        const changes = resolveFalconwoodAction(action, moduleState(entries, FALCONWOOD_MODULE), entries);
        if (!changes || changes.snapshot !== event.moduleData!.changes.snapshot) return previous;
        accepted = {...event, falconwoodAction:action, moduleData:{module:FALCONWOOD_MODULE,changes}};
      }
      if (event.slayerAction) {
        const entries = summarizePlay([...log, ...baseline, ...setup]).entries;
        const action = !log.length && freshSlayer && event.slayerAction.parent === "root"
          ? {...event.slayerAction, parent: slayerParent(entries)} : event.slayerAction;
        const changes = resolveSlayerAction(action, moduleState(entries, SLAYER_MODULE), entries);
        if (!changes || (log.length && changes.snapshot !== event.moduleData!.changes.snapshot)) return previous;
        accepted = {...event, slayerAction: action, moduleData:{module: SLAYER_MODULE, changes}};
      }
      if(event.hunterAction) {
        const entries=summarizePlay([...log,...baseline,...setup]).entries;
        const action=!log.length&&freshHunter&&event.hunterAction.parent==='root'?{...event.hunterAction,parent:hunterParent(entries)}:event.hunterAction;
        const changes=resolveHunterAction(action,moduleState(entries,HUNTER_MODULE),entries);
        if(!changes||(log.length&&!sameHunterChanges(changes,event.moduleData!.changes)))return previous;
        accepted={...event,hunterAction:action,moduleData:{module:HUNTER_MODULE,changes}};
      }
      if(event.organismAction) {
        const entries=summarizePlay([...log,...baseline,...setup]).entries;
        const action=!log.length&&freshOrganism&&event.organismAction.parent==="root"
          ? {...event.organismAction,parent:organismParent(entries)} : event.organismAction;
        const changes=resolveOrganismAction(action,moduleState(entries,ORGANISM_MODULE),entries);
        if(!changes||(log.length&&!sameOrganismChanges(changes,event.moduleData!.changes))) return previous;
        accepted={...accepted,organismAction:action,moduleData:{module:ORGANISM_MODULE,changes}};
      }
      if (event.intruderAction) {
        const entries=summarizePlay([...log,...baseline,...setup]).entries;
        const action=!log.length && freshIntruders && event.intruderAction.parent==='root'
          ? {...event.intruderAction,parent:intruderParent(entries)} : event.intruderAction;
        const changes=resolveIntruderAction(action,moduleState(entries,INTRUDER_MODULE),entries);
        if (!changes || (log.length && !sameIntruderChanges(changes,event.moduleData!.changes))) return previous;
        accepted={...event,intruderAction:action,moduleData:{module:INTRUDER_MODULE,changes}};
      }
      const additions = event.kind === 'start' ? [accepted, ...setup] : [...baseline, ...setup, ...reveal, accepted];
      if (log.length + additions.length > 1000) return previous;
      if (isIntruders && event.kind==='restore' && !validIntruderHistory([...log,...additions])) return previous;
      if ((event.moduleData?.module === WOODS_MODULE || event.kind === "undo" || event.kind === "restore") &&
          previous.selection.location === WOODS && !validPlayLog([...log,...additions])) return previous;
      if([...log,...additions].some(e=>e.moduleData?.module==='marrek'||e.moduleData?.module===WINGARD_MODULE)&&!validPlayLog([...log,...additions]))return previous;
      if([...log,...additions].some(e=>e.moduleData?.module==='tormentor')&&!validPlayLog([...log,...additions]))return previous;
      if([...log,...additions].some(e=>e.moduleData?.module==='shady-acres')&&!validPlayLog([...log,...additions]))return previous;
      if([...log,...additions].some(e=>e.moduleData?.module==='grimlash')&&!validPlayLog([...log,...additions]))return previous;
      if((event.konradAction||event.kind==='undo'||event.kind==='restore')&&[...log,...additions].some(e=>e.moduleData?.module==='konrad')&&!validPlayLog([...log,...additions]))return previous;
      if(previous.selection.location===MALL&&!validPlayLog([...log,...additions]))return previous;
      if (isFalconwood && !validPlayLog([...log, ...additions])) return previous;
      if (isOrganism && !validPlayLog([...log,...additions])) return previous;
      if (isSlayer && !validPlayLog([...log, ...additions])) return previous;
      if(isHunter&&!validPlayLog([...log,...additions]))return previous;
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
