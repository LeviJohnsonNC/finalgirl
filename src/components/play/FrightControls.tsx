import { summarizePlay, newPlayEvent } from "@/lib/play/events";
import { useRef } from "react";
import { useModuleRecord } from "./useModuleRecord";
import { KillerCards } from "./KillerCards";
import { BoilerRoom } from "./BoilerRoom";
import { IllustratedTile } from "./IllustratedTile";
import { atlasCell } from "./killerPresentation";
import {
  frightState,
  frightTransition,
  frightCards,
  type FrightCommand,
  type Direction,
} from "../../../supabase/functions/_shared/play/fright";
import cardsArt from "@/assets/play/fright/cards.webp";
import type { ControlsProps } from "./moduleDefinitions";
import "@/styles/fright.css";

export function FrightControls({
  events,
  onEvent,
  blocked = false,
}: ControlsProps) {
  const entries = summarizePlay(events).entries;
  const state = frightState(entries);
  const cards = frightCards(entries);
  const { record, message } = useModuleRecord(events, onEvent);
  const revision = events.map((event) => event.id).join(",");
  const committedAction = useRef({ revision, committed: false });
  if (committedAction.current.revision !== revision)
    committedAction.current = { revision, committed: false };
  const act = (
    command: FrightCommand,
    direction?: Direction,
    effect?: string,
  ) => {
    if (blocked) return false;
    if (committedAction.current.committed) return false;
    const next = frightTransition(
      state,
      { command, direction, effect },
      events,
      entries,
    );
    if (next) {
      committedAction.current.committed = true;
      const saved = record(
        newPlayEvent({
          kind: "module",
          moduleData: {
            module: "fright",
            changes: { snapshot: JSON.stringify(next) },
          },
        }),
      );
      if (!saved) committedAction.current.committed = false;
      return saved;
    }
    return false;
  };
  const forced = cards.finale?.id === "face-your-fright";
  const asleep = state?.sleep === "asleep";
  const sleep = state?.sleep ?? "unknown";
  const exceptional = cards.power?.id === "frightmare-inevitable";
  const effects = [
    ...(cards.finale &&
    ["face-your-fright", "everyone-must-die"].includes(cards.finale.id)
      ? [
          {
            key: cards.finaleEvent + ":" + cards.finale.id,
            label:
              cards.finale.id === "face-your-fright"
                ? "Record Finale sleep effect"
                : "Record Dr. Fright moved off the board",
          },
        ]
      : []),
    ...(cards.power?.id === "never-really-dead"
      ? [
          {
            key: cards.powerEvent + ":" + cards.power.id,
            label: "Record Final Health token replaced",
          },
        ]
      : []),
  ];
  return (
    <div className="fright-controls">
      <div
        className="fright-sleep-grid"
        role="group"
        aria-label="Final Girl sleep state"
      >
        <IllustratedTile
          art={atlasCell(cardsArt, 7, 1254, 1254)}
          title="Awake"
          status={sleep === "awake" ? "Recorded" : "Normal world"}
          aria-label="Record Final Girl Awake"
          aria-pressed={sleep === "awake"}
          disabled={
            blocked || forced || state?.mode === "digital" || sleep === "awake"
          }
          onClick={() => act("awake")}
        />
        <IllustratedTile
          art={atlasCell(cardsArt, 8, 1254, 1254)}
          title="Asleep"
          status={sleep === "asleep" ? "Recorded" : "The Boiler Room"}
          aria-label="Record Final Girl Asleep"
          aria-pressed={asleep}
          disabled={blocked || asleep}
          onClick={() => act("asleep")}
        />
      </div>
      <p className="fright-consequence">
        {sleep === "unknown"
          ? "Sleep state not recorded."
          : asleep
            ? "Victims cannot follow or be saved. Normal attacks are possible."
            : exceptional
              ? "Dr. Fright may attack you while Awake. You cannot attack him."
              : "You and Dr. Fright cannot attack each other while Awake."}
      </p>
      {forced && (
        <p className="fright-consequence">
          Face Your Fright: remain Asleep; reset the Boiler Room on every exit.
        </p>
      )}
      {cards.finale?.id === "time-to-die" && (
        <p className="fright-consequence">
          Upkeep while Awake: lose two Health, then fall Asleep.
        </p>
      )}
      {cards.finale?.id === "everyone-must-die" && (
        <p className="fright-consequence">
          While Asleep, you may attack Dr. Fright from any space.
        </p>
      )}
      {cards.power?.id === "pitchfork-assault" && (
        <p className="fright-consequence">
          When Dr. Fright damages you: increase Horror by one.
        </p>
      )}
      {cards.power?.id === "shock-factor" && (
        <p className="fright-consequence">
          Victims who would panic are killed instead. Maximum three per turn.
        </p>
      )}
      {effects
        .filter((effect) => !state?.effects.includes(effect.key))
        .map((effect) => (
          <button
            type="button"
            key={effect.key}
            className="fright-effect"
            disabled={blocked || state?.pending}
            onClick={() => act("effect", undefined, effect.key)}
          >
            {effect.label}
          </button>
        ))}
      {state?.mode === "digital" ? (
        <BoilerRoom
          state={state}
          blocked={blocked}
          message={message}
          onSlide={(d) => act("slide", d)}
          onDefended={() => act("defended")}
          onSleep={() => act("asleep")}
          onUndo={() =>
            record(newPlayEvent({ kind: "undo", target: state.eventId }))
          }
        />
      ) : (
        <div className="fright-physical">
          <strong>Physical Boiler Room cards</strong>
          <p>
            Track sleep here, or use digital cards at a fresh-deck boundary.
          </p>
          <button
            type="button"
            disabled={blocked || asleep}
            onClick={() => act("digital")}
          >
            Use digital Boiler Room · fresh deck
          </button>
        </div>
      )}
      <details className="module-card-rules fright-details">
        <summary>Rules &amp; corrections</summary>
        <p>
          Start Awake. Resolving Short Rest or Long Rest makes you fall Asleep
          regardless of its result. Resolve the normal Action card effects
          physically.
        </p>
        <p>
          While Asleep, you may move, Search and attack normally, but cannot
          save Victims or have them follow. Resolve any number of Boiler Room
          cards during the Action phase, and one at the end of the Killer phase
          unless a game effect changes this.
        </p>
        <p>
          Slide the covered stack up, down, left or right to expose the next
          card. An illustrated Dr. Fright attacks you from anywhere. Defend
          normally. After all four cards, wake up and shuffle; Face Your Fright
          keeps you Asleep instead.
        </p>
        <p>
          Top Bloodlust effect: if Asleep, reset the Boiler Room; otherwise fall
          Asleep. This action does not change Health, Bloodlust or victims.
        </p>
        <button
          type="button"
          disabled={blocked || sleep === "unknown" || state?.pending}
          onClick={() => act("reset")}
        >
          Resolve Bloodlust sleep/reset effect
        </button>
        {state?.mode === "digital" && (
          <button
            type="button"
            disabled={blocked || asleep || state.pending}
            onClick={() => act("physical")}
          >
            Use physical cards at a fresh-deck boundary
          </button>
        )}
        <p>
          Undoing an earlier Boiler Room observation also rewinds its dependent
          steps. The same decks are retained; information already seen cannot be
          unlearned.
        </p>
      </details>
      <KillerCards killer="Dr. Fright" events={events} onEvent={onEvent} />
      <p role="status" className="play-feedback">
        {message}
      </p>
    </div>
  );
}
