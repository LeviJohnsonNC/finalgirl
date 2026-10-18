import { useEffect, useRef, useState } from "react";
import { DeathNarration } from "./DeathNarration";
import { getFilmIdByLocation } from "@/types/gameData";
import { getFilmDetails } from "@/types/featureFilmDetails";
import {
  newPlayEvent,
  type PlayEvent,
  type PlayDetails,
  type DeathCause,
} from "@/lib/play/events";
import { DEATH_CAUSES } from "@/lib/play/events";
import {
  deathFacts,
  deathSignature,
  deathCauseLabels,
  type DeathSelection,
} from "@/lib/play/death";
import {
  applicablePlayCards,
  findPlayCard,
  PLAY_ROOMS,
  playMechanisms,
} from "@/lib/play/catalog";
import { useDeathScenes } from "@/hooks/play/useDeathScenes";
import { BUDDIES, SPECIAL_VICTIMS } from "@/lib/play/modules";
interface Props {
  sessionId: string;
  selection: DeathSelection;
  events: PlayEvent[];
  eventId: string;
  onClose: () => void;
  onEvent: (e: PlayEvent) => boolean;
  syncNow: () => Promise<boolean>;
  draft?: PlayDetails;
  onDraft: (id: string, draft: PlayDetails) => boolean;
}
/** Kept under the existing export name so saved-scene callers remain stable.
 * The editor now lives inline; recording another victim never blocks on it. */
