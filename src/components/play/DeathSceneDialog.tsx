import { GRIMLASH_TERRORS } from '@/lib/play/grimlash';
import { grimlashArt } from './grimlashArt';
import { useActiveImages } from '@/hooks/useActiveImages';
import { evomorphStageArt } from './evomorphArt';
import geppettoPuppets from '@/assets/play/geppetto/puppets.webp';
import { ModuleArtwork } from './ModuleArtwork';
import causeKiller from "@/assets/play/cause-killer.webp";
import causeMinion from "@/assets/play/cause-minion.webp";
import causeTerror from "@/assets/play/cause-terror.webp";
import causeEvent from "@/assets/play/cause-event.webp";
import causeHazard from "@/assets/play/cause-hazard.webp";
import causeOther from "@/assets/play/cause-other.webp";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PlaySearch } from "./PlaySearch";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DeathNarration } from "./DeathNarration";
import { getFilmIdByLocation } from "@/types/gameData";
import { getFilmDetails } from "@/types/featureFilmDetails";
import {
  newPlayEvent,
  type PlayEvent,
  type PlayDetails,
} from "@/lib/play/events";

import {
  deathFacts,
  deathSignature,
  deathSignatures,
  deathCauseLabels,
  detailsForCause,
  isCompleteDeathText,
  type DeathSelection,
} from "@/lib/play/death";
import {
  applicablePlayCards,
  findPlayCard,
  PLAY_ROOMS,
  playMechanisms,
} from "@/lib/play/catalog";
import { useDeathScenes } from "@/hooks/play/useDeathScenes";
import { playVictims } from "@/lib/play/catalog";
import { BUDDIES } from "@/lib/play/modules";
interface Props {
  sessionId: string;
  selection: DeathSelection;
  events: PlayEvent[];
  getEvents?: () => PlayEvent[];
  eventId: string;
  onClose: () => void;
  onEvent: (e: PlayEvent) => boolean;
  syncNow: () => Promise<boolean>;
  draft?: PlayDetails;
  onDraft: (id: string, draft: PlayDetails) => boolean;
}
/** The kill is already recorded; dismissing only closes its optional editor. */
export function DeathSceneDialog({
  sessionId,
  selection,
  events,
  getEvents,
  eventId,
  onClose,
  onEvent,
  syncNow,
  draft,
  onDraft,
}: Props) {
  const {characterImages}=useActiveImages();
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
  // Opening an older record must not rewrite its facts or invalidate cached takes.
  // Cause changes below explicitly clear fields that no longer apply.
  const [values, setValues] = useState<PlayDetails>(() => ({
    ...initial,
    ...draft,
  }));
  const [signatures, setSignatures] = useState<string[]>([]);
  const [take, setTake] = useState(0);
  const [requested, setRequested] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const payoff = useRef<HTMLElement>(null);
  const [message, setMessage] = useState("");
  const [resultError, setResultError] = useState("");
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
    setSignatures([]);
    if (facts)
      void deathSignatures(facts).then((value) => {
        if (live) setSignatures(value);
      });
    return () => {
      live = false;
    };
  }, [serialized]); // eslint-disable-line react-hooks/exhaustive-deps
  const signature = signatures[0];
  const currentScenes = scenes.rows.filter(r => r.event_id === eventId && r.signature === signature);
  // Reopening old scenes is free. The primary action explicitly writes the new
  // portrayal, with its own three slots, without deleting old text or audio.
  const currentTakes = currentScenes.filter(r => isCompleteDeathText(r.scene_text));
  const displaySignature = currentTakes.length ? signature : (signatures.find(sig => scenes.rows.some(r => r.event_id === eventId && r.signature === sig && isCompleteDeathText(r.scene_text))) ?? signature);
  const legacyPortrayal = Boolean(displaySignature && signature && displaySignature !== signature);
  const matchingScenes = scenes.rows
    .filter((r) => r.event_id === eventId && r.signature === displaySignature)
    .sort((a, b) => a.take - b.take);
  const takes = matchingScenes.filter((r) => isCompleteDeathText(r.scene_text));
  const unfinished = matchingScenes.length > takes.length;
  const selected = takes.find((r) => r.take === take) ?? takes[0];
  const dirty = Object.keys(initial).some(
    (key) =>
      (initial[key as keyof PlayDetails] ?? "") !==
      (values[key as keyof PlayDetails] ?? ""),
  );
  const selectedId = selected?.id;
  useEffect(() => {
    if (selectedId && !dirty && !editingDetails) payoff.current?.focus({ preventScroll: true });
  }, [selectedId, dirty, editingDetails]);
  const reading = !editingDetails && !dirty && Boolean(selected || scenes.busy || requested || unfinished);
  const hasStory = Boolean(selected && !dirty);
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
      setMessage("");
    } else setMessage("Details could not be saved. Please try again.");
    return ok;
  };
  const generate = async (next: number) => {
    setResultError("");
    if (save()) {
      setRequested(true);
      setTake(next);
      setEditingDetails(false);
      const clean = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ]),
      ) as PlayDetails;
      const expected = deathFacts(
        selection,
        [
          ...(getEvents?.() ?? events),
          newPlayEvent({ kind: "details", target: eventId, ...clean }),
        ],
        eventId,
      );
      const response = await scenes.generate(eventId, next, selection.killer === "Dr. Fright" ? "fright-private-nightmares-v1" : undefined);
      if (
        response &&
        expected &&
        response.signature !== (await deathSignature(expected))
      ) {
        setResultError(
          "A story was returned for different saved details. Close and reopen this death to load its saved story before trying again.",
        );
      }
    }
  };
  const changeCount = (delta: 1 | -1) => {
    if (onEvent(newPlayEvent({kind: "death-count", target: eventId, delta}))) {
      setMessage("");
      setResultError("");
      setRequested(false);
      setTake(0);
    } else setMessage("The victim count could not be changed. Please try again.");
  };
  const generateNext = () => void generate(
    !dirty
      ? ([0, 1, 2].find(next => !currentTakes.some(r => r.take === next)) ?? 2)
      : 0,
  );
  const cancel = () => {
    // Keep the recorded death and any already saved/generated facts, discard this edit.
    if (onDraft(eventId, initial)) onClose();
    else setMessage("The edit could not be discarded. Please try again.");
  };
  if (!facts) return null;
  const update = (field: keyof PlayDetails, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));
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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          cancel();
        }
      }}
    >
      <DialogContent
        className="play-death-modal play-death-modal--illustrated play-death-modal--compact"
        data-reading={reading}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document
            .getElementById("play-cause-first")
            ?.focus({ preventScroll: true });
        }}
      >
        <div className="play-death-heading">
          <p className="play-eyebrow">
            {facts.quantity === 1 ? "ONE LESS SOUL" : `${facts.quantity} SOULS LOST`} / ROUND {facts.round ?? "?"}
          </p>
          <DialogTitle>Gruesome Death</DialogTitle>
          <DialogDescription>
            {reading ? "" : "Add details, or return to the game."}
          </DialogDescription>
        </div>
        <div className="play-death-body" data-mode={reading ? "reading" : "editing"}>
          {reading ? (
            <div className="play-death-context">
              <p><strong>{facts.quantity} {facts.quantity === 1 ? "victim" : "victims"}</strong> · {deathCauseLabels[facts.cause]}{facts.room ? ` · ${facts.room}` : ""}</p>
              <button className="play-death-edit" disabled={scenes.busy} onClick={() => {
                setEditingDetails(true);
                requestAnimationFrame(() => document.getElementById("play-cause-first")?.focus({ preventScroll: true }));
              }}>Edit death details</button>
            </div>
          ) : <div className="play-cause-section" id="play-cause-first" tabIndex={-1}>
            <div className="play-death-section-heading">
              <h3>What caused it?</h3>
              {editingDetails && selected && !dirty && <button className="play-death-edit" onClick={() => setEditingDetails(false)}>Read scene</button>}
            </div>
            <div className="play-death-count" role="group" aria-label="Victims in this death">
              <span>Victims</span>
              <button aria-label="Remove one victim from this death" disabled={scenes.busy || facts.quantity <= 1} onClick={() => changeCount(-1)}>−</button>
              <output aria-live="polite" aria-label="Victim count">{facts.quantity}</output>
              <button aria-label="Add one victim to this death" disabled={scenes.busy || facts.quantity >= 50} onClick={() => changeCount(1)}>+</button>
              <span className="sr-only">Count changes are recorded immediately and can be undone in the timeline.</span>
            </div>
            <div
              className="play-cause-choices"
              role="group"
              aria-label="Cause of death"
            >
              {(
                [
                  ["killer", causeKiller],
                  ["terror", causeTerror],
                  ["event", causeEvent],
                  ["minion", causeMinion],
                  ["hazard", causeHazard],
                  ["other", causeOther],
                ] as const
              ).map(([cause, art]) => (
                <button
                  key={cause}
                  className={`play-cause-tile play-cause-tile--${cause}`}
                  aria-pressed={values.cause === cause}
                  disabled={scenes.busy}
                  onClick={() => {
                    if (values.cause !== cause) {
                      setValues((previous) => detailsForCause({ ...previous, cause }, selection.killer));
                      setEditingDetails(true);
                      setRequested(false);
                      setResultError("");
                    }
                  }}
                >
                  {cause==='killer'&&selection.killer==='Grimlash'?<img src={characterImages.Grimlash} alt="" style={{objectPosition:'50% 0%'}}/>:cause==='terror'&&selection.killer==='Grimlash'&&GRIMLASH_TERRORS.some(c=>c.name===values.terrorCard)?<ModuleArtwork art={grimlashArt(GRIMLASH_TERRORS.find(c=>c.name===values.terrorCard)!.id)}/>:cause === 'minion' && selection.killer === 'Geppetto'
                    ? <ModuleArtwork className="geppetto-cause-art" art={{src:geppettoPuppets,atlas:{width:1254,height:1254,x:421,y:3,cellWidth:412,cellHeight:412}}}/>
                    : cause === 'killer' && selection.killer === 'Evomorph'
                      ? <ModuleArtwork art={evomorphStageArt(facts?.moduleContext?.evomorph?.stage)} />
                      : <img src={art} alt="" />}
                  <span>{cause === 'minion' && selection.killer === 'Geppetto' ? 'Puppet / minion' : deathCauseLabels[cause]}</span>
                </button>
              ))}
            </div>
          </div>}
          {!reading && values.cause !== "unspecified" && (
            <div className="play-death-fields">
              {values.cause === "minion" && (
                <label>
                  Who attacked?
                  <PlaySearch
                    label="Death attacker"
                    value={values.attacker ?? ""}
                    onChange={(v) => update("attacker", v)}
                    options={
                      selection.killer === "Billy the Bear"
                        ? BUDDIES.map((b) => b.name)
                        : selection.killer === "Geppetto" ? ["Puppet", "Puppet 1", "Puppet 2", "Puppet 3"] : selection.killer === "Poltergeist" ? ["Behemoth","Clown Doll"] : []
                    }
                    placeholder={selection.killer === "Geppetto" ? "Choose a Puppet or enter a minion" : "Choose a Buddy or enter a minion"}
                  />
                </label>
              )}
              {values.cause === "terror" && (
                <label>
                  Terror card
                  <PlaySearch
                    label="Terror card"
                    value={values.terrorCard ?? ""}
                    onChange={(v) => update("terrorCard", v)}
                    options={applicablePlayCards(selection, "terror").map(
                      (c) => c.name,
                    )}
                    placeholder="Choose or enter a Terror card"
                  />
                </label>
              )}
              {values.cause === "event" && (
                <label>
                  Event
                  <PlaySearch
                    label="Death event card"
                    value={values.eventCard ?? ""}
                    onChange={(v) => update("eventCard", v)}
                    options={eventNames}
                    placeholder="Choose or enter an Event"
                  />
                </label>
              )}
              {(values.cause === "hazard" || values.cause === "other") && (
                <label>
                  How did it happen?
                  <PlaySearch
                    label="Death mechanism"
                    value={values.mechanism ?? ""}
                    onChange={(v) => update("mechanism", v)}
                    options={playMechanisms(selection)}
                    placeholder="Choose or describe the cause"
                  />
                </label>
              )}
              <label>
                Where?
                <PlaySearch
                  label="Death location"
                  value={values.room ?? ""}
                  onChange={(v) => update("room", v)}
                  options={PLAY_ROOMS[selection.location] ?? []}
                  placeholder="Room or board space"
                />
              </label>
              <label>
                {facts.quantity > 1 ? "Victims / group" : "Victim"}
                <PlaySearch
                  label="Victim name or role"
                  value={values.victim || "Regular victim"}
                  onChange={(v) =>
                    update("victim", v === "Regular victim" ? "" : v)
                  }
                  options={[
                    "Regular victim",
                    ...playVictims(selection.location).map(v => v.name),
                  ]}
                  placeholder={facts.quantity > 1 ? "Names or a group description" : "Regular victim"}
                />
              </label>
              <label className="play-death-note">
                Anything else?
                <textarea
                  aria-label="Death context"
                  value={values.text ?? ""}
                  onChange={(e) => update("text", e.target.value)}
                  maxLength={240}
                  placeholder="A detail worth remembering…"
                />
              </label>
            </div>
          )}
          {((!editingDetails && (requested || selected || unfinished)) || scenes.error || resultError) && (
            <section
              ref={payoff}
              className="play-death-payoff"
              aria-label="Death scene result"
              tabIndex={-1}
              aria-busy={scenes.busy}
            >
              {scenes.busy ? (
                <div className="play-death-loading" role="status">
                  <LoaderCircle size={25} className="animate-spin" />
                  <div>
                    <h3>The last thing they saw…</h3>
                    <p>Developing this moment into a story.</p>
                  </div>
                </div>
              ) : selected && !dirty ? (
                <section aria-label="Generated death scene">
                  <div className="play-death-story-heading">
                    <h3>The last thing they saw</h3>
                    {currentTakes.length < 3 && (
                      <button
                        className="play-death-edit play-death-alternate"
                        aria-label={legacyPortrayal ? "Rewrite death" : "Another version"}
                        title={legacyPortrayal ? "Rewrite death" : "Another version"}
                        disabled={scenes.busy || !signature}
                        onClick={generateNext}
                      >
                        <RefreshCw size={16} aria-hidden="true" />
                        <span>{legacyPortrayal ? "Rewrite death" : "Another version"}</span>
                      </button>
                    )}
                    <DeathNarration key={selected.id} scene={selected} filmId={getFilmIdByLocation(selection.location)} />
                  </div>
                  <div className="play-death-prose-scroll" role="region" aria-label="Death scene text" tabIndex={0}>
                  {selected.scene_text
                    .split(/\n\s*\n/)
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index} className="play-death-prose">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <div className="play-death-story-tools">
                    {takes.length > 1 && (
                      <div role="group" aria-label="Death scene takes">
                        {takes.map((scene) => (
                          <button
                            key={scene.id}
                            aria-pressed={selected.id === scene.id}
                            onClick={() => setTake(scene.take)}
                          >
                            Version {scene.take + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              ) : (
                <p role="status">
                  {scenes.error ||
                    resultError ||
                    (unfinished
                      ? "This saved scene was cut short. Use Gruesome Death to write it again."
                      : "") ||
                    "Your details are saved. Create a gruesome death when you’re ready."}
                </p>
              )}
              {!scenes.busy && scenes.error && selected && !dirty && (
                <p role="alert">{scenes.error}</p>
              )}
              {!scenes.busy && resultError && selected && !dirty && (
                <p role="alert">{resultError}</p>
              )}
              {!scenes.busy && selected && !dirty && currentTakes.length >= 3 && (
                <p className="play-card-note">
                  Three versions are saved for this death.
                </p>
              )}
            </section>
          )}
          {!scenes.signedIn && (
            <p className="play-card-note">Sign in to generate a gruesome death. You can still record and save details.</p>
          )}
        </div>
        <div className="play-death-footer">
        {message && <p className="play-death-save-error" role="alert">{message}</p>}
        <div className="play-death-actions" data-complete={hasStory}>
          <button onClick={cancel}>Cancel</button>
          <button
            className={hasStory ? "play-gruesome-action" : undefined}
            onClick={() => {
              if (save()) onClose();
            }}
          >
            Save and exit
          </button>
          {!hasStory && <button
            className="play-gruesome-action"
            disabled={scenes.busy || !signature || (!dirty && currentTakes.length >= 3)}
            onClick={generateNext}
          >
            {scenes.busy ? "Writing the death…" : legacyPortrayal && !dirty ? "Rewrite death" : "Gruesome Death"}
          </button>}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
