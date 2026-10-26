import { useState } from "react";
import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import { moduleState } from "@/lib/play/modules";
import { IllustratedTile } from "./IllustratedTile";
import { RevealedCard } from "./RevealedCard";
import { PlaySelect } from "./PlaySelect";
import {
  illustratedKillerCards,
  type IllustratedKillerCard,
} from "./killerPresentation";
import { useModuleRecord } from "./useModuleRecord";
import "@/styles/play-controls.css";
import "@/styles/cinematic-controls.css";

type CardType = "dark-power" | "finale";
function Chooser({
  cards,
  selected,
  disabled,
  choose,
  second = false,
}: {
  cards: IllustratedKillerCard[];
  selected?: IllustratedKillerCard;
  disabled: (name: string) => boolean;
  choose: (name: string) => unknown;
  second?: boolean;
}) {
  return (
    <div
      className="module-card-grid module-compact-reveal-grid module-cinematic-chooser"
      data-has-selection={Boolean(selected)}
    >
      {cards.map((card) => (
        <IllustratedTile
          key={card.id}
          className="module-control-tile module-killer-card"
          data-epic={card.epic || undefined}
          art={card.art}
          title={card.name}
          status={`${selected?.id === card.id ? "Revealed" : "Choose when revealed"}${card.epic ? " · Epic" : ""}`}
          aria-label={`Choose ${second ? "second power " : ""}${card.name}`}
          aria-pressed={selected?.id === card.id}
          disabled={disabled(card.name)}
          onClick={() => choose(card.name)}
        />
      ))}
    </div>
  );
}
export function KillerCards({
  killer,
  events,
  onEvent,
  typeOnly,
  disabled = false,
}: {
  killer: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  typeOnly?: CardType;
  disabled?: boolean;
}) {
  const entries = summarizePlay(events).entries;
  const hans = moduleState(entries, "hans");
  const { record, message } = useModuleRecord(events, onEvent);
  const [editing, setEditing] = useState<
    Partial<Record<CardType | "second", boolean>>
  >({});
  const choose = (type: CardType, name: string) => {
    if (
      disabled ||
      (killer === "Hans" &&
        type === "dark-power" &&
        hans.secondPower === name &&
        name)
    )
      return;
    const existing = entries.find(
      (event) => event.kind === "moment" && event.momentType === type,
    );
    if (existing?.killerCard === name) {
      setEditing((e) => ({ ...e, [type]: false }));
      return;
    }
    if (
      record(
        newPlayEvent(
          existing
            ? { kind: "details", target: existing.id, killerCard: name }
            : {
                kind: "moment",
                momentType: type,
                killerCard: name,
                permanent: true,
                text:
                  type === "dark-power"
                    ? "Dark Power revealed"
                    : "Finale revealed",
              },
        ),
      )
    )
      setEditing((e) => ({ ...e, [type]: false }));
  };
  const secondCards = illustratedKillerCards(killer, "dark-power").filter(
    (card) => card.name !== hans.power,
  );
  const second = secondCards.find((card) => card.name === hans.secondPower);
  const content = (
    <>
      {(typeOnly ? [typeOnly] : (["dark-power", "finale"] as CardType[])).map(
        (type) => {
          const cards = illustratedKillerCards(killer, type);
          const reveal = entries.find(
            (event) => event.kind === "moment" && event.momentType === type,
          );
          const selected = cards.find(
            (card) => card.name === reveal?.killerCard,
          );
          const label = type === "dark-power" ? "Dark Power" : "Finale";
          return (
            <section
              className="module-reveal-cards"
              key={type}
              aria-label={`${label} selection`}
            >
              <h3>{label}</h3>
              {reveal && !selected && (
                <p className="module-control-help">
                  {reveal.killerCard || "Card name not specified"}
                </p>
              )}
              {selected && <RevealedCard card={selected} label={label} />}
              {(!selected || editing[type]) && (
                <Chooser
                  cards={cards}
                  selected={selected}
                  disabled={(name) =>
                    disabled ||
                    (killer === "Hans" &&
                      type === "dark-power" &&
                      hans.secondPower === name)
                  }
                  choose={(name) => choose(type, name)}
                />
              )}
              {selected && (
                <button
                  type="button"
                  className="module-change-choice"
                  disabled={disabled}
                  aria-expanded={Boolean(editing[type])}
                  onClick={() =>
                    setEditing((e) => ({ ...e, [type]: !e[type] }))
                  }
                >
                  {editing[type]
                    ? `Cancel changing ${label}`
                    : `Change ${label}`}
                </button>
              )}
              <button
                className="module-unnamed"
                disabled={disabled}
                onClick={() => choose(type, "")}
                aria-label={`${reveal ? "Clear" : "Record"} ${label} card name`}
              >
                {reveal ? "Clear card name" : "Reveal without a card name"}
              </button>
            </section>
          );
        },
      )}
      {killer === "Hans" && hans.finale === "Dark, Darker, Darkest" && (
        <section className="module-second-power">
          <h3>Second Dark Power</h3>
          {second && <RevealedCard card={second} label="Second Dark Power" />}
          {(!second || editing.second) && (
            <Chooser
              cards={secondCards}
              selected={second}
              second
              disabled={() => disabled}
              choose={(name) => {
                if (disabled) return;
                if (
                  record(
                    newPlayEvent({
                      kind: "module",
                      moduleData: {
                        module: "hans",
                        changes: { secondPower: name },
                      },
                    }),
                  )
                )
                  setEditing((e) => ({ ...e, second: false }));
              }}
            />
          )}
          {second && (
            <button
              type="button"
              className="module-change-choice"
              disabled={disabled}
              aria-expanded={Boolean(editing.second)}
              onClick={() => setEditing((e) => ({ ...e, second: !e.second }))}
            >
              {editing.second
                ? "Cancel changing second Dark Power"
                : "Change second Dark Power"}
            </button>
          )}
          <details className="module-correction">
            <summary>Second Power details &amp; corrections</summary>
            <PlaySelect
              disabled={disabled}
              aria-label="Change second Dark Power card"
              value={String(hans.secondPower ?? "")}
              onChange={(event) =>
                record(
                  newPlayEvent({
                    kind: "module",
                    moduleData: {
                      module: "hans",
                      changes: { secondPower: event.target.value || null },
                    },
                  }),
                )
              }
            >
              <option value="">Not specified</option>
              {secondCards.map((card) => (
                <option key={card.id} value={card.name}>
                  {card.name}
                </option>
              ))}
            </PlaySelect>
          </details>
        </section>
      )}
      <p role="status" className="play-feedback">
        {message}
      </p>
    </>
  );
  return typeOnly ? (
    <div className="module-reveals">{content}</div>
  ) : (
    <details className="module-card-section" data-module-control="reveals">
      <summary>Dark Power &amp; Finale</summary>
      {content}
    </details>
  );
}
