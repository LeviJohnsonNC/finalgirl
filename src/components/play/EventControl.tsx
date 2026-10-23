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
  allowed = true,
  onActivate,
  onEnd,
  onClear,
  children,
  className = "",
  tileClassName = "",
}: {
  name: string;
  value?: string;
  ended?: string;
  art: ModuleArt;
  effect?: string;
  allowed?: boolean;
  onActivate: () => unknown;
  onEnd: () => unknown;
  onClear: () => unknown;
  children?: ReactNode;
  className?: string;
  tileClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const active = value === "active";
  return (
    <article
      data-module-control="event"
      className={`module-event ${className}`}
      data-state={value ?? "unrecorded"}
    >
      <IllustratedTile
        className={`module-control-tile ${tileClassName}`}
        art={art}
        title={name}
        status={
          active
            ? "Active · View details"
            : value
              ? "Ended"
              : "Not recorded · Activate"
        }
        aria-label={`${active || (value && allowed) ? "View" : allowed ? "Activate" : "Correct linked status for"} ${name}`}
        aria-disabled={!active && !allowed}
        aria-pressed={active}
        onClick={() => {
          if (value !== undefined) setOpen(!open);
          else if (allowed) onActivate();
        }}
      />
      {effect && <p className="module-control-help">{effect}</p>}
      {active && (
        <button
          className="module-end"
          aria-label={`End effect: ${name}`}
          onClick={onEnd}
        >
          End effect
        </button>
      )}
      {children}
      {value !== undefined && (
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
