import { useId, useState, type ReactNode } from "react";
import { IllustratedTile } from "./IllustratedTile";
import { PlaySelect } from "./PlaySelect";
import type { ModuleArt } from "./ModuleArtwork";
import "@/styles/play-controls.css";

export interface CharacterState {
  value: string;
  label: string;
}
/** Portraits add or disclose. Outcomes and corrections are deliberate actions. */
export function CharacterControl({
  name,
  value,
  states,
  present,
  art,
  onChange,
  help,
  className = "",
  tileClassName = "",
  outcomes = [],
}: {
  name: string;
  value?: string;
  states: readonly CharacterState[];
  present: string;
  art: ModuleArt;
  onChange: (value: string | null) => unknown;
  help?: ReactNode;
  className?: string;
  tileClassName?: string;
  outcomes?: readonly string[];
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const current = states.find((state) => state.value === value);
  const active = value === present;
  return (
    <article
      className={`module-character ${className}`}
      data-state={value ?? "unrecorded"}
    >
      <IllustratedTile
        className={`module-control-tile ${tileClassName}`}
        art={art}
        title={name}
        data-state={value ?? "unrecorded"}
        status={current?.label ?? "Not recorded · Add"}
        aria-label={`${value ? "View" : "Add"} ${name}`}
        aria-expanded={value ? open : undefined}
        aria-controls={value ? id : undefined}
        onClick={() => {
          if (!value) onChange(present);
          else setOpen(!open);
        }}
      />
      {outcomes.length > 0 && (
        <div
          className="module-outcomes"
          role="group"
          aria-label={`${name} outcome`}
        >
          {outcomes.map((outcome) => (
            <button
              key={outcome}
              disabled={!active}
              aria-pressed={value === outcome}
              aria-label={`Mark ${name} ${outcome}`}
              onClick={() => onChange(outcome)}
            >
              {states.find((state) => state.value === outcome)?.label}
            </button>
          ))}
        </div>
      )}
      <details
        className="module-correction"
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary>
          Change status<span className="sr-only">: {name}</span>
        </summary>
        <div id={id}>
          <PlaySelect
            aria-label={`${name} status`}
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value || null)}
          >
            <option value="">Not recorded</option>
            {states.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </PlaySelect>
          <p className="module-control-help">Correct a mistaken record here.</p>
        </div>
      </details>
      {help && <p className="module-control-help">{help}</p>}
    </article>
  );
}
