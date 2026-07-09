import { useState, useMemo } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { GameResult } from '@/hooks/useGameHistory';
import { EndingFormData } from '@/pages/TheEnd';
import { getFinalGirlMaxHealth } from '@/data/finalGirlHealth';
import { getKillerMaxHealth, isKillerUnkillable } from '@/data/killerHealth';

interface GameOutcomeFormProps {
  result: GameResult;
  introStory?: string;
  onContinue: (formData: EndingFormData) => void;
  onDiscard: () => void;
}

export const GameOutcomeForm = ({
  result,
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
  const isBuddyland = result.killer === 'Billy the Bear' || result.location === 'Buddyland';
  const isGrimlash = result.killer === 'Grimlash';
  const isBerith = result.killer === 'Berith' || result.location === "L'Armes Abbey";
  const isShriek = result.killer === 'Mort the Teenage Dirtbag' || result.location === 'MegaBGCon';
  
  // Local form state - use character-specific max health for defaults
  const [finalHorrorLevel, setFinalHorrorLevel] = useState(result.finalHorrorLevel ?? 4);
  const [finalGirlHealth, setFinalGirlHealth] = useState(result.finalGirlHealth ?? (isWin ? maxFinalGirlHealth : 0));
  const [killerHealth, setKillerHealth] = useState(result.killerHealth ?? (isWin ? 0 : Math.ceil(maxKillerHealth / 2)));
  const [weaponUsed, setWeaponUsed] = useState(result.weaponUsed ?? '');
  const [victimsSaved, setVictimsSaved] = useState(result.victimsSaved ?? 0);
  const [victimsKilled, setVictimsKilled] = useState(result.victimsKilled ?? 0);
  const [endingSubLocation, setEndingSubLocation] = useState(result.endingSubLocation ?? '');
  const [gameHighlights, setGameHighlights] = useState(result.gameHighlights ?? '');
  // Poltergeist-specific win condition fields
  const [foundCarolyn, setFoundCarolyn] = useState(false);
  const [foundMrFloppy, setFoundMrFloppy] = useState(false);
  // Organism-specific loss type
  const [organismLossType, setOrganismLossType] = useState<'caught' | 'assimilated'>('caught');
  // Evomorph evolution stage
  const [evomorphStage, setEvomorphStage] = useState<'Hatchling' | 'Youngling' | 'Adult'>('Hatchling');
  // Ratchet Lady maniac count
  const [maniacCount, setManiacCount] = useState(0);
  // Big Bad Wolf mode
  const [wolfMode, setWolfMode] = useState<'TRACK' | 'SLAY' | 'Killing Machine'>('SLAY');
  // The Intruders - active killer at game end
  const [activeIntruder, setActiveIntruder] = useState<'Trish' | 'Baghead' | 'Zeke'>('Trish');
  // Buddyland - Buddies + power supplies
  const [buddiesInPlay, setBuddiesInPlay] = useState(0);
  const [powerSuppliesShutDown, setPowerSuppliesShutDown] = useState(false);
  // Grimlash / A Rotten Harvest
  const [childrenSurvived, setChildrenSurvived] = useState(0);
  const [harvestMadnessPeaked, setHarvestMadnessPeaked] = useState(false);
  // Berith / A Demon in the Shadows
  const [ursulaSaved, setUrsulaSaved] = useState(false);
  const [abbeyInfluence, setAbbeyInfluence] = useState<'Blessings Dominated' | 'Curses Dominated' | 'Balanced'>('Balanced');
  // Shriek / MegaBGCon
  const [mortRevealed, setMortRevealed] = useState(false);
  const [finalKillerIdentity, setFinalKillerIdentity] = useState('Unknown');

  const handleContinue = () => {
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
    if (isBuddyland) {
      const buddyParts = [`Buddies in play at end: ${buddiesInPlay}`];
      if (powerSuppliesShutDown) buddyParts.push('Power supplies shut down');
      highlights = highlights ? `${highlights}. ${buddyParts.join('. ')}` : buddyParts.join('. ');
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
    onContinue(formData);
  };

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
            <label className="font-vhs text-xs text-muted-foreground">
              Final Horror Level (1-7)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="7"
                value={finalHorrorLevel}
                onChange={(e) => setFinalHorrorLevel(Number(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-sm appearance-none cursor-pointer accent-primary"
              />
              <span className="font-display text-lg text-primary w-6 text-center">
                {finalHorrorLevel}
              </span>
            </div>
          </div>

          {/* Weapon Used */}
          <div className="space-y-1">
            <label className="font-vhs text-xs text-muted-foreground">
              Weapon Used
            </label>
            <input
              type="text"
              value={weaponUsed}
              onChange={(e) => setWeaponUsed(e.target.value)}
              placeholder="Machete, Axe, Fire..."
              className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Final Girl Health */}
          <div className="space-y-1">
            <label className="font-vhs text-xs text-muted-foreground">
              Final Girl Health (0-{maxFinalGirlHealth})
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={finalGirlHealth === 0 ? '' : String(finalGirlHealth)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.min(maxFinalGirlHealth, Math.max(0, Number(e.target.value)));
                setFinalGirlHealth(isNaN(val) ? 0 : val);
              }}
              placeholder="0"
              className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Killer Health — hidden for unkillable killers */}
          {!killerIsUnkillable && (
            <div className="space-y-1">
              <label className="font-vhs text-xs text-muted-foreground">
                Killer Health (0-{maxKillerHealth})
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={killerHealth === 0 ? '' : String(killerHealth)}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.min(maxKillerHealth, Math.max(0, Number(e.target.value)));
                  setKillerHealth(isNaN(val) ? 0 : val);
                }}
                placeholder="0"
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground focus:outline-none focus:border-primary/50 transition-colors"
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
            <label className="font-vhs text-xs text-muted-foreground">
              Victims Saved
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={victimsSaved === 0 ? '' : String(victimsSaved)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                setVictimsSaved(isNaN(val) ? 0 : val);
              }}
              placeholder="0"
              className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground focus:outline-none focus:border-secondary/50 transition-colors"
            />
          </div>

          {/* Victims Killed */}
          <div className="space-y-1">
            <label className="font-vhs text-xs text-muted-foreground">
              Victims Killed
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={victimsKilled === 0 ? '' : String(victimsKilled)}
              onChange={(e) => {
                const val = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                setVictimsKilled(isNaN(val) ? 0 : val);
              }}
              placeholder="0"
              className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground focus:outline-none focus:border-primary/50 transition-colors"
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
              <span className="font-vhs text-sm text-foreground">Found Carolyn</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={foundMrFloppy}
                onChange={(e) => setFoundMrFloppy(e.target.checked)}
                className="w-4 h-4 accent-secondary"
              />
              <span className="font-vhs text-sm text-foreground">Found Mr. Floppy</span>
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
              <span className="font-vhs text-sm text-foreground">Caught by the Organism</span>
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
              <span className="font-vhs text-sm text-foreground">Assimilated (Horror &gt; 6)</span>
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
                <span className="font-vhs text-sm text-foreground">{stage}</span>
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
            <label className="font-vhs text-xs text-muted-foreground">
              Maniacs on Board at End (0–6)
            </label>
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={maniacCount === 0 ? '' : String(maniacCount)}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.min(6, Math.max(0, Number(e.target.value)));
                  setManiacCount(isNaN(val) ? 0 : val);
                }}
                placeholder="0"
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground focus:outline-none focus:border-primary/50 transition-colors"
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
                <span className="font-vhs text-sm text-foreground">{mode}</span>
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
                <span className="font-vhs text-sm text-foreground">{intruder}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Section: Buddyland - Buddies + power supplies */}
      {isBuddyland && (
        <div className="space-y-3">
          <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
            Buddyland Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-vhs text-xs text-muted-foreground">
                Buddies in Play at End (0–7)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={buddiesInPlay === 0 ? '' : String(buddiesInPlay)}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.min(7, Math.max(0, Number(e.target.value)));
                  setBuddiesInPlay(isNaN(val) ? 0 : val);
                }}
                placeholder="0"
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground focus:outline-none focus:border-primary/50 transition-colors"
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
                <span className="font-vhs text-sm text-foreground">Power Supplies Shut Down</span>
              </label>
            </div>
          </div>
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
              <label className="font-vhs text-xs text-muted-foreground">
                Children Survived (0–3)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={childrenSurvived === 0 ? '' : String(childrenSurvived)}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : Math.min(3, Math.max(0, Number(e.target.value)));
                  setChildrenSurvived(isNaN(val) ? 0 : val);
                }}
                placeholder="0"
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground focus:outline-none focus:border-primary/50 transition-colors"
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
                <span className="font-vhs text-sm text-foreground">Harvest Madness Peaked</span>
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
              <span className="font-vhs text-sm text-foreground">Ursula Saved</span>
            </label>
          )}
          <div>
            <p className="font-vhs text-xs text-muted-foreground mb-2">L'Armes Abbey Influence</p>
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
                  <span className="font-vhs text-sm text-foreground">{influence}</span>
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
              <label className="font-vhs text-xs text-muted-foreground">
                Final Killer Identity
              </label>
              <select
                value={finalKillerIdentity}
                onChange={(e) => setFinalKillerIdentity(e.target.value)}
                className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground focus:outline-none focus:border-primary/50 transition-colors"
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
                <span className="font-vhs text-sm text-foreground">Mort Revealed</span>
              </label>
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
          <label className="font-vhs text-xs text-muted-foreground">
            Ending Location
          </label>
          <input
            type="text"
            value={endingSubLocation}
            onChange={(e) => setEndingSubLocation(e.target.value)}
            placeholder="Kitchen, Basement, Rooftop..."
            className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Game Highlights */}
        <div className="space-y-1">
          <label className="font-vhs text-xs text-muted-foreground">
            Game Highlights
          </label>
          <textarea
            value={gameHighlights}
            onChange={(e) => setGameHighlights(e.target.value)}
            placeholder="Memorable moments, close calls, dramatic kills..."
            rows={3}
            className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-sm font-vhs text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center pt-4 border-t border-border/30">
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
