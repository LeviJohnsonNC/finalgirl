import { GameResult } from '@/hooks/useGameHistory';
import { GameOutcomeForm } from '@/components/GameOutcomeForm';
import { EndingFormData } from './TheEnd';

interface GameOutcomeProps {
  result: GameResult;
  introStory?: string;
  onContinue: (formData: EndingFormData) => void;
  onDiscard: () => void;
}

const GameOutcome = ({ result, introStory, onContinue, onDiscard }: GameOutcomeProps) => {
  const isWin = result.outcome === 'won';

  return (
    <div className="relative min-h-[60vh] flex flex-col items-center py-8 px-3 sm:px-4 overflow-x-hidden">
      {/* Header */}
      <div className="text-center space-y-2 mb-8 sm:mb-10">
        <h1 
          className={`font-title text-4xl sm:text-5xl md:text-6xl tracking-[0.3em] uppercase ${
            isWin ? 'text-secondary neon-text' : 'text-primary blood-glow'
          }`}
        >
          {isWin ? 'VICTORY' : 'DEFEAT'}
        </h1>
        
        <div className="space-y-1">
          <p className="type-label text-muted-foreground">
            {result.finalGirl} {isWin ? 'survived' : 'fell to'} {result.killer}
          </p>
          <p className="type-caption text-muted-foreground/70">
            at {result.location}
          </p>
        </div>
      </div>

      {/* Form */}
      <GameOutcomeForm
        result={result}
        introStory={introStory}
        onContinue={onContinue}
        onDiscard={onDiscard}
      />
    </div>
  );
};

export default GameOutcome;
