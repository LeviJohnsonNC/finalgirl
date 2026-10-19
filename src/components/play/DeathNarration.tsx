import { Volume2, Square, Loader2 } from "lucide-react";
import { useNarration } from "@/hooks/useNarration";
import { NarrationTransport } from "@/components/NarrationTransport";
import type { DeathScene } from "@/lib/play/death";
export function DeathNarration({
  scene,
  filmId,
}: {
  scene: DeathScene;
  filmId: string | null;
}) {
  const { isPlaying, isNarrating, progress, toggleNarration, stopNarration } =
    useNarration();
  return (
    <div className="play-death-narration">
      <button
        aria-label={
          isPlaying || isNarrating
            ? "Stop death narration"
            : "Narrate death scene"
        }
        title={isPlaying || isNarrating ? "Stop narration" : "Narrate scene"}
        onClick={() => {
          if (isPlaying || isNarrating) stopNarration();
          else
            void toggleNarration(scene.scene_text, {
              kind: "death",
              filmId,
              deathSceneId: scene.id,
              gameId: scene.session_id,
            });
        }}
        className="play-death-audio-button vcr-tape-button w-11 h-11 p-3 text-secondary inline-flex items-center justify-center"
      >
        {isNarrating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Square className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
      {isPlaying && (
        <NarrationTransport
          elapsed={progress.elapsed}
          duration={progress.duration}
        />
      )}
    </div>
  );
}
