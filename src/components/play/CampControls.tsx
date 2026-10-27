import { modulePhoto } from "./modulePhotos";
import { CharacterControl } from "./CharacterControl";
import { MinorPowerGroup } from "./MinorPowerGroup";
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

// Consequential ongoing facts only; initial placement/resolution stays in Rules.
const campReminders: Record<string, string> = {
  boyfriend:
    "If he dies in your space: start the next Action phase with 12 Time.",
  girlfriend:
    "Together: +1 die to Horror Rolls. Her death in your space: +5 Horror.",
  "the-damned":
    "Killer targets The Damned. Save only as the last Victim alive. Death: +2 Bloodlust.",
  "clingy-campers":
    "After the first Victim saved this Action phase, lose 1 Health per additional save.",
  "dark-waters": "Victims at or entering the Lake are killed.",
  deathwish:
    "Upkeep: move the Victim closest to the Killer 1 space toward it, unless already together.",
  "secret-tunnel": "Only you may use the tunnel; Enemies cannot.",
  "star-crossed-lovers":
    "Exactly 2 Victims together: if one is killed, the other dies too.",
  "stubborn-kids": "One fewer Victim follows you.",
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
          <h3 className="play-module-subheading">Minor Dark Powers</h3>

          <MinorPowerGroup className="play-camp-body module-minor-grid">
            {HANS_MINOR_POWERS.map((power, row) => {
              const value = hans[`minor.${power.id}.health`];
              return (
                <MinorPowerControl
                  key={power.id}
                  className="play-minor-power"
                  name={power.name}
                  health={typeof value === "number" ? value : undefined}
                  art={(health) => powerCell(row, health)}
                  heroArt={modulePhoto("Hans", 7 + row)}
                  heartArt={campCell(3, 1)}
                  onChange={(health) =>
                    record("hans", { [`minor.${power.id}.health`]: health })
                  }
                />
              );
            })}
          </MinorPowerGroup>
          <KillerCards killer={killer} events={events} onEvent={onEvent} />
        </section>
      )}
      {location === "Camp Happy Trails" && part !== "killer" && (
        <section aria-label="Camp tracking">
          <div className="play-camp-body">
            <div>
              <h3 className="play-module-subheading">Special characters</h3>

              <div className="play-camp-victims">
                {CAMP_VICTIMS.map((victim, index) => {
                  const value = camp[`victim.${victim.id}`] as
                    keyof typeof statusLabels | undefined;
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
                      showRules={false}
                      reminder={campReminders[victim.id]}
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
                      interaction={
                        effect.id === "secret-tunnel" ? "details" : "toggle"
                      }
                      ended="resolved"
                      art={effectArt[effect.id]}
                      effect={effect.effect}
                      reminder={campReminders[effect.id]}
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
