import { useState } from "react";
import { CharacterControl } from "./CharacterControl";
import { EventControl } from "./EventControl";
import { useModuleRecord } from "./useModuleRecord";
import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import {
  moduleState,
  CARNIVAL_TRAPS,
  CARNIVAL_ITEM_TRAPS,
  CARNIVAL_EVENTS,
  CARNIVAL_PEOPLE,
  CARNIVAL_ROOMS,
  activateCarnivalEvent,
  carnivalActorChanges,
  carnivalItemEncounter,
  type ModuleValue,
} from "@/lib/play/modules";
import { IllustratedTile } from "./IllustratedTile";
import type { ModuleArt } from "./ModuleArtwork";
import { PlaySelect } from "./PlaySelect";
import boardArt from "@/assets/play/carnival/board-traps.webp";
import itemArt from "@/assets/play/carnival/item-traps.webp";
import peopleArt from "@/assets/play/carnival/companions.webp";
import eventArt from "@/assets/play/carnival/events.webp";
import "@/styles/play-carnival.css";

const atlas = (
  src: string,
  index: number,
  columns = 3,
  rows = 2,
): ModuleArt => ({
  src,
  atlas: {
    width: 1536,
    height: 1024,
    x: (index % columns) * (1536 / columns) + 4,
    y: Math.floor(index / columns) * (1024 / rows) + 4,
    cellWidth: 1536 / columns - 8,
    cellHeight: 1024 / rows - 8,
  },
});
const eventArtwork: Record<string, ModuleArt> = {
  "animal-panic": atlas(eventArt, 1, 2, 2),
  clowns: atlas(eventArt, 0, 2, 2),
  sibling: atlas(peopleArt, 0),
  cart: atlas(peopleArt, 4),
  "full-moon": atlas(peopleArt, 2),
  dangerous: atlas(eventArt, 2, 2, 2),
  "not-real": atlas(peopleArt, 5),
  mirrors: atlas(eventArt, 3, 2, 2),
  fiance: atlas(peopleArt, 1),
  junk: atlas(peopleArt, 3),
};
const statuses: Record<string, string> = {
  "in-play": "In play",
  saved: "Saved",
  killed: "Killed",
  "with-you": "With you",
  lost: "Lost / fled",
  available: "Available",
  discarded: "Discarded",
  active: "Active",
  cleared: "Cleared",
};
export function CarnivalControls({
  events,
  onEvent,
}: {
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
}) {
  const state = moduleState(summarizePlay(events).entries, "carnival");
  const [openTrap, setOpenTrap] = useState<string | null>(null);
  const { record: commit, message } = useModuleRecord(events, onEvent);
  const record = (changes: Record<string, ModuleValue>) =>
    commit(
      newPlayEvent({
        kind: "module",
        moduleData: { module: "carnival", changes },
      }),
    );
  const setActor = (key: string, value: string | null) =>
    record(carnivalActorChanges(key, value, state));
  const activate = (id: string) => {
    const changes = activateCarnivalEvent(id, state);
    if (changes) record(changes);
  };
  const actors = [
    ...CARNIVAL_PEOPLE.map((p, index) => ({
      key: `person.${p.id}`,
      name: p.name,
      index,
      values: ["in-play", "saved", "killed"],
      help:
        p.id === "sibling"
          ? "Same space: spend 2 Time to reroll a die. Death: +2 Bloodlust."
          : "Blocks an Enemy entering your space while together. Trap death: +5 Horror.",
    })),
    {
      key: "werewolf",
      name: "Werewolf",
      index: 2,
      values: ["in-play"],
      help: "Full Moon only. Cannot follow, be targeted, saved or killed. Upkeep: panic, then 2 damage; Victim → you → Minion → Killer.",
    },
    {
      key: "zappo",
      name: "Zappo",
      index: 3,
      values: ["with-you", "lost"],
      help: "Search from up to 2 spaces away. If you use Zappo and reveal an Item Trap, ignore it and discard Zappo. No protection from Terror Traps.",
    },
    {
      key: "cart",
      name: "Golf Cart",
      index: 4,
      values: ["available", "discarded"],
      help: "Upkeep: you and/or up to 2 Victims may ride up to 2 spaces on the outer path. Discard on entering an Enemy’s space to deal 3 damage.",
    },
  ];
  const active = [
    ...actors
      .filter((actor) =>
        ["in-play", "with-you", "available"].includes(String(state[actor.key])),
      )
      .map((actor) => actor.name),
    ...CARNIVAL_TRAPS.filter(
      (t) => state[`trap.${t.id}.status`] === "placed",
    ).map((t) => t.name),
    ...CARNIVAL_EVENTS.filter((e) => state[`event.${e.id}`] === "active").map(
      (e) => e.name,
    ),
    ...(["cobra", "bear"] as const)
      .filter((id) => state[`condition.${id}`] === "active")
      .map((id) => CARNIVAL_ITEM_TRAPS.find((t) => t.id === id)!.name),
  ];
  return (
    <section className="play-carnival" aria-label="Carnival of Blood tracking">
      <div className="carnival-active" aria-live="polite">
        <h3>On the grounds</h3>
        {active.length ? (
          <p>{active.join(" · ")}</p>
        ) : (
          <p>No active hazards, companions or Events recorded.</p>
        )}
        {state.searchPenalty === true && (
          <p className="carnival-warning">
            So Much Junk: Search −1 die (minimum 1), for the rest of the game.
          </p>
        )}
      </div>
      <div>
        <h3>Persistent traps</h3>
        <p className="carnival-help">
          Place each token once. Traps stay on the board; all Enemies ignore
          them. Resolve effects and record victim totals separately.
        </p>
      </div>
      <div className="carnival-traps">
        {CARNIVAL_TRAPS.map((trap, index) => {
          const value = state[`trap.${trap.id}.status`],
            placed = value === "placed";
          return (
            <article key={trap.id} data-state={value ?? "unrecorded"}>
              <IllustratedTile
                className="carnival-trap-tile"
                art={atlas(boardArt, index + (placed ? 3 : 0))}
                title={trap.name}
                status={
                  placed
                    ? "Placed · View details"
                    : value === "not-placed"
                      ? "Not placed · Place token"
                      : "Not recorded · Place token"
                }
                aria-label={placed ? `View ${trap.name}` : `Place ${trap.name}`}
                onClick={() => {
                  if (placed)
                    setOpenTrap(openTrap === trap.id ? null : trap.id);
                  else if (
                    record({
                      [`trap.${trap.id}.status`]: "placed",
                      lastTerrorTrap: trap.id,
                      terrorTrapOutcome: "placed",
                    })
                  )
                    setOpenTrap(trap.id);
                }}
              />
              <p>{trap.effect}</p>
              <button
                className="carnival-cancel"
                aria-label={`Card canceled with Found Footage: ${trap.name}`}
                onClick={() =>
                  record({
                    lastTerrorTrap: trap.id,
                    terrorTrapOutcome: "canceled-footage",
                  })
                }
              >
                Card canceled with Found Footage
                <span className="sr-only">: {trap.name}</span>
              </button>
              <details
                open={openTrap === trap.id}
                onToggle={(e) => {
                  if (e.currentTarget.open) setOpenTrap(trap.id);
                  else if (openTrap === trap.id) setOpenTrap(null);
                }}
              >
                <summary>
                  Placement & correction
                  <span className="sr-only"> for {trap.name}</span>
                </summary>
                <label>
                  Token status
                  <PlaySelect
                    aria-label={`${trap.name} status`}
                    value={String(value ?? "")}
                    onChange={(e) =>
                      record({
                        [`trap.${trap.id}.status`]: e.target.value || null,
                        ...(e.target.value !== "placed"
                          ? { [`trap.${trap.id}.space`]: null }
                          : {}),
                      })
                    }
                  >
                    <option value="">Not recorded</option>
                    <option value="not-placed">Not placed</option>
                    <option value="placed">Placed</option>
                  </PlaySelect>
                </label>
                {placed && (
                  <label>
                    Space note
                    <input
                      aria-label={`${trap.name} space`}
                      defaultValue={String(
                        state[`trap.${trap.id}.space`] ?? "",
                      )}
                      key={String(state[`trap.${trap.id}.space`] ?? "")}
                      list="carnival-spaces"
                      maxLength={100}
                      placeholder="Attraction or board-space description"
                      onBlur={(e) => {
                        const value = e.target.value.trim();
                        if (value !== (state[`trap.${trap.id}.space`] ?? ""))
                          record({ [`trap.${trap.id}.space`]: value || null });
                      }}
                    />
                  </label>
                )}
                <p className="carnival-help">
                  Only correct a mistaken placement here. Discarding or
                  canceling a card does not remove an existing token.
                </p>
              </details>
            </article>
          );
        })}
      </div>
      <datalist id="carnival-spaces">
        {CARNIVAL_ROOMS.map((room) => (
          <option key={room} value={room} />
        ))}
      </datalist>
      {state.lastTerrorTrap && (
        <p className="carnival-help" role="status">
          Latest Terror Trap card:{" "}
          {CARNIVAL_TRAPS.find((t) => t.id === state.lastTerrorTrap)?.name} —{" "}
          {state.terrorTrapOutcome === "canceled-footage"
            ? "canceled with Found Footage; existing tokens unchanged"
            : "placement recorded"}
          .
        </p>
      )}
      <details className="carnival-section">
        <summary>People & props</summary>
        <p className="carnival-help">
          Activate their Event below, or record current state here. Marking a
          person’s outcome does not change the saved/killed counters.
        </p>
        <div className="carnival-actors">
          {actors.map((actor) => {
            const value = state[actor.key],
              present = ["in-play", "with-you", "available"].includes(
                String(value),
              );
            return (
              <CharacterControl
                key={actor.key}
                name={actor.name}
                value={typeof value === "string" ? value : undefined}
                present={actor.values[0]}
                states={actor.values.map((value) => ({
                  value,
                  label: statuses[value],
                }))}
                outcomes={actor.values.slice(1)}
                art={atlas(peopleArt, actor.index)}
                tileClassName="carnival-actor-tile"
                help={actor.help}
                onChange={(value) => setActor(actor.key, value)}
              />
            );
          })}
        </div>
      </details>
      <details className="carnival-section">
        <summary>Events</summary>
        <p className="carnival-help">
          Activation records linked characters or objects together. Place
          physical pieces and resolve immediate effects yourself. Ended
          roles/objects require an explicit status correction before
          reactivation.
        </p>
        <div className="carnival-events">
          {CARNIVAL_EVENTS.map((event) => {
            const value = state[`event.${event.id}`],
              active = value === "active",
              allowed = activateCarnivalEvent(event.id, state) !== null;
            return (
              <EventControl
                key={event.id}
                name={event.name}
                value={typeof value === "string" ? value : undefined}
                art={eventArtwork[event.id]}
                effect={event.effect}
                tileClassName="carnival-event-tile"
                allowed={allowed}
                onActivate={() => activate(event.id)}
                onEnd={() => record({ [`event.${event.id}`]: "ended" })}
                onClear={() => record({ [`event.${event.id}`]: null })}
              />
            );
          })}
        </div>
        {(state.searchPenalty !== undefined ||
          state["event.junk"] !== undefined) && (
          <label className="carnival-penalty">
            <input
              type="checkbox"
              checked={state.searchPenalty === true}
              onChange={(e) => record({ searchPenalty: e.target.checked })}
            />
            Lasting So Much Junk Search penalty (uncheck only to correct a
            mistaken record)
          </label>
        )}
      </details>
      <details className="carnival-section">
        <summary>Item Trap encounters</summary>
        <p className="carnival-help">
          Record what actually happened. Found Footage availability is not
          inferred from a remembered find. Encounters can recur after cards
          return to the decks.
        </p>
        <div className="carnival-item-traps">
          {CARNIVAL_ITEM_TRAPS.map((trap, index) => {
            const value = state[`condition.${trap.id}`],
              active = value === "active";
            return (
              <article
                key={trap.id}
                data-state={active ? "active" : value ? "ended" : "unrecorded"}
              >
                <IllustratedTile
                  className="carnival-item-tile"
                  art={atlas(
                    itemArt,
                    index + (active || trap.id === "gas" ? 3 : 0),
                  )}
                  title={trap.name}
                  status={
                    trap.id === "gas"
                      ? "One-shot encounter"
                      : active
                        ? "Attached"
                        : value === "cleared"
                          ? "Cleared"
                          : "Not recorded"
                  }
                  aria-label={`Record ${trap.name}`}
                  onClick={() => {
                    const c = carnivalItemEncounter(trap.id, "resolved", state);
                    if (c) record(c);
                  }}
                />
                <p>{trap.effect}</p>
                <div className="carnival-encounter-actions">
                  {(
                    ["resolved", "canceled-footage", "avoided-zappo"] as const
                  ).map((outcome) => (
                    <button
                      key={outcome}
                      disabled={
                        outcome === "avoided-zappo" &&
                        state.zappo !== "with-you"
                      }
                      aria-label={`${outcome === "resolved" ? "Record effects" : outcome === "canceled-footage" ? "Canceled with Found Footage" : "Avoided using Zappo"}: ${trap.name}`}
                      onClick={() => {
                        const c = carnivalItemEncounter(
                          trap.id,
                          outcome,
                          state,
                        );
                        if (c) record(c);
                      }}
                    >
                      {outcome === "resolved"
                        ? "Effects resolved"
                        : outcome === "canceled-footage"
                          ? "Found Footage"
                          : "Used Zappo"}
                    </button>
                  ))}
                </div>
                {trap.id !== "gas" && value !== undefined && (
                  <button
                    aria-label={`${active ? "Clear attached effect" : "Clear condition record"}: ${trap.name}`}
                    onClick={() =>
                      record({
                        [`condition.${trap.id}`]: active ? "cleared" : null,
                      })
                    }
                  >
                    {active
                      ? "Clear attached effect"
                      : "Clear condition record"}
                    <span className="sr-only">: {trap.name}</span>
                  </button>
                )}
              </article>
            );
          })}
        </div>
        {state.lastEncounter && (
          <p role="status">
            Latest Item Trap: {state.lastEncounter} —{" "}
            {state.encounterOutcome === "canceled-footage"
              ? "canceled with Found Footage"
              : state.encounterOutcome === "avoided-zappo"
                ? "avoided using Zappo; Zappo fled"
                : "effects resolved manually"}
            .
          </p>
        )}
      </details>
      <details className="carnival-section">
        <summary>Setup & quick rules</summary>
        <ol>
          <li>
            Set the three Item Traps aside. Shuffle ordinary Items; deal three
            decks of two facedown Items.
          </li>
          <li>Add one random Item Trap to each deck and shuffle separately.</li>
          <li>
            Add one faceup ordinary Item to each deck; return unused Items to
            the box. Each deck now has four cards.
          </li>
        </ol>
        <p>
          Item Traps resolve when revealed by Search; resolve the trap before
          taking any accompanying Item. Cobra/Bear Trap conditions stay with the
          Final Girl until removed. Terror Trap tokens stay on their recorded
          board spaces for the rest of the game. All Enemies ignore these
          tokens.
        </p>
        <p>
          Found Footage cancels the whole chosen Terror Trap card before
          resolution. The Werewolf cannot be targeted, saved or killed. Use
          Rules for the complete photo-verified references.
        </p>
      </details>
      <p className="carnival-save-message" role="status">
        {message}
      </p>
    </section>
  );
}
