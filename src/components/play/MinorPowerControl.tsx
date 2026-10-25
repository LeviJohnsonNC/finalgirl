import { HealthTokens } from "./HealthTokens";
import { PlaySelect } from "./PlaySelect";
import { ModuleArtwork, type ModuleArt } from "./ModuleArtwork";
import "@/styles/play-controls.css";

export function MinorPowerControl({
  name,
  effect,
  health,
  art,
  heartArt,
  onChange,
  className = "",
  previouslyRevealed = false,
  maxHealth = 2,
  disabled = false,
}: {
  name: string;
  effect: string;
  health?: number;
  maxHealth?: number;
  disabled?: boolean;
  art: (health: number) => ModuleArt;
  heartArt: ModuleArt;
  onChange: (health: number | null) => unknown;
  className?: string;
  previouslyRevealed?: boolean;
}) {
  return (
    <article
      data-module-control="minor-power"
      className={`module-minor ${className}`}
      data-state={
        health === undefined
          ? "unrecorded"
          : health === 0
            ? "removed"
            : health < maxHealth
              ? "weakened"
              : "full"
      }
    >
      <div className="module-minor-art">
        <ModuleArtwork art={art(health ?? maxHealth)} />
        <h3>{name}</h3>
      </div>
      <p className="module-health-status" aria-live="polite">
        {health === undefined
          ? previouslyRevealed
            ? "Revealed earlier · health not recorded"
            : "Not recorded"
          : health === 0
            ? `Removed · 0/${maxHealth} health`
            : `${health}/${maxHealth} health`}
      </p>
      {health === undefined ? (
        <button
          className="module-reveal"
          disabled={disabled}
          onClick={() => onChange(maxHealth)}
        >
          {previouslyRevealed ? "Record full health for" : "Reveal"} {name}
        </button>
      ) : (
        <>
          <HealthTokens
            name={name}
            health={health}
            art={heartArt}
            maxHealth={maxHealth}
            disabled={disabled}
            onChange={onChange}
          />
        </>
      )}
      <details className="module-correction">
        <summary>
          Details &amp; corrections<span className="sr-only">: {name}</span>
        </summary>
        <p className="module-control-help">{effect}</p>
        <PlaySelect
          aria-label={`${name} health correction`}
          disabled={disabled}
          value={health === undefined ? "" : String(health)}
          onChange={(event) =>
            onChange(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
        >
          <option value="">Not recorded</option>
          {Array.from(
            { length: maxHealth },
            (_, index) => maxHealth - index,
          ).map((value) => (
            <option key={value} value={value}>
              {value}/{maxHealth} health
            </option>
          ))}
          <option value="0">Removed · 0/{maxHealth} health</option>
        </PlaySelect>
        <button
          disabled={disabled}
          aria-label={`Clear record: ${name}`}
          onClick={() => onChange(null)}
        >
          Clear record<span className="sr-only">: {name}</span>
        </button>
        <p className="module-control-help">
          Clears the observation; does not undo damage on your board.
        </p>
      </details>
    </article>
  );
}
