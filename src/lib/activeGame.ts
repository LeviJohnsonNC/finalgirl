import { validPlayLog, validPlayDetails, type PlayEvent, type PlayDetails } from './play/events';
import type { GameResult } from '@/hooks/useGameHistory';

export interface GameSelection {
  killer: string; location: string; finalGirl: string;
  setupScenario: string | null; startingEvent: string | null; mission: string | null;
  filmId: string | null;
  finalGirlStartingHealth?: number;
}
export interface EndingFormData {
  finalHorrorLevel?: number; finalGirlHealth?: number; killerHealth?: number;
  weaponUsed: string; victimsSaved: number | null; victimsKilled: number | null;
  roundsPlayed?: number | null;
  endingSubLocation: string; gameHighlights: string;
}
export interface ActiveGame {
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
  if (game.selection?.finalGirlStartingHealth !== undefined && (!Number.isInteger(game.selection.finalGirlStartingHealth) || game.selection.finalGirlStartingHealth < 1 || game.selection.finalGirlStartingHealth > 10)) return false;
  if (game.playEvents !== undefined && !validPlayLog(game.playEvents)) return false;
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
