import { useMemo } from 'react';
import { GameResult } from './useGameHistory';
import { computeArchetype } from './useArchetypeScoring';
import { GameRecord, buildGameRecord } from '@/lib/gameRecord';

export interface FinalGirlStats {
  name: string;
  plays: number;
  wins: number;
  winRate: number;
  totalSaved: number;
  totalKilled: number;
}

export interface KillerStats {
  name: string;
  plays: number;
  wins: number;
  winRate: number;
  avgVictimsSaved: number | null;
  avgVictimsKilled: number | null;
}

export interface LocationStats {
  name: string;
  plays: number;
  wins: number;
  winRate: number;
  totalSaved: number;
  totalKilled: number;
}

export type PlayerArchetype = 'protector' | 'duelist' | 'survivor' | 'gambler' | 'newcomer';

export interface ComputedStats {
  // Record Jacket
  gamesPlayed: number;
  winRate: number;
  totalVictimsSaved: number;
  totalVictimsKilled: number;
  
  // Trends
  /** Win/loss split, streaks, and recent form — see src/lib/gameRecord.ts. */
  record: GameRecord;
  
  // Narrative Stats - Killers & Locations
  nemesis: { killer: string; losses: number } | null;
  usualSuspect: { killer: string; wins: number } | null;
  cursedSite: { location: string; losses: number } | null;
  homeTurf: { location: string; wins: number } | null;
  
  // Narrative Stats - Final Girls
  comfortZone: { finalGirl: string; wins: number } | null;
  cursedPick: { finalGirl: string; losses: number } | null;
  grinder: { finalGirl: string; plays: number } | null;
  lostCause: { finalGirl: string; winRate: number; plays: number } | null;
  
  // Breakdowns
  byFinalGirl: FinalGirlStats[];
  byKiller: KillerStats[];
  byLocation: LocationStats[];
  
  // Archetype
  playerArchetype: PlayerArchetype;
  archetypeReason: string;
  archetypeProfile: string;
}

