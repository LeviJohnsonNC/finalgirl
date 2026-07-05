import { useState, useEffect, useRef } from 'react';
import shuffleSound from '@/assets/sounds/card-shuffle.mp3';
import { LoreInfoModal } from './LoreInfoModal';
import shufflePlate from '@/assets/buttons/shuffle-plate.png.asset.json';
import choosePlate from '@/assets/buttons/choose-plate.png.asset.json';
import emptyKillerFrame from '@/assets/frames/empty-killer.png.asset.json';
import emptyLocationFrame from '@/assets/frames/empty-location.png.asset.json';
import emptyFinalGirlFrame from '@/assets/frames/empty-finalgirl.png.asset.json';
import { useActiveImages } from '@/hooks/useActiveImages';

interface CastingSlotProps {
  type: 'killer' | 'location' | 'finalGirl';
  value: string | null;
  options: string[];
  onShuffle: () => void;
  onChoose: () => void;
  isShuffling?: boolean;
  shuffleKey?: number;
}

const SLOT_LABELS = {
  killer: 'KILLER',
  location: 'LOCATION',
  finalGirl: 'FINAL GIRL',
};

const EMPTY_LABELS = {
  killer: 'UNIDENTIFIED',
  location: 'UNKNOWN SITE',
  finalGirl: 'UNASSIGNED',
};

const META_TAGS = {
  killer: 'KILLER',
  location: 'SITE',
  finalGirl: 'SURVIVOR',
};

const EMPTY_FRAME = {
  killer: emptyKillerFrame.url,
  location: emptyLocationFrame.url,
  finalGirl: emptyFinalGirlFrame.url,
};

const getObjectPosition = (type: 'killer' | 'location' | 'finalGirl', value: string | null): string => {
  if (value === 'Dr. Fright') return 'object-center';
  if (value === 'Poltergeist') return 'object-center';
  if (type === 'killer') return 'object-top';
  return '';
};

