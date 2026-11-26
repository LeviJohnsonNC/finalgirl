import { useState } from "react";
import { moduleState } from "@/lib/play/modules";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import peon from "@/assets/play/photos/hellscape/peon.webp";
import peonKilled from "@/assets/play/photos/hellscape/peon-killed.webp";
import wretch from "@/assets/play/photos/hellscape/wretch.webp";
import wretchKilled from "@/assets/play/photos/hellscape/wretch-killed.webp";
import seeker from "@/assets/play/photos/hellscape/seeker.webp";
import seekerKilled from "@/assets/play/photos/hellscape/seeker-killed.webp";
import { BIRDS } from "../../../supabase/functions/_shared/play/birds";
import {
  HELLSCAPE_MODULE, HELLSCAPE_PEOPLE, HELLSCAPE_STATUSES,
  hellscapePersonKey, type HellscapePerson,
} from "../../../supabase/functions/_shared/play/hellscape";
import { CharacterControl } from "./CharacterControl";
import type { ControlsProps } from "./moduleDefinitions";
import { useModuleRecord } from "./useModuleRecord";
import "@/styles/play-hellscape.css";

const portraits = { peon, wretch, seeker };
const killedPortraits = { peon: peonKilled, wretch: wretchKilled, seeker: seekerKilled };
const outcomes = ["saved", "killed", "left-play"];
export function HellscapeControls({ killer, startingEvent, events, onEvent, blocked }: ControlsProps) {
  const [choosing, setChoosing] = useState(false);
  const { record, message } = useModuleRecord(events, onEvent);
  const state = moduleState(summarizePlay(events).entries, HELLSCAPE_MODULE);
  const status = (id: HellscapePerson) => HELLSCAPE_STATUSES.find(item => item.value === state[hellscapePersonKey(id)])?.value;
  const roster = HELLSCAPE_PEOPLE.filter(person => ["in-play", "killed"].includes(status(person.id) ?? ""));
  const completed = HELLSCAPE_PEOPLE.filter(person => ["saved", "left-play"].includes(status(person.id) ?? ""));
  const remaining = HELLSCAPE_PEOPLE.filter(person => !status(person.id));
  const starter = remaining.find(person => person.name === startingEvent);

  const recordStatus = (id: HellscapePerson, value: string | null) => {
    if (blocked || status(id) === (value ?? undefined)) return;
    if (record(newPlayEvent({kind: "module", moduleData: {
      module: HELLSCAPE_MODULE, changes: {[hellscapePersonKey(id)]: value},
    }}))) {
      setChoosing(false);
    }
  };

  function portrait(person: (typeof HELLSCAPE_PEOPLE)[number]) {
    const value = status(person.id);
    return (
      <CharacterControl
        key={person.id}
        name={person.name}
        value={value}
        states={HELLSCAPE_STATUSES}
        present="in-play"
        art={{src: (value === "killed" ? killedPortraits : portraits)[person.id], position: "center 35%"}}
        className={`hellscape-person hellscape-person-${person.color}`}
        outcomes={outcomes}
        allowOutcomeCorrections
        showStatusEditor={false}
        showRules={false}
        onChange={value => recordStatus(person.id, value)}
        onOutcome={value => recordStatus(person.id, value)}
      />
    );
  }

  return (
    <fieldset className="hellscape-play" aria-label="Hellscape location" disabled={blocked}>
      {killer !== BIRDS && remaining.length > 0 && (
        <button type="button" className="hellscape-record" aria-expanded={choosing}
          onClick={() => setChoosing(open => !open)}>
          {starter ? `Record ${starter.name}` : "Record Special Victim"}
        </button>
      )}
      {killer !== BIRDS && choosing && (
        <section className="hellscape-picker" aria-label="Choose a Hellscape Special Victim">
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
      {killer !== BIRDS && roster.length > 0 && (
        <div className="hellscape-portraits" role="group" aria-label="Special Victims">{roster.map(portrait)}</div>
      )}
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
