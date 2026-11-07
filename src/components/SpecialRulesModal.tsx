import { useId, useRef, useState, type ReactNode } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const active = modules.find((m) => m.kind === activeKind) ?? modules[0];
  if (!active) return null;

  const { chapter, sections: [setup, rules] } = buildEntityChapter(active, '');
  const showSetup = setup.body.length > 0;
  const activeView = showSetup && view === 'setup' ? 'setup' : 'rules';
  const section = activeView === 'setup' ? setup : rules;
  const topics = section.body.flatMap((block, index) => block.type === 'heading'
    ? [{ id: `${topicPrefix}-topic-${index}`, title: block.text }]
    : []);
  const showTopics = activeView === 'rules' && topics.length >= 3;

  function jumpToTopic(id: string) {
    const reader = readerRef.current;
    const heading = document.getElementById(id);
    if (!reader || !heading) return;
    const top = heading.getBoundingClientRect().top - reader.getBoundingClientRect().top + reader.scrollTop;
    reader.scrollTo({ top: top - 16 });
    heading.focus({ preventScroll: true });
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
                <label className="special-rules-topics">
                  <select aria-label="Jump to topic" value="" onChange={(event) => jumpToTopic(event.target.value)}>
                    <option value="" disabled>Jump to topic</option>
                    {topics.map(({ id, title }) => <option key={id} value={id}>{title}</option>)}
                  </select>
                  <ChevronDown size={15} aria-hidden="true" />
                </label>
              )}
            </div>
          )}
          <Tabs.Content key={section.id} value={activeView} ref={readerRef}
            className="special-rules-scroll"
            {...(!showSetup && { role: 'region', 'aria-labelledby': undefined, 'aria-label': `${active.entity} rules` })}>
            <div className="rule-paper">
              <div className="rule-article-sections">
                <div className="space-y-3">
                  {section.body.map((block, index) => (
                    <RuleBlock key={index} block={block} glossary={[]} onJumpTo={() => {}}
                      headingId={showTopics ? `${topicPrefix}-topic-${index}` : undefined} />
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
