import { RuleBlock as RuleBlockType, GlossaryTerm as GlossaryTermType } from '@/data/rules/types';
import { GlossaryTerm } from './GlossaryTerm';
import { AlertTriangle, Info, Lightbulb, Pencil } from 'lucide-react';

interface RuleBlockProps {
  block: RuleBlockType;
  glossary: GlossaryTermType[];
  onJumpTo: (sectionId: string) => void;
}

// Replace glossary terms in a string with React nodes (case-insensitive, longest match first).
function renderText(text: string, glossary: GlossaryTermType[], onJumpTo: (id: string) => void): React.ReactNode {
  if (glossary.length === 0) return text;
  const terms = [...glossary].sort((a, b) => b.term.length - a.term.length);
  const pattern = new RegExp(`\\b(${terms.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const used = new Set<string>();

  while ((match = pattern.exec(text)) !== null) {
    const matched = match[0];
    const lowerKey = matched.toLowerCase();
    const term = terms.find((t) => t.term.toLowerCase() === lowerKey);
    if (!term || used.has(term.id)) continue;
    used.add(term.id);
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <GlossaryTerm key={`${term.id}-${match.index}`} term={term} onJumpTo={onJumpTo} />
    );
    lastIndex = match.index + matched.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length > 0 ? parts : text;
}

const calloutStyles: Record<string, { className: string; icon: React.ReactNode; defaultTitle: string }> = {
  note: {
    className: 'callout-note',
    icon: <Info className="w-3.5 h-3.5" />,
    defaultTitle: 'Note',
  },
  critical: {
    className: 'callout-critical',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    defaultTitle: 'Critical',
  },
  designer: {
    className: 'callout-designer',
    icon: <Pencil className="w-3.5 h-3.5" />,
    defaultTitle: "Designer's Note",
  },
  tip: {
    className: 'callout-tip',
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    defaultTitle: 'Tip',
  },
};

export const RuleBlock = ({ block, glossary, onJumpTo }: RuleBlockProps) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="rule-paragraph text-foreground/90 leading-7 type-body-sm">
          {renderText(block.text, glossary, onJumpTo)}
        </p>
      );

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag
          className={`${block.ordered ? 'list-decimal' : 'list-disc'} pl-6 space-y-1.5 text-foreground/90 type-body-sm marker:text-primary/70`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {renderText(item, glossary, onJumpTo)}
            </li>
          ))}
        </Tag>
      );
    }

    case 'heading': {
      const Tag = block.level === 2 ? 'h3' : 'h4';
      return (
        <Tag className="font-title text-base sm:text-lg text-secondary uppercase tracking-wide mt-5 mb-1 flex items-center gap-2 before:content-[''] before:block before:w-1.5 before:h-4 before:bg-secondary/70">
          {block.text}
        </Tag>
      );
    }

    case 'callout': {
      const variant = block.variant ?? 'note';
      const style = calloutStyles[variant];
      return (
        <div className={`rule-callout ${style.className} my-3`}>
          <span className="rule-callout-stamp type-micro uppercase">
            {variant === 'critical' ? 'Warning' : variant === 'tip' ? 'Case Note' : 'Archive Ref'}
          </span>
          <div className="rule-callout-header">
            {style.icon}
            <span className="type-caption uppercase">
              {block.title ?? style.defaultTitle}
            </span>
          </div>
          <p className="type-body-sm leading-relaxed">
            {renderText(block.text, glossary, onJumpTo)}
          </p>
        </div>
      );
    }

    case 'example':
      return (
        <div className="rule-example my-3">
          <span className="rule-callout-stamp type-micro uppercase">
            Case Note
          </span>
          <div className="rule-example-stamp">
            <span className="type-caption uppercase">
              ◉ Example
            </span>
            <span className="type-caption uppercase text-muted-foreground">
              {block.title}
            </span>
          </div>
          <p className="type-body-sm text-foreground/85 italic leading-relaxed mt-1.5">
            {renderText(block.text, glossary, onJumpTo)}
          </p>
        </div>
      );

    case 'table':
      return (
        <div className="rule-table-wrap my-3">
          <table className="rule-table w-full type-label">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} className="type-caption uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="align-top">
                      {renderText(cell, glossary, onJumpTo)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
};
