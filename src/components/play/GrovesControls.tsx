import { useState, useRef, useEffect } from "react";
import { useModuleRecord } from "./useModuleRecord";
import { CharacterControl } from "./CharacterControl";
import { EventControl } from "./EventControl";
import { IllustratedTile } from "./IllustratedTile";
import { PlaySelect } from "./PlaySelect";
import { AtonementControl } from "./AtonementControl";
import { GrovesBoard } from "./GrovesBoard";
import { grovesScene, grovesPerson } from "./grovesArt";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import { moduleState, type ModuleValue } from "@/lib/play/modules";
import {
  GROVES_SACRED,
  GROVES_EVENTS,
  GROVES_PEOPLE,
  GROVES_UNLEASH,
  GROVES_BLOODLUST,
  GROVES_FINALE,
  GROVES_EDGES,
  GROVES_SETUPS,
  GROVES_FICKLENESS,
  HOLY_MAN_PROVISIONAL,
  grovesSpaceName,
  grovesEdgeName,
  grovesEdgeId,
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
  setupScenario,
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
  const [counts, setCounts] = useState<Record<string, string>>({
    burial: "",
    shrine: "",
    holy: "",
  });
  const [setup, setSetup] = useState(setupScenario ?? GROVES_SETUPS[0].name),
    [edge, setEdge] = useState("");
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
  const fireKnown = typeof s.fire === "string";
  const validCounts = GROVES_SACRED.every(
    (site) =>
      /^\d{1,2}$/.test(counts[site.id]) && Number(counts[site.id]) <= 99,
  );
  const base = GROVES_SACRED.reduce(
    (n, site) =>
      n + Number(counts[site.id] || 0) * (s.fire === site.id ? 2 : 1),
    0,
  );
  const increaseAction: GrovesAction = {
    kind: "increase",
    parent,
    amount: base,
    incense,
  };
  const increasePreview =
    validCounts && fireKnown && base > 0
      ? resolveGrovesAction(increaseAction, s, ink, killer)
      : null;
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
      <section className="groves-wrath">
        <div className="groves-wrath-heading">
          <div>
            <span className="groves-eyebrow">THE GODS ARE WATCHING</span>
            <h3>Divine Wrath</h3>
          </div>
          <output aria-label="Current Divine Wrath" aria-live="polite">
            {wrath ?? "?"}
            <small>/10</small>
          </output>
        </div>
        <div
          className="groves-track"
          role="group"
          aria-label="Divine Wrath level"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              aria-label={`Set Divine Wrath to ${n}`}
              aria-pressed={wrath === n}
              data-filled={wrath !== undefined && n <= wrath}
              onClick={() => {
                if (wrath !== n) record({ wrath: n });
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="groves-adjust">
          <button
            aria-label="Decrease Divine Wrath"
            disabled={wrath === undefined || wrath <= 1}
            onClick={() => record({ wrath: wrath! - 1 })}
          >
            −
          </button>
          <span>{wrath === undefined ? "Not recorded" : "Divine Wrath"}</span>
          <button
            aria-label="Increase Divine Wrath"
            disabled={wrath === undefined || wrath >= 10}
            onClick={() => record({ wrath: wrath! + 1 })}
          >
            +
          </button>
        </div>
        <div className="groves-unleash">
          <h4>Unleash{wrath !== undefined ? ` · Level ${wrath}` : ""}</h4>
          <p>
            {wrath === undefined
              ? "Set the current level to see its Unleash effects."
              : GROVES_UNLEASH[wrath - 1]}
          </p>
        </div>
        {s["event.loud"] === "active" && (
          <p className="groves-consequence">
            <strong>Loud and Obnoxious:</strong> add 1 whenever Divine Wrath
            increases.
          </p>
        )}
        <AtonementControl
          targets={[
            { id: "divine", label: "Divine Wrath", wrath },
            ...(paired
              ? [
                  {
                    id: "killer" as const,
                    label: "Killer Wrath",
                    wrath:
                      typeof ink.wrath === "number" ? ink.wrath : undefined,
                  },
                ]
              : []),
          ]}
          disabled={blocked}
          onResolve={(target, successes) =>
            action({ kind: "atonement", parent, target, successes })
          }
        />
        <details className="groves-details">
          <summary>Sacred-space increase</summary>
          <p>
            Enter current Victims at each Sacred space. Fire and Brimstone
            counts its site's Victims twice.
          </p>
          <div className="groves-counts">
            {GROVES_SACRED.map((site) => (
              <label key={site.id}>
                {site.name}
                <input
                  aria-label={`Victims at ${site.name}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  max="99"
                  value={counts[site.id]}
                  onChange={(e) =>
                    setCounts({ ...counts, [site.id]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
          <label className="groves-check">
            <input
              type="checkbox"
              checked={incense}
              onChange={(e) => setIncense(e.target.checked)}
            />
            Incense applies to this increase
          </label>
          {!fireKnown && (
            <p>
              Record the Fire and Brimstone token's location, or Not placed,
              before calculating.
            </p>
          )}
          {validCounts && base === 0 && (
            <p>
              No Victims counted. Use the physical cards to resolve any
              zero-increase interaction, then correct the observed level above.
            </p>
          )}
          <button
            className="groves-primary"
            disabled={!increasePreview}
            onClick={() => {
              if (action(increaseAction))
                setCounts({ burial: "", shrine: "", holy: "" });
            }}
          >
            Apply increase
            {increasePreview
              ? ` · ${wrath} → ${increasePreview.changes.wrath}`
              : ""}
          </button>
        </details>
        <details className="groves-details">
          <summary>Wrath rules &amp; corrections</summary>
          <p>
            Wrath remains between 1 and 10. Level adjustments record your
            physical tracker; they do not Unleash. Resolve Time, hand, Horror
            and other physical effects in printed order.
          </p>
          <ol>
            {GROVES_UNLEASH.map((line, i) => (
              <li key={line}>
                <strong>{i + 1}.</strong> {line}
              </li>
            ))}
          </ol>
          <button
            disabled={wrath === undefined}
            onClick={() => record({ wrath: null })}
          >
            Clear Divine Wrath record
          </button>
        </details>
      </section>
      <details
        className="groves-details groves-timing"
        open={s.finaleRevealed === true ? true : undefined}
      >
        <summary>Bloodlust &amp; Finale</summary>
        {s.finaleRevealed === true ? (
          <p className="groves-consequence">
            <strong>Finale revealed:</strong> {GROVES_FINALE}
          </p>
        ) : (
          <p>{GROVES_FINALE}</p>
        )}
        <p>
          Align the location strip with the bottom of the chosen Killer's track.
          On a Bloodlust increase, apply the matching line alongside the Killer
          board. Rows above this seven-row strip have no additional printed
          location effect. Follow the physical Killer track at its maximum.
        </p>
        <ol start={0}>
          {GROVES_BLOODLUST.map((line, i) => (
            <li key={i}>
              <strong>{i}.</strong> {line}
            </li>
          ))}
        </ol>
      </details>
      <section>
        <h3>Sacred spaces</h3>
        <div className="groves-site-grid">
          {GROVES_SACRED.map((site, i) => (
            <IllustratedTile
              className="module-control-tile"
              key={site.id}
              art={grovesScene(i)}
              title={site.name}
              status={
                [
                  s.closed === site.id && "Closed",
                  s.fire === site.id && "Fire and Brimstone",
                  s.hallowed === site.id && "Hallowed Ground",
                ]
                  .filter(Boolean)
                  .join(" · ") ||
                (["closed", "fire", "hallowed"].every(
                  (k) => typeof s[k] === "string",
                )
                  ? "No tokens"
                  : "Tokens not fully recorded")
              }
              aria-label={`View tokens: ${site.name}`}
              onClick={() =>
                document.getElementById("groves-token-placement")?.focus()
              }
            />
          ))}
        </div>
        <div
          id="groves-token-placement"
          tabIndex={-1}
          className="groves-placements"
        >
          {(["closed", "fire", "hallowed"] as const).map((key) => (
            <div key={key}>
              <PlaySelect
                disabled={blocked}
                aria-label={`${grovesLabel(key)} placement`}
                value={string(s[key]) ?? ""}
                onChange={(e) => record({ [key]: e.target.value || null })}
              >
                <option value="">Not recorded</option>
                <option value="none">Not placed</option>
                {GROVES_SACRED.map((site) => (
                  <option key={site.id} value={site.id}>
                    {grovesLabel(key)} · {site.name}
                  </option>
                ))}
              </PlaySelect>
              <p>
                {grovesLabel(key)}: <strong>{grovesSpaceName(s[key])}</strong>
              </p>
            </div>
          ))}
        </div>
        {s.closed && s.closed !== "none" && (
          <p className="groves-consequence">
            Closed: Victims cannot enter {grovesSpaceName(s.closed)} for any
            reason. You and Enemies may enter.
          </p>
        )}
        {s.fire && s.fire !== "none" && (
          <p className="groves-consequence">
            Fire and Brimstone: each Victim at {grovesSpaceName(s.fire)} counts
            twice for Divine Wrath increases.
          </p>
        )}
        {s.hallowed && s.hallowed !== "none" && (
          <p className="groves-consequence">
            Hallowed Ground: end the Action phase at{" "}
            {grovesSpaceName(s.hallowed)} to gain 2 Time.
          </p>
        )}
      </section>
      <details className="groves-details">
        <summary>Out of Order connections</summary>
        <p>
          Two reusable signs. Spend 1 Time to place or retrieve one on a
          connection from your current space to an adjacent space. Victims
          cannot pass unless following you.
        </p>
        <GrovesBoard edge={edge} />
        {[1, 2].map((n) => (
          <div className="groves-sign" key={n}>
            <IllustratedTile
              className="module-control-tile"
              art={grovesScene(
                s[`sign.${n}`] === "none"
                  ? 13
                  : typeof s[`sign.${n}`] === "string"
                    ? 3
                    : 12,
              )}
              title={`Out of Order ${n}`}
              status={grovesEdgeName(s[`sign.${n}`])}
              aria-label={`View Out of Order ${n} connection`}
              onClick={() => setEdge(string(s[`sign.${n}`]) ?? "")}
            />
            <PlaySelect
              disabled={blocked}
              aria-label={`Out of Order ${n} connection`}
              value={string(s[`sign.${n}`]) ?? ""}
              onChange={(e) => {
                setEdge(e.target.value);
                record({ [`sign.${n}`]: e.target.value || null });
              }}
            >
              <option value="">Not recorded</option>
              <option value="none">Retrieved · not placed</option>
              {GROVES_EDGES.map((pair) => (
                <option key={grovesEdgeId(pair)} value={grovesEdgeId(pair)}>
                  {grovesEdgeName(grovesEdgeId(pair))}
                </option>
              ))}
            </PlaySelect>
          </div>
        ))}
      </details>
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
                help={
                  <>
                    <p>
                      {GROVES_EVENTS.find((e) => e.id === person.id)!.effect}
                    </p>
                    {person.id === "holy-man" && !paired && (
                      <p>{HOLY_MAN_PROVISIONAL}</p>
                    )}
                  </>
                }
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
          effect={GROVES_FICKLENESS}
          reminder="At the END of Upkeep: Horror roll — 2+ successes reduce a chosen Wrath by 1; 1 has no effect; 0 Unleashes Divine Wrath, then increases it by Sacred-space Victims. Action phase: spend 3 Time to discard."
          onActivate={() => record({ fickleness: "active" })}
          onEnd={() => record({ fickleness: "ended" })}
          onClear={() => record({ fickleness: null })}
        />
      </section>
      <details className="groves-details">
        <summary>Setup reference</summary>
        <PlaySelect
          aria-label="Sacred Groves Setup"
          value={setup}
          onChange={(e) => setSetup(e.target.value)}
        >
          {GROVES_SETUPS.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </PlaySelect>
        <GrovesBoard setup={setup} />
        <p>
          Diagrams are references. Viewing or selecting one does not move
          figures or change totals.
        </p>
      </details>
      {message && (
        <p role="alert" className="play-module-error">
          {message}
        </p>
      )}
    </fieldset>
  );
}
