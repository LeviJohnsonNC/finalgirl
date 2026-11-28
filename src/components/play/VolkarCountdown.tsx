import { newPlayEvent, summarizePlay, type PlayEvent } from "@/lib/play/events";
import { moduleState } from "@/lib/play/modules";
import { useModuleRecord } from "./useModuleRecord";
import { RevealedCard } from "./RevealedCard";
import type { IllustratedKillerCard } from "./killerPresentation";

export function VolkarCountdown({
  card,
  events,
  onEvent,
  disabled,
}: {
  card: IllustratedKillerCard;
  events: PlayEvent[];
  onEvent: (e: PlayEvent) => boolean;
  disabled: boolean;
}) {
  const entries = summarizePlay(events).entries;
  const reveal = entries.find((e) => e.momentType === "finale");
  const count = moduleState(entries, "volkar").countdown;
  const { record, message } = useModuleRecord(events, onEvent);
  return (
    <section
      className="volkar-device"
      data-module-control="objective"
      aria-label="Self-Destruct Countdown"
    >
      <RevealedCard card={card} label="Finale" showEyebrow={false}>
        <div className="volkar-countdown">
          <strong aria-live="polite">
            {typeof count === "number"
              ? count +
                (count === 1 ? " charge remaining" : " charges remaining")
              : "Countdown unrecorded"}
          </strong>
          <p>
            Kill the Volk’ar and be on an Exit before the final Countdown token
            is removed.
          </p>
          <div className="volkar-actions">
            {[0, 1, 2, 3].map((n) => (
              <button
                key={n}
                aria-label={"Set remaining charges to " + n}
                aria-pressed={n === count}
                disabled={disabled || n === count}
                onClick={() =>
                  record(
                    newPlayEvent({
                      kind: "module",
                      target: reveal?.id,
                      moduleData: {
                        module: "volkar",
                        changes: { countdown: n },
                      },
                    }),
                  )
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </RevealedCard>
      {message && <p role="alert">{message}</p>}
    </section>
  );
}
