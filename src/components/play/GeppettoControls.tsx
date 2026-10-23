import { useEffect, useRef, useState } from "react";
import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import {
  moduleState,
  GEPPETTO_PUPPETS,
  GEPPETTO_POWERS,
  GEPPETTO_MINOR_POWERS,
  GEPPETTO_FINALES,
  PUPPET_STATUSES,
  geppettoPuppetCounts,
  geppettoSpawnChanges,
  initialGeppettoPuppets,
  type ModuleValue,
  type PuppetStatus,
} from "@/lib/play/modules";
import puppetAtlas from "@/assets/play/geppetto/puppets.webp";
import cardsAtlas from "@/assets/play/geppetto/cards.webp";
import minorAtlas from "@/assets/play/geppetto/minors.webp";
import { IllustratedTile } from "./IllustratedTile";
import { ModuleArtwork, type ModuleArt } from "./ModuleArtwork";
import { PlaySelect } from "./PlaySelect";
import "@/styles/play-geppetto.css";

const squareCell = (src: string, index: number): ModuleArt => ({
  src,
  atlas: {
    width: 1254,
    height: 1254,
    x: (index % 3) * 418 + 3,
    y: Math.floor(index / 3) * 418 + 3,
    cellWidth: 412,
    cellHeight: 412,
  },
});
// Minor-power art uses a 3-by-2 atlas, kept at its original dimensions.
const minorCell = (row: number, health: number): ModuleArt => ({
  src: minorAtlas,
  atlas: {
    width: 1536,
    height: 1024,
    x: (2 - health) * 512 + 3,
    y: row * 512 + 3,
    cellWidth: 506,
    cellHeight: 506,
  },
});
const labels: Record<PuppetStatus, string> = {
  ready: "Ready",
  "on-board": "On board",
  exhausted: "Exhausted",
};
const next: Record<PuppetStatus, PuppetStatus> = {
  ready: "on-board",
  "on-board": "exhausted",
  exhausted: "ready",
};
const actions: Record<PuppetStatus, string> = {
  ready: "Spawn",
  "on-board": "Exhaust",
  exhausted: "Return to Ready",
};

