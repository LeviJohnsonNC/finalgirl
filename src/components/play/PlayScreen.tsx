import { playStartingValues } from "@/lib/play/defaults";
import horrorImage from "@/assets/play/horror-eye.webp";
import bloodlustImage from "@/assets/play/bloodlust-stain.webp";
import { useActiveImages } from "@/hooks/useActiveImages";
import { PlaySearch } from "./PlaySearch";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Flag,
  Minus,
  Plus,
  Undo2,
  Volume2,
  ChevronDown,
  Camera,
  UnlockKeyhole,
  Zap,
  HeartPulse,
  RotateCcw,
  Bookmark,
  type LucideIcon,
  Shield,
  Swords,
  KeyRound,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  decrementPlay,
  newPlayEvent,
  summarizePlay,
  STATE_FIELDS,
  type PlayEvent,
  type PlayDetails,
  type StateField,
  type MomentType,
} from "@/lib/play/events";
import { PlayTimeline } from "./PlayTimeline";
import "@/styles/play.css";
import { BUDDYLAND_ITEMS } from "@/lib/play/modules";

export interface PlayScreenProps {
  killer: string;
  location: string;
  finalGirl: string;
  imageUrl: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  onExit: () => void;
  onFinish: (outcome: "won" | "lost") => void;
  onNarrate: () => void;
  narrationBusy: boolean;
  narrationPlaying: boolean;
  hasStory: boolean;
  showDeathDetails: boolean;
  onShowDeathDetails: (enabled: boolean) => void;
  deathPanel?: ReactNode;
  onDeath?: (event: PlayEvent) => void;
  drafts: Record<string, PlayDetails>;
  onDraft: (id: string, draft: PlayDetails) => boolean;
  /** Module controls can be added here without changing the core tracker. */
  moduleControls?: ReactNode;
}
const stateLabels: Record<StateField, string> = {
  finalGirlHealth: "Final Girl health",
  killerHealth: "Killer health",
  finalHorrorLevel: "Horror",
  bloodlust: "Bloodlust",
};
const stateLimits: Record<StateField, number> = {
  finalGirlHealth: 10,
  killerHealth: 20,
  finalHorrorLevel: 7,
  bloodlust: 99,
};
const moments: Array<{
  type: MomentType;
  title: string;
  prompt: string;
  icon: LucideIcon;
}> = [
  {
    type: "item",
    icon: KeyRound,
    title: "Found a weapon or key item",
    prompt: "Which weapon or item?",
  },
  {
    type: "ultimate-unlocked",
    icon: UnlockKeyhole,
    title: "Ultimate unlocked",
    prompt: "Anything to remember?",
  },
  {
    type: "ultimate-used",
    icon: Zap,
    title: "Ultimate used",
    prompt: "What did it change?",
  },
  {
    type: "escape",
    icon: Shield,
    title: "Narrow escape",
    prompt: "How did you escape?",
  },
  {
    type: "turning-point",
    icon: Swords,
    title: "Turned the tables",
    prompt: "What changed?",
  },
  {
    type: "girl-revived",
    icon: HeartPulse,
    title: "Second wind",
    prompt: "How did she come back?",
  },
  {
    type: "killer-revived",
    icon: RotateCcw,
    title: "Back from the dead",
    prompt: "What happened when the killer rose?",
  },
  {
    type: "other",
    icon: Bookmark,
    title: "Other moment",
    prompt: "What happened?",
  },
];
export function PlayScreen(props: PlayScreenProps) {
  const { events, onEvent, killer, location, finalGirl } = props;
  const summary = summarizePlay(events);
  const startingValues = playStartingValues(killer, finalGirl);
  const { characterImages } = useActiveImages();
  const [message, setMessage] = useState("");
  const [finishOpen, setFinishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [momentId, setMomentId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<StateField | null>(null);
  const [stateValue, setStateValue] = useState("");
  const started = useRef(false);
  useEffect(() => {
    if (summary.tracked || started.current) return;
    started.current = true;
    if (
      !onEvent(newPlayEvent({ kind: "start", saved: 0, killed: 0, round: 1 }))
    ) {
      started.current = false;
      setMessage(
        "Tracking could not be saved. Try a counter again after freeing device storage.",
      );
    }
  }, [summary.tracked, onEvent]);
  const commit = (fields: Omit<PlayEvent, "id" | "at">) => {
    const e = newPlayEvent(fields);
    if (!onEvent(e)) {
      setMessage("This change could not be saved. Please try again.");
      return null;
    }
    setMessage("");
    return e;
  };
  const last = [...summary.entries].reverse().find((e) => e.kind !== "start");
  const lastDeath = [...summary.entries]
    .reverse()
    .find((e) => e.kind === "killed");
  const moment = summary.entries.find(
    (e) => e.id === momentId && e.kind === "moment",
  );
  const momentDetail = moment
    ? (props.drafts[moment.id]?.detail ?? moment.detail ?? "")
    : "";
  const saveMoment = () => {
    if (
      moment &&
      momentDetail.trim() !== (moment.detail ?? "") &&
      !commit({
        kind: "details",
        target: moment.id,
        detail: momentDetail.trim(),
      })
    )
      return false;
    return true;
  };
  const pickMoment = (choice: (typeof moments)[number]) => {
    if (!saveMoment()) return;
    const e = commit({
      kind: "moment",
      momentType: choice.type,
      text: choice.title,
    });
    if (e) {
      setMomentId(e.id);
      setMessage(`${choice.title} recorded. Details are optional.`);
    }
  };
  const setState = (field: StateField, value: number | null) => {
    if (
      value !== null &&
      (!Number.isInteger(value) || value < 0 || value > stateLimits[field])
    ) {
      setMessage(`Use a whole number from 0 to ${stateLimits[field]}.`);
      return;
    }
    if (commit({ kind: "state", field, value })) setEditingState(null);
  };
  return (
    <div className="play-screen play-workspace">
      <header className="play-heading">
        <img
          className="play-hero-image"
          src={props.imageUrl}
          alt={`${finalGirl}'s night at ${location}`}
        />
        <div>
          <p className="play-eyebrow">PLAY MODE</p>
          <h1>{location}</h1>
          <p>
            {finalGirl} vs {killer}
          </p>
        </div>
        <nav aria-label="Session actions">
          <button onClick={props.onExit} aria-label="Read story">
            <ArrowLeft size={16} /> Story
          </button>
          {props.hasStory && (
            <button
              onClick={props.onNarrate}
              disabled={props.narrationBusy}
              aria-label={
                props.narrationPlaying
                  ? "Stop introduction"
                  : "Narrate introduction"
              }
            >
              <Volume2 size={16} /> Narrate
            </button>
          )}
          <button
            onClick={() => {
              if (saveMoment()) setFinishOpen(true);
            }}
            aria-label="Finish game"
          >
            <Flag size={16} /> Finish
          </button>
        </nav>
      </header>
      <section className="play-tracking" aria-label="Play controls">
        <div className="play-counters">
          {(["saved", "killed", "round"] as const).map((counter) => {
            const value =
              summary[counter] ??
              (counter === "round" && !summary.tracked ? 1 : 0);
            const increment =
              counter === "round"
                ? "Next round"
                : counter === "saved"
                  ? "Save one victim"
                  : "Record one victim killed";
            const decrement =
              counter === "round" ? "Previous round" : `Decrease ${counter}`;
            return (
              <div
                key={counter}
                className={`play-count play-count--${counter}`}
              >
                <button
                  className="play-count-add"
                  aria-label={increment}
                  disabled={value >= 999}
                  onClick={() =>
                    commit(
                      counter === "round"
                        ? { kind: "round" }
                        : {
                            kind: counter,
                            quantity: 1,
                            ...(counter === "killed" && {
                              cause: "unspecified" as const,
                            }),
                          },
                    )
                  }
                >
                  <span>
                    {counter === "round"
                      ? "Round"
                      : counter === "saved"
                        ? "Victims saved"
                        : "Victims killed"}
                  </span>
                  <strong>
                    {counter === "round" &&
                    summary.tracked &&
                    summary.round === null
                      ? "?"
                      : value}
                  </strong>
                  <Plus size={20} aria-hidden="true" />
                </button>
                <button
                  className="play-count-minus"
                  aria-label={decrement}
                  disabled={
                    summary[counter] === null ||
                    value <= (counter === "round" ? 1 : 0)
                  }
                  onClick={() => {
                    const correction = decrementPlay(events, counter);
                    if (correction) commit(correction);
                  }}
                >
                  <Minus size={17} aria-hidden="true" />
                </button>
                {counter === "killed" && (
                  <label className="play-death-toggle">
                    <input
                      type="checkbox"
                      checked={props.showDeathDetails}
                      onChange={(e) =>
                        props.onShowDeathDetails(e.target.checked)
                      }
                    />{" "}
                    Death details
                  </label>
                )}
              </div>
            );
          })}
        </div>
        <div className="play-tracking-tools">
          <button
            aria-label="Undo"
            disabled={!last}
            onClick={() => last && commit({ kind: "undo", target: last.id })}
          >
            <Undo2 size={15} /> Undo last action
          </button>
          {lastDeath && (
            <button
              aria-label="Latest death scene"
              onClick={() => props.onDeath?.(lastDeath)}
            >
              Latest death details
            </button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          Victims saved: {summary.saved ?? 0}. Victims killed:{" "}
          {summary.killed ?? 0}. Round: {summary.round ?? "unrecorded"}.
        </p>
      </section>
      <section
        className="play-panel play-track-more"
        aria-label="Optional trackers"
      >
        <h2>
          Track more <span>OPTIONAL</span>
        </h2>
        <div className="play-state-grid">
          {STATE_FIELDS.map((field) => {
            const value = summary[field];
            return (
              <div key={field} className={`play-state play-state--${field}`}>
                {(field === "finalGirlHealth" || field === "killerHealth") &&
                  characterImages[
                    field === "finalGirlHealth" ? finalGirl : killer
                  ] && (
                    <img
                      className="play-stat-portrait"
                      alt=""
                      src={
                        characterImages[
                          field === "finalGirlHealth" ? finalGirl : killer
                        ]
                      }
                    />
                  )}
                {field === "finalHorrorLevel" && (
                  <img
                    className="play-stat-portrait play-stat-art"
                    src={horrorImage}
                    alt=""
                  />
                )}
                {field === "bloodlust" && (
                  <img
                    className="play-stat-portrait play-stat-art"
                    src={bloodlustImage}
                    alt=""
                  />
                )}
                <span>{stateLabels[field]}</span>
                {editingState === field ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!/^\d+$/.test(stateValue)) {
                        setMessage("Enter a whole number.");
                        return;
                      }
                      setState(field, Number(stateValue));
                    }}
                  >
                    <input
                      aria-label={`${stateLabels[field]} value`}
                      inputMode="numeric"
                      type="text"
                      value={stateValue}
                      onChange={(e) => setStateValue(e.target.value)}
                      autoFocus
                    />
                    <button type="submit">Set</button>
                    <button type="button" onClick={() => setEditingState(null)}>
                      Cancel
                    </button>
                  </form>
                ) : value === undefined ? (
                  <button
                    aria-label={`Track ${stateLabels[field]}`}
                    onClick={() => {
                      setState(field, startingValues[field]);
                    }}
                  >
                    + Track
                  </button>
                ) : (
                  <>
                    <div className="play-state-stepper">
                      <button
                        aria-label={`Decrease ${stateLabels[field]}`}
                        disabled={value <= 0}
                        onClick={() => setState(field, value - 1)}
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        aria-label={`Set ${stateLabels[field]}`}
                        onClick={() => {
                          setEditingState(field);
                          setStateValue(String(value));
                        }}
                      >
                        {value}
                      </button>
                      <button
                        aria-label={`Increase ${stateLabels[field]}`}
                        disabled={value >= stateLimits[field]}
                        onClick={() => setState(field, value + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      className="play-text-button"
                      aria-label={`Stop tracking ${stateLabels[field]}`}
                      onClick={() => setState(field, null)}
                    >
                      Stop tracking
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
      {props.deathPanel}
      <section className="play-panel play-moments" aria-label="Remember this">
        <h2>
          <Camera size={21} /> Remember this{" "}
          <span>The moments that made your night</span>
        </h2>
        <div className="play-moment-choices">
          {moments.map((choice) => (
            <button key={choice.type} onClick={() => pickMoment(choice)}>
              <choice.icon size={17} aria-hidden="true" />
              {choice.title}
            </button>
          ))}
        </div>
        {moment && (
          <div className="play-moment-editor">
            <label>
              {moments.find((c) => c.type === moment.momentType)?.prompt ??
                "Add detail"}
              {moment.momentType === "item" ? (
                <PlaySearch
                  label="Moment detail"
                  value={momentDetail}
                  options={
                    location === "Buddyland"
                      ? BUDDYLAND_ITEMS.map((item) => item.name)
                      : []
                  }
                  onSearch={(value) =>
                    props.onDraft(moment.id, { detail: value })
                  }
                  onChange={(value) =>
                    props.onDraft(moment.id, { detail: value })
                  }
                  placeholder="Add an optional detail"
                />
              ) : (
                <input
                  aria-label="Moment detail"
                  value={momentDetail}
                  onChange={(e) =>
                    props.onDraft(moment.id, { detail: e.target.value })
                  }
                  onBlur={saveMoment}
                  maxLength={240}
                />
              )}
            </label>
            <button
              onClick={() => {
                if (saveMoment()) setMomentId(null);
              }}
            >
              Record
            </button>
          </div>
        )}
      </section>
      {props.moduleControls && (
        <section className="play-module-surface" aria-label="Module tracking">
          {props.moduleControls}
        </section>
      )}
      <p role="status" className="play-feedback">
        {message}
      </p>
      <section className="play-panel play-history">
        <button
          className="play-history-toggle"
          aria-expanded={historyOpen}
          onClick={() => setHistoryOpen((v) => !v)}
        >
          <span>
            The night so far{" "}
            <small>
              {summary.entries.filter((e) => e.kind !== "start").length}{" "}
              observations
            </small>
          </span>
          <ChevronDown size={20} />
        </button>
        {historyOpen && (
          <PlayTimeline
            events={events}
            limit={100}
            onToggle={(e, undone) =>
              commit({ kind: undone ? "restore" : "undo", target: e.id })
            }
            onDeath={props.onDeath}
            onMoment={(e) => {
              if (saveMoment()) setMomentId(e.id);
            }}
          />
        )}
      </section>
      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent className="play-finish-modal">
          <DialogHeader>
            <DialogTitle>How did the night end?</DialogTitle>
            <DialogDescription>
              Review your recorded details before saving the result.
            </DialogDescription>
          </DialogHeader>
          <div className="play-finish">
            <button onClick={() => props.onFinish("won")}>Won</button>
            <button onClick={() => props.onFinish("lost")}>Lost</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
