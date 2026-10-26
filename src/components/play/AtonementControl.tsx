import { useState, type ReactNode } from "react";
import {
  atonementWrath,
  INKANYAMBA_ATONEMENT,
} from "../../../supabase/functions/_shared/play/inkanyamba";
import { PlaySelect } from "./PlaySelect";
import "@/styles/play-atonement.css";
export interface AtonementTarget {
  id: "divine" | "killer";
  label: string;
  wrath?: number;
}
/** Final successes already include physical rerolls, conversions and Prayer Book. */
export function AtonementControl({
  targets,
  onResolve,
  disabled = false,
  title = "Atonement",
  children,
}: {
  targets: AtonementTarget[];
  onResolve: (target: "divine" | "killer", successes: 1 | 2 | 3) => unknown;
  disabled?: boolean;
  title?: string;
  children?: ReactNode;
}) {
  const [chosen, setChosen] = useState(targets[0]?.id ?? "divine");
  const target = targets.find((t) => t.id === chosen) ?? targets[0];
  return (
    <details className="wrath-atonement">
      <summary>{title}</summary>
      <p>
        Use your final success count, including Prayer Book and conversions.
      </p>
      {targets.length > 1 && (
        <PlaySelect
          aria-label="Atonement target"
          value={target.id}
          disabled={disabled}
          onChange={(e) => setChosen(e.target.value as "divine" | "killer")}
        >
          {targets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} · {t.wrath ?? "not recorded"}
            </option>
          ))}
        </PlaySelect>
      )}
      <div
        className="wrath-outcomes"
        role="group"
        aria-label={`Record Atonement ${target.label} outcome`}
      >
        {([1, 2, 3] as const).map((n) => (
          <button
            key={n}
            disabled={
              disabled ||
              target.wrath === undefined ||
              atonementWrath(target.wrath, n) === target.wrath
            }
            onClick={() => onResolve(target.id, n)}
          >
            <span>
              {n === 3 ? "3+" : n} {n === 1 ? "success" : "successes"}
            </span>
            <strong>
              {target.wrath === undefined
                ? "Not recorded"
                : `${target.wrath} → ${atonementWrath(target.wrath, n)}`}
            </strong>
          </button>
        ))}
      </div>
      <p>
        0 successes: increase Horror by 1 and lose 2 Time; Wrath does not
        change.
      </p>
      <details className="module-card-rules">
        <summary>
          Rules<span className="sr-only">: Atonement</span>
        </summary>
        <p>{INKANYAMBA_ATONEMENT}</p>
      </details>
      {children}
    </details>
  );
}
