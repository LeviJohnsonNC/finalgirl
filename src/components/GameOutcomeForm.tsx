import { useState, useMemo } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { GameResult } from '@/hooks/useGameHistory';
import { EndingFormData } from '@/pages/TheEnd';
import { getFinalGirlMaxHealth } from '@/data/finalGirlHealth';
import { getKillerMaxHealth, isKillerUnkillable } from '@/data/killerHealth';

interface GameOutcomeFormProps {
  result: GameResult;
  introStory?: string;
  initialDraft?: Record<string, unknown>;
  onDraftChange?: (fields: Record<string, unknown>) => boolean;
  onSaveResult?: (formData: EndingFormData) => void;
  onContinue: (formData: EndingFormData) => void;
  onDiscard: () => void;
}

function useDraftField<T>(name: string, fallback: T, draft?: Record<string, unknown>, onChange?: (fields: Record<string, unknown>) => boolean) {
  const [value, setValue] = useState<T>(() => (draft?.[name] as T | undefined) ?? fallback);
  const set = (next: T) => {
    if (onChange?.({ [name]: next }) !== false) setValue(next);
  };
  return [value, set] as const;
}

export const GameOutcomeForm = ({
  result, initialDraft, onDraftChange, onSaveResult,
  introStory,
  onContinue,
  onDiscard,
}: GameOutcomeFormProps) => {
  const isWin = result.outcome === 'won';
  
  // Get the Final Girl's max health based on character data
  const maxFinalGirlHealth = useMemo(() => getFinalGirlMaxHealth(result.finalGirl), [result.finalGirl]);
  // Get killer-specific HP and flags
  const maxKillerHealth = useMemo(() => getKillerMaxHealth(result.killer), [result.killer]);
  const killerIsUnkillable = useMemo(() => isKillerUnkillable(result.killer), [result.killer]);
  const isPoltergeist = result.killer === 'Poltergeist';
  const isOrganism = result.killer === 'The Organism';
  const isEvomorph = result.killer === 'Evomorph';
  const isRatchetLady = result.killer === 'Ratchet Lady';
  const isBigBadWolf = result.killer === 'Big Bad Wolf';
  const isIntruders = result.killer === 'The Intruders';
  const isBilly = result.killer === 'Billy the Bear';
  const isGrimlash = result.killer === 'Grimlash';
  const isBerith = result.killer === 'Berith' || result.location === "L'Armes Abbey";
  const isShriek = result.killer === 'Mort the Teenage Dirtbag' || result.location === 'MegaBGCon';
  const isFalconwood = result.location === 'Falconwood';
  const isSlayer = result.killer === 'Slayer';
  
  // Local form state - use character-specific max health for defaults
  const [finalHorrorLevel, setFinalHorrorLevel] = useDraftField('finalHorrorLevel', result.finalHorrorLevel ?? 4, initialDraft, onDraftChange);
  const [finalGirlHealth, setFinalGirlHealth] = useDraftField('finalGirlHealth', result.finalGirlHealth ?? (isWin ? maxFinalGirlHealth : 0), initialDraft, onDraftChange);
  const [killerHealth, setKillerHealth] = useDraftField('killerHealth', result.killerHealth ?? (isWin ? 0 : Math.ceil(maxKillerHealth / 2)), initialDraft, onDraftChange);
  const [weaponUsed, setWeaponUsed] = useDraftField('weaponUsed', result.weaponUsed ?? '', initialDraft, onDraftChange);
  const [victimsSaved, setVictimsSaved] = useDraftField('victimsSaved', result.victimsSaved ?? 0, initialDraft, onDraftChange);
  const [victimsKilled, setVictimsKilled] = useDraftField('victimsKilled', result.victimsKilled ?? 0, initialDraft, onDraftChange);
  const [endingSubLocation, setEndingSubLocation] = useDraftField('endingSubLocation', result.endingSubLocation ?? '', initialDraft, onDraftChange);
  const [gameHighlights, setGameHighlights] = useDraftField('gameHighlights', result.gameHighlights ?? '', initialDraft, onDraftChange);
  // Poltergeist-specific win condition fields
  const [foundCarolyn, setFoundCarolyn] = useDraftField('foundCarolyn', false, initialDraft, onDraftChange);
  const [foundMrFloppy, setFoundMrFloppy] = useDraftField('foundMrFloppy', false, initialDraft, onDraftChange);
  // Organism-specific loss type
  const [organismLossType, setOrganismLossType] = useDraftField<'caught' | 'assimilated'>('organismLossType', 'caught', initialDraft, onDraftChange);
  // Evomorph evolution stage
  const [evomorphStage, setEvomorphStage] = useDraftField<'Hatchling' | 'Youngling' | 'Adult'>('evomorphStage', 'Hatchling', initialDraft, onDraftChange);
  // Ratchet Lady maniac count
  const [maniacCount, setManiacCount] = useDraftField('maniacCount', 0, initialDraft, onDraftChange);
  // Big Bad Wolf mode
  const [wolfMode, setWolfMode] = useDraftField<'TRACK' | 'SLAY' | 'Killing Machine'>('wolfMode', 'SLAY', initialDraft, onDraftChange);
  // The Intruders - active killer at game end
  const [activeIntruder, setActiveIntruder] = useDraftField<'Trish' | 'Baghead' | 'Zeke'>('activeIntruder', 'Trish', initialDraft, onDraftChange);
  // Buddyland - Buddies + power supplies
  const [buddiesInPlay, setBuddiesInPlay] = useDraftField<number | null>('buddiesInPlay', null, initialDraft, onDraftChange);
  const [powerSuppliesShutDown, setPowerSuppliesShutDown] = useDraftField('powerSuppliesShutDown', false, initialDraft, onDraftChange);
  const [billyFinale, setBillyFinale] = useDraftField('billyFinale', '', initialDraft, onDraftChange);
  const [borisStatus, setBorisStatus] = useDraftField('borisStatus', '', initialDraft, onDraftChange);
  // Grimlash / A Rotten Harvest
  const [childrenSurvived, setChildrenSurvived] = useDraftField('childrenSurvived', 0, initialDraft, onDraftChange);
  const [harvestMadnessPeaked, setHarvestMadnessPeaked] = useDraftField('harvestMadnessPeaked', false, initialDraft, onDraftChange);
  // Berith / A Demon in the Shadows
  const [ursulaSaved, setUrsulaSaved] = useDraftField('ursulaSaved', false, initialDraft, onDraftChange);
  const [abbeyInfluence, setAbbeyInfluence] = useDraftField<'Blessings Dominated' | 'Curses Dominated' | 'Balanced'>('abbeyInfluence', 'Balanced', initialDraft, onDraftChange);
  // Shriek / MegaBGCon
  const [mortRevealed, setMortRevealed] = useDraftField('mortRevealed', false, initialDraft, onDraftChange);
  const [finalKillerIdentity, setFinalKillerIdentity] = useDraftField('finalKillerIdentity', 'Unknown', initialDraft, onDraftChange);
  // Falconwood / Slayer
  const [missionCompleted, setMissionCompleted] = useDraftField('missionCompleted', isWin, initialDraft, onDraftChange);
  const [missionProgress, setMissionProgress] = useDraftField('missionProgress', '', initialDraft, onDraftChange);
  const [friendJoined, setFriendJoined] = useDraftField('friendJoined', '', initialDraft, onDraftChange);
  const [endingDimension, setEndingDimension] = useDraftField<'Our Dimension' | 'Mirror Dimension'>('endingDimension', 'Our Dimension', initialDraft, onDraftChange);

  const buildFormData = (): EndingFormData => {
    // Augment gameHighlights with killer-specific conditions so the LLM gets full context
    let highlights = gameHighlights || '';
    if (isPoltergeist && isWin) {
      const parts = [];
      if (foundCarolyn) parts.push('Found Carolyn');
      if (foundMrFloppy) parts.push('Recovered Mr. Floppy');
      if (parts.length > 0) {
        highlights = highlights ? `${highlights}. Win condition: ${parts.join(', ')}` : `Win condition: ${parts.join(', ')}`;
      }
    }
    if (isOrganism && !isWin && organismLossType === 'assimilated') {
      highlights = highlights
        ? `${highlights}. Loss type: Assimilation (Horror Track exceeded 6 — Final Girl was absorbed into the Organism)`
        : 'Loss type: Assimilation (Horror Track exceeded 6 — Final Girl was absorbed into the Organism)';
    }
    if (isEvomorph) {
      highlights = highlights
        ? `${highlights}. Evomorph stage reached: ${evomorphStage}`
        : `Evomorph stage reached: ${evomorphStage}`;
    }
    if (isRatchetLady) {
      highlights = highlights
        ? `${highlights}. Maniacs on board at end: ${maniacCount}`
        : `Maniacs on board at end: ${maniacCount}`;
    }
    if (isBigBadWolf) {
      highlights = highlights
        ? `${highlights}. Wolf mode at end: ${wolfMode}`
        : `Wolf mode at end: ${wolfMode}`;
    }
    if (isIntruders) {
      highlights = highlights
        ? `${highlights}. Active Intruder at end: ${activeIntruder}`
        : `Active Intruder at end: ${activeIntruder}`;
    }
    if (isBilly) {
      const buddyParts: string[] = [];
      if (buddiesInPlay !== null) buddyParts.push(`Buddies in play at end: ${buddiesInPlay}`);
      if (powerSuppliesShutDown) buddyParts.push('All Power Sources Inactive');
      if (billyFinale) buddyParts.push(`Billy Finale: ${billyFinale}`);
      if (billyFinale === 'Power Surge') buddyParts.push(`Boris: ${borisStatus || 'fate not recorded'}`);
      if (buddyParts.length) highlights = highlights ? `${highlights}. ${buddyParts.join('. ')}` : buddyParts.join('. ');
    }
    if (isGrimlash) {
      const harvestParts = [`Children survived: ${childrenSurvived}`];
      if (harvestMadnessPeaked) harvestParts.push('Harvest Madness peaked');
      highlights = highlights ? `${highlights}. ${harvestParts.join('. ')}` : harvestParts.join('. ');
    }
    if (isBerith) {
      const demonParts: string[] = [];
      if (isWin && ursulaSaved) demonParts.push('Ursula saved');
      demonParts.push(`L'Armes Abbey influence: ${abbeyInfluence}`);
      highlights = highlights ? `${highlights}. ${demonParts.join('. ')}` : demonParts.join('. ');
    }
    if (isShriek) {
      const shriekParts = [`Final killer identity: ${finalKillerIdentity}`];
      shriekParts.push(mortRevealed ? 'Mort was revealed' : 'Mort remained hidden');
      highlights = highlights ? `${highlights}. ${shriekParts.join('. ')}` : shriekParts.join('. ');
    }
    if (isFalconwood) {
      const falconParts: string[] = [];
      if (result.mission) falconParts.push(`Mission: ${result.mission}`);
      if (missionCompleted) {
        falconParts.push('Mission completed — the killer could finally be finished');
        if (friendJoined.trim()) falconParts.push(`Friend who joined the fight: ${friendJoined.trim()}`);
      } else {
        falconParts.push('Mission NOT completed — the killer could not be finished');
        if (missionProgress.trim()) falconParts.push(`Mission progress: ${missionProgress.trim()}`);
      }
      highlights = highlights ? `${highlights}. ${falconParts.join('. ')}` : falconParts.join('. ');
    }
    if (isSlayer) {
      const dimensionPart = `Ended in: ${endingDimension}`;
      highlights = highlights ? `${highlights}. ${dimensionPart}` : dimensionPart;
    }



    const formData: EndingFormData = {
      finalHorrorLevel,
      finalGirlHealth,
      killerHealth: killerIsUnkillable ? 0 : killerHealth,
      weaponUsed: weaponUsed || '',
      victimsSaved,
      victimsKilled,
      endingSubLocation: endingSubLocation || '',
      gameHighlights: highlights,
    };
    return formData;
  };
  const handleContinue = () => onContinue(buildFormData());

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-5">
      {/* Section: Combat Stats */}
      <div className="space-y-3">
        <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
          Combat Stats
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Final Horror Level */}
          <div className="space-y-1">
            <label className="type-caption text-muted-foreground">
              Final Horror Level (1-7)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="7"
                value={finalHorrorLevel}
                onChange={(e) => setFinalHorrorLevel(Math.trunc(Number(e.target.value)))}
                className="flex-1 h-2 bg-muted rounded-sm appearance-none cursor-pointer accent-primary"
              />
              <span className="font-display text-lg text-primary w-6 text-center">
                {finalHorrorLevel}
              </span>
            </div>
          </div>

          {/* Weapon Used */}
          <div className="space-y-1">
            <label className="type-caption text-muted-foreground">
              Weapon Used
            </label>
            <input
              type="text"
              aria-label="Weapon Used"
              value={weaponUsed}
              onChange={(e) => setWeaponUsed(e.target.value)}
              placeholder="Machete, Axe, Fire..."
              className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Final Girl Health */}
          <div className="space-y-1">
            <label className="type-caption text-muted-foreground">
              Final Girl Health (0-{maxFinalGirlHealth})
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Final Girl Health"
              value={finalGirlHealth === 0 ? '' : String(finalGirlHealth)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.min(maxFinalGirlHealth, Math.max(0, Math.trunc(Number(e.target.value))));
                setFinalGirlHealth(isNaN(val) ? 0 : val);
              }}
              placeholder="0"
              className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Killer Health — hidden for unkillable killers */}
          {!killerIsUnkillable && (
            <div className="space-y-1">
              <label className="type-caption text-muted-foreground">
                Killer Health (0-{maxKillerHealth})
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label="Killer Health"
              value={killerHealth === 0 ? '' : String(killerHealth)}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.min(maxKillerHealth, Math.max(0, Math.trunc(Number(e.target.value))));
                  setKillerHealth(isNaN(val) ? 0 : val);
                }}
                placeholder="0"
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* Section: Rescue Stats */}
      <div className="space-y-3">
        <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
          Rescue Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Victims Saved */}
          <div className="space-y-1">
            <label className="type-caption text-muted-foreground">
              Victims Saved
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Victims Saved"
              value={victimsSaved === 0 ? '' : String(victimsSaved)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.max(0, Math.trunc(Number(e.target.value)));
                setVictimsSaved(isNaN(val) ? 0 : val);
              }}
              placeholder="0"
              className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground focus:outline-none focus:border-secondary/50 transition-colors"
            />
          </div>

          {/* Victims Killed */}
          <div className="space-y-1">
            <label className="type-caption text-muted-foreground">
              Victims Killed
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Victims Killed"
              value={victimsKilled === 0 ? '' : String(victimsKilled)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.max(0, Math.trunc(Number(e.target.value)));
                setVictimsKilled(isNaN(val) ? 0 : val);
              }}
              placeholder="0"
              className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Section: Poltergeist win conditions */}
      {isPoltergeist && isWin && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            Poltergeist Win Condition
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={foundCarolyn}
                onChange={(e) => setFoundCarolyn(e.target.checked)}
                className="w-4 h-4 accent-secondary"
              />
              <span className="type-label text-foreground">Found Carolyn</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={foundMrFloppy}
                onChange={(e) => setFoundMrFloppy(e.target.checked)}
                className="w-4 h-4 accent-secondary"
              />
              <span className="type-label text-foreground">Found Mr. Floppy</span>
            </label>
          </div>
        </div>
      )}

      {/* Section: Organism loss type */}
      {isOrganism && !isWin && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            How Did You Lose?
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="organismLoss"
                value="caught"
                checked={organismLossType === 'caught'}
                onChange={() => setOrganismLossType('caught')}
                className="accent-primary"
              />
              <span className="type-label text-foreground">Caught by the Organism</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="organismLoss"
                value="assimilated"
                checked={organismLossType === 'assimilated'}
                onChange={() => setOrganismLossType('assimilated')}
                className="accent-primary"
              />
              <span className="type-label text-foreground">Assimilated (Horror &gt; 6)</span>
            </label>
          </div>
        </div>
      )}

      {/* Section: Evomorph evolution stage */}
      {isEvomorph && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            Evomorph Evolution
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            {(['Hatchling', 'Youngling', 'Adult'] as const).map((stage) => (
              <label key={stage} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="evomorphStage"
                  value={stage}
                  checked={evomorphStage === stage}
                  onChange={() => setEvomorphStage(stage)}
                  className="accent-primary"
                />
                <span className="type-label text-foreground">{stage}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Section: Ratchet Lady - maniacs */}
      {isRatchetLady && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            Asylum Status
          </h3>
          <div className="space-y-1">
            <label className="type-caption text-muted-foreground">
              Maniacs on Board at End (0–6)
            </label>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={maniacCount === 0 ? '' : String(maniacCount)}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.min(6, Math.max(0, Math.trunc(Number(e.target.value))));
                  setManiacCount(isNaN(val) ? 0 : val);
                }}
                placeholder="0"
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
          </div>
        </div>
      )}

      {/* Section: Big Bad Wolf mode */}
      {isBigBadWolf && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            Wolf Status
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            {(['TRACK', 'SLAY', 'Killing Machine'] as const).map((mode) => (
              <label key={mode} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="wolfMode"
                  value={mode}
                  checked={wolfMode === mode}
                  onChange={() => setWolfMode(mode)}
                  className="accent-primary"
                />
                <span className="type-label text-foreground">{mode}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Section: The Intruders - active killer */}
      {isIntruders && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            Active Intruder
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            {(['Trish', 'Baghead', 'Zeke'] as const).map((intruder) => (
              <label key={intruder} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="activeIntruder"
                  value={intruder}
                  checked={activeIntruder === intruder}
                  onChange={() => setActiveIntruder(intruder)}
                  className="accent-primary"
                />
                <span className="type-label text-foreground">{intruder}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Section: Buddyland - Buddies + power supplies */}
      {isBilly && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            Billy’s Buddies & Power
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="buddies-in-play" className="type-caption text-muted-foreground">
                Buddies in Play at End (0–7)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Not recorded"
                id="buddies-in-play"
                value={buddiesInPlay === null ? '' : String(buddiesInPlay)}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Math.min(7, Math.max(0, Math.trunc(Number(e.target.value))));
                  setBuddiesInPlay(val !== null && isNaN(val) ? null : val);
                }}
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={powerSuppliesShutDown}
                  onChange={(e) => setPowerSuppliesShutDown(e.target.checked)}
                  className="w-4 h-4 accent-secondary"
                />
                <span className="type-label text-foreground">All Power Sources Inactive</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {isBilly && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="billy-finale" className="type-caption text-muted-foreground">Billy Finale (optional)</label>
            <select id="billy-finale" value={billyFinale} onChange={e => setBillyFinale(e.target.value)} className="w-full h-11 px-3 bg-muted border border-border/50 rounded-sm text-base text-foreground">
              <option value="">Not recorded</option><option value="Power Surge">Power Surge</option><option value="Other Finale">Other Finale</option>
            </select>
          </div>
          {billyFinale === 'Power Surge' && <div className="space-y-1">
            <label htmlFor="boris-status" className="type-caption text-muted-foreground">Boris at Game End</label>
            <select id="boris-status" value={borisStatus} onChange={e => setBorisStatus(e.target.value)} className="w-full h-11 px-3 bg-muted border border-border/50 rounded-sm text-base text-foreground">
              <option value="">Not recorded</option><option value="defeated">Defeated</option><option value="still in play">Still in play</option>
            </select>
            <p className="type-caption text-muted-foreground">Power Surge requires defeating both Billy and Boris to win.</p>
          </div>}
        </div>
      )}

      {/* Section: Grimlash / A Rotten Harvest */}
      {isGrimlash && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            Harvest
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="type-caption text-muted-foreground">
                Children Survived (0–3)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={childrenSurvived === 0 ? '' : String(childrenSurvived)}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.min(3, Math.max(0, Math.trunc(Number(e.target.value))));
                  setChildrenSurvived(isNaN(val) ? 0 : val);
                }}
                placeholder="0"
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={harvestMadnessPeaked}
                  onChange={(e) => setHarvestMadnessPeaked(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="type-label text-foreground">Harvest Madness Peaked</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Section: Berith / A Demon in the Shadows */}
      {isBerith && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            The Demon
          </h3>
          {isWin && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={ursulaSaved}
                onChange={(e) => setUrsulaSaved(e.target.checked)}
                className="w-4 h-4 accent-secondary"
              />
              <span className="type-label text-foreground">Ursula Saved</span>
            </label>
          )}
          <div>
            <p className="type-caption text-muted-foreground mb-2">L'Armes Abbey Influence</p>
            <div className="flex flex-col sm:flex-row gap-2">
              {(['Blessings Dominated', 'Curses Dominated', 'Balanced'] as const).map((influence) => (
                <label key={influence} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="abbeyInfluence"
                    value={influence}
                    checked={abbeyInfluence === influence}
                    onChange={() => setAbbeyInfluence(influence)}
                    className="accent-primary"
                  />
                  <span className="type-label text-foreground">{influence}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section: Shriek / MegaBGCon */}
      {isShriek && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            Shriek Reveal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="type-caption text-muted-foreground">
                Final Killer Identity
              </label>
              <select
                value={finalKillerIdentity}
                onChange={(e) => setFinalKillerIdentity(e.target.value)}
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              >
                {['Unknown', 'Hans', 'Geppetto', 'Dr. Fright', 'Inkanyamba', 'Big Bad Wolf', 'Ratchet Lady', 'Evomorph', 'The Organism', 'The Intruders', 'Mort'].map((identity) => (
                  <option key={identity} value={identity}>{identity}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mortRevealed}
                  onChange={(e) => setMortRevealed(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="type-label text-foreground">Mort Revealed</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Section: Falconwood Mission */}
      {isFalconwood && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            The Mission
          </h3>
          {result.mission && (
            <p className="type-caption text-muted-foreground/80 italic">
              {result.mission}
            </p>
          )}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={missionCompleted}
              onChange={(e) => setMissionCompleted(e.target.checked)}
              className="w-4 h-4 accent-secondary"
            />
            <span className="type-label text-foreground">Mission Completed</span>
          </label>

          {missionCompleted ? (
            <div className="space-y-1">
              <label className="type-caption text-muted-foreground">
                Friend Who Joined You
              </label>
              <input
                type="text"
                value={friendJoined}
                onChange={(e) => setFriendJoined(e.target.value)}
                placeholder="Your father, your friend, the researcher..."
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-secondary/50 transition-colors"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="type-caption text-muted-foreground">
                Mission Progress
              </label>
              <input
                type="text"
                value={missionProgress}
                onChange={(e) => setMissionProgress(e.target.value)}
                placeholder="One clue short, halfway through the code..."
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          )}
        </div>
      )}

      {/* Section: Slayer Mirror Dimension */}
      {isSlayer && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            The Mirror Dimension
          </h3>
          <div>
            <p className="type-caption text-muted-foreground mb-2">Dimension at the End</p>
            <div className="flex flex-col sm:flex-row gap-2">
              {(['Our Dimension', 'Mirror Dimension'] as const).map((dimension) => (
                <label key={dimension} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="endingDimension"
                    value={dimension}
                    checked={endingDimension === dimension}
                    onChange={() => setEndingDimension(dimension)}
                    className="accent-primary"
                  />
                  <span className="type-label text-foreground">{dimension}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* Section: Narrative */}
      <div className="space-y-3">
        <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
          Narrative
        </h3>
        
        {/* Ending Location */}
        <div className="space-y-1">
          <label className="type-caption text-muted-foreground">
            Ending Location
          </label>
          <input
            type="text"
            aria-label="Ending Location"
              value={endingSubLocation}
            onChange={(e) => setEndingSubLocation(e.target.value)}
            placeholder="Kitchen, Basement, Rooftop..."
            className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Game Highlights */}
        <div className="space-y-1">
          <label className="type-caption text-muted-foreground">
            Game Highlights
          </label>
          <textarea
            aria-label="Game Highlights"
              value={gameHighlights}
            onChange={(e) => setGameHighlights(e.target.value)}
            placeholder="Memorable moments, close calls, dramatic kills..."
            rows={3}
            className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-border/30">
        {onSaveResult && <button onClick={() => onSaveResult(buildFormData())} className="vcr-tape-button type-label px-4 py-3 min-h-[44px]">SAVE RESULT WITHOUT NARRATION</button>}
        <button
          onClick={handleContinue}
          className={`outcome-btn ${isWin ? 'outcome-btn-won' : 'outcome-btn-lost'} group relative min-w-[200px] sm:min-w-[240px] h-12 overflow-hidden rounded-sm transition-all duration-200 flex items-center justify-center gap-2`}
        >
          <span className={`relative z-10 font-display text-base tracking-[0.15em] uppercase ${isWin ? 'text-secondary' : 'text-primary'} drop-shadow-lg`}>
            Continue
          </span>
          <ArrowRight className={`relative z-10 w-4 h-4 ${isWin ? 'text-secondary' : 'text-primary'}`} />
        </button>
      </div>
    </div>
  );
};

