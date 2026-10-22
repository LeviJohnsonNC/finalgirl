import { useEffect, useRef, useState } from "react";
import { IllustratedTile } from "./IllustratedTile";
import {
  BUDDIES,
  SPECIAL_VICTIMS,
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
const powerArt = import.meta.glob<string>("../../assets/play/states/power-*.webp", { eager: true, query: "?url", import: "default" });
type PortraitState = "off" | "active" | "killed" | "saved" | "away";
const labels = { off: "Off", active: "In play", killed: "Killed", saved: "Saved", away: "Away" };
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
        ? "Turn off"
        : victim
          ? "Mark dead"
          : "Mark killed";
  return (
    <IllustratedTile className="play-character" data-state={state}
      aria-label={name + ", " + label + ". " + action}
      onClick={() => onChange(next)} title={name} status={label}
      art={{ src: artwork["../../assets/play/roster/" + id + "-" + (state === "saved" ? "active" : state === "away" ? "off" : state) + ".webp"] }}>
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
  const [message, setMessage] = useState("");
  const initialized = useRef(false);
  const defaultSources = () => ({
    ...Object.fromEntries([1, 2, 3, 4, 5].filter(i => billy[`source.${i}.status`] === undefined).map(i => [`source.${i}.status`, i === 5 ? "set-aside" : "active"])),
    powerSourcesReady: true,
  });
  useEffect(() => {
    if (part === "location" || killer !== "Billy the Bear" || !summary.tracked || billy.powerSourcesReady || initialized.current) return;
    initialized.current = true;
    if (!onEvent(newPlayEvent({ kind: "module", moduleData: { module: "billy", changes: defaultSources() } }))) {
      initialized.current = false;
      setMessage("Power sources could not be saved. Try a token again.");
    }
    // An initialization is one atomic observation; never overwrite saved source states.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part, killer, summary.tracked, events, onEvent]);
  const sourceChange = (id: number, status: "active" | "inactive" | "set-aside") => {
    const ok = onEvent(newPlayEvent({ kind: "module", moduleData: { module: "billy", changes: {
      ...(!billy.powerSourcesReady ? defaultSources() : {}), [`source.${id}.status`]: status,
    } } }));
    setMessage(ok ? `Power source ${id}: ${status === "active" ? "On" : status === "inactive" ? "Off" : "removed"}.` : "This change could not be saved. Please try again.");
  };
  const fifthIncluded = billy["source.5.status"] === "active" || billy["source.5.status"] === "inactive";
  return (
    <div className="play-modules play-portrait-modules">
      {killer === "Billy the Bear" && part !== "location" && (
        <section aria-label="Billy tracking">
          {!embedded && <h2>Billy &amp; his Buddies</h2>}
          <div className="play-power-sources" role="group" aria-label="Power sources">
            <div className="play-power-heading"><h3>Power sources</h3>{fifthIncluded && <button className="play-power-remove" onClick={() => sourceChange(5, "set-aside")}>Remove fifth</button>}</div>
            <div className="play-power-grid">
              {[1, 2, 3, 4, ...(fifthIncluded ? [5] : [])].map(id => {
                const on = (billy[`source.${id}.status`] ?? "active") === "active";
                return <button key={id} className="play-power-token" data-state={on ? "on" : "off"} aria-pressed={on} aria-label={`Power source ${id}, ${on ? "On" : "Off"}. Turn ${on ? "off" : "on"}`} onClick={() => sourceChange(id, on ? "inactive" : "active")}>
                  <img src={powerArt[`../../assets/play/states/power-${id}.webp`]} alt="" decoding="async" />
                  <span><strong>Source {id}</strong><small>{on ? "On" : "Off"}</small></span>
                </button>;
              })}
              {!fifthIncluded && <button className="play-power-add" onClick={() => sourceChange(5, "active")} aria-label="Add fifth power source"><span>+</span>Fifth source</button>}
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
                      // Clear superseded fine-grained values, keeping their history in the log.
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
                      const ok = onEvent(
                        newPlayEvent({
                          kind: "module",
                          moduleData: { module: "billy", changes },
                        }),
                      );
                      setMessage(
                        ok
                          ? b.name + ": " + labels[next] + "."
                          : "This change could not be saved. Please try again.",
                      );
                    }}
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
                      : value === "saved" ? "saved" : value === "away" ? "away" : "off";
                return (
                  <CharacterButton
                    key={v.id}
                    id={v.id}
                    name={v.name}
                    state={state}
                    victim
                    onChange={(next) => {
                      const ok = onEvent(
                        newPlayEvent({
                          kind: "module",
                          moduleData: {
                            module: "buddyland",
                            changes: {
                              ["victim." + v.id]:
                                next === "active"
                                  ? "on-board"
                                  : next === "killed"
                                    ? "killed"
                                    : null,
                            },
                          },
                        }),
                      );
                      setMessage(
                        ok
                          ? v.name +
                              ": " +
                              (next === "killed" ? "Dead" : labels[next]) +
                              "."
                          : "This change could not be saved. Please try again.",
                      );
                    }}
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
