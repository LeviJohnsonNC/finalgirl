import { useEffect, useState } from 'react';
import { useDeathScenes } from '@/hooks/play/useDeathScenes';
import { deathFacts, deathSignature } from '@/lib/play/death';
import type { GameResult } from '@/hooks/useGameHistory';
export function RecordedDeathScenes({ game }: { game: GameResult }) {
  const { rows, error, refresh } = useDeathScenes(game.id);
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  useEffect(() => {
    let live = true;
    void (async () => {
      const pairs = await Promise.all(
        (game.playEvents ?? [])
          .filter((e) => e.kind === 'killed')
          .map(async (e) => {
            const f = deathFacts(game, game.playEvents!, e.id);
            return f ? [e.id, await deathSignature(f)] : null;
          }),
      );
      if (live)
        setSignatures(
          Object.fromEntries(pairs.filter((p): p is string[] => p !== null)),
        );
    })();
    return () => {
      live = false;
    };
  }, [game]);
  const scenes = rows.filter((r) => r.signature === signatures[r.event_id]);
  if (!scenes.length && !error) return null;
  return (
    <details className="mt-4 border-t border-border pt-3">
      <summary className="font-vhs text-primary min-h-[44px] cursor-pointer">
        DEATH SCENES // {scenes.length}
      </summary>
      <div className="bg-background p-4 space-y-5">
        {scenes.map((r) => (
          <section key={r.id}>
            <p className="font-vhs text-primary text-sm mb-2">
              {deathFacts(game,game.playEvents!,r.event_id)?.room || game.location} // TAKE {r.take + 1} // ORIGINAL FICTION
            </p>
            <p className="type-body-sm text-foreground leading-relaxed">
              {r.scene_text}
            </p>
          </section>
        ))}
        {error && (
          <p className="type-caption text-muted-foreground">
            {error}
            <button
              className="underline min-h-[44px] ml-2"
              onClick={() => void refresh()}
            >
              Retry saved scenes
            </button>
          </p>
        )}
      </div>
    </details>
  );
}
