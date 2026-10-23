import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import { moduleState } from "@/lib/play/modules";
import { IllustratedTile } from "./IllustratedTile";
import { ModuleArtwork } from "./ModuleArtwork";
import { PlaySelect } from "./PlaySelect";
import { illustratedKillerCards } from "./killerPresentation";
import { useModuleRecord } from "./useModuleRecord";
import "@/styles/play-controls.css";

export function KillerCards({
  killer,
  events,
  onEvent,
  typeOnly,
}: {
  killer: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  typeOnly?: "dark-power" | "finale";
}) {
  const entries = summarizePlay(events).entries;
  const hans = moduleState(entries, "hans");
  const { record, message } = useModuleRecord(events, onEvent);
  const choose = (type: "dark-power" | "finale", name: string) => {
    const existing = entries.find(
      (event) => event.kind === "moment" && event.momentType === type,
    );
    if (
      existing?.killerCard === name ||
      (killer === "Hans" && type === "dark-power" && hans.secondPower === name)
    )
      return;
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
    );
  };
  const content = (
    <>
      {(typeOnly ? [typeOnly] : (["dark-power", "finale"] as const)).map(
        (type) => {
          const cards = illustratedKillerCards(killer, type);
          const reveal = entries.find(
            (event) => event.kind === "moment" && event.momentType === type,
          );
          const selected = cards.find(
            (card) => card.name === reveal?.killerCard,
          );
          return (
            <section
              className="module-reveal-cards"
              key={type}
              aria-label={`${type === "dark-power" ? "Dark Power" : "Finale"} selection`}
            >
              <h3>{type === "dark-power" ? "Dark Power" : "Finale"}</h3>
              <p className="module-control-help">
                {reveal
                  ? `Revealed · ${reveal.killerCard || "Card not specified"}`
                  : "No reveal recorded"}
                . Select only when revealed; resolve card effects on your board.
              </p>
              {selected && (
                <div className="module-selected-card">
                  <ModuleArtwork art={selected.art} />
                  <p>
                    <strong>{selected.name}</strong>
                    <br />
                    {selected.effect}
                  </p>
                </div>
              )}
              <div className="module-card-grid">
                {cards.map((card) => (
                  <IllustratedTile
                    key={card.id}
                    className="module-control-tile"
                    art={card.art}
                    title={card.name}
                    status={`${selected?.id === card.id ? "Revealed" : "Choose when revealed"}${card.epic ? " · Epic" : ""}`}
                    aria-label={`Choose ${card.name}`}
                    aria-pressed={selected?.id === card.id}
                    disabled={
                      killer === "Hans" &&
                      type === "dark-power" &&
                      hans.secondPower === card.name
                    }
                    onClick={() => choose(type, card.name)}
                  />
                ))}
              </div>
              <button
                className="module-unnamed"
                onClick={() => choose(type, "")}
                aria-label={`${reveal ? "Clear" : "Record"} ${type === "dark-power" ? "Dark Power" : "Finale"} card name`}
              >
                {reveal
                  ? "Clear card name"
                  : "Reveal without a card name"}
              </button>
            </section>
          );
        },
      )}
      {killer === "Hans" && hans.finale === "Dark, Darker, Darkest" && (
        <div className="module-second-power">
          <h3>Second Dark Power</h3>
          <div className="module-card-grid">
            {illustratedKillerCards(killer, "dark-power")
              .filter((card) => card.name !== hans.power)
              .map((card) => (
                <IllustratedTile
                  key={card.id}
                  className="module-control-tile"
                  art={card.art}
                  title={card.name}
                  status={
                    hans.secondPower === card.name
                      ? "Revealed"
                      : "Choose second power"
                  }
                  aria-label={`Choose second power ${card.name}`}
                  aria-pressed={hans.secondPower === card.name}
                  onClick={() =>
                    record(
                      newPlayEvent({
                        kind: "module",
                        moduleData: {
                          module: "hans",
                          changes: { secondPower: card.name },
                        },
                      }),
                    )
                  }
                />
              ))}
          </div>
          <PlaySelect
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
            {illustratedKillerCards(killer, "dark-power")
              .filter((card) => card.name !== hans.power)
              .map((card) => (
                <option key={card.id} value={card.name}>
                  {card.name}
                </option>
              ))}
          </PlaySelect>
        </div>
      )}
      <p role="status" className="play-feedback">
        {message}
      </p>
    </>
  );
  return typeOnly ? (
    <div className="module-reveals">{content}</div>
  ) : (
    <details className="module-card-section">
      <summary>Dark Power &amp; Finale</summary>
      {content}
    </details>
  );
}
