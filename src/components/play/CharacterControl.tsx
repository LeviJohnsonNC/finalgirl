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
  onOutcome,
  help,
  showRules = true,
  showStatusEditor = true,
  reactivateFrom = [],
  reminder,
  className = "",
  tileClassName = "",
  outcomes = [],
  allowOutcomeCorrections = false,
}: {
  name: string;
  value?: string;
  states: readonly CharacterState[];
  present: string;
  art: ModuleArt;
  onChange: (value: string | null) => unknown;
  /** Outcome resolution may collect choices; corrections still use onChange. */
  onOutcome?: (value: string) => unknown;
  help?: ReactNode;
  showRules?: boolean;
  /** Compact special characters can expose only their explicit outcomes. */
  showStatusEditor?: boolean;
  reactivateFrom?: readonly string[];
  reminder?: ReactNode;
  className?: string;
  tileClassName?: string;
  outcomes?: readonly string[];
  /** Keep compact outcome actions available to correct an already recorded outcome. */
  allowOutcomeCorrections?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const current = states.find((state) => state.value === value);
  const active = value === present;
  const addable = !value || reactivateFrom.includes(value);
  const outcomesEnabled = active || (allowOutcomeCorrections && outcomes.includes(value ?? ""));
  const discloses = !addable && showStatusEditor;
  return (
    <article
      data-module-control="character"
      className={`module-character ${className}`}
      data-state={value ?? "unrecorded"}
    >
      <IllustratedTile
        className={`module-control-tile ${tileClassName}`}
        art={art}
        title={name}
        data-state={value ?? "unrecorded"}
        status={current?.label ?? "Not recorded · Add"}
        aria-label={addable ? `Add ${name}` : showStatusEditor ? `View ${name}` : name}
        disabled={!addable && !showStatusEditor}
        aria-expanded={discloses ? open : undefined}
        aria-controls={discloses ? id : undefined}
        onClick={() => {
          if (addable) onChange(present);
          else if (showStatusEditor) setOpen(!open);
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
              disabled={!outcomesEnabled}
              aria-pressed={value === outcome}
              aria-label={`Mark ${name} ${outcome}`}
              onClick={() =>
                onOutcome ? onOutcome(outcome) : onChange(outcome)
              }
            >
              {states.find((state) => state.value === outcome)?.label}
            </button>
          ))}
        </div>
      )}
      {active && reminder && (
        <p className="module-active-reminder">{reminder}</p>
      )}
      {showStatusEditor && <details
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
        </div>
      </details>}
      {showRules && help && (
        <details className="module-card-rules">
          <summary>
            Rules<span className="sr-only">: {name}</span>
          </summary>
          <div>{help}</div>
        </details>
      )}
    </article>
  );
}
