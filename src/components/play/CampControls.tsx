import { CharacterControl } from "./CharacterControl";
import { MinorPowerControl } from "./MinorPowerControl";
import { EventControl } from "./EventControl";
import { KillerCards } from "./KillerCards";
import { useModuleRecord } from "./useModuleRecord";
import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import { moduleState, type ModuleValue } from "@/lib/play/modules";
import {
  CAMP_ONGOING_EVENTS,
  CAMP_TUNNEL_ROOMS,
  CAMP_VICTIMS,
  HANS_MINOR_POWERS,
} from "../../../supabase/functions/_shared/play/camp";
import { PlaySelect } from "./PlaySelect";
import type { ModuleArt } from "./ModuleArtwork";
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
  const { record: commit, message } = useModuleRecord(events, onEvent);
  const record = (
    module: "hans" | "camp",
    changes: Record<string, ModuleValue>,
  ) =>
    commit(newPlayEvent({ kind: "module", moduleData: { module, changes } }));
  return (
    <div className="play-camp-modules">
      {killer === "Hans" && part !== "location" && (
        <section aria-label="Hans tracking">
          <KillerCards killer={killer} events={events} onEvent={onEvent} />
          <h3 className="play-module-subheading">Minor Dark Powers</h3>
          <p className="play-module-help">
            Reveal a power, then tap a filled or empty heart to remove or
            restore one health.
          </p>
          <div className="play-camp-body play-minor-grid">
            {HANS_MINOR_POWERS.map((power, row) => {
              const value = hans[`minor.${power.id}.health`];
              return (
                <MinorPowerControl
                  key={power.id}
                  className="play-minor-power"
                  name={power.name}
                  effect={power.effect}
                  health={typeof value === "number" ? value : undefined}
                  art={(health) => powerCell(row, health)}
                  heartArt={campCell(3, 1)}
                  onChange={(health) =>
                    record("hans", { [`minor.${power.id}.health`]: health })
                  }
                />
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
                    <CharacterControl
                      key={victim.id}
                      className="play-camp-person"
                      tileClassName="play-camp-portrait"
                      name={victim.name}
                      value={value === "untracked" ? undefined : value}
                      present="in-play"
                      art={portrait}
                      states={[
                        { value: "in-play", label: "In play" },
                        { value: "saved", label: "Saved" },
                        { value: "killed", label: "Killed" },
                      ]}
                      outcomes={["saved", "killed"]}
                      onChange={(value) =>
                        record("camp", { [`victim.${victim.id}`]: value })
                      }
                    />
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="play-module-subheading">Ongoing events</h3>
              <p className="play-module-help">
                Tap an event to activate it. Use End effect when it stops
                applying.
              </p>
              <div className="play-camp-effects">
                {CAMP_ONGOING_EVENTS.map((effect) => {
                  const value = camp[`event.${effect.id}`];
                  const active = value === "active";
                  return (
                    <EventControl
                      key={effect.id}
                      className="play-camp-effect"
                      tileClassName="play-camp-effect-toggle"
                      name={effect.name}
                      value={typeof value === "string" ? value : undefined}
                      ended="resolved"
                      art={effectArt[effect.id]}
                      onActivate={() =>
                        record("camp", { [`event.${effect.id}`]: "active" })
                      }
                      onEnd={() =>
                        record("camp", { [`event.${effect.id}`]: "resolved" })
                      }
                      onClear={() =>
                        record("camp", {
                          [`event.${effect.id}`]: null,
                          ...(effect.id === "secret-tunnel"
                            ? { "tunnel.a": null, "tunnel.b": null }
                            : {}),
                        })
                      }
                    >
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
                    </EventControl>
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
