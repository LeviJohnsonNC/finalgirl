import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, ArrowLeft, ArrowRight, X, BookOpen, ChevronRight } from 'lucide-react';
import { coreRules } from '@/data/rules/coreRules';
import { RuleModule, RuleSection as RuleSectionType, RuleBlock, RuleChapter as RuleChapterType } from '@/data/rules/types';
import { RuleChapter } from '@/components/rules/RuleChapter';
import { getChapterArt, rulebookArt } from '@/components/rules/chapterArt';
import '@/styles/rules.css';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useOwnedFilms } from '@/hooks/useOwnedFilms';
import { FEATURE_FILMS } from '@/types/gameData';
import { ENTITY_RULE_MODULES, buildEntityChapter } from '@/data/rules/moduleRules';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MODULES: RuleModule[] = [coreRules];

type RuleCategory = 'ALL' | 'CORE' | 'TURN' | 'COMBAT' | 'KILLER' | 'TOKENS' | 'VICTIMS' | 'ITEMS' | 'LOCATION';

const CATEGORY_FILTERS: RuleCategory[] = ['ALL', 'CORE', 'TURN', 'COMBAT', 'KILLER', 'TOKENS', 'VICTIMS', 'ITEMS', 'LOCATION'];

function blockToText(block: RuleBlock): string {
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      return block.text;
    case 'list':
      return block.items.join(' ');
    case 'callout':
      return `${block.title ?? ''} ${block.text}`;
    case 'example':
      return `${block.title} ${block.text}`;
    case 'table':
      return [...block.headers, ...block.rows.flat()].join(' ');
  }
}

function sectionMatches(section: RuleSectionType, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  let count = 0;
  if (section.title.toLowerCase().includes(q)) count += 3;
  if (section.tags?.some((t) => t.toLowerCase().includes(q))) count += 2;
  for (const block of section.body) {
    const text = blockToText(block).toLowerCase();
    let idx = 0;
    while ((idx = text.indexOf(q, idx)) !== -1) {
      count += 1;
      idx += q.length;
    }
  }
  return count;
}

function getChapterCategory(chapter: RuleChapterType, sections: RuleSectionType[], killerIds: Set<string>, locationIds: Set<string>): RuleCategory | 'LOCATION' {
  if (killerIds.has(chapter.id)) return 'KILLER';
  if (locationIds.has(chapter.id)) return 'LOCATION';
  const coreCategories: Record<string, RuleCategory> = {
    'ch-overview': 'CORE', 'ch-boards': 'CORE', 'ch-game-turn': 'TURN',
    'ch-attacking': 'COMBAT', 'ch-bloodlust': 'KILLER', 'ch-tokens-cards': 'TOKENS',
    'ch-minions': 'KILLER', 'ch-items': 'ITEMS', 'ch-end': 'CORE', 'ch-glossary': 'CORE',
  };
  if (coreCategories[chapter.id]) return coreCategories[chapter.id];
  if (sections.some(section => chapter.sectionIds.includes(section.id) && section.tags?.includes('victim'))) return 'VICTIMS';
  return 'CORE';
}

