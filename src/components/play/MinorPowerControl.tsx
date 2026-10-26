import { HealthTokens } from "./HealthTokens";
import { PlaySelect } from "./PlaySelect";
import { ModuleArtwork, type ModuleArt } from "./ModuleArtwork";
import "@/styles/play-controls.css";
import "@/styles/cinematic-controls.css";

export function MinorPowerControl({
  name,
  effect,
  health,
  art,
  heroArt,
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
  heroArt?: ModuleArt;
  heartArt: ModuleArt;
  onChange: (health: number | null) => unknown;
  className?: string;
  previouslyRevealed?: boolean;
}) {
  const active = health !== undefined && health > 0;
  const status =
    health === undefined
      ? previouslyRevealed
        ? "Revealed earlier · health not recorded"
        : "Not recorded"
      : health === 0
        ? `Removed · 0/${maxHealth} health`
        : `${health}/${maxHealth} health`;
  const picture = (
    <ModuleArtwork
      art={{
        ...(active && health === maxHealth && heroArt
          ? heroArt
          : art(health ?? maxHealth)),
        fit: "meet",
      }}
    />
  );
  return (
    <article
      data-module-control="minor-power"
      className={`module-minor module-cinematic-minor ${className}`}
      data-active={active}
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
      {health === undefined ? (
        <button
          type="button"
          className="module-minor-choice"
          disabled={disabled}
          aria-label={`${previouslyRevealed ? "Record full health for" : "Reveal"} ${name}`}
          onClick={() => onChange(maxHealth)}
        >
          <span className="module-minor-art">{picture}</span>
          <span className="module-minor-choice-copy">
            <span className="cinematic-eyebrow">Minor Dark Power</span>
            <strong>{name}</strong>
            <span className="module-health-status">{status}</span>
            <span className="module-minor-action">
              {previouslyRevealed ? "Record health" : "Reveal power"} →
            </span>
          </span>
        </button>
      ) : (
        <div className="module-minor-scene">
          <div className="module-minor-art">{picture}</div>
          <div className="module-minor-body">
            <span className="cinematic-eyebrow">Minor Dark Power</span>
            <h3>{name}</h3>
            <p className="module-health-status" aria-live="polite">
              {status}
            </p>
            <HealthTokens
              name={name}
              health={health}
              art={heartArt}
              maxHealth={maxHealth}
              disabled={disabled}
              onChange={onChange}
            />
          </div>
        </div>
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
