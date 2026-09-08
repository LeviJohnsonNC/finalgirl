import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, BookMarked, ArrowUp, X, Radio, FileText, AlertTriangle } from 'lucide-react';
import { coreRules } from '@/data/rules/coreRules';
import { RuleModule, RuleSection as RuleSectionType, RuleBlock, RuleChapter as RuleChapterType } from '@/data/rules/types';
import { RuleChapter } from '@/components/rules/RuleChapter';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useOwnedFilms } from '@/hooks/useOwnedFilms';
import { FEATURE_FILMS } from '@/types/gameData';
import { ENTITY_RULE_MODULES, buildEntityChapter, EntityRuleModule } from '@/data/rules/moduleRules';

const MODULES: RuleModule[] = [coreRules];

type RuleCategory = 'ALL' | 'CORE' | 'TURN' | 'COMBAT' | 'KILLER' | 'TOKENS' | 'VICTIMS' | 'ITEMS';

const CATEGORY_FILTERS: RuleCategory[] = ['ALL', 'CORE', 'TURN', 'COMBAT', 'KILLER', 'TOKENS', 'VICTIMS', 'ITEMS'];

const RULES_TICKER = [
  'ARCHIVE NOTE: RULEBOOK FOUND WITH THREE PAGES MISSING.',
  'WARNING: FEATURE FILMS REQUIRED — CORE BOX ALONE IS NOT ENOUGH.',
  'SYSTEM: CROSS-REFERENCING KILLER PHASE...',
  'REPORT: PLAYER FORGOT TO RESOLVE PANIC AGAIN.',
  'CASE FILE: SURVIVOR MOVEMENT CONFIRMED UNDER POOR LIGHTING.',
];

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
  const text = [
    chapter.title,
    chapter.subtitle ?? '',
    ...chapter.sectionIds.flatMap((id) => {
      const section = sections.find((s) => s.id === id);
      return section ? [section.title, ...(section.tags ?? [])] : [];
    }),
  ].join(' ').toLowerCase();

  if (/victim|bystander|rescue|panic/.test(text)) return 'VICTIMS';
  if (/item|search|craft|weapon/.test(text)) return 'ITEMS';
  if (/attack|combat|guard|retaliate|damage|health/.test(text)) return 'COMBAT';
  if (/killer|terror|horror|dark power|finale|bloodlust/.test(text)) return 'KILLER';
  if (/token|marker|time|track/.test(text)) return 'TOKENS';
  if (/turn|action|planning|upkeep|phase/.test(text)) return 'TURN';
  return 'CORE';
}

