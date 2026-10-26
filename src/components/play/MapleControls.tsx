import { useState } from "react";
import { CharacterControl } from "./CharacterControl";
import { EventControl } from "./EventControl";
import { IllustratedTile } from "./IllustratedTile";
import { PlaySelect } from "./PlaySelect";
import { useModuleRecord } from "./useModuleRecord";
import type { ControlsProps } from "./moduleDefinitions";
import { ModuleArtwork, type ModuleArt } from "./ModuleArtwork";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import { moduleState } from "@/lib/play/modules";
import {
  MAPLE_HOUSES,
  MAPLE_STREETS,
  MAPLE_EXITS,
  MAPLE_PEOPLE,
  MAPLE_EVENTS,
  MAPLE_ITEMS,
  maplePersonChange,
  copRoute,
  startCop,
  advanceCop,
  type MapleState,
} from "../../../supabase/functions/_shared/play/maple";
import banner from "@/assets/play/maple/banner.webp";
import scenes from "@/assets/play/maple/scenes.webp";
import people from "@/assets/play/maple/people.webp";
import "@/styles/play-maple.css";

const scene = (cell: number): ModuleArt => ({
  src: scenes,
  atlas: {
    width: 1448,
    height: 1086,
    x: (cell % 4) * 362,
    y: Math.floor(cell / 4) * 362,
    cellWidth: 362,
    cellHeight: 362,
  },
});
// Portrait atlas dimensions are normalized once when installed; columns are identities,
// rows are in-play / saved / empty aftermath. Never sort before choosing a crop.
const portrait = (column: number, value?: string): ModuleArt => ({
  src: people,
  atlas: {
    width: 1536,
    height: 1536,
    x: column * 512,
    y: (value === "saved" ? 1 : value === "killed" ? 2 : 0) * 512,
    cellWidth: 512,
    cellHeight: 512,
  },
});
const effect = (id: string) => MAPLE_EVENTS.find((e) => e.id === id)!.effect;
const item = (id: string) => MAPLE_ITEMS.find((e) => e.id === id)!.effect;
const houseName = (id: unknown) =>
  MAPLE_HOUSES.find((h) => h.id === id)?.name ?? "Not recorded";
const exitName = (exit: string) =>
  ({ north: "North", east: "East", south: "South", west: "West" })[exit] ??
  exit;
const streetName = (id: unknown) =>
  MAPLE_STREETS.find((s) => s.id === id)?.name ??
  (id === "none"
    ? "Not placed"
    : id === "spent"
      ? "Spent · token removed"
      : "Not recorded");
const string = (value: unknown) =>
  typeof value === "string" ? value : undefined;

function StatusArt({
  art,
  title,
  status,
}: {
  art: ModuleArt;
  title: string;
  status: string;
}) {
  return (
    <div className="maple-status-art">
      <ModuleArtwork art={art} />
      <span className="play-tile-caption">
        <strong>{title}</strong>
        <small className="play-tile-state">{status}</small>
      </span>
    </div>
  );
}