export const useGameStats = (gameHistory: GameResult[]): ComputedStats => {
  return useMemo(() => {
    const filteredGames = [...gameHistory];

    const wins = filteredGames.filter(g => g.outcome === 'won');
    const gamesPlayed = filteredGames.length;
    const winRate = gamesPlayed > 0 ? (wins.length / gamesPlayed) * 100 : 0;

    // Victims
    const totalVictimsSaved = filteredGames.reduce((sum, g) => sum + (g.victimsSaved || 0), 0);
    const totalVictimsKilled = filteredGames.reduce((sum, g) => sum + (g.victimsKilled || 0), 0);

    // By Killer - for nemesis and usual suspect
    const killerMap = new Map<string, GameResult[]>();
    filteredGames.forEach(g => {
      const games = killerMap.get(g.killer) || [];
      games.push(g);
      killerMap.set(g.killer, games);
    });
    
    // Find nemesis (killer with most wins against you - most losses)
    let nemesisKiller: string | null = null;
    let nemesisLosses = 0;
    // Find usual suspect (killer you've beaten most)
    let usualSuspectKiller: string | null = null;
    let usualSuspectWins = 0;
    
    killerMap.forEach((games, killer) => {
      const killerLosses = games.filter(g => g.outcome === 'lost').length;
      const killerWins = games.filter(g => g.outcome === 'won').length;
      if (killerLosses > nemesisLosses) {
        nemesisLosses = killerLosses;
        nemesisKiller = killer;
      }
      if (killerWins > usualSuspectWins) {
        usualSuspectWins = killerWins;
        usualSuspectKiller = killer;
      }
    });

    const byKiller: KillerStats[] = Array.from(killerMap.entries()).map(([name, games]) => {
      const kWins = games.filter(g => g.outcome === 'won');
      const gamesWithVictims = games.filter(g => g.victimsSaved != null || g.victimsKilled != null);
      
      return {
        name,
        plays: games.length,
        wins: kWins.length,
        winRate: (kWins.length / games.length) * 100,
        avgVictimsSaved: gamesWithVictims.length > 0
          ? gamesWithVictims.reduce((sum, g) => sum + (g.victimsSaved || 0), 0) / gamesWithVictims.length
          : null,
        avgVictimsKilled: gamesWithVictims.length > 0
          ? gamesWithVictims.reduce((sum, g) => sum + (g.victimsKilled || 0), 0) / gamesWithVictims.length
          : null,
      };
    }).sort((a, b) => b.plays - a.plays);

    // By Location - for cursed site and home turf
    const locationMap = new Map<string, GameResult[]>();
    filteredGames.forEach(g => {
      const games = locationMap.get(g.location) || [];
      games.push(g);
      locationMap.set(g.location, games);
    });

    // Find cursed site (location with most losses)
    let cursedSiteLocation: string | null = null;
    let cursedSiteLosses = 0;
    // Find home turf (location with most wins)
    let homeTurfLocation: string | null = null;
    let homeTurfWins = 0;

    locationMap.forEach((games, location) => {
      const locationLosses = games.filter(g => g.outcome === 'lost').length;
      const locationWins = games.filter(g => g.outcome === 'won').length;
      if (locationLosses > cursedSiteLosses) {
        cursedSiteLosses = locationLosses;
        cursedSiteLocation = location;
      }
      if (locationWins > homeTurfWins) {
        homeTurfWins = locationWins;
        homeTurfLocation = location;
      }
    });

    const byLocation: LocationStats[] = Array.from(locationMap.entries()).map(([name, games]) => {
      const lWins = games.filter(g => g.outcome === 'won');
      
      return {
        name,
        plays: games.length,
        wins: lWins.length,
        winRate: (lWins.length / games.length) * 100,
        totalSaved: games.reduce((sum, g) => sum + (g.victimsSaved || 0), 0),
        totalKilled: games.reduce((sum, g) => sum + (g.victimsKilled || 0), 0),
      };
    }).sort((a, b) => b.plays - a.plays);

    // By Final Girl
    const finalGirlMap = new Map<string, GameResult[]>();
    filteredGames.forEach(g => {
      const games = finalGirlMap.get(g.finalGirl) || [];
      games.push(g);
      finalGirlMap.set(g.finalGirl, games);
    });
    const byFinalGirl: FinalGirlStats[] = Array.from(finalGirlMap.entries()).map(([name, games]) => {
      const fgWins = games.filter(g => g.outcome === 'won');
      
      return {
        name,
        plays: games.length,
        wins: fgWins.length,
        winRate: (fgWins.length / games.length) * 100,
        totalSaved: games.reduce((sum, g) => sum + (g.victimsSaved || 0), 0),
        totalKilled: games.reduce((sum, g) => sum + (g.victimsKilled || 0), 0),
      };
    }).sort((a, b) => b.plays - a.plays);

    // Final Girl narrative stats
    let comfortZoneGirl: string | null = null;
    let comfortZoneWins = 0;
    let cursedPickGirl: string | null = null;
    let cursedPickLosses = 0;
    let grinderGirl: string | null = null;
    let grinderPlays = 0;
    let lostCauseGirl: string | null = null;
    let lostCauseWinRate = Infinity;
    let lostCausePlays = 0;

    finalGirlMap.forEach((games, girl) => {
      const girlWins = games.filter(g => g.outcome === 'won').length;
      const girlLosses = games.filter(g => g.outcome === 'lost').length;
      const girlPlays = games.length;
      const girlWinRate = girlPlays > 0 ? (girlWins / girlPlays) * 100 : 0;

      if (girlWins > comfortZoneWins) {
        comfortZoneWins = girlWins;
        comfortZoneGirl = girl;
      }
      if (girlLosses > cursedPickLosses) {
        cursedPickLosses = girlLosses;
        cursedPickGirl = girl;
      }
      if (girlPlays > grinderPlays) {
        grinderPlays = girlPlays;
        grinderGirl = girl;
      }
      if (girlPlays >= 3 && girlWinRate < lostCauseWinRate) {
        lostCauseWinRate = girlWinRate;
        lostCausePlays = girlPlays;
        lostCauseGirl = girl;
      }
    });

    // Player Archetype (scoring-based)
    const narrativeCtx = {
      nemesis: nemesisKiller && nemesisLosses >= 2 ? { killer: nemesisKiller, losses: nemesisLosses } : null,
      usualSuspect: usualSuspectKiller && usualSuspectWins >= 2 ? { killer: usualSuspectKiller, wins: usualSuspectWins } : null,
      cursedSite: cursedSiteLocation && cursedSiteLosses >= 2 ? { location: cursedSiteLocation, losses: cursedSiteLosses } : null,
      homeTurf: homeTurfLocation && homeTurfWins >= 2 ? { location: homeTurfLocation, wins: homeTurfWins } : null,
      comfortZone: comfortZoneGirl && comfortZoneWins >= 2 ? { finalGirl: comfortZoneGirl, wins: comfortZoneWins } : null,
      grinder: grinderGirl && grinderPlays >= 2 ? { finalGirl: grinderGirl, plays: grinderPlays } : null,
    };
    const { archetype: playerArchetype, reason: archetypeReason, profile: archetypeProfile } = computeArchetype(
      filteredGames,
      wins,
      winRate,
      totalVictimsSaved,
      totalVictimsKilled,
      narrativeCtx,
    );

    return {
      gamesPlayed,
      winRate,
      totalVictimsSaved,
      totalVictimsKilled,
      record: buildGameRecord(filteredGames),
      nemesis: nemesisKiller && nemesisLosses >= 2 ? { killer: nemesisKiller, losses: nemesisLosses } : null,
      usualSuspect: usualSuspectKiller && usualSuspectWins >= 2 ? { killer: usualSuspectKiller, wins: usualSuspectWins } : null,
      cursedSite: cursedSiteLocation && cursedSiteLosses >= 2 ? { location: cursedSiteLocation, losses: cursedSiteLosses } : null,
      homeTurf: homeTurfLocation && homeTurfWins >= 2 ? { location: homeTurfLocation, wins: homeTurfWins } : null,
      comfortZone: comfortZoneGirl && comfortZoneWins >= 2 ? { finalGirl: comfortZoneGirl, wins: comfortZoneWins } : null,
      cursedPick: cursedPickGirl && cursedPickLosses >= 2 ? { finalGirl: cursedPickGirl, losses: cursedPickLosses } : null,
      grinder: grinderGirl && grinderPlays >= 2 ? { finalGirl: grinderGirl, plays: grinderPlays } : null,
      lostCause: lostCauseGirl ? { finalGirl: lostCauseGirl, winRate: lostCauseWinRate, plays: lostCausePlays } : null,
      byFinalGirl,
      byKiller,
      byLocation,
      playerArchetype,
      archetypeReason,
      archetypeProfile,
    };
  }, [gameHistory]);
};
