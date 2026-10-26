import { WrathTrack } from "./WrathTrack";
import { useModuleRecord } from "./useModuleRecord";
import { KillerCards } from "./KillerCards";
import { MinorPowerControl } from "./MinorPowerControl";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import { moduleState, type ModuleValue } from "@/lib/play/modules";
import {
  INKANYAMBA_POWERS,
  INKANYAMBA_FINALES,
  INKANYAMBA_MINOR_POWERS,
} from "../../../supabase/functions/_shared/play/inkanyamba";
import { inkanyambaHero } from "./inkanyambaHeroes";
import { inkanyambaCell } from "./inkanyambaArt";
import type { ControlsProps } from "./moduleDefinitions";
import "@/styles/play-inkanyamba.css";

export function InkanyambaControls({
  events,
  onEvent,
  blocked,
}: ControlsProps) {
  const entries = summarizePlay(events).entries;
  const state = moduleState(entries, "inkanyamba");
  const { record, message } = useModuleRecord(events, onEvent);
  const wrath = typeof state.wrath === "number" ? state.wrath : undefined;
  const power = INKANYAMBA_POWERS.find((c) => c.id === state.power);
  const finale = INKANYAMBA_FINALES.find((c) => c.id === state.finale);
  const change = (changes: Record<string, ModuleValue>) =>
    record(
      newPlayEvent({
        kind: "module",
        moduleData: { module: "inkanyamba", changes },
      }),
    );
  const activeMinors = INKANYAMBA_MINOR_POWERS.filter(
    (p) => Number(state[`minor.${p.id}.health`]) > 0,
  );
  return (
    <section className="play-inkanyamba" aria-label="Inkanyamba tracking">
      <WrathTrack
        kind="killer"
        value={wrath}
        disabled={blocked}
        onChange={(wrath) => change({ wrath })}
      >
        {(power || activeMinors.length > 0) && (
          <aside className="ink-reminders" aria-label="Power reminders">
            {power && (
              <p>
                <strong>{power.name}:</strong> {power.effect}
              </p>
            )}
            {activeMinors.map((p) => (
              <p key={p.id}>
                <strong>{p.name}:</strong> {p.effect}
              </p>
            ))}
          </aside>
        )}
      </WrathTrack>
      <div className="ink-minors">
        <h3>Minor Dark Powers</h3>
        <div className="ink-minor-grid">
          {INKANYAMBA_MINOR_POWERS.map((p, row) => (
            <MinorPowerControl
              key={p.id}
              name={p.name}
              effect={p.effect}
              health={state[`minor.${p.id}.health`] as number | undefined}
              maxHealth={p.health}
              disabled={blocked}
              art={(h) => inkanyambaCell(8 + row * 4 + 3 - h)}
              heroArt={inkanyambaHero(7 + row)}
              heartArt={inkanyambaCell(7)}
              previouslyRevealed={entries.some(
                (e) =>
                  e.moduleData?.module === "inkanyamba" &&
                  typeof e.moduleData.changes[`minor.${p.id}.health`] ===
                    "number",
              )}
              onChange={(health) =>
                change({ [`minor.${p.id}.health`]: health })
              }
            />
          ))}
        </div>
      </div>
      <KillerCards
        killer="Inkanyamba"
        events={events}
        onEvent={onEvent}
        disabled={blocked}
      />
      {finale?.id === "we-need-a-miracle" && (
        <div className="ink-miracle">
          <button
            disabled={blocked || state.miracleResolved === true}
            onClick={() => change({ wrath: 10, miracleResolved: true })}
          >
            {state.miracleResolved === true
              ? "Finale Wrath change recorded"
              : "Record Finale Wrath → 10"}
          </button>
        </div>
      )}
      {message && (
        <p role="alert" className="play-module-error">
          {message}
        </p>
      )}
    </section>
  );
}
