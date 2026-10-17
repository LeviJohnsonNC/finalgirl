import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Heart,
  Skull,
  Undo2,
  Settings2,
  Volume2,
  Monitor,
  ArrowLeft,
  Radio,
  Flag,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeepAwake } from '@/hooks/play/useKeepAwake';
import { newPlayEvent, summarizePlay, type PlayEvent } from '@/lib/play/events';
import { PlayTimeline } from './PlayTimeline';

export interface PlayScreenProps {
  killer: string;
  location: string;
  finalGirl: string;
  imageUrl: string;
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  onExit: () => void;
  onFinish: (outcome: 'won' | 'lost') => void;
  onNarrate: () => void;
  narrationBusy: boolean;
  narrationPlaying: boolean;
  hasStory: boolean;
  syncStatus?: string;
  onRetrySync?: () => void;
  deathControls?: React.ReactNode;
  onDeath?: (event: PlayEvent) => void;
}
const inputClass =
  'w-full h-12 px-3 bg-muted border border-border text-base text-foreground rounded-sm focus-visible:outline-secondary';
const buttonClass =
  'vcr-tape-button px-4 py-3 min-h-[48px] font-display uppercase text-sm tracking-wider';
const parseCount = (text: string, max = 999) =>
  /^\d+$/.test(text) && Number(text) <= max ? Number(text) : null;
