import { useModuleRecord } from "./useModuleRecord";
import { CharacterControl } from "./CharacterControl";
import { KillerCards } from "./KillerCards";
import { MinorPowerControl } from "./MinorPowerControl";
import { atlasCell } from "./killerPresentation";
import minorArt from "@/assets/play/consistent/billy-minors.webp";
import heartArt from "@/assets/play/geppetto/cards.webp";
import { IllustratedTile } from "./IllustratedTile";
import {
  BUDDIES,
  SPECIAL_VICTIMS,
  BILLY_POWERS,
  BUDDYLAND_EVENTS,
  moduleState,
} from "@/lib/play/modules";
import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import "@/styles/play-roster.css";
import "@/styles/play-state-art.css";

const artwork = import.meta.glob<string>("../../assets/play/roster/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const powerArt = import.meta.glob<string>(
  "../../assets/play/states/power-*.webp",
  { eager: true, query: "?url", import: "default" },
);
type PortraitState = "off" | "active" | "killed" | "saved" | "away";
const labels = {
  off: "Not recorded",
  active: "In play",
  killed: "Killed",
  saved: "Saved",
  away: "Away",
};
const nextState: Record<PortraitState, PortraitState> = {
  off: "active",
  active: "killed",
  killed: "off",
  saved: "off",
  away: "off",
};

function CharacterButton({
  id,
  name,
  state,
  victim,
  onChange,
}: {
  id: string;
  name: string;
  state: PortraitState;
  victim?: boolean;
  onChange: (state: PortraitState) => void;
}) {
  const label = state === "killed" && victim ? "Dead" : labels[state];
  const next = nextState[state];
  const action =
    next === "active"
      ? "Mark in play"
      : next === "off"
        ? "Clear record"
        : victim
          ? "Mark dead"
          : "Mark killed";
  return (
    <IllustratedTile
      className="play-character"
      data-state={state}
      aria-label={name + ", " + label + ". " + action}
      onClick={() => onChange(next)}
      title={name}
      status={label}
      art={{
        src: artwork[
          "../../assets/play/roster/" +
            id +
            "-" +
            (state === "saved" ? "active" : state === "away" ? "off" : state) +
            ".webp"
        ],
      }}
    >
      <span className="play-character-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </IllustratedTile>
  );
}

