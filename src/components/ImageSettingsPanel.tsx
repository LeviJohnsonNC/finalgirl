import { Film } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useImageGeneration } from '@/hooks/useImageGeneration';

/**
 * The two image preferences left after image generation moved onto the
 * platform's own key. There is nothing to activate any more — this is only
 * about what the player wants to see.
 */
const ImageSettingsPanel = () => {
  const { isAuthenticated, autoGenerate, useAiCastingArt, updateSettings } = useImageGeneration();

  if (!isAuthenticated) {
    return (
      <div className="relative overflow-hidden rounded-sm border border-muted-foreground/10 bg-card/30 px-4 py-3 opacity-50">
        <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative flex items-center gap-3">
          <Film className="w-4 h-4 text-muted-foreground" />
          <span className="font-display text-sm tracking-[0.15em] text-muted-foreground uppercase">
            Image Engine
          </span>
          <span className="font-vhs text-[10px] text-muted-foreground/60 ml-auto">
            SIGN IN TO DEVELOP
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-sm border border-primary/30 bg-card/60">
      <div className="scanlines pointer-events-none absolute inset-0 opacity-15" />

      <div className="relative px-4 py-3 space-y-4">
        <div className="flex items-center gap-3">
          <Film className="w-4 h-4 text-primary/70 shrink-0" />
          <span className="font-display text-sm tracking-[0.15em] text-foreground uppercase">
            Image Engine
          </span>
          <span className="ml-auto font-vhs text-[10px] tracking-wider px-2 py-0.5 rounded-sm border text-primary border-primary/30 bg-primary/10 blood-glow">
            ONLINE
          </span>
        </div>

        <div className="pt-3 border-t border-muted-foreground/10 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-vhs text-[10px] sm:text-xs text-foreground/80 uppercase tracking-wider">
              Develop Scene Photography
            </p>
            <Switch
              checked={autoGenerate}
              onCheckedChange={(checked) => updateSettings({ autoGenerate: checked })}
            />
          </div>
          <p className="font-vhs text-[9px] sm:text-[10px] text-muted-foreground/70 leading-snug">
            Shoots an opening still as your story begins and a movie poster when it ends. Turn this
            off to play without pictures.
          </p>
        </div>

        <div className="pt-3 border-t border-muted-foreground/10 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-vhs text-[10px] sm:text-xs text-foreground/80 uppercase tracking-wider">
              AI Casting Art
            </p>
            <Switch
              checked={useAiCastingArt}
              onCheckedChange={(checked) => updateSettings({ useAiCastingArt: checked })}
            />
          </div>
          <p className="font-vhs text-[9px] sm:text-[10px] text-muted-foreground/70 leading-snug">
            Off by default. Replaces the official Van Ryder Games art in the casting room with
            AI-generated artwork.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageSettingsPanel;
