import { Volume2, Square, Loader2 } from 'lucide-react';
import { useNarration } from '@/hooks/useNarration';
import { NarrationTransport } from '@/components/NarrationTransport';
import type { DeathScene } from '@/lib/play/death';
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
    <div className="border-t border-border/50 pt-3 mt-4">
      <button
        aria-label={
          isPlaying || isNarrating
            ? 'Stop death narration'
            : 'Narrate death scene'
        }
        onClick={() => {
          if (isPlaying || isNarrating) stopNarration();
          else
            void toggleNarration(scene.scene_text, {
              kind: 'death',
              filmId,
              deathSceneId: scene.id,
            });
        }}
        className="vcr-tape-button min-h-[48px] px-4 py-3 text-secondary font-display uppercase text-sm flex gap-2 items-center"
      >
        {isNarrating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Square className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {isNarrating
          ? 'Preparing audio…'
          : isPlaying
            ? 'Stop narration'
            : 'Narrate scene'}
      </button>
      {isPlaying && (
        <NarrationTransport
          elapsed={progress.elapsed}
          duration={progress.duration}
        />
      )}
      <p className="type-caption text-muted-foreground mt-2">
        Audio is optional. Replays use this device’s saved clip when available.
      </p>
    </div>
  );
}
