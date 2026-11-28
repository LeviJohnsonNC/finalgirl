import { HealthTokens } from "./HealthTokens";
import { ModuleArtwork, type ModuleArt } from "./ModuleArtwork";
import "@/styles/play-controls.css";
import "@/styles/cinematic-controls.css";

type MinorPowerProps = {
  name: string;
  disabled?: boolean;
  heroArt?: ModuleArt;
  choiceArt?: ModuleArt;
  className?: string;
} & (
  | {
      mode?: "health";
      health?: number;
      maxHealth?: number;
      growing?: boolean;
      art: (health: number) => ModuleArt;
      onChange: (health: number | null) => unknown;
      previouslyRevealed?: boolean;
      observation?: string;
    }
  | {
      mode: "presence";
      active: boolean;
      art: ModuleArt;
      onChange: (active: boolean) => unknown;
    }
);

export function MinorPowerControl(props: MinorPowerProps) {
  const { name, heroArt, choiceArt, className = "", disabled = false } = props;
  const presence = props.mode === "presence";
  const health = presence ? undefined : props.health;
  const maxHealth = (!presence ? props.maxHealth : undefined) ?? 2;
  const previouslyRevealed = !presence && props.previouslyRevealed;
  const active = presence ? props.active : health !== undefined && health > 0;
  const showScene = active || health !== undefined;
  const status = active && presence ? "Active"
    : health === undefined ? (previouslyRevealed ? "Revealed earlier · health not recorded" : "Not recorded")
    : !presence && props.growing ? (health===0 ? 'Removed · 0 health' : health+' health')
    : health === 0 ? `Removed · 0/${maxHealth} health`
    : `${health}/${maxHealth} health`;
  const recordLabel = presence ? "Discard" : "Clear record";
  const reveal = () => presence ? props.onChange(true) : props.onChange(maxHealth);
  const clear = () => presence ? props.onChange(false) : props.onChange(null);
  const picture = (
    <ModuleArtwork
      art={heroArt ?? (presence ? props.art : { ...props.art(health ?? maxHealth), fit: "meet" })}
    />
  );
  return (
    <article
      aria-label={name}
      data-module-control="minor-power"
      className={`module-minor module-cinematic-minor ${className}`}
      data-active={active}
      data-state={
        presence && active ? "active" : health === undefined
          ? "unrecorded"
          : health === 0
            ? "removed"
            : health < maxHealth
              ? "weakened"
              : "full"
      }
    >
      {!showScene ? (
        <button
          type="button"
          className="module-minor-choice"
          disabled={disabled}
          aria-label={`${previouslyRevealed ? "Record full health for" : "Reveal"} ${name}`}
          onClick={reveal}
        >
          <span className="module-minor-art">{choiceArt ? <ModuleArtwork art={choiceArt} /> : picture}</span>
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
              {!presence && props.observation ? `${props.observation} · ${status}` : status}
            </p>
            {!presence && health !== undefined && (
              props.growing ? <div className="minor-count-buttons">
                <button type="button" aria-label={'Remove one Health from '+name} disabled={disabled||health===0} onClick={()=>props.onChange(health-1)}>−</button>
                <button type="button" aria-label={'Add one Health to '+name} disabled={disabled} onClick={()=>props.onChange(health+1)}>+</button>
              </div> : <HealthTokens
                name={name}
                health={health}
                maxHealth={maxHealth}
                disabled={disabled}
                onChange={props.onChange}
              />
            )}
          </div>
        </div>
      )}
      {(!presence || active) && (
        <button
          type="button"
          className="module-minor-clear"
          disabled={disabled}
          aria-label={presence ? `Discard ${name}` : `Clear record: ${name}`}
          onClick={clear}
        >
          {recordLabel}
        </button>
      )}
    </article>
  );
}