export function GeppettoControls({
  events,
  onEvent,
}: {
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
}) {
  const entries = summarizePlay(events).entries,
    state = moduleState(entries, "geppetto"),
    counts = geppettoPuppetCounts(state);
  const [message, setMessage] = useState("");
  const fingerprint = events.map((e) => e.id).join(",");
  const pending = useRef<string | null>(null);
  useEffect(() => {
    pending.current = null;
  }, [fingerprint]);
  const power = GEPPETTO_POWERS.find((c) => c.id === state.power),
    finale = GEPPETTO_FINALES.find((c) => c.id === state.finale);
  const record = (event: PlayEvent) => {
    if (pending.current === fingerprint) return false;
    pending.current = fingerprint;
    const ok = onEvent(event);
    if (!ok) pending.current = null;
    setMessage(ok ? "" : "This detail could not be saved. Please try again.");
    return ok;
  };
  const change = (changes: Record<string, ModuleValue>) =>
    record(
      newPlayEvent({
        kind: "module",
        moduleData: { module: "geppetto", changes },
      }),
    );
  const reveal = (type: "dark-power" | "finale", name: string) => {
    const existing = entries.find(
      (e) => e.kind === "moment" && e.momentType === type,
    );
    if (existing?.killerCard === name) return;
    record(
      newPlayEvent(
        existing
          ? { kind: "details", target: existing.id, killerCard: name }
          : {
              kind: "moment",
              momentType: type,
              killerCard: name,
              text:
                type === "finale" ? "Finale revealed" : "Dark Power revealed",
              permanent: true,
            },
      ),
    );
  };
  const normal = geppettoSpawnChanges(state, "normal");
  const preview = normal ? geppettoPuppetCounts({ ...state, ...normal }) : null;
  const applySpawn = (kind: "normal" | "one" | "all") => {
    const changes = geppettoSpawnChanges(state, kind);
    if (changes) change(changes);
  };
  return (
    <section className="play-geppetto" aria-label="Geppetto tracking">
      <div className="geppetto-tray-heading">
        <h3>Puppet tray</h3>
        <span aria-live="polite">
          {counts.recorded
            ? `${counts.onBoard} on board · ${counts.ready} ready · ${counts.exhausted} exhausted`
            : "Record the current tray"}
        </span>
      </div>
      {!counts.recorded && (
        <div className="geppetto-setup">
          <p>
            The current puppet tray is not fully recorded. Set each token below,
            or use standard setup if all three are Ready.
          </p>
          <button onClick={() => change(initialGeppettoPuppets())}>
            Set all 3 Ready
          </button>
        </div>
      )}
      <div className="geppetto-puppets">
        {GEPPETTO_PUPPETS.map((puppet, row) => {
          const status = state[`puppet.${puppet.id}.status`] as
            | PuppetStatus
            | undefined;
          const column =
            status === "on-board" ? 1 : status === "exhausted" ? 2 : 0;
          return (
            <article key={puppet.id} data-state={status ?? "unrecorded"}>
              <IllustratedTile
                className="geppetto-puppet-tile"
                art={squareCell(puppetAtlas, row * 3 + column)}
                title={puppet.name}
                status={
                  status
                    ? `${labels[status]} · ${actions[status]}`
                    : "Not recorded · Mark Ready"
                }
                aria-label={`${status ? actions[status] : "Mark Ready"} ${puppet.name}`}
                onClick={() =>
                  change({
                    [`puppet.${puppet.id}.status`]: status
                      ? next[status]
                      : "ready",
                  })
                }
              />
              <PlaySelect
                aria-label={`${puppet.name} status`}
                value={status ?? ""}
                onChange={(e) =>
                  change({
                    [`puppet.${puppet.id}.status`]: e.target.value || null,
                  })
                }
              >
                <option value="">Not recorded</option>
                {PUPPET_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {labels[s]}
                  </option>
                ))}
              </PlaySelect>
              {power?.id === "massive-abominations" && (
                <button
                  className="geppetto-shield"
                  aria-pressed={
                    state[`puppet.${puppet.id}.protectionUsed`] === true
                  }
                  onClick={() =>
                    change({
                      [`puppet.${puppet.id}.protectionUsed`]:
                        state[`puppet.${puppet.id}.protectionUsed`] !== true,
                    })
                  }
                >
                  First hit{" "}
                  {state[`puppet.${puppet.id}.protectionUsed`] === true
                    ? "used"
                    : state[`puppet.${puppet.id}.protectionUsed`] === false
                      ? "available"
                      : "not recorded"}
                  <span className="sr-only"> for {puppet.name}</span>
                </button>
              )}
            </article>
          );
        })}
      </div>
      {power?.id === "massive-abominations" && (
        <div className="geppetto-reminder">
          <p>
            Each Puppet ignores its first damage each turn. Reset these markers
            explicitly for a new turn; they are not extra Health.
          </p>
          <button
            disabled={GEPPETTO_PUPPETS.every(
              (p) => state[`puppet.${p.id}.protectionUsed`] === false,
            )}
            onClick={() =>
              change(
                Object.fromEntries(
                  GEPPETTO_PUPPETS.map((p) => [
                    `puppet.${p.id}.protectionUsed`,
                    false,
                  ]),
                ),
              )
            }
          >
            Reset protection for a new turn
          </button>
        </div>
      )}
      <div className="geppetto-spawn-step">
        <h3>{state.finaleRevealed ? "Finale in play" : "Before the Finale"}</h3>
        {state.finaleRevealed ? (
          <p>
            {finale
              ? finale.effect
              : "Finale revealed, card not specified. Choose its name below for the correct action reference."}
          </p>
        ) : (
          <>
            <p>
              Minions: spawn 1 → target a Victim → move. Geppetto: target the
              closest Final Girl or Victim → attack.
            </p>
            <p>
              {!counts.recorded
                ? "Record all three tokens to use the spawning helper."
                : preview
                  ? `Spawn ${preview.onBoard - counts.onBoard} from Ready, then return ${counts.exhausted} Exhausted to Ready.`
                  : "All three Puppets are on the board; there are no tokens to move."}
            </p>
            <button disabled={!normal} onClick={() => applySpawn("normal")}>
              Apply spawn &amp; ready
            </button>
          </>
        )}
        <p className="geppetto-quiet">
          Resolve movement, attacks and physical placements on your board.
        </p>
      </div>
      {power && (
        <div className="geppetto-active-power">
          <ModuleArtwork
            art={squareCell(cardsAtlas, GEPPETTO_POWERS.indexOf(power))}
          />
          <div>
            <small>REVEALED DARK POWER</small>
            <h3>{power.name}</h3>
            <p>{power.effect}</p>
            {power.id === "immortal-master" && (
              <p>
                {counts.recorded && counts.onBoard === 3
                  ? "All three are recorded on board: protect Geppetto’s Final Health token."
                  : "Check the physical board before applying its protection."}
              </p>
            )}
          </div>
        </div>
      )}
      <details className="geppetto-details">
        <summary>
          Dark Power &amp; Finale
          {state.powerRevealed && !power ? " · power not specified" : ""}
        </summary>
        <p className="geppetto-quiet">
          Choose the revealed card, or correct its name. This uses the same
          reveal as Remember This. Card effects are not automatically resolved.
        </p>
        <h3>Dark Power</h3>
        <div className="geppetto-card-grid">
          {GEPPETTO_POWERS.map((c, i) => (
            <IllustratedTile
              key={c.id}
              art={squareCell(cardsAtlas, i)}
              title={c.name}
              status={
                "epic" in c
                  ? "Epic Dark Power"
                  : state.power === c.id
                    ? "Revealed"
                    : "Choose when revealed"
              }
              aria-pressed={state.power === c.id}
              onClick={() => reveal("dark-power", c.name)}
            />
          ))}
        </div>
        <h3>Finale</h3>
        <div className="geppetto-card-grid">
          {GEPPETTO_FINALES.map((c, i) => (
            <IllustratedTile
              key={c.id}
              art={squareCell(cardsAtlas, i + 4)}
              title={c.name}
              status={
                state.finale === c.id ? "Revealed" : "Choose when revealed"
              }
              aria-pressed={state.finale === c.id}
              onClick={() => reveal("finale", c.name)}
            />
          ))}
        </div>
      </details>
      <details className="geppetto-details">
        <summary>Minor Dark Powers</summary>
        <p className="geppetto-quiet">
          Separate Health: remove these markers before Geppetto’s ordinary
          Health. Tap a filled heart to remove one, or an empty heart to restore
          one.
        </p>
        <div className="geppetto-minors">
          {GEPPETTO_MINOR_POWERS.map((c, row) => {
            const value = state[`minor.${c.id}.health`],
              health = typeof value === "number" ? value : undefined;
            return (
              <article
                key={c.id}
                data-state={
                  health === undefined
                    ? "unrevealed"
                    : health === 0
                      ? "removed"
                      : health === 1
                        ? "weakened"
                        : "full"
                }
              >
                <div className="geppetto-minor-art">
                  <ModuleArtwork art={minorCell(row, health ?? 2)} />
                  <h3>{c.name}</h3>
                </div>
                <p>{c.effect}</p>
                <p aria-live="polite">
                  {health === undefined
                    ? "Not recorded"
                    : health === 0
                      ? "Removed · 0/2 Health"
                      : `${health}/2 Health`}
                </p>
                {health === undefined ? (
                  <button
                    onClick={() => change({ [`minor.${c.id}.health`]: 2 })}
                  >
                    Reveal {c.name}
                  </button>
                ) : (
                  <>
                    <div
                      className="geppetto-hearts"
                      role="group"
                      aria-label={`${c.name} health`}
                    >
                      {[0, 1].map((i) => {
                        const filled = i < health;
                        return (
                          <button
                            key={i}
                            aria-pressed={filled}
                            aria-label={`${filled ? "Remove" : "Restore"} one ${c.name} health, heart ${i + 1}`}
                            onClick={() =>
                              change({
                                [`minor.${c.id}.health`]:
                                  health + (filled ? -1 : 1),
                              })
                            }
                          >
                            <ModuleArtwork
                              art={squareCell(cardsAtlas, filled ? 7 : 8)}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <button
                      className="geppetto-clear"
                      onClick={() => change({ [`minor.${c.id}.health`]: null })}
                    >
                      Stop tracking {c.name}
                    </button>
                  </>
                )}
              </article>
            );
          })}
        </div>
      </details>
      <details className="geppetto-details">
        <summary>Card effects &amp; quick rules</summary>
        <p>
          Normal Puppets have 1 Health and deal 1 damage. Their movement matches
          Geppetto’s printed Movement value. They must finish movement within
          two spaces of him unless No Strings Attached applies. Each Puppet
          completes its Terror-card action before the next Puppet, then Geppetto
          acts, unless the card says otherwise.
        </p>
        <p>
          Some cards spawn tokens outside normal spawning. Check the card and
          physical placements before applying these token changes.
        </p>
        <div className="geppetto-effect-actions">
          <button
            disabled={!geppettoSpawnChanges(state, "one")}
            onClick={() => applySpawn("one")}
          >
            Spawn 1 Ready puppet
          </button>
          <button
            disabled={!geppettoSpawnChanges(state, "all")}
            onClick={() => applySpawn("all")}
          >
            Spawn all remaining Puppets
          </button>
        </div>
        <p className="geppetto-quiet">
          All remaining includes Ready and Exhausted tokens. Use for Remember
          Them? or They’re Coming from Everywhere! when its condition is met. It
          records token placement, not attacks or casualties.
        </p>
      </details>
      <p role="status" aria-live="polite" className="geppetto-save-message">
        {message}
      </p>
    </section>
  );
}
