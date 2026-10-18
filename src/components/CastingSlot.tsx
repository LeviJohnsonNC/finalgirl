import { useState, useEffect, useRef } from 'react';
import shuffleSound from '@/assets/sounds/card-shuffle.mp3';
import { LoreInfoModal } from './LoreInfoModal';
import shufflePlate from '@/assets/buttons/shuffle-plate.png.asset.json';
import choosePlate from '@/assets/buttons/choose-plate.png.asset.json';
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

  return (
    <div className={`casting-slot casting-slot--${type}`}>
      <div className="casting-slot-top">
        <span className="casting-slot-heading">
          <span className="casting-heading-text">
            {isLocation && displayValue ? displayValue : SLOT_LABELS[type]}
            {displayValue && !isAnimating && <span className="casting-heading-info"><LoreInfoModal type={type} name={displayValue} /></span>}
          </span>
        </span>
        <button type="button" className={`casting-photo ${isEmpty ? 'casting-photo--empty' : ''}`}
          onClick={onChoose} disabled={isAnimating}
          aria-label={`Choose ${SLOT_LABELS[type]}${displayValue ? ': ' + displayValue : ''}`}>
          <span className="casting-photo-window">
            {isEmpty ? (
              <span className="casting-photo-placeholder">{EMPTY_LABELS[type]}</span>
            ) : isAnimating && shuffleSequence.length > 0 ? (
              <span key={shuffleKey} className="slot-reel absolute inset-0"
                style={{ '--item-count': shuffleSequence.length } as React.CSSProperties}
                onAnimationEnd={handleAnimationEnd}>
                {shuffleSequence.map((option, idx) => {
                  const img = getImageForValue(type, option);
                  return img ? (
                    <img key={idx} src={img} alt={option}
                      className={`w-full h-full object-cover flex-shrink-0 ${getObjectPosition(type, option)}`} loading="eager" />
                  ) : <span key={idx} className="block w-full h-full mystery-static flex-shrink-0" />;
                })}
              </span>
            ) : cardImage ? (
              <img src={cardImage} alt={displayValue || ''}
                className={`casting-photo-image ${getObjectPosition(type, displayValue)}`} />
            ) : <span className="absolute inset-0 mystery-static" />}
            <span className="casting-photo-glass" aria-hidden="true" />
            {!isLocation && displayValue && !isAnimating &&
              <span className="casting-photo-caption" aria-hidden="true">{displayValue}</span>}
          </span>
          <span className="casting-photo-border" aria-hidden="true" />
          {!isLocation && <>
            <span className="casting-photo-tape casting-photo-tape--top" aria-hidden="true" />
            {type === 'finalGirl' && <span className="casting-photo-tape casting-photo-tape--bottom" aria-hidden="true" />}
          </>}
        </button>
      </div>

      <div className="casting-slot-controls">
        <div className="casting-slot-buttons">
          <button type="button" onClick={onShuffle} disabled={isAnimating || options.length === 0}
            className="plate-btn plate-btn--shuffle" style={{ backgroundImage: `url(${shufflePlate.url})` }} aria-label="Shuffle">
            <span className="plate-btn__label">SHUFFLE</span>
          </button>
          <button type="button" onClick={onChoose} disabled={options.length === 0}
            className="plate-btn plate-btn--choose" style={{ backgroundImage: `url(${choosePlate.url})` }} aria-label="Choose">
            <span className="plate-btn__label">CHOOSE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
