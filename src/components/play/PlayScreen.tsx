import { poltergeistParent, resolvePoltergeistAction } from '../../../supabase/functions/_shared/play/poltergeist';
import { KillerCards } from "./KillerCards";
import { illustratedKillerCards } from "./killerPresentation";
import { ModuleArtwork } from './ModuleArtwork';
import { FinalGirlHealthPortrait } from './FinalGirlHealthPortrait';
import { observedFinalGirlMaxHealth } from '@/data/finalGirlReferences';
import { playStartingValues } from "@/lib/play/defaults";
import horrorLow from "@/assets/play/states/horror-low.webp";
import horrorMid from "@/assets/play/states/horror-mid.webp";
import horrorHigh from "@/assets/play/states/horror-high.webp";
import criticalHealth from "@/assets/play/states/critical-health.webp";
import { bloodlustBackground } from "./bloodlustPresentation";
import momentItem from "@/assets/play/moment-item.webp";
import momentLocked from "@/assets/play/states/ultimate-locked.webp";
import momentUnlocked from "@/assets/play/states/ultimate-unlocked.webp";
import momentUsed from "@/assets/play/moment-ultimate-used.webp";
import momentDarkPower from "@/assets/play/roster/moment-dark-power.webp";
import momentFinale from "@/assets/play/roster/moment-finale.webp";
import momentGirlRevived from "@/assets/play/states/girl-return-before.webp";
import momentGirlReturned from "@/assets/play/states/girl-return-after.webp";
import momentKillerRevived from "@/assets/play/states/killer-return-before.webp";
import momentKillerReturned from "@/assets/play/states/killer-return-after.webp";
import momentDarkPowerActive from "@/assets/play/states/dark-power-active.webp";
import momentFinaleActive from "@/assets/play/states/finale-active.webp";
import momentOther from "@/assets/play/moment-other.webp";
import { useActiveImages } from "@/hooks/useActiveImages";
import { LoreInfoModal } from '@/components/LoreInfoModal';
import { usePersonalItem } from '@/contexts/PersonalItemsContext';
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  decrementPlay,
  newPlayEvent,
  summarizePlay,
  PERMANENT_MOMENTS,
  isPermanentMoment,
  isLockedPlayEvent,
  type PlayEvent,
  type PlayDetails,
  type StateField,
  type MomentType,
} from "@/lib/play/events";
import { PlayTimeline } from "./PlayTimeline";
import { SessionOptions } from "@/components/SessionOptions";
import "@/styles/play.css";
import "@/styles/play-finish.css";
import { killerMomentCards, moduleState } from "@/lib/play/modules";
import { selectionItems } from "@/lib/play/catalog";
import { PlaySelect } from "./PlaySelect";
import "@/styles/play-state-art.css";

