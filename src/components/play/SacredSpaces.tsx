import { useRef } from "react";
import { IllustratedTile } from "./IllustratedTile";
import { grovesSite } from "./grovesArt";
import { GROVES_SACRED } from "../../../supabase/functions/_shared/play/groves";
import {
  cycleSacredTokens,
  sacredTokens,
  sacredTokenNames,
  tokensAt,
  type Placements,
} from "./sacredSpaceTokens";
import type { ModuleValue } from "@/lib/play/modules";

export function SacredSpaces({
  state,
  disabled,
  onChange,
}: {
  state: Placements;
  disabled?: boolean;
  onChange: (changes: Record<string, ModuleValue>) => unknown;
}) {
  const editors = useRef<Record<string, HTMLDetailsElement | null>>({});
  return (
    <section>
      <h3>Sacred spaces</h3>
      <div className="groves-site-grid">
        {GROVES_SACRED.map((site, i) => {
          const tokens = tokensAt(state, site.id);
          const unknown = sacredTokens.some(
            (k) => typeof state[k] !== "string",
          );
          return (
            <article className="groves-site" key={site.id}>
              <IllustratedTile
                className="module-control-tile"
                art={grovesSite(i, tokens)}
                title={site.name}
                status={[
                  ...tokens.map((k) => sacredTokenNames[k]),
                  ...(unknown
                    ? ["Tokens not fully recorded"]
                    : tokens.length
                      ? []
                      : ["No tokens"]),
                ].join(" · ")}
                aria-label={`Cycle tokens: ${site.name}`}
                disabled={disabled}
                onClick={() => {
                  const changes = cycleSacredTokens(state, site.id);
                  if (changes) onChange(changes);
                  else {
                    const editor = editors.current[site.id];
                    if (editor) {
                      editor.open = true;
                      editor.querySelector("button")?.focus();
                    }
                  }
                }}
              >
                {tokens.length > 1 && (
                  <span className="groves-token-count">
                    {tokens.length} tokens
                  </span>
                )}
              </IllustratedTile>
              <details
                className="groves-token-editor"
                ref={(el) => {
                  editors.current[site.id] = el;
                }}
              >
                <summary>
                  Adjust tokens<span className="sr-only">: {site.name}</span>
                </summary>
                <div role="group" aria-label={`${site.name} tokens`}>
                  {sacredTokens.map((k) => (
                    <div key={k}>
                      <button
                        disabled={disabled}
                        aria-pressed={state[k] === site.id}
                        aria-label={`${sacredTokenNames[k]} at ${site.name}`}
                        onClick={() =>
                          onChange({
                            [k]: state[k] === site.id ? "none" : site.id,
                          })
                        }
                      >
                        {sacredTokenNames[k]}
                        {typeof state[k] !== "string" && (
                          <small>Not recorded</small>
                        )}
                      </button>
                      {typeof state[k] !== "string" && (
                        <button
                          disabled={disabled}
                          aria-label={`Record ${sacredTokenNames[k]} not placed`}
                          onClick={() => onChange({ [k]: "none" })}
                        >
                          Not placed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            </article>
          );
        })}
      </div>
    </section>
  );
}
