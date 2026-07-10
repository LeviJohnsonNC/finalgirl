import React from 'react';

/**
 * Renders markdown-style **bold** and *italic* inline formatting as React elements.
 * XSS-safe — never uses dangerouslySetInnerHTML.
 */
export const renderFormattedText = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/\*([^*]+?)\*/);

    const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    const italicIndex = italicMatch ? remaining.indexOf(italicMatch[0]) : Infinity;

    if (boldIndex === Infinity && italicIndex === Infinity) {
      parts.push(remaining);
      break;
    }

    if (boldIndex <= italicIndex && boldMatch) {
      if (boldIndex > 0) parts.push(remaining.slice(0, boldIndex));
      parts.push(React.createElement('strong', { key: key++, className: 'font-bold text-foreground' }, boldMatch[1]));
      remaining = remaining.slice(boldIndex + boldMatch[0].length);
    } else if (italicMatch) {
      if (italicIndex > 0) parts.push(remaining.slice(0, italicIndex));
      parts.push(React.createElement('em', { key: key++, className: 'italic text-foreground/90' }, italicMatch[1]));
      remaining = remaining.slice(italicIndex + italicMatch[0].length);
    }
  }

  return parts;
};

// Render markdown-style **bold** and *italic* inline formatting as React elements.
// Used inside .story-text wrappers where CSS overrides the default colors.
export const renderFormattedInline = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/\*([^*]+?)\*/);

    const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    const italicIndex = italicMatch ? remaining.indexOf(italicMatch[0]) : Infinity;

    if (boldIndex === Infinity && italicIndex === Infinity) {
      parts.push(remaining);
      break;
    }

    if (boldIndex <= italicIndex && boldMatch) {
      if (boldIndex > 0) parts.push(remaining.slice(0, boldIndex));
      parts.push(<strong key={key++} className="font-bold text-foreground">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldIndex + boldMatch[0].length);
    } else if (italicMatch) {
      if (italicIndex > 0) parts.push(remaining.slice(0, italicIndex));
      parts.push(<em key={key++} className="italic text-foreground/90">{italicMatch[1]}</em>);
      remaining = remaining.slice(italicIndex + italicMatch[0].length);
    }
  }

  return parts;
};

// Split text into paragraphs. Groups sentences into 2–3 sentence chunks when the
// source lacks blank-line paragraph breaks, and promotes short dramatic single
// sentences (ending in ! or …) into their own centered "beat" paragraph.
export const renderStoryText = (text: string): React.ReactNode[] => {
  const rawParagraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

  let paragraphs: string[];
  if (rawParagraphs.length > 1) {
    paragraphs = rawParagraphs;
  } else {
    // Sentence-boundary split that respects quoted dialogue.
    const sentences = text.match(/[^.!?…]+(?:\.{3}|…|[.!?])+["'"']?\s*/g)?.map(s => s.trim()).filter(Boolean) ?? [text];
    paragraphs = [];
    let buf: string[] = [];
    for (const s of sentences) {
      buf.push(s);
      // Break every 2-3 sentences (target ~220 chars).
      if (buf.length >= 2 && buf.join(' ').length > 220) {
        paragraphs.push(buf.join(' '));
        buf = [];
      }
    }
    if (buf.length) paragraphs.push(buf.join(' '));
  }

  const isDramaticBeat = (p: string): boolean => {
    if (p.length > 90) return false;
    const sentenceCount = (p.match(/[.!?…]+/g) ?? []).length;
    if (sentenceCount > 1) return false;
    return /[!…]$|\.\.\.$/.test(p.trim());
  };

  return paragraphs.map((chunk, i) => {
    const beat = isDramaticBeat(chunk);
    return (
      <p key={i} className={beat ? 'story-beat' : undefined}>
        {renderFormattedInline(chunk.trim())}
      </p>
    );
  });
};
