import { useEffect, useRef, useState } from "react";
import { Check, Clapperboard, Fingerprint, Search, Undo2 } from "lucide-react";
import {
  MORT,
  MORT_ATTACK,
  MORT_MINORS,
  MORT_MOVE,
  MORT_POWERS,
  MORT_SUSPECTS,
  MORT_TRAITS,
  canRecordMort,
  describeMort,
  mortFinale,
  mortMatches,
  mortState,
  type MortCommand,
  type MortState,
  type Suspect,
} from "../../../supabase/functions/_shared/play/mort";
import {
  canUndoMort,
  newPlayEvent,
  summarizePlay,
  type PlayEvent,
} from "@/lib/play/events";
import { PlaySelect } from "./PlaySelect";
import { useModuleRecord } from "./useModuleRecord";
import type { ControlsProps } from "./moduleDefinitions";
import { mortEvent } from "@/lib/play/mortRecord";
import { mortPhoto } from "./mortArt";
import "@/styles/play-mort.css";

const nameOf = (id: Suspect) => MORT_SUSPECTS.find((s) => s.id === id)!.name;
const numbers = [1, 2, 3, 4, 5];
const toggle = <T,>(items: T[], item: T) =>
  items.includes(item) ? items.filter((i) => i !== item) : [...items, item];
type Commit = (action: MortCommand) => boolean;

