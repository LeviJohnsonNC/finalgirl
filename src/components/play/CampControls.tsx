import { useState } from "react";
import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import { moduleState, type ModuleValue } from "@/lib/play/modules";
import {
  CAMP_EVENTS,
  CAMP_TUNNEL_ROOMS,
  CAMP_VICTIMS,
  HANS_MINOR_POWERS,
} from "../../../supabase/functions/_shared/play/camp";
import { PlaySearch } from "./PlaySearch";
import { PlaySelect } from "./PlaySelect";
import "@/styles/play-camp.css";

const art = import.meta.glob<string>("../../assets/play/camp/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const image = (name: string) => art[`../../assets/play/camp/${name}.webp`];
const statusLabels = {
  "in-play": "In play",
  killed: "Killed",
  saved: "Saved",
  untracked: "Untracked",
};
const ongoing = CAMP_EVENTS.filter(
  (e) =>
    !["Boyfriend", "Fresh Meat", "Girlfriend", "Vengeance"].includes(e.name),
);
export function CampControls({
  killer,
  location,
  events,
  onEvent,
  part = "both",
}: {
  part?: "killer" | "location" | "both";
  killer: string;
  location: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
}) {
  const entries = summarizePlay(events).entries;
  const hans = moduleState(entries, "hans"),
    camp = moduleState(entries, "camp");
  const [message, setMessage] = useState("");
  const record = (
    module: "hans" | "camp",
    changes: Record<string, ModuleValue>,
  ) => {
    const ok = onEvent(
      newPlayEvent({ kind: "module", moduleData: { module, changes } }),
    );
    setMessage(ok ? "" : "This detail could not be saved. Please try again.");
    return ok;
  };
  const trackedVictims = CAMP_VICTIMS.filter(
    (v) => camp[`victim.${v.id}`] !== undefined,
  );
  const trackedEvents = ongoing.filter(
    (e) => camp[`event.${e.id}`] !== undefined,
  );
  const available = [
    ...CAMP_VICTIMS.filter((v) => camp[`victim.${v.id}`] === undefined).map(
      (v) => v.name,
    ),
    ...ongoing
      .filter((e) => camp[`event.${e.id}`] === undefined)
      .map((e) => e.name),
  ];
  return (
    <div className="play-camp-modules">
      {killer === "Hans" && part !== "location" && (
        <section aria-label="Hans tracking">
          <div className="play-camp-body play-minor-grid">
            {HANS_MINOR_POWERS.map((p) => {
              const health = hans[`minor.${p.id}.health`];
              return (
                <div
                  className="play-minor-power"
                  data-active={typeof health === "number" && health > 0}
                  key={p.id}
                >
                  <h3>{p.name}</h3>
                  {health === undefined ? (
                    <button
                      onClick={() =>
                        record("hans", { [`minor.${p.id}.health`]: 2 })
                      }
                    >
                      Reveal
                    </button>
                  ) : (
                    <>
                      <div
                        className="play-minor-health"
                        role="group"
                        aria-label={`${p.name} health`}
                      >
                        <button
                          aria-label={`Decrease ${p.name} health`}
                          disabled={health === 0}
                          onClick={() =>
                            record("hans", {
                              [`minor.${p.id}.health`]: Number(health) - 1,
                            })
                          }
                        >
                          −
                        </button>
                        <span>
                          {health === 0 ? "Removed" : `${health} health`}
                        </span>
                        <button
                          aria-label={`Increase ${p.name} health`}
                          disabled={health === 2}
                          onClick={() =>
                            record("hans", {
                              [`minor.${p.id}.health`]: Number(health) + 1,
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="play-camp-clear"
                        aria-label={`Stop tracking ${p.name}`}
                        onClick={() =>
                          record("hans", { [`minor.${p.id}.health`]: null })
                        }
                      >
                        Stop tracking
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
      {location === "Camp Happy Trails" && part !== "killer" && (
        <section aria-label="Camp tracking">
          <div className="play-camp-body">
            {trackedVictims.length > 0 && (
              <div className="play-camp-victims">
                {trackedVictims.map((v) => {
                  const state = camp[
                    `victim.${v.id}`
                  ] as keyof typeof statusLabels;
                  const treatment =
                    state === "killed"
                      ? "killed"
                      : state === "untracked"
                        ? "off"
                        : "active";
                  const next =
                    state === "untracked"
                      ? "in-play"
                      : state === "in-play"
                        ? "killed"
                        : "untracked";
                  return (
                    <div
                      className="play-camp-person"
                      key={v.id}
                      data-state={state}
                    >
                      <button
                        className="play-camp-portrait"
                        aria-label={`${v.name}, ${statusLabels[state]}. ${next === "in-play" ? "Mark in play" : next === "killed" ? "Mark killed" : "Mark untracked"}`}
                        onClick={() =>
                          record("camp", { [`victim.${v.id}`]: next })
                        }
                      >
                        <img
                          src={image(`${v.id}-${treatment}`)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                        <span>
                          <strong>{v.name}</strong>
                          <small>{statusLabels[state]}</small>
                        </span>
                      </button>
                      <PlaySelect
                        aria-label={`${v.name} status`}
                        value={state}
                        onChange={(e) =>
                          record("camp", { [`victim.${v.id}`]: e.target.value })
                        }
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option value={value} key={value}>
                            {label}
                          </option>
                        ))}
                      </PlaySelect>
                      <button
                        className="play-camp-clear"
                        aria-label={`Remove ${v.name} tracking`}
                        onClick={() =>
                          record("camp", { [`victim.${v.id}`]: null })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {trackedEvents.map((e) => {
              const active = camp[`event.${e.id}`] === "active";
              return (
                <div
                  className="play-camp-effect"
                  key={e.id}
                  data-active={active}
                >
                  <button
                    className="play-camp-effect-toggle"
                    style={
                      ["dark-waters", "secret-tunnel"].includes(e.id)
                        ? {
                            backgroundImage: `linear-gradient(90deg,#07100df2,#07100d33),url(${image(e.id)})`,
                          }
                        : undefined
                    }
                    aria-pressed={active}
                    onClick={() =>
                      record("camp", {
                        [`event.${e.id}`]: active ? "resolved" : "active",
                      })
                    }
                  >
                    <strong>{e.name}</strong>
                    <small>{active ? "Active" : "Resolved"}</small>
                  </button>
                  {e.id === "secret-tunnel" && active && (
                    <div className="play-camp-tunnel">
                      {(["a", "b"] as const).map((end, i) => (
                        <label key={end}>
                          Endpoint {i + 1}
                          <PlaySelect
                            aria-label={`Secret Tunnel endpoint ${i + 1}`}
                            value={String(camp[`tunnel.${end}`] ?? "")}
                            onChange={(event) =>
                              record("camp", {
                                [`tunnel.${end}`]: event.target.value || null,
                              })
                            }
                          >
                            <option value="">Not recorded</option>
                            {CAMP_TUNNEL_ROOMS.filter(
                              (room) =>
                                room !==
                                camp[`tunnel.${end === "a" ? "b" : "a"}`],
                            ).map((room) => (
                              <option key={room} value={room}>
                                {room}
                              </option>
                            ))}
                          </PlaySelect>
                        </label>
                      ))}
                    </div>
                  )}
                  <button
                    className="play-camp-clear"
                    aria-label={`Remove ${e.name} tracking`}
                    onClick={() =>
                      record("camp", {
                        [`event.${e.id}`]: null,
                        ...(e.id === "secret-tunnel"
                          ? { "tunnel.a": null, "tunnel.b": null }
                          : {}),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            {available.length > 0 && (
              <div className="play-camp-add">
                <PlaySearch
                  label="Add Camp detail"
                  value=""
                  placeholder="Add detail"
                  options={available}
                  allowCustom={false}
                  onChange={(name) => {
                    if (!name) return;
                    const victim = CAMP_VICTIMS.find((v) => v.name === name);
                    const effect = ongoing.find((e) => e.name === name);
                    if (victim)
                      return record("camp", {
                        [`victim.${victim.id}`]: "in-play",
                      });
                    if (effect)
                      return record("camp", {
                        [`event.${effect.id}`]: "active",
                      });
                  }}
                />
              </div>
            )}
          </div>
        </section>
      )}
      <p className="play-feedback" role="status">
        {message}
      </p>
    </div>
  );
}