export const CastingSlot = ({
  type,
  value,
  options,
  onShuffle,
  onChoose,
  isShuffling = false,
  shuffleKey = 0,
}: CastingSlotProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shuffleSequence, setShuffleSequence] = useState<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedRef = useRef<boolean>(false);
  const { getImageForValue } = useActiveImages();

  useEffect(() => {
    if (preloadedRef.current || options.length === 0) return;
    preloadedRef.current = true;
    options.forEach(option => {
      const imgSrc = getImageForValue(type, option);
      if (imgSrc) {
        const img = new Image();
        img.src = imgSrc;
      }
    });
  }, [options, type, getImageForValue]);

  useEffect(() => {
    if (isShuffling && options.length > 0 && value) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(shuffleSound);
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(() => {});

      requestAnimationFrame(() => {
        const sequence: string[] = [];
        for (let i = 0; i < 22; i++) {
          const randomIdx = Math.floor(Math.random() * options.length);
          sequence.push(options[randomIdx]);
        }
        sequence.push(value);
        setShuffleSequence(sequence);
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else if (!isShuffling) {
      setDisplayValue(value);
    }
  }, [isShuffling, shuffleKey, value, options]);

  const handleAnimationEnd = () => {
    setIsAnimating(false);
    setShuffleSequence([]);
    setDisplayValue(value);
  };

  const cardImage = getImageForValue(type, displayValue);
  const isEmpty = !displayValue && !isAnimating;
  const isLocation = type === 'location';

  // Portrait for killer/final girl (2:3). Landscape for location (3:2).
  // Widths chosen so the location card is ~1.5x the portrait width, same visual height.
  const slotDimensions = isLocation
    ? 'w-[22rem] md:w-[26rem] aspect-[3/2]'
    : 'w-[14.5rem] md:w-[17.25rem] aspect-[2/3]';

  return (
    <div className="casting-slot flex flex-col items-center gap-3 shrink-0 min-w-0">
      {/* Slot label */}
      <span className="font-display text-xs text-muted-foreground tracking-[0.28em] uppercase">
        {SLOT_LABELS[type]}
      </span>

      {/* The card */}
      <div className={`relative ${slotDimensions}`}>
        {isEmpty ? (
          <button
            type="button"
            onClick={onChoose}
            className="evidence-frame w-full h-full"
            aria-label={`Choose ${SLOT_LABELS[type]}`}
          >
            <img src={EMPTY_FRAME[type]} alt="" className="frame-png" />
            <span className="evidence-frame__label">{EMPTY_LABELS[type]}</span>
          </button>
        ) : (
          <div
            className="case-frame w-full h-full cursor-pointer"
            onClick={!isAnimating ? onChoose : undefined}
            style={{ cursor: isAnimating ? 'default' : 'pointer' }}
          >
            <span className="case-frame__cnr-bl" />
            <span className="case-frame__cnr-br" />
            <span className="case-frame__crosshair" />

            {isAnimating && shuffleSequence.length > 0 ? (
              <div
                key={shuffleKey}
                className="slot-reel absolute inset-0"
                style={{ '--item-count': shuffleSequence.length } as React.CSSProperties}
                onAnimationEnd={handleAnimationEnd}
              >
                {shuffleSequence.map((option, idx) => {
                  const img = getImageForValue(type, option);
                  const positionClass = getObjectPosition(type, option);
                  return img ? (
                    <img
                      key={idx}
                      src={img}
                      alt={option}
                      className={`w-full h-full object-cover flex-shrink-0 ${positionClass}`}
                      loading="eager"
                    />
                  ) : (
                    <div key={idx} className="w-full h-full mystery-static flex-shrink-0" />
                  );
                })}
              </div>
            ) : cardImage ? (
              <img
                src={cardImage}
                alt={displayValue || ''}
                className={`absolute inset-0 w-full h-full object-cover ${getObjectPosition(type, displayValue)}`}
              />
            ) : (
              <div className="absolute inset-0 mystery-static" />
            )}

            <div className="absolute inset-0 vhs-softness pointer-events-none" />
            <div className="absolute inset-0 film-grain pointer-events-none opacity-70" />
            <div className="absolute inset-0 scanlines-overlay pointer-events-none opacity-40" />
          </div>
        )}
      </div>

      {/* Dossier metadata strip */}
      <div className="min-h-[1.5rem] flex items-center justify-center gap-1.5">
        {isAnimating ? (
          <span className="font-vhs text-sm text-muted-foreground/50 animate-pulse tracking-widest">SCANNING...</span>
        ) : displayValue ? (
          <>
            <span className="dossier-meta">
              <span className="dossier-meta__tag">{META_TAGS[type]}</span>
              <span className="dossier-meta__sep">//</span>
              <span className="dossier-meta__value">{displayValue}</span>
            </span>
            <LoreInfoModal type={type} name={displayValue} />
          </>
        ) : (
          <span className="font-vhs text-xs text-muted-foreground/40 tracking-[0.25em]">
            {META_TAGS[type]} // ————
          </span>
        )}
      </div>

      {/* Plate buttons — equal-width row */}
      <div className="flex gap-3 w-full mt-1">
        <button
          type="button"
          onClick={onShuffle}
          disabled={isAnimating || options.length === 0}
          className="plate-btn plate-btn--shuffle flex-1"
          style={{ backgroundImage: `url(${shufflePlate.url})` }}
          aria-label="Shuffle"
        >
          <span className="plate-btn__label">SHUFFLE</span>
        </button>
        <button
          type="button"
          onClick={onChoose}
          disabled={options.length === 0}
          className="plate-btn plate-btn--choose flex-1"
          style={{ backgroundImage: `url(${choosePlate.url})` }}
          aria-label="Choose"
        >
          <span className="plate-btn__label">CHOOSE</span>
        </button>
      </div>
    </div>
  );
};
