import { ModuleArtwork } from "./ModuleArtwork";
import liveHeart from "@/assets/play/geppetto/heart-live.webp";
import spentHeart from "@/assets/play/geppetto/heart-spent.webp";

const heartArt = (filled: boolean) => ({
  src: filled ? liveHeart : spentHeart,
  fit: "meet" as const,
});

/** Slots visualize one numeric health value. Clicking any filled/empty token
 * removes/restores exactly one health, never jumps to a slot's index. */
export function HealthTokens({
  name,
  health,
  onChange,
  maxHealth = 2,
  disabled = false,
}: {
  name: string;
  health: number;
  maxHealth?: number;
  disabled?: boolean;
  onChange: (health: number) => void;
}) {
  return (
    <div
      className="play-health-tokens"
      role="group"
      aria-label={`${name} health`}
    >
      {Array.from({ length: maxHealth }, (_, index) => index).map((index) => {
        const filled = index < health;
        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            aria-pressed={filled}
            aria-label={`${filled ? "Remove" : "Restore"} one ${name} health, heart ${index + 1}`}
            onClick={() => onChange(health + (filled ? -1 : 1))}
          >
            <ModuleArtwork art={heartArt(filled)} />
          </button>
        );
      })}
    </div>
  );
}
