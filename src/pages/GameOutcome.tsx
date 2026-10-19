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
  const isWin = result.outcome === "won";
  const locationArt =
    result.location === "Buddyland"
      ? buddylandBanner
      : (LOCATION_IMAGES_AI[result.location] ?? caseSurface);

  return (
    <div
      className="outcome-review"
      data-outcome={result.outcome}
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
