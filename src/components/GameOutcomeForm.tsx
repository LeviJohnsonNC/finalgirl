import {ORGANISM_MODULE,organismFacts} from "@/lib/play/organism";
import { falconwoodReview, falconwoodReviewText, falconwoodState } from "../../supabase/functions/_shared/play/falconwood";
import { slayerState } from "@/lib/play/slayer";
import {MALL,MALL_MODULE,mallState,mallFacts} from '@/lib/play/sunnydaze';
import { hunterState, hunterFacts } from '@/lib/play/hunter';
import { INTRUDER_MODULE, INTRUDER_ROSTER, intruderFacts } from "@/lib/play/intruders";
import {tormentorState,type TormentorLoss} from '@/lib/play/tormentor';
import {shadyState,shadyChildrenCount} from '@/lib/play/shadyAcres';
import {grimlashFatal,harvestLevel,type GrimlashLoss} from '@/lib/play/grimlash';
import {konradState,type KonradFate} from '@/lib/play/konrad';
import { useState, useMemo } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useBufferedOutcomeDraft } from './outcome/useBufferedOutcomeDraft';
import { OutcomeNumberField } from './outcome/OutcomeNumberField';
import { poltergeistPower } from '../../supabase/functions/_shared/play/poltergeist';
import { ENDING_BOARD_SPACES } from '@/data/endingBoardSpaces';
import { PLAY_ROOMS, selectionItems } from '@/lib/play/catalog';
import { OutcomeChoices } from './outcome/OutcomeChoices';
import { OutcomeSelect } from './outcome/OutcomeSelect';
import { SuggestionInput } from './ui/suggestion-input';
import '@/styles/outcome.css';
import { GameResult } from '@/hooks/useGameHistory';
import { EndingFormData } from '@/pages/TheEnd';
import { getLegacyFinalGirlHealth } from '@/data/finalGirlHealth';
import { getKillerMaxHealth, isKillerUnkillable } from '@/data/killerHealth';
import { BUDDIES, BILLY_FINALES, moduleState } from '@/lib/play/modules';
import { summarizePlay } from '@/lib/play/events';

interface GameOutcomeFormProps {
  result: GameResult;
  introStory?: string;
  initialDraft?: Record<string, unknown>;
  onDraftChange?: (fields: Record<string, unknown>) => boolean;
  onSaveResult?: (formData: EndingFormData) => void;
  onContinue: (formData: EndingFormData) => void;
  onDiscard: () => void;
}

function slayerFinishDimension(events?: import('@/lib/play/events').PlayEvent[]) {
  const dimension = slayerState(moduleState(summarizePlay(events).entries, 'slayer')).girl;
  return dimension === 'our' ? 'Our Dimension' : dimension === 'mirror' ? 'Mirror Dimension' : '';
}

function useDraftField<T>(
  name: string,
  fallback: T,
  draft?: Record<string, unknown>,
  onChange?: (fields: Record<string, unknown>) => boolean,
) {
  const [value, setValue] = useState<T>(() =>
    draft && Object.prototype.hasOwnProperty.call(draft, name)
      ? (draft[name] as T)
      : fallback,
  );
  const set = (next: T) => {
    if (onChange?.({ [name]: next }) !== false) setValue(next);
  };
  return [value, set] as const;
}

