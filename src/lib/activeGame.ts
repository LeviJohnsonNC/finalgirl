import { validPlayLog, validPlayDetails, type PlayEvent, type PlayDetails } from './play/events';
import type { GameResult } from '@/hooks/useGameHistory';

export interface GameSelection {
  killer: string; location: string; finalGirl: string;
  setupScenario: string | null; startingEvent: string | null; mission: string | null;
  filmId: string | null;
  finalGirlStartingHealth?: number;
}
export interface EndingFormData {
  childrenOnBoardAtFinish?: number|null;
  tormentorReview?:{loss:import('../../supabase/functions/_shared/play/tormentor').TormentorLoss};
  grimlashReview?: {loss:import('../../supabase/functions/_shared/play/grimlash').GrimlashLoss};
  outcome?: "won"|"lost";
  konradReview?: {fate: import("../../supabase/functions/_shared/play/konrad").KonradFate};
  poltergeistReview?: {carolynRescued:true|null;floppyAtEscape:true|null;epicRequired:boolean|null;escapeRoute?:'exit'|'helicopter'|null};
  finalHorrorLevel?: number; finalGirlHealth?: number; killerHealth?: number;
  weaponUsed: string; victimsSaved: number | null; victimsKilled: number | null;
  roundsPlayed?: number | null;
  endingSubLocation: string; gameHighlights: string;
}
export interface ActiveGame {
  marrekSetupVersion?: 1;
  tormentorSetupVersion?: 1;
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
}
export function isActiveGame(value: unknown): value is ActiveGame {
  if (!value || typeof value !== 'object') return false;
  const game = value as ActiveGame;
  if(game.marrekSetupVersion!==undefined&&game.marrekSetupVersion!==1)return false;
  if(game.selection?.location!=='Marrek Warehouse'&&Array.isArray(game.playEvents)&&game.playEvents.some(e=>e.moduleData?.module==='marrek'))return false;
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
  const textFields = [game.introStory, game.sceneImageUrl, game.visualBible, game.endingStory, game.posterImageUrl];
  if (!textFields.every(field => field === undefined || typeof field === 'string')) return false;
  if (game.formDraft && (typeof game.formDraft !== 'object' || Array.isArray(game.formDraft) || !Object.values(game.formDraft).every(field => field === null || ['string', 'number', 'boolean'].includes(typeof field)))) return false;
  if (game.phase === 'ending' && !game.formData) return false;
  return game.version === 1 && typeof game.id === 'string' &&
    Boolean(game.selection && typeof game.selection.killer === 'string' &&
      typeof game.selection.location === 'string' && typeof game.selection.finalGirl === 'string') &&
    ['nowPlaying', 'outcome', 'ending'].includes(game.phase) &&
    (game.phase === 'nowPlaying' || Boolean(game.result?.id));
}
