import {huntArt} from './volkarArt';
import { PODARCH_HOSTILE } from '../../../supabase/functions/_shared/play/podarchs';
import { podarchArt } from './podarchArt';
import { evomorphStageArt } from './evomorphArt';
import { useAuth } from "@/hooks/useAuth";
import { summarizePlay } from "@/lib/play/events";
import { moduleState } from "@/lib/play/modules";
import { ModulePanel } from "./ModulePanel";
import { moduleDefinitions, type ControlsProps } from "./moduleDefinitions";

export function ModuleControls({
  sessionId,
  ...props
}: ControlsProps & { sessionId: string }) {
  const { user } = useAuth();
  const { entries, bloodlust } = summarizePlay(props.events);
  return (
    <div className="play-module-stack">
      {moduleDefinitions
        .filter((module) => props[module.owner] === module.match && !(module.id === 'hellscape' && props.killer === 'The Podarchs'))
        .sort((a,b)=>a.owner===b.owner?0:a.owner==="killer"?-1:1)
        .map((module) => {
          const key = `final-girl-module-panel-v1:${user?.id ?? "guest"}:${sessionId}:${module.id}`;
          return (
            <ModulePanel
              key={key}
              id={module.id}
              title={module.title}
              kind={module.owner === "killer" ? "Killer" : "Location"}
              art={module.id === 'volkar' ? huntArt(moduleState(entries,'volkar').hunt ?? (props.volkarFresh && !props.events.length ? 'concealed' : undefined)) : module.id === 'podarchs' ? podarchArt(bloodlust === undefined ? 'banner' : bloodlust >= PODARCH_HOSTILE ? 'hostile' : 'docile') : module.id === 'evomorph' ? evomorphStageArt(moduleState(entries, 'evomorph').stage) : module.art}
              summary={module.summary(moduleState(entries, module.id), props)}
              preferenceKey={key}
            >
              <module.Controls {...props} />
            </ModulePanel>
          );
        })}
    </div>
  );
}
