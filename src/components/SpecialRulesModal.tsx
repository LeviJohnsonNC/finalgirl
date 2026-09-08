import { useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ENTITY_RULE_MODULES, EntityRuleModule } from '@/data/rules/moduleRules';
import { RuleBlock } from '@/components/rules/RuleBlock';
import { Skull, MapPin } from 'lucide-react';

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

export function getApplicableSpecialRules(killer: string, location: string) {
  return [findModule(killer, 'killer'), findModule(location, 'location')].filter(
    (m): m is EntityRuleModule => Boolean(m)
  );
}

export const SpecialRulesModal = ({ killer, location, children }: SpecialRulesModalProps) => {
  const modules = getApplicableSpecialRules(killer, location);
  const [activeId, setActiveId] = useState<string>(modules[0]?.entity ?? '');

  if (modules.length === 0) return null;

  const active = modules.find((m) => m.entity === activeId) ?? modules[0];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg sm:text-xl tracking-[0.15em] uppercase text-secondary">
            Special Rules
          </DialogTitle>
        </DialogHeader>

        {modules.length > 1 && (
          <div className="flex gap-2 border-b border-border/40 pb-2">
            {modules.map((m) => {
              const isActive = m.entity === active.entity;
              const Icon = m.kind === 'killer' ? Skull : MapPin;
              return (
                <button
                  key={m.entity}
                  onClick={() => setActiveId(m.entity)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-display text-[11px] tracking-[0.15em] uppercase rounded-sm transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'text-muted-foreground hover:text-foreground border border-transparent'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {m.entity}
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <p className="type-caption uppercase text-muted-foreground mb-1">
              {active.kind === 'killer' ? 'Killer' : 'Location'} · {active.entity}
            </p>
            <p className="type-caption text-muted-foreground/70 italic">
              {active.source}
            </p>
          </div>

          {active.setup.length > 0 && (
            <section>
              <h3 className="font-display text-sm tracking-[0.2em] uppercase text-primary border-b border-primary/30 pb-1 mb-3">
                Special Setup
              </h3>
              <div className="space-y-3">
                {active.setup.map((block, i) => (
                  <RuleBlock key={i} block={block} glossary={[]} onJumpTo={() => {}} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="font-display text-sm tracking-[0.2em] uppercase text-primary border-b border-primary/30 pb-1 mb-3">
              Special Rules
            </h3>
            <div className="space-y-3">
              {active.rules.map((block, i) => (
                <RuleBlock key={i} block={block} glossary={[]} onJumpTo={() => {}} />
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