export const GameOutcomeForm = ({
  result,
  initialDraft,
  onDraftChange,
  onSaveResult,
  introStory,
  onContinue,
  onDiscard,
}: GameOutcomeFormProps) => {
  const textDraft = useBufferedOutcomeDraft(onDraftChange);
  const entries = useMemo(() => summarizePlay(result.playEvents).entries, [result.playEvents]);
  const observed = useMemo(() => ({
    tormentor: tormentorState(moduleState(entries, 'tormentor')),
    konrad: konradState(moduleState(entries, 'konrad')),
    grimlash: moduleState(entries, 'grimlash'),
    billy: moduleState(entries, 'billy'),
    poltergeist: moduleState(entries, 'poltergeist'),
    creech: moduleState(entries, 'creech'),
    power: poltergeistPower(entries),
    evomorph: moduleState(entries, 'evomorph').stage,
    wolf: moduleState(entries, 'big-bad-wolf').mode,
    shady: shadyState(moduleState(entries, 'shady-acres')),
  }), [entries]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [tormentorLoss,setTormentorLoss]=useDraftField<TormentorLoss>('tormentorLoss',observed.tormentor.loss,initialDraft,onDraftChange);
  const [shipFate,setShipFate]=useDraftField<KonradFate>('konradFate',observed.konrad.fate,initialDraft,onDraftChange);
  const [reviewedOutcome,setReviewedOutcome]=useDraftField<'won'|'lost'>('reviewedOutcome',result.outcome,initialDraft,onDraftChange);
  const grimState=observed.grimlash;
  const [grimLoss,setGrimLoss]=useDraftField<GrimlashLoss>('grimlashLoss',(grimState.loss as GrimlashLoss)??'unknown',initialDraft,onDraftChange);
  const retractingSkull=grimState.position===10&&(grimLoss==='none'||grimLoss==='unknown');
  const reviewedGrimState=retractingSkull?{...grimState,position:undefined,peak:grimState.peak===10?undefined:grimState.peak}:grimState;
  const fatalGrim=result.killer==='Grimlash'&&grimlashFatal({loss:grimLoss});
  const fatalShip=result.location==='USS Konrad'&&['airlock-loss','explosion-loss'].includes(shipFate);
  const fatalTormentor=result.killer==='The Tormentor'&&!['none','unknown'].includes(tormentorLoss);
  const fatalMall=result.location===MALL&&mallState(moduleState(entries,MALL_MODULE)).savior==='killed';
  const fatalEnding=fatalMall||fatalGrim||fatalShip||fatalTormentor;
  const isWin = !fatalEnding && reviewedOutcome === 'won';
  const billyState = observed.billy;

  // Session snapshots include observed Ultimate changes; old games keep their denominator.
  const maxFinalGirlHealth = useMemo(
    () => result.finalGirlMaxHealth ?? getLegacyFinalGirlHealth(result.finalGirl),
    [result.finalGirl, result.finalGirlMaxHealth],
  );
  // Get killer-specific HP and flags
  const maxKillerHealth = useMemo(
    () => ['Geppetto', 'Inkanyamba', 'The Hunter'].includes(result.killer) ? Math.max(getKillerMaxHealth(result.killer), result.killerHealth ?? 0, Number(initialDraft?.killerHealth) || 0) : getKillerMaxHealth(result.killer),
    [result.killer, result.killerHealth, initialDraft?.killerHealth],
  );
  const killerIsUnkillable = useMemo(
    () => isKillerUnkillable(result.killer),
    [result.killer],
  );
  const isPoltergeist = result.killer === 'Poltergeist';
  const polterState=observed.poltergeist;
  const creechState=observed.creech;
  const polterPower=observed.power;
  const isOrganism = result.killer === 'The Organism';
  const isEvomorph = result.killer === 'Evomorph';
  const isRatchetLady = result.killer === 'Ratchet Lady';
  const isBigBadWolf = result.killer === 'Big Bad Wolf';
  const isIntruders = result.killer === 'The Intruders';
  const isBilly = result.killer === 'Billy the Bear';
  const isGrimlash = result.killer === 'Grimlash';
  const isBerith =
    result.killer === 'Berith';
  const isAbbey = result.location === "L'Armes Abbey";
  const isShriek =
    result.killer === 'Mort the Teenage Dirtbag';
  const isFalconwood = result.location === 'Falconwood';
  const isSlayer = result.killer === 'Slayer';
  const hasKillerDetails = (isWin && (isPoltergeist || isBerith)) || (!isWin && isOrganism)
    || result.killer==='The Hunter' || isEvomorph || isRatchetLady || isBigBadWolf || isIntruders || isBilly || isGrimlash
    || isShriek || isSlayer || result.killer === 'The Tormentor';
  const hasLocationDetails = result.location===MALL || result.location === 'USS Konrad' || result.location === 'Shady Acres' || isFalconwood || isAbbey;


  // Optional observations stay unknown until the player records them.
  const [finalHorrorLevel, setFinalHorrorLevel] = useDraftField<number | null>(
    'finalHorrorLevel',
    result.finalHorrorLevel ?? null,
    initialDraft,
    onDraftChange,
  );
  const [finalGirlHealth, setFinalGirlHealth] = useDraftField<number | null>(
    'finalGirlHealth',
    result.finalGirlHealth ?? null,
    initialDraft,
    onDraftChange,
  );
  const [killerHealth, setKillerHealth] = useDraftField<number | null>(
    'killerHealth',
    result.killerHealth ?? null,
    initialDraft,
    onDraftChange,
  );
  const [weaponUsed, setWeaponUsed] = useDraftField(
    'weaponUsed',
    result.weaponUsed ?? '',
    initialDraft,
    textDraft.queue,
  );
  const [victimsSaved, setVictimsSaved] = useDraftField<number | null>(
    'victimsSaved',
    result.victimsSaved ?? null,
    initialDraft,
    onDraftChange,
  );
  const [victimsKilled, setVictimsKilled] = useDraftField<number | null>(
    'victimsKilled',
    result.victimsKilled ?? null,
    initialDraft,
    onDraftChange,
  );
  const [roundsPlayed, setRoundsPlayed] = useDraftField<number | null>(
    'roundsPlayed',
    result.roundsPlayed ?? null,
    initialDraft,
    onDraftChange,
  );
  const [endingSubLocation, setEndingSubLocation] = useDraftField(
    'endingSubLocation',
    result.endingSubLocation ?? '',
    initialDraft,
    textDraft.queue,
  );
  const [gameHighlights, setGameHighlights] = useDraftField(
    'gameHighlights',
    result.gameHighlights ?? '',
    initialDraft,
    textDraft.queue,
  );
  // Poltergeist-specific win condition fields
  const [foundCarolyn, setFoundCarolyn] = useDraftField(
    'rescuedCarolyn',
    polterState.carolyn==='rescued',
    initialDraft,
    onDraftChange,
  );
  const [foundMrFloppy, setFoundMrFloppy] = useDraftField(
    'escapedWithMrFloppy',
    polterState.carolyn==='rescued'&&(creechState['helicopter.carolyn']===true?creechState['helicopter.floppy']===true:polterState.floppy==='carried'),
    initialDraft,
    onDraftChange,
  );
  const [escapeRoute,setEscapeRoute]=useDraftField('rescueRoute',creechState['helicopter.carolyn']===true?'helicopter':'',initialDraft,onDraftChange);
  // Organism-specific loss type
  const [organismLossType, setOrganismLossType] = useDraftField<
    '' | 'caught' | 'assimilated'
  >('organismLossType', '', initialDraft, onDraftChange);
  // Evomorph evolution stage
  const [evomorphStage, setEvomorphStage] = useDraftField<
    '' | 'Hatchling' | 'Youngling' | 'Adult'
  >('evomorphStage', observed.evomorph === 'adult' ? 'Adult' : observed.evomorph === 'youngling' ? 'Youngling' : observed.evomorph === 'hatchling' ? 'Hatchling' : '', initialDraft, onDraftChange);
  // Ratchet Lady maniac count
  const [maniacCount, setManiacCount] = useDraftField<number | null>(
    'maniacCount',
    null,
    initialDraft,
    onDraftChange,
  );
  // Big Bad Wolf mode
  const [wolfMode, setWolfMode] = useDraftField<
    '' | 'TRACK' | 'SLAY' | 'Killing Machine'
  >('wolfMode', observed.wolf === 'track' ? 'TRACK' : observed.wolf === 'slay' ? 'SLAY' : observed.wolf === 'both' ? 'Killing Machine' : '', initialDraft, onDraftChange);
  const intruderEnding = isIntruders ? moduleState(entries, INTRUDER_MODULE) : {};
  const legacyIntruder = isIntruders && intruderEnding.active===undefined && intruderEnding.mode!=='all'
    ? INTRUDER_ROSTER.find(person=>person.name===initialDraft?.activeIntruder)?.name
    : undefined;
  // Buddyland - Buddies + power supplies
  const [buddiesInPlay, setBuddiesInPlay] = useDraftField<number | null>(
    'buddiesInPlay',
    billyState.rosterComplete === true ? BUDDIES.filter(b => billyState[`buddy.${b.id}.status`] === 'active').length : null,
    initialDraft,
    onDraftChange,
  );
  const [powerSuppliesShutDown, setPowerSuppliesShutDown] = useDraftField(
    'powerSuppliesShutDown',
    [1,2,3,4,5].every(i => ['inactive','set-aside'].includes(String(billyState[`source.${i}.status`]))) && [1,2,3,4,5].some(i => billyState[`source.${i}.status`] === 'inactive'),
    initialDraft,
    onDraftChange,
  );
  const [billyFinale, setBillyFinale] = useDraftField(
    'billyFinale',
    BILLY_FINALES.find(f => f.id === billyState.finale)?.name ?? '',
    initialDraft,
    onDraftChange,
  );
  const [borisStatus, setBorisStatus] = useDraftField(
    'borisStatus',
    billyState['buddy.boris.status'] === 'defeated' ? 'defeated' : billyState['buddy.boris.status'] === 'active' ? 'still in play' : '',
    initialDraft,
    onDraftChange,
  );
  // Grimlash / A Rotten Harvest
  const shady=observed.shady;
  const [childrenAtFinish,setChildrenAtFinish]=useDraftField<number|null>('childrenOnBoardAtFinish',shady.finishChildren!==undefined?shady.finishChildren:shadyChildrenCount(shady),initialDraft,onDraftChange);
  const [harvestMadnessPeaked] = useDraftField(
    'harvestMadnessPeaked',
    false,
    initialDraft,
    onDraftChange,
  );
  // Berith / A Demon in the Shadows
  const [ursulaSaved, setUrsulaSaved] = useDraftField(
    'ursulaSaved',
    false,
    initialDraft,
    onDraftChange,
  );
  const [abbeyInfluence, setAbbeyInfluence] = useDraftField<
    '' | 'Blessings Dominated' | 'Curses Dominated' | 'Balanced'
  >('abbeyInfluence', '', initialDraft, onDraftChange);
  // Shriek / MegaBGCon
  const [mortRevealed, setMortRevealed] = useDraftField(
    'mortRevealed',
    null as boolean | null,
    initialDraft,
    onDraftChange,
  );
  const [finalKillerIdentity, setFinalKillerIdentity] = useDraftField(
    'finalKillerIdentity',
    'Unknown',
    initialDraft,
    onDraftChange,
  );
  // Falconwood / Slayer
  const recordedMission = falconwoodState(moduleState(entries, "falconwood"));
  const showLegacyMissionNotes = !recordedMission.mission || !!initialDraft?.missionProgress || !!initialDraft?.friendJoined;
  const [missionCompleted, setMissionCompleted] = useDraftField(
    'missionCompleted',
    recordedMission.complete ?? (null as boolean | null),
    initialDraft,
    onDraftChange,
  );
  const [missionProgress, setMissionProgress] = useDraftField(
    'missionProgress',
    '',
    initialDraft,
    textDraft.queue,
  );
  const [friendJoined, setFriendJoined] = useDraftField(
    'friendJoined',
    '',
    initialDraft,
    textDraft.queue,
  );
  const [endingDimension, setEndingDimension] = useDraftField<'' | 'Our Dimension' | 'Mirror Dimension'>(
    'endingDimension',
    isSlayer ? slayerFinishDimension(result.playEvents) : '',
    initialDraft, onDraftChange,
  );

  const buildFormData = (): EndingFormData => {
    // Augment gameHighlights with killer-specific conditions so the LLM gets full context
    let highlights = gameHighlights || '';
    if (legacyIntruder && !highlights.includes('Active Intruder at end:')) {
      highlights = [highlights,`Active Intruder at end: ${legacyIntruder}`].filter(Boolean).join('. ');
    }
    if (isPoltergeist && isWin) {
      const parts = [];
      if(initialDraft?.foundCarolyn===true&&!foundCarolyn)parts.push('Found Carolyn earlier; escape not confirmed');
      if(initialDraft?.foundMrFloppy===true&&!foundMrFloppy)parts.push('Found Mr. Floppy earlier; possession at escape not confirmed');
      if (foundCarolyn) parts.push('Carolyn rescued and escaped with the Final Girl'+(escapeRoute?` via ${escapeRoute}`:'; route unrecorded'));
      if(polterPower.epic)parts.push('Epic Power: escape also requires Mr. Floppy');
      if(polterPower.revealed&&!polterPower.known)parts.push('Revealed Power name/extra escape requirement unrecorded');
      if (foundMrFloppy) parts.push('Recovered Mr. Floppy');
      if (parts.length > 0) {
        highlights = highlights
          ? `${highlights}. Win condition: ${parts.join(', ')}`
          : `Win condition: ${parts.join(', ')}`;
      }
    }
    if (isOrganism && !isWin && organismLossType) {
      const cause = organismLossType === 'assimilated' ? 'Assimilation' : 'Caught by the Organism';
      highlights = [highlights, `Loss type: ${cause}`].filter(Boolean).join('. ');
    }
    if (isEvomorph && evomorphStage) {
      highlights = highlights
        ? `${highlights}. Evomorph stage reached: ${evomorphStage}`
        : `Evomorph stage reached: ${evomorphStage}`;
    }
    if (isRatchetLady && maniacCount !== null) {
      highlights = highlights
        ? `${highlights}. Maniacs on board at end: ${maniacCount}`
        : `Maniacs on board at end: ${maniacCount}`;
    }
    if (isBigBadWolf && wolfMode) {
      highlights = highlights
        ? `${highlights}. Wolf mode at end: ${wolfMode}`
        : `Wolf mode at end: ${wolfMode}`;
    }
    if (isBilly) {
      const buddyParts: string[] = [];
      if (buddiesInPlay !== null)
        buddyParts.push(`Buddies in play at end: ${buddiesInPlay}`);
      if (powerSuppliesShutDown) buddyParts.push('All Power Sources Inactive');
      if (billyFinale) buddyParts.push(`Billy Finale: ${billyFinale}`);
      if (billyFinale === 'Power Surge')
        buddyParts.push(`Boris: ${borisStatus || 'fate not recorded'}`);
      if (buddyParts.length)
        highlights = highlights
          ? `${highlights}. ${buddyParts.join('. ')}`
          : buddyParts.join('. ');
    }
    if(result.location==='Shady Acres'&&childrenAtFinish!==null)highlights=[highlights,`Children on board at finish: ${childrenAtFinish}`].filter(Boolean).join('. ');
    if(result.killer==='The Tormentor')highlights=[highlights,`Tormentor ending: ${tormentorLoss}${tormentorLoss==='trap-terminal'?' (Final Girl died without Final Health)':''}`].filter(Boolean).join('. ');
    if(isGrimlash){const facts=[typeof reviewedGrimState.position==='number'?`Harvest Madness position ${reviewedGrimState.position}, ${harvestLevel(reviewedGrimState.position)===4?'Skull':`Level ${harvestLevel(reviewedGrimState.position)}`}`:'',typeof reviewedGrimState.peak==='number'?`Recorded Madness peak position ${reviewedGrimState.peak}`:'',grimLoss==='skull'||grimLoss==='telluric'?`Game lost: ${grimLoss}`:'',harvestMadnessPeaked?'Legacy Madness peaked observation; exact position unknown':''];highlights=[highlights,...facts].filter(Boolean).join('. ');}
    if (isBerith) {
      const demonParts: string[] = [];
      if (isWin && ursulaSaved) demonParts.push('Ursula saved');
      highlights = [highlights, ...demonParts].filter(Boolean).join('. ');
    }
    if (isAbbey && abbeyInfluence) highlights = [highlights, `L'Armes Abbey influence: ${abbeyInfluence}`].filter(Boolean).join('. ');
    if (isShriek) {
      const shriekParts = [
        finalKillerIdentity !== 'Unknown' ? `Final killer identity: ${finalKillerIdentity}` : '',
        mortRevealed === true ? 'Mort was revealed' : mortRevealed === false ? 'Mort remained hidden' : '',
      ];
      highlights = [highlights, ...shriekParts].filter(Boolean).join('. ');
    }
    if (isFalconwood && (missionProgress.trim() || friendJoined.trim())) {
      const falconParts: string[] = [];
      if (missionCompleted) {
        if (friendJoined.trim())
          falconParts.push(
            `Friend who joined the fight: ${friendJoined.trim()}`,
          );
      } else if (missionCompleted === false) {
        if (missionProgress.trim())
          falconParts.push(`Mission progress: ${missionProgress.trim()}`);
      }
      highlights = [highlights, ...falconParts].filter(Boolean).join('. ');
    }
    const formData: EndingFormData = {
      ...(isFalconwood && {falconwoodReview:falconwoodReview(recordedMission,result.mission,missionCompleted)}),
      ...(isSlayer && {slayerReview: {finalDimension: endingDimension === 'Our Dimension' ? 'our' :
        endingDimension === 'Mirror Dimension' ? 'mirror' : null}}),
      ...(result.location==='Shady Acres'&&{childrenOnBoardAtFinish:childrenAtFinish}),
      ...(result.killer==='The Tormentor'&&{tormentorReview:{loss:tormentorLoss}}),
      ...(isGrimlash&&{grimlashReview:{loss:grimLoss}}),
      ...(result.location==='USS Konrad'&&{konradReview:{fate:shipFate}}),
      ...(isOrganism&&!isWin&&organismLossType&&{organismLoss:organismLossType}),
      outcome: isWin ? 'won' : 'lost',
      finalHorrorLevel,
      finalGirlHealth,
      killerHealth: isIntruders || isOrganism ? result.killerHealth ?? null : killerIsUnkillable ? null : killerHealth,
      weaponUsed: weaponUsed || '',
      victimsSaved,
      victimsKilled,
      roundsPlayed,
      endingSubLocation: endingSubLocation || '',
      gameHighlights: highlights,
      ...(isPoltergeist&&{poltergeistReview:{carolynRescued:foundCarolyn?true:null,floppyAtEscape:foundMrFloppy?true:null,epicRequired:polterPower.known?polterPower.epic:null,...(result.location==='Creech Manor'?{escapeRoute:!foundCarolyn?null:escapeRoute==='helicopter'?'helicopter' as const:escapeRoute==='exit'?'exit' as const:null}:{})}}),
    };
    return formData;
  };
  const handleContinue = () => { if (textDraft.flush()) onContinue(buildFormData()); };
  const playSummary = useMemo(() => summarizePlay(result.playEvents), [result.playEvents]);
  const suggestedWeapons = useMemo(() => [
    ...selectionItems(result).filter(item => /damage|attack|weapon/i.test(item.effect)).map(item => item.name),
    ...entries.filter(entry => entry.kind === 'moment' && entry.momentType === 'item' && entry.detail)
      .map(entry => entry.detail!),
  ], [entries, result]);
  const hasRecordedTotals = [playSummary.saved, playSummary.killed, playSummary.round, playSummary.finalGirlHealth,
    playSummary.killerHealth, playSummary.finalHorrorLevel].some(value => value != null);

  return (
    <div
      className={`outcome-form${isWin ? " outcome-form--won" : " outcome-form--lost"}`}
      onBlurCapture={() => { textDraft.flush(); }}
    >
      <div className="outcome-review-line">
        <ol className="outcome-steps" aria-label="Ending progress">
          <li aria-current="step">
            <span>1</span> Review
          </li>
          <li>
            <span>2</span> Ending
          </li>
        </ol>
        <p>Review your final totals. Blank fields stay unrecorded.</p>
      </div>
      <section className="outcome-panel outcome-result" aria-label="Game result">
        <OutcomeSelect label="Game result" value={isWin ? 'won' : 'lost'} onValueChange={value => setReviewedOutcome(value as 'won' | 'lost')}>
          <option value="won" disabled={fatalEnding}>Won</option>
          <option value="lost">Lost</option>
        </OutcomeSelect>
        {fatalEnding && <p role="status">Recorded {[
          fatalMall && 'Savior death', fatalShip && 'ship fate', fatalTormentor && 'trap outcome', fatalGrim && 'Harvest Madness',
        ].filter(Boolean).join(' and ')} requires a loss. Health and victim totals stay as recorded.</p>}
      </section>
      <div className="outcome-counters" aria-label="Final game totals">
        <OutcomeNumberField
          label="Victims saved"
          accessibleLabel="Victims Saved"
          value={victimsSaved}
          onChange={setVictimsSaved}
          max={999}
          variant="saved"
          prominent
        />
        <OutcomeNumberField
          label="Victims killed"
          accessibleLabel="Victims Killed"
          value={victimsKilled}
          onChange={setVictimsKilled}
          max={999}
          variant="killed"
          prominent
        />
        <OutcomeNumberField
          label="Final round"
          accessibleLabel="Final round"
          value={roundsPlayed}
          onChange={setRoundsPlayed}
          min={1}
          max={999}
          variant="round"
          prominent
        />
      </div>
      <div className="outcome-detail-grid">
        <section
          className="outcome-panel outcome-final-totals"
          aria-labelledby="outcome-final-totals-title"
        >
          <div className="outcome-panel-heading">
            <h2 id="outcome-final-totals-title">Final Totals</h2>
            <p>{hasRecordedTotals ? 'Starting values come from Play. Adjust anything you need to correct.' : 'Enter what you recorded. Blank fields stay unrecorded.'}</p>
          </div>
          <div className="outcome-fields">
            {isGrimlash&&finalGirlHealth!==null&&finalGirlHealth>maxFinalGirlHealth&&<p role="status">Recorded Health {finalGirlHealth} exceeds the current maximum {maxFinalGirlHealth}.</p>}
            <OutcomeNumberField
              label={`Final Girl health (0–${maxFinalGirlHealth})`}
              accessibleLabel="Final Girl Health"
              value={finalGirlHealth}
              onChange={setFinalGirlHealth}
              max={maxFinalGirlHealth}
              preserveObservedExcess={isGrimlash}
              variant={finalGirlHealth === 0 ? "killed" : "saved"}
            />
            {!killerIsUnkillable && !isIntruders && !isOrganism && (result.killer!=='The Hunter'||hunterState(moduleState(entries,'hunter')).phase==='mark-x') && (
              <OutcomeNumberField
                label={`Killer health (0–${maxKillerHealth})`}
                accessibleLabel="Killer Health"
                value={killerHealth}
                onChange={setKillerHealth}
                max={maxKillerHealth}
                variant="killed"
              />
            )}
            <OutcomeNumberField
              label="Final Horror level (0–7)"
              accessibleLabel="Final Horror Level"
              value={finalHorrorLevel}
              onChange={setFinalHorrorLevel}
              max={7}
            />
            <div className="outcome-text-field">
              <span>Weapon used</span>
              <SuggestionInput
                label="Weapon Used"
                value={weaponUsed}
                onChange={setWeaponUsed}
                placeholder="Add a weapon…"
                options={suggestedWeapons}
                browseLabel="Browse weapons"
              />
            </div>
          </div>
        </section>
        {(hasKillerDetails || hasLocationDetails) && <div className="outcome-module-stack">
        {hasKillerDetails && <section className="outcome-modules" aria-labelledby="outcome-killer-details">
          <h2 id="outcome-killer-details" className="outcome-module-group-title">Killer details</h2>
          {/* Section: Poltergeist win conditions */}
          {isPoltergeist && isWin && (
            <div className="outcome-panel outcome-module space-y-3">
              <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
                Poltergeist rescue review
              </h3>
              {isPoltergeist&&<p className="text-sm text-muted-foreground">Confirm the physical escape. {polterPower.epic?'The Epic Power requires Mr. Floppy too.':polterPower.revealed&&!polterPower.known?'The revealed Power name is unknown.':''}</p>}
              {result.location === 'Creech Manor' && <>
                <OutcomeSelect label="Carolyn rescue route" value={escapeRoute} onValueChange={setEscapeRoute}>
                  <option value="">Not recorded</option><option value="exit">Exit</option><option value="helicopter">Helicopter</option>
                </OutcomeSelect>
                <p>Confirm the physical route. Helicopter is a separate rescue route.</p>
              </>}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foundCarolyn}
                    onChange={(e) => setFoundCarolyn(e.target.checked)}
                    className="w-4 h-4 accent-secondary"
                  />
                  <span className="type-label text-foreground">
                    Rescued Carolyn
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foundMrFloppy}
                    onChange={(e) => setFoundMrFloppy(e.target.checked)}
                    className="w-4 h-4 accent-secondary"
                  />
                  <span className="type-label text-foreground">
                    Escaped with Mr. Floppy
                  </span>
                </label>
              </div>
            </div>
          )}

          {isOrganism && <section className="outcome-panel outcome-module" aria-label="Organism ending review">
            <h3>The Organism at the finish</h3>
            <p>{organismFacts(moduleState(entries,ORGANISM_MODULE),entries)||"Roster unrecorded."}</p>
            {result.killerHealth!=null&&<small className="block">Legacy Killer Health entry: {result.killerHealth}</small>}
          </section>}
          {isOrganism && !isWin && <section className="outcome-panel outcome-module">
            <OutcomeChoices label="How did you lose?" value={organismLossType}
              onChange={value => setOrganismLossType(value as typeof organismLossType)} options={[["caught", "Caught by the Organism"], ["assimilated", "Assimilated"]]} />
          </section>}

          {isEvomorph && <section className="outcome-panel outcome-module">
            <OutcomeChoices label="Evomorph stage at finish" value={evomorphStage}
              onChange={value => setEvomorphStage(value as typeof evomorphStage)} options={[["Hatchling", "Hatchling"], ["Youngling", "Youngling"], ["Adult", "Adult"]]} />
          </section>}

          {/* Section: Ratchet Lady - maniacs */}
          {isRatchetLady && (
            <div className="outcome-panel outcome-module space-y-3">
              <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
                Asylum Status
              </h3>
              <OutcomeNumberField label="Maniacs on board at finish" accessibleLabel="Maniacs on board at finish"
                value={maniacCount} onChange={setManiacCount} max={6} />
            </div>
          )}

          {isBigBadWolf && <section className="outcome-panel outcome-module">
            <OutcomeChoices label="Wolf mode at finish" value={wolfMode}
              onChange={value => setWolfMode(value as typeof wolfMode)} options={[["TRACK", "Track"], ["SLAY", "Slay"], ["Killing Machine", "Track and Slay"]]} />
          </section>}

          {result.killer==='The Hunter'&&<section className="outcome-panel outcome-module" aria-label="Hunter ending review"><h3>Hunter at the finish</h3><p>{hunterFacts(moduleState(entries,'hunter'),entries)}</p></section>}
          {isIntruders && <section className="outcome-panel outcome-module" aria-label="Intruders ending review">
            <h3>Intruders at the finish</h3>
            <p>{intruderFacts(intruderEnding)}</p>
            {legacyIntruder&&<small className="block">Legacy active marker entry: {legacyIntruder}</small>}
            {result.killerHealth!=null&&<small className="block">Legacy Killer Health entry: {result.killerHealth}</small>}
          </section>}

          {/* Section: Buddyland - Buddies + power supplies */}
          {isBilly && (
            <div className="outcome-panel outcome-module outcome-module--billy space-y-3">
              <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
                Billy’s Buddies & Power
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="buddies-in-play"
                    className="type-caption text-muted-foreground"
                  >
                    Buddies in Play at End (0–7)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Not recorded"
                    id="buddies-in-play"
                    value={buddiesInPlay === null ? "" : String(buddiesInPlay)}
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? null
                          : Math.min(
                              7,
                              Math.max(0, Math.trunc(Number(e.target.value))),
                            );
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
                      onChange={(e) =>
                        setPowerSuppliesShutDown(e.target.checked)
                      }
                      className="w-4 h-4 accent-secondary"
                    />
                    <span className="type-label text-foreground">
                      All Power Sources Inactive
                    </span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <OutcomeSelect
                    value={billyFinale}
                    label="Billy Finale (optional)"
                    onValueChange={setBillyFinale}
                  >
                    <option value="">Not recorded</option>
                    {[...BILLY_FINALES, { id: 'other', name: 'Other Finale' }].sort((a,b) => a.name.localeCompare(b.name)).map(
                      (f) => (
                        <option key={f.id} value={f.name}>
                          {f.name}
                        </option>
                      ),
                    )}
                  </OutcomeSelect>
                </div>
                {billyFinale === "Power Surge" && (
                  <div className="space-y-1">
                    <OutcomeSelect
                      value={borisStatus}
                      label="Boris at Game End"
                      onValueChange={setBorisStatus}
                    >
                      <option value="">Not recorded</option>
                      <option value="defeated">Defeated</option>
                      <option value="still in play">Still in play</option>
                    </OutcomeSelect>
                    <p className="type-caption text-muted-foreground">
                      Power Surge requires defeating both Billy and Boris to
                      win.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.killer === 'The Tormentor' && <section className="outcome-panel outcome-module" aria-label="Tormentor ending review">
            <h3>Tormentor ending</h3>
            <OutcomeSelect label="Tormentor loss record" value={tormentorLoss} onValueChange={v => setTormentorLoss(v as TormentorLoss)}>
              <option value="unknown">Not recorded</option><option value="none">No special loss recorded</option>
              <option value="trap-terminal">Killed by terminal Death Trap</option>
              <option value="no-escape">No Escape · all Exits locked at Killer phase start</option>
              <option value="endless-traps">Endless Traps · no Victim trap cards left</option>
            </OutcomeSelect>
            {fatalTormentor && <p>{tormentorLoss === 'trap-terminal' ? 'No Final Health was revealed.' : 'Physical death is unconfirmed.'}</p>}
          </section>}
          {isGrimlash && <section className="outcome-panel outcome-module" aria-label="Grimlash ending review">
            <h3>Harvest Madness</h3>
            <p>{typeof reviewedGrimState.position === 'number' ? `Position ${reviewedGrimState.position} · ${harvestLevel(reviewedGrimState.position) === 4 ? 'Skull' : `Level ${harvestLevel(reviewedGrimState.position)}`}` : 'Position not recorded'}
              {typeof reviewedGrimState.peak === 'number' && ` · Recorded peak ${reviewedGrimState.peak}`}</p>
            <OutcomeSelect label="Madness loss record" value={grimLoss} onValueChange={v => setGrimLoss(v as GrimlashLoss)}>
              <option value="unknown">Not recorded</option><option value="none">No Madness loss recorded</option>
              <option value="skull">Reached the skull</option><option value="telluric">Telluric Visions loss</option>
            </OutcomeSelect>
            {retractingSkull && <p>Saving this correction also leaves the earlier skull position and skull peak unrecorded.</p>}
            {harvestMadnessPeaked && <p>Legacy peaked record: exact level and position unknown.</p>}
          </section>}

          {/* Section: Berith / A Demon in the Shadows */}
          {isBerith && isWin && (
            <div className="outcome-panel outcome-module space-y-3">
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
                  <span className="type-label text-foreground">
                    Ursula Saved
                  </span>
                </label>
              )}
            </div>
          )}

          {/* Section: Shriek / MegaBGCon */}
          {isShriek && (
            <div className="outcome-panel outcome-module space-y-3">
              <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
                Shriek Reveal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <OutcomeSelect
                    value={finalKillerIdentity}
                    label="Final Killer Identity"
                    onValueChange={setFinalKillerIdentity}
                  >
                    {[
                      "Unknown",
                      "Hans",
                      "Geppetto",
                      "Dr. Fright",
                      "Inkanyamba",
                      "Big Bad Wolf",
                      "Ratchet Lady",
                      "Evomorph",
                      "The Organism",
                      "The Intruders",
                      "Mort",
                    ].map((identity) => (
                      <option key={identity} value={identity}>
                        {identity}
                      </option>
                    ))}
                  </OutcomeSelect>
                </div>
                <OutcomeChoices label="Mort reveal" value={mortRevealed === null ? '' : String(mortRevealed)}
                  onChange={value => setMortRevealed(value === '' ? null : value === 'true')}
                  options={[['true', 'Revealed'], ['false', 'Stayed hidden']]} />
              </div>
            </div>
          )}

          {isSlayer && <section className="outcome-panel outcome-module">
            <OutcomeChoices label="Dimension at finish" value={endingDimension}
              onChange={value => setEndingDimension(value as typeof endingDimension)}
              options={[['Our Dimension', 'Our Dimension'], ['Mirror Dimension', 'Mirror Dimension']]} />
          </section>}
        </section>}
        {hasLocationDetails && <section className="outcome-modules" aria-labelledby="outcome-location-details">
          {result.location===MALL&&<section className="outcome-panel outcome-module" aria-label="Mall ending review"><h3>Sunnydaze at the finish</h3><p>{mallFacts(moduleState(entries,MALL_MODULE))}</p></section>}
          <h2 id="outcome-location-details" className="outcome-module-group-title">Location details</h2>
          {result.location === 'USS Konrad' && <section className="outcome-panel outcome-module" aria-label="USS Konrad ending review">
            <h3>Ship ending</h3>
            <OutcomeSelect label="Reviewed ship fate" value={shipFate} onValueChange={v => setShipFate(v as KonradFate)}>
              <option value="unknown">Fate not recorded</option><option value="survived">Survived ship hazard</option>
              <option value="airlock-loss">Lost to Airlock · no Final Health reveal</option>
              <option value="explosion-loss">Lost outside Exit · Self Destruct</option>
            </OutcomeSelect>
          </section>}
          {result.location === 'Shady Acres' && <section className="outcome-panel outcome-module" aria-label="Shady Acres ending review">
            <h3>Shady Acres</h3>
            <OutcomeSelect label="Children on board at finish" value={childrenAtFinish == null ? '' : String(childrenAtFinish)}
              onValueChange={value => setChildrenAtFinish(value === '' ? null : Number(value))}>
              <option value="">Not recorded</option>{[0, 1, 2, 3].map(n => <option key={n} value={String(n)}>{n}</option>)}
            </OutcomeSelect>
          </section>}
          {isAbbey && <section className="outcome-panel outcome-module">
            <OutcomeChoices label="L’Armes Abbey influence" value={abbeyInfluence}
              onChange={value => setAbbeyInfluence(value as typeof abbeyInfluence)}
              options={[['Blessings Dominated', 'Blessings dominated'], ['Curses Dominated', 'Curses dominated'], ['Balanced', 'Balanced']]} />
          </section>}
          {/* Section: Falconwood Mission */}
          {isFalconwood && (
            <div className="outcome-panel outcome-module space-y-3">
              <h3 className="font-display text-xs tracking-[0.15em] uppercase text-muted-foreground border-b border-border/50 pb-1.5">
                The Mission
              </h3>
              {result.mission && (
                <p className="type-caption text-muted-foreground/80 italic">
                  {result.mission}
                </p>
              )}
              <OutcomeChoices label="Mission result" value={missionCompleted === null ? '' : String(missionCompleted)}
                onChange={value => setMissionCompleted(value === '' ? null : value === 'true')}
                options={[['true', 'Completed'], ['false', 'Incomplete']]} />
              <p className="type-caption text-muted-foreground">{falconwoodReviewText(falconwoodReview(recordedMission,result.mission,missionCompleted))}</p>
              {showLegacyMissionNotes && missionCompleted ? (
                <div className="space-y-1">
                  <label htmlFor="friend-joined" className="type-caption text-muted-foreground">
                    Friend Who Joined You
                  </label>
                  <input
                    type="text"
                    id="friend-joined" value={friendJoined}
                    onChange={(e) => setFriendJoined(e.target.value)}
                    placeholder="Your father, your friend, the researcher..."
                    className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-secondary/50 transition-colors"
                  />
                </div>
              ) : showLegacyMissionNotes && missionCompleted === false && (
                <div className="space-y-1">
                  <label htmlFor="mission-progress" className="type-caption text-muted-foreground">
                    Mission Progress
                  </label>
                  <input
                    type="text"
                    id="mission-progress" value={missionProgress}
                    onChange={(e) => setMissionProgress(e.target.value)}
                    placeholder="One clue short, halfway through the code..."
                    className="w-full h-11 px-3 bg-muted/50 border border-border/50 rounded-sm type-body-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              )}
            </div>
          )}

        </section>}
        </div>}
      </div>
      <section
        className="outcome-panel outcome-last-moments"
        aria-labelledby="outcome-last-moments-title"
      >
        <div className="outcome-panel-heading">
          <h2 id="outcome-last-moments-title">The last moments</h2>
          <p>Where did it end, and what made it memorable?</p>
        </div>
        <div className="outcome-last-fields">
          <div className="outcome-text-field">
            <span>Ending location</span>
            <SuggestionInput
              label="Ending Location"
              value={endingSubLocation}
              onChange={setEndingSubLocation}
              placeholder="Where did it end?"
              options={PLAY_ROOMS[result.location] ?? ENDING_BOARD_SPACES[result.location] ?? []}
              browseLabel="Browse board spaces"
            />
          </div>
          <label className="outcome-text-field">
            <span>Game highlights</span>
            <textarea
              aria-label="Game Highlights"
              value={gameHighlights}
              onChange={(event) => setGameHighlights(event.target.value)}
              placeholder="Close calls, turning points, the final blow…"
              rows={3}
            />
          </label>
        </div>
      </section>
      {isFalconwood && isWin && missionCompleted !== true && <p role="status">Confirm mission completion before saving a win.</p>}
      {textDraft.saveFailed && <p role="alert">Your latest text could not be saved. Keep this page open and free browser storage, then <button type="button" onClick={textDraft.flush}>retry saving</button>.</p>}
      <div className="outcome-actions">
        <button
          type="button"
          disabled={isFalconwood && isWin && missionCompleted !== true}
          onClick={handleContinue}
          className="outcome-continue"
        >
          Generate ending <ArrowRight size={21} aria-hidden="true" />
        </button>
        {onSaveResult && (
          <button type="button" className="outcome-save-only" disabled={isFalconwood && isWin && missionCompleted !== true} onClick={() => {
            if (textDraft.flush()) onSaveResult(buildFormData());
          }}>Save record only</button>
        )}
        {onSaveResult && (
          <div className="outcome-options">
            <button
              type="button"
              aria-expanded={optionsOpen}
              aria-controls="outcome-options-menu"
              onClick={() => setOptionsOpen((open) => !open)}
            >
              More options <ChevronDown size={13} aria-hidden="true" />
            </button>
            {optionsOpen && (
              <div id="outcome-options-menu">
                <button type="button" className="outcome-discard-action" onClick={() => {setOptionsOpen(false); onDiscard();}}>Discard game…</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
