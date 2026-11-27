import { PODARCHS } from '../../../supabase/functions/_shared/play/podarchs';
import { useState } from "react";
import { canUndoCon, newPlayEvent, summarizePlay } from "@/lib/play/events";
import { BOOTHS, BOOTH_EFFECTS, CON_EVENTS, CON_ONGOING, CON_PEOPLE, MEGABGCON_MODULE, type Booth } from "../../../supabase/functions/_shared/play/megabgconCatalog";
import { canConDamageKiller, canRecordCon, conOutcome, conTrackerChanges, megabgconState, type ConAction, type ConCommand } from "../../../supabase/functions/_shared/play/megabgcon";
import { CharacterControl } from "./CharacterControl";
import { EventControl } from "./EventControl";
import { IllustratedTile } from "./IllustratedTile";
import { PlaySelect } from "./PlaySelect";
import { useModuleRecord } from "./useModuleRecord";
import type { ControlsProps } from "./moduleDefinitions";
import "@/styles/play-megabgcon.css";

import { conArt } from "./megabgconArt";

const personStates = [
  { value: "active", label: "In play" }, { value: "saved", label: "Saved" },
  { value: "killed", label: "Killed" }, { value: "left", label: "Left play" },
];
const personOutcomes = ["saved", "killed", "left"] as const;
type Outcome = (typeof personOutcomes)[number];
type Person = (typeof CON_PEOPLE)[number]["id"];

function BoothSelect({ value, change }: {
  value: Booth | ""; change: (booth: Booth | "") => void;
}) {
  return <label>Booth drawn
    <PlaySelect aria-label="Booth drawn" value={value} onChange={e => change(e.target.value as Booth | "")}>
      <option value="">Choose a booth</option>
      {BOOTHS.map(booth => <option key={booth}>{booth}</option>)}
    </PlaySelect>
  </label>;
}

function PersonArrival({ person, add, cancel, blocked }: {
  person: (typeof CON_PEOPLE)[number]; add: (command: ConCommand) => boolean;
  cancel: () => void; blocked?: boolean;
}) {
  const [booth, setBooth] = useState<Booth | "">("");
  const [role, setRole] = useState<"friend" | "enemy" | "">("");
  return <div className="con-editor">
    {person.booth && <BoothSelect value={booth} change={setBooth} />}
    {person.id === "bad-boy" && <label>Role
      <PlaySelect aria-label="Role" value={role} onChange={event => setRole(event.target.value as typeof role)}>
        <option value="">Choose Friend or Enemy</option>
        <option value="friend">Friend</option><option value="enemy">Enemy</option>
      </PlaySelect>
    </label>}
    <div className="con-actions">
      <button type="button" disabled={blocked || (person.booth && !booth) || (person.id === "bad-boy" && !role)} onClick={() => {
        if (add({ kind: "person", person: person.id, ...(booth && { booth }), ...(role && { role }) })) cancel();
      }}>Record arrival</button>
      <button type="button" className="module-quiet-link" onClick={cancel}>Cancel</button>
    </div>
  </div>;
}

