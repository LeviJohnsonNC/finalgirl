import { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useActiveImages } from '@/hooks/useActiveImages';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface CastingPickerProps {
  type: 'killer' | 'location' | 'finalGirl';
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
}

const PICKER_TITLES = {
  killer: 'SELECT KILLER FILE',
  location: 'SELECT LOCATION FILE',
  finalGirl: 'SELECT FINAL GIRL FILE',
};

const sortOptions = (type: CastingPickerProps['type'], options: string[]) => {
  if (type !== 'finalGirl') return options;
  return [...options].sort((a, b) => a.localeCompare(b));
};

export const CastingPicker = ({ type, options, onSelect, onClose }: CastingPickerProps) => {
  const { getImageForValue } = useActiveImages();
  const isLocation = type === 'location';
  const [query, setQuery] = useState('');

  const sortedOptions = useMemo(() => sortOptions(type, options), [type, options]);
  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return sortedOptions;
    return sortedOptions.filter((option) => option.toLowerCase().includes(trimmed));
  }, [sortedOptions, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="evidence-drawer p-0 gap-0 border-0
          w-screen h-[100dvh] max-w-none rounded-none
          sm:w-[92vw] sm:h-[82vh] sm:max-w-[1200px] sm:rounded-sm
          grid grid-rows-[auto_1fr] overflow-hidden
          [&>button]:hidden"
      >
        {/* Decorative tape corners (desktop only) */}
        <span className="evidence-drawer__tape evidence-drawer__tape--tl hidden sm:block" />
        <span className="evidence-drawer__tape evidence-drawer__tape--tr hidden sm:block" />

        {/* Sticky header */}
        <div className="row-start-1 sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-primary/20 bg-background/85 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-blood animate-pulse" />
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-foreground tracking-[0.18em] truncate">
              {PICKER_TITLES[type]}
            </h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden sm:flex items-center">
              <Search className="absolute left-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files..."
                className="h-9 pl-9 pr-3 w-44 md:w-56 bg-background/60 border border-border/50 rounded-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors font-vhs"
                aria-label="Search files"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile search — sits just below header */}
        <div className="sm:hidden px-4 pb-3 border-b border-primary/20 bg-background/85">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files..."
              className="h-9 w-full pl-9 pr-3 bg-background/60 border border-border/50 rounded-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors font-vhs"
              aria-label="Search files"
            />
          </div>
        </div>

        {/* Scrollable grid */}
        <div className="row-start-2 overflow-y-auto px-3 sm:px-6 py-6 pb-10">
          <div className="relative">
            {/* Subtle scanlines over the wall */}
            <div className="scanlines-overlay pointer-events-none absolute inset-0 opacity-20" />

            {filteredOptions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-vhs">
                NO FILES MATCH “{query}”
              </div>
            )}

            <div
              className={`grid gap-3 sm:gap-5 w-full mx-auto ${
                isLocation
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}
            >
              {filteredOptions.map((option) => {
                const cardImage = getImageForValue(type, option);
                return (
                  <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className="group flex flex-col items-center gap-2 text-left focus:outline-none"
                  >
                    <div
                      className={`evidence-card w-full rounded-sm ${
                        isLocation ? 'aspect-[3/2]' : 'aspect-[2/3]'
                      }`}
                      tabIndex={-1}
                    >
                      <span className="evidence-card__tick" />
                      {cardImage ? (
                        <img
                          src={cardImage}
                          alt={option}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 mystery-static" />
                      )}
                      <div className="absolute inset-0 vhs-softness pointer-events-none" />
                      <div className="absolute inset-0 scanlines-overlay pointer-events-none opacity-30" />
                    </div>
                    <span className="dossier-meta text-center">
                      <span className="dossier-meta__value group-hover:text-primary transition-colors">
                        {option}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
