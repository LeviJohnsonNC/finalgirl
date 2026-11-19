import { useState } from "react";
import { ArrowRight, DoorOpen, Ticket, Undo2 } from "lucide-react";
import { canUndoCon, newPlayEvent, summarizePlay } from "@/lib/play/events";
import { BOOTHS, BOOTH_EFFECTS, BOOTH_EVENTS, CON_EVENTS, CON_ONGOING, CON_PEOPLE, MEGABGCON_MODULE, type Booth } from "../../../supabase/functions/_shared/play/megabgconCatalog";
import { canConDamageKiller, canRecordCon, conDescription, conFinaleRevealed, conOutcome, conTrackerChanges, megabgconState, type ConAction, type ConCommand } from "../../../supabase/functions/_shared/play/megabgcon";
import { MORT, MORT_SUSPECTS, mortState } from "../../../supabase/functions/_shared/play/mort";
import { CharacterControl } from "./CharacterControl";
import { EventControl } from "./EventControl";
import { IllustratedTile } from "./IllustratedTile";
import { ModuleArtwork } from "./ModuleArtwork";
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
type BoothEvent = (typeof BOOTH_EVENTS)[number]["id"];

function BoothSelect({ value, change, label = "Booth drawn", disabled = false }: {
  value: Booth | ""; change: (booth: Booth | "") => void; label?: string; disabled?: boolean;
}) {
  return <label>{label}
    <PlaySelect aria-label={label} value={value} disabled={disabled} onChange={e => change(e.target.value as Booth | "")}>
      <option value="">Choose a booth</option>
      {BOOTHS.map(booth => <option key={booth}>{booth}</option>)}
    </PlaySelect>
  </label>;
}

