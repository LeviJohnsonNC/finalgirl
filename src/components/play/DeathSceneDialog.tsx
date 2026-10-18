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
          save();
          onClose();
        }
      }}
    >
      <DialogContent
        className="play-death-modal"
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
                ["killer", Skull],
                ["minion", Ghost],
                ["terror", Clapperboard],
                ["event", Flame],
                ["hazard", MapPin],
                ["other", HelpCircle],
              ] as const
            ).map(([cause, Icon]) => (
              <button
                key={cause}
                aria-pressed={values.cause === cause}
                onClick={() =>
                  setValues((previous) =>
                    detailsForCause({ ...previous, cause }, selection.killer),
                  )
                }
              >
                <Icon size={20} />
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
                value={values.victim ?? ""}
                onChange={(v) => update("victim", v)}
                options={
                  selection.location === "Buddyland"
                    ? SPECIAL_VICTIMS.map((v) => v.name)
                    : []
                }
                placeholder="Anonymous victim"
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
        {selected && !dirty && (
          <section
            aria-label="Generated death scene"
            className="mt-4 space-y-3"
          >
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
              disabled={
                scenes.busy ||
                !scenes.signedIn ||
                values.cause === "unspecified"
              }
              onClick={() => void generate(0)}
            >
              {scenes.busy ? "Creating scene…" : "Gruesome Death · uses AI"}
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
                {scenes.busy ? "Creating scene…" : "Another take · uses AI"}
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
        </div>
        {!scenes.signedIn && (
          <p className="play-card-note">
            Sign in to develop scenes. Recording and saving details still work.
          </p>
        )}
        <p role="status" className="play-card-note">
          {scenes.error || message}
        </p>
      </DialogContent>
    </Dialog>
  );
}
