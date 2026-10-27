import { useState, useRef, useEffect } from "react";
import { useModuleRecord } from "./useModuleRecord";
import { CharacterControl } from "./CharacterControl";
import { EventControl } from "./EventControl";
import { PlaySelect } from "./PlaySelect";
import { WrathTrack } from "./WrathTrack";
import { SacredSpaces } from "./SacredSpaces";
import { grovesScene, grovesPerson } from "./grovesArt";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import { moduleState, type ModuleValue } from "@/lib/play/modules";
import {
  GROVES_EVENTS,
  GROVES_PEOPLE,
  HOLY_MAN_PROVISIONAL,
  grovesLabel,
  grovesValue,
  resolveGrovesAction,
  type GrovesAction,
} from "../../../supabase/functions/_shared/play/groves";
import type { ControlsProps } from "./moduleDefinitions";
import "@/styles/play-groves.css";
const states = [
  { value: "in-play", label: "In play" },
  { value: "saved", label: "Saved" },
  { value: "killed", label: "Killed" },
  { value: "removed", label: "Removed" },
  { value: "away", label: "Left play" },
];
const eventArt: Record<string, number> = {
  closed: 10,
  loud: 4,
  flash: 5,
  fire: 6,
  bloodshed: 8,
  hallowed: 7,
  failure: 9,
};
const reminders: Record<string, string> = {
  guide:
    "Once per turn: +1 movement if the Guide accompanies the entire move. If killed: Divine Wrath +6.",
  tourist:
    "The Killer targets the Uber Tourist. Saved: reduce one chosen Wrath by 4. Killed: Divine Wrath +4.",
  "holy-man":
    "Will not follow. Each Upkeep: move one space toward the Killer. On meeting the Killer, remove him and resolve the ritual.",
  closed:
    "Victims cannot enter the closed Sacred space, even when following you. You and Enemies may enter.",
  loud: "Whenever Divine Wrath increases, add 1 to that increase.",
  flash: "Victims panic in your space: discard one random Action card.",
  fire: "Each Victim at the marked Sacred space counts twice for Divine Wrath increases.",
  hallowed: "End the Action phase at the marked Sacred space: gain 2 Time.",
  bloodshed:
    "At least one Victim killed at a Sacred space: Unleash Divine Wrath.",
  failure:
    "Completely fail a Horror roll, after conversions and rerolls: Divine Wrath +1.",
};
const string = (v: unknown) => (typeof v === "string" ? v : undefined);
type Outcome = Extract<GrovesAction, { kind: "outcome" }>;
export function GrovesControls({
  killer,
  location,
  events,
  onEvent,
  blocked,
  startingEvent,
}: ControlsProps) {
  const entries = summarizePlay(events).entries,
    s = moduleState(entries, "groves"),
    ink = moduleState(entries, "inkanyamba");
  const { record: commit, message } = useModuleRecord(events, onEvent);
  const [pending, setPending] = useState<Omit<
    Outcome,
    "parent" | "incense"
  > | null>(null);
  const [incense, setIncense] = useState(false),
    [allocation, setAllocation] = useState(5),
    [target, setTarget] = useState<"divine" | "killer">("divine");
  const resolutionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (pending) resolutionRef.current?.focus();
  }, [pending]);
  const parent = events[events.length - 1]?.id ?? "root";
  const wrath = typeof s.wrath === "number" ? s.wrath : undefined;
  const paired = killer === "Inkanyamba";
  const record = (changes: Record<string, ModuleValue>) =>
    !blocked &&
    commit(
      newPlayEvent({
        kind: "module",
        moduleData: { module: "groves", changes },
      }),
    );
  const action = (a: GrovesAction) => {
    if (blocked) return false;
    const result = resolveGrovesAction(a, s, ink, killer);
    if (!result) return false;
    return commit(
      newPlayEvent({
        kind: "module",
        moduleData: { module: "groves", changes: result.changes },
        grovesAction: a,
        ...(result.linkedModule && { linkedModule: result.linkedModule }),
      }),
    );
  };
  const correctedPerson = (id: string, value: string | null) =>
    record({
      [`person.${id}`]: value,
      ...(value
        ? { [`event.${id}`]: value === "in-play" ? "active" : "ended" }
        : {}),
      ...(id === "holy-man"
        ? { holyManOutcome: null, holyManProvisional: null }
        : {}),
    });
  const activate = (id: string) =>
    record({
      [`event.${id}`]: "active",
      ...(GROVES_PEOPLE.some((p) => p.id === id)
        ? { [`person.${id}`]: "in-play" }
        : {}),
    });
  const end = (id: string) =>
    record({
      [`event.${id}`]: "ended",
      ...(GROVES_PEOPLE.some((p) => p.id === id) &&
      s[`person.${id}`] === "in-play"
        ? { [`person.${id}`]: "away" }
        : {}),
    });
  const previewAction: GrovesAction | null = pending
    ? {
        ...pending,
        parent,
        incense,
        target,
        ...(pending.person === "holy-man" &&
        pending.outcome === "angered" &&
        paired
          ? { allocation }
          : {}),
      }
    : null;
  const preview =
    previewAction && resolveGrovesAction(previewAction, s, ink, killer);
  const openOutcome = (
    person: Outcome["person"],
    outcome: Outcome["outcome"],
  ) => {
    setPending({ kind: "outcome", person, outcome });
    setTarget("divine");
    setIncense(false);
    setAllocation(5);
  };
  const starting = GROVES_EVENTS.find((e) => e.name === startingEvent);
  const startingRole =
    starting && GROVES_PEOPLE.some((p) => p.id === starting.id)
      ? s[`person.${starting.id}`]
      : undefined;
  if (location !== "Sacred Groves") return null;
  return (
    <fieldset
      className="play-groves"
      disabled={blocked}
      aria-label="Sacred Groves tracking"
    >
      {blocked && <p role="status">Choose which saved game to continue.</p>}
      {starting && s[`event.${starting.id}`] === undefined && (
        <section className="groves-starting" aria-label="Starting Event">
          <div>
            <span className="groves-eyebrow">STARTING EVENT</span>
            <h4>{starting.name}</h4>
          </div>
          <button
            className="groves-primary"
            disabled={!!startingRole && startingRole !== "in-play"}
            onClick={() => activate(starting.id)}
          >
            Activate starting Event
          </button>
        </section>
      )}
      <WrathTrack
        kind="divine"
        value={wrath}
        disabled={blocked}
        onChange={(wrath) => record({ wrath })}
      >
        {s["event.loud"] === "active" && (
          <p className="groves-consequence">
            <strong>Loud and Obnoxious:</strong> add 1 whenever Divine Wrath
            increases.
          </p>
        )}
      </WrathTrack>
      <SacredSpaces state={s} disabled={blocked} onChange={record} />
      <section>
        <h3>Special Victims</h3>
        <div className="groves-people-grid">
          {GROVES_PEOPLE.map((person, i) => (
            <div key={person.id}>
              <CharacterControl
                name={person.name}
                value={string(s[`person.${person.id}`])}
                states={states}
                present="in-play"
                art={grovesPerson(i, string(s[`person.${person.id}`]))}
                outcomes={["saved", "killed"]}
                onChange={(value) => correctedPerson(person.id, value)}
                onOutcome={(value) =>
                  openOutcome(person.id, value as Outcome["outcome"])
                }
                showRules={false}
                reminder={
                  s[`event.${person.id}`] === "active"
                    ? reminders[person.id]
                    : undefined
                }
              />
              {person.id === "holy-man" &&
                s["person.holy-man"] === "in-play" && (
                  <div className="groves-ritual">
                    <button onClick={() => openOutcome("holy-man", "blessed")}>
                      Met Killer · you were there
                    </button>
                    <button onClick={() => openOutcome("holy-man", "angered")}>
                      Met Killer · you were absent
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
      </section>
      {pending && (
        <section
          ref={resolutionRef}
          tabIndex={-1}
          className="groves-resolution"
          aria-label="Resolve special Victim outcome"
        >
          <h3>
            {GROVES_PEOPLE.find((p) => p.id === pending.person)!.name} ·{" "}
            {pending.outcome}
          </h3>
          {pending.person === "tourist" && pending.outcome === "saved" && (
            <PlaySelect
              disabled={blocked}
              aria-label="Uber Tourist reward target"
              value={target}
              onChange={(e) => setTarget(e.target.value as "divine" | "killer")}
            >
              <option value="divine">Divine Wrath</option>
              {paired && <option value="killer">Killer Wrath</option>}
            </PlaySelect>
          )}
          {pending.person === "holy-man" &&
            pending.outcome === "angered" &&
            (paired ? (
              <label>
                Allocate the 10-point increase
                <PlaySelect
                  disabled={blocked}
                  aria-label="Holy Man Divine allocation"
                  value={String(allocation)}
                  onChange={(e) => setAllocation(Number(e.target.value))}
                >
                  {Array.from({ length: 11 }, (_, n) => (
                    <option key={n} value={String(n)}>
                      {n} Divine · {10 - n} Killer
                    </option>
                  ))}
                </PlaySelect>
              </label>
            ) : (
              <p className="groves-consequence">{HOLY_MAN_PROVISIONAL}</p>
            ))}
          {(pending.outcome === "killed" || pending.outcome === "angered") && (
            <label className="groves-check">
              <input
                type="checkbox"
                checked={incense}
                onChange={(e) => setIncense(e.target.checked)}
              />
              Incense applies to this increase
            </label>
          )}
          {preview ? (
            <ul aria-label="Outcome preview">
              {Object.entries(preview.changes)
                .filter(([key]) => !key.startsWith("holyMan"))
                .map(([key, value]) => (
                  <li key={key}>
                    {grovesLabel(key)} → {grovesValue(key, value)}
                  </li>
                ))}
              {preview.linkedModule && (
                <li>Killer Wrath → {preview.linkedModule.changes.wrath}</li>
              )}
            </ul>
          ) : (
            <p>
              Set each affected Wrath track to its current physical level before
              resolving this outcome.
            </p>
          )}
          <p>Victim totals stay separate.</p>
          <div className="groves-actions">
            <button
              className="groves-primary"
              disabled={!preview}
              onClick={() => {
                if (previewAction && action(previewAction)) setPending(null);
              }}
            >
              Record outcome
            </button>
            <button onClick={() => setPending(null)}>Cancel outcome</button>
          </div>
        </section>
      )}
      <details className="groves-details">
        <summary>Events</summary>
        {startingEvent &&
          !s[
            `event.${GROVES_EVENTS.find((e) => e.name === startingEvent)?.id}`
          ] && (
            <p>
              Starting Event: <strong>{startingEvent}</strong>. Activate its
              card below, then choose any physical placements.
            </p>
          )}
        <div className="groves-event-grid">
          {[...GROVES_EVENTS]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((e) => {
              const person = GROVES_PEOPLE.find((p) => p.id === e.id);
              return (
                <EventControl
                  key={e.id}
                  name={e.name}
                  interaction={
                    ["loud", "flash", "bloodshed", "failure"].includes(e.id)
                      ? "toggle"
                      : "details"
                  }
                  value={string(s[`event.${e.id}`])}
                  ended={
                    s[`event.${e.id}`] === "declined" ? "declined" : "ended"
                  }
                  art={
                    person
                      ? grovesPerson(
                          GROVES_PEOPLE.indexOf(person),
                          string(s[`person.${person.id}`]),
                        )
                      : grovesScene(eventArt[e.id])
                  }
                  effect={e.effect}
                  reminder={
                    e.id === "closed" && (!s.closed || s.closed === "none")
                      ? undefined
                      : reminders[e.id]
                  }
                  allowed={
                    !person ||
                    !s[`person.${person.id}`] ||
                    s[`person.${person.id}`] === "in-play"
                  }
                  onActivate={() => activate(e.id)}
                  onEnd={() => end(e.id)}
                  onClear={() => record({ [`event.${e.id}`]: null })}
                >
                  {e.id === "closed" && s["event.closed"] === "active" && (
                    <div className="groves-event-choice">
                      <p>
                        Choose a Closed token placement above after paying the
                        printed discard, or decline.
                      </p>
                      <button
                        onClick={() => record({ "event.closed": "declined" })}
                      >
                        Decline closure
                      </button>
                    </div>
                  )}
                  {["fire", "hallowed"].includes(e.id) &&
                    s[`event.${e.id}`] === "active" && (
                      <p>Record the rolled Sacred-space placement above.</p>
                    )}
                </EventControl>
              );
            })}
        </div>
      </details>
      <section>
        <h3>Ongoing Terror</h3>
        <EventControl
          name="Fickleness of the Gods"
          value={string(s.fickleness)}
          art={grovesScene(11)}
          interaction="toggle"
          className="groves-ongoing-terror"
          onActivate={() => record({ fickleness: "active" })}
          onEnd={() => record({ fickleness: "ended" })}
          onClear={() => record({ fickleness: null })}
        />
      </section>
      {message && (
        <p role="alert" className="play-module-error">
          {message}
        </p>
      )}
    </fieldset>
  );
}