function RevealEditor({
  state,
  commit,
  blocked,
  onClose,
}: {
  state: MortState;
  commit: Commit;
  blocked?: boolean;
  onClose: () => void;
}) {
  const [suspect, setSuspect] = useState<Suspect | "">("");
  const [power, setPower] = useState<(typeof MORT_POWERS)[number]["id"] | "">(
    state.power ?? "",
  );
  const [missing, setMissing] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const candidates = MORT_SUSPECTS.filter(
    (s) => !state.excluded.includes(s.id),
  );
  const complete = state.clues.length === 5;
  const command: MortCommand | undefined =
    suspect && power && confirmed && (state.known || missing)
      ? {
          kind: "reveal",
          suspect,
          route: complete ? "clues" : "terror",
          power,
          ...(!state.known ? { missing: Number(missing) } : {}),
        }
      : undefined;
  return (
    <form
      className="mort-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (command && commit(command)) onClose();
      }}
    >
      <h4>{complete ? "Confirm the disguise" : "Terror deck exhausted"}</h4>
      <p>
        {complete
          ? "Check the answer with the physical Clue Viewer."
          : "Read the answer on the reverse of the physical Clue card."}{" "}
        {state.active
          ? "Return the active token and finish the tabletop action first."
          : ""}
      </p>
      <label>
        Confirmed disguise
        <PlaySelect
          aria-label="Confirmed disguise"
          value={suspect}
          onChange={(e) => setSuspect(e.target.value as Suspect)}
        >
          <option value="">Choose the disguise</option>
          {candidates.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </PlaySelect>
      </label>
      {!state.known && (
        <label>
          Unrevealed clues
          <PlaySelect
            aria-label="Unrevealed clues"
            value={missing}
            onChange={(e) => setMissing(e.target.value)}
          >
            <option value="">Count on the tabletop</option>
            {numbers.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </PlaySelect>
        </label>
      )}
      {!state.power && (
        <label>
          Dark Power
          <PlaySelect
            aria-label="Dark Power"
            value={power}
            onChange={(e) => setPower(e.target.value as typeof power)}
          >
            <option value="">Choose the revealed Dark Power</option>
            {MORT_POWERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </PlaySelect>
        </label>
      )}
      <label className="mort-check">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        {complete
          ? "I confirmed the disguise with the Viewer"
          : "The Terror deck is exhausted and I confirmed the disguise"}
      </label>
      <div className="mort-actions">
        <button
          type="submit"
          className="mort-primary"
          disabled={blocked || !command || Boolean(state.active)}
        >
          Reveal Mort
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function FinalePanel({
  state,
  bloodlust,
}: {
  state: MortState;
  bloodlust: number;
}) {
  const reveal = state.reveal!;
  const finale = mortFinale(reveal, bloodlust);
  return (
    <>
      <article className="mort-finale" aria-label="Mort Revealed">
        <img src={mortPhoto(`${finale.suspect.id}-finale`)} alt="" />
        <div className="mort-finale-copy">
          <small>
            <Clapperboard size={16} /> Mort revealed
          </small>
          <h3>Mort as {finale.suspect.name}</h3>
          <p>
            {reveal.missing === 0
              ? "All five clues found"
              : `${reveal.missing} unrevealed ${reveal.missing === 1 ? "clue" : "clues"}${reveal.missing !== reveal.effective ? ` · counts as ${reveal.effective}` : ""}`}
          </p>
          <div className="mort-stats">
            <span>
              <strong>{finale.health}</strong> Starting Health
            </span>
            <span>
              <strong>{finale.attack}</strong> Attack
            </span>
            <span>
              <strong>{finale.movement}</strong> Movement
            </span>
          </div>
        </div>
      </article>
      <div className="mort-finale-rules">
        <p>
          <strong>Finale action</strong> {finale.suspect.action}
        </p>
        <p>{finale.effect}</p>
        <p>
          Replace the Basic Finale, remove the Informants and any other
          suspects, and discard active Minor Dark Powers.
          {reveal.route === "clues"
            ? " Discard any remaining Terror cards."
            : ""}{" "}
          Place Mort in the confirmed suspect’s space with a Final Health token.
        </p>
      </div>
    </>
  );
}

export function MortRevealEntry({
  events,
  onEvent,
  blocked,
  onClose,
  fresh,
}: {
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  blocked?: boolean;
  onClose: () => void;
  fresh?: boolean;
}) {
  const summary = summarizePlay(events);
  const state = mortState(summary.entries, fresh && !events.length);
  const { record, message } = useModuleRecord(events, onEvent);
  const commit: Commit = (command) =>
    record(mortEvent(command, summary.entries));
  return (
    <section className="mort-play">
      {state.reveal ? (
        <FinalePanel
          state={state}
          bloodlust={Math.min(8, summary.bloodlust ?? 0)}
        />
      ) : (
        <RevealEditor
          state={state}
          commit={commit}
          blocked={blocked}
          onClose={onClose}
        />
      )}
      {message && <p role="alert">{message}</p>}
    </section>
  );
}

export function MortPowerPicker({
  events,
  onEvent,
  blocked,
}: {
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  blocked?: boolean;
}) {
  const entries = summarizePlay(events).entries;
  const state = mortState(entries);
  const { record, message } = useModuleRecord(events, onEvent);
  const power = MORT_POWERS.find((p) => p.id === state.power);
  const save = (power: (typeof MORT_POWERS)[number]["id"] | null) =>
    record(mortEvent({ kind: "power", power }, entries));
  return (
    <div className="mort-play mort-powers">
      {power ? (
        <>
          <article className="mort-power-hero">
            <img src={mortPhoto(power.id)} alt="" />
            <div>
              <small>
                {"epic" in power ? "Epic Dark Power" : "Dark Power"}
              </small>
              <h4>{power.name}</h4>
              <p>{power.effect}</p>
            </div>
          </article>
          {!state.reveal && (
            <button
              className="mort-link"
              disabled={blocked}
              onClick={() => save(null)}
            >
              Clear card name
            </button>
          )}
        </>
      ) : (
        <div className="mort-power-grid">
          {MORT_POWERS.map((p) => (
            <button
              key={p.id}
              className="mort-power-choice"
              disabled={blocked}
              onClick={() => save(p.id)}
            >
              <img src={mortPhoto(p.id)} alt="" />
              <span>
                {p.name}
                {"epic" in p && <small>Epic</small>}
              </span>
            </button>
          ))}
        </div>
      )}
      {message && <p role="alert">{message}</p>}
    </div>
  );
}

function AdoptInvestigation({ commit }: { commit: Commit }) {
  const [clues, setClues] = useState<number[]>([]);
  const [excluded, setExcluded] = useState<Suspect[]>([]);
  const [discarded, setDiscarded] = useState<Suspect[]>([]);
  const [informants, setInformants] = useState("");
  return (
    <details className="mort-editor">
      <summary>Record investigation from the tabletop</summary>
      <div
        role="group"
        aria-label="Clues already found"
        className="mort-options"
      >
        {numbers.map((n) => (
          <button
            type="button"
            key={n}
            aria-pressed={clues.includes(n)}
            onClick={() => setClues(toggle(clues, n))}
          >
            Clue {n}
          </button>
        ))}
      </div>
      <div
        role="group"
        aria-label="Suspects already ruled out"
        className="mort-options"
      >
        {MORT_SUSPECTS.map((s) => (
          <button
            type="button"
            key={s.id}
            aria-pressed={excluded.includes(s.id)}
            onClick={() => {
              setExcluded(toggle(excluded, s.id));
              setDiscarded(discarded.filter((id) => id !== s.id));
            }}
          >
            {s.name}
          </button>
        ))}
      </div>
      {excluded.length > 0 && (
        <div
          role="group"
          aria-label="Tokens already discarded"
          className="mort-options"
        >
          {excluded.map((id) => (
            <button
              type="button"
              key={id}
              aria-pressed={discarded.includes(id)}
              onClick={() => setDiscarded(toggle(discarded, id))}
            >
              Discarded {nameOf(id)} token
            </button>
          ))}
        </div>
      )}
      <label>
        Informants currently on the board
        <PlaySelect
          aria-label="Informants currently on the board"
          value={informants}
          onChange={(e) => setInformants(e.target.value)}
        >
          <option value="">Choose the count</option>
          {Array.from({ length: Math.min(9, excluded.length) + 1 }, (_, i) => (
            <option key={i}>{i}</option>
          ))}
        </PlaySelect>
      </label>
      <button
        className="mort-primary"
        disabled={
          !informants ||
          Number(informants) > excluded.length ||
          excluded.length > 9 ||
          (clues.length === 5 && excluded.length !== 9)
        }
        onClick={() =>
          commit({
            kind: "begin",
            clues,
            excluded,
            discarded,
            informants: Number(informants),
          })
        }
      >
        Record tabletop state
      </button>
    </details>
  );
}

function ClueEditor({
  state,
  commit,
  onClose,
  location,
  initialSource,
}: {
  state: MortState;
  commit: Commit;
  onClose: () => void;
  location: string;
  initialSource: "interrogate" | "coerce";
}) {
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (initialSource === "coerce")
      form.current?.scrollIntoView({ block: "nearest" });
  }, [initialSource]);
  const [number, setNumber] = useState("");
  const [source, setSource] = useState<"manual" | "interrogate" | "coerce">(
    initialSource,
  );
  const [method, setMethod] = useState<"trait" | "manual">("trait");
  const [trait, setTrait] = useState("");
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<Suspect[]>([]);
  const [discard, setDiscard] = useState<
    NonNullable<Extract<MortCommand, { kind: "clue" }>["discard"]> | ""
  >("");
  const matches =
    method === "manual"
      ? selected
      : trait && value
        ? mortMatches(state, Number(trait), value)
        : [];
  const newlyExcluded = matches.filter((id) => !state.excluded.includes(id));
  const attached = matches.length - newlyExcluded.length;
  const total = state.excluded.length + newlyExcluded.length;
  const available = state.clues.length < 5;
  const legal =
    available &&
    matches.length > 0 &&
    total <= 9 &&
    (state.clues.length !== 4 || total === 9);
  const values =
    trait === ""
      ? []
      : [...new Set(MORT_SUSPECTS.map((s) => s.traits[Number(trait)]))].sort();
  const discardOptions: {
    id: NonNullable<Extract<MortCommand, { kind: "clue" }>["discard"]>;
    name: string;
  }[] = MORT_MINORS.filter((m) => state.minors.includes(m.id)).map((m) => ({
    id: m.id,
    name: m.name,
  }));
  if (state.locationMinor && location === state.locationMinor)
    discardOptions.push({
      id: "location",
      name: location === "USS Konrad" ? "Slippery" : "Twisted Bond",
    });
  return (
    <form
      className="mort-editor"
      aria-label="Record a clue"
      ref={form}
      onSubmit={(e) => {
        e.preventDefault();
        if (
          number &&
          legal &&
          commit({
            kind: "clue",
            number: Number(number),
            excluded: matches,
            source,
            ...(method === "trait" ? { trait: Number(trait), value } : {}),
            ...(discard && source !== "manual" ? { discard } : {}),
          })
        )
          onClose();
      }}
    >
      <div className="mort-fields">
        <label>
          Clue number
          <PlaySelect
            aria-label="Clue number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          >
            <option value="">Reminder token</option>
            {numbers
              .filter((n) => !state.clues.includes(n))
              .map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
          </PlaySelect>
        </label>
        <label>
          How you found it
          <PlaySelect
            aria-label="How you found it"
            value={source}
            onChange={(e) => setSource(e.target.value as typeof source)}
          >
            <option value="interrogate">Interrogate</option>
            <option value="coerce" disabled={!state.informants}>
              Coerce
            </option>
            <option value="manual">Already resolved</option>
          </PlaySelect>
        </label>
      </div>
      <div
        className="mort-options"
        role="group"
        aria-label="How to rule out suspects"
      >
        <button
          type="button"
          aria-pressed={method === "trait"}
          onClick={() => setMethod("trait")}
        >
          Match a trait
        </button>
        <button
          type="button"
          aria-pressed={method === "manual"}
          onClick={() => setMethod("manual")}
        >
          Pick suspects
        </button>
      </div>
      {method === "trait" ? (
        <div className="mort-fields">
          <label>
            Trait from the Viewer
            <PlaySelect
              aria-label="Trait from the Viewer"
              value={trait}
              onChange={(e) => {
                setTrait(e.target.value);
                setValue("");
              }}
            >
              <option value="">Choose a trait</option>
              {MORT_TRAITS.map((t, i) => (
                <option key={t} value={i}>
                  {t}
                </option>
              ))}
            </PlaySelect>
          </label>
          <label>
            Mort does not have
            <PlaySelect
              aria-label="Mort does not have"
              value={value}
              disabled={!trait}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="">Choose the excluded value</option>
              {values.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </PlaySelect>
          </label>
        </div>
      ) : (
        <div
          className="mort-options"
          role="group"
          aria-label="Pick suspects to rule out"
        >
          {MORT_SUSPECTS.filter(
            (s) =>
              !state.excluded.includes(s.id) || state.unfiled.includes(s.id),
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={selected.includes(s.id)}
              onClick={() => setSelected(toggle(selected, s.id))}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      {discardOptions.length > 0 && source !== "manual" && (
        <label>
          Discard a Minor Dark Power after two successes
          <PlaySelect
            aria-label="Discard a Minor Dark Power after two successes"
            value={discard}
            onChange={(e) => setDiscard(e.target.value as typeof discard)}
          >
            <option value="">Keep current powers</option>
            {discardOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </PlaySelect>
        </label>
      )}
      <p className="mort-preview" aria-live="polite">
        {total > 9
          ? "Check the clue. At least one suspect must remain."
          : matches.length
            ? `${newlyExcluded.length ? `${newlyExcluded.map(nameOf).join(", ")} ${newlyExcluded.length === 1 ? "becomes an Informant" : "become Informants"}.` : ""}${attached ? ` ${attached} previously ruled out will be linked to this clue.` : ""}${source === "coerce" ? " Remove the Informant you coerced." : ""}${state.clues.length === 4 && total !== 9 ? " The fifth clue must leave one suspect." : ""}`
            : value && method === "trait"
              ? "No remaining suspect matches. Check your earlier exclusions."
              : "Choose a trait value or select suspects to preview the result."}
      </p>
      <div className="mort-actions">
        <button
          type="submit"
          className="mort-primary"
          disabled={!number || !legal}
        >
          Apply clue
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function MortControls({
  events,
  onEvent,
  blocked,
  mortFresh,
  location,
  onDeath,
}: ControlsProps) {
  const summary = summarizePlay(events);
  const state = mortState(summary.entries, mortFresh && !events.length);
  const { record, message } = useModuleRecord(events, onEvent);
  const [problem, setProblem] = useState("");
  const [clue, setClue] = useState<false | "interrogate" | "coerce">(false);
  const [bag, setBag] = useState<Suspect | "">("");
  const [reveal, setReveal] = useState(false);
  const [person, setPerson] = useState<Suspect>();
  const profile = useRef<HTMLElement>(null);
  useEffect(() => {
    if (person && matchMedia("(max-width:680px)").matches)
      profile.current?.scrollIntoView({ block: "nearest" });
  }, [person]);
  const [lower, setLower] = useState(true);
  const bloodlust =
    summary.bloodlust === undefined
      ? undefined
      : Math.min(8, summary.bloodlust);
  const last = [...summary.entries].reverse().find((e) => e.mortAction);
  const commit: Commit = (command) => {
    const event = mortEvent(command, summary.entries);
    if (!canRecordMort(event.mortAction!, state, summary.entries)) {
      setProblem(
        "Check the tabletop record or undo the last related change, then try again.",
      );
      return false;
    }
    setProblem("");
    if (!record(event)) return false;
    if (event.kind === "killed") onDeath?.(event);
    return true;
  };
  const undo = last && canUndoMort(events, last.id);
  const undoButton = undo && (
    <button
      className="mort-link"
      type="button"
      onClick={() => record(newPlayEvent({ kind: "undo", target: last.id }))}
    >
      <Undo2 size={15} /> Undo last Mort change
    </button>
  );

  const survivors = MORT_SUSPECTS.filter((s) => !state.excluded.includes(s.id));
  const out = MORT_SUSPECTS.filter((s) => state.excluded.includes(s.id));
  const clues = summary.entries.flatMap((e) =>
    e.mortAction?.kind === "clue" ? [e.mortAction] : [],
  );
  const lastDraw =
    last?.mortAction?.kind === "draw" &&
    state.discarded.includes(last.mortAction.suspect)
      ? nameOf(last.mortAction.suspect)
      : undefined;
  return (
    <fieldset
      className="mort-play"
      disabled={blocked}
      aria-label="Mort investigation"
    >
      {(message || problem) && <p role="alert">{message || problem}</p>}
      {state.reveal ? (
        <>
          <FinalePanel state={state} bloodlust={bloodlust ?? 0} />
          {undoButton}
        </>
      ) : (
        <>
          <div className="mort-heading">
            <div>
              <small>
                <Fingerprint size={15} /> Investigation
              </small>
              <h3>Suspect lineup</h3>
            </div>
            <span className="mort-count" aria-live="polite">
              {state.known
                ? `${survivors.length} ${survivors.length === 1 ? "suspect" : "suspects"} remaining`
                : "Tabletop state unrecorded"}
            </span>
          </div>
          {!state.known ? (
            <AdoptInvestigation commit={commit} />
          ) : (
            <>
              <div
                className="mort-clue-strip"
                aria-label={`${state.clues.length} of 5 clues found`}
              >
                {numbers.map((n) => (
                  <span
                    key={n}
                    className={state.clues.includes(n) ? "mort-clue-found" : ""}
                    aria-label={`Clue ${n}${state.clues.includes(n) ? " found" : " unrevealed"}`}
                  >
                    {state.clues.includes(n) ? <Check size={15} /> : n}
                  </span>
                ))}
                <button
                  type="button"
                  className="mort-primary"
                  disabled={state.clues.length === 5 || Boolean(state.active)}
                  onClick={() => setClue(clue ? false : "interrogate")}
                >
                  <Search size={16} /> Record clue
                </button>
              </div>
              {last?.mortAction &&
                (last.mortAction.kind === "clue" ||
                  last.mortAction.kind === "exclude") && (
                  <div className="mort-elimination" key={last.id}>
                    <p role="status">{describeMort(last.mortAction)}</p>
                    {undoButton}
                  </div>
                )}
              {clues.length > 0 && (
                <details className="mort-clue-log">
                  <summary>Clues found</summary>
                  <ul>
                    {clues.map((c) => (
                      <li key={c.number}>
                        <strong>Clue {c.number}</strong>{" "}
                        {c.trait !== undefined
                          ? `${MORT_TRAITS[c.trait]} · excludes ${c.value}`
                          : c.excluded.map(nameOf).join(", ")}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {clue && (
                <ClueEditor
                  key={clue}
                  initialSource={clue}
                  state={state}
                  commit={commit}
                  onClose={() => setClue(false)}
                  location={location}
                />
              )}
              <div className="mort-lineup">
                {survivors.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="mort-portrait"
                    data-suspect={s.id}
                    aria-expanded={person === s.id}
                    data-active={state.active === s.id}
                    onClick={() =>
                      setPerson(person === s.id ? undefined : s.id)
                    }
                  >
                    <img src={mortPhoto(s.id)} alt="" loading="lazy" />
                    <span>{s.name}</span>
                    {state.active === s.id && <b>Active Killer</b>}
                  </button>
                ))}
              </div>
              {person && survivors.some((s) => s.id === person) && (
                <section
                  className="mort-editor mort-profile"
                  ref={profile}
                  aria-label={`Profile for ${nameOf(person)}`}
                >
                  <h4>{nameOf(person)}</h4>
                  <dl>
                    {MORT_TRAITS.map((t, i) => (
                      <div key={t}>
                        <dt>{t}</dt>
                        <dd>
                          {
                            MORT_SUSPECTS.find((s) => s.id === person)?.traits[
                              i
                            ]
                          }
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <button
                    type="button"
                    disabled={Boolean(state.active) || survivors.length === 1}
                    onClick={() => {
                      if (commit({ kind: "exclude", suspect: person }))
                        setPerson(undefined);
                    }}
                  >
                    Rule out suspect
                  </button>
                </section>
              )}
              {!!out.length && (
                <details className="mort-ruled">
                  <summary>Ruled out · {out.length}</summary>
                  <div className="mort-lineup">
                    {out.map((s) => (
                      <div className="mort-portrait" data-out key={s.id}>
                        <img src={mortPhoto(s.id)} alt="" loading="lazy" />
                        <span>{s.name}</span>
                        <b>Ruled out</b>
                        {last?.mortAction?.kind === "exclude" &&
                          last.mortAction.suspect === s.id &&
                          undo && (
                            <button
                              type="button"
                              onClick={() =>
                                record(
                                  newPlayEvent({
                                    kind: "undo",
                                    target: last.id,
                                  }),
                                )
                              }
                            >
                              Restore {s.name}
                            </button>
                          )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
              <div className="mort-side">
                <section className="mort-editor">
                  <h4>Suspect bag</h4>
                  {state.active ? (
                    <>
                      <p>
                        <strong>{nameOf(state.active)}</strong> is the Active
                        Killer for this action.
                      </p>
                      <button
                        type="button"
                        onClick={() => commit({ kind: "return-token" })}
                      >
                        Return token
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mort-actions">
                        <PlaySelect
                          aria-label="Physically drawn suspect token"
                          value={bag}
                          onChange={(e) => setBag(e.target.value as Suspect)}
                        >
                          <option value="">Choose the token drawn</option>
                          {MORT_SUSPECTS.filter(
                            (s) => !state.discarded.includes(s.id),
                          ).map((s) => (
                            <option value={s.id} key={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </PlaySelect>
                        <button
                          type="button"
                          disabled={!bag}
                          onClick={() => {
                            if (bag && commit({ kind: "draw", suspect: bag }))
                              setBag("");
                          }}
                        >
                          Record draw
                        </button>
                      </div>
                      {lastDraw && (
                        <p role="status">
                          Discard {lastDraw}’s token and skip the Killer effect.
                        </p>
                      )}
                    </>
                  )}
                  <p className="mort-quiet">
                    Basic Finale · Draw a token, target the nearest victim or
                    Final Girl, move, then attack.
                  </p>
                </section>
                <section className="mort-editor">
                  <h4>
                    Informants <span>{state.informants}</span>
                  </h4>
                  <div className="mort-actions">
                    {(["saved", "killed"] as const).map((result) => (
                      <button
                        type="button"
                        key={result}
                        disabled={!state.informants}
                        onClick={() =>
                          commit({
                            kind: "informant",
                            result,
                            ...(result === "saved"
                              ? {
                                  lowerHorror:
                                    lower && state.power !== "paranoia",
                                }
                              : {}),
                          })
                        }
                      >
                        {result === "saved" ? "Saved" : "Killed"}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={
                        !state.informants ||
                        state.clues.length === 5 ||
                        !!state.active
                      }
                      onClick={() => setClue("coerce")}
                    >
                      Coerce
                    </button>
                  </div>
                  {state.informants > 0 && state.power !== "paranoia" && (
                    <label className="mort-check">
                      <input
                        type="checkbox"
                        checked={lower}
                        onChange={(e) => setLower(e.target.checked)}
                      />
                      Lower Horror after a save
                    </label>
                  )}
                  {state.power === "snitches" &&
                    last?.mortAction?.kind === "clue" && (
                      <p>
                        Roll for Snitches Get Stitches. On 1–4, kill one newly
                        placed Informant and record it here.
                      </p>
                    )}
                </section>
              </div>
            </>
          )}
          <div className="mort-actions mort-reveal-actions">
            <button
              type="button"
              className={state.clues.length === 5 ? "mort-primary" : ""}
              disabled={Boolean(state.active)}
              onClick={() => setReveal(!reveal)}
            >
              {state.clues.length === 5
                ? "Confirm disguise"
                : "Terror deck exhausted"}
            </button>
          </div>
          {reveal && (
            <RevealEditor
              state={state}
              commit={commit}
              blocked={blocked}
              onClose={() => setReveal(false)}
            />
          )}
        </>
      )}
      {!state.reveal &&
        !state.powerRevealed &&
        bloodlust !== undefined &&
        bloodlust >= 4 && (
          <p className="mort-preview" role="status">
            Reveal the Dark Power on the tabletop, then record it below.
          </p>
        )}
      {!state.reveal &&
        last?.mortAction?.kind !== "clue" &&
        last?.mortAction?.kind !== "exclude" &&
        undoButton}
      {!state.reveal && state.known && (
        <details className="mort-secondary">
          <summary>
            Minor Dark Powers
            {state.minors.length ? ` · ${state.minors.length} active` : ""}
          </summary>
          <div className="mort-power-grid">
            {MORT_MINORS.map((minor) => (
              <button
                key={minor.id}
                className="mort-power-choice"
                type="button"
                aria-pressed={state.minors.includes(minor.id)}
                onClick={() =>
                  commit({
                    kind: "minor",
                    minor: minor.id,
                    active: !state.minors.includes(minor.id),
                  })
                }
              >
                <img src={mortPhoto(minor.id)} alt="" />
                <span>
                  {minor.name}
                  <small>
                    {state.minors.includes(minor.id)
                      ? "Active · click to discard"
                      : "Record revealed power"}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </details>
      )}
      <details className="mort-secondary" data-module-control="reveals">
        <summary>
          Dark Power
          {state.power
            ? ` · ${MORT_POWERS.find((p) => p.id === state.power)?.name}`
            : ""}
        </summary>
        <MortPowerPicker events={events} onEvent={onEvent} blocked={blocked} />
      </details>
      {!state.reveal && bloodlust !== undefined && (
        <p className="mort-quiet">
          Attack {MORT_ATTACK[bloodlust]} · Movement {MORT_MOVE[bloodlust]}
          {state.horrorToken ? " · Horror overflow costs Time" : ""}
        </p>
      )}
    </fieldset>
  );
}

export function MortLocationMinor({
  killer,
  location,
  events,
  onEvent,
  blocked,
  children,
  name,
}: Pick<
  ControlsProps,
  "killer" | "location" | "events" | "onEvent" | "blocked"
> & { name: string; children: React.ReactNode }) {
  const entries = summarizePlay(events).entries;
  const state = mortState(entries);
  const { record, message } = useModuleRecord(events, onEvent);
  if (killer !== MORT || state.reveal) return <>{children}</>;
  const active = state.locationMinor === location;
  return (
    <div className="mort-play">
      <p>
        {active
          ? "In play · no Health markers while Mort is disguised"
          : "Not recorded in play"}
      </p>
      <button
        disabled={blocked}
        type="button"
        onClick={() =>
          record(
            mortEvent(
              { kind: "location-minor", location, active: !active },
              entries,
            ),
          )
        }
      >
        {active ? `Discard ${name}` : `Reveal ${name}`}
      </button>
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
