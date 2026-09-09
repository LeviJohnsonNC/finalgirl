import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ScrapbookBook } from './ScrapbookBook';
import { GameResult } from '@/hooks/useGameHistory';

vi.mock('@/integrations/supabase/client', () => ({ supabase: { storage: { from: () => ({}) } } }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));

const game = (id: string, over: Partial<GameResult> = {}): GameResult => ({
  id,
  timestamp: Date.now(),
  outcome: 'lost',
  killer: 'The Organism',
  location: 'Creech Manor',
  finalGirl: 'Alice',
  endingNarration: `The ending of ${id}.`,
  ...over,
});

const props = {
  type: 'killer' as const,
  onClose: () => {},
  onUpdateGame: () => {},
  onDeleteGame: () => {},
};

describe('ScrapbookBook', () => {
  it('opens on the grid when no session was handed to it', async () => {
    render(
      <ScrapbookBook
        {...props}
        games={[game('a'), game('b')]}
        onFetchGameDetails={async () => null}
      />,
    );

    await waitFor(() => expect(screen.queryByText('The ending of a.')).toBeNull());
  });

  it('opens straight onto the session the stats page handed over', async () => {
    render(
      <ScrapbookBook
        {...props}
        games={[game('a'), game('b')]}
        initialGameId="b"
        onFetchGameDetails={async () => null}
      />,
    );

    expect(await screen.findByText('The ending of b.')).toBeInTheDocument();
  });

  it('fetches the full record when the handed-over session is only a summary', async () => {
    const full = game('b', { endingNarration: 'The full ending, fetched.' });
    const onFetchGameDetails = vi.fn().mockResolvedValue(full);

    render(
      <ScrapbookBook
        {...props}
        // No narration on the summary row — the details live behind a fetch.
        games={[game('a'), game('b', { endingNarration: undefined })]}
        initialGameId="b"
        onFetchGameDetails={onFetchGameDetails}
      />,
    );

    await waitFor(() => expect(onFetchGameDetails).toHaveBeenCalledWith('b'));
    expect(await screen.findByText('The full ending, fetched.')).toBeInTheDocument();
  });

  it('ignores a session id that is not in this book', async () => {
    render(
      <ScrapbookBook
        {...props}
        games={[game('a')]}
        initialGameId="not-here"
        onFetchGameDetails={async () => null}
      />,
    );

    await waitFor(() => expect(screen.queryByText('The ending of a.')).toBeNull());
  });
});
