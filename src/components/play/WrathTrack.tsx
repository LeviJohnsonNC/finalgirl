import type { ReactNode } from "react";
import { wrathBackground } from "./wrathPresentation";
import "@/styles/wrath-track.css";

/** Presentation only: setting a physical level never resolves an Unleash. */
export function WrathTrack({
  kind,
  value,
  disabled,
  onChange,
  children,
}: {
  kind: "killer" | "divine";
  value?: number;
  disabled?: boolean;
  onChange: (value: number) => unknown;
  children?: ReactNode;
}) {
  const name = kind === "killer" ? "Killer Wrath" : "Divine Wrath";
  const prefix = kind === "killer" ? "ink" : "groves";
  const backdrop = wrathBackground(kind, value);
  return (
    <section
      className={`wrath-board wrath-board--${kind}`}
      aria-label={`${name} tracker`}
      data-wrath-stage={backdrop.stage ?? "unknown"}
    >
      <img
        className="wrath-background"
        src={backdrop.src}
        alt=""
        decoding="async"
      />
      <header className="wrath-heading">
        <div>
          <span className="wrath-eyebrow">
            {kind === "killer" ? "The Avenger" : "The gods are watching"}
          </span>
          <h3>{name}</h3>
        </div>
        <output aria-label={`Current ${name}`} aria-live="polite">
          {value ?? "?"}
          <small>/10</small>
        </output>
      </header>
      <div
        className={`wrath-track ${prefix}-track`}
        role="group"
        aria-label={`${name} level`}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            aria-label={`Set ${name} to ${n}`}
            aria-pressed={value === n}
            data-filled={value !== undefined && n < value}
            disabled={disabled}
            onClick={() => {
              if (value !== n) onChange(n);
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="wrath-adjust">
        <button
          aria-label={`Decrease ${name}`}
          disabled={disabled || value === undefined || value <= 1}
          onClick={() => onChange(value! - 1)}
        >
          −
        </button>
        <span>{value === undefined ? "Not recorded" : name}</span>
        <button
          aria-label={`Increase ${name}`}
          disabled={disabled || value === undefined || value >= 10}
          onClick={() => onChange(value! + 1)}
        >
          +
        </button>
      </div>
      {children}
    </section>
  );
}
