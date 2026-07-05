import { useState, useCallback, useMemo } from 'react';
import { AlertTriangle, Play, Loader2, RotateCcw } from 'lucide-react';
import { CastingSlot } from '@/components/CastingSlot';
import { CastingPicker } from '@/components/CastingPicker';
import { ScenarioDropdowns } from '@/components/ScenarioDropdowns';
import { GameIcon } from '@/components/GameIcon';
import { getOwnedContent } from '@/types/gameData';
import { useOwnedFilms } from '@/hooks/useOwnedFilms';
import castingRoomBg from '@/assets/casting-room-bg.png';

interface CastingSelection {
  killer: string | null;
  location: string | null;
  finalGirl: string | null;
}

interface CastingRoomProps {
  onStartGame: (selection: {
    killer: string;
    location: string;
    finalGirl: string;
    setupScenario: string | null;
    startingEvent: string | null;
  }) => void;
  onGoToArchive?: () => void;
}

const CastingRoom = ({ onStartGame, onGoToArchive }: CastingRoomProps) => {
  const { ownedFilms, isLoading, loadError, isDegraded, retryLoadOwnedFilms } = useOwnedFilms();
  
  const [selection, setSelection] = useState<CastingSelection>({
    killer: null,
    location: null,
    finalGirl: null,
  });
  
  // Track scenario selections
  const [selectedSetup, setSelectedSetup] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  
  const [isShufflingAll, setIsShufflingAll] = useState(false);
  const [shufflingSlot, setShufflingSlot] = useState<'killer' | 'location' | 'finalGirl' | null>(null);
  const [activePicker, setActivePicker] = useState<'killer' | 'location' | 'finalGirl' | null>(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  const ownedContent = useMemo(() => getOwnedContent(ownedFilms), [ownedFilms]);
  const hasOwnedContent = ownedFilms.length > 0;
  const isComplete = selection.killer && selection.location && selection.finalGirl;

  const getRandomItem = useCallback((items: string[]) => {
    if (items.length === 0) return null;
    return items[Math.floor(Math.random() * items.length)];
  }, []);

  // Individual slot shuffle
  const handleSlotShuffle = useCallback((slot: 'killer' | 'location' | 'finalGirl') => {
    // Increment shuffle key to allow re-shuffling
    setShuffleKey(prev => prev + 1);
    setShufflingSlot(slot);
    
    const items = slot === 'killer' 
      ? ownedContent.killers 
      : slot === 'location' 
        ? ownedContent.locations 
        : ownedContent.finalGirls;
    
    // Pick final value upfront
    const finalValue = getRandomItem(items);
    setSelection(prev => ({
      ...prev,
      [slot]: finalValue,
    }));
    
    // Clear shuffling state after animation completes (~2.6s)
    setTimeout(() => {
      setShufflingSlot(null);
    }, 2600);
  }, [ownedContent, getRandomItem]);

  // Handle manual selection from picker
  const handleSelect = useCallback((slot: 'killer' | 'location' | 'finalGirl', value: string) => {
    setSelection(prev => ({ ...prev, [slot]: value }));
    setActivePicker(null);
  }, []);

  // Handle press play
  const handlePressPlay = useCallback(() => {
    if (!isComplete || !selection.killer || !selection.location || !selection.finalGirl) return;
    
    onStartGame({
      killer: selection.killer,
      location: selection.location,
      finalGirl: selection.finalGirl,
      setupScenario: selectedSetup,
      startingEvent: selectedEvent,
    });
  }, [isComplete, selection, selectedSetup, selectedEvent, onStartGame]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Loader2 className="w-16 h-16 mb-6 opacity-40 animate-spin text-primary" />
        <h2 className="font-display text-2xl text-foreground mb-3 tracking-wider">LOADING COLLECTION...</h2>
      </div>
    );
  }

  if (loadError && !isDegraded && !hasOwnedContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertTriangle className="w-16 h-16 mb-6 text-destructive/70" />
        <h2 className="font-display text-3xl text-foreground mb-3 tracking-wider">COLLECTION UNAVAILABLE</h2>
        <p className="font-vhs text-muted-foreground max-w-md mb-5">
          Your cloud collection could not be reached. This is a connection problem, not an empty collection.
        </p>
        <button
          onClick={retryLoadOwnedFilms}
          className="font-vhs text-xs inline-flex items-center gap-2 border border-primary/40 px-4 py-2 text-primary hover:bg-primary/10 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          RETRY COLLECTION LOAD
        </button>
      </div>
    );
  }

  if (!hasOwnedContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <GameIcon type="killer" className="w-60 h-60 mb-6 opacity-40" />
        <h2 className="font-display text-3xl text-foreground mb-3 tracking-wider">NO FILMS IN COLLECTION</h2>
        <p className="font-vhs text-muted-foreground max-w-md">
          Visit{' '}
          <button 
            onClick={onGoToArchive}
            className="text-primary hover:text-primary/80 underline underline-offset-2"
          >
            My Collection
          </button>
          {' '}to add Feature Films before casting.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh]">
      {/* Background Image - subtle, atmospheric */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ 
          backgroundImage: `url(${castingRoomBg})`,
          opacity: 0.35,
        }}
      />
      
      {/* Film Grain Overlay - very subtle */}
      <div className="film-grain fixed inset-0 pointer-events-none opacity-[0.07]" />
      
      {/* Vignette */}
      <div className="vignette fixed inset-0 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center py-8 pt-24">
        {isDegraded && (
          <div className="mb-6 border border-primary/30 bg-background/70 px-4 py-2 text-center font-vhs text-[10px] text-muted-foreground tracking-wider">
            CLOUD ARCHIVE RECONNECTING • USING SAVED COLLECTION
          </div>
        )}
        {/* Three Casting Slots — files-on-a-desk layout, same height */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8 mb-10 md:mb-12 w-full px-4">
          <CastingSlot
            type="killer"
            value={selection.killer}
            options={ownedContent.killers}
            onShuffle={() => handleSlotShuffle('killer')}
            onChoose={() => setActivePicker('killer')}
            isShuffling={isShufflingAll || shufflingSlot === 'killer'}
            shuffleKey={shuffleKey}
          />
          <CastingSlot
            type="location"
            value={selection.location}
            options={ownedContent.locations}
            onShuffle={() => handleSlotShuffle('location')}
            onChoose={() => setActivePicker('location')}
            isShuffling={isShufflingAll || shufflingSlot === 'location'}
            shuffleKey={shuffleKey}
          />
          <CastingSlot
            type="finalGirl"
            value={selection.finalGirl}
            options={ownedContent.finalGirls}
            onShuffle={() => handleSlotShuffle('finalGirl')}
            onChoose={() => setActivePicker('finalGirl')}
            isShuffling={isShufflingAll || shufflingSlot === 'finalGirl'}
            shuffleKey={shuffleKey}
          />
        </div>

        {/* Case Options strip */}
        <div className="w-full max-w-3xl px-4 mb-10">
          <div className="border-t border-border/40 pt-4">
            <div className="font-vhs text-xs text-muted-foreground/70 tracking-[0.25em] mb-3">
              CASE OPTIONS //
            </div>
            <ScenarioDropdowns
              selectedLocation={selection.location}
              onSetupChange={setSelectedSetup}
              onEventChange={setSelectedEvent}
            />
          </div>
        </div>

        {/* Press Play */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handlePressPlay}
            disabled={!isComplete}
            className={`
              press-play-btn
              px-8 py-4 md:px-10 md:py-5
              flex items-center gap-3
              font-display text-lg md:text-xl tracking-[0.15em] uppercase
              transition-all duration-500
              ${isComplete
                ? 'cta-unlocked vcr-tape-button text-foreground'
                : 'cta-locked text-muted-foreground/50 cursor-not-allowed'
              }
            `}
          >
            <Play className={`w-5 h-5 ${isComplete ? 'text-primary' : ''}`} />
            <span>Press Play</span>
          </button>
          <p
            className={`press-play-helper ${
              isComplete ? 'text-primary/70' : 'text-muted-foreground/40'
            }`}
          >
            {isComplete ? 'Tape ready' : 'Cast your feature to begin'}
          </p>
        </div>
      </div>

      {/* Picker Modal */}
      {activePicker && (
        <CastingPicker
          type={activePicker}
          options={
            activePicker === 'killer' 
              ? ownedContent.killers 
              : activePicker === 'location' 
                ? ownedContent.locations 
                : ownedContent.finalGirls
          }
          onSelect={(value) => handleSelect(activePicker, value)}
          onClose={() => setActivePicker(null)}
        />
      )}
    </div>
  );
};

export default CastingRoom;
