import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SessionDetail } from './SessionDetail';
import { ComputedStats } from '@/hooks/useGameStats';
import { buildHorrorDistribution } from '@/lib/sessionStats';

const stats = (over: Partial<ComputedStats> = {}): ComputedStats =>
  ({
    gamesPlayed: 4,
    horrorBins: buildHorrorDistribution([]).bins,
    horrorRecorded: 0,
    weapons: [],
    recentSessions: [],
    ...over,
  }) as ComputedStats;

describe('SessionDetail', () => {
  it('renders nothing when none of the three fields was ever recorded', () => {
    const { container } = render(<SessionDetail stats={stats()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a column for every horror level, including the ones never reached', () => {
    const { bins, recorded } = buildHorrorDistribution([
      { id: 'a', timestamp: 1, outcome: 'won', killer: 'k', location: 'l', finalGirl: 'f', finalHorrorLevel: 3 },
      { id: 'b', timestamp: 2, outcome: 'lost', killer: 'k', location: 'l', finalGirl: 'f', finalHorrorLevel: 3 },
    ]);
    const { container } = render(<SessionDetail stats={stats({ horrorBins: bins, horrorRecorded: recorded })} />);

    expect(container.querySelectorAll('.horror-col')).toHaveLength(7);
    expect(screen.getByText('2 of 4 sessions recorded')).toBeInTheDocument();
    expect(screen.getByText('2 games ended at horror level 3')).toBeInTheDocument();
  });

  it('lists weapons with their uses spoken in full', () => {
    render(<SessionDetail stats={stats({ weapons: [{ name: 'Machete', uses: 3, wins: 2 }] })} />);

    expect(screen.getByText('Machete')).toBeInTheDocument();
    expect(screen.getByText('2 won')).toBeInTheDocument();
    expect(screen.getByText(/3 uses/)).toBeInTheDocument();
  });

  it('shows recent sessions with their cast and outcome', () => {
    render(
      <SessionDetail
        stats={stats({
          recentSessions: [
            {
              id: 's1',
              timestamp: new Date(2026, 2, 30).getTime(),
              outcome: 'won',
              finalGirl: 'Alice',
              killer: 'The Organism',
              location: 'Creech Manor',
              horror: 5,
            },
          ],
        })}
      />,
    );

    expect(screen.getByText('Won')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('The Organism')).toBeInTheDocument();
    expect(screen.getByText('H5')).toBeInTheDocument();
  });
});
