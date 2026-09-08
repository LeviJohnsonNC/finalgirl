import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GlossaryTerm as GlossaryTermType } from '@/data/rules/types';

interface GlossaryTermProps {
  term: GlossaryTermType;
  onJumpTo?: (sectionId: string) => void;
}

export const GlossaryTerm = ({ term, onJumpTo }: GlossaryTermProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        className="font-medium text-primary/90 underline decoration-dotted decoration-primary/70 underline-offset-[3px] hover:text-primary hover:decoration-primary transition-colors cursor-help"
      >
        {term.term}
      </button>
    </PopoverTrigger>
    <PopoverContent
      side="top"
      className="glossary-popover w-72 p-0 border-0 bg-transparent shadow-none"
    >
      <div className="glass-card border border-primary/30 rounded-sm overflow-hidden">
        <div className="vhs-label flex items-center justify-between px-3 py-1.5 border-b border-primary/30 bg-primary/10">
          <span className="type-caption uppercase text-primary">
            ▸ {term.term}
          </span>
          <span className="type-micro uppercase text-muted-foreground">
            DEF
          </span>
        </div>
        <div className="px-3 py-2.5">
          <p className="type-body-sm text-foreground/90 leading-relaxed">{term.short}</p>
          {term.sectionId && onJumpTo && (
            <button
              onClick={() => onJumpTo(term.sectionId!)}
              className="mt-2 type-caption uppercase text-secondary hover:text-secondary/80 transition-colors"
            >
              → Jump to section
            </button>
          )}
        </div>
      </div>
    </PopoverContent>
  </Popover>
);
