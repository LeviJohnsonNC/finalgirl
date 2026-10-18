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
import {
  Skull,
  Ghost,
  Flame,
  Clapperboard,
  MapPin,
  HelpCircle,
  LoaderCircle,
  BookOpen,
} from "lucide-react";
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
  deathCauseLabels,
  detailsForCause,
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
/** The kill is already recorded; dismissing only closes its optional editor. */
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
  // Opening an older record must not rewrite its facts or invalidate cached takes.
  // Cause changes below explicitly clear fields that no longer apply.
  const [values, setValues] = useState<PlayDetails>(() => ({
    ...initial,
    ...draft,
  }));
  const [signature, setSignature] = useState("");
  const [take, setTake] = useState(0);
  const [requested, setRequested] = useState(false);
  const payoff = useRef<HTMLElement>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(revealTimer.current), []);
  const revealPayoff = () => {
    clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(
      () =>
        payoff.current?.scrollIntoView({
          block: "nearest",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        }),
      80,
    );
  };
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
  const dirty = Object.keys(initial).some(
    (key) =>
      (initial[key as keyof PlayDetails] ?? "") !==
      (values[key as keyof PlayDetails] ?? ""),
  );
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
    setRequested(true);
    if (save()) {
      setTake(next);
      revealPayoff();
      await scenes.generate(eventId, next);
      revealPayoff();
    } else revealPayoff();
  };
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
        className="play-death-modal play-death-modal--illustrated"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document
            .getElementById("play-cause-first")
            ?.focus({ preventScroll: true });
        }}
      >
        <div className="play-death-heading">
          <p className="play-eyebrow">
            ONE LESS SOUL / ROUND {facts.round ?? "?"}
          </p>
          <DialogTitle>Gruesome Death</DialogTitle>
          <DialogDescription>
            The death is recorded. Add what you know, or return to the game.
          </DialogDescription>
        </div>
        <div className="play-cause-section" id="play-cause-first" tabIndex={-1}>
          <h3>What caused it?</h3>
          <div
            className="play-cause-choices"
            role="group"
            aria-label="Cause of death"
          >
            {(
              [
                ["killer", Skull, causeKiller],
                ["minion", Ghost, causeMinion],
                ["terror", Clapperboard, causeTerror],
                ["event", Flame, causeEvent],
                ["hazard", MapPin, causeHazard],
                ["other", HelpCircle, causeOther],
              ] as const
            ).map(([cause, Icon, art]) => (
              <button
                key={cause}
                className={`play-cause-tile play-cause-tile--${cause}`}
                aria-pressed={values.cause === cause}
                onClick={() =>
                  setValues((previous) =>
                    detailsForCause({ ...previous, cause }, selection.killer),
                  )
                }
              >
                <img src={art} alt="" />
                <Icon size={22} aria-hidden="true" />
                <span>{deathCauseLabels[cause]}</span>
              </button>
            ))}
          </div>
        </div>
        {values.cause !== "unspecified" && (
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
                      : []
                  }
                  placeholder="Choose a Buddy or enter a minion"
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
              Where? <span>Optional</span>
              <PlaySearch
                label="Death location"
                value={values.room ?? ""}
                onChange={(v) => update("room", v)}
                options={PLAY_ROOMS[selection.location] ?? []}
                placeholder="Room or board space"
              />
            </label>
            <label>
              Victim <span>Optional</span>
              <PlaySearch
                label="Victim name or role"
                value={values.victim || "Regular victim"}
                onChange={(v) =>
                  update("victim", v === "Regular victim" ? "" : v)
                }
                options={[
                  "Regular victim",
                  ...(selection.location === "Buddyland"
                    ? SPECIAL_VICTIMS.map((v) => v.name)
                    : []),
                ]}
                placeholder="Regular victim"
              />
            </label>
            <label className="play-death-note">
              Anything else? <span>Optional</span>
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
        {(requested || selected || scenes.error || message) && (
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
                  <p>
                    Developing this moment into a story. Your death is saved.
                  </p>
                </div>
              </div>
            ) : selected && !dirty ? (
              <section aria-label="Generated death scene">
                <div className="play-death-story-heading">
                  <BookOpen size={18} />
                  <h3>The last thing they saw</h3>
                  <span>TAKE {selected.take + 1}</span>
                </div>
                {selected.scene_text
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index} className="play-death-prose">
                      {paragraph}
                    </p>
                  ))}
                <div className="play-death-story-tools">
                  <DeathNarration
                    key={selected.id}
                    scene={selected}
                    filmId={getFilmIdByLocation(selection.location)}
                  />
                  {takes.length > 1 && (
                    <div role="group" aria-label="Death scene takes">
                      {takes.map((scene) => (
                        <button
                          key={scene.id}
                          aria-pressed={selected.id === scene.id}
                          onClick={() => setTake(scene.take)}
                        >
                          Take {scene.take + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <p role="status">
                {scenes.error ||
                  message ||
                  "Your details are saved. Create a gruesome death when you’re ready."}
              </p>
            )}
            {!scenes.busy && scenes.error && selected && !dirty && (
              <p role="alert">{scenes.error}</p>
            )}
            {!scenes.busy && selected && !dirty && takes.length >= 3 && (
              <p className="play-card-note">
                All three takes are saved for this death.
              </p>
            )}
          </section>
        )}
        <div className="play-death-actions">
          <button onClick={cancel}>Cancel</button>
          <button
            onClick={() => {
              if (save()) onClose();
            }}
          >
            Save and exit
          </button>
          <button
            className="play-gruesome-action"
            disabled={scenes.busy || (!dirty && takes.length >= 3)}
            onClick={() =>
              void generate(
                selected && !dirty
                  ? Math.min(2, Math.max(...takes.map((r) => r.take)) + 1)
                  : 0,
              )
            }
          >
            {scenes.busy ? "Writing the death…" : "Gruesome Death"}
          </button>
        </div>
        {!scenes.signedIn && (
          <p className="play-card-note">
            Sign in to generate a gruesome death. You can still record and save
            details.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
