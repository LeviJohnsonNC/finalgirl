import { GameResult } from '@/hooks/useGameHistory';
import { format } from 'date-fns';
import { getFinalGirlMaxHealth } from '@/data/finalGirlHealth';
import { renderStoryText } from '@/lib/textFormatting';

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