export function MegaBGConControls({ events, onEvent, blocked, killer, startingEvent }: ControlsProps) {
  const progress = summarizePlay(events);
  const state = megabgconState(progress.entries);
  const { record, message } = useModuleRecord(events, onEvent);
  const [person, setPerson] = useState<Person>();
  const [buggy, setBuggy] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; text: string }>();
  const starting = CON_EVENTS.find(event =>
    event.id !== "swag" && event.name.toLowerCase() === startingEvent?.trim().toLowerCase());
  const buggyAction = [...progress.entries].reverse().find(e => e.megabgconAction?.kind === "buggy");
  const buggyStatus = state.buggy === "active" ? "In play" : state.buggy === "spent" ? "Spent" : "Add when Keys are found";
  const startingPerson = CON_PEOPLE.find(p => p.id === starting?.id);
  const starterPending = starting && !state.ongoing[starting.id] && (startingPerson
    ? !state.people[startingPerson.id]
    : state.ongoing[starting.id] === undefined);

  function commit(command: ConCommand) {
    if (blocked) return false;
    const action: ConAction = { ...command, previous: state.previous };
    if (!canRecordCon(action, progress)) return false;
    const outcome = conOutcome(action);
    const moduleData = { module: MEGABGCON_MODULE, changes: { recorded: true } } as const;
    const event = newPlayEvent(outcome ? {
      kind: outcome.kind, quantity: 1, moduleData, megabgconAction: action,
      eventCard: outcome.eventCard, ...("room" in outcome && { room: outcome.room }),
      ...("victim" in outcome && { victim: outcome.victim }),
      ...(outcome.kind === "killed" && { cause: "event", megabgconReference: true }),
    } : { kind: "module", moduleData, megabgconAction: action });
    if (!record(event)) return false;
    const linked = conTrackerChanges(action, progress);
    const text = [
      linked.terror ? `Discard ${linked.terror} Terror ${linked.terror === 1 ? "card" : "cards"} on the board` : "",
      linked.time ? `${linked.time > 0 ? "Lose" : "Gain"} ${Math.abs(linked.time)} Time on the board` : "",
      outcome?.kind === "killed" && command.kind === "person-outcome" && state.people[command.person]?.role === "enemy"
        ? "Apply the Enemy outcome on the board · no Bloodlust"
        : outcome?.kind === "killed" ? "Apply the usual Victim death effects on the board" : "",
    ].filter(Boolean).join(" · ");
    setReceipt(text ? { id: event.id, text } : undefined);
    return true;
  }

  return <div className="con-controls">
    {receipt && !progress.inactive.has(receipt.id) && <p className="con-receipt" role="status">{receipt.text}</p>}
    {!!Object.keys(state.effects).length && <section aria-label="Active Booth effects" className="con-grid">
      {BOOTH_EFFECTS.filter(token => state.effects[token.id]).map(token => <article key={token.id}>
        <IllustratedTile className="module-control-tile con-active-photo" art={conArt(token.id)} title={token.label} status={state.effects[token.id]} disabled />
        <p className="con-hint">{token.effect}</p>
        <button type="button" className="module-quiet-link" disabled={blocked} onClick={() => commit({ kind: "token", token: token.id, booth: null })}>Clear {token.label} record</button>
      </article>)}
    </section>}

    {starterPending && <section className="con-starting">
      <span>Starting Event · <strong>{starting.name}</strong></span>
      {startingPerson ? <button type="button" disabled={blocked} onClick={() => setPerson(startingPerson.id)}>Record arrival</button>
        : <button type="button" disabled={blocked} onClick={() => commit({ kind: "event", event: starting.id, active: true })}>Record Event</button>}
      {startingPerson && person === startingPerson.id && <PersonArrival key={person} person={startingPerson} add={commit} cancel={() => setPerson(undefined)} blocked={blocked} />}
    </section>}

    <details className="con-disclosure" open={state.lunch ? true : undefined}>
      <summary>Ongoing Events{state.lunch ? ` · Lunch Time! (${state.lunch})` : ""}</summary>
      <div className="con-grid">
        {CON_ONGOING.map(event => <EventControl key={event.id} name={event.name} interaction="toggle" allowed={!blocked}
          value={state.ongoing[event.id] === undefined ? undefined : state.ongoing[event.id] ? "active" : "ended"} art={conArt(event.id)}
          onActivate={() => commit({ kind: "event", event: event.id, active: true })}
          onEnd={() => commit({ kind: "event", event: event.id, active: false })}
          onClear={() => commit({ kind: "event", event: event.id, active: false })} />)}
        <article>
          <IllustratedTile className="module-control-tile con-lunch-photo" art={conArt("lunch")} title="Lunch Time!"
            status={state.lunch ? `${state.lunch} Action ${state.lunch === 1 ? "phase" : "phases"} left` : state.lunch === 0 ? "Ended" : "Not recorded"}
            data-muted={!state.lunch} disabled={blocked || !!state.lunch}
            onClick={() => commit({ kind: "event", event: "lunch", active: true })} />
          {!!state.lunch && <div className="con-actions">
            <button type="button" disabled={blocked} onClick={() => commit({ kind: "lunch-end" })}>End Action phase</button>
            <button type="button" className="module-quiet-link" disabled={blocked}
              onClick={() => commit({ kind: "event", event: "lunch", active: false })}>Clear Lunch Time! record</button>
          </div>}
        </article>
      </div>
    </details>

    {killer !== PODARCHS && <details className="con-disclosure">
      <summary>Special Victims</summary>
      <div className="con-grid">
        {CON_PEOPLE.map(source => {
          const active = state.people[source.id];
          return <div key={source.id}>
            <CharacterControl name={source.person} value={active?.status} states={personStates} present="active"
              art={conArt(active?.status === "saved" || active?.status === "killed" ? `${source.id}-${active.status}` : source.id)}
              showRules={false} showStatusEditor={false} outcomes={personOutcomes}
              onChange={() => { if (!blocked) setPerson(source.id); }}
              onOutcome={value => commit({ kind: "person-outcome", person: source.id, outcome: value as Outcome, killer })}
              reminder={active?.role ? `Role · ${active.role === "friend" ? "Friend" : "Enemy"}` : undefined} />
            {person === source.id && (!starterPending || startingPerson?.id !== source.id) &&
              <PersonArrival key={person} person={source} add={commit} cancel={() => setPerson(undefined)} blocked={blocked} />}
            {active?.booth && <p className="con-hint">Placed at {active.booth}</p>}
            {active?.status === "saved" && source.id === "starlet" && <p className="con-hint">Choose one unused Item on the board.</p>}
          </div>;
        })}
      </div>
    </details>}

    <details className="con-disclosure" open={state.buggy ? true : undefined}>
      <summary>Medical Buggy{state.buggy && <span className="con-summary-status"> · {buggyStatus}</span>}</summary>
      <IllustratedTile className="module-control-tile con-buggy" art={conArt(state.buggy === "spent" ? "buggy-spent" : "buggy")}
        status={buggyStatus} aria-label={`Medical Buggy ${buggyStatus}`}
        data-muted={!state.buggy} data-record={state.buggy} disabled={blocked || state.buggy === "spent"} onClick={() => {
          if (state.buggy === "active") setBuggy(!buggy);
          else if (commit({ kind: "buggy", status: "active" })) setBuggy(true);
        }} />
      {state.buggy === "active" && buggy && <div className="con-editor">
        <p className="con-hint">After moving into an Enemy’s space, spend the Buggy to deal two damage to that Enemy.</p>
        <div className="con-actions">
          {canConDamageKiller(killer, progress) && <button type="button" disabled={blocked}
            onClick={() => commit({ kind: "buggy", status: "spent", target: "killer", killer })}>Spend · Deal 2 to Killer</button>}
          <button type="button" disabled={blocked} onClick={() => commit({ kind: "buggy", status: "spent", target: "tabletop", killer })}>Mark spent on board</button>
        </div>
      </div>}
      {state.buggy && <button type="button" className="module-quiet-link" disabled={blocked}
        onClick={() => commit({ kind: "buggy", status: "clear" })}>Clear Buggy record</button>}
      {state.buggy === "spent" && buggyAction && canUndoCon(events, buggyAction.id) &&
        <button type="button" className="module-quiet-link" disabled={blocked}
          onClick={() => record(newPlayEvent({ kind: "undo", target: buggyAction.id }))}>Undo Buggy hit</button>}
    </details>
    {message && <p className="con-receipt" role="alert">{message}</p>}
  </div>;
}
