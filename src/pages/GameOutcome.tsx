import {tormentorState} from '@/lib/play/tormentor';
import {grimlashFatal} from '@/lib/play/grimlash';
import {moduleState} from '@/lib/play/modules';
import {summarizePlay} from '@/lib/play/events';
import { GameResult } from "@/hooks/useGameHistory";
import { GameOutcomeForm } from "@/components/GameOutcomeForm";
import { EndingFormData } from "./TheEnd";
import type { CSSProperties } from "react";
import { LOCATION_IMAGES_AI } from "@/types/gameData";
import buddylandBanner from "@/assets/outcome/buddyland-banner.webp";
import caseSurface from "@/assets/outcome/case-surface.webp";

interface GameOutcomeProps {
  result: GameResult;
  introStory?: string;
  initialDraft?: Record<string, unknown>;
  onDraftChange?: (fields: Record<string, unknown>) => boolean;
  onSaveResult?: (formData: EndingFormData) => void;
  onContinue: (formData: EndingFormData) => void;
  onDiscard: () => void;
}

const GameOutcome = ({
  result,
  introStory,
  onContinue,
  onDiscard,
  initialDraft,
  onDraftChange,
  onSaveResult,
}: GameOutcomeProps) => {
  const grimLoss=initialDraft?.grimlashLoss??moduleState(summarizePlay(result.playEvents).entries,'grimlash').loss;
  const fatalGrim=result.killer==='Grimlash'&&grimlashFatal({loss:typeof grimLoss==='string'?grimLoss:'unknown'});
  const shipFate=initialDraft?.konradFate??moduleState(summarizePlay(result.playEvents).entries,'konrad').fate;
  const fatalShip=result.location==='USS Konrad'&&['airlock-loss','explosion-loss'].includes(String(shipFate));
  const trapLoss=initialDraft?.tormentorLoss??tormentorState(moduleState(summarizePlay(result.playEvents).entries,'tormentor')).loss;
  const fatalTrap=result.killer==='The Tormentor'&&!['none','unknown'].includes(String(trapLoss));
  const reviewedOutcome=fatalTrap||fatalGrim||fatalShip?'lost':(result.killer==='The Tormentor'||result.killer==='Grimlash'||result.location==='USS Konrad')&&['won','lost'].includes(String(initialDraft?.reviewedOutcome))?initialDraft!.reviewedOutcome:result.outcome;
  const isWin = reviewedOutcome === "won";
  const locationArt =
    result.location === "Buddyland"
      ? buddylandBanner
      : (LOCATION_IMAGES_AI[result.location] ?? caseSurface);

  return (
    <div
      className="outcome-review"
      data-outcome={reviewedOutcome}
      data-location={result.location}
      style={
        { "--outcome-location-art": `url("${locationArt}")` } as CSSProperties
      }
    >
      <header className="outcome-hero">
        <img
          className="outcome-hero-art"
          src={locationArt}
          alt=""
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = caseSurface;
          }}
        />
        <div className="outcome-hero-copy">
          <h1>{isWin ? "VICTORY" : "DEFEAT"}</h1>
          <p className="outcome-matchup">
            {result.finalGirl} vs {result.killer}
          </p>
          <p className="outcome-location">at {result.location}</p>
        </div>
      </header>

      {/* Form */}
      <GameOutcomeForm
        result={result}
        introStory={introStory}
        initialDraft={initialDraft}
        onDraftChange={onDraftChange}
        onSaveResult={onSaveResult}
        onContinue={onContinue}
        onDiscard={onDiscard}
      />
    </div>
  );
};

export default GameOutcome;
