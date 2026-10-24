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
  const entries = summarizePlay(props.events).entries;
  return (
    <div className="play-module-stack">
      {moduleDefinitions
        .filter((module) => props[module.owner] === module.match)
        .sort((a,b)=>a.owner===b.owner?0:a.owner==="killer"?-1:1)
        .map((module) => {
          const key = `final-girl-module-panel-v1:${user?.id ?? "guest"}:${sessionId}:${module.id}`;
          return (
            <ModulePanel
              key={key}
              id={module.id}
              title={module.title}
              kind={module.owner === "killer" ? "Killer" : "Location"}
              art={module.art}
              summary={module.summary(moduleState(entries, module.id))}
              preferenceKey={key}
            >
              <module.Controls {...props} />
            </ModulePanel>
          );
        })}
    </div>
  );
}
