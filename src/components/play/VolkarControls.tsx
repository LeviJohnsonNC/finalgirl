import { useState } from "react";
import {
  VOLKAR,
  VOLKAR_MINORS,
  huntLabel,
} from "../../../supabase/functions/_shared/play/volkar";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import { moduleState } from "@/lib/play/modules";
import { IllustratedTile } from "./IllustratedTile";
import { KillerCards } from "./KillerCards";
import { MinorPowerControl } from "./MinorPowerControl";
import { MinorPowerGroup } from "./MinorPowerGroup";
import { useModuleRecord } from "./useModuleRecord";
import { huntArt, volkarArt } from "./volkarArt";
import type { ControlsProps } from "./moduleDefinitions";
import "@/styles/play-volkar.css";

export function VolkarControls({
  events,
  onEvent,
  blocked,
  volkarFresh,
}: ControlsProps) {
  const entries = summarizePlay(events).entries;
  const state = moduleState(entries, "volkar");
  const { record, message } = useModuleRecord(events, onEvent);
  const [choosing, setChoosing] = useState(false);
  const hunt =
    state.hunt ?? (volkarFresh && !events.length ? "concealed" : undefined);
  const concealed = hunt === "concealed";
  const send = (key: string, value: string | number | null) =>
    record(
      newPlayEvent({
        kind: "module",
        moduleData: { module: "volkar", changes: { [key]: value } },
      }),
    );
  const changeHunt = (value: string) => {
    if (send("hunt", value)) setChoosing(false);
  };
  return (
    <div className="volkar-controls">
      <IllustratedTile
        art={huntArt(hunt)}
        title={huntLabel(hunt)}
        status={concealed ? "Reveal the Volk’ar" : "Record Concealed"}
        disabled={blocked}
        onClick={() => changeHunt(concealed ? "visible" : "concealed")}
      />
      {!hunt && (
        <button disabled={blocked} onClick={() => changeHunt("visible")}>
          Record Visible
        </button>
      )}
      {concealed &&
        (choosing ? (
          <div className="volkar-actions" aria-label="Blind attack outcome">
            <button disabled={blocked} onClick={() => changeHunt("hit")}>
              Hit the Volk’ar
            </button>
            <button disabled={blocked} onClick={() => changeHunt("ambush")}>
              Ambushed
            </button>
            <button onClick={() => setChoosing(false)}>Cancel</button>
          </div>
        ) : (
          <button disabled={blocked} onClick={() => setChoosing(true)}>
            Blind attack
          </button>
        ))}
      <MinorPowerGroup>
        {VOLKAR_MINORS.map((card) => (
          <MinorPowerControl
            key={card.id}
            name={card.name}
            disabled={blocked}
            health={
              typeof state[card.id] === "number"
                ? Number(state[card.id])
                : undefined
            }
            previouslyRevealed={entries.some(
              (entry) =>
                entry.moduleData?.module === "volkar" &&
                typeof entry.moduleData.changes[card.id] === "number",
            )}
            maxHealth={card.health}
            growing={card.id === "shield"}
            heroArt={volkarArt(card.id)}
            choiceArt={volkarArt(card.id)}
            art={() => volkarArt(card.id)}
            onChange={(value) => send(card.id, value)}
          />
        ))}
      </MinorPowerGroup>
      <KillerCards
        killer={VOLKAR}
        events={events}
        onEvent={onEvent}
        disabled={blocked}
      />
      {message && <p role="status">{message}</p>}
    </div>
  );
}
