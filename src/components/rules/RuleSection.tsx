import { RuleSection as RuleSectionType, GlossaryTerm } from '@/data/rules/types';
import { RuleBlock } from './RuleBlock';
import { ArrowRight } from 'lucide-react';

interface RuleSectionProps {
  section: RuleSectionType;
  allSections: RuleSectionType[];
  glossary: GlossaryTerm[];
  onJumpTo: (id: string) => void;
  /** When true, render H2 title (used for stand-alone chapters with one section). Default false. */
  showTitle?: boolean;
}

export const RuleSection = ({
  section,
  allSections,
  glossary,
  onJumpTo,
  showTitle = false,
}: RuleSectionProps) => {
  const seeAlsoSections = (section.seeAlso ?? [])
    .map((id) => allSections.find((s) => s.id === id))
    .filter((s): s is RuleSectionType => !!s);

  return (
    <section id={section.id} className="scroll-mt-32">
      {showTitle && (
        <h3 className="font-title text-lg sm:text-xl text-foreground uppercase tracking-wide mb-3">
          {section.title}
        </h3>
      )}
      <div className="space-y-3">
        {section.body.map((block, i) => (
          <RuleBlock key={i} block={block} glossary={glossary} onJumpTo={onJumpTo} />
        ))}
      </div>

      {seeAlsoSections.length > 0 && (
        <div className="mt-5 pt-3 border-t border-dashed border-primary/20 flex flex-wrap items-center gap-2">
          <span className="type-caption uppercase text-muted-foreground">
            ▸ See also
          </span>
          {seeAlsoSections.map((s) => (
            <button
              key={s.id}
              onClick={() => onJumpTo(s.id)}
              className="see-also-tape inline-flex items-center gap-1 px-2.5 py-1 type-caption uppercase"
            >
              {s.title}
              <ArrowRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
