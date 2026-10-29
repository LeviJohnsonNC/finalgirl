import {konradParent} from '@/lib/play/konrad';
import {
  canUndoKonrad,
  describeEvent,
  summarizePlay,
  isPermanentMoment,
  isLockedPlayEvent,
  type PlayEvent,
} from "@/lib/play/events";
interface Props {
  events: PlayEvent[];
  onToggle?: (event: PlayEvent, undone: boolean) => void;
  onDeath?: (event: PlayEvent) => void;
  onMoment?: (event: PlayEvent) => void;
  limit?: number;
}
export function PlayTimeline({
  events,
  onToggle,
  onDeath,
  onMoment,
  limit = 100,
}: Props) {
  const summary = summarizePlay(events);
  const originals = events
    .filter((e) => !["undo", "restore", "details"].includes(e.kind))
    .filter((e) => !(e.permanent && !summary.entries.some(entry => entry.id === e.id)))
    .slice(-limit)
    .reverse();
  return (
    <section aria-label="Game timeline" className="space-y-3">
      <h3 className="font-display uppercase text-secondary tracking-widest text-sm">
        The night so far
      </h3>
      {originals.length === 0 && (
        <p className="type-body-sm text-muted-foreground">
          Your first observation starts the tape.
        </p>
      )}
      <ol
        className="play-timeline-list space-y-3"
        tabIndex={0}
        aria-label="Timeline entries"
      >
        {originals.map((original) => {
          const entry =
            summary.entries.find((e) => e.id === original.id) ?? original;
          const undone = summary.inactive.has(original.id);
          const konradBlocked=original.moduleData?.module==='konrad'&&(undone?konradParent(summary.entries)!==(original.konradAction?.parent??'root'):!canUndoKonrad(events,original.id));
          const round = "currentRound" in entry ? entry.currentRound : null;
          return (
            <li
              key={entry.id}
              className={`border-l-2 pl-3 ${undone ? "border-border text-muted-foreground" : entry.kind === "killed" ? "border-primary/60" : "border-secondary/40"}`}
            >
              <p className="type-caption text-muted-foreground">
                {typeof round === "number"
                  ? `ROUND ${round.toString().padStart(2, "0")}`
                  : undone
                    ? "UNDONE"
                    : "ROUND ?"}
              </p>
              <p
                className={`type-body-sm ${undone ? "line-through opacity-60" : "text-foreground"}`}
              >
                {describeEvent(entry)}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {onToggle && entry.kind !== "start" && !isPermanentMoment(entry) && !isLockedPlayEvent(entry) && (
                  <button
                    type="button"
                    disabled={konradBlocked}
                    title={konradBlocked?"Undo or restore the intervening USS Konrad observations first":undefined}
                    onClick={() => onToggle(original, undone)}
                    className="type-caption underline text-muted-foreground hover:text-foreground min-h-[44px]"
                  >
                    {undone ? "Restore" : "Undo"}
                    <span className="sr-only"> {describeEvent(entry)}</span>
                  </button>
                )}
                {onMoment && entry.kind === "moment" && !undone && (
                  <button
                    type="button"
                    className="type-caption underline min-h-[44px]"
                    onClick={() => onMoment(entry)}
                  >
                    Edit detail
                  </button>
                )}
                {onDeath && entry.kind === "killed" && !undone && (
                  <button
                    type="button"
                    onClick={() => onDeath(entry)}
                    className="type-caption underline text-primary min-h-[44px]"
                  >
                    Death details
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {events.length > 100 && limit === 100 && (
        <p className="type-caption text-muted-foreground">
          Showing the latest 100 observations. The complete log remains saved.
        </p>
      )}
    </section>
  );
}
