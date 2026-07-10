import React from 'react';
import { GameResult } from '@/hooks/useGameHistory';
import { format } from 'date-fns';
import { getFinalGirlMaxHealth } from '@/data/finalGirlHealth';

// Render markdown-style bold/italic as React elements (XSS-safe)
const renderFormattedInline = (text: string): React.ReactNode[] => {
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
const renderStoryText = (text: string): React.ReactNode[] => {
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

interface ScrapbookStoryPageProps {
  game: GameResult;
  type: 'finalGirl' | 'killer';
  onDelete?: () => void;
}

export const ScrapbookStoryPage = ({ game, type, onDelete }: ScrapbookStoryPageProps) => {
  const maxFinalGirlHealth = getFinalGirlMaxHealth(game.finalGirl);
  const isWin = game.outcome === 'won';

  return (
    <div className="story-page-content">
      {/* Date Header */}
      <div className="mb-1">
        <div className="story-date">
          {format(new Date(game.timestamp), 'MMMM d, yyyy')}
        </div>
      </div>

      {/* Intro Story Section */}
      <div className="story-section">
        <h4 className="story-heading">
          <span className="heading-line" />
          THE BEGINNING
          <span className="heading-line" />
        </h4>
        {game.introStory ? (
          <div className="story-text story-intro">

            {renderStoryText(game.introStory)}
          </div>
        ) : (
          <p className="story-text story-missing">
            This chapter's beginning was lost to time...
          </p>
        )}
      </div>

      {/* Ending Narration Section */}
      <div className="story-section">
        <h4 className="story-heading">
          <span className="heading-line" />
          {type === 'finalGirl' ? 'THE ESCAPE' : 'THE END'}
          <span className="heading-line" />
        </h4>
        {game.endingNarration ? (
          <div className="story-text story-ending">
            {renderStoryText(game.endingNarration)}
          </div>
        ) : (
          <p className="story-text story-missing">
            {type === 'finalGirl' 
              ? "How she survived remains unwritten..."
              : "The final moments fade to black..."
            }
          </p>
        )}
      </div>

      {/* Game Details Footer */}
      <div className="story-footer">
        <div className="footer-detail">
          <span className="detail-label">Final Girl:</span>
          <span className="detail-value">{game.finalGirl}</span>
        </div>
        <div className="footer-detail">
          <span className="detail-label">Killer:</span>
          <span className="detail-value">{game.killer}</span>
        </div>
        {game.location && (
          <div className="footer-detail">
            <span className="detail-label">Location:</span>
            <span className="detail-value">{game.location}</span>
          </div>
        )}
        {game.setupScenario && (
          <div className="footer-detail">
            <span className="detail-label">Setup:</span>
            <span className="detail-value">{game.setupScenario}</span>
          </div>
        )}
        {game.startingEvent && (
          <div className="footer-detail">
            <span className="detail-label">Event:</span>
            <span className="detail-value">{game.startingEvent}</span>
          </div>
        )}
      </div>

      {/* Game Stats — shown when any stat was recorded */}
      {(game.finalHorrorLevel !== undefined ||
        game.finalGirlHealth !== undefined ||
        game.killerHealth !== undefined ||
        game.weaponUsed ||
        game.victimsSaved !== undefined ||
        game.victimsKilled !== undefined ||
        game.endingSubLocation) && (
        <div className="story-footer" style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
          {game.finalHorrorLevel !== undefined && (
            <div className="footer-detail">
              <span className="detail-label">Horror:</span>
              <span className="detail-value">{game.finalHorrorLevel}/7</span>
            </div>
          )}
          {game.finalGirlHealth !== undefined && (
            <div className="footer-detail">
              <span className="detail-label">HP:</span>
              <span className="detail-value">{game.finalGirlHealth}/{maxFinalGirlHealth}</span>
            </div>
          )}
          {game.killerHealth !== undefined && game.killerHealth > 0 && (
            <div className="footer-detail">
              <span className="detail-label">Killer HP:</span>
              <span className="detail-value">{game.killerHealth}</span>
            </div>
          )}
          {game.weaponUsed && (
            <div className="footer-detail">
              <span className="detail-label">Weapon:</span>
              <span className="detail-value">{game.weaponUsed}</span>
            </div>
          )}
          {(game.victimsSaved !== undefined || game.victimsKilled !== undefined) && (
            <div className="footer-detail">
              <span className="detail-label">Victims:</span>
              <span className="detail-value">
                {game.victimsSaved ?? 0} saved / {game.victimsKilled ?? 0} lost
              </span>
            </div>
          )}
          {game.endingSubLocation && (
            <div className="footer-detail">
              <span className="detail-label">Final scene:</span>
              <span className="detail-value">{game.endingSubLocation}</span>
            </div>
          )}
        </div>
      )}

      {/* Delete button — tucked at the very bottom */}
      {onDelete && (
        <div className="mt-4 flex justify-start">
          <button onClick={onDelete} className="delete-entry-btn">
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
