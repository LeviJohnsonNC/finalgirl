import { useState } from "react";
import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import { moduleState, type ModuleValue } from "@/lib/play/modules";
import {
  CAMP_EVENTS,
  CAMP_TUNNEL_ROOMS,
  CAMP_VICTIMS,
  HANS_MINOR_POWERS,
} from "../../../supabase/functions/_shared/play/camp";
import { PlaySelect } from "./PlaySelect";
import { IllustratedTile } from "./IllustratedTile";
import { ModuleArtwork, type ModuleArt } from "./ModuleArtwork";
import { HealthTokens } from "./HealthTokens";
import campDetails from "@/assets/play/modules/camp-details.webp";
import hansPowers from "@/assets/play/modules/hans-powers.webp";
import "@/styles/play-camp.css";

const art = import.meta.glob<string>("../../assets/play/camp/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const image = (name: string): ModuleArt => ({
  src: art[`../../assets/play/camp/${name}.webp`],
});
const campCell = (column: number, row: number): ModuleArt => ({
  src: campDetails,
  atlas: {
    width: 1536,
    height: 1024,
    x: column * 384,
    y: row * 512,
    cellWidth: 384,
    cellHeight: 512,
  },
});
const powerCell = (row: number, health: number): ModuleArt => ({
  src: hansPowers,
  atlas: {
    width: 1536,
    height: 1024,
    x: (2 - health) * 512,
    y: row * 512,
    cellWidth: 512,
    cellHeight: 512,
  },
});
const effectArt: Record<string, ModuleArt> = {
  "clingy-campers": campCell(0, 1),
  "dark-waters": image("dark-waters"),
  deathwish: campCell(1, 1),
  "secret-tunnel": image("secret-tunnel"),
  "star-crossed-lovers": campCell(2, 1),
  "stubborn-kids": campCell(3, 0),
};
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
  return (
    <div className="play-camp-modules">
      {killer === "Hans" && part !== "location" && (
        <section aria-label="Hans tracking">
          <p className="play-module-help">
            Reveal a power, then tap a heart to remove or restore one health.
          </p>
          <div className="play-camp-body play-minor-grid">
            {HANS_MINOR_POWERS.map((power, row) => {
              const value = hans[`minor.${power.id}.health`];
              const health = typeof value === "number" ? value : undefined;
              const state =
                health === undefined
                  ? "unrevealed"
                  : health === 2
                    ? "full"
                    : health === 1
                      ? "weakened"
                      : "removed";
              return (
                <article
                  className="play-minor-power"
                  data-state={state}
                  key={power.id}
                >
                  <div className="play-minor-scene">
                    <ModuleArtwork art={powerCell(row, health ?? 2)} />
                    <h3>{power.name}</h3>
                  </div>
                  <div className="play-minor-controls">
                    <p className="play-minor-status" aria-live="polite">
                      {health === undefined
                        ? "Unrevealed"
                        : health === 0
                          ? "Removed · 0/2 health"
                          : `${health}/2 health`}
                    </p>
                    {health === undefined ? (
                      <button
                        className="play-power-reveal"
                        onClick={() =>
                          record("hans", { [`minor.${power.id}.health`]: 2 })
                        }
                      >
                        Reveal
                      </button>
                    ) : (
                      <>
                        <HealthTokens
                          name={power.name}
                          health={health}
                          art={campCell(3, 1)}
                          onChange={(next) =>
                            record("hans", {
                              [`minor.${power.id}.health`]: next,
                            })
                          }
                        />
                        <button
                          className="play-camp-clear"
                          aria-label={`Stop tracking ${power.name}`}
                          onClick={() =>
                            record("hans", {
                              [`minor.${power.id}.health`]: null,
                            })
                          }
                        >
                          Stop tracking
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {location === "Camp Happy Trails" && part !== "killer" && (
        <section aria-label="Camp tracking">
          <div className="play-camp-body">
            <div>
              <h3 className="play-module-subheading">Special characters</h3>
              <p className="play-module-help">
                Tap a portrait to put them in play. Record their outcome below.
              </p>
              <div className="play-camp-victims">
                {CAMP_VICTIMS.map((victim, index) => {
                  const value = camp[`victim.${victim.id}`] as
                    | keyof typeof statusLabels
                    | undefined;
                  const state = value ?? "untracked";
                  const portrait =
                    state === "saved"
                      ? campCell(index, 0)
                      : image(
                          `${victim.id}-${state === "killed" ? "killed" : state === "in-play" ? "active" : "off"}`,
                        );
                  return (
                    <div
                      className="play-camp-person"
                      key={victim.id}
                      data-state={state}
                    >
                      <IllustratedTile
                        className="play-camp-portrait"
                        art={portrait}
                        title={victim.name}
                        status={statusLabels[state]}
                        aria-label={`${victim.name}, ${statusLabels[state]}${state === "in-play" ? "" : ". Mark in play"}`}
                        aria-disabled={state === "in-play"}
                        onClick={() =>
                          state !== "in-play" &&
                          record("camp", { [`victim.${victim.id}`]: "in-play" })
                        }
                      />
                      <div
                        className="play-camp-outcomes"
                        role="group"
                        aria-label={`${victim.name} outcome`}
                      >
                        {(["saved", "killed"] as const).map((outcome) => (
                          <button
                            key={outcome}
                            disabled={state === "untracked"}
                            aria-label={`Mark ${victim.name} ${outcome}`}
                            aria-pressed={state === outcome}
                            onClick={() =>
                              state !== outcome &&
                              record("camp", {
                                [`victim.${victim.id}`]: outcome,
                              })
                            }
                          >
                            {statusLabels[outcome]}
                          </button>
                        ))}
                      </div>
                      {value !== undefined && (
                        <button
                          className="play-camp-clear"
                          aria-label={`Stop tracking ${victim.name}`}
                          onClick={() =>
                            record("camp", { [`victim.${victim.id}`]: null })
                          }
                        >
                          Stop tracking
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="play-module-subheading">Ongoing events</h3>
              <p className="play-module-help">
                Tap an event to activate or resolve it.
              </p>
              <div className="play-camp-effects">
                {ongoing.map((effect) => {
                  const value = camp[`event.${effect.id}`];
                  const active = value === "active";
                  return (
                    <div
                      className="play-camp-effect"
                      key={effect.id}
                      data-state={value ?? "untracked"}
                    >
                      <IllustratedTile
                        className="play-camp-effect-toggle"
                        art={effectArt[effect.id]}
                        title={effect.name}
                        status={
                          active
                            ? "Active"
                            : value === "resolved"
                              ? "Resolved"
                              : "Not recorded"
                        }
                        aria-pressed={active}
                        aria-label={`${effect.name} ${active ? "Active" : value === "resolved" ? "Resolved" : "Not recorded"}`}
                        onClick={() =>
                          record("camp", {
                            [`event.${effect.id}`]: active
                              ? "resolved"
                              : "active",
                          })
                        }
                      />
                      {effect.id === "secret-tunnel" && active && (
                        <div className="play-camp-tunnel">
                          {(["a", "b"] as const).map((end, index) => (
                            <label key={end}>
                              Endpoint {index + 1}
                              <PlaySelect
                                aria-label={`Secret Tunnel endpoint ${index + 1}`}
                                value={String(camp[`tunnel.${end}`] ?? "")}
                                onChange={(event) =>
                                  record("camp", {
                                    [`tunnel.${end}`]:
                                      event.target.value || null,
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
                      {value !== undefined && (
                        <button
                          className="play-camp-clear"
                          aria-label={`Stop tracking ${effect.name}`}
                          onClick={() =>
                            record("camp", {
                              [`event.${effect.id}`]: null,
                              ...(effect.id === "secret-tunnel"
                                ? { "tunnel.a": null, "tunnel.b": null }
                                : {}),
                            })
                          }
                        >
                          Stop tracking
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}
      <p className="play-feedback" role="status">
        {message}
      </p>
    </div>
  );
}
