import { useId, useRef } from 'react';
import { PODARCH_MODULE } from '../../../supabase/functions/_shared/play/podarchs';
import { newPlayEvent, type PlayEvent } from '@/lib/play/events';
import { IllustratedTile } from './IllustratedTile';
import { ModuleArtwork } from './ModuleArtwork';
import { podarchArt } from './podarchArt';
import { useModuleRecord } from './useModuleRecord';

const portraitCount = 12;

function isAssimilation(event: PlayEvent) {
  return event.kind === 'module' && event.moduleData?.module === PODARCH_MODULE &&
    event.moduleData.changes.assimilated === true;
}

export function PodarchAssimilation({ entries, events, onEvent, disabled }: {
  entries: readonly PlayEvent[];
  events: PlayEvent[];
  onEvent: (event: PlayEvent) => boolean;
  disabled?: boolean;
}) {
  const statusId = useId();
  const strip = useRef<HTMLDivElement>(null);
  const { record, message } = useModuleRecord(events, onEvent);
  const activeIds = new Set(entries.map(event => event.id));
  // Keep each photo tied to its original observation when another entry is undone.
  const frames = events.filter(isAssimilation)
    .map(({ id }, index) => ({ id, art: `assimilation-${index % portraitCount + 1}` }))
    .filter(frame => activeIds.has(frame.id))
    .reverse();
  const latest = frames[0];
  const count = frames.length;
  const status = count === 0 ? 'No assimilations recorded' :
    count === 1 ? '1 assimilation recorded' : `${count} assimilations recorded`;
  const assimilate = () => {
    const event = newPlayEvent({
      kind: 'module',
      moduleData: { module: PODARCH_MODULE, changes: { assimilated: true } },
    });
    if (record(event) && strip.current) strip.current.scrollLeft = 0;
  };

  return (
    <section className="podarch-assimilation" aria-label="Victim assimilation">
      <IllustratedTile className="module-control-tile"
        art={podarchArt(latest?.art ?? 'assimilation-empty')} title="Record assimilation" status=""
        data-has-portrait={Boolean(latest) || undefined}
        aria-describedby={statusId} disabled={disabled} onClick={assimilate} />
      <p id={statusId} role="status" className="podarch-assimilation-status">{status}</p>
      {latest && (
        <div className="podarch-assimilation-strip" dir="rtl" ref={strip}
          role="region" aria-label="Assimilation portraits" tabIndex={count > 4 ? 0 : undefined}>
          {frames.map(frame => (
            <span className="podarch-assimilation-frame" data-latest={frame.id === latest.id || undefined} key={frame.id}>
              <ModuleArtwork art={podarchArt(frame.art, true)} />
            </span>
          ))}
        </div>
      )}
      {message && <p className="podarch-assimilation-error" role="alert">{message}</p>}
    </section>
  );
}
