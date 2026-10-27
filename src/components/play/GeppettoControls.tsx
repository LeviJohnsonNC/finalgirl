import { modulePhoto } from "./modulePhotos";
import { useModuleRecord } from "./useModuleRecord";
import { KillerCards } from "./KillerCards";
import { MinorPowerGroup } from "./MinorPowerGroup";
import { MinorPowerControl } from "./MinorPowerControl";
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
import type { ModuleArt } from "./ModuleArtwork";
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
  const { record, message } = useModuleRecord(events, onEvent);
  const power = GEPPETTO_POWERS.find((c) => c.id === state.power),
    finale = GEPPETTO_FINALES.find((c) => c.id === state.finale);
  const change = (changes: Record<string, ModuleValue>) =>
    record(
      newPlayEvent({
        kind: "module",
        moduleData: { module: "geppetto", changes },
      }),
    );
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
            Each Puppet ignores its first damage each turn.
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
      </div>
      {power?.id === "immortal-master" && (
        <p className="geppetto-quiet">
          {counts.recorded && counts.onBoard === 3
            ? "All three are recorded on board: protect Geppetto’s Final Health token."
            : "Check the physical board before applying its protection."}
        </p>
      )}
      <details className="geppetto-details">
        <summary>Minor Dark Powers</summary>
        <p className="geppetto-quiet">
          Separate Health: remove these markers before Geppetto’s ordinary
          Health. Tap a filled heart to remove one, or an empty heart to restore
          one.
        </p>
        <MinorPowerGroup className="geppetto-minors module-minor-grid">
          {GEPPETTO_MINOR_POWERS.map((c, row) => {
            const value = state[`minor.${c.id}.health`],
              health = typeof value === "number" ? value : undefined;
            return (
              <MinorPowerControl
                key={c.id}
                name={c.name}
                health={health}
                art={(health) => minorCell(row, health)}
                heroArt={modulePhoto("Geppetto", 7 + row)}
                heartArt={squareCell(cardsAtlas, 7)}
                onChange={(health) =>
                  change({ [`minor.${c.id}.health`]: health })
                }
              />
            );
          })}
        </MinorPowerGroup>
      </details>
      <KillerCards killer="Geppetto" events={events} onEvent={onEvent} />
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