function MortCardHint() {
  return <p className="con-hint">Use one <a href="#mort-suspect-bag" onClick={e => {
    const bag = document.getElementById("mort-suspect-bag");
    const panel = bag?.closest<HTMLDetailsElement>("details[data-module=mort]");
    if (panel && !panel.open) panel.querySelector("summary")?.click();
    if (bag) {
      e.preventDefault();
      requestAnimationFrame(() => {
        bag.scrollIntoView({ block: "center", behavior: "instant" });
        bag.focus({ preventScroll: true });
      });
    }
  }}>Suspect bag draw</a> for all Killer effects on this card. If the token belongs to a ruled-out Suspect, discard it and skip those effects.</p>;
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
  const [workflow, setWorkflow] = useState<"upkeep" | "lookup">();
  const [booth, setBooth] = useState<Booth | "">("");
  const [branch, setBranch] = useState<"arrival" | "event">();
  const [card, setCard] = useState<BoothEvent | "">("");
  const [accident, setAccident] = useState<"victim" | "bloodlust" | "">("");
  const [person, setPerson] = useState<Person>();
  const [swag, setSwag] = useState<[Booth | "", Booth | "", Booth | ""]>(["", "", ""]);
  const [buggy, setBuggy] = useState(false);
  const [receipt, setReceipt] = useState<{ id: string; text: string }>();
  const finale = conFinaleRevealed(killer, progress.entries);
  const investigation = killer === MORT ? mortState(progress.entries) : undefined;
  const disguised = !!investigation && !investigation.reveal;
  const starting = CON_EVENTS.find(event => event.name.toLowerCase() === startingEvent?.trim().toLowerCase());
  const latestAction = progress.entries.find(e => e.id === state.previous);
  const buggyAction = [...progress.entries].reverse().find(e => e.megabgconAction?.kind === "buggy");
  const mayUndo = latestAction && canUndoCon(events, latestAction.id);
  const startingPerson = CON_PEOPLE.find(p => p.id === starting?.id);
  const starterPending = starting && !state.ongoing[starting.id] && (startingPerson
    ? !state.people[startingPerson.id]
    : starting.id === "swag" ? !state.swag.length : state.ongoing[starting.id] === undefined);

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
      command.kind === "upkeep" && command.accident === "bloodlust" && linked.changes.bloodlust === undefined && !linked.terror ? "Resolve Bloodlust on the board" : "",
      outcome?.kind === "killed" && command.kind === "person-outcome" && state.people[command.person]?.role === "enemy"
        ? "Apply the Enemy outcome on the board · no Bloodlust"
        : outcome?.kind === "killed" ? "Apply the usual Victim death effects on the board" : "",
      command.kind === "swag-outcome" && command.outcome === "saved" ? "Reveal the physical SWAG reward and resolve it on the board" : "",
      command.kind === "swag-outcome" && command.outcome === "killed" ? "Discard the physical SWAG token face down" : "",
    ].filter(Boolean).join(" · ");
    setReceipt(text ? { id: event.id, text } : undefined);
    return true;
  }

  function open(next?: "upkeep" | "lookup") {
    setWorkflow(next);
    setBooth("");
    setBranch(undefined);
    setCard("");
    setAccident("");
  }

  function recordBooth() {
    if (!booth) return;
    if (workflow === "lookup") {
      if (commit({ kind: "lookup", booth })) open();
      return;
    }
    const result = branch === "arrival" ? "arrival" : card;
    if (result && commit({ kind: "upkeep", killer, booth, result, ...(result === "accident" && accident && { accident }) })) open();
  }

  return <div className="con-controls">
    <section aria-labelledby="con-floor">
      <div className="con-floor-heading">
        <div><h3 id="con-floor">Convention Floor</h3>{finale && <p>Booth draws ended · Finale in play</p>}</div>
        {!finale && <button type="button" className="con-primary" disabled={blocked} aria-expanded={workflow === "upkeep"}
          onClick={() => open(workflow === "upkeep" ? undefined : "upkeep")}><Ticket aria-hidden="true" size={18} /> Record Upkeep</button>}
      </div>
      {state.upkeep && <div className="con-result" role="status">
        <ModuleArtwork art={conArt(BOOTH_EFFECTS.some(token => token.id === state.upkeep?.result) ? "booth" : state.upkeep.result)} />
        <div><small>Latest Upkeep</small><strong>{conDescription(state.upkeep)}</strong></div>
      </div>}
      <div className="con-actions con-quiet">
        <button type="button" className="module-quiet-link" disabled={blocked} aria-expanded={workflow === "lookup"}
          onClick={() => open(workflow === "lookup" ? undefined : "lookup")}>Record a Booth location</button>
        {latestAction && mayUndo && <button type="button" className="module-quiet-link" disabled={blocked}
          onClick={() => record(newPlayEvent({ kind: "undo", target: latestAction.id }))}><Undo2 aria-hidden="true" size={15} /> Undo last convention record</button>}
      </div>
      {state.lookup && <p className="con-hint">Last Booth location · {state.lookup}</p>}
      {receipt && !progress.inactive.has(receipt.id) && <p className="con-receipt" role="status">{receipt.text}</p>}
      {workflow && (workflow === "lookup" || !finale) && <form className="con-editor" onSubmit={e => { e.preventDefault(); recordBooth(); }}>
        <BoothSelect value={booth} change={setBooth} />
        {workflow === "lookup" && disguised && <details className="con-disclosure con-card-help">
          <summary>For cards with Killer effects</summary>
          <MortCardHint />
          {investigation?.active && <p className="con-hint">Active Killer · {MORT_SUSPECTS.find(s => s.id === investigation.active)?.name}</p>}
        </details>}
        {workflow === "upkeep" && <>
          <div className="con-actions" role="group" aria-label="Upkeep roll outcome">
            <button type="button" disabled={!booth} aria-pressed={branch === "arrival"} onClick={() => {
              setBranch("arrival");
              if (booth && commit({ kind: "upkeep", killer, booth, result: "arrival" })) open();
            }}>1–3 · Victim arrived</button>
            <button type="button" disabled={!booth} aria-pressed={branch === "event"} onClick={() => setBranch("event")}>4–6 · Booth Event</button>
          </div>
          {!!booth && branch === "event" && <label>Booth Event
            <PlaySelect aria-label="Booth Event" value={card} onChange={e => { setCard(e.target.value as BoothEvent | ""); setAccident(""); }}>
              <option value="">Choose the card drawn</option>
              {BOOTH_EVENTS.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
            </PlaySelect>
          </label>}
          {branch === "event" && card === "accident" && <label>Tragic Accident outcome
            <PlaySelect aria-label="Tragic Accident outcome" value={accident} onChange={e => setAccident(e.target.value as typeof accident)}>
              <option value="">Choose what happened</option><option value="victim">A Victim died</option>
              <option value="bloodlust">Booth was empty · Raise Bloodlust</option>
            </PlaySelect>
          </label>}
          {branch === "event" && card === "shady" && disguised && <MortCardHint />}
          {branch === "event" && card === "star-sighting" && <p className="con-hint">Bring a Special Victim into play if needed, then move the nearest one to this Booth.</p>}
        </>}
        <div className="con-actions">
          <button type="submit" disabled={blocked || !booth || (workflow === "upkeep" && (!branch || branch === "event" && (!card || card === "accident" && !accident)))}>Record {workflow === "upkeep" ? "result" : "location"}</button>
          <button type="button" className="module-quiet-link" onClick={() => open()}>Cancel</button>
        </div>
      </form>}
    </section>

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
        : starting.id === "swag" ? <a href="#megabgcon-swag" onClick={() => {
          const details = document.querySelector<HTMLDetailsElement>("#megabgcon-swag");
          if (details) details.open = true;
        }}>Record tokens <ArrowRight size={14} aria-hidden="true" /></a>
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

    <details className="con-disclosure">
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
    </details>

    <details className="con-disclosure" id="megabgcon-swag">
      <summary>SWAG Roulette{state.swag.some(s => s.status === "active") ? ` · ${state.swag.filter(s => s.status === "active").length} sealed` : ""}</summary>
      {state.swag.length ? <div className="con-grid">
        {state.swag.map(({ booth: place, status }, slot) => <article key={slot}>
          <IllustratedTile className="module-control-tile con-swag-photo" art={conArt(status === "saved" ? "swag-open" : "swag-sealed")}
            title={place} disabled status={status === "active" ? "SWAG sealed" : status === "saved" ? "Rescued · Reward revealed" : "Token discarded unseen"} />
          {status === "active" && <div className="con-actions">
            <button type="button" disabled={blocked} onClick={() => commit({ kind: "swag-outcome", slot, outcome: "saved", killer })}>Saved</button>
            <button type="button" disabled={blocked} onClick={() => commit({ kind: "swag-outcome", slot, outcome: "killed", killer })}>Killed</button>
            <button type="button" className="module-quiet-link" disabled={blocked} onClick={() => commit({ kind: "swag-outcome", slot, outcome: "left", killer })}>Left play</button>
          </div>}
        </article>)}
      </div> : <form className="con-editor" onSubmit={e => {
        e.preventDefault();
        if (swag[0] && swag[1] && swag[2] && commit({ kind: "swag", booths: [swag[0], swag[1], swag[2]] })) setSwag(["", "", ""]);
      }}>
        {swag.map((value, index) => <BoothSelect key={index} value={value} label={`SWAG Booth ${index + 1}`}
          change={next => setSwag(current => current.map((v, i) => i === index ? next : v) as typeof swag)} />)}
        <div className="con-actions"><button type="submit" disabled={blocked || swag.includes("") || new Set(swag).size !== 3}>Record sealed tokens</button></div>
      </form>}
    </details>

    <details className="con-disclosure" open={state.buggy ? true : undefined}>
      <summary>Medical Buggy{state.buggy ? state.buggy === "active" ? " · In play" : " · Spent" : ""}</summary>
      <IllustratedTile className="module-control-tile con-buggy" art={conArt(state.buggy === "spent" ? "buggy-spent" : "buggy")}
        title="Medical Buggy" status={state.buggy === "active" ? "In play" : state.buggy === "spent" ? "Spent" : "Add when Keys are found"}
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
    {finale && workflow === "upkeep" && <p className="con-hint"><DoorOpen aria-hidden="true" size={16} /> Finale revealed before this Upkeep was recorded.</p>}
  </div>;
}
