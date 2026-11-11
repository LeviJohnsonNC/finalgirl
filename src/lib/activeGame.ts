import {MALL,MALL_MODULE,initialMall} from './play/sunnydaze';
import { WINGARD, WINGARD_MODULE } from '../../supabase/functions/_shared/play/wingardCatalog';
import { initialWingard } from '../../supabase/functions/_shared/play/wingardCottage';
import { WOODS, WOODS_MODULE, initialWoods } from "../../supabase/functions/_shared/play/storybookWoods";
import { FALCONWOOD, FALCONWOOD_MODULE, initialFalconwood, missionByName } from "../../supabase/functions/_shared/play/falconwood";
import { validPlayLog, validPlayDetails, type PlayEvent, type PlayDetails } from './play/events';
import type { GameResult } from '@/hooks/useGameHistory';

export interface GameSelection {
  killer: string; location: string; finalGirl: string;
  setupScenario: string | null; startingEvent: string | null; mission: string | null;
  filmId: string | null;
  finalGirlStartingHealth?: number;
}
export interface EndingFormData {
  falconwoodReview?: import("../../supabase/functions/_shared/play/falconwood").FalconwoodReview;
  slayerReview?: import("./play/slayer").SlayerReview;
  childrenOnBoardAtFinish?: number|null;
  tormentorReview?:{loss:import('../../supabase/functions/_shared/play/tormentor').TormentorLoss};
  grimlashReview?: {loss:import('../../supabase/functions/_shared/play/grimlash').GrimlashLoss};
  organismLoss?: "caught"|"assimilated";
  outcome?: "won"|"lost";
  konradReview?: {fate: import("../../supabase/functions/_shared/play/konrad").KonradFate};
  poltergeistReview?: {carolynRescued:true|null;floppyAtEscape:true|null;epicRequired:boolean|null;escapeRoute?:'exit'|'helicopter'|null};
  finalHorrorLevel?: number | null; finalGirlHealth?: number | null; killerHealth?: number | null;
  weaponUsed: string; victimsSaved: number | null; victimsKilled: number | null;
  roundsPlayed?: number | null;
  endingSubLocation: string; gameHighlights: string;
}
export interface ActiveGame {
  /** New sessions initialize the always-visible core trackers once on first Play entry. */
  coreTrackersVersion?: 1;
  woodsSetupVersion?: 1;
  marrekSetupVersion?: 1;
  wingardSetupVersion?: 1;
  tormentorSetupVersion?: 1;
  wolfSetupVersion?: 1;
  stationSetupVersion?: 1;
  organismSetupVersion?: 1;
  intrudersSetupVersion?: 1;
  mallSetupVersion?:1;
  falconwoodSetupVersion?: 1;
  slayerSetupVersion?: 1;
  hunterSetupVersion?: 1;
  shadySetupVersion?: 1;
  grimlashSetupVersion?: 1;
  evomorphSetupVersion?: 1;
  konradSetupVersion?: 1;
  creechSetupVersion?: 1;
  poltergeistSetupVersion?: 1;
  grovesSetupVersion?: 1;
  inkanyambaSetupVersion?: 1;
  mapleSetupVersion?: 1;
  frightSetupVersion?: 1;
  /** Marks new sessions whose verified standard Gepetto tray may be seeded once. */
  geppettoSetupVersion?: 1;
  billySetupVersion?: 1;
  carnivalSetupVersion?: 1;
  version: 1;
  playEvents?: PlayEvent[];
  playMode?: boolean;
  showDeathPanel?: boolean;
  playDrafts?: Record<string, PlayDetails>;
  id: string;
  selection: GameSelection;
  phase: 'nowPlaying' | 'outcome' | 'ending';
  introStory?: string; sceneImageUrl?: string; visualBible?: string;
  result?: GameResult;
  formDraft?: Record<string, unknown>;
  formData?: EndingFormData;
  endingStory?: string; posterImageUrl?: string;
  endingRevision?: string;
  endingNeedsRefresh?: boolean;
}
export function isActiveGame(value: unknown): value is ActiveGame {
  if (!value || typeof value !== 'object') return false;
  const game = value as ActiveGame;
  if(game.mallSetupVersion!==undefined&&(game.mallSetupVersion!==1||game.selection?.location!==MALL))return false;
  if(game.playEvents?.some(e=>(e.mallReference||e.moduleData?.module===MALL_MODULE)&&game.selection?.location!==MALL||e.moduleData?.module===MALL_MODULE&&!e.mallAction&&(game.mallSetupVersion!==1||e.moduleData.changes.snapshot!==initialMall(game.selection?.startingEvent).snapshot)))return false;
  if(game.coreTrackersVersion!==undefined&&game.coreTrackersVersion!==1)return false;
  if (game.woodsSetupVersion !== undefined && (game.woodsSetupVersion !== 1 || game.selection?.location !== WOODS)) return false;
  if (Array.isArray(game.playEvents) && game.playEvents.some(event =>
    (event?.woodsReference || event?.moduleData?.module === WOODS_MODULE) && game.selection?.location !== WOODS ||
    event?.moduleData?.module === WOODS_MODULE && !event.woodsAction &&
      (game.woodsSetupVersion !== 1 || initialWoods(game.selection?.startingEvent)?.snapshot !== event.moduleData.changes?.snapshot))) return false;
  if(game.wingardSetupVersion!==undefined && (game.wingardSetupVersion!==1 || game.selection?.location!==WINGARD))return false;
  if(Array.isArray(game.playEvents) && game.playEvents.some(event=>
    (event?.wingardReference || event?.moduleData?.module===WINGARD_MODULE) && game.selection?.location!==WINGARD ||
    event?.moduleData?.module===WINGARD_MODULE && !event.wingardAction &&
    (game.wingardSetupVersion!==1 || event.moduleData.changes?.snapshot!==initialWingard(game.selection?.startingEvent).snapshot)
  ))return false;
  if(game.marrekSetupVersion!==undefined&&game.marrekSetupVersion!==1)return false;
  if(game.selection?.location!=='Marrek Warehouse'&&Array.isArray(game.playEvents)&&game.playEvents.some(e=>e.moduleData?.module==='marrek'))return false;
  if(Array.isArray(game.playEvents)&&game.playEvents.some(e=>e.moduleData?.module==='hunter'&&!e.hunterAction)&&game.hunterSetupVersion!==1)return false;
  if (game.falconwoodSetupVersion !== undefined && (game.falconwoodSetupVersion !== 1 || game.selection?.location !== FALCONWOOD || !missionByName(game.selection?.mission))) return false;
  if (Array.isArray(game.playEvents) && game.playEvents.some(event =>
    (event?.falconwoodReference || event?.moduleData?.module === FALCONWOOD_MODULE) && game.selection?.location !== FALCONWOOD ||
    event?.moduleData?.module === FALCONWOOD_MODULE && (event.falconwoodAction
      ? !!missionByName(game.selection?.mission) && event.falconwoodAction.mission !== missionByName(game.selection?.mission)?.id
      : game.falconwoodSetupVersion !== 1 || event.moduleData.changes?.snapshot !== initialFalconwood(game.selection?.mission, game.selection?.startingEvent)?.snapshot)
  )) return false;
  if (game.slayerSetupVersion !== undefined && (game.slayerSetupVersion !== 1 || game.selection?.killer !== "Slayer")) return false;
  if (Array.isArray(game.playEvents) && game.playEvents.some(e =>
    (e.moduleData?.module === "slayer" || e.slayerReference) && game.selection?.killer !== "Slayer" ||
    e.moduleData?.module === "slayer" && !e.slayerAction && game.slayerSetupVersion !== 1)) return false;
  if(game.hunterSetupVersion!==undefined&&(game.hunterSetupVersion!==1||game.selection?.killer!=='The Hunter'))return false;
  if(game.selection?.killer!=='The Hunter'&&Array.isArray(game.playEvents)&&game.playEvents.some(e=>e.moduleData?.module==='hunter'||e.hunterReference))return false;
  if (game.stationSetupVersion !== undefined && (game.stationSetupVersion !== 1 || game.selection?.location !== 'Station 2891')) return false;
  if (Array.isArray(game.playEvents) && game.playEvents.some(event =>
    ((event?.stationReference || event?.moduleData?.module === 'station-2891') && game.selection?.location !== 'Station 2891') ||
    (event?.moduleData?.module === 'station-2891' && !event.stationAction && game.stationSetupVersion !== 1))) return false;
  if (game.organismSetupVersion!==undefined&&(game.organismSetupVersion!==1||game.selection?.killer!=="The Organism")) return false;
  if (Array.isArray(game.playEvents)&&game.playEvents.some(event=>
    ((event?.organismReference||event?.moduleData?.module==="organism")&&game.selection?.killer!=="The Organism")||
    (event?.moduleData?.module==="organism"&&!event.organismAction&&game.organismSetupVersion!==1))) return false;
  if (game.intrudersSetupVersion !== undefined && (game.intrudersSetupVersion !== 1 || game.selection?.killer !== "The Intruders")) return false;
  if (game.wolfSetupVersion !== undefined && (game.wolfSetupVersion !== 1 || game.selection?.killer !== "Big Bad Wolf")) return false;
  if (game.selection?.killer !== "Big Bad Wolf" && Array.isArray(game.playEvents) && game.playEvents.some(e => e?.moduleData?.module === "big-bad-wolf" || e?.wolfReference)) return false;
  if(game.tormentorSetupVersion!==undefined&&game.tormentorSetupVersion!==1)return false;
  if(game.selection?.killer!=='The Tormentor'&&game.playEvents?.some(e=>e.moduleData?.module==='tormentor'))return false;
  if(game.shadySetupVersion!==undefined&&game.shadySetupVersion!==1)return false;
  if(game.selection?.location!=='Shady Acres'&&game.playEvents?.some(e=>e.moduleData?.module==='shady-acres'))return false;
  if(game.grimlashSetupVersion!==undefined&&game.grimlashSetupVersion!==1)return false;
  if(game.selection?.killer!=='Grimlash'&&game.playEvents?.some(e=>e.moduleData?.module==='grimlash'))return false;
  if(game.konradSetupVersion!==undefined&&game.konradSetupVersion!==1)return false;
  if(game.selection?.location!=="USS Konrad"&&game.playEvents?.some(e=>e.moduleData?.module==="konrad"))return false;
  if(game.evomorphSetupVersion!==undefined&&game.evomorphSetupVersion!==1)return false;
  if(game.creechSetupVersion!==undefined&&game.creechSetupVersion!==1)return false;
  if(game.poltergeistSetupVersion!==undefined && game.poltergeistSetupVersion!==1)return false;
  if (game.grovesSetupVersion !== undefined && game.grovesSetupVersion !== 1) return false;
  if (game.inkanyambaSetupVersion !== undefined && game.inkanyambaSetupVersion !== 1) return false;
  if (game.mapleSetupVersion !== undefined && game.mapleSetupVersion !== 1) return false;
  if (game.frightSetupVersion !== undefined && game.frightSetupVersion !== 1) return false;
  if (game.billySetupVersion !== undefined && game.billySetupVersion !== 1) return false;
  if (game.carnivalSetupVersion !== undefined && game.carnivalSetupVersion !== 1) return false;
  if (game.geppettoSetupVersion !== undefined && game.geppettoSetupVersion !== 1) return false;
  if (game.selection?.finalGirlStartingHealth !== undefined && (!Number.isInteger(game.selection.finalGirlStartingHealth) || game.selection.finalGirlStartingHealth < 1 || game.selection.finalGirlStartingHealth > 10)) return false;
  if (game.playEvents !== undefined && !validPlayLog(game.playEvents)) return false;
  if(game.selection?.killer !== 'Evomorph' && game.playEvents?.some(e=>e.moduleData?.module==='evomorph'))return false;
  if (game.playDrafts !== undefined && (!game.playDrafts || typeof game.playDrafts !== 'object' || Array.isArray(game.playDrafts) || Object.keys(game.playDrafts).length > 1000 || !Object.values(game.playDrafts).every(validPlayDetails))) return false;
  if (game.showDeathPanel !== undefined && typeof game.showDeathPanel !== 'boolean') return false;
  if (game.playMode !== undefined && typeof game.playMode !== 'boolean') return false;
  const textFields = [game.introStory, game.sceneImageUrl, game.visualBible, game.endingStory, game.posterImageUrl, game.endingRevision];
  if (game.endingNeedsRefresh !== undefined && typeof game.endingNeedsRefresh !== "boolean") return false;
  if (!textFields.every(field => field === undefined || typeof field === 'string')) return false;
  if (game.formDraft && (typeof game.formDraft !== 'object' || Array.isArray(game.formDraft) || !Object.values(game.formDraft).every(field => field === null || ['string', 'number', 'boolean'].includes(typeof field)))) return false;
  if (game.phase === 'ending' && !game.formData) return false;
  return game.version === 1 && typeof game.id === 'string' &&
    Boolean(game.selection && typeof game.selection.killer === 'string' &&
      typeof game.selection.location === 'string' && typeof game.selection.finalGirl === 'string') &&
    ['nowPlaying', 'outcome', 'ending'].includes(game.phase) &&
    (game.phase === 'nowPlaying' || Boolean(game.result?.id));
}
