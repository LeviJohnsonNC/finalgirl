import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, ArrowUp } from 'lucide-react';
import { RuleChapter as RuleChapterType, RuleSection as RuleSectionType, GlossaryTerm } from '@/data/rules/types';
import { RuleSection } from './RuleSection';
import { RuleSubTabs } from './RuleSubTabs';

const getChapterTag = (title: string, subtitle?: string) => {
  const text = `${title} ${subtitle ?? ''}`.toLowerCase();
  if (/killer|terror|horror|finale|bloodlust/.test(text)) return 'KILLER';
  if (/attack|combat|damage|health/.test(text)) return 'COMBAT';
  if (/victim|bystander|rescue|panic/.test(text)) return 'VICTIMS';
  if (/item|search|weapon/.test(text)) return 'ITEMS';
  if (/token|marker|time/.test(text)) return 'TOKENS';
  if (/turn|action|planning|upkeep|phase/.test(text)) return 'TURN';
  return 'CORE';
};

interface RuleChapterProps {
  chapter: RuleChapterType;
  allSections: RuleSectionType[];
  glossary: GlossaryTerm[];
  isOpen: boolean;
  matchCount: number;
  isDimmed: boolean;
  initialSubId?: string;
  onToggle: () => void;
  onJumpTo: (id: string) => void;
  onClose: () => void;
  /** Override body — used for the Glossary chapter */
  customBody?: React.ReactNode;
}

export const RuleChapter = ({
  chapter,
  allSections,
  glossary,
  isOpen,
  matchCount,
  isDimmed,
  initialSubId,
  onToggle,
  onJumpTo,
  onClose,
  customBody,
}: RuleChapterProps) => {
  const sections = useMemo(
    () =>
      chapter.sectionIds
        .map((id) => allSections.find((s) => s.id === id))
        .filter((s): s is RuleSectionType => !!s),
    [chapter, allSections]
  );

  // Build top-level sub-tabs: parent sections (no parentId) + the chapter's first section as fallback.
  const subTabs = useMemo(() => {
    if (sections.length <= 1) return [];
    const tops = sections.filter((s) => !s.parentId || !chapter.sectionIds.includes(s.parentId));
    return tops.map((s) => ({ id: s.id, label: s.title.replace(/^\d+\.\s*/, '') }));
  }, [sections, chapter]);

  const [activeSubId, setActiveSubId] = useState<string>(
    initialSubId ?? subTabs[0]?.id ?? sections[0]?.id ?? ''
  );

  useEffect(() => {
    if (initialSubId && subTabs.some((t) => t.id === initialSubId)) {
      setActiveSubId(initialSubId);
    }
  }, [initialSubId, subTabs]);

  // Sections to render for active sub-tab: the sub itself + any children with parentId === sub.id (in chapter)
  const visibleSections = useMemo(() => {
    if (subTabs.length === 0) return sections;
    const active = sections.find((s) => s.id === activeSubId) ?? sections[0];
    if (!active) return [];
    const children = sections.filter((s) => s.parentId === active.id);
    return [active, ...children];
  }, [sections, subTabs, activeSubId]);

  const hasHits = matchCount > 0;
  const chapterTag = getChapterTag(chapter.title, chapter.subtitle);

  return (
    <div
      id={chapter.id}
      className={`chapter-row ${isOpen ? 'chapter-open' : ''} ${isDimmed ? 'chapter-dimmed' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="chapter-header w-full text-left"
        aria-expanded={isOpen}
      >
        <div className="chapter-number-chip">
          <span className="font-title text-lg sm:text-xl">{chapter.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="chapter-file-meta type-caption uppercase mb-1">
            <span>{chapterTag}</span>
            <span>Archive Ref · VHS-001</span>
          </div>
          <div className="font-title text-base sm:text-lg uppercase tracking-wide text-foreground leading-tight">
            {chapter.title}
          </div>
          {chapter.subtitle && (
            <div className="type-caption uppercase text-muted-foreground mt-0.5">
              {chapter.subtitle}
            </div>
          )}
        </div>
        {hasHits && (
          <span className="hits-chip type-caption uppercase px-2 py-0.5">
            {matchCount} hit{matchCount === 1 ? '' : 's'}
          </span>
        )}
        <ChevronRight
          className={`w-5 h-5 text-secondary/70 transition-transform shrink-0 ${
            isOpen ? 'rotate-90' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="chapter-body">
          <div className="rule-paper">
            {customBody ? (
              customBody
            ) : (
              <>
                {subTabs.length > 0 && (
                  <RuleSubTabs tabs={subTabs} activeId={activeSubId} onSelect={setActiveSubId} />
                )}
                <div className={`${subTabs.length > 0 ? 'mt-5' : ''} space-y-6`}>
                  {visibleSections.map((s, i) => (
                    <RuleSection
                      key={s.id}
                      section={s}
                      allSections={allSections}
                      glossary={glossary}
                      onJumpTo={onJumpTo}
                      showTitle={subTabs.length === 0 ? sections.length > 1 : i > 0}
                    />
                  ))}
                </div>
              </>
            )}

            <button
              onClick={onClose}
              className="back-to-chapters mt-6 inline-flex items-center gap-2 type-caption uppercase"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              Back to Chapters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
