import { useState } from "react";
import {
  BUDDIES,
  SPECIAL_VICTIMS,
  FINAL_GIRL_REWARDS,
  moduleState,
} from "@/lib/play/modules";
import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import { BUDDYLAND_DETAILS } from "@/data/buddyland";
import "@/styles/play-roster.css";

const artwork = import.meta.glob<string>("../../assets/play/roster/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
type PortraitState = "off" | "active" | "killed";
const labels = { off: "Off", active: "In play", killed: "Killed" };
const nextState: Record<PortraitState, PortraitState> = {
  off: "active",
  active: "killed",
  killed: "off",
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
    <button
      type="button"
      className="play-character"
      data-state={state}
      aria-label={name + ", " + label + ". " + action}
      onClick={() => onChange(next)}
    >
      <img
        src={artwork["../../assets/play/roster/" + id + "-" + state + ".webp"]}
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span className="play-character-caption">
        <strong>{name}</strong>
        <span className="play-character-state">{label}</span>
      </span>
      <span className="play-character-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

interface Props {
  killer: string;
  location: string;
  finalGirl: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
}
export function BuddylandControls({
  killer,
  location,
  finalGirl: name,
  events,
  onEvent,
}: Props) {
  const entries = summarizePlay(events).entries;
  const billy = moduleState(entries, "billy"),
    venue = moduleState(entries, "buddyland");
  const [message, setMessage] = useState("");
  const finalGirl = BUDDYLAND_DETAILS.finalGirls.find((f) => f.name === name);
  return (
    <div className="play-modules play-portrait-modules">
      {killer === "Billy the Bear" && (
        <section aria-label="Billy tracking">
          <h2>Billy &amp; his Buddies</h2>
          <p className="play-roster-help">
            Tap to cycle: Off → In play → Killed → Off
          </p>
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
      {location === "Buddyland" && (
        <section aria-label="Buddyland tracking">
          <h2>Inside Buddyland</h2>
          <p className="play-roster-help">
            Tap to cycle: Off → In play → Dead → Off
          </p>
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
                      : "off";
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
          <p className="play-roster-help play-roster-help--foot">
            Use the main counters for saved and killed totals.
          </p>
        </section>
      )}
      {finalGirl && (
        <details>
          <summary>{finalGirl.name} reference</summary>
          <p>
            Available save rewards:{" "}
            {[
              ...new Set(
                FINAL_GIRL_REWARDS[
                  finalGirl.name as keyof typeof FINAL_GIRL_REWARDS
                ],
              ),
            ]
              .sort((a, b) => a.localeCompare(b))
              .join(" · ")}
            .
          </p>
          <p>Ultimate: {finalGirl.ultimateAbility}</p>
          <p>After unlocking: {finalGirl.additionalSaveReward}</p>
          <p className="play-card-note">
            Use Remember this to record unlocking or using your ultimate. Choose
            and apply save rewards on your character card.
          </p>
        </details>
      )}
      <p role="status" className="play-feedback">
        {message}
      </p>
    </div>
  );
}
