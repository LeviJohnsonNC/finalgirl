import { useEffect, useMemo, useState } from 'react';
import { RuleChapter as Chapter, RuleSection as Section, GlossaryTerm } from '@/data/rules/types';
import { RuleSection } from './RuleSection';
import { RuleSubTabs } from './RuleSubTabs';
import { getChapterArt } from './chapterArt';

interface RuleChapterProps {
  chapter: Chapter;
  allSections: Section[];
  glossary: GlossaryTerm[];
  initialSubId?: string;
  onJumpTo: (id: string) => void;
  customBody?: React.ReactNode;
}

/** One focused article, backed by the same section corpus as the chapter index. */
export const RuleChapter = ({ chapter, allSections, glossary, initialSubId, onJumpTo, customBody }: RuleChapterProps) => {
  const sections = useMemo(() => chapter.sectionIds
    .map(id => allSections.find(s => s.id === id))
    .filter((s): s is Section => !!s), [chapter, allSections]);
  // Every section is reachable, including nested action/phase rules. Flatten
  // navigation, not the corpus: an article displays one focused section.
  const subTabs = useMemo(() => sections.length <= 1 ? [] : sections
    .map(s => ({ id: s.id, label: s.title.replace(/^\d+\.\s*/, '') })), [sections]);
  const [activeSubId, setActiveSubId] = useState(initialSubId ?? subTabs[0]?.id ?? sections[0]?.id ?? '');

  useEffect(() => {
    if (initialSubId && subTabs.some(tab => tab.id === initialSubId)) setActiveSubId(initialSubId);
  }, [initialSubId, subTabs]);

  const active = sections.find(s => s.id === activeSubId) ?? sections[0];
  const visibleSections = subTabs.length === 0 ? sections : active ? [active] : [];

  return (
    <article id={chapter.id} className="rule-article" aria-labelledby="rule-reader-title">
      <header className="rule-article-hero">
        <img src={getChapterArt(chapter)} alt="" fetchPriority="high" />
        <div className="rule-article-shade" aria-hidden="true" />
        <span className="rule-hero-meta">CHAPTER {chapter.number} / SURVIVAL MANUAL</span>
        <div className="rule-hero-title">
          <span className="rule-number">{chapter.number}</span>
          <div><h1 id="rule-reader-title" tabIndex={-1}>{chapter.title}</h1><p>{chapter.subtitle}</p></div>
        </div>
      </header>
      <div className="rule-paper">
        {customBody ?? <>
          {subTabs.length > 1 && <RuleSubTabs tabs={subTabs} activeId={active?.id ?? ''} onSelect={setActiveSubId} />}
          <div className="rule-article-sections" id="rule-section-panel" role={subTabs.length > 1 ? 'tabpanel' : undefined}
            aria-labelledby={subTabs.length > 1 ? `rule-tab-${active?.id}` : undefined}>
            {visibleSections.map(section => <RuleSection key={section.id} section={section} allSections={allSections}
              glossary={glossary} onJumpTo={onJumpTo} showTitle={sections.length > 1 && section.title !== chapter.title} />)}
          </div>
        </>}
      </div>
    </article>
  );
};
