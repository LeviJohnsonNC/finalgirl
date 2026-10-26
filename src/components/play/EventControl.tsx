import { useState, type ReactNode } from "react";
import { IllustratedTile } from "./IllustratedTile";
import type { ModuleArt } from "./ModuleArtwork";
import "@/styles/play-controls.css";

export function EventControl({
  name,
  value,
  ended = "ended",
  art,
  effect,
  reminder,
  allowed = true,
  onActivate,
  onEnd,
  onClear,
  children,
  className = "",
  tileClassName = "",
  interaction = "details",
}: {
  name: string;
  value?: string;
  ended?: string;
  art: ModuleArt;
  effect?: string;
  reminder?: ReactNode;
  allowed?: boolean;
  onActivate: () => unknown;
  onEnd: () => unknown;
  onClear: () => unknown;
  children?: ReactNode;
  className?: string;
  tileClassName?: string;
  /** Only independent, reversible presence observations opt into toggling. */
  interaction?: "details" | "toggle";
}) {
  const [open, setOpen] = useState(false);
  const active = value === "active";
  return (
    <article
      data-module-control="event"
      className={`module-event ${interaction === "toggle" ? "module-cinematic-toggle" : ""} ${className}`}
      data-state={value ?? "unrecorded"}
    >
      <IllustratedTile
        className={`module-control-tile ${tileClassName}`}
        art={art}
        title={name}
        status={
          active
            ? interaction === "toggle"
              ? "Active · Click to end"
              : "Active · View details"
            : value
              ? "Ended"
              : "Not recorded · Activate"
        }
        aria-label={`${interaction === "toggle" ? (active ? "End effect:" : "Activate") : active || (value && allowed) ? "View" : allowed ? "Activate" : "Correct linked status for"} ${name}`}
        aria-disabled={!active && !allowed}
        aria-pressed={active}
        onClick={() => {
          if (interaction === "toggle") {
            if (active) onEnd();
            else if (allowed) onActivate();
          } else if (value !== undefined) setOpen(!open);
          else if (allowed) onActivate();
        }}
      />
      {effect && (
        <details className="module-card-rules">
          <summary>
            Rules<span className="sr-only">: {name}</span>
          </summary>
          <p>{effect}</p>
        </details>
      )}
      {active && reminder && (
        <p className="module-active-reminder">{reminder}</p>
      )}
      {active && interaction !== "toggle" && (
        <button
          className="module-end"
          aria-label={`End effect: ${name}`}
          onClick={onEnd}
        >
          End effect
        </button>
      )}
      {children}
      {value !== undefined && interaction !== "toggle" && (
        <details
          className="module-correction"
          open={open}
          onToggle={(event) => setOpen(event.currentTarget.open)}
        >
          <summary>
            Change status<span className="sr-only">: {name}</span>
          </summary>
          {value === ended && (
            <button disabled={!allowed} onClick={onActivate}>
              Reactivate<span className="sr-only">: {name}</span>
            </button>
          )}
          <button aria-label={`Clear record: ${name}`} onClick={onClear}>
            Clear record<span className="sr-only">: {name}</span>
          </button>
        </details>
      )}
    </article>
  );
}
