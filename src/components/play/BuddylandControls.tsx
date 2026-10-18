import { PlaySelect } from "./PlaySelect";
import { PlaySearch } from "./PlaySearch";
import { useState } from "react";
import {
  BUDDIES,
  BILLY_FINALES,
  BILLY_POWERS,
  BUDDYLAND_EVENTS,
  BUDDYLAND_ITEMS,
  BUDDYLAND_ROOMS,
  SPECIAL_VICTIMS,
  FINAL_GIRL_REWARDS,
  moduleState,
  type ModuleObservation,
  type ModuleValue,
} from "@/lib/play/modules";
import {
  newPlayEvent,
  summarizePlay,
  type PlayEvent,
  type PlayDetails,
} from "@/lib/play/events";
import { BUDDYLAND_DETAILS } from "@/data/buddyland";

interface Props {
  killer: string;
  location: string;
  finalGirl: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  drafts: Record<string, PlayDetails>;
  onDraft: (id: string, draft: PlayDetails) => boolean;
}
function Stepper({
  label,
  value,
  max = 99,
  onChange,
}: {
  label: string;
  value: number | undefined;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="play-card-note">{label}</p>
      <div className="play-state-stepper">
        <button
          aria-label={`Decrease ${label}`}
          disabled={value === undefined || value <= 0}
          onClick={() => onChange(value! - 1)}
        >
          −
        </button>
        <span aria-label={label}>{value ?? "?"}</span>
        <button
          aria-label={`Increase ${label}`}
          disabled={value !== undefined && value >= max}
          onClick={() => onChange(value === undefined ? 0 : value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
function Picker({
  label,
  cards,
  onPick,
}: {
  label: string;
  cards: readonly { id: string; name: string }[];
  onPick: (id: string) => boolean;
}) {
  return (
    <PlaySearch
      allowCustom={false}
      label={label}
      value=""
      options={cards.map((c) => c.name)}
      placeholder={label}
      onChange={(name) => {
        const card = cards.find((c) => c.name === name);
        return card ? onPick(card.id) : false;
      }}
    />
  );
}

export function BuddylandControls(props: Props) {
  const entries = summarizePlay(props.events).entries;
  const billy = moduleState(entries, "billy"),
    venue = moduleState(entries, "buddyland");
  const [message, setMessage] = useState("");
  const record = (
    module: ModuleObservation["module"],
    changes: Record<string, ModuleValue>,
  ) => {
    const ok = props.onEvent(
      newPlayEvent({ kind: "module", moduleData: { module, changes } }),
    );
    setMessage(
      ok
        ? "Observation saved."
        : "This observation could not be saved. Please try again.",
    );
    return ok;
  };
  const textField = (
    module: ModuleObservation["module"],
    key: string,
    label: string,
  ) => {
    const state = module === "billy" ? billy : venue;
    const id = `module:${module}:${key}`;
    const value = props.drafts[id]?.detail ?? String(state[key] ?? "");
    return (
      <label>
        {label}
        <PlaySearch
          label={label}
          value={value}
          onSearch={(next) => props.onDraft(id, { detail: next })}
          options={key.endsWith(".room") ? BUDDYLAND_ROOMS : []}
          onChange={(next) => {
            if (!record(module, { [key]: next.trim() || null })) {
              props.onDraft(id, { detail: next });
              return false;
            }
            props.onDraft(id, {});
            return true;
          }}
          placeholder="Unrecorded"
        />
      </label>
    );
  };
  const trackedBuddies = BUDDIES.filter(
    (b) => billy[`buddy.${b.id}.status`] !== undefined,
  );
  const trackedItems = BUDDYLAND_ITEMS.filter(
    (i) => venue[`item.${i.id}.status`] !== undefined,
  );
  const finalGirl = BUDDYLAND_DETAILS.finalGirls.find(
    (f) => f.name === props.finalGirl,
  );
  return (
    <div className="play-modules">
      {props.killer === "Billy the Bear" && (
        <section aria-label="Billy tracking">
          <h2>
            Billy &amp; his Buddies <span>Optional</span>
          </h2>
          <p className="play-card-note">
            Record the state on your table. Resolve card effects and rewards on
            the board.
          </p>
          <details
            open={trackedBuddies.some(
              (b) => billy[`buddy.${b.id}.status`] === "active",
            )}
          >
            <summary>
              Buddies{" "}
              <span>
                {trackedBuddies.length
                  ? `${trackedBuddies.filter((b) => billy[`buddy.${b.id}.status`] === "active").length} recorded in play`
                  : "Not tracked"}
              </span>
            </summary>
            <p className="play-card-note">
              Act in Initiative order. A Buddy sharing Billy’s space prevents
              attacks on Billy. A Buddy spawned during the Killer phase waits
              until the next Killer phase.
            </p>
            {trackedBuddies.some(
              (b) =>
                billy[`buddy.${b.id}.status`] === "active" &&
                billy[`buddy.${b.id}.withBilly`] === true,
            ) && (
              <p className="play-module-reminder">
                A recorded Buddy is protecting Billy.
              </p>
            )}
            <div className="play-module-grid">
              {trackedBuddies.map((b) => {
                const prefix = `buddy.${b.id}`;
                return (
                  <article
                    key={b.id}
                    aria-label={`${b.name} tracker`}
                    className="play-module-card"
                  >
                    <h3>
                      {b.name} <span>Initiative {b.initiative}</span>
                    </h3>
                    <p>
                      Attack {b.attack} · Move {b.movement}
                    </p>
                    <Stepper
                      label={`${b.name} health`}
                      value={billy[`${prefix}.health`] as number | undefined}
                      onChange={(health) =>
                        record("billy", { [`${prefix}.health`]: health })
                      }
                    />
                    <label>
                      Status
                      <PlaySelect
                        aria-label={`${b.name} status`}
                        value={String(billy[`${prefix}.status`] ?? "")}
                        onChange={(e) =>
                          record("billy", {
                            [`${prefix}.status`]: e.target.value || null,
                          })
                        }
                      >
                        <option value="active">In play</option>
                        <option value="defeated">Defeated</option>
                        <option value="removed">Removed</option>
                      </PlaySelect>
                    </label>
                    {b.id === "billy-jr" ? (
                      <p className="play-card-note">
                        Always shares Billy’s space.
                      </p>
                    ) : (
                      <label>
                        Sharing Billy’s space?
                        <PlaySelect
                          aria-label={`${b.name} shares Billy’s space`}
                          value={
                            billy[`${prefix}.withBilly`] === undefined
                              ? ""
                              : String(billy[`${prefix}.withBilly`])
                          }
                          onChange={(e) =>
                            record("billy", {
                              [`${prefix}.withBilly`]:
                                e.target.value === ""
                                  ? null
                                  : e.target.value === "true",
                            })
                          }
                        >
                          <option value="">Unrecorded</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </PlaySelect>
                      </label>
                    )}
                    <label>
                      Activation
                      <PlaySelect
                        aria-label={`${b.name} activation`}
                        value={
                          billy[`${prefix}.waiting`] === undefined
                            ? ""
                            : String(billy[`${prefix}.waiting`])
                        }
                        onChange={(e) =>
                          record("billy", {
                            [`${prefix}.waiting`]:
                              e.target.value === ""
                                ? null
                                : e.target.value === "true",
                          })
                        }
                      >
                        <option value="">Unrecorded</option>
                        <option value="true">
                          Wait until next Killer phase
                        </option>
                        <option value="false">Ready</option>
                      </PlaySelect>
                    </label>
                    {textField("billy", `${prefix}.room`, `${b.name} location`)}

                    <button
                      onClick={() => {
                        const changes = {
                          ...Object.fromEntries(
                            [
                              "status",
                              "health",
                              "withBilly",
                              "waiting",
                              "room",
                            ].map((field) => [`${prefix}.${field}`, null]),
                          ),
                          rosterComplete: null,
                        };
                        if (record("billy", changes))
                          props.onDraft(`module:billy:${prefix}.room`, {});
                      }}
                    >
                      Stop tracking {b.name}
                    </button>
                  </article>
                );
              })}
            </div>
            <Picker
              label="Add revealed Buddy"
              cards={BUDDIES.filter((b) => !trackedBuddies.includes(b))}
              onPick={(id) => {
                const b = BUDDIES.find((b) => b.id === id)!;
                return record("billy", {
                  [`buddy.${id}.status`]: "active",
                  [`buddy.${id}.health`]: b.health,
                  [`buddy.${id}.withBilly`]: id === "billy-jr" ? true : null,
                });
              }}
            />
            <label className="play-module-check">
              <input
                type="checkbox"
                checked={billy.rosterComplete === true}
                onChange={(e) =>
                  record("billy", { rosterComplete: e.target.checked })
                }
              />
              All Buddies currently in play are listed
            </label>
          </details>
          <details>
            <summary>Power Sources</summary>
            <p className="play-card-note">
              Four sources begin Active in different nonadjacent spaces; the
              fifth starts set aside. The battery-heart icon heals Billy only
              while a source is Active.
            </p>
            {[1, 2, 3, 4, 5].every(
              (i) => billy[`source.${i}.status`] === undefined,
            ) && (
              <button
                onClick={() =>
                  record(
                    "billy",
                    Object.fromEntries(
                      [1, 2, 3, 4, 5].map((i) => [
                        `source.${i}.status`,
                        i === 5 ? "set-aside" : "active",
                      ]),
                    ),
                  )
                }
              >
                Record starting Power Sources
              </button>
            )}
            <div className="play-module-grid">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="play-module-card">
                  <label>
                    Power Source {i}
                    <PlaySelect
                      aria-label={`Power Source ${i} status`}
                      value={String(billy[`source.${i}.status`] ?? "")}
                      onChange={(e) =>
                        record("billy", {
                          [`source.${i}.status`]: e.target.value || null,
                        })
                      }
                    >
                      <option value="">Unrecorded</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="set-aside">Set aside</option>
                    </PlaySelect>
                  </label>
                  {textField(
                    "billy",
                    `source.${i}.room`,
                    `Power Source ${i} location`,
                  )}
                </div>
              ))}
            </div>
          </details>
          <details>
            <summary>Revealed powers &amp; Finale</summary>
            <label>
              Revealed Finale
              <PlaySelect
                aria-label="Revealed Finale"
                value={String(billy.finale ?? "")}
                onChange={(e) =>
                  record("billy", { finale: e.target.value || null })
                }
              >
                <option value="">Not recorded</option>
                {BILLY_FINALES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </PlaySelect>
            </label>

            <label>
              Billy’s status
              <PlaySelect
                aria-label="Billy status"
                value={String(billy.billyStatus ?? "")}
                onChange={(e) =>
                  record("billy", { billyStatus: e.target.value || null })
                }
              >
                <option value="">Unrecorded</option>
                <option value="active">In play</option>
                <option value="defeated">Defeated</option>
              </PlaySelect>
            </label>

            <div className="play-module-grid">
              {BILLY_POWERS.filter(
                (p) => billy[`power.${p.id}.active`] !== undefined,
              ).map((p) => (
                <article
                  className="play-module-card"
                  key={p.id}
                  aria-label={`${p.name} tracker`}
                >
                  <h3>{p.name}</h3>
                  {"health" in p && (
                    <Stepper
                      label={`${p.name} health`}
                      max={p.health}
                      value={
                        billy[`power.${p.id}.health`] as number | undefined
                      }
                      onChange={(health) =>
                        record("billy", { [`power.${p.id}.health`]: health })
                      }
                    />
                  )}
                  <button
                    onClick={() =>
                      record("billy", {
                        [`power.${p.id}.active`]:
                          !billy[`power.${p.id}.active`],
                      })
                    }
                  >
                    {billy[`power.${p.id}.active`]
                      ? `Remove ${p.name}`
                      : `Restore ${p.name}`}
                  </button>
                </article>
              ))}
            </div>
            <Picker
              label="Record revealed power"
              cards={BILLY_POWERS.filter(
                (p) => billy[`power.${p.id}.active`] === undefined,
              )}
              onPick={(id) => {
                const power = BILLY_POWERS.find((p) => p.id === id)!;
                return record("billy", {
                  [`power.${id}.active`]: true,
                  ...("health" in power
                    ? { [`power.${id}.health`]: power.health }
                    : {}),
                });
              }}
            />
          </details>
        </section>
      )}
      {props.location === "Buddyland" && (
        <section aria-label="Buddyland tracking">
          <h2>
            Inside Buddyland <span>Optional</span>
          </h2>
          <details>
            <summary>Events &amp; Special Victims</summary>
            <p className="play-card-note">
              Record Events as you draw them. Special Victim statuses are notes;
              use the main counters to record saved and killed totals.
            </p>
            {BUDDYLAND_EVENTS.filter(
              (c) => venue[`event.${c.id}`] !== undefined,
            ).map((c) => (
              <article className="play-module-card" key={c.id}>
                <h3>{c.name}</h3>
                <label>
                  {c.name} status
                  <PlaySelect
                    aria-label={`${c.name} Event status`}
                    value={String(venue[`event.${c.id}`])}
                    onChange={(e) =>
                      record("buddyland", {
                        [`event.${c.id}`]: e.target.value || null,
                      })
                    }
                  >
                    <option value="active">Active / resolving</option>
                    <option value="resolved">Discarded / resolved</option>
                    <option value="">Stop tracking</option>
                  </PlaySelect>
                </label>
              </article>
            ))}
            <Picker
              label="Record drawn Event"
              cards={BUDDYLAND_EVENTS.filter(
                (c) => venue[`event.${c.id}`] === undefined,
              )}
              onPick={(id) =>
                record("buddyland", { [`event.${id}`]: "active" })
              }
            />
            <div className="play-module-grid">
              {SPECIAL_VICTIMS.map((v) => (
                <label key={v.id}>
                  {v.name}
                  <PlaySelect
                    aria-label={`${v.name} status`}
                    value={String(venue[`victim.${v.id}`] ?? "")}
                    onChange={(e) =>
                      record("buddyland", {
                        [`victim.${v.id}`]: e.target.value || null,
                      })
                    }
                  >
                    <option value="">Unrecorded</option>
                    <option value="on-board">On board</option>
                    <option value="saved">Saved</option>
                    <option value="killed">Killed</option>
                    {v.id === "nick" && (
                      <option value="away">Away until Upkeep</option>
                    )}
                  </PlaySelect>
                </label>
              ))}
            </div>
            <label>
              Tragic Collapse token
              <PlaySelect
                aria-label="Tragic Collapse location"
                value={String(venue.collapseRoom ?? "")}
                onChange={(e) =>
                  record("buddyland", { collapseRoom: e.target.value || null })
                }
              >
                <option value="">Unrecorded / removed</option>
                {["Jungle Gym", "Kitchen", "Bathroom"].map((room) => (
                  <option key={room}>{room}</option>
                ))}
              </PlaySelect>
            </label>
          </details>
          <details>
            <summary>Items &amp; uses</summary>
            <div className="play-module-grid">
              {trackedItems.map((item) => (
                <article
                  className="play-module-card"
                  key={item.id}
                  aria-label={`${item.name} tracker`}
                >
                  <h3>{item.name}</h3>
                  <label>
                    Item status
                    <PlaySelect
                      aria-label={`${item.name} status`}
                      value={String(venue[`item.${item.id}.status`])}
                      onChange={(e) =>
                        record("buddyland", {
                          [`item.${item.id}.status`]: e.target.value || null,
                        })
                      }
                    >
                      <option value="carried">Carried</option>
                      <option value="discarded">Discarded / spent</option>
                      <option value="">Stop tracking</option>
                    </PlaySelect>
                  </label>
                  {"uses" in item && (
                    <>
                      <Stepper
                        label={`${item.name} uses`}
                        max={item.uses}
                        value={
                          venue[`item.${item.id}.uses`] as number | undefined
                        }
                        onChange={(uses) =>
                          record("buddyland", {
                            [`item.${item.id}.uses`]: uses,
                          })
                        }
                      />
                      {"loadInArcade" in item && (
                        <button
                          onClick={() =>
                            record("buddyland", { [`item.${item.id}.uses`]: 4 })
                          }
                        >
                          Record four loaded Skee-Balls
                        </button>
                      )}
                    </>
                  )}
                  {["security-bot", "chain", "bag-of-marbles"].includes(
                    item.id,
                  ) &&
                    textField(
                      "buddyland",
                      `item.${item.id}.room`,
                      `${item.name} token location`,
                    )}
                </article>
              ))}
            </div>
            <Picker
              label="Track found Item"
              cards={BUDDYLAND_ITEMS.filter((i) => !trackedItems.includes(i))}
              onPick={(id) => {
                const item = BUDDYLAND_ITEMS.find((i) => i.id === id)!;
                return record("buddyland", {
                  [`item.${id}.status`]: "carried",
                  ...("uses" in item
                    ? {
                        [`item.${id}.uses`]:
                          "loadInArcade" in item ? null : item.uses,
                      }
                    : {}),
                });
              }}
            />
          </details>
        </section>
      )}
      {finalGirl && (
        <details>
          <summary>{finalGirl.name} reference</summary>
          <p>
            Available save rewards:{" "}
            {FINAL_GIRL_REWARDS[
              finalGirl.name as keyof typeof FINAL_GIRL_REWARDS
            ].join(" · ")}
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
