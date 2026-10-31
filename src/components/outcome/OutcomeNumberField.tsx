import { useId } from "react";
import { Minus, Plus, X } from "lucide-react";

interface OutcomeNumberFieldProps {
  label: string;
  accessibleLabel: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max: number;
  variant?: string;
  prominent?: boolean;
  preserveObservedExcess?: boolean;
}

/** Blank is unknown, zero is a recorded observation. Neither is inferred. */
export function OutcomeNumberField({
  label,
  accessibleLabel,
  value,
  onChange,
  min = 0,
  max,
  variant = "neutral",
  prominent = false,
  preserveObservedExcess = false,
}: OutcomeNumberFieldProps) {
  const id = useId();
  const bounded = (n: number) => Math.min(preserveObservedExcess ? Math.max(max,value??max) : max, Math.max(min, Math.trunc(n)));
  return (
    <div
      className={`outcome-number outcome-number--${variant}${prominent ? " outcome-counter" : ""}`}
      data-unrecorded={value === null}
    >
      <div className="outcome-number-heading">
        <label htmlFor={id}>{label}</label>
        {value !== null && (
          <button
            type="button"
            className="outcome-clear"
            aria-label={`Clear ${accessibleLabel}`}
            onClick={() => onChange(null)}
            title="Leave unrecorded"
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="outcome-stepper">
        <button
          type="button"
          aria-label={`Decrease ${accessibleLabel}`}
          disabled={value === null || value <= min}
          onClick={() => value !== null && onChange(bounded(value - 1))}
        >
          <Minus size={17} aria-hidden="true" />
        </button>
        <input
          id={id}
          aria-label={accessibleLabel}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value ?? ""}
          placeholder="Unrecorded"
          autoComplete="off"
          onChange={(event) => {
            const text = event.target.value;
            const next = Number(text);
            onChange(
              text.trim() === "" || !Number.isFinite(next)
                ? null
                : bounded(next),
            );
          }}
        />
        <button
          type="button"
          aria-label={`Increase ${accessibleLabel}`}
          disabled={value !== null && value >= max}
          onClick={() => onChange(bounded((value ?? 0) + 1))}
        >
          <Plus size={17} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
