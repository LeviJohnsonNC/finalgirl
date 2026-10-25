import { AtonementControl } from "./AtonementControl";
import { useModuleRecord } from "./useModuleRecord";
import { KillerCards } from "./KillerCards";
import { MinorPowerControl } from "./MinorPowerControl";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import { moduleState, type ModuleValue } from "@/lib/play/modules";
import {
  INKANYAMBA_POWERS,
  INKANYAMBA_FINALES,
  INKANYAMBA_MINOR_POWERS,
  INKANYAMBA_UNLEASH,
  INKANYAMBA_PRE_FINALE,
  atonementWrath,
} from "../../../supabase/functions/_shared/play/inkanyamba";
import { inkanyambaCell } from "./inkanyambaArt";
import type { ControlsProps } from "./moduleDefinitions";
import "@/styles/play-inkanyamba.css";

export function InkanyambaControls({
  events,
  location,
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
      <div className="ink-wrath">
        <div className="ink-wrath-heading">
          <div>
            <span className="ink-eyebrow">THE AVENGER</span>
            <h3>Killer Wrath</h3>
          </div>
          <output aria-live="polite" aria-label="Current Killer Wrath">
            {wrath ?? "?"}
            <small>/10</small>
          </output>
        </div>
        <div className="ink-track" role="group" aria-label="Killer Wrath level">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              aria-label={`Set Killer Wrath to ${n}`}
              aria-pressed={wrath === n}
              disabled={blocked}
              data-filled={wrath !== undefined && n <= wrath}
              onClick={() => {
                if (wrath !== n) change({ wrath: n });
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="ink-adjust">
          <button
            aria-label="Decrease Killer Wrath"
            disabled={blocked || wrath === undefined || wrath <= 1}
            onClick={() => change({ wrath: wrath! - 1 })}
          >
            −
          </button>
          <span>{wrath === undefined ? "Not recorded" : "Killer Wrath"}</span>
          <button
            aria-label="Increase Killer Wrath"
            disabled={blocked || wrath === undefined || wrath >= 10}
            onClick={() => change({ wrath: wrath! + 1 })}
          >
            +
          </button>
        </div>
        <div className="ink-unleash">
          <span className="ink-bolt" aria-hidden="true">
            ϟ
          </span>
          <div>
            <h4>Unleash{wrath !== undefined ? ` · Level ${wrath}` : ""}</h4>
            <p>
              {wrath === undefined
                ? "Set the current level to see its Unleash effects."
                : INKANYAMBA_UNLEASH[wrath - 1]}
            </p>
          </div>
        </div>
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
        {location !== "Sacred Groves" ? <AtonementControl title="Atonement & corrections" targets={[{id:"killer",label:"Killer Wrath",wrath}]} disabled={blocked} onResolve={(_target,successes)=>change({wrath:atonementWrath(wrath!,successes)})}>
          <button disabled={blocked || wrath === undefined} onClick={()=>change({wrath:null})}>Clear Wrath record</button>
        </AtonementControl> : <details className="ink-details"><summary>Wrath corrections</summary>
          <p>Atonement in the Sacred Groves panel lets you choose either Wrath track.</p>
          <button disabled={blocked || wrath === undefined} onClick={()=>change({wrath:null})}>Clear Wrath record</button>
        </details>}
      </div>
      <div className="ink-action">
        <h4>
          {state.finaleRevealed
            ? (finale?.name ?? "Finale name not recorded")
            : "Pre-Finale action"}
        </h4>
        <p>
          {state.finaleRevealed
            ? (finale?.effect ??
              "Name the revealed Finale to see its instructions.")
            : INKANYAMBA_PRE_FINALE}
        </p>
        {finale?.id === "we-need-a-miracle" && (
          <div className="ink-miracle">
            <p>
              When revealed: take up to 6 Time worth of Action cards into your
              hand.
            </p>
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
      </div>
      <KillerCards
        killer="Inkanyamba"
        events={events}
        onEvent={onEvent}
        disabled={blocked}
      />
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
      <details className="ink-details">
        <summary>Wrath reference</summary>
        <ol>
          {INKANYAMBA_UNLEASH.map((effect, i) => (
            <li key={effect}>
              <strong>{i + 1}.</strong> {effect}
            </li>
          ))}
        </ol>
        <p>
          Tracker corrections do not resolve Power triggers, Horror, health,
          attacks or casualties.
        </p>
      </details>
      {message && (
        <p role="alert" className="play-module-error">
          {message}
        </p>
      )}
    </section>
  );
}
