import { ComputedStats } from '@/hooks/useGameStats';
import gamesBg from '@/assets/stats/games-bg.png';
import winrateBg from '@/assets/stats/winrate-bg.png';
import savedBg from '@/assets/stats/saved-bg.png';
import killedBg from '@/assets/stats/killed-bg.png';

interface RecordJacketProps {
  stats: ComputedStats;
}

interface StatCardProps {
  label: string;
  value: string | number;
  backgroundImage: string;
  backgroundPosition?: string;
}

const StatCard = ({ label, value, backgroundImage, backgroundPosition = 'center' }: StatCardProps) => (
  <div 
    className="hero-stat-card-image"
    style={{ 
      backgroundImage: `url(${backgroundImage})`,
      backgroundPosition 
    }}
  >
    {/* The label was passed in and never rendered — four numbers with nothing
        naming them, leaving the background art to say which was which. */}
    <div className="hero-stat-card-content">
      <div className="hero-stat-label">{label}</div>
      <div className="hero-stat-value">{value}</div>
    </div>
  </div>
);

export const RecordJacket = ({ stats }: RecordJacketProps) => {
  return (
    <div className="record-jacket">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Games"
          value={stats.gamesPlayed}
          backgroundImage={gamesBg}
          backgroundPosition="center 38%"
        />
        <StatCard
          label="Win Rate"
          value={`${Math.round(stats.winRate)}%`}
          backgroundImage={winrateBg}
          backgroundPosition="center 30%"
        />
        <StatCard
          label="Saved"
          value={stats.totalVictimsSaved}
          backgroundImage={savedBg}
          backgroundPosition="center 15%"
        />
        <StatCard
          label="Killed"
          value={stats.totalVictimsKilled}
          backgroundImage={killedBg}
          backgroundPosition="center 15%"
        />
      </div>
    </div>
  );
};