const Rules = () => {
  const coreModule = MODULES[0];
  const { ownedFilms } = useOwnedFilms();

  const { ownedKillers, ownedLocations } = useMemo(() => {
    const killers = new Set<string>();
    const locations = new Set<string>();
    for (const film of FEATURE_FILMS) {
      if (!ownedFilms.includes(film.id)) continue;
      if (film.killer) killers.add(film.killer);
      if (film.location) locations.add(film.location);
    }
    return { ownedKillers: killers, ownedLocations: locations };
  }, [ownedFilms]);

  const { killerChapters, locationChapters, entitySections } = useMemo(() => {
    const killerChapters: RuleChapterType[] = [];
    const locationChapters: RuleChapterType[] = [];
    const entitySections: RuleSectionType[] = [];
    let kI = 0;
    let lI = 0;
    for (const mod of ENTITY_RULE_MODULES) {
      const owned =
        mod.kind === 'killer'
          ? ownedKillers.has(mod.entity)
          : ownedLocations.has(mod.entity);
      if (!owned) continue;
      const number =
        mod.kind === 'killer'
          ? `K${String(++kI).padStart(2, '0')}`
          : `L${String(++lI).padStart(2, '0')}`;
      const built = buildEntityChapter(mod, number);
      entitySections.push(...built.sections);
      if (mod.kind === 'killer') killerChapters.push(built.chapter);
      else locationChapters.push(built.chapter);
    }
    return { killerChapters, locationChapters, entitySections };
  }, [ownedKillers, ownedLocations]);

  const module = useMemo<RuleModule>(
    () => ({
      ...coreModule,
      sections: [...coreModule.sections, ...entitySections],
      chapters: [...coreModule.chapters, ...killerChapters, ...locationChapters],
    }),
    [coreModule, entitySections, killerChapters, locationChapters]
  );
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<RuleCategory>('ALL');
  const [openChapterId, setOpenChapterId] = useLocalStorage<string | null>(
    'rules-open-chapter',
    null
  );
  const [initialSubBySection, setInitialSubBySection] = useState<Record<string, string>>({});
  const indexScroll = useRef(0);
  const lastIndexChapter = useRef<string | null>(null);
  const pendingHash = useRef(window.location.hash.match(/^#rules\/(.+)$/)?.[1] ?? null);

  // Match counts per section
  const sectionMatchCounts = useMemo(() => {
    if (!query.trim()) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    for (const s of module.sections) {
      const c = sectionMatches(s, query.trim());
      if (c > 0) counts[s.id] = c;
    }
    // Glossary chapter — match against terms
    return counts;
  }, [query, module]);

  const glossaryHits = useMemo(() => {
    if (!query.trim()) return 0;
    const q = query.trim().toLowerCase();
    return module.glossary.filter(
      (t) => t.term.toLowerCase().includes(q) || t.short.toLowerCase().includes(q)
    ).length;
  }, [query, module]);

  // Match counts per chapter (sum of its sections + glossary chapter handles its own)
  const chapterMatchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ch of module.chapters) {
      const title = `${ch.title} ${ch.subtitle ?? ''}`.toLowerCase();
      const titleHits = query.trim() && title.includes(query.trim().toLowerCase()) ? 3 : 0;
      if (ch.id === 'ch-glossary') {
        if (glossaryHits + titleHits > 0) counts[ch.id] = glossaryHits + titleHits;
        continue;
      }
      let total = titleHits;
      for (const sid of ch.sectionIds) total += sectionMatchCounts[sid] ?? 0;
      if (total > 0) counts[ch.id] = total;
    }
    return counts;
  }, [module, sectionMatchCounts, glossaryHits, query]);

  const killerIds = useMemo(() => new Set(killerChapters.map(c => c.id)), [killerChapters]);
  const locationIds = useMemo(() => new Set(locationChapters.map(c => c.id)), [locationChapters]);
  const isSearching = query.trim().length > 0;
  const visibleChapters = module.chapters.filter(ch => {
    const categoryMatches = activeCategory === 'ALL'
      || getChapterCategory(ch, module.sections, killerIds, locationIds) === activeCategory
      || (activeCategory === 'VICTIMS' && ch.sectionIds.some(id => /victim|panic/.test(id)));
    return categoryMatches && (!isSearching || (chapterMatchCounts[ch.id] ?? 0) > 0);
  });
  const activeChapter = module.chapters.find(ch => ch.id === openChapterId);
  const activeIndex = activeChapter ? visibleChapters.findIndex(ch => ch.id === activeChapter.id) : -1;

  const clearHash = useCallback(() => {
    if (window.location.hash.startsWith('#rules/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const handleOpen = useCallback((chapterId: string) => {
    if (!openChapterId) {
      indexScroll.current = window.scrollY;
      lastIndexChapter.current = chapterId;
    }
    clearHash();
    const chapter = module.chapters.find(ch => ch.id === chapterId);
    const match = chapter?.sectionIds.find(id => (sectionMatchCounts[id] ?? 0) > 0);
    if (match) setInitialSubBySection(prev => ({ ...prev, [chapterId]: match }));
    setOpenChapterId(chapterId);
  }, [openChapterId, clearHash, module.chapters, sectionMatchCounts, setOpenChapterId]);

  const handleClose = useCallback(() => {
    clearHash();
    setOpenChapterId(null);
  }, [clearHash, setOpenChapterId]);

  const handleJumpTo = useCallback((sectionId: string) => {
    const chapter = module.chapters.find(ch => ch.sectionIds.includes(sectionId));
    if (!chapter) return;
    setQuery('');
    setActiveCategory('ALL');
    setInitialSubBySection(prev => ({ ...prev, [chapter.id]: sectionId }));
    setOpenChapterId(chapter.id);
    window.history.replaceState(null, '', `#rules/${sectionId}`);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.getElementById(sectionId);
      target?.scrollIntoView({ block: 'start' });
      target?.focus({ preventScroll: true });
    }));
  }, [module, setOpenChapterId]);

  // Wait for collection-specific chapters before resolving an incoming deep link.
  useEffect(() => {
    const sectionId = pendingHash.current;
    if (!sectionId || !module.chapters.some(ch => ch.sectionIds.includes(sectionId))) return;
    pendingHash.current = null;
    handleJumpTo(sectionId);
  }, [module.chapters, handleJumpTo]);

  // Keep direct search-to-rule behavior, including chapters arriving after collection load.
  const firstSearchChapter = isSearching ? visibleChapters[0] : undefined;
  const firstSearchChapterId = firstSearchChapter?.id;
  const firstSearchSectionId = firstSearchChapter?.sectionIds.find(id => (sectionMatchCounts[id] ?? 0) > 0);
  useEffect(() => {
    if (!query.trim()) return;
    setOpenChapterId(firstSearchChapterId ?? null);
    if (firstSearchChapterId && firstSearchSectionId) {
      setInitialSubBySection(prev => ({ ...prev, [firstSearchChapterId]: firstSearchSectionId }));
    }
  }, [query, firstSearchChapterId, firstSearchSectionId, setOpenChapterId]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      // Live search must never steal keyboard focus while someone is typing.
      if (document.activeElement?.matches('.rulebook-search input')) return;
      if (openChapterId) {
        const heading = document.getElementById('rule-reader-title');
        heading?.focus({ preventScroll: true });
        // A deep link owns its exact section scroll position.
        if (!window.location.hash.startsWith('#rules/')) {
          document.getElementById('rule-reader')?.scrollIntoView({ block: 'start' });
        }
      } else {
        window.scrollTo({ top: indexScroll.current });
        if (lastIndexChapter.current) document.getElementById(`open-${lastIndexChapter.current}`)?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [openChapterId]);

  const filteredGlossary = module.glossary.filter(t => !isSearching || query.trim().toLowerCase() === 'glossary'
    || `${t.term} ${t.short}`.toLowerCase().includes(query.trim().toLowerCase()));
  const glossaryBody = (
    <div className="rule-glossary">
      {filteredGlossary.map(term => (
        <div key={term.id} className="glossary-entry">
          <h2>{term.term}</h2>
          <p>{term.short}</p>
          {term.sectionId && <button onClick={() => handleJumpTo(term.sectionId!)} className="rule-text-link">Read the rule <ArrowRight size={14} /></button>}
        </div>
      ))}
      {filteredGlossary.length === 0 && <p>No terms match “{query}”.</p>}
    </div>
  );

  const renderIndexGroup = (chapters: RuleChapterType[], label: string, hint: string) => chapters.length > 0 && (
    <section className="rule-index-group" aria-label={label}>
      <div className="rule-group-heading"><h2>{label}</h2><span>{hint}</span></div>
      {chapters.map(chapter => (
        <button key={chapter.id} id={`open-${chapter.id}`} className="rule-index-row" onClick={() => handleOpen(chapter.id)} aria-label={`Open ${chapter.title}`}>
          <img src={getChapterArt(chapter)} alt="" loading="lazy" className="rule-index-art" />
          <span className="rule-index-shade" aria-hidden="true" />
          <span className="rule-number">{chapter.number}</span>
          <span className="rule-index-copy"><strong>{chapter.title}</strong><span>{chapter.subtitle}</span></span>
          {(chapterMatchCounts[chapter.id] ?? 0) > 0 && <span className="rule-hit-count">{chapterMatchCounts[chapter.id]} hits</span>}
          <ChevronRight className="rule-index-arrow" size={22} aria-hidden="true" />
        </button>
      ))}
    </section>
  );

  return (
    <div className={`rules-page rules-cinema ${activeChapter ? 'rules-is-reading' : ''}`}>
      <div className="rulebook-shell">
        <div className="rulebook-masthead"><span><span className="rule-status-dot" /> Field guide to surviving the night</span><span>VOL. 01 / FAN REFERENCE</span></div>
        {!activeChapter && (
          <header className="rulebook-cover">
            <img src={rulebookArt.archive} alt="" fetchPriority="high" />
            <div className="rulebook-cover-shade" aria-hidden="true" />
            <div className="rulebook-cover-copy">
              <span className="rule-eyebrow">The unofficial survival manual</span>
              <h1>Rulebook<span className="rule-title-period">.</span></h1>
              <p>Know the rules. Make it to morning.</p>
            </div>
            <span className="rule-cover-stamp" aria-hidden="true">RECOVERED<br />BINDER COPY</span>
          </header>
        )}
        <div className="rulebook-tools">
          <div className="rulebook-search">
            <Search size={18} aria-hidden="true" />
            <input aria-label="Search rules" inputMode="search" value={query}
              onChange={event => { setQuery(event.target.value); setActiveCategory('ALL'); clearHash(); }}
              placeholder="SEARCH RULES, TERMS, ICONS..." />
            {query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={18} /></button>}
          </div>
          <div className="rulebook-filters" role="group" aria-label="Rule categories">
            {CATEGORY_FILTERS.filter(category => category !== 'LOCATION' || locationChapters.length > 0).map(category => (
              <button key={category} aria-pressed={activeCategory === category} onClick={() => { setActiveCategory(category); handleClose(); }}>
                {category === 'LOCATION' ? 'LOCATIONS' : category}
              </button>
            ))}
          </div>
        </div>

        {activeChapter ? (
          <div className="rule-reader-layout" id="rule-reader">
            <aside className="rule-reader-nav">
              <button className="rule-back" onClick={handleClose}><ArrowLeft size={15} /> Back to Chapters</button>
              <label className="rule-mobile-chapters">Chapter
                <Select value={activeChapter.id} onValueChange={handleOpen}>
                  <SelectTrigger aria-label="Choose chapter" className="rule-chapter-select"><SelectValue /></SelectTrigger>
                  <SelectContent className="rule-chapter-menu" collisionPadding={12}>
                    {visibleChapters.map(ch => <SelectItem key={ch.id} value={ch.id}>{ch.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
              <nav aria-label="Chapter navigation" className="rule-desktop-chapters">
                <span className="rule-eyebrow">{isSearching ? 'Search results' : 'Chapter index'}</span>
                {visibleChapters.map(ch => <button key={ch.id} aria-current={ch.id === activeChapter.id ? 'page' : undefined} onClick={() => handleOpen(ch.id)}>
                  <span>{ch.number}</span><span>{ch.title}</span>{ch.id === activeChapter.id && <ChevronRight size={14} />}
                </button>)}
              </nav>
              <a className="rule-official-link" href="https://gamers-hq.de/media/pdf/22/ba/4a/FinalGirl_Rules.pdf" target="_blank" rel="noopener noreferrer">Official Core Rulebook ↗</a>
            </aside>
            <div className="rule-reader-main">
              <RuleChapter key={`${activeChapter.id}:${query.trim().toLowerCase()}`} chapter={activeChapter} allSections={module.sections} glossary={module.glossary}
                initialSubId={initialSubBySection[activeChapter.id]} onJumpTo={handleJumpTo}
                customBody={activeChapter.id === 'ch-glossary' ? glossaryBody : undefined} />
              <nav className="rule-reader-footer" aria-label="Reading navigation">
                <button className="rule-back" onClick={handleClose}><ArrowLeft size={15} /> Back to Chapters</button>
                {activeIndex >= 0 && activeIndex < visibleChapters.length - 1 && <button className="rule-next" onClick={() => handleOpen(visibleChapters[activeIndex + 1].id)}>
                  <span><small>Next chapter</small>{visibleChapters[activeIndex + 1].title}</span><ArrowRight size={20} />
                </button>}
              </nav>
            </div>
          </div>
        ) : visibleChapters.length > 0 ? (
          <div className="rulebook-index">
            {renderIndexGroup(visibleChapters.filter(ch => !killerIds.has(ch.id) && !locationIds.has(ch.id)), 'Core rules', 'READ. REMEMBER. SURVIVE.')}
            {renderIndexGroup(visibleChapters.filter(ch => killerIds.has(ch.id)), 'Killer files', 'FROM YOUR COLLECTION')}
            {renderIndexGroup(visibleChapters.filter(ch => locationIds.has(ch.id)), 'Location files', 'FROM YOUR COLLECTION')}
          </div>
        ) : <div className="rulebook-empty" role="status"><BookOpen size={32} /><h2>No chapters match{query ? ` “${query}”` : ' this category'}.</h2><p>Try another term or return to the full index.</p><button className="rule-text-link" onClick={() => { setQuery(''); setActiveCategory('ALL'); }}>Show all chapters <ArrowRight size={16} /></button></div>}

        <footer className="rulebook-colophon"><span>{visibleChapters.length} chapters / Unofficial fan reference</span><a href="https://gamers-hq.de/media/pdf/22/ba/4a/FinalGirl_Rules.pdf" target="_blank" rel="noopener noreferrer">Official Core Rulebook ↗</a></footer>
        <p className="rulebook-source">{module.source}. Not endorsed by or affiliated with Van Ryder Games.</p>
      </div>
    </div>
  );
};

export default Rules;
