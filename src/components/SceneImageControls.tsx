import { ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { useImageGeneration } from '@/hooks/useImageGeneration';

interface SceneImageControlsProps {
  /** True while the parent's auto-generation pass is running. */
  isGenerating: boolean;
  hasImage: boolean;
  onGenerate: () => void;
  disabled?: boolean;
}

/**
 * Manual trigger for the scene still / poster. Images generate on their own now,
 * so this is the "I didn't like that one" button rather than the primary path.
 */
const SceneImageControls = ({ isGenerating, hasImage, onGenerate, disabled }: SceneImageControlsProps) => {
  const { isAuthenticated } = useImageGeneration();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/20 border border-muted-foreground/10 rounded-sm w-full sm:w-auto">
        <ImageIcon className="w-3.5 h-3.5 text-muted-foreground/50" />
        <p className="font-vhs text-[10px] text-muted-foreground/60">
          Sign in to develop scene photography.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={onGenerate}
      disabled={isGenerating || disabled}
      className="vcr-tape-button flex items-center justify-center gap-2 px-4 sm:px-6 py-3 font-display text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-50 min-h-[44px] w-full sm:w-auto"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : hasImage ? (
        <RefreshCw className="w-4 h-4" />
      ) : (
        <ImageIcon className="w-4 h-4" />
      )}
      {isGenerating ? 'Developing...' : hasImage ? 'Reshoot' : 'Develop Scene'}
    </button>
  );
};

export default SceneImageControls;
