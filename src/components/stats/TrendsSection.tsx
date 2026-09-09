import { useState } from 'react';
import { ComputedStats } from '@/hooks/useGameStats';
import { GameResult } from '@/hooks/useGameHistory';
import { useActiveImages } from '@/hooks/useActiveImages';
import { NarrativeBadgeModal } from './NarrativeBadgeModal';
import { TrendsChart } from './TrendsChart';
import { RecordPanel } from './RecordPanel';

interface TrendsSectionProps {
  stats: ComputedStats;
  /** Raw sessions — the chart buckets these itself against its own window. */
  games: GameResult[];
}

interface NarrativeBadgeProps {
  label: string;
  value: string | null;
  subtext: string;
  image?: string;
  type?: 'killer' | 'location' | 'finalGirl';
  variant: 'warning' | 'success' | 'danger' | 'info';
}

const NarrativeBadge = ({ label, value, subtext, image, type = 'killer', variant }: NarrativeBadgeProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const variantClasses = {
    warning: 'narrative-badge-warning',
    success: 'narrative-badge-success',
    danger: 'narrative-badge-danger',
    info: 'narrative-badge-info'
  };

  if (!value) {
    return (
      <div className={`narrative-badge narrative-badge-locked`}>
        <div className="narrative-label">{label}</div>
        <div className="narrative-unlock">Play more to unlock</div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`narrative-badge ${variantClasses[variant]} cursor-pointer transition-transform hover:scale-[1.03] active:scale-[0.98]`}
        onClick={() => setModalOpen(true)}
      >
        {image && (
          <>
            <img 
              src={image} 
              alt={value}
              className={`absolute inset-0 w-full h-full object-cover ${type === 'killer' ? 'object-top' : type === 'finalGirl' ? 'object-top' : 'object-center'}`}
            />
            <div className={`absolute inset-0 ${type === 'location' ? 'bg-gradient-to-t from-black/95 via-black/60 to-black/20' : 'bg-gradient-to-t from-black/90 via-black/40 to-black/15'}`} />
          </>
        )}
        <div className="relative z-10 flex flex-col justify-between h-full w-full">
          <div className="narrative-label">{label}</div>
          <div className="mt-auto">
            <div className="narrative-value">{value}</div>
            <div className="narrative-subtext">{subtext}</div>
          </div>
        </div>
      </div>
      <NarrativeBadgeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        label={label}
        value={value}
        subtext={subtext}
        image={image}
        type={type}
      />
    </>
  );
};

export const TrendsSection = ({ stats, games }: TrendsSectionProps) => {
  const { characterImages, locationImages } = useActiveImages();
  const hasEnoughData = stats.gamesPlayed >= 3;

  if (!hasEnoughData) {
    return (
      <div className="trends-section">
        <h3 className="section-title">// RECOVERED FOOTAGE</h3>
        <div className="trends-empty">
          <p className="type-body-sm text-dim text-center py-8">
            Play 3+ games to unlock your personal story
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="trends-section">
      <h3 className="section-title">// RECOVERED FOOTAGE</h3>

      <RecordPanel record={stats.record} />

      {/* Chart Section — windowed, bucketed, and honest about empty periods */}
      {games.length > 0 && <TrendsChart games={games} />}

      {/* Narrative Badges */}
      <div className="narrative-grid">
        <NarrativeBadge
          label="Nemesis"
          value={stats.nemesis?.killer || null}
          subtext={stats.nemesis ? `${stats.nemesis.losses} defeats` : ''}
          image={stats.nemesis ? characterImages[stats.nemesis.killer] : undefined}
          type="killer"
          variant="danger"
        />
        <NarrativeBadge
          label="The Usual Suspect"
          value={stats.usualSuspect?.killer || null}
          subtext={stats.usualSuspect ? `${stats.usualSuspect.wins} wins` : ''}
          image={stats.usualSuspect ? characterImages[stats.usualSuspect.killer] : undefined}
          type="killer"
          variant="success"
        />
        <NarrativeBadge
          label="Cursed Site"
          value={stats.cursedSite?.location || null}
          subtext={stats.cursedSite ? `${stats.cursedSite.losses} losses` : ''}
          image={stats.cursedSite ? locationImages[stats.cursedSite.location] : undefined}
          type="location"
          variant="warning"
        />
        <NarrativeBadge
          label="Home Turf"
          value={stats.homeTurf?.location || null}
          subtext={stats.homeTurf ? `${stats.homeTurf.wins} wins` : ''}
          image={stats.homeTurf ? locationImages[stats.homeTurf.location] : undefined}
          type="location"
          variant="info"
        />
      </div>

      {/* Final Girl Narrative Badges */}
      <div className="narrative-grid">
        <NarrativeBadge
          label="Comfort Zone"
          value={stats.comfortZone?.finalGirl || null}
          subtext={stats.comfortZone ? `${stats.comfortZone.wins} wins` : ''}
          image={stats.comfortZone ? characterImages[stats.comfortZone.finalGirl] : undefined}
          type="finalGirl"
          variant="success"
        />
        <NarrativeBadge
          label="Cursed Pick"
          value={stats.cursedPick?.finalGirl || null}
          subtext={stats.cursedPick ? `${stats.cursedPick.losses} losses` : ''}
          image={stats.cursedPick ? characterImages[stats.cursedPick.finalGirl] : undefined}
          type="finalGirl"
          variant="danger"
        />
        <NarrativeBadge
          label="Grinder"
          value={stats.grinder?.finalGirl || null}
          subtext={stats.grinder ? `${stats.grinder.plays} games` : ''}
          image={stats.grinder ? characterImages[stats.grinder.finalGirl] : undefined}
          type="finalGirl"
          variant="info"
        />
        <NarrativeBadge
          label="Lost Cause"
          value={stats.lostCause?.finalGirl || null}
          subtext={stats.lostCause ? `${Math.round(stats.lostCause.winRate)}% win rate` : ''}
          image={stats.lostCause ? characterImages[stats.lostCause.finalGirl] : undefined}
          type="finalGirl"
          variant="warning"
        />
      </div>
    </div>
  );
};