export function DeathSceneDialog({
  sessionId,
  selection,
  events,
  eventId,
  onClose,
  onEvent,
  syncNow,
  draft,
  onDraft,
}: Props) {
  const facts = deathFacts(selection, events, eventId);
  const initial: PlayDetails = {
    room: facts?.room ?? "",
    cause: facts?.cause ?? "unspecified",
    victim: facts?.victim ?? "",
    text: facts?.note ?? "",
    mechanism: facts?.mechanism ?? "",
    terrorCard: facts?.terrorCard ?? "",
    eventCard: facts?.eventCard ?? "",
    attacker: facts?.attacker ?? "",
  };
  const [values, setValues] = useState<PlayDetails>(() => ({
    ...initial,
    ...draft,
  }));
  const [signature, setSignature] = useState("");
  const [take, setTake] = useState(0);
  const [message, setMessage] = useState("");
  const scenes = useDeathScenes(sessionId, syncNow);
  const serialized = JSON.stringify(facts);
  const saved = useRef(JSON.stringify(initial));
  const persist = useRef(onDraft);
  persist.current = onDraft;
  const draftText = JSON.stringify(values);
  useEffect(() => {
    if (!persist.current(eventId, values))
      setMessage(
        "The draft could not be saved. Keep this page open and try again.",
      );
  }, [eventId, draftText]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let live = true;
    setSignature("");
    if (facts)
      void deathSignature(facts).then((value) => {
        if (live) setSignature(value);
      });
    return () => {
      live = false;
    };
  }, [serialized]); // eslint-disable-line react-hooks/exhaustive-deps
  const takes = scenes.rows
    .filter((r) => r.event_id === eventId && r.signature === signature)
    .sort((a, b) => a.take - b.take);
  const selected = takes.find((r) => r.take === take) ?? takes[0];
  const dirty = JSON.stringify(initial) !== draftText;
  const save = () => {
    const clean = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    ) as PlayDetails;
    const text = JSON.stringify(clean);
    if (saved.current === text) return true;
    const ok = onEvent(
      newPlayEvent({ kind: "details", target: eventId, ...clean }),
    );
    if (ok) {
      saved.current = text;
      setValues(clean);
      setMessage("Details saved.");
    } else setMessage("Details could not be saved. Please try again.");
    return ok;
  };
  const generate = async (next: number) => {
    if (save()) {
      setTake(next);
      await scenes.generate(eventId, next);
    }
  };
  if (!facts) return null;
  const update = (field: keyof PlayDetails, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));
  const cardNote = (kind: "terror" | "event", name?: string) => {
    if (!name) return null;
    const card = findPlayCard(selection, kind, name);
    return (
      <span className="play-card-note">
        {card?.effect ?? "Effect not verified. Add what happened below."}
        {card && /^https?:\/\//.test(card.source) && (
          <>
            {" "}
            <a href={card.source} target="_blank" rel="noopener noreferrer">
              Source
            </a>
          </>
        )}
        {card && !/^https?:\/\//.test(card.source) && (
          <> Source: {card.source}.</>
        )}
      </span>
    );
  };
  const catalogEvents = applicablePlayCards(selection, "event");
  // Legacy location data supplies names only. Unverified descriptions never become rules.
  const legacyEvents =
    getFilmDetails(getFilmIdByLocation(selection.location) ?? "")?.location
      ?.events ?? [];
  const eventNames = Array.from(
    new Set([
      ...catalogEvents.map((c) => c.name),
      ...legacyEvents
        .filter((c) => !findPlayCard(selection, "event", c.name))
        .map((c) => c.name),
    ]),
  );
  return (
    <section
      className="play-panel play-death-editor"
      aria-label="Death details"
      onBlurCapture={save}
    >
      <h2>
        The last thing they saw{" "}
        <span>
          Round {facts.round ?? "?"} / {facts.quantity} recorded
        </span>
      </h2>
      <p className="play-card-note">
        The death is recorded. Every detail is optional; keep playing whenever
        you like.
      </p>
      <div className="play-death-fields">
        <label>
          Who or what attacked?
          <input
            aria-label="Death attacker"
            maxLength={120}
            list="play-attacker-options"
            value={values.attacker ?? ""}
            onChange={(e) => update("attacker", e.target.value)}
            placeholder="Optional, leave blank for a hazard"
          />
          <datalist id="play-attacker-options">
            <option value={selection.killer} />
            {selection.killer === "Billy the Bear" &&
              BUDDIES.map((b) => <option key={b.id} value={b.name} />)}
          </datalist>
        </label>
        <label>
          Where?
          <input
            aria-label="Death location"
            value={values.room ?? ""}
            onChange={(e) => update("room", e.target.value)}
            maxLength={120}
            list="play-room-options"
            placeholder="Room or board space"
          />
          <datalist id="play-room-options">
            {(PLAY_ROOMS[selection.location] ?? []).map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label>
          Cause
          <select
            aria-label="Cause of death"
            value={values.cause ?? "unspecified"}
            onChange={(e) => update("cause", e.target.value as DeathCause)}
          >
            {DEATH_CAUSES.map((cause) => (
              <option key={cause} value={cause}>
                {deathCauseLabels[cause]}
              </option>
            ))}
          </select>
        </label>
        <label>
          How?
          <input
            aria-label="Death mechanism"
            value={values.mechanism ?? ""}
            onChange={(e) => update("mechanism", e.target.value)}
            maxLength={120}
            list="play-mechanism-options"
            placeholder="Attack, form or hazard"
          />
          <datalist id="play-mechanism-options">
            {playMechanisms(selection).map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label>
          Victim name or role
          <input
            aria-label="Victim name or role"
            value={values.victim ?? ""}
            onChange={(e) => update("victim", e.target.value)}
            maxLength={120}
            list={
              selection.location === "Buddyland"
                ? "play-victim-options"
                : undefined
            }
            placeholder="Anonymous victim"
          />
          {selection.location === "Buddyland" && (
            <datalist id="play-victim-options">
              {SPECIAL_VICTIMS.map((v) => (
                <option key={v.id} value={v.name} />
              ))}
            </datalist>
          )}
        </label>
        <label>
          Terror card
          <input
            aria-label="Terror card"
            value={values.terrorCard ?? ""}
            onChange={(e) => update("terrorCard", e.target.value)}
            maxLength={160}
            list="play-terror-options"
            placeholder="Search or enter a card"
          />
          <datalist id="play-terror-options">
            {applicablePlayCards(selection, "terror").map((card) => (
              <option key={card.name} value={card.name} />
            ))}
          </datalist>
          {cardNote("terror", values.terrorCard)}
        </label>
        <label>
          Event
          <input
            aria-label="Death event card"
            value={values.eventCard ?? ""}
            onChange={(e) => update("eventCard", e.target.value)}
            maxLength={160}
            list="play-event-options"
            placeholder="Event affecting this death"
          />
          <datalist id="play-event-options">
            {eventNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {cardNote("event", values.eventCard)}
        </label>
        <label>
          What happened?
          <textarea
            aria-label="Death context"
            value={values.text ?? ""}
            onChange={(e) => update("text", e.target.value)}
            maxLength={240}
            placeholder="Optional observation or card effect"
          />
        </label>
      </div>
      {selected && !dirty && (
        <section aria-label="Generated death scene" className="mt-4 space-y-3">
          <p className="type-caption">TAKE {selected.take + 1}</p>
          <p className="type-body leading-relaxed">{selected.scene_text}</p>
          <DeathNarration
            key={selected.id}
            scene={selected}
            filmId={getFilmIdByLocation(selection.location)}
          />
        </section>
      )}
      <div className="play-death-actions">
        <button
          onClick={() => {
            if (save()) onClose();
          }}
        >
          Back to the game
        </button>
        {!selected || dirty ? (
          <button
            disabled={scenes.busy || !scenes.signedIn}
            onClick={() => void generate(0)}
          >
            {scenes.busy
              ? "Developing scene…"
              : "Develop death scene · uses AI"}
          </button>
        ) : (
          Math.max(...takes.map((r) => r.take)) < 2 && (
            <button
              disabled={scenes.busy}
              onClick={() =>
                void generate(
                  Math.min(2, Math.max(...takes.map((r) => r.take)) + 1),
                )
              }
            >
              {scenes.busy ? "Developing scene…" : "Another take · uses AI"}
            </button>
          )
        )}
        {takes.length > 1 &&
          !dirty &&
          takes.map((scene) => (
            <button
              key={scene.id}
              aria-pressed={selected?.id === scene.id}
              onClick={() => setTake(scene.take)}
            >
              Take {scene.take + 1}
            </button>
          ))}
        <button onClick={() => void scenes.refresh()}>
          Check saved scenes
        </button>
      </div>
      {!scenes.signedIn && (
        <p className="play-card-note">
          Sign in to develop scenes. Recording and saving details still work.
        </p>
      )}
      <p role="status" className="play-card-note">
        {scenes.error || message}
      </p>
    </section>
  );
}