const Rules = () => {
  const moduleId = MODULES[0].id;
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
  const [showTopButton, setShowTopButton] = useState(false);

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
      if (ch.id === 'ch-glossary') {
        if (glossaryHits > 0) counts[ch.id] = glossaryHits;
        continue;
      }
      let total = 0;
      for (const sid of ch.sectionIds) total += sectionMatchCounts[sid] ?? 0;
      if (total > 0) counts[ch.id] = total;
    }
    return counts;
  }, [module, sectionMatchCounts, glossaryHits]);

  // Auto-expand first matching chapter when searching
  useEffect(() => {
    if (!query.trim()) return;
    const firstMatch = module.chapters.find((c) => (chapterMatchCounts[c.id] ?? 0) > 0);
    if (firstMatch) {
      setOpenChapterId(firstMatch.id);
      // Find the first matching section inside, set it as initial sub
      const firstSec = firstMatch.sectionIds.find((sid) => (sectionMatchCounts[sid] ?? 0) > 0);
      if (firstSec) {
        setInitialSubBySection((prev) => ({ ...prev, [firstMatch.id]: firstSec }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleToggle = useCallback(
    (chapterId: string) => {
      setOpenChapterId((prev) => (prev === chapterId ? null : chapterId));
      setTimeout(() => {
        const el = document.getElementById(chapterId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    },
    [setOpenChapterId]
  );

  const handleClose = useCallback(() => {
    setOpenChapterId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setOpenChapterId]);

  // Find the chapter that owns a given sectionId
  const chapterForSection = useCallback(
    (sectionId: string): RuleChapterType | undefined =>
      module.chapters.find((c) => c.sectionIds.includes(sectionId)),
    [module]
  );

  const handleJumpTo = useCallback(
    (sectionId: string) => {
      const ch = chapterForSection(sectionId);
      if (!ch) return;
      setOpenChapterId(ch.id);
      // Set sub-tab to that section if it's a top-level section in chapter
      const sec = module.sections.find((s) => s.id === sectionId);
      const subId = sec?.parentId && ch.sectionIds.includes(sec.parentId) ? sec.parentId : sectionId;
      setInitialSubBySection((prev) => ({ ...prev, [ch.id]: subId }));
      window.history.replaceState(null, '', `#rules/${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId) ?? document.getElementById(ch.id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    },
    [chapterForSection, module, setOpenChapterId]
  );

  // Honor incoming hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    const m = hash.match(/^#rules\/(.+)$/);
    if (m) {
      setTimeout(() => handleJumpTo(m[1]), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show "back to top" after scrolling
  useEffect(() => {
    const onScroll = () => setShowTopButton(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Filter glossary for search
  const filteredGlossary = useMemo(() => {
    if (!query.trim()) return module.glossary;
    const q = query.trim().toLowerCase();
    return module.glossary.filter(
      (t) => t.term.toLowerCase().includes(q) || t.short.toLowerCase().includes(q)
    );
  }, [query, module]);

  const glossaryBody = (
    <div className="space-y-2">
      {filteredGlossary.length === 0 ? (
        <p className="type-caption uppercase text-muted-foreground">
          No terms match "{query}".
        </p>
      ) : (
        filteredGlossary.map((t) => (
          <div key={t.id} className="glossary-entry">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-title text-base uppercase tracking-wide text-secondary">
                {t.term}
              </span>
              {t.sectionId && (
                <button
                  onClick={() => handleJumpTo(t.sectionId!)}
                  className="type-caption uppercase text-primary/80 hover:text-primary"
                >
                  → see rule
                </button>
              )}
            </div>
            <p className="type-body-sm text-foreground/85 leading-relaxed mt-1">{t.short}</p>
          </div>
        ))
      )}
    </div>
  );

  const isSearching = query.trim().length > 0;
  const killerIds = useMemo(() => new Set(killerChapters.map((c) => c.id)), [killerChapters]);
  const locationIds = useMemo(() => new Set(locationChapters.map((c) => c.id)), [locationChapters]);
  const chapterCategories = useMemo(
    () => Object.fromEntries(module.chapters.map((chapter) => [chapter.id, getChapterCategory(chapter, module.sections, killerIds, locationIds)])),
    [module, killerIds, locationIds]
  );
  const visibleChapters = module.chapters.filter((chapter) => {
    const matchesSearch = !isSearching || (chapterMatchCounts[chapter.id] ?? 0) > 0;
    const category = chapterCategories[chapter.id];
    const matchesCategory = activeCategory === 'ALL' || category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  const activeChapter = module.chapters.find((chapter) => chapter.id === openChapterId) ?? visibleChapters[0];
  const activeChapterSections = activeChapter
    ? activeChapter.sectionIds.map((id) => module.sections.find((section) => section.id === id)).filter((section): section is RuleSectionType => !!section)
    : [];
  const relatedSections = activeChapterSections
    .flatMap((section) => section.seeAlso ?? [])
    .map((id) => module.sections.find((section) => section.id === id))
    .filter((section, index, arr): section is RuleSectionType => !!section && arr.findIndex((item) => item?.id === section.id) === index)
    .slice(0, 4);
  const sidebarTip = activeChapterSections.flatMap((section) => section.body).find((block) => block.type === 'callout' || block.type === 'example');
  const tickerContent = [...RULES_TICKER, ...RULES_TICKER];

  return (
    <div className="rules-page relative min-h-screen px-3 sm:px-5 pb-28 pt-3 sm:pt-6">
      {/* Page chrome overlays */}
      <div className="film-grain pointer-events-none" aria-hidden />
      <div className="vignette pointer-events-none" aria-hidden />

      <div className="rules-binder mx-auto">
        {/* Header */}
        <header className="rules-header relative mb-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 type-caption uppercase text-muted-foreground">
                <span className="rec-dot" aria-hidden />
                <span>Final Girl / Unofficial Case Files</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <BookMarked className="w-7 h-7 text-primary" />
                <h1 className="font-title text-4xl sm:text-6xl uppercase tracking-wide text-foreground blood-glow">
                  Rulebook
                </h1>
              </div>
              <p className="mt-3 type-caption uppercase text-muted-foreground">
                Unofficial Fan Reference · Recovered Binder Copy ·{' '}
                <a
                  href="https://gamers-hq.de/media/pdf/22/ba/4a/FinalGirl_Rules.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary/80 hover:text-secondary underline decoration-dotted"
                >
                  Official Core Rulebook ↗
                </a>
              </p>
            </div>
            <div className="rules-dossier-card">
              <span className="vhs-spec-label type-caption uppercase px-2 py-0.5">CORE · VHS-001 · FAN REF</span>
              <span className="type-caption uppercase text-muted-foreground">Recovered Tape / Evidence Box 07</span>
              <span className="type-caption uppercase text-primary/80">Archive Ref: FG-RULES-{String(visibleChapters.length).padStart(2, '0')}</span>
            </div>
          </div>
        </header>

        {/* Search bar + filters */}
        <div className="rules-search-wrap mb-6 sticky top-3 sm:top-5 z-30">
          <div className="rules-search relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70" />
            <input
              type="text"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH RULES, TERMS, ICONS..."
              className="rules-search-input w-full pl-9 pr-9 py-3 type-label uppercase"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="rules-filter-strip mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Rule categories">
            {CATEGORY_FILTERS.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rules-filter-chip font-vhs text-[10px] sm:text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 whitespace-nowrap ${activeCategory === category ? 'rules-filter-chip-active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="rules-layout-grid">
          {/* Chapter list */}
          <main className="space-y-2.5 min-w-0">
        {visibleChapters.length === 0 ? (
          <div className="text-center py-16 type-label uppercase text-muted-foreground">
            No chapters match "{query}".
          </div>
        ) : (
          (() => {
            const killerIds = new Set(killerChapters.map((c) => c.id));
            const locationIds = new Set(locationChapters.map((c) => c.id));
            const visibleKillers = visibleChapters.filter((c) => killerIds.has(c.id));
            const visibleLocations = visibleChapters.filter((c) => locationIds.has(c.id));
            const visibleCore = visibleChapters.filter(
              (c) => !killerIds.has(c.id) && !locationIds.has(c.id)
            );

            const renderChapter = (ch: RuleChapterType) => (
              <RuleChapter
                key={ch.id}
                chapter={ch}
                allSections={module.sections}
                glossary={module.glossary}
                isOpen={openChapterId === ch.id}
                matchCount={chapterMatchCounts[ch.id] ?? 0}
                isDimmed={isSearching && (chapterMatchCounts[ch.id] ?? 0) === 0}
                initialSubId={initialSubBySection[ch.id]}
                onToggle={() => handleToggle(ch.id)}
                onJumpTo={handleJumpTo}
                onClose={handleClose}
                customBody={ch.id === 'ch-glossary' ? glossaryBody : undefined}
              />
            );

            const GroupHeader = ({ label, hint }: { label: string; hint: string }) => (
              <div className="pt-6 pb-1 flex items-baseline gap-3">
                <span className="h-px flex-1 bg-secondary/30" />
                <span className="font-title text-sm uppercase tracking-[0.3em] text-secondary">
                  {label}
                </span>
                <span className="type-caption uppercase text-muted-foreground">
                  {hint}
                </span>
                <span className="h-px flex-1 bg-secondary/30" />
              </div>
            );

            return (
              <>
                {visibleCore.map(renderChapter)}
                {visibleKillers.length > 0 && (
                  <>
                    <GroupHeader label="Killers" hint="Owned · Special Rules" />
                    {visibleKillers.map(renderChapter)}
                  </>
                )}
                {visibleLocations.length > 0 && (
                  <>
                    <GroupHeader label="Locations" hint="Owned · Special Rules" />
                    {visibleLocations.map(renderChapter)}
                  </>
                )}
              </>
            );
          })()
        )}
          </main>

          <aside className="rules-case-notes hidden xl:block">
            <div className="rules-case-note-card sticky top-28">
              <div className="flex items-center gap-2 type-caption uppercase text-primary/80">
                <Radio className="w-3.5 h-3.5" />
                Rulebook Status: Indexed
              </div>
              <div className="mt-5">
                <p className="type-caption uppercase text-muted-foreground">Currently Viewing</p>
                <h2 className="mt-1 font-title text-xl uppercase tracking-wide text-foreground leading-tight">
                  {activeChapter?.title ?? 'No File Selected'}
                </h2>
                <p className="mt-1 type-caption uppercase text-muted-foreground">
                  {activeChapter ? `${chapterCategories[activeChapter.id]} · ${activeChapter.number}` : 'Archive standby'}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-dashed border-border/70">
                <p className="type-caption uppercase text-primary/80 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Related Rules
                </p>
                <div className="mt-3 space-y-2">
                  {relatedSections.length > 0 ? relatedSections.map((section) => (
                    <button key={section.id} onClick={() => handleJumpTo(section.id)} className="rules-related-tab w-full text-left type-caption uppercase">
                      {section.title}
                    </button>
                  )) : (
                    <p className="type-caption uppercase text-muted-foreground">No cross-reference recovered.</p>
                  )}
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-dashed border-border/70">
                <p className="type-caption uppercase text-primary/80 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> Survivor Tip
                </p>
                <p className="mt-2 type-body-sm leading-relaxed text-foreground/80">
                  {sidebarTip && 'text' in sidebarTip ? sidebarTip.text : 'Read the phase timing twice before resolving panic, attacks, or finale effects.'}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 pt-5 border-t border-border/50 text-muted-foreground/70 type-caption uppercase text-center">
          {module.source}
        </div>
      </div>

      <div className="rules-bottom-ticker fixed bottom-11 sm:bottom-14 left-0 right-0 z-40 overflow-hidden">
        <div className="relative h-7 sm:h-8 flex items-center">
          <div className="absolute left-0 z-10 h-full flex items-center px-2 sm:px-3 pr-8 rules-ticker-badge">
            <span className="type-caption text-primary uppercase blood-glow">⚠ RULES ⚠</span>
          </div>
          <div className="news-ticker flex items-center whitespace-nowrap pl-24 sm:pl-28">
            {tickerContent.map((headline, idx) => (
              <span key={idx} className="inline-flex items-center">
                <span className="type-caption text-muted-foreground uppercase">{headline}</span>
                <span className="mx-32 sm:mx-48 text-primary/60">◆</span>
              </span>
            ))}
          </div>
          <div className="absolute right-0 z-10 h-full w-8 sm:w-12 rules-ticker-fade" />
        </div>
      </div>

      {/* Floating back-to-top */}
      {showTopButton && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 z-40 p-3 rounded-full bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 transition-colors backdrop-blur"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Rules;
