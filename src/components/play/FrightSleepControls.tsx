import { IllustratedTile } from "./IllustratedTile";
import { atlasCell } from "./killerPresentation";
import cardsArt from "@/assets/play/fright/cards.webp";

/** Both entry points record the same atomic sleep/deck transition. */
export function FrightSleepControls({
  sleep,
  forced = false,
  forcedReason = "Face Your Fright",
  disabled = false,
  pending = false,
  compact = false,
  onChange,
}: {
  sleep: "awake" | "asleep" | "unknown";
  forced?: boolean;
  forcedReason?: string;
  disabled?: boolean;
  pending?: boolean;
  compact?: boolean;
  onChange: (sleep: "awake" | "asleep") => void;
}) {
  return (
    <div
      className={`fright-sleep-grid${compact ? " fright-sleep-grid--compact" : ""}`}
      role="group"
      aria-label="Final Girl sleep state"
    >
      {(["awake", "asleep"] as const).map((value, index) => (
        <IllustratedTile
          key={value}
          art={atlasCell(cardsArt, 7 + index, 1254, 1254)}
          title={value === "awake" ? "Awake" : "Asleep"}
          status={
            sleep === value
              ? "Recorded"
              : value === "awake"
                ? "Normal world"
                : "The Boiler Room"
          }
          aria-label={`Record Final Girl ${value === "awake" ? "Awake" : "Asleep"}`}
          aria-pressed={sleep === value}
          aria-description={
            pending
              ? "Resolve the pending attack before switching sleep state."
              : forced && value === "awake"
                ? `${forcedReason} keeps you Asleep.`
                : undefined
          }
          disabled={
            disabled ||
            pending ||
            sleep === value ||
            (forced && value === "awake")
          }
          onClick={() => onChange(value)}
        />
      ))}
    </div>
  );
}