interface Props {
  part?: "killer" | "location" | "both";
  embedded?: boolean;
  killer: string;
  location: string;
  finalGirl: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
}
export function BuddylandControls({
  killer,
  location,
  events,
  onEvent,
  part = "both",
  embedded = false,
}: Props) {
  const summary = summarizePlay(events);
  const entries = summary.entries;
  const billy = moduleState(entries, "billy"),
    venue = moduleState(entries, "buddyland");
  const { record, message } = useModuleRecord(events, onEvent);
  const sourceChange = (
    id: number,
    status: "active" | "inactive" | "set-aside",
  ) =>
    record(
      newPlayEvent({
        kind: "module",
        moduleData: {
          module: "billy",
          changes: { [`source.${id}.status`]: status },
        },
      }),
    );
  const fifthIncluded =
    billy["source.5.status"] === "active" ||
    billy["source.5.status"] === "inactive";
  return (
    <div className="play-modules play-portrait-modules">
      {killer === "Billy the Bear" && part !== "location" && (
        <section aria-label="Billy tracking">
          {!embedded && <h2>Billy &amp; his Buddies</h2>}
          <KillerCards killer={killer} events={events} onEvent={onEvent} />
          <div
            className="play-power-sources"
            role="group"
            aria-label="Power sources"
          >
            <div className="play-power-heading">
              <h3>Power sources</h3>
              {fifthIncluded && (
                <button
                  className="play-power-remove"
                  onClick={() => sourceChange(5, "set-aside")}
                >
                  Remove fifth
                </button>
              )}
            </div>
            <div className="play-power-grid">
              {[1, 2, 3, 4, ...(fifthIncluded ? [5] : [])].map((id) => {
                const value = billy[`source.${id}.status`];
                const on = value === "active";
                const label =
                  value === undefined ? "Not recorded" : on ? "On" : "Off";
                return (
                  <button
                    key={id}
                    className="play-power-token"
                    data-state={
                      value === undefined ? "unrecorded" : on ? "on" : "off"
                    }
                    aria-pressed={on}
                    aria-label={`Power source ${id}, ${label}. Turn ${on ? "off" : "on"}`}
                    onClick={() => sourceChange(id, on ? "inactive" : "active")}
                  >
                    <img
                      src={
                        powerArt[`../../assets/play/states/power-${id}.webp`]
                      }
                      alt=""
                      decoding="async"
                    />
                    <span>
                      <strong>Source {id}</strong>
                      <small>{label}</small>
                    </span>
                  </button>
                );
              })}
              {!fifthIncluded && (
                <button
                  className="play-power-add"
                  onClick={() => sourceChange(5, "active")}
                  aria-label="Add fifth power source"
                >
                  <span>+</span>Fifth source
                </button>
              )}
            </div>
          </div>
          <div className="play-character-grid">
            {[...BUDDIES]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((b) => {
                const value = billy["buddy." + b.id + ".status"];
                const state =
                  value === "active"
                    ? "active"
                    : value === "defeated"
                      ? "killed"
                      : "off";
                return (
                  <CharacterButton
                    key={b.id}
                    id={b.id}
                    name={b.name}
                    state={state}
                    onChange={(next) => {
                      const prefix = "buddy." + b.id;
                      // Keep the existing streamlined-roster correction semantics.
                      const changes = {
                        [prefix + ".status"]:
                          next === "active"
                            ? "active"
                            : next === "killed"
                              ? "defeated"
                              : null,
                        ...Object.fromEntries(
                          ["health", "room", "withBilly", "waiting"]
                            .filter(
                              (field) =>
                                billy[prefix + "." + field] !== undefined,
                            )
                            .map((field) => [prefix + "." + field, null]),
                        ),
                        ...(billy.rosterComplete !== undefined
                          ? { rosterComplete: null }
                          : {}),
                      };
                      record(
                        newPlayEvent({
                          kind: "module",
                          moduleData: { module: "billy", changes },
                        }),
                      );
                    }}
                  />
                );
              })}
          </div>
          <h3 className="play-module-subheading">Minor Dark Powers</h3>
          <div className="module-minor-grid module-billy-minors">
            {BILLY_POWERS.filter((p) => "health" in p).map((power, row) => {
              const health = billy[`power.${power.id}.health`];
              return (
                <MinorPowerControl
                  key={power.id}
                  name={power.name}
                  effect={power.effect}
                  health={typeof health === "number" ? health : undefined}
                  previouslyRevealed={
                    billy[`power.${power.id}.revealed`] === true ||
                    typeof billy[`power.${power.id}.active`] === "boolean"
                  }
                  art={(health) =>
                    atlasCell(minorArt, row * 3 + 2 - health, 1536, 1024, 3, 2)
                  }
                  heartArt={atlasCell(heartArt, 7, 1254, 1254)}
                  onChange={(health) =>
                    record(
                      newPlayEvent({
                        kind: "module",
                        moduleData: {
                          module: "billy",
                          changes: {
                            [`power.${power.id}.health`]: health,
                            [`power.${power.id}.active`]:
                              health === null ? null : health > 0,
                            [`power.${power.id}.revealed`]:
                              health === null ? null : true,
                          },
                        },
                      }),
                    )
                  }
                />
              );
            })}
          </div>
        </section>
      )}
      {location === "Buddyland" && part !== "killer" && (
        <section aria-label="Buddyland tracking">
          {!embedded && <h2>Inside Buddyland</h2>}
          <div className="play-character-grid">
            {[...SPECIAL_VICTIMS]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((v) => {
                const value = venue["victim." + v.id];
                const state =
                  value === "on-board"
                    ? "active"
                    : value === "killed"
                      ? "killed"
                      : value === "saved"
                        ? "saved"
                        : value === "away"
                          ? "away"
                          : "off";
                return (
                  <CharacterControl
                    key={v.id}
                    name={v.name}
                    className="buddyland-person"
                    tileClassName="buddyland-portrait"
                    value={typeof value === "string" ? value : undefined}
                    present="on-board"
                    help={BUDDYLAND_EVENTS.find(event=>event.name===v.event)?.effect}
                    art={{
                      src: artwork[
                        "../../assets/play/roster/" +
                          v.id +
                          "-" +
                          (state === "killed"
                            ? "killed"
                            : state === "active" || state === "saved"
                              ? "active"
                              : "off") +
                          ".webp"
                      ],
                    }}
                    states={[
                      { value: "on-board", label: "In play" },
                      { value: "saved", label: "Saved" },
                      { value: "killed", label: "Killed" },
                      { value: "away", label: "Away" },
                    ]}
                    outcomes={["saved", "killed"]}
                    onChange={(value) =>
                      record(
                        newPlayEvent({
                          kind: "module",
                          moduleData: {
                            module: "buddyland",
                            changes: { ["victim." + v.id]: value },
                          },
                        }),
                      )
                    }
                  />
                );
              })}
          </div>
        </section>
      )}
      <p role="status" className="play-feedback">
        {message}
      </p>
    </div>
  );
}
