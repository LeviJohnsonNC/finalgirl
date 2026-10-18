import { ComputedStats } from '@/hooks/useGameStats';
import gamesBg from '@/assets/stats/archive-games.webp';
import winrateBg from '@/assets/stats/archive-winrate.webp';
import savedBg from '@/assets/stats/archive-saved.webp';
import killedBg from '@/assets/stats/archive-killed.webp';

export const RecordJacket = ({ stats }: { stats: ComputedStats }) => (
  <section className="record-jacket" aria-label="All-time session totals">
    <dl className="stats-summary-grid">
      {[
        { label: 'Games', value: stats.gamesPlayed, image: gamesBg },
        { label: 'Win rate', value: `${Math.round(stats.winRate)}%`, image: winrateBg },
        { label: 'Saved', value: stats.playStats.savedRecorded ? stats.totalVictimsSaved : '—', image: savedBg },
        { label: 'Killed', value: stats.playStats.killedRecorded ? stats.totalVictimsKilled : '—', image: killedBg },
      ].map(card => (
        <div key={card.label} className="stats-summary-card" style={{ backgroundImage: `url(${card.image})` }}>
          <dt>{card.label}</dt>
          <dd>{card.value}</dd>
        </div>
      ))}
    </dl>
  </section>
);