export function MapleControls({
  location,
  events,
  onEvent,
  blocked,
}: ControlsProps) {
  const state = moduleState(summarizePlay(events).entries, "maple");
  const { record: commit, message } = useModuleRecord(events, onEvent);
  const [fireHouse, setFireHouse] = useState("");
  const [origin, setOrigin] = useState("");
  const [trapHouse, setTrapHouse] = useState("");
  const [fireworkSpace, setFireworkSpace] = useState("");
  const [bikeSpace, setBikeSpace] = useState("");
  const record = (changes: MapleState) =>
    Object.keys(changes).length > 0 &&
    commit(
      newPlayEvent({
        kind: "module",
        moduleData: { module: "maple", changes },
      }),
    );
  if (location !== "Maple Lane") return null;
  const route = copRoute(String(state["cop.origin"]));
  const copSpace =
    typeof state["cop.step"] === "number"
      ? route[state["cop.step"]]
      : undefined;
  const smalleys = MAPLE_PEOPLE.filter((p) => p.event === "smalleys");
  const canAddBoth = smalleys.every(
    (p) => state[`person.${p.id}`] === undefined,
  );
  return (
    <fieldset
      className="play-maple"
      disabled={blocked}
      aria-label="Maple Lane tracking"
    >
      <section>
        <h3>Houses & quadrants</h3>
        <div className="maple-quadrants">
          {(["NW", "NE", "SW", "SE"] as const).map((quadrant, index) => (
            <section
              className="maple-quadrant"
              key={quadrant}
              aria-label={`${quadrant} quadrant`}
            >
              <h4>
                {
                  {
                    NW: "Northwest",
                    NE: "Northeast",
                    SW: "Southwest",
                    SE: "Southeast",
                  }[quadrant]
                }
              </h4>
              <div className="maple-houses">
                {MAPLE_HOUSES.filter((h) => h.quadrant === quadrant).map(
                  (h) => {
                    const value = state[`house.${h.id}`],
                      burning = state.fire === h.id;
                    return (
                      <div
                        key={h.id}
                        data-house={h.id}
                        data-searched={value === true}
                      >
                        <IllustratedTile
                          art={scene(burning ? 4 : index)}
                          title={h.name}
                          status={`${burning ? "Burning · " : ""}${value === true ? "Searched" : value === false ? "Unsearched" : "Not recorded"}`}
                          aria-label={
                            value === true
                              ? `Mark ${h.name} unsearched`
                              : `Mark ${h.name} searched`
                          }
                          aria-pressed={value === true}
                          disabled={burning && value !== true}
                          onClick={() =>
                            record({ [`house.${h.id}`]: value !== true })
                          }
                        >
                          {value === true && (
                            <span
                              className="maple-search-token"
                              aria-hidden="true"
                            >
                              X
                            </span>
                          )}
                        </IllustratedTile>
                      </div>
                    );
                  },
                )}
              </div>
              <details className="maple-details">
                <summary>
                  Search corrections
                  <span className="sr-only">: {quadrant}</span>
                </summary>
                {MAPLE_HOUSES.filter((h) => h.quadrant === quadrant).map(
                  (h) => (
                    <label key={h.id}>
                      {h.name}
                      <PlaySelect
                        aria-label={`${h.name} search status`}
                        value={
                          state[`house.${h.id}`] === true
                            ? "yes"
                            : state[`house.${h.id}`] === false
                              ? "no"
                              : ""
                        }
                        onChange={(e) =>
                          record({
                            [`house.${h.id}`]:
                              e.target.value === ""
                                ? null
                                : e.target.value === "yes",
                          })
                        }
                      >
                        <option value="">Not recorded</option>
                        <option value="no">Unsearched</option>
                        <option value="yes">Searched</option>
                      </PlaySelect>
                    </label>
                  ),
                )}
              </details>
            </section>
          ))}
        </div>
        <details className="maple-details">
          <summary>House & Convince rules</summary>
          <p>
            After a successful Search, mark that House and use its quadrant’s
            Item deck. Occupied Houses require Convince from the adjacent
            Street. Leaving uses normal movement. Enemies and panicking Victims
            ignore the entry restriction. Use the physical Convince cards for
            their result lines.
          </p>
        </details>
      </section>

      <section>
        <h3>People on Maple Lane</h3>
        <button
          className="maple-action"
          disabled={!canAddBoth}
          onClick={() =>
            record({
              "person.smalley-1": "in-play",
              "person.smalley-2": "in-play",
              "event.smalleys": "active",
            })
          }
        >
          Add both Smalleys
        </button>
        <div className="maple-people">
          {MAPLE_PEOPLE.map((p, index) => {
            const value = string(state[`person.${p.id}`]);
            return (
              <CharacterControl
                key={p.id}
                name={p.name}
                value={value}
                present="in-play"
                art={portrait(index, value)}
                states={[
                  { value: "in-play", label: "In play" },
                  { value: "saved", label: "Saved" },
                  { value: "killed", label: "Killed" },
                  { value: "removed", label: "Removed" },
                ]}
                outcomes={["saved", "killed"]}
                onChange={(v) => record(maplePersonChange(state, p.id, v))}
                showRules={false}
              />
            );
          })}
        </div>
        {smalleys.some((p) => state[`person.${p.id}`] === "in-play") && (
          <p className="maple-consequence">
            Each killed Smalley adds 1 extra Bloodlust.
          </p>
        )}
        {state["person.boyfriend"] === "in-play" && (
          <p className="maple-consequence">
            Boyfriend redirects the Killer’s targeting. Upkeep: move him 2
            spaces toward you; lose 2 Time if he shares your space.
          </p>
        )}
      </section>

      <section>
        <h3>Streets & lasting effects</h3>
        <div className="maple-effects">
          <article className="maple-prop">
            <StatusArt
              art={scene(state.fire && state.fire !== "none" ? 4 : 1)}
              title="Fire"
              status={
                state.fire === "none"
                  ? "No fire recorded"
                  : houseName(state.fire)
              }
            />
            {state.fire && state.fire !== "none" && (
              <p className="maple-consequence">
                Burning House cannot be entered or searched.
              </p>
            )}
            <label>
              House selected by the die
              <PlaySelect
                aria-label="Burning House"
                value={fireHouse}
                onChange={(e) => setFireHouse(e.target.value)}
              >
                <option value="">Choose House</option>
                {MAPLE_HOUSES.filter((h) =>
                  ["ne-boyfriend", "sw-smalley"].includes(h.id),
                ).map((h) => (
                  <option value={h.id} key={h.id}>
                    {h.name}
                  </option>
                ))}
              </PlaySelect>
            </label>
            <button
              className="maple-action"
              disabled={!fireHouse}
              onClick={() =>
                record({ fire: fireHouse, "event.fire": "active" })
              }
            >
              Record fire
            </button>
            <details className="maple-details">
              <summary>Rules & corrections: Fire</summary>
              <p>{effect("fire")}</p>
              <button onClick={() => record({ fire: "none" })}>
                Correct: no fire token
              </button>
              <button onClick={() => record({ fire: null })}>
                Clear fire record
              </button>
            </details>
          </article>
          <article className="maple-prop">
            <StatusArt
              art={
                MAPLE_EXITS.some((e) => state[`exit.${e}`] === true)
                  ? scene(5)
                  : { src: banner }
              }
              title="Roadblocks"
              status={`${MAPLE_EXITS.filter((e) => state[`exit.${e}`] === true).length} blocked · ${MAPLE_EXITS.filter((e) => typeof state[`exit.${e}`] === "boolean").length}/4 recorded`}
            />
            <div className="maple-exits">
              {MAPLE_EXITS.map((exit) => (
                <button
                  key={exit}
                  className="maple-action"
                  aria-label={`Block ${exitName(exit)} exit`}
                  aria-pressed={state[`exit.${exit}`] === true}
                  disabled={state[`exit.${exit}`] === true}
                  onClick={() => record({ [`exit.${exit}`]: true })}
                >
                  {exitName(exit)} ·{" "}
                  {state[`exit.${exit}`] === true
                    ? "Blocked"
                    : state[`exit.${exit}`] === false
                      ? "Open"
                      : "Unknown"}
                </button>
              ))}
            </div>
            {MAPLE_EXITS.some((e) => state[`exit.${e}`] === true) && (
              <p className="maple-consequence">
                Blocked exits prevent rescue, not movement.
              </p>
            )}
            <details className="maple-details">
              <summary>Rules & corrections: Roadblocks</summary>
              <p>{effect("construction")}</p>
              {MAPLE_EXITS.map((exit) => (
                <label key={exit}>
                  {exitName(exit)} exit
                  <PlaySelect
                    aria-label={`${exitName(exit)} exit correction`}
                    value={
                      state[`exit.${exit}`] === true
                        ? "blocked"
                        : state[`exit.${exit}`] === false
                          ? "open"
                          : ""
                    }
                    onChange={(e) =>
                      record({
                        [`exit.${exit}`]:
                          e.target.value === ""
                            ? null
                            : e.target.value === "blocked",
                      })
                    }
                  >
                    <option value="">Not recorded</option>
                    <option value="open">Open</option>
                    <option value="blocked">Blocked for rescue</option>
                  </PlaySelect>
                </label>
              ))}
            </details>
          </article>
          <article className="maple-prop">
            <StatusArt
              art={
                state["cop.status"] === "on-route" ? scene(6) : { src: banner }
              }
              title="Officer Kopp · Cop Car"
              status={
                state["cop.status"] === "on-route"
                  ? streetName(copSpace)
                  : state["cop.status"] === "exited"
                    ? "Exited"
                    : state["cop.status"] === "absent"
                      ? "Not on board"
                      : "Not recorded"
              }
            />
            {state["cop.status"] === "on-route" ? (
              <>
                <p>
                  Step {String(state["cop.step"] ?? "?")}/4 · toward the
                  opposite Exit
                </p>
                <button
                  className="maple-action"
                  disabled={!Object.keys(advanceCop(state)).length}
                  onClick={() => record(advanceCop(state))}
                >
                  Advance Cop Car one space
                </button>
              </>
            ) : (
              <>
                <label>
                  Starting Exit
                  <PlaySelect
                    aria-label="Cop Car starting Exit"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  >
                    <option value="">Choose Exit</option>
                    {MAPLE_EXITS.map((e) => (
                      <option value={e} key={e}>
                        {e} Exit
                      </option>
                    ))}
                  </PlaySelect>
                </label>
                <button
                  className="maple-action"
                  disabled={!origin || state["cop.status"] === "exited"}
                  onClick={() => record(startCop(origin))}
                >
                  Place Cop Car
                </button>
              </>
            )}
            <details className="maple-details">
              <summary>Rules & corrections: Cop Car</summary>
              <p>{effect("kopp")}</p>
              <label>
                Correct origin
                <PlaySelect
                  aria-label="Cop Car origin correction"
                  value={String(state["cop.origin"] ?? "")}
                  onChange={(e) => {
                    if (e.target.value) record(startCop(e.target.value));
                  }}
                >
                  <option value="">Not recorded</option>
                  {MAPLE_EXITS.map((e) => (
                    <option key={e} value={e}>
                      {e} Exit
                    </option>
                  ))}
                </PlaySelect>
              </label>
              <label>
                Correct route step
                <PlaySelect
                  aria-label="Cop Car step correction"
                  value={String(state["cop.step"] ?? "")}
                  onChange={(e) => {
                    if (e.target.value !== "" && route.length) {
                      const step = Number(e.target.value);
                      record({
                        "cop.step": step,
                        "cop.status": step === 4 ? "exited" : "on-route",
                        "event.kopp": step === 4 ? "ended" : "active",
                      });
                    }
                  }}
                >
                  <option value="">Not recorded</option>
                  {route.map((space, i) => (
                    <option key={space} value={i}>
                      {i} · {streetName(space)}
                    </option>
                  ))}
                </PlaySelect>
              </label>
              <button
                onClick={() =>
                  record({
                    "cop.status": "absent",
                    "cop.origin": null,
                    "cop.step": null,
                    "event.kopp": "ended",
                  })
                }
              >
                Correct: car not on board
              </button>
              <button
                onClick={() =>
                  record({
                    "cop.status": null,
                    "cop.origin": null,
                    "cop.step": null,
                    "event.kopp": null,
                  })
                }
              >
                Clear Cop Car record
              </button>
            </details>
          </article>
          <EventControl
            name="Friendly Neighbors"
            value={string(state["event.neighbors"])}
            art={scene(2)}
            effect={effect("neighbors")}
            onActivate={() => record({ "event.neighbors": "active" })}
            onEnd={() => record({ "event.neighbors": "ended" })}
            onClear={() => record({ "event.neighbors": null })}
          >
            {state["event.neighbors"] === "active" && (
              <p className="maple-consequence">
                Convince: roll 1 additional die.
              </p>
            )}
          </EventControl>
        </div>
      </section>

      <section>
        <h3>Items on the board</h3>
        <div className="maple-effects">
          {(
            [
              {
                key: "fireworks",
                title: "Fireworks",
                value: fireworkSpace,
                set: setFireworkSpace,
                cell: state.fireworks === "spent" ? 9 : 8,
              },
              {
                key: "bicycle",
                title: "Bicycle",
                value: bikeSpace,
                set: setBikeSpace,
                cell: state.bicycle === "none" ? 0 : 7,
              },
            ] as const
          ).map((prop) => (
            <article className="maple-prop" key={prop.key}>
              <StatusArt
                art={
                  state[prop.key] === undefined || state[prop.key] === "none"
                    ? { src: banner }
                    : scene(prop.cell)
                }
                title={prop.title}
                status={streetName(state[prop.key])}
              />
              <label>
                Street
                <PlaySelect
                  aria-label={`${prop.title} Street`}
                  value={prop.value}
                  onChange={(e) => prop.set(e.target.value)}
                >
                  <option value="">Choose Street</option>
                  {MAPLE_STREETS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </PlaySelect>
              </label>
              <button
                className="maple-action"
                disabled={!prop.value}
                onClick={() => record({ [prop.key]: prop.value })}
              >
                Record {prop.title} position
              </button>
              {prop.key === "fireworks" &&
                state.fireworks &&
                state.fireworks !== "none" &&
                state.fireworks !== "spent" && (
                  <button
                    className="maple-action"
                    onClick={() => record({ fireworks: "spent" })}
                  >
                    Killer reached Fireworks
                  </button>
                )}
              <details className="maple-details">
                <summary>Rules & corrections: {prop.title}</summary>
                <p>{item(prop.key)}</p>
                <button onClick={() => record({ [prop.key]: "none" })}>
                  Correct: {prop.title} not placed
                </button>
                <button onClick={() => record({ [prop.key]: null })}>
                  Clear {prop.title} record
                </button>
              </details>
            </article>
          ))}
          <article className="maple-prop">
            <StatusArt
              art={scene(
                MAPLE_HOUSES.some((h) => state[`trap.${h.id}`] === "placed")
                  ? 10
                  : MAPLE_HOUSES.some(
                        (h) => state[`trap.${h.id}`] === "triggered",
                      )
                    ? 11
                    : 0,
              )}
              title="Booby Traps"
              status={`${MAPLE_HOUSES.filter((h) => state[`trap.${h.id}`] === "placed").length} placed · ${MAPLE_HOUSES.filter((h) => typeof state[`trap.${h.id}`] === "string").length}/12 recorded`}
            />
            <label>
              House
              <PlaySelect
                aria-label="Booby Trap House"
                value={trapHouse}
                onChange={(e) => setTrapHouse(e.target.value)}
              >
                <option value="">Choose House</option>
                {MAPLE_HOUSES.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </PlaySelect>
            </label>
            <button
              className="maple-action"
              disabled={!trapHouse || state[`trap.${trapHouse}`] === "placed"}
              onClick={() => record({ [`trap.${trapHouse}`]: "placed" })}
            >
              Place Booby Trap
            </button>
            {MAPLE_HOUSES.filter(
              (h) =>
                state[`trap.${h.id}`] === "placed" ||
                state[`trap.${h.id}`] === "triggered",
            ).map((h) => (
              <div className="maple-trap" key={h.id}>
                <span>
                  {h.name} · {String(state[`trap.${h.id}`])}
                </span>
                {state[`trap.${h.id}`] === "placed" && (
                  <button
                    className="maple-action"
                    onClick={() => record({ [`trap.${h.id}`]: "triggered" })}
                  >
                    Trigger trap: {h.name}
                  </button>
                )}
              </div>
            ))}
            <details className="maple-details">
              <summary>Rules & corrections: Booby Traps</summary>
              <p>{item("odds")}</p>
              {MAPLE_HOUSES.map((h) => (
                <label key={h.id}>
                  {h.name}
                  <PlaySelect
                    aria-label={`${h.name} Booby Trap correction`}
                    value={String(state[`trap.${h.id}`] ?? "")}
                    onChange={(e) =>
                      record({ [`trap.${h.id}`]: e.target.value || null })
                    }
                  >
                    <option value="">Not recorded</option>
                    <option value="not-placed">Not placed</option>
                    <option value="placed">Placed</option>
                    <option value="triggered">Triggered</option>
                  </PlaySelect>
                </label>
              ))}
            </details>
          </article>
        </div>
      </section>
      <p className="play-feedback" role="status">
        {message}
      </p>
    </fieldset>
  );
}
