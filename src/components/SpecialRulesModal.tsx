import { useId, useRef, useState, type ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RuleBlock } from '@/components/rules/RuleBlock';
import { getChapterArt } from '@/components/rules/chapterArt';
import { buildEntityChapter, ENTITY_RULE_MODULES, type EntityRuleModule } from '@/data/rules/moduleRules';
import '@/styles/rules.css';
import '@/styles/special-rules.css';

interface SpecialRulesModalProps {
  killer: string;
  location: string;
  children: ReactNode;
}

function findModule(name: string, kind: 'killer' | 'location'): EntityRuleModule | undefined {
  return ENTITY_RULE_MODULES.find(
    (m) => m.kind === kind && m.entity.toLowerCase() === name.toLowerCase()
  );
}

function getApplicableSpecialRules(killer: string, location: string) {
  return [findModule(killer, 'killer'), findModule(location, 'location')].filter(
    (m): m is EntityRuleModule => Boolean(m)
  );
}

export const SpecialRulesModal = ({ killer, location, children }: SpecialRulesModalProps) => {
  const modules = getApplicableSpecialRules(killer, location);
  const [activeKind, setActiveKind] = useState(modules[0]?.kind);
  const [view, setView] = useState('setup');
  const topicPrefix = useId();
  const readerRef = useRef<HTMLDivElement>(null);
  const jumpMenuOpen = useRef(false);
  const pendingTopic = useRef<string | null>(null);
  const active = modules.find((m) => m.kind === activeKind) ?? modules[0];
  if (!active) return null;

  const { chapter, sections: [setup, rules] } = buildEntityChapter(active, '');
  const showSetup = setup.body.length > 0;
  const activeView = showSetup && view === 'setup' ? 'setup' : 'rules';
  const section = activeView === 'setup' ? setup : rules;
  const topicId = (index: number) => `${topicPrefix}-topic-${index}`;
  const topics = section.body.flatMap((block, index) => block.type === 'heading'
    ? [{ id: topicId(index), title: block.text }]
    : []);
  const placementTopics = section.body.flatMap((block, index) =>
    block.type === 'table' && block.modalLayout === 'placements'
      ? block.rows.map(([title], row) => ({ id: `${topicId(index)}-row-${row}`, title }))
      : []);
  const showTopics = topics.length >= 2 || placementTopics.length > 0;
  const jumpLabel = activeView === 'setup' ? 'Jump to setup' : 'Jump to topic';

  function jumpToTopic(id: string) {
    const reader = readerRef.current;
    const target = id === 'start' ? reader : document.getElementById(id);
    if (!reader || !target) return;
    const top = id === 'start'
      ? 0
      : target.getBoundingClientRect().top - reader.getBoundingClientRect().top + reader.scrollTop - 12;
    reader.scrollTo({ top });
    target.focus({ preventScroll: true });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="special-rules-dialog rule-reader-theme" aria-describedby={undefined}>
        <header className="special-rules-header" data-kind={active.kind}>
          <img src={getChapterArt(chapter)} alt="" />
          <div className="special-rules-heading">
            <div className="special-rules-eyebrow">
              <DialogTitle>Special Rules</DialogTitle>
              <span aria-hidden="true"> / {active.kind}</span>
            </div>
            <p>{active.entity}</p>
          </div>
        </header>
        <Tabs.Root className="special-rules-reader" value={activeView} onValueChange={setView}>
          {modules.length > 1 && (
            <div className="special-rules-entities" role="group" aria-label="Killer and location">
              {modules.map((module) => (
                <button key={module.kind} type="button" aria-pressed={module === active} onClick={() => setActiveKind(module.kind)}>
                  {module.entity}
                </button>
              ))}
            </div>
          )}
          {(showSetup || showTopics) && (
            <div className="special-rules-tools">
              {showSetup && (
                <Tabs.List className="special-rules-tabs" aria-label="Rule sections">
                  <Tabs.Trigger className="binder-tab" value="setup">Setup</Tabs.Trigger>
                  <Tabs.Trigger className="binder-tab" value="rules">Rules</Tabs.Trigger>
                </Tabs.List>
              )}
              {showTopics && (
                <Select value="" onOpenChange={open => { jumpMenuOpen.current = open; }} onValueChange={id => {
                  if (jumpMenuOpen.current) pendingTopic.current = id;
                  else jumpToTopic(id);
                }}>
                  <SelectTrigger className="special-rules-topics" aria-label={jumpLabel}>
                    <SelectValue placeholder={jumpLabel} />
                  </SelectTrigger>
                  <SelectContent sortOptions={false} onCloseAutoFocus={event => {
                    const id = pendingTopic.current;
                    if (!id) return;
                    pendingTopic.current = null;
                    // Move focus after the menu releases its focus trap.
                    event.preventDefault();
                    jumpToTopic(id);
                  }}>
                    <SelectItem value="start">{activeView === 'setup' ? 'Start of setup' : 'Start of rules'}</SelectItem>
                    {topics.map(({ id, title }) => <SelectItem key={id} value={id}>{title}</SelectItem>)}
                    {placementTopics.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>Setup cards</SelectLabel>
                        {placementTopics.map(({ id, title }) => <SelectItem key={id} value={id}>{title}</SelectItem>)}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
          <Tabs.Content key={section.id} value={activeView} ref={readerRef}
            className="special-rules-scroll"
            {...(!showSetup && { role: 'region', 'aria-labelledby': undefined, 'aria-label': `${active.entity} rules` })}>
            <div className="rule-paper">
              <div className="rule-article-sections">
                <div className="special-rules-blocks">
                  {section.body.map((block, index) => (
                    <RuleBlock key={index} block={block} inModal glossary={[]} onJumpTo={() => {}}
                      jumpId={showTopics ? topicId(index) : undefined} />
                  ))}
                </div>
                <footer className="special-rules-source">{active.source}</footer>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </DialogContent>
    </Dialog>
  );
};
