import { WOLF, WOLF_MINORS, WOLF_MODES, isWolfMode, wolfMinorField, wolfModeLabel } from "@/lib/play/bigBadWolf";
import { newPlayEvent, summarizePlay } from "@/lib/play/events";
import { moduleState, type ModuleValue } from "@/lib/play/modules";
import { KillerCards } from "./KillerCards";
import { MinorPowerControl } from "./MinorPowerControl";
import { MinorPowerGroup } from "./MinorPowerGroup";
import { ModuleArtwork } from "./ModuleArtwork";
import { PlaySelect } from "./PlaySelect";
import { useModuleRecord } from "./useModuleRecord";
import { wolfArt } from "./wolfArt";
import type { ControlsProps } from "./moduleDefinitions";
import "@/styles/play-big-bad-wolf.css";

export function BigBadWolfControls({ events, blocked, onEvent }: ControlsProps) {
  const { entries } = summarizePlay(events);
  const state = moduleState(entries, "big-bad-wolf");
  const { record, message } = useModuleRecord(events, onEvent);
  const observe = (key: string, value: ModuleValue) => record(newPlayEvent({
    kind: "module",
    moduleData: { module: "big-bad-wolf", changes: { [key]: value } },
  }));

  const mode = isWolfMode(state.mode) ? state.mode : undefined;
  return (
    <section className="play-big-bad-wolf" aria-label="Big Bad Wolf tracking">
      <section className="wolf-mode" aria-label="Recorded mode" data-mode={mode ?? "unknown"}>
        <div className="wolf-mode-photo"><ModuleArtwork art={mode ? wolfArt(mode) : { ...wolfArt("header"), fit: "meet" }} /></div>
        <div className="wolf-mode-copy">
          <p className="play-eyebrow">Recorded mode</p>
          <h3 aria-live="polite">{wolfModeLabel(mode, state.powerRevealed)}</h3>
          <p>Resolve Terror effects using the mode at the start of the Killer phase.</p>
          {!mode && (
            <PlaySelect aria-label="Record Wolf mode" value="" disabled={blocked} onChange={event => {
              if (isWolfMode(event.target.value)) observe("mode", event.target.value);
            }}>
              <option value="" disabled>Record mode</option>
              {Object.entries(WOLF_MODES).filter(([id]) => id !== "track" || !state.powerRevealed).map(([id, name]) =>
                <option key={id} value={id}>{name}</option>
              )}
            </PlaySelect>
          )}
        </div>
      </section>
      <section className="wolf-minors" aria-label="Wolf Minor Dark Powers">
        <h3>Minor Dark Powers</h3>
        <MinorPowerGroup>
          {WOLF_MINORS.map(card => {
            const key = wolfMinorField(card.id);
            const value = state[key];
            const health = typeof value === "number" ? value : undefined;
            const previouslyRevealed = entries.some(event =>
              event.moduleData?.module === "big-bad-wolf" && typeof event.moduleData.changes[key] === "number"
            );
            return <MinorPowerControl
              key={card.id}
              name={card.name}
              health={health}
              maxHealth={card.health}
              disabled={blocked}
              previouslyRevealed={previouslyRevealed}
              art={() => wolfArt(card.id, true)}
              heroArt={wolfArt(card.id, !health)}
              onChange={value => observe(key, value)}
            />;
          })}
        </MinorPowerGroup>
      </section>
      <KillerCards killer={WOLF} events={events} onEvent={onEvent} disabled={blocked} />
      {message && <p role="alert" className="play-module-error">{message}</p>}
    </section>
  );
}