export interface PlayScreenProps {
  killer: string;
  location: string;
  finalGirl: string;
  finalGirlStartingHealth?: number;
  imageUrl: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  onExit: () => void;
  onFinish: (outcome: "won" | "lost") => void;
  onDiscard?: () => void;
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
const orderedStateFields: StateField[] = ["finalGirlHealth", "killerHealth", "bloodlust", "finalHorrorLevel"];
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
  image: string;
  activeImage?: string;
  subtitle?: string;
}> = [
  {
    type: "item",
    image: momentItem,
    title: "Found a weapon/item",
    prompt: "Which weapon or item?",
  },
  {
    type: "ultimate-unlocked",
    image: momentLocked,
    activeImage: momentUnlocked,
    title: "Ultimate unlocked",
    prompt: "Anything to remember?",
  },
  {
    type: "ultimate-used",
    image: momentUsed,
    title: "Ultimate used",
    prompt: "What did it change?",
  },
  {
    type: "dark-power",
    image: momentDarkPower,
    activeImage: momentDarkPowerActive,
    title: "Dark Power",
    prompt: "Which Dark Power?",
  },
  {
    type: "finale",
    image: momentFinale,
    activeImage: momentFinaleActive,
    title: "Finale",
    prompt: "Which Finale?",
  },
  {
    type: "girl-revived",
    image: momentGirlRevived,
    activeImage: momentGirlReturned,
    title: "Second wind",
    subtitle: "Final Girl returns",
    prompt: "How did she come back?",
  },
  {
    type: "killer-revived",
    image: momentKillerRevived,
    activeImage: momentKillerReturned,
    title: "Back from the dead",
    subtitle: "Killer returns",
    prompt: "What happened when the killer rose?",
  },
  {
    type: "other",
    image: momentOther,
    title: "Other moment",
    prompt: "What happened?",
  },
];
const momentOrder: MomentType[] = ["item", "dark-power", "finale", "ultimate-unlocked", "ultimate-used", "girl-revived", "killer-revived", "other"];
const orderedMoments = momentOrder.map(type => moments.find(choice => choice.type === type)!);
export function PlayScreen(props: PlayScreenProps) {
  const { events, onEvent, killer, location, finalGirl } = props;
  const summary = summarizePlay(events);
  const { item: personalItem } = usePersonalItem(finalGirl);
  const startingValues = playStartingValues(killer, finalGirl);
  const { characterImages, aiEnabled } = useActiveImages();
  const finalGirlMaxHealth = observedFinalGirlMaxHealth(finalGirl, events, props.finalGirlStartingHealth);
  // Legacy sessions can use the catalog to bound new input without backfilling observations.
  const trackerLimits = { ...stateLimits, finalGirlHealth: observedFinalGirlMaxHealth(
    finalGirl, events, props.finalGirlStartingHealth ?? startingValues.finalGirlHealth,
  ) ?? stateLimits.finalGirlHealth };
  const [message, setMessage] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [finishOpen, setFinishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [momentId, setMomentId] = useState<string | null>(null);
  const [editingState, setEditingState] = useState<StateField | null>(null);
  const [stateValue, setStateValue] = useState("");
  const started = useRef(false);
  const pendingMoments = useRef(new Set<MomentType>());
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
  const last = [...summary.entries].reverse().find((e) => e.kind !== "start" && !isPermanentMoment(e) && !isLockedPlayEvent(e));
  const lastDeath = [...summary.entries]
    .reverse()
    .find((e) => e.kind === "killed");
  const moment = summary.entries.find(
    (e) => e.id === momentId && e.kind === "moment",
  );
  const momentDetail = moment
    ? (props.drafts[moment.id]?.detail ?? moment.detail ?? "")
    : "";
  const momentCard = moment?.killerCard ?? "";
  const hansState = moduleState(summary.entries, "hans");
  const momentCards = moment?.momentType === "dark-power" || moment?.momentType === "finale" ? illustratedKillerCards(killer, moment.momentType) : [];
  const isReveal =
    moment?.momentType === "dark-power" || moment?.momentType === "finale";
  const recordObjectiveFromItem = (command:'join'|'find-floppy') => {
    const request={parent:poltergeistParent(summary.entries),command};
    const changes=resolvePoltergeistAction(request,moduleState(summary.entries,'poltergeist'),summary.entries);
    if(!changes)return;
    if(!onEvent(newPlayEvent({kind:'module',moduleData:{module:'poltergeist',changes},poltergeistAction:request})))setMessage('This change could not be saved. Please try again.');
  };
  const saveMoment = () => {
    if (
      moment &&
      momentDetail.trim() !== (moment.detail ?? "") &&
      !commit({
        kind: "details",
        target: moment.id,
        detail: momentDetail.trim(),
        ...(isReveal && { killerCard: momentCard }),
      })
    )
      return false;
    return true;
  };
  const pickMoment = (choice: (typeof moments)[number]) => {
    if (!saveMoment()) return;
    const permanent = PERMANENT_MOMENTS.includes(choice.type);
    const existing = permanent && summary.entries.find(e => e.kind === "moment" && e.momentType === choice.type);
    if (existing) {
      if (choice.type === "ultimate-unlocked") return;
      setMomentId(existing.id); setMessage(""); return;
    }
    if (permanent && pendingMoments.current.has(choice.type)) return;
    if (permanent) pendingMoments.current.add(choice.type);
    const e = commit({
      kind: "moment",
      momentType: choice.type,
      text: choice.subtitle ? `${choice.title}: ${choice.subtitle}` : choice.title,
      ...(permanent && { permanent: true as const }),
    });
    if (!e) pendingMoments.current.delete(choice.type);
    if (e) {
      setMomentId(e.id);
      setAnnouncement(`${choice.title} recorded.`);
    }
  };
  const setState = (field: StateField, value: number | null) => {
    if (
      value !== null &&
      (!Number.isInteger(value) || value < 0 || value > trackerLimits[field])
    ) {
      setMessage(`Use a whole number from 0 to ${trackerLimits[field]}.`);
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
          <div className="play-character-heading">
            <p className="play-eyebrow">PLAY MODE</p>
            <LoreInfoModal type="finalGirl" name={finalGirl} namedTrigger ultimate={summary.entries.some(event => event.kind === 'moment' && event.momentType === 'ultimate-unlocked')}/>
          </div>
          <h1>{location}</h1>
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
          {props.onDiscard && <SessionOptions onDiscard={props.onDiscard} />}
        </nav>
      </header>
      <section className="play-tracking" aria-label="Play controls">
        <div className="play-counters">
          {(["round", "saved", "killed"] as const).map((counter) => {
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
        data-healthless={killer === 'Poltergeist' || undefined}
      >
        <h2>Track more</h2>
        <div className="play-state-grid">
          {orderedStateFields.filter(field=>killer!=='Poltergeist'||field!=='killerHealth').map((field) => {
            const value = summary[field];
            const health = field === "finalGirlHealth" || field === "killerHealth";
            const critical = health && value !== undefined && value <= 2;
            const horror = value ?? startingValues.finalHorrorLevel;
            const horrorBand = horror <= 1 ? "low" : horror === 7 ? "high" : "mid";
            const bloodlust = field === "bloodlust" ? bloodlustBackground(killer, value) : undefined;
            return (
              <div key={field} className={`play-state play-state--${field}`} data-critical={critical || undefined} data-horror={field === "finalHorrorLevel" ? horrorBand : undefined} data-bloodlust-stage={bloodlust ? bloodlust.stage ?? "unknown" : undefined}>
                {field === 'finalGirlHealth' && <FinalGirlHealthPortrait name={finalGirl}
                  health={value} maximum={finalGirlMaxHealth} original={characterImages[finalGirl]} aiEnabled={aiEnabled} />}
                {field === "killerHealth" && characterImages[killer] && (
                    <img
                      className="play-stat-portrait"
                      alt=""
                      src={characterImages[killer]}
                    />
                  )}
                {field === "finalHorrorLevel" && (
                  <img
                    className="play-stat-portrait play-stat-art"
                    src={horrorBand === "low" ? horrorLow : horrorBand === "high" ? horrorHigh : horrorMid}
                    alt=""
                  />
                )}
                {field === "bloodlust" && (
                  <img
                    className="play-stat-portrait play-stat-art"
                    src={bloodlust!.src}
                    alt=""
                  />
                )}
                {critical && field !== 'finalGirlHealth' && <img className="play-critical-art" src={criticalHealth} alt="" />}
                <span>{stateLabels[field]}</span>
                {critical && <small className="play-critical-label">{value === 0 ? "No health remaining" : "Low health"}</small>}
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
                      setState(field, Math.min(startingValues[field] ?? 0, trackerLimits[field]));
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
                        onClick={() => setState(field, field === 'finalGirlHealth' ? Math.min(value - 1, trackerLimits[field]) : value - 1)}
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
                        disabled={value >= trackerLimits[field]}
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
      <p className="sr-only" role="status">{announcement}</p>
      <section className="play-panel play-moments" aria-label="Remember this">
        <h2>
          Remember this <span>The moments that made your night</span>
        </h2>
        <div className="play-moment-choices">
          {orderedMoments.filter(choice=>killer!=='Poltergeist'||choice.type!=='killer-revived').map((choice) => {
            const revealed = summary.entries.find(e => e.kind === "moment" && e.momentType === choice.type);
            const active = PERMANENT_MOMENTS.includes(choice.type) && !!revealed;
            const selectedArt = active && (choice.type === 'dark-power' || choice.type === 'finale')
              ? illustratedKillerCards(killer, choice.type).find(card => card.name === revealed?.killerCard)?.art : undefined;
            const ultimate = choice.type === "ultimate-unlocked";
            return <button key={choice.type} aria-label={choice.title} disabled={ultimate && active} data-recorded={active || undefined} aria-pressed={PERMANENT_MOMENTS.includes(choice.type) ? active : undefined} onClick={() => pickMoment(choice)}>
              {selectedArt ? <ModuleArtwork art={selectedArt} /> : <img src={active ? choice.activeImage ?? choice.image : choice.image} alt="" loading="lazy" />}
              {(active || ultimate) && <small className="play-moment-seal">{ultimate ? active ? "Unlocked" : "Locked" : choice.type === "dark-power" || choice.type === "finale" ? "Revealed" : "Returned"}</small>}
              <span><strong>{ultimate ? "Ultimate" : choice.title}</strong>{choice.subtitle && <small>{choice.subtitle}</small>}</span>
            </button>;
          })}
        </div>
        {moment && (
          <div className="play-moment-editor">
            {isReveal && <KillerCards killer={killer} events={events} onEvent={onEvent} typeOnly={moment.momentType as "dark-power" | "finale"} />}
            {isReveal && momentCards.length > 0 && (
              <label>
                {moment.momentType === "dark-power"
                  ? "Which Dark Power?"
                  : "Which Finale?"}
                <PlaySelect
                  aria-label={
                    moment.momentType === "dark-power"
                      ? "Dark Power card"
                      : "Finale card"
                  }
                  value={momentCard}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (
                      killer === "Hans" &&
                      moment.momentType === "dark-power" &&
                      next && next === hansState.secondPower
                    ) {
                      setMessage("That power is already recorded as the second Dark Power.");
                      return;
                    }
                    // One immutable detail edit keeps reveal context, Undo and recovery together.
                    commit({
                      kind: "details",
                      target: moment.id,
                      killerCard: next,
                      detail: momentDetail.trim(),
                    });
                  }}
                >
                  <option value="">Not specified</option>
                  {momentCard && !momentCards.some(card => card.name === momentCard) && <option value={momentCard}>{momentCard} (earlier record)</option>}
                  {momentCards.map((card) => (
                    <option key={card.id} value={card.name}>
                      {card.name}
                    </option>
                  ))}
                </PlaySelect>
              </label>
            )}
            {killer === "Hans" && isReveal && hansState.finale === "Dark, Darker, Darkest" && (
              <label>
                Second Dark Power
                <PlaySelect
                  aria-label="Second Dark Power card"
                  value={String(hansState.secondPower ?? "")}
                  onChange={e => commit({
                    kind: "module",
                    moduleData: {module: "hans", changes: {secondPower: e.target.value || null}},
                  })}
                >
                  <option value="">Not specified</option>
                  {killerMomentCards(killer, "dark-power")
                    .filter(card => card.name !== hansState.power)
                    .map(card => <option key={card.id} value={card.name}>{card.name}</option>)}
                </PlaySelect>
              </label>
            )}
            <label>
              {isReveal
                ? "Anything to remember?"
                : (moments.find((c) => c.type === moment.momentType)?.prompt ??
                  "Add detail")}
              {moment.momentType === "item" ? (
                <PlaySearch
                  label="Moment detail"
                  value={momentDetail}
                  options={[...selectionItems({killer,location}).map(item => item.name), ...(personalItem ? [personalItem.name] : [])]}
                  onSearch={(value) =>
                    props.onDraft(moment.id, {
                      ...props.drafts[moment.id],
                      detail: value,
                    })
                  }
                  onChange={(value) =>
                    props.onDraft(moment.id, {
                      ...props.drafts[moment.id],
                      detail: value,
                    })
                  }
                  placeholder="Add an optional detail"
                />
              ) : (
                <input
                  aria-label="Moment detail"
                  value={momentDetail}
                  onChange={(e) =>
                    props.onDraft(moment.id, {
                      ...props.drafts[moment.id],
                      detail: e.target.value,
                    })
                  }
                  onBlur={saveMoment}
                  maxLength={240}
                />
              )}
            </label>
            {killer==='Poltergeist' && moment.momentType==='item' && ['Carolyn','Mr. Floppy'].includes(momentDetail.trim()) && <button type="button" onClick={()=>recordObjectiveFromItem(momentDetail.trim()==='Carolyn'?'join':'find-floppy')}>{momentDetail.trim()==='Carolyn'?'Record Carolyn joining you':'Record Mr. Floppy with you'}</button>}
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
        <DialogContent
          className="play-finish-modal"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>How did the night end?</DialogTitle>
          </DialogHeader>
          <div className="play-finish">
            <button
              className="play-finish-won"
              onClick={() => props.onFinish("won")}
            >
              Won
            </button>
            <button
              className="play-finish-lost"
              onClick={() => props.onFinish("lost")}
            >
              Lost
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
