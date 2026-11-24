import { useState } from "react";
import { SpecialRulesModal } from "@/components/SpecialRulesModal";
import { moduleState } from "@/lib/play/modules";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import peon from "@/assets/play/photos/hellscape/peon.webp";
import wretch from "@/assets/play/photos/hellscape/wretch.webp";
import seeker from "@/assets/play/photos/hellscape/seeker.webp";
import { BIRDS } from "../../../supabase/functions/_shared/play/birds";
import {
  HELLSCAPE, HELLSCAPE_MODULE, HELLSCAPE_PEOPLE, HELLSCAPE_STATUSES,
  hellscapePersonKey, type HellscapePerson,
} from "../../../supabase/functions/_shared/play/hellscape";
import { CharacterControl } from "./CharacterControl";
import type { ControlsProps } from "./moduleDefinitions";
import { useModuleRecord } from "./useModuleRecord";
import "@/styles/play-hellscape.css";

const portraits = { peon, wretch, seeker };
const outcomes = ["saved", "killed", "left-play"];
const outcomeReminders: Partial<Record<HellscapePerson, Record<string, string>>> = {
  wretch: { saved: "Wretch saved. Lower Horror by 1 and recover 1 Health." },
  seeker: { killed: "Seeker killed. If it died in your space, lower Horror by 4." },
};

export function HellscapeControls({ killer, startingEvent, events, onEvent, blocked }: ControlsProps) {
  const [choosing, setChoosing] = useState(false);
  const [receipt, setReceipt] = useState<{ id: HellscapePerson; value: string; text: string }>();
  const { record, message } = useModuleRecord(events, onEvent);
  const state = moduleState(summarizePlay(events).entries, HELLSCAPE_MODULE);
  const status = (id: HellscapePerson) => HELLSCAPE_STATUSES.find(item => item.value === state[hellscapePersonKey(id)])?.value;
  const active = HELLSCAPE_PEOPLE.filter(person => status(person.id) === "in-play");
  const completed = HELLSCAPE_PEOPLE.filter(person => status(person.id) && status(person.id) !== "in-play");
  const remaining = HELLSCAPE_PEOPLE.filter(person => !status(person.id));
  const starter = remaining.find(person => person.name === startingEvent);

  const recordStatus = (id: HellscapePerson, value: string | null, isOutcome = false) => {
    if (blocked || status(id) === (value ?? undefined)) return;
    if (record(newPlayEvent({kind: "module", moduleData: {
      module: HELLSCAPE_MODULE, changes: {[hellscapePersonKey(id)]: value},
    }}))) {
      setChoosing(false);
      const text = value && isOutcome ? outcomeReminders[id]?.[value] : undefined;
      setReceipt(text && value ? {id, value, text} : undefined);
    }
  };

  function portrait(person: (typeof HELLSCAPE_PEOPLE)[number]) {
    return (
      <CharacterControl
        key={person.id}
        name={person.name}
        value={status(person.id)}
        states={HELLSCAPE_STATUSES}
        present="in-play"
        art={{src: portraits[person.id], position: "center 35%"}}
        className={`hellscape-person hellscape-person-${person.color}`}
        outcomes={status(person.id) === "in-play" ? outcomes : []}
        showRules={false}
        onChange={value => recordStatus(person.id, value)}
        onOutcome={value => recordStatus(person.id, value, true)}
        reminder={person.reminder}
      />
    );
  }

  return (
    <fieldset className="hellscape-play" aria-label="Hellscape location" disabled={blocked}>
      <div className="hellscape-toolbar">
        {killer !== BIRDS && remaining.length > 0 && (
          <button type="button" className="hellscape-record" aria-expanded={choosing}
            onClick={() => setChoosing(open => !open)}>
            {starter ? `Record ${starter.name}` : "Record Special Victim"}
          </button>
        )}
        <SpecialRulesModal killer="" location={HELLSCAPE} initialView="rules">
          <button type="button" className="module-quiet-link hellscape-rules-link">Hellscape rules</button>
        </SpecialRulesModal>
      </div>
      {killer !== BIRDS && choosing && (
        <section className="hellscape-picker" aria-label="Choose a Hellscape Special Victim">
          <p>Once a Victim takes this role on the board, record their Event.</p>
          <div className="hellscape-choices">
            {(starter ? [starter, ...remaining.filter(person => person !== starter)] : remaining).map(person => (
              <button type="button" key={person.id} className={`hellscape-person-${person.color}`}
                onClick={() => recordStatus(person.id, "in-play")}>
                {person.name}{person === starter && <small>Starting Event</small>}
              </button>
            ))}
          </div>
        </section>
      )}
      {killer !== BIRDS && active.length > 0 && (
        <div className="hellscape-portraits" aria-label="Special Victims in play">{active.map(portrait)}</div>
      )}
      {receipt && status(receipt.id) === receipt.value && <p className="hellscape-receipt" role="status">{receipt.text}</p>}
      {killer !== BIRDS && completed.length > 0 && (
        <details className="hellscape-history">
          <summary>Recorded outcomes</summary>
          <div className="hellscape-portraits">{completed.map(portrait)}</div>
        </details>
      )}
      {message && <p className="hellscape-receipt" role="alert">{message}</p>}
    </fieldset>
  );
}
