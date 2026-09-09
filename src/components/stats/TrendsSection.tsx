import { useState } from 'react';
import { ComputedStats } from '@/hooks/useGameStats';
import { GameResult } from '@/hooks/useGameHistory';
import { useActiveImages } from '@/hooks/useActiveImages';
import { NarrativeBadgeModal } from './NarrativeBadgeModal';
import { TrendsChart } from './TrendsChart';

type ChartView = 'victims' | 'games' | 'winloss';

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

  const totalGames = stats.totalWins + stats.totalLosses;
  const winPercentage = totalGames > 0 ? (stats.totalWins / totalGames) * 100 : 0;

  return (
    <div className="trends-section">
      <h3 className="section-title">// RECOVERED FOOTAGE</h3>

      {/* Win/Loss Bar - Glass Tube (Enhanced) */}
      <div className="winloss-bar-container relative">
        <div className="winloss-bar">
          {/* Cyan liquid (wins) */}
          <div className="winloss-wins" style={{ width: `${winPercentage}%` }}>
            {/* 6 bubbles — 3D radial gradient, varied sizes and heights */}
            {[10, 24, 40, 56, 72, 86].map((left, i) => {
              const sizes =   [6,  11,  5,  10,  7,  4];
              const bottoms = [14, 30,  9,  22,  38, 17];
              const sz = sizes[i];
              return (
                <div key={`w${i}`} className="winloss-bubble" style={{
                  left: `${left}%`,
                  bottom: `${bottoms[i]}%`,
                  width: sz,
                  height: sz,
                  background: `radial-gradient(circle at 33% 28%, rgba(255,255,255,0.92) 0%, rgba(160,255,255,0.55) 28%, rgba(0,200,230,0.14) 65%, transparent 100%)`,
                  boxShadow: `0 1px 3px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,150,190,0.25)`,
                  '--bubble-dur': `${6 + i * 3.5}s`,
                  '--bubble-delay': `${i * 1.7}s`,
                } as React.CSSProperties} />
              );
            })}
            <div className="winloss-liquid-caustic" />
            <div className="winloss-liquid-caustic-2" />
          </div>
          {/* Red liquid (losses) */}
          <div className="winloss-losses" style={{ width: `${100 - winPercentage}%` }}>
            {[12, 28, 44, 60, 76, 90].map((left, i) => {
              const sizes =   [8,   5,  12,  6,  9,  4];
              const bottoms = [22, 10,  32, 16,  26, 38];
              const sz = sizes[i];
              return (
                <div key={`l${i}`} className="winloss-bubble" style={{
                  left: `${left}%`,
                  bottom: `${bottoms[i]}%`,
                  width: sz,
                  height: sz,
                  background: `radial-gradient(circle at 33% 28%, rgba(255,255,255,0.78) 0%, rgba(255,175,155,0.50) 28%, rgba(215,45,45,0.12) 65%, transparent 100%)`,
                  boxShadow: `0 1px 3px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(150,15,15,0.25)`,
                  '--bubble-dur': `${8 + i * 3.1}s`,
                  '--bubble-delay': `${i * 2.0 + 1.3}s`,
                } as React.CSSProperties} />
              );
            })}
            <div className="winloss-liquid-caustic" style={{ animationDelay: '-3.5s' }} />
            <div className="winloss-liquid-caustic-2" style={{ animationDelay: '-7s' }} />
          </div>
          {/* Boundary swirl */}
          <div className="winloss-swirl" style={{ left: `${winPercentage}%` }} />
          {/* Glass overlays */}
          <div className="winloss-glass-specular" />
          <div className="winloss-glass-diffuse" />
          <div className="winloss-glass-edges" />
          <div className="winloss-glass-bottom" />
        </div>
        <div className="winloss-labels">
          <span className="text-neon-cyan">Wins {stats.totalWins}</span>
          <span className="text-blood-red">Losses {stats.totalLosses}</span>
        </div>
      </div>

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