export function PlayScreen(props: PlayScreenProps) {
  const {
    killer,
    location,
    finalGirl,
    imageUrl,
    events,
    onEvent,
    onExit,
    onFinish,
  } = props;
  const summary = summarizePlay(events);
  const [startOpen, setStartOpen] = useState(false);
  const [roundStartOpen, setRoundStartOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [saved, setSaved] = useState('0');
  const [killed, setKilled] = useState('0');
  const [round, setRound] = useState('');
  const [quantity, setQuantity] = useState('2');
  const [note, setNote] = useState('');
  const [stateField, setStateField] =
    useState<NonNullable<PlayEvent['field']>>('finalGirlHealth');
  const [stateValue, setStateValue] = useState('');
  const [message, setMessage] = useState('');
  const mobile = useIsMobile();
  const awake = useKeepAwake();
  const commit = (fields: Omit<PlayEvent, 'id' | 'at'>) => {
    try {
      if (!onEvent(newPlayEvent(fields))) {
        setMessage('This change could not be saved. Please try again.');
        return false;
      }
      setMessage('Saved on this device.');
      return true;
    } catch (reason) {
      setMessage(
        reason instanceof Error ? reason.message : 'Check your values.',
      );
      return false;
    }
  };
  const baseline = (kind: 'start' | 'adjust') => {
    const s = parseCount(saved),
      k = parseCount(killed),
      r = round.trim() === '' ? null : parseCount(round);
    if (
      s === null ||
      k === null ||
      (round.trim() !== '' && (r === null || r < 1))
    ) {
      setMessage('Enter whole numbers; the round can be left unrecorded.');
      return;
    }
    if (commit({ kind, saved: s, killed: k, round: r })) {
      setStartOpen(false);
      setDetailsOpen(false);
    }
  };
  const last = [...summary.entries].reverse().find((e) => e.kind !== 'start');
  const lastDeath = [...summary.entries]
    .reverse()
    .find((e) => e.kind === 'killed');
  const start = () => {
    setSaved('0');
    setKilled('0');
    setRound('');
    setStartOpen(true);
  };
  const showDetails = () => {
    setSaved(String(summary.saved ?? 0));
    setKilled(String(summary.killed ?? 0));
    setRound(summary.round === null ? '' : String(summary.round));
    setDetailsOpen(true);
  };
  return (
    <div className="play-screen fixed lg:relative inset-x-0 top-24 lg:top-auto bottom-[var(--app-footer-h,60px)] lg:bottom-auto overflow-y-auto lg:overflow-visible px-3 lg:px-2 pb-52 lg:pb-10 max-w-7xl mx-auto">
      <header className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div>
          <p className="font-vhs text-secondary tracking-[0.18em] text-sm flex items-center gap-2">
            <Radio className="w-4 h-4" aria-hidden="true" />
            PLAY MODE // REEL 01
          </p>
          <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide mt-1">
            {location}
          </h1>
          <p className="type-caption text-muted-foreground">
            {finalGirl} vs {killer}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="type-caption text-muted-foreground min-h-[44px] px-2 flex items-center gap-2"
            onClick={onExit}
            aria-label="Read story"
          >
            <ArrowLeft className="w-4 h-4" />
            Story
          </button>
          {props.hasStory && (
            <button
              aria-label={
                props.narrationPlaying
                  ? 'Stop introduction'
                  : 'Narrate introduction'
              }
              disabled={props.narrationBusy}
              onClick={props.onNarrate}
              className="min-h-[44px] min-w-[44px] border border-border p-2 text-secondary disabled:opacity-50"
            >
              <Volume2 className="w-4 h-4 mx-auto" />
            </button>
          )}
          <button
            onClick={() => setFinishOpen(true)}
            aria-label="Finish game"
            className="min-h-[44px] px-3 border border-primary/40 type-caption text-primary flex gap-2 items-center"
          >
            <Flag className="w-4 h-4" />
            Finish
          </button>
        </div>
      </header>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <figure className="relative border border-border/70 bg-background shadow-2xl overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <img
            src={imageUrl}
            alt={`${finalGirl}'s night at ${location}`}
            style={{
              height: mobile
                ? `max(180px,calc(100dvh - ${!summary.tracked ? 440 : collapsed ? 420 : 510}px))`
                : undefined,
            }}
            className="relative w-full object-contain h-[max(180px,calc(100dvh-510px))] lg:h-[max(260px,calc(100dvh-330px))]"
          />
          <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.06]" />
          <figcaption className="relative flex justify-between px-4 py-2 border-t border-border/40 type-caption text-muted-foreground">
            <span>CASE FILE // {location.toUpperCase()}</span>
            <span>REEL 01</span>
          </figcaption>
        </figure>
        <aside
          aria-label="Play controls"
          className="fixed lg:static inset-x-0 z-50 lg:z-auto border-t lg:border border-secondary/30 bg-background/95 backdrop-blur-md lg:backdrop-blur-none p-3 sm:p-4 shadow-2xl"
          style={{ bottom: 'var(--app-footer-h,56px)' }}
        >
          <div className="flex justify-between items-center gap-2 mb-2">
            <p className="font-vhs text-secondary tracking-widest text-sm">
              {summary.tracked ? 'THE NIGHT SO FAR' : 'YOUR NIGHT. YOUR PACE.'}
            </p>
            {summary.tracked && (
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground"
                aria-label={
                  collapsed
                    ? 'Expand tracking controls'
                    : 'Collapse tracking controls'
                }
              >
                {collapsed ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {summary.tracked
              ? `Victims saved: ${summary.saved}. Victims killed: ${summary.killed}. Current round: ${summary.round ?? 'unrecorded'}.`
              : ''}
          </span>
          {!summary.tracked ? (
            <>
              <p className="hidden lg:block type-body-sm text-muted-foreground mb-5">
                Keep the picture up. Record a rescue, a death, a turning point.
                Every tap becomes part of the night.
              </p>
              <button
                onClick={start}
                className={`${buttonClass} w-full text-secondary flex justify-center gap-2 items-center`}
              >
                <Clapperboard className="w-4 h-4" />
                Track this game
              </button>
            </>
          ) : (
            <>
              {collapsed ? (
                <button
                  onClick={() => setCollapsed(false)}
                  className="w-full min-h-[48px] font-vhs text-lg text-foreground"
                >
                  Saved {summary.saved} · Killed {summary.killed} · Round{' '}
                  {summary.round ?? '—'}
                </button>
              ) : (
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                  <button
                    aria-label="Save one victim"
                    onClick={() => commit({ kind: 'saved', quantity: 1 })}
                    className="play-counter play-counter-save"
                  >
                    <Heart className="w-4 h-4" />
                    <span>SAVED</span>
                    <strong>{summary.saved}</strong>
                    <span className="text-xl">+</span>
                  </button>
                  <button
                    aria-label="Record one victim killed"
                    onClick={() =>
                      commit({
                        kind: 'killed',
                        quantity: 1,
                        cause: 'unspecified',
                      })
                    }
                    className="play-counter play-counter-killed"
                  >
                    <Skull className="w-4 h-4" />
                    <span>KILLED</span>
                    <strong>{summary.killed}</strong>
                    <span className="text-xl">+</span>
                  </button>
                  <button
                    aria-label={
                      summary.round === null
                        ? 'Start round tracking'
                        : 'Next round'
                    }
                    onClick={() => {
                      if (summary.round === null) {
                        setRound('');
                        setRoundStartOpen(true);
                      } else commit({ kind: 'round' });
                    }}
                    className="play-counter play-counter-round"
                  >
                    <Clapperboard className="w-4 h-4" />
                    <span>ROUND</span>
                    <strong>{summary.round ?? '—'}</strong>
                    <span className="text-xl">+</span>
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 mt-2">
                <button
                  disabled={!last}
                  onClick={() =>
                    last && commit({ kind: 'undo', target: last.id })
                  }
                  className="type-caption flex items-center gap-2 min-h-[44px] px-2 text-muted-foreground disabled:opacity-30"
                >
                  <Undo2 className="w-4 h-4" />
                  Undo
                </button>
                {props.onDeath && lastDeath && (
                  <button
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-primary"
                    aria-label="Latest death scene"
                    onClick={() => props.onDeath?.(lastDeath)}
                  >
                    <Skull className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={showDetails}
                  className="type-caption text-secondary min-h-[44px] px-2 flex gap-2 items-center"
                >
                  <Settings2 className="w-4 h-4" />
                  Details & log
                </button>
              </div>
            </>
          )}
          <div className="hidden lg:block border-t border-border/50 mt-3 pt-3 space-y-2">
            <p className="type-caption text-muted-foreground">
              {props.syncStatus || 'Saved on this device'}
            </p>
            {props.onRetrySync && (
              <button
                onClick={props.onRetrySync}
                className="type-caption text-secondary underline min-h-[44px]"
              >
                Retry cloud sync
              </button>
            )}
            {awake.supported && (
              <button
                onClick={awake.toggle}
                aria-pressed={awake.enabled}
                className="type-caption flex gap-2 items-center min-h-[44px] text-muted-foreground"
              >
                <Monitor className="w-4 h-4" />
                {awake.active
                  ? 'Screen awake'
                  : awake.enabled
                    ? 'Keep awake requested'
                    : 'Keep screen awake'}
              </button>
            )}
          </div>
        </aside>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="type-caption text-muted-foreground mt-3 min-h-5"
      >
        {message}
      </p>
      <Dialog open={roundStartOpen} onOpenChange={setRoundStartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              Start round tracking
            </DialogTitle>
            <DialogDescription>
              Enter the round you are on now. Earlier rounds stay unrecorded.
            </DialogDescription>
          </DialogHeader>
          <input
            aria-label="Current round"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={round}
            onChange={(e) => setRound(e.target.value)}
            placeholder="Current round (1–999)"
            className={inputClass}
          />
          <button
            className={`${buttonClass} text-secondary`}
            onClick={() => {
              const n = parseCount(round);
              if (
                n !== null &&
                n >= 1 &&
                commit({
                  kind: 'adjust',
                  saved: summary.saved!,
                  killed: summary.killed!,
                  round: n,
                })
              )
                setRoundStartOpen(false);
              else setMessage('Enter the current round from 1 to 999.');
            }}
          >
            Use current round
          </button>
          <p role="status" className="type-caption text-primary">
            {message}
          </p>
        </DialogContent>
      </Dialog>
      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent className="bg-background max-h-[85dvh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-secondary uppercase">
              Start tracking
            </DialogTitle>
            <DialogDescription>
              Start from the beginning, or enter the totals you already have.
              Your physical game stays in charge.
            </DialogDescription>
          </DialogHeader>
          <button
            className={`${buttonClass} text-secondary`}
            onClick={() => {
              if (commit({ kind: 'start', saved: 0, killed: 0, round: 1 }))
                setStartOpen(false);
            }}
          >
            Start from round 1
          </button>
          <div className="border-t border-border pt-4 space-y-3">
            <p className="font-display uppercase text-sm">Already playing?</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Saved', saved, setSaved],
                ['Killed', killed, setKilled],
                ['Round', round, setRound],
              ].map(([label, value, setter]) => (
                <label
                  key={String(label)}
                  className="type-caption text-muted-foreground"
                >
                  {String(label)}
                  <input
                    aria-label={`Starting ${label}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={String(value)}
                    onChange={(e) =>
                      (setter as (v: string) => void)(e.target.value)
                    }
                    placeholder={label === 'Round' ? 'Unknown' : '0'}
                    className={inputClass}
                  />
                </label>
              ))}
            </div>
            <button
              onClick={() => baseline('start')}
              className={`${buttonClass} w-full`}
            >
              Use current totals
            </button>
          </div>
          <p role="status" className="type-caption text-primary">
            {message}
          </p>
        </DialogContent>
      </Dialog>
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent
          side={mobile ? 'bottom' : 'right'}
          className="overflow-y-auto max-h-[88dvh] sm:max-h-none"
        >
          <SheetHeader>
            <SheetTitle className="font-display text-secondary uppercase">
              Case notes
            </SheetTitle>
            <SheetDescription>
              Record only what you want to remember.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6 pt-5">
            <section className="space-y-3">
              <h3 className="font-display uppercase text-sm">
                Multiple victims
              </h3>
              <label className="type-caption text-muted-foreground">
                Quantity (1–50)
                <input
                  aria-label="Victim quantity"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={inputClass}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`${buttonClass} text-secondary`}
                  onClick={() => {
                    const n = parseCount(quantity, 50);
                    if (n && commit({ kind: 'saved', quantity: n }))
                      setDetailsOpen(false);
                    else setMessage('Enter a quantity from 1 to 50.');
                  }}
                >
                  Save group
                </button>
                <button
                  className={`${buttonClass} text-primary`}
                  onClick={() => {
                    const n = parseCount(quantity, 50);
                    if (
                      n &&
                      commit({
                        kind: 'killed',
                        quantity: n,
                        cause: 'unspecified',
                      })
                    )
                      setDetailsOpen(false);
                    else setMessage('Enter a quantity from 1 to 50.');
                  }}
                >
                  Record group killed
                </button>
              </div>
            </section>
            <section className="space-y-3">
              <h3 className="font-display uppercase text-sm">Remember this</h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  'Found a weapon',
                  'Dark Power revealed',
                  'Finale began',
                  'Narrow escape',
                ].map((text) => (
                  <button
                    key={text}
                    onClick={() => commit({ kind: 'moment', text })}
                    className="type-caption border border-border px-3 min-h-[44px] text-muted-foreground hover:text-secondary"
                  >
                    {text}
                  </button>
                ))}
              </div>
              <label className="type-caption text-muted-foreground">
                A moment from the game
                <textarea
                  aria-label="Game moment"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={240}
                  className={`${inputClass} h-24 py-3`}
                />
              </label>
              <button
                disabled={!note.trim()}
                onClick={() => {
                  if (commit({ kind: 'moment', text: note.trim() }))
                    setNote('');
                }}
                className={`${buttonClass} w-full disabled:opacity-40`}
              >
                Add moment
              </button>
            </section>
            <section className="space-y-3">
              <h3 className="font-display uppercase text-sm">Recorded state</h3>
              <label className="type-caption text-muted-foreground">
                What changed?
                <select
                  aria-label="State to record"
                  value={stateField}
                  onChange={(e) =>
                    setStateField(e.target.value as typeof stateField)
                  }
                  className={inputClass}
                >
                  <option value="finalGirlHealth">Final Girl Health</option>
                  <option value="killerHealth">Killer Health</option>
                  <option value="finalHorrorLevel">Horror Level</option>
                  <option value="bloodlust">Bloodlust</option>
                </select>
              </label>
              <input
                aria-label="Recorded state value"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={stateValue}
                onChange={(e) => setStateValue(e.target.value)}
                placeholder="Current value"
                className={inputClass}
              />
              <button
                className={`${buttonClass} w-full`}
                onClick={() => {
                  const n = parseCount(stateValue, 99);
                  if (
                    n !== null &&
                    commit({ kind: 'state', field: stateField, value: n })
                  )
                    setStateValue('');
                  else
                    setMessage('Enter a valid current value. Horror uses 1–7.');
                }}
              >
                Record state
              </button>
            </section>
            <details className="border-t border-border pt-4">
              <summary className="font-display uppercase text-sm min-h-[44px] cursor-pointer">
                Correct totals
              </summary>
              <div className="space-y-3">
                {[
                  ['Saved', saved, setSaved],
                  ['Killed', killed, setKilled],
                  ['Round', round, setRound],
                ].map(([label, value, setter]) => (
                  <label
                    key={String(label)}
                    className="block type-caption text-muted-foreground"
                  >
                    {String(label)}
                    <input
                      aria-label={`Corrected ${label}`}
                      value={String(value)}
                      onChange={(e) =>
                        (setter as (v: string) => void)(e.target.value)
                      }
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={inputClass}
                    />
                  </label>
                ))}
                <button
                  onClick={() => baseline('adjust')}
                  className={`${buttonClass} w-full`}
                >
                  Apply correction
                </button>
              </div>
            </details>
            {props.deathControls}
            <PlayTimeline
              events={events}
              onToggle={(event, undone) =>
                commit({ kind: undone ? 'restore' : 'undo', target: event.id })
              }
              onDeath={(event) => {
                setDetailsOpen(false);
                props.onDeath?.(event);
              }}
            />
            {awake.supported && (
              <button
                aria-pressed={awake.enabled}
                onClick={awake.toggle}
                className={`${buttonClass} w-full`}
              >
                {awake.active
                  ? 'Screen awake'
                  : awake.enabled
                    ? 'Keep awake requested'
                    : 'Keep screen awake'}
              </button>
            )}
            <p className="type-caption text-muted-foreground">
              {props.syncStatus || 'Saved on this device'}
            </p>
            {props.onRetrySync && (
              <button
                onClick={props.onRetrySync}
                className="type-caption underline text-secondary min-h-[44px]"
              >
                Retry cloud sync
              </button>
            )}
            <p role="status" className="type-caption text-secondary">
              {message}
            </p>
          </div>
        </SheetContent>
      </Sheet>
      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase">
              How did the night end?
            </DialogTitle>
            <DialogDescription>
              Review your recorded details before saving the result.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onFinish('won')}
              className={`${buttonClass} text-secondary`}
            >
              Won
            </button>
            <button
              onClick={() => onFinish('lost')}
              className={`${buttonClass} text-primary`}
            >
              Lost
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
