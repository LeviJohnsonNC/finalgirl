import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecordPanel } from './RecordPanel';
import { buildGameRecord } from '@/lib/gameRecord';
import { GameResult } from '@/hooks/useGameHistory';

let seq = 0;
const game = (outcome: 'won' | 'lost'): GameResult => ({
  id: `g${seq++}`,
  timestamp: new Date(2026, 0, 1).getTime() + seq * 86400000,
  outcome,
  killer: 'The Organism',
  location: 'Creech Manor',
  finalGirl: 'Alice',
});

const panelFor = (outcomes: ('won' | 'lost')[]) =>
  render(<RecordPanel record={buildGameRecord(outcomes.map(game))} />);

describe('RecordPanel', () => {
  it('exposes the split as a meter, not just as coloured width', () => {
    panelFor(['won', 'won', 'won', 'lost']);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '75');
    // Read aloud, so it says "1 loss" rather than "1 losses".
    expect(meter).toHaveAttribute('aria-valuetext', '75 percent win rate, 3 wins and 1 loss');
  });

  it('prints the rate on the fill when there is room for it', () => {
    const { container } = panelFor(['won', 'won', 'won', 'lost']);

    const readout = container.querySelector('.winloss-readout')!;
    expect(readout).toHaveTextContent('75%');
    expect(readout).toHaveClass('winloss-readout-inside');
  });

  it('moves the rate off the fill when the fill is too narrow to hold it', () => {
    // One win in ten: the cyan is a sliver, and a label printed inside it would
    // be clipped by the fill it is meant to describe.
    const { container } = panelFor(['won', ...Array(9).fill('lost')] as ('won' | 'lost')[]);

    const readout = container.querySelector('.winloss-readout')!;
    expect(readout).toHaveTextContent('10%');
    expect(readout).toHaveClass('winloss-readout-outside');
  });

  it('shows the run the player is on', () => {
    panelFor(['lost', 'won', 'won']);

    expect(screen.getByText('Current run')).toBeInTheDocument();
    expect(screen.getByText('2 wins')).toBeInTheDocument();
    expect(screen.getByText(/Best 2 wins/)).toBeInTheDocument();
    expect(screen.getByText(/Worst 1 loss/)).toBeInTheDocument();
  });

  it('holds the form strip back until there are enough sessions to read a trend', () => {
    const { container: few } = panelFor(['won', 'lost', 'won']);
    expect(few.querySelectorAll('.record-form-tick')).toHaveLength(0);

    const { container: enough } = panelFor(['won', 'lost', 'won', 'lost', 'won']);
    expect(enough.querySelectorAll('.record-form-tick')).toHaveLength(5);
  });

  it('renders nothing at all before the first game', () => {
    const { container } = render(<RecordPanel record={buildGameRecord([])} />);
    expect(container).toBeEmptyDOMElement();
  });
});
