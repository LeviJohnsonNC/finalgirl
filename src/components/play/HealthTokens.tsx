import { ModuleArtwork } from "./ModuleArtwork";
import hearts from "@/assets/play/geppetto/cards.webp";

// Original approved jeweled-heart pair: live (7), spent (8).
const heartArt = (filled: boolean) => ({src: hearts, atlas: {
  width: 1254, height: 1254, x: (filled ? 1 : 2) * 418 + 3,
  y: 2 * 418 + 3, cellWidth: 412, cellHeight: 412,
}});

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
