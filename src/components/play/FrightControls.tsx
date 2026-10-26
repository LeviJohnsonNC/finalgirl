import { modulePhoto } from "./modulePhotos";
import { summarizePlay, newPlayEvent } from "@/lib/play/events";
import { useRef, useState } from "react";
import { useModuleRecord } from "./useModuleRecord";
import { MinorPowerGroup } from "./MinorPowerGroup";
import { MinorPowerControl } from "./MinorPowerControl";
import { PlaySearch } from "./PlaySearch";
import minorArt from "@/assets/play/fright/minors.webp";
import { KillerCards } from "./KillerCards";
import { BoilerRoom } from "./BoilerRoom";
import { FrightSleepControls } from "./FrightSleepControls";
import {
  frightState,
  parseFright,
  frightTransition,
  frightCards,
  frightForcedSleep,
  frightSleepReason,
  FRIGHT_MINOR_POWERS,
  FRIGHT_TERRORS,
  FRIGHT_CONDITIONS,
  FRIGHT_STARTING_ACTION,
  type FrightAction,
  type FrightCommand,
  type Direction,
} from "../../../supabase/functions/_shared/play/fright";
import type { ControlsProps } from "./moduleDefinitions";
import "@/styles/fright.css";

export function FrightControls({
  events,
  onEvent,
  blocked = false,
}: ControlsProps) {
  const [reference, setReference] = useState("");
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
    extra?: Partial<FrightAction>,
  ) => {
    if (blocked) return false;
    if (committedAction.current.committed) return false;
    const next = frightTransition(
      state,
      { command, direction, effect, ...extra },
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
  const forced = frightForcedSleep(entries);
  const forcedReason = frightSleepReason(entries);
  const condition = FRIGHT_CONDITIONS.find((c) => c.name === reference);
  const selectedTerror = FRIGHT_TERRORS.find((c) => c.name === reference);
  const minorDisabled = blocked || Boolean(state?.pending);
  const minorCell = (index: number) => ({
    src: minorArt,
    atlas: {
      width: 1536,
      height: 1024,
      x: (index % 3) * 512 + 3,
      y: Math.floor(index / 3) * 512 + 3,
      cellWidth: 506,
      cellHeight: 506,
    },
  });
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
      <FrightSleepControls
        sleep={sleep}
        forced={forced}
        forcedReason={forcedReason}
        disabled={blocked}
        pending={state?.pending}
        onChange={(value) => act(value)}
      />
      <p className="fright-consequence">
        {sleep === "unknown"
          ? "Sleep state not recorded."
          : asleep
            ? "Victims cannot follow or be saved. Normal attacks are possible."
            : state?.conditions?.["blurred-reality"]
              ? "Blurred Reality: you and Dr. Fright may damage each other while Awake until the next Killer phase."
              : exceptional
                ? "Dr. Fright may attack you while Awake. You cannot attack him."
                : "You and Dr. Fright cannot attack each other while Awake."}
      </p>
      {forced && (
        <p className="fright-consequence">
          {forcedReason}: remain Asleep; reset the Boiler Room on every exit.
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
      {(state?.minor?.["hellish-pursuit"] ?? 0) > 0 && (
        <p className="fright-consequence">
          Hellish Pursuit: while Asleep, resolve one additional Boiler Room card
          at the end of the Killer phase, if able.
        </p>
      )}
      {FRIGHT_CONDITIONS.filter((c) => state?.conditions?.[c.id]).map((c) => (
        <div className="fright-active-effect" key={c.id}>
          <p>
            <strong>{c.name}</strong> · {c.effect}
          </p>
          <button
            aria-label={`End effect: ${c.name}`}
            disabled={minorDisabled}
            onClick={() =>
              act("condition", undefined, undefined, {
                condition: c.id,
                active: false,
              })
            }
          >
            End effect<span className="sr-only">: {c.name}</span>
          </button>
        </div>
      ))}
      {state?.mode === "digital" ? (
        <BoilerRoom
          state={state}
          blocked={blocked}
          message={message}
          forced={forced}
          forcedReason={forcedReason}
          onSlide={(d) => act("slide", d)}
          onDefended={() => act("defended")}
          onSleepChange={(value) => act(value)}
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
        <p>Starting Killer Action: {FRIGHT_STARTING_ACTION}</p>
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
      <section
        className="fright-minors"
        aria-label="Dr. Fright Minor Dark Powers"
      >
        <h3>Minor Dark Powers</h3>
        <MinorPowerGroup className="fright-minor-grid">
          {FRIGHT_MINOR_POWERS.map((power, row) => (
            <MinorPowerControl
              key={power.id}
              name={power.name}
              effect={power.effect}
              health={state?.minor?.[power.id]}
              maxHealth={power.health}
              disabled={minorDisabled}
              previouslyRevealed={entries.some(
                (e) =>
                  e.moduleData?.module === "fright" &&
                  (parseFright(e.moduleData.changes.snapshot)?.minor?.[
                    power.id
                  ] ?? 0) > 0,
              )}
              art={(health) =>
                minorCell(row === 0 ? 2 - health : health > 0 ? 3 : 4)
              }
              heroArt={modulePhoto("Dr. Fright", 7 + row)}
              heartArt={minorCell(5)}
              onChange={(health) =>
                act("minor", undefined, undefined, { minor: power.id, health })
              }
            />
          ))}
        </MinorPowerGroup>
      </section>
      <details className="module-card-rules fright-terrors">
        <summary>Terror cards &amp; temporary effects</summary>
        <PlaySearch
          label="Dr. Fright Terror card reference"
          value={reference}
          onChange={setReference}
          allowCustom={false}
          options={FRIGHT_TERRORS.map((c) => c.name)}
          placeholder="Choose a Terror card"
        />
        {selectedTerror && (
          <p className="fright-terror-reference">{selectedTerror.effect}</p>
        )}
        {condition && !state?.conditions?.[condition.id] && (
          <button
            className="fright-effect"
            disabled={minorDisabled}
            onClick={() =>
              act("condition", undefined, undefined, {
                condition: condition.id,
                active: true,
              })
            }
          >
            Track {condition.name} effect
          </button>
        )}
        {reference === "Never Sleep Again" &&
          state?.mode === "digital" &&
          asleep && (
            <button
              className="fright-effect"
              disabled={minorDisabled}
              onClick={() => act("reshuffle")}
            >
              Reset Boiler Room · remain Asleep
            </button>
          )}
        {reference === "Better Stay Up Late" && asleep && (
          <p>
            Resolve every remaining card in the Boiler Room, defending each
            attack before continuing.
          </p>
        )}
        <p>
          Track a temporary effect only when its condition applies. End it at
          the printed timing. Choosing a reference does not resolve the card.
        </p>
      </details>
      <KillerCards killer="Dr. Fright" events={events} onEvent={onEvent} />
      <p role="status" className="play-feedback">
        {message}
      </p>
    </div>
  );
}
