import { DeathNarration } from './DeathNarration';
import { getFilmIdByLocation } from '@/types/gameData';
import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Skull } from 'lucide-react';
import {
  DEATH_CAUSES,
  newPlayEvent,
  type PlayEvent,
  type DeathCause,
} from '@/lib/play/events';
import {
  deathFacts,
  deathSignature,
  deathRooms,
  deathCauseLabels,
  type DeathSelection,
} from '@/lib/play/death';
import { useDeathScenes } from '@/hooks/play/useDeathScenes';
const input =
  'w-full min-h-[48px] p-3 bg-muted border border-border text-base text-foreground rounded-sm';
const button =
  'vcr-tape-button px-4 py-3 min-h-[48px] font-display text-sm uppercase tracking-wider disabled:opacity-40';
interface Props {
  sessionId: string;
  selection: DeathSelection;
  events: PlayEvent[];
  eventId: string;
  onClose: () => void;
  onEvent: (e: PlayEvent) => boolean;
  syncNow: () => Promise<boolean>;
}
export function DeathSceneDialog({
  sessionId,
  selection,
  events,
  eventId,
  onClose,
  onEvent,
  syncNow,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const facts = deathFacts(selection, events, eventId);
  const [room, setRoom] = useState(facts?.room ?? '');
  const [cause, setCause] = useState<DeathCause>(facts?.cause ?? 'unspecified');
  const [victim, setVictim] = useState(facts?.victim ?? '');
  const [note, setNote] = useState(facts?.note ?? '');
  const [signature, setSignature] = useState('');
  const [take, setTake] = useState(0);
  const [message, setMessage] = useState('');
  const scenes = useDeathScenes(sessionId, syncNow);
  const serialized = JSON.stringify(facts);
  useEffect(() => {
    let live = true;
    setSignature('');
    if (facts)
      void deathSignature(facts).then((s) => {
        if (live) setSignature(s);
      });
    return () => {
      live = false;
    };
  }, [serialized]); // eslint-disable-line react-hooks/exhaustive-deps
  const takes = scenes.rows
    .filter((r) => r.event_id === eventId && r.signature === signature)
    .sort((a, b) => a.take - b.take);
  const selected = takes.find((r) => r.take === take) ?? takes[0];
  const selectedId = selected?.id;
  useEffect(() => {
    if (selectedId) contentRef.current?.scrollTo({ top: 0 });
  }, [selectedId]);
  const dirty =
    !!facts &&
    (room !== facts.room ||
      cause !== facts.cause ||
      victim !== facts.victim ||
      note !== facts.note);
  const save = () => {
    if (!dirty) return true;
    const ok = onEvent(
      newPlayEvent({
        kind: 'details',
        target: eventId,
        room: room.trim(),
        cause,
        victim: victim.trim(),
        text: note.trim(),
      }),
    );
    if (ok) {
      setRoom(room.trim());
      setVictim(victim.trim());
      setNote(note.trim());
    }
    setMessage(
      ok
        ? 'Details saved on this device.'
        : 'Details could not be saved. Please try again.',
    );
    return ok;
  };
  const generate = async (next: number) => {
    if (save()) {
      setTake(next);
      await scenes.generate(eventId, next);
    }
  };
  if (!facts) return null; // An undone death never shows a stale response or narration.
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        ref={contentRef}
        className="bg-background max-w-xl max-h-[90dvh] overflow-y-auto"
      >
        <DialogHeader>
          <p className="font-vhs text-primary tracking-widest text-sm flex gap-2 items-center">
            <Skull className="w-4 h-4" />
            DEATH SCENE //{' '}
            {facts.round ? `ROUND ${facts.round}` : 'UNRECORDED ROUND'}
          </p>
          <DialogTitle className="font-display text-2xl uppercase">
            The last thing they saw
          </DialogTitle>
          <DialogDescription>
            {facts.quantity === 1
              ? 'This victim is already recorded.'
              : `These ${facts.quantity} victims are already recorded.`}{' '}
            Add context, then develop an original scene. Every field is
            optional.
          </DialogDescription>
        </DialogHeader>
        <details className="border border-border p-3" open={!selected || dirty}>
          <summary className="min-h-[44px] cursor-pointer font-vhs text-secondary">
            {room || 'Anywhere'} · {deathCauseLabels[cause]}
          </summary>
          <div className="space-y-3 mt-2">
            <label className="block type-caption text-muted-foreground">
              Where?
              <input
                aria-label="Death location"
                value={room}
                maxLength={120}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="General / unrecorded space"
                list="death-room-suggestions"
                className={input}
              />
              <datalist id="death-room-suggestions">
                {(deathRooms[selection.location] ?? []).map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
            <label className="block type-caption text-muted-foreground">
              Cause
              <select
                aria-label="Cause of death"
                value={cause}
                onChange={(e) => setCause(e.target.value as DeathCause)}
                className={input}
              >
                {DEATH_CAUSES.map((c) => (
                  <option key={c} value={c}>
                    {deathCauseLabels[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block type-caption text-muted-foreground">
              Victim name or role
              <input
                aria-label="Victim name or role"
                value={victim}
                maxLength={120}
                onChange={(e) => setVictim(e.target.value)}
                placeholder="Anonymous victim"
                className={input}
              />
            </label>
            <label className="block type-caption text-muted-foreground">
              What happened?
              <textarea
                aria-label="Death context"
                value={note}
                maxLength={240}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional card name or a short observation"
                className={`${input} h-24`}
              />
            </label>
            <button
              className={`${button} text-secondary w-full`}
              disabled={!dirty}
              onClick={save}
            >
              Save details
            </button>
          </div>
        </details>
        {selected && !dirty && (
          <section
            aria-label="Generated death scene"
            className="border-l-2 border-primary pl-4 py-3"
          >
            <p className="font-vhs text-primary text-sm mb-3">
              TAKE {selected.take + 1} // ORIGINAL FICTION
            </p>
            <p className="type-body leading-relaxed">{selected.scene_text}</p>
            <DeathNarration
              key={selected.id}
              scene={selected}
              filmId={getFilmIdByLocation(selection.location)}
            />
            <p className="type-caption text-muted-foreground mt-4">
              Saved with this death. Reopening it uses no new generation.
            </p>
          </section>
        )}
        <div className="flex flex-wrap gap-2">
          {takes.length > 1 &&
            !dirty &&
            takes.map((r) => (
              <button
                key={r.id}
                aria-pressed={selected?.id === r.id}
                onClick={() => setTake(r.take)}
                className={`${button} text-secondary`}
              >
                Take {r.take + 1}
              </button>
            ))}
          {!selected || dirty ? (
            <button
              disabled={scenes.busy || !scenes.signedIn}
              className={`${button} text-primary flex-1`}
              onClick={() => void generate(0)}
            >
              {scenes.busy ? (
                <>
                  <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                  Developing scene…
                </>
              ) : (
                'Develop death scene · uses AI'
              )}
            </button>
          ) : (
            Math.max(...takes.map((r) => r.take)) < 2 && (
              <button
                disabled={scenes.busy}
                className={`${button} text-primary flex-1`}
                onClick={() =>
                  void generate(
                    Math.min(2, Math.max(...takes.map((r) => r.take)) + 1),
                  )
                }
              >
                {scenes.busy ? 'Developing scene…' : 'Another take · uses AI'}
              </button>
            )
          )}
          <button
            className={`${button} text-muted-foreground`}
            onClick={() => void scenes.refresh()}
          >
            Check saved scenes
          </button>
        </div>
        {!scenes.signedIn && (
          <p className="type-caption text-muted-foreground">
            Sign in to develop scenes. Recording and saving details still work.
          </p>
        )}
        <p role="status" className="type-body-sm text-muted-foreground">
          {scenes.error || message}
        </p>
        <button className={`${button} text-secondary w-full`} onClick={onClose}>
          Back to the game
        </button>
      </DialogContent>
    </Dialog>
  );
}
