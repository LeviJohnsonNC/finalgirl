import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScrapbookArtwork } from './ScrapbookArtwork';
import type { GameResult } from '@/hooks/useGameHistory';
const generateImage = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useImageGeneration', () => ({ useImageGeneration: () => ({ generateImage, isAuthenticated: true, isGeneratingImage: false, imageError: null }) }));
const game: GameResult = { id: 'game-1', timestamp: 1, outcome: 'won', killer: 'Hans', location: 'Camp Happy Trails', finalGirl: 'Laurie', introStory: 'An opening.', endingNarration: 'An escape.', finalGirlHealth: 2 };
describe('ScrapbookArtwork recovery', () => {
  it('shows no generation control for a picture that loads', () => {
    render(<ScrapbookArtwork game={{ ...game, sceneImageUrl: 'https://example.test/scene.webp' }} kind="scene" onGenerated={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Generate scene picture' })).toBeNull();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.test/scene.webp');
  });
  it('recovers failed URLs with the saved story and preserves the game identity', async () => {
    generateImage.mockResolvedValue('https://example.test/recovered.webp');
    const save = vi.fn();
    render(<ScrapbookArtwork game={{ ...game, sceneImageUrl: 'https://example.test/missing.webp' }} kind="scene" onGenerated={save} />);
    fireEvent.error(screen.getByRole('img'));
    fireEvent.click(screen.getByRole('button', { name: 'Generate scene picture' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(game.id, { sceneImageUrl: 'https://example.test/recovered.webp' }));
    expect(generateImage).toHaveBeenCalledWith(expect.objectContaining({ gameId: game.id, sceneType: 'beginning', story: game.introStory, previousImageUrl: 'https://example.test/missing.webp' }));
  });
  it('recovers an absent poster using the recorded ending and opening reference', async () => {
    generateImage.mockResolvedValue('https://example.test/poster.webp');
    const save = vi.fn();
    render(<ScrapbookArtwork game={{ ...game, sceneImageUrl: 'https://example.test/scene.webp' }} kind="poster" onGenerated={save} />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate poster picture' }));
    await waitFor(() => expect(save).toHaveBeenCalledWith(game.id, { posterImageUrl: 'https://example.test/poster.webp' }));
    expect(generateImage).toHaveBeenCalledWith(expect.objectContaining({ sceneType: 'ending', story: game.endingNarration, outcome: 'won', finalGirlHealth: 2, referenceImageUrl: 'https://example.test/scene.webp' }));
  });
});
